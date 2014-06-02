class Hope
  
  include Mongoid::Document
  include ElevenHelper::Mongoid::Timestamps

  field :user_id, type: String
  field :title, type: String
  field :body, type: String
  field :contact, type: String
  field :image_ids, type: Array, default: []
  field :follows, type: Integer, default: 0
  field :finish, type: Boolean, default: false

  index({user_id: 1, created_at: -1})
  index({follows: -1, finish: 1})
  
  attr_accessible :title, :body, :contact, :image_ids
  
  before_validation :strip_fields
  after_destroy :destroy_images, :destroy_updates, :destroy_follows 
  
  validate :check_image_ids
  validate :check_user_hope_count, :on => :create
  validates_presence_of :user_id,
                        :message => I18n.t('errors.messages.can_not_be_empty')
  validates_length_of :title,
                      :maximum => 30,
                      :minimum => 2
  validates_length_of :body,
                      :maximum => 2000,
                      :minimum => 200
  validates_length_of :contact,
                      :maximum => 300
   
  private
  
    def strip_fields
      self.title.strip! if self.title
      self.body.rstrip! if self.body
      self.contact.strip! if self.contact
    end
    
    def check_image_ids
      return unless (!self.image_ids.blank? && self.image_ids.size > 0)
      
      self.image_ids.compact!
      self.image_ids.uniq!
      
      if self.image_ids.size > Constant::MAX_HOPE_IMAGES
        errors[:image_ids] = I18n.t('errors.messages.too_many_pictures', :count => Constant::MAX_HOPE_IMAGES)
        return
      end
      
      image_ids_temp = []
      self.image_ids.each_with_index do |image_id, index|
        hope_image = HopeImage.find(image_id)
        # image should be add by hope's owner
        if hope_image && hope_image.user_id == self.user_id
          if hope_image.be_used || hope_image.update_attribute(:be_used, true)
            image_ids_temp << image_id
          else
            logger.error "#update <HopeImage># id:#{image_id}:used:true failure"
          end
        end
      end
      
      self.image_ids = image_ids_temp
    end
    
    def destroy_images
      if image_ids.size > 0
        image_ids.each do |image_id|
          unless (image = HopeImage.find(image_id)) &&(image.destroy)
            logger.error "#destroy <HopeImage># id:#{image_id} failure"
          end
        end
      end
    end

    def destroy_updates
      hope_updates_count = HopeUpdate.count(conditions: {hope_id: self.id.to_s})

      if (HopeUpdate.destroy_all(conditions: {hope_id: self.id.to_s}) < hope_updates_count)
        logger.error "#destroy_all <HopeUpdate># hope_id:#{self.id.to_s} failure"
      end
    end
    
    def destroy_follows
      hope_follows_count = HopeFollow.count(conditions: {hope_id: self.id.to_s})
      
      if (HopeFollow.destroy_all(conditions: {hope_id: self.id.to_s}) < hope_follows_count)
        logger.error "#destroy_all <HopeFollow># hope_id:#{self.id.to_s} failure"
      end
    end
    
    def check_user_hope_count
      hopes_count = Hope.where(:user_id => self.user_id).count
      if hopes_count >= Constant::MAX_HOPES_PER_USER
        errors[:too_many_hopes] = I18n.t('errors.messages.you_can_only_create_count_hopes', :count => Constant::MAX_HOPES_PER_USER)
      end
    end
end
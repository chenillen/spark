class HopeUpdate
  include Mongoid::Document
  # TODO: test the index is working or not
  include ElevenHelper::Mongoid::Timestamps::CreatedAt
  
  field :user_id, type: String
  field :hope_id
  field :body, type: String
  field :image_id
  # field :created_at, type: Float
  field :top, type: Boolean, default: true
  
  index [[:hope_id, 1], [:top, 1], [:created_at, -1]]
  
  attr_accessible :hope_id, :body, :image_id
  
  after_destroy :destroy_image, :change_top_status_after_destroy
  # before_create :add_create_time
  after_create :change_top_status_after_save
  
  before_validation :strip_body
  validates_presence_of :user_id, 
                        :hope_id, 
                        :body,
                        :message => I18n.t('errors.messages.can_not_be_empty')
  validates_length_of :body,
                      :maximum => 300
  validate :check_image_id
  
  private
    
    def strip_body
      self.body.strip! if self.body
    end
    
    def check_image_id
      unless self.image_id.blank?
        image = HopeUpdateImage.find(self.image_id)
        if image && image.user_id == self.user_id
          if !image.be_used && !image.update_attribute(:be_used, true)
            self.image_id = nil
            logger.error "#update <HopeUpdateImage># id:#{image.id}:used:true failure"            
          end
        else
           self.image_id = nil 
        end
      else
        self.image_id = nil
      end
    end
    
    # def add_create_time
    #   self.created_at = Time.now.to_f
    # end
    
    def destroy_image
      unless self.image_id.blank?
        unless (image = HopeUpdateImage.find(self.image_id)) && image.destroy
          logger.error "#destroy <HopeUpdateImage># id:#{self.image_id} failure"
        end
      end
    end
    
    # def update_hope_updates_count
    #   updates_count = HopeUpdate.where(:hope_id => self.hope_id).count
    #   hope = Hope.find(self.hope_id)
    #   hope.update_attribute(:updates, updates_count) if (updates_count > -1) && hope
    # end
    
    def change_top_status_after_save
      # update non top hope_updates to false
      if HopeUpdate.where(:hope_id => self.hope_id, :top => true).count > Constant::TOP_HOPE_UPDATE_NUMBER
        hope_updates = HopeUpdate.where(:hope_id => self.hope_id, :top => true).skip(Constant::TOP_HOPE_UPDATE_NUMBER).order_by([:created_at, -1]).to_a
        hope_updates.each do |hope_update|
          hope_update.update_attribute(:top, false)
        end
      end
    end
    
    # TODO: complete me when self.top == false
    def change_top_status_after_destroy
      if self.top
        top_update_count = HopeUpdate.where(:hope_id => self.hope_id, :top => true).count
        if top_update_count < Constant::TOP_HOPE_UPDATE_NUMBER
          hope_updates = HopeUpdate.where(:hope_id => self.hope_id, :top => false).limit(Constant::TOP_HOPE_UPDATE_NUMBER - top_update_count).order_by([:created_at, -1]).to_a
          hope_updates.each do |hope_update|
            hope_update.update_attribute(:top, true)
          end
        end
      end
    end
end
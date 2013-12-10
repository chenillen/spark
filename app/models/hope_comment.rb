class HopeComment
  include Mongoid::Document
  include Mongoid::Paperclip
  include ElevenHelper::Mongoid::Timestamps::CreatedAt
  
  field :user_id, type: String
  field :body, type: String
  field :hope_id
  field :image_id
  field :likes, type: Integer, default: 0
  
  attr_accessible :body, :hope_id, :image_id
  
  index [[:user_id, 1], [:created_at, 1]]
  index [[:hope_id, 1], [:likes, -1]]
  
  before_validation :strip_fields
  # before_create :add_create_time
  after_destroy :destroy_image
  
  validate :check_context
  validate :check_user_comments_count, :on => :create
  validates_presence_of :user_id, :hope_id,
                        :message => I18n.t('errors.messages.can_not_be_empty')
  validates_length_of :body, 
                      :maximum => 300,
                      :message => I18n.t('errors.messages.too_long', :count => 300)
  private
        
    def strip_fields
      self.body.strip! if self.body
    end
    
    def check_context
      check_image_id
      
      if (self.image_id.blank? && self.body.blank?)
        errors[:hope_comment] = I18n.t('errors.messages.can_not_be_empty')
      end
    end
    
    # def update_comments_count
    #   comments_count = HopeComment.where(:hope_id => self.hope_id).count
    #   hope = Hope.find(self.hope_id)      
    #   hope.update_attribute(:comments, comments_count) if hope && (comments_count > -1) 
    # end
    
    def check_image_id
      unless self.image_id.blank?
        image = HopeCommentImage.find(self.image_id)
        if image && image.user_id == self.user_id
          if !image.be_used && !image.update_attribute(:be_used, true)
            self.image_id = nil
            logger.error "#update <HopeCommentImage># id:#{image.id}:used:true failure"            
          end
        else
           self.image_id = nil 
        end
      else
        self.image_id = nil
      end
    end
    
    def destroy_image
      # TODO: test me
      unless self.image_id.blank?
        unless (image = HopeCommentImage.find(self.image_id)) && image.destroy
          logger.error "#destroy <HopeCommentImage># id:#{self.image_id} failure"
        end
      end
    end
    
    def check_user_comments_count
      comments_count = HopeComment.where(:user_id => self.user_id, :created_at.gt => (Time.now.to_f - 24.hours.to_i)).count
      if (comments_count >= Constant::MAX_COMMENTS_PER_DAY)
        errors[:too_many_comments_per_day] = I18n.t('errors.messages.you_can_only_add_count_comments_per_day', :count => Constant::MAX_COMMENTS_PER_DAY)
      end
    end
end
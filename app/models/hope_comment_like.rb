class HopeCommentLike
  include Mongoid::Document
  include ElevenHelper::Mongoid::Timestamps::CreatedAt
  
  field :hope_comment_id
  field :user_id, type: String
  
  #NOTE: set unique index to prevent dupicate vote
  index [[:hope_comment_id, 1], [:user_id, 1]], unique: true
  index [[:user_id, 1], [:created_at, -1]]
  
  attr_accessible :hope_comment_id
  
  validates_presence_of :hope_comment_id, :user_id, 
                        :message => I18n.t('errors.messages.can_not_be_empty')
  
  after_create :update_likes_count
  after_destroy :update_likes_count
  
  private
    def update_likes_count
      likes_count = HopeCommentLike.where(:hope_comment_id => self.hope_comment_id).count
      hope_comment = HopeComment.find(self.hope_comment_id)      
      hope_comment.update_attribute(:likes, likes_count) if hope_comment && (likes_count > -1)
    end
                         
end
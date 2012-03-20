class HopeCommentLike
  include Mongoid::Document
  include Mongoid::Timestamps::Created
  
  field :hope_comment_id
  field :user_id, type: String
  
  #NOTE: set unique index to prevent dupicate vote
  index [[:hope_comment_id, 1], [:user_id, 1]], unique: true
  index [[:user_id, 1], [:created_at, -1]]
  
  validates_presence_of :hope_comment_id, :user_id, 
                        :message => I18n.t('errors.messages.can_not_be_empty')
  
  after_create :update_likes_count
  
  private
    def update_likes_count
      # Get likes everytime, so don't care the update error
      likes_count = HopeCommentLike.where(:hope_comment_id => hope_comment.id.to_s).count
      hope_comment = HopeComment.find(self.hope_comment_id)
      hope_comment.update_attribute(:likes, likes_count) if hope_comment && (likes_count > -1)
    end
                         
end
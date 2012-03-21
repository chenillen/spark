class HopeFollow
  include Mongoid::Document
  include Mongoid::Timestamps::Created
  
  field :user_id, type: String
  field :hope_id
  
  #NOTE: set unique index to prevent dupicate vote
  index [[:hope_id, 1], [:user_id, 1]], unique: true
  index [[:user_id, 1], [:created_at, -1]]
  
  attr_accessible :hope_id
  validates_presence_of :user_id, :hope_id, :message => I18n.t('errors.messages.can_not_be_empty')
  validate :check_user_follow_count
  
  after_create :update_follows_count
  after_destroy :update_follows_count
  
  private
    def update_follows_count
      follows_count = HopeFollow.where(:hope_id => self.hope_id).count
      hope = Hope.find(self.hope_id)
      hope.update_attribute(:follows, follows_count) if (follows_count > -1) && hope
    end
    
    def check_user_follow_count
      follows_count = HopeFollow.where(:user_id => self.user_id).count
      if (follows_count >= Constant::MAX_FOLLOWS_PER_USER)
        errors[:too_many_follows] = I18n.t('errors.messages.you_can_only_follow_count_hopes', :count => Constant::MAX_FOLLOWS_PER_USER)
      end
    end
end
class Watchdog      

  include Mongoid::Document
  include ElevenHelper::Mongoid::Timestamps::UpdatedAt
  
  field :user_id, type: String
  field :token, type: Integer
  field :remeber_me, type: Boolean, default: false
  
  attr_accessible :remeber_me
  validates_presence_of :user_id, :token,
                        :message => I18n.t('errors.messages.can_not_be_empty')
  
  def self.new_dog(session, user_id, remeber_me)
    dog = Watchdog.new(:remeber_me => remeber_me)
    dog.user_id = user_id
    dog.token = self.new_token
    
    if dog.save
      session[:user_id], session[:token], session[:remeber_me], session[:watchdog_id], session[:watchdog_updated_at] = user_id, dog.token, dog.remeber_me, dog.id, dog.updated_at
    end
    
    return dog
  end
      
  def self.new_token
    rand(10000000000)
  end
  
end
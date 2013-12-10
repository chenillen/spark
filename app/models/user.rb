class User
  include Mongoid::Document
  include ElevenHelper::Mongoid::Timestamps
  
  # sw for SinaWeibo
  field :_id, type: String
  # platform id
  field :pid
  field :platform
  field :username
  # the url for user homepage
  field :user_url
  field :avatar_url
  field :avatar_size, type: String, defaults: '50x50'
  field :large_avatar_url
  field :description
  field :verified, type: Boolean, defaults: false
  field :verified_reason
  field :allow_private_message, type: Boolean, defaults: false
  field :access_token
  # for new message loading
  field :new_messages_loaded_time, type: Float
  
  index :_id, unique: true
  identity :type => String
  
  before_create :initial_new_messages_loaded_time
  validates_presence_of :_id, :pid, :platform, :username, :user_url, :access_token,
                        :message => I18n.t('errors.messages.can_not_be_empty')
  
  def self.safe_query
    without(:access_token)
  end
  
  private
    def initial_new_messages_loaded_time
      # TODO: change me to Time.now.to_f after show for angles
      # self.new_messages_loaded_time = Time.now.to_f
      self.new_messages_loaded_time = 0      
    end
end
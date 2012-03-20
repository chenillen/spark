class User
  include Mongoid::Document
  include Mongoid::Timestamps
  
  # sw for SinaWeibo
  field :_id
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
  validates_presence_of :_id, :pid, :platform, :username, :user_url, :access_token
  
  def self.safe_query
    without(:access_token)
  end
  
  private
    def initial_new_messages_loaded_time
      self.new_messages_loaded_time = Time.now.to_f
    end
end
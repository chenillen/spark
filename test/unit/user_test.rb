require 'test_helper'

class UserTest < ActiveSupport::TestCase
  
  test ":_id, :pid, :platform, :username, :user_url, :access_token must be present" do
    user = User.new()
    assert user.invalid?
    assert I18n.t('errors.messages.can_not_be_empty'), user.errors[:_id].join('; ')
    assert I18n.t('errors.messages.can_not_be_empty'), user.errors[:pid].join('; ')
    assert I18n.t('errors.messages.can_not_be_empty'), user.errors[:platform].join('; ')
    assert I18n.t('errors.messages.can_not_be_empty'), user.errors[:username].join('; ')    
    assert I18n.t('errors.messages.can_not_be_empty'), user.errors[:user_url].join('; ')
    assert I18n.t('errors.messages.can_not_be_empty'), user.errors[:access_token].join('; ')    
  end
  
  test "new_messages_loaded_time must be add when create" do
    user = User.new(:_id => "123", :pid => "123", "platform" => "123", :username => "123", :user_url => "123", :access_token => "123")
    assert user.save
    assert_not_nil user.new_messages_loaded_time
  end
  
end
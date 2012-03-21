require 'test_helper'

class WatchdogTest < ActiveSupport::TestCase
  
  test "attr_accessible should be work" do
    dog = Watchdog.new(:remeber_me => true, :token => 'hello baby', :user_id => '123')
    
    assert dog.remeber_me
    assert_nil dog.user_id
    assert_nil dog.token
  end
  
  test "user_id must be present" do
    dog = Watchdog.new(:remeber_me => true)
    assert dog.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), dog.errors[:user_id].join('; ')
  end
  
  test "token must be present" do
    dog = Watchdog.new(:remeber_me => true)
    assert dog.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), dog.errors[:token].join('; ')
  end
  
end
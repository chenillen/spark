require 'test_helper'

class WatchdogTest < ActiveSupport::TestCase
  
  test "attr_accessible should be work" do
    dog = Watchdog.new(:remeber_me => true, :token => 'hello baby', :user_id => '123')
    
    assert dog.remeber_me
    assert_nil dog.user_id
    assert_nil dog.token
  end
  
  
end
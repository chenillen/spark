require 'test_helper'

class HopeFollowTest < ActiveSupport::TestCase
  
  test "attr_accessible should be work" do
    follow = HopeFollow.new(:user_id => "123", :hope_id => "312321")
    
    assert_equal "312321", follow.hope_id
    assert_nil follow.user_id
  end
  
  test "user_id must be present" do
    follow = HopeFollow.new(:hope_id => "312321")
    
    assert follow.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), follow.errors[:user_id].join('; ')
  end
  
  test "hope_id must be present" do
    follow = HopeFollow.new()
    
    assert follow.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), follow.errors[:hope_id].join('; ')
  end
  
  test "one user can only follow Constant::MAX_FOLLOWS_PER_USER hopes" do
    Hope.destroy_all
    
    user_id = "hello eleven"
    for i in 1..Constant::MAX_FOLLOWS_PER_USER
      hope = Hope.new(:title => 'hello', :body => 'hello baby'*20)
      hope.user_id = "#{i}"
      assert hope.save
      
      follow = HopeFollow.new(:hope_id => hope.id.to_s)
      follow.user_id = user_id
      assert follow.save
    end
    
    # add the Constant::MAX_FOLLOWS_PER_USER + 1 follow
    hope = Hope.new(:title => 'hello', :body => 'hello baby'*20)
    hope.user_id = "me"
    assert hope.save
    
    follow = HopeFollow.new(:hope_id => hope.id.to_s)
    follow.user_id = user_id
    assert follow.invalid?
    assert_equal I18n.t('errors.messages.you_can_only_follow_count_hopes', :count => Constant::MAX_FOLLOWS_PER_USER), follow.errors[:too_many_follows].join('; ')
    
    # delete one follow then add one, it should be add a new follow
    assert HopeFollow.first.destroy
    follow = HopeFollow.new(:hope_id => hope.id.to_s)
    follow.user_id = user_id
    assert follow.valid?
  end
  
  test "follow's count should be updated when hope_follow was created" do
    HopeFollow.destroy_all
    
    hope = Hope.new(:title => 'hello', :body => 'hello baby'*20)
    hope.user_id = "me"
    assert hope.save
    
    for i in 1..100
      follow = HopeFollow.new(:hope_id => hope.id.to_s)
      follow.user_id = "#{i}"
      assert follow.save
      
      assert_equal i, Hope.find(follow.hope_id).follows
    end
    
    for i in 1..100
      HopeFollow.first.destroy
      
      assert_equal (100 - i), Hope.find(hope.id).follows
    end
  end
  
end
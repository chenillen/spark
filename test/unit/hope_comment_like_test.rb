require 'test_helper'

class HopeCommentLikeTest < ActiveSupport::TestCase
  
  def setup
    @like = HopeCommentLike.new(:hope_comment_id => "123")
  end
  
  test "attr_accessible should be work" do
    like = HopeCommentLike.new(:hope_comment_id => "123", :user_id => "1232")
    
    assert_not_nil like.hope_comment_id
    assert_nil like.user_id
  end
  
  test "user_id should be present" do
    @like.user_id  = nil
    assert @like.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @like.errors[:user_id].join('; ')
  end
  
  test "hope_comment_id should be present" do
    @like.hope_comment_id  = nil
    assert @like.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @like.errors[:hope_comment_id].join('; ')
  end
  
  test "likes count should be updated in hope_comment when like was created" do
    HopeCommentLike.destroy_all
    
    hope_comment = HopeComment.new(:body => 'hello', :hope_id => "1312")
    hope_comment.user_id = "123"
    assert hope_comment.save
    
    for i in 1..100
      like = HopeCommentLike.new(:hope_comment_id => hope_comment.id.to_s)
      like.user_id = "hello"
      
      assert like.save
      
      assert_equal i, HopeComment.find(like.hope_comment_id).likes
    end
    
    for i in 1..100
      HopeCommentLike.first.destroy
      
      assert_equal (100 - i), HopeComment.find(hope_comment.id).likes
    end
  end
  
end
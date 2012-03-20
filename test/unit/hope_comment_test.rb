require 'test_helper'

class HopeCommentTest < ActiveSupport::TestCase
  def setup
    HopeComment.delete_all
    
    @hope_comment = HopeComment.new(:body => 'hello', :hope_id => 123)
    @hope_comment.user_id = "123"
  end
  
  test "attr_accesible should be work" do
    comment = HopeComment.new(:body => 'hello', :hope_id => 123, :user_id => '123', :likes => 200)
    
    assert_not_nil comment.body
    assert_nil comment.user_id
    assert_equal 0, comment.likes
  end
  
  
end
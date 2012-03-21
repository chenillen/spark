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
  
  test "image must be exists" do
    @hope_comment.image_id = 123
    assert @hope_comment.valid?
    assert_nil @hope_comment.image_id
  end
  
  test "image must be created by the owner of comment" do
    comment_image = HopeCommentImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
    comment_image.user_id = @hope_comment.user_id + "123"
    
    @hope_comment.image_id = comment_image.id.to_s
    assert @hope_comment.valid?
    
    assert_nil @hope_comment.image_id
  end
  
  test "body or image must be present" do
    # image_id is nil, then body must be present
    @hope_comment.image_id = nil
    [nil, '', '    ', "    \n\t", "    \n     \n\t"].each do |body|
      @hope_comment.body = body
      assert @hope_comment.invalid?
      assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_comment.errors[:hope_comment].join('; ')
    end
    
    # body is nil, then image_id must be present
    @hope_comment.body = nil
    comment_image = HopeCommentImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
    comment_image.user_id = @hope_comment.user_id
    assert comment_image.save
    
    @hope_comment.image_id = comment_image.id.to_s
    assert @hope_comment.valid?
    
    # body is nil and image doesn't exists
    @hope_comment.body = nil
    ['', "  \n  ", nil].each do |image_id|
      @hope_comment.image_id = image_id
      assert @hope_comment.invalid?
      assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_comment.errors[:hope_comment].join('; ')
    end
  end
  
  test "image's be_used must be updated to true" do
    comment_image = HopeCommentImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
    comment_image.user_id = @hope_comment.user_id
    assert comment_image.save
    assert_equal false, comment_image.be_used
    
    @hope_comment.image_id = comment_image.id.to_s
    assert @hope_comment.valid?
    assert HopeCommentImage.find(@hope_comment.image_id).be_used
  end
  
  test "image must be destroyed when comment destroy" do
    comment_image = HopeCommentImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
    comment_image.user_id = @hope_comment.user_id
    assert comment_image.save
    
    @hope_comment.image_id = comment_image.id.to_s
    assert @hope_comment.save
    assert @hope_comment.destroy
    
    assert_nil HopeCommentImage.find(@hope_comment.image_id)
  end
  
  test "body too long" do
    ['hello baby'*30 + '1', 'hello baby'*40].each do |body|
      @hope_comment.body = body
      assert @hope_comment.invalid?
      assert_equal I18n.t('errors.messages.too_long', :count => 300), @hope_comment.errors[:body].join('; ')
    end
  end
  
  test "user_id must be present" do
    @hope_comment.user_id = nil
    assert @hope_comment.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_comment.errors[:user_id].join('; ')
  end
  
  test "hope_id must be present" do
    @hope_comment.hope_id = nil
    assert @hope_comment.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_comment.errors[:hope_id].join('; ')
  end
  
  test "create time must be added" do
    assert @hope_comment.save
    assert_not_nil @hope_comment.created_at
  end
  
end
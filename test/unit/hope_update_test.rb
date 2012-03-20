require 'test_helper'

class HopeUpdateTest < ActiveSupport::TestCase
  
  def setup
    HopeUpdate.delete_all
    @hope_update = HopeUpdate.new(:body => 'hello', :hope_id => '123')
    @hope_update.user_id = "123"
  end
  
  test "attr_accesible should be work" do
    update = HopeUpdate.new(:body => 'hello', :hope_id => '123', :user_id => '123', :top => false)
    
    assert_not_nil update.body
    assert_nil update.user_id
    assert update.top
  end
  
  test "body must be present" do
    [nil, '', '          ', "   \n\t      "].each do |body|
      @hope_update.body = body
      assert @hope_update.invalid?
      assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_update.errors[:body].join('; ')
    end
  end
  
  test "hope id must be present" do
    @hope_update.hope_id = nil
    assert @hope_update.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_update.errors[:hope_id].join('; ')
  end
  
  test "user id must be present" do
    @hope_update.user_id = nil
    assert @hope_update.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope_update.errors[:user_id].join('; ')
  end
  
  test "body too long" do
    ['hello baby'*30 + '1', 'hello baby'*40].each do |body|
      @hope_update.body = body
      assert @hope_update.invalid?
      assert_equal I18n.t('errors.messages.too_long', :count => 300), @hope_update.errors[:body].join('; ')
    end
  end
  
  test 'body is legal' do
    ['1', 'hello', 'hello baby'*30 + "\n      " + "  "].each do |body|
      @hope_update.body = body
      assert @hope_update.valid?
    end
  end
  
  test 'update image should be ok and destroyed after update destroyed' do
    update_image = HopeUpdateImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
    update_image.user_id = @hope_update.user_id
    assert update_image.save
    assert_equal false, update_image.be_used
    
    @hope_update.image_id = update_image.id.to_s
    assert @hope_update.valid?
    update_image = HopeUpdateImage.find(@hope_update.image_id)
    assert update_image.be_used
    
    assert @hope_update.destroy
    assert_equal nil, HopeUpdateImage.find(update_image.id)
  end
  
  test "create time added before create" do
    assert @hope_update.save
    assert_not_nil @hope_update.created_at
  end
  
  test "hope update top status must be update after create and destroy" do
    update_ids = []
    for i in 1..(Constant::TOP_HOPE_UPDATE_NUMBER + 20)
      hope_update = HopeUpdate.new(:body => @hope_update.body, :hope_id => @hope_update.hope_id)
      hope_update.user_id = @hope_update.user_id
      
      assert hope_update.save
      assert hope_update.top
      
      update_ids << hope_update.id
    end
    
    # the first create 20 updates' top should be false
    hope_updates = HopeUpdate.find(update_ids[0..19])
    assert_equal 20, hope_updates.size
    hope_updates.each do |hope_update|
      assert_equal false, hope_update.top
    end
    
    # the last create Constant::TOP_HOPE_UPDATE_NUMBER updates' top should be true
    hope_updates = HopeUpdate.find(update_ids[20..-1])
    assert_equal Constant::TOP_HOPE_UPDATE_NUMBER, hope_updates.size 
    hope_updates.each do |hope_update|
      assert_equal true, hope_update.top
    end
    
    # delete one top hope_update and another non top hope_update should be updated to top
    assert HopeUpdate.find(update_ids[20]).destroy
    assert_equal true, HopeUpdate.find(update_ids[19]).top
    
    hope_updates = HopeUpdate.find(update_ids[0..18])
    assert_equal 19, hope_updates.size    
    hope_updates.each do |hope_update|
      assert_equal false, hope_update.top
    end
    
    # delete one not top hope_update and no non top hope_update should be updated to top
    assert HopeUpdate.find(update_ids[12]).destroy
    
    hope_updates = HopeUpdate.find(update_ids[19..-1])
    assert_equal Constant::TOP_HOPE_UPDATE_NUMBER, hope_updates.size        
    hope_updates.each do |hope_update|
      assert_equal true, hope_update.top
    end
  end
  
end
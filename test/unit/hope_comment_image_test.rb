require 'test_helper'

class HopeCommentImageTest < ActiveSupport::TestCase
  
  IMAGE_PATH = "test/fixtures/images/"
  
  test "attr_accessible should be work" do
    image = HopeCommentImage.new(:image => fixture_file_upload(IMAGE_PATH + "hello.png"), :be_used => true, :user_id => "123")
    
    assert_not_nil image.image
    assert_nil image.user_id
    assert_equal false, image.be_used
  end
  
  test 'image too big' do
    # image too big
    hope_comment_image = HopeCommentImage.new(:image => fixture_file_upload(IMAGE_PATH + "heic1107a.jpg"));
    hope_comment_image.user_id = 11
    assert hope_comment_image.invalid?
    assert_equal I18n.t('errors.messages.image_too_big', :count => 5), hope_comment_image.errors[:image_file_size].join('; ')
  end
  
  test 'image must be present' do
    # not present
    hope_comment_image = HopeCommentImage.new()
    assert hope_comment_image.invalid?
    assert hope_comment_image.errors[:image_file_name], I18n.t('errors.messages.image_can_not_be_empty')    
  end

  test 'image content type must be legal' do    
    hope_comment_image = HopeCommentImage.new(:image => fixture_file_upload(IMAGE_PATH + 'Gray.bmp', 'image/x-ms-bmp'))
    assert hope_comment_image.invalid?
    assert_equal I18n.t('errors.messages.wrong_image_content_type'), hope_comment_image.errors[:image_content_type].join('; ')
    
    hope_comment_image.image = fixture_file_upload(IMAGE_PATH + 'pentagram.tif', 'image/tiff')
    assert hope_comment_image.invalid?
    assert_equal I18n.t('errors.messages.wrong_image_content_type'), hope_comment_image.errors[:image_content_type].join('; ')        
  end
  
  test "user id must be present" do
    image = HopeCommentImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    assert image.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), image.errors[:user_id].join('; ')
  end
  
  test 'image should be create' do
    image_names = %w{788faf5fjw1dhlgn5a5d1j.jpg 7a87d45djw1dgk4n88dtnj.jpg ______.jpg Desert_Landscape.jpg heart.JPG hell.png hello.png helloyoucan_see_medadsadmksamdskadmksamdksa.jpg IMG_0379.png}
    image_names.each do |image_name|
      image = HopeCommentImage.new(:image => fixture_file_upload(IMAGE_PATH + image_name))
      image.user_id = '11'
      assert image.valid?
    end
  end
  
  test "image sizes must be saved" do
    comment_image = HopeCommentImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    comment_image.user_id = "123"
    
    assert comment_image.save
    assert_equal comment_image.sizes.size, comment_image.image.styles.size
  end
  
  def teardown
    HopeCommentImage.destroy_all
  end
end
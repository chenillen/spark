require 'test_helper'

class HopeUpdateImageTest < ActiveSupport::TestCase
  
  IMAGE_PATH = "test/fixtures/images/"
  
  def setup
    
  end
  
  test "attr_accesible should be work" do
    update_image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + "hello.png"), :be_used => true, :user_id => "123")
    
    assert_not_nil update_image.image
    assert_nil update_image.user_id
    assert_equal false, update_image.be_used
  end
  
  test 'image too big' do
    # image too big
    hope_update_image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + "heic1107a.jpg"));
    hope_update_image.user_id = 11
    assert hope_update_image.invalid?
    assert_equal I18n.t('errors.messages.image_too_big', :count => 5), hope_update_image.errors[:image_file_size].join('; ')
  end
  
  test 'image must be present' do
    # not present
    hope_update_image = HopeUpdateImage.new()
    assert hope_update_image.invalid?
    assert hope_update_image.errors[:image_file_name], I18n.t('errors.messages.image_can_not_be_empty')    
  end

  test 'image content type must be legal' do    
    hope_update_image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + 'Gray.bmp', 'image/x-ms-bmp'))
    assert hope_update_image.invalid?
    assert_equal I18n.t('errors.messages.wrong_image_content_type'), hope_update_image.errors[:image_content_type].join('; ')
    
    hope_update_image.image = fixture_file_upload(IMAGE_PATH + 'pentagram.tif', 'image/tiff')
    assert hope_update_image.invalid?
    assert_equal I18n.t('errors.messages.wrong_image_content_type'), hope_update_image.errors[:image_content_type].join('; ')        
  end
  
  test "user id must be present" do
    image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    assert image.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), image.errors[:user_id].join('; ')
  end
  
  test 'image should be create' do
    image_names = %w{788faf5fjw1dhlgn5a5d1j.jpg 7a87d45djw1dgk4n88dtnj.jpg ______.jpg Desert_Landscape.jpg heart.JPG hell.png hello.png helloyoucan_see_medadsadmksamdskadmksamdksa.jpg IMG_0379.png}
    image_names.each do |image_name|
      image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + image_name))
      image.user_id = '11'
      assert image.valid?
    end
  end
  
  test "image sizes must be saved" do
    update_image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    update_image.user_id = "123"
    
    assert update_image.save
    assert_equal update_image.sizes.size, update_image.image.styles.size
  end
  
end
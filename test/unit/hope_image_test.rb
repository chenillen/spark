require 'test_helper'

class HopeImageTest < ActiveSupport::TestCase

  IMAGE_PATH = "test/fixtures/images/"
  
  def setup
    
  end
  
  test "attr_accesible should be work" do
    hope_image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + "hello.png"), :description => 'hello', :be_used => true, :user_id => "123")
    
    assert_not_nil hope_image.description
    assert_nil hope_image.user_id
    assert_equal false, hope_image.be_used
  end
  
  test 'image too big' do
    # image too big
    hope_image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + "heic1107a.jpg"))
    hope_image.user_id = 11
    assert hope_image.invalid?
    assert_equal I18n.t('errors.messages.image_too_big', :count => 5), hope_image.errors[:image_file_size].join('; ')
  end
  
  test 'image must be present' do
    # not present
    hope_image = HopeImage.new(:description => 'hello')
    assert hope_image.invalid?
    assert hope_image.errors[:image_file_name], I18n.t('errors.messages.image_can_not_be_empty')    
  end
  
  test 'image content type must be legal' do    
    hope_image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + 'Gray.bmp', 'image/x-ms-bmp'))
    assert hope_image.invalid?
    assert_equal I18n.t('errors.messages.wrong_image_content_type'), hope_image.errors[:image_content_type].join('; ')
    
    hope_image.image = fixture_file_upload(IMAGE_PATH + 'pentagram.tif', 'image/tiff')
    assert hope_image.invalid?
    assert_equal I18n.t('errors.messages.wrong_image_content_type'), hope_image.errors[:image_content_type].join('; ')
        
  end
  
  test 'description too long' do
    # description too long
    image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    image.user_id = 11
    # 141 characters
    image.description = "hello baby"*14 + "h"
    assert image.invalid?
    assert_equal image.errors[:description].join('; '), I18n.t('errors.messages.description_too_long', :count => 140)
    
    legal_desc = ["hello baby"*14, "  "+"hello baby"*14 + "  ", "hello"]
    legal_desc.each do |desc|
      image.description = desc
      assert image.valid?
    end
  end
  
  test "user id must be present" do
    image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    assert image.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), image.errors[:user_id].join('; ')
  end
  
  test 'image should be create' do
    image_names = %w{788faf5fjw1dhlgn5a5d1j.jpg 7a87d45djw1dgk4n88dtnj.jpg ______.jpg Desert_Landscape.jpg heart.JPG hell.png hello.png helloyoucan_see_medadsadmksamdskadmksamdksa.jpg IMG_0379.png}
    image_names.each do |image_name|
      image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + image_name))
      image.user_id = '11'
      assert image.valid?
    end
  end
  
  test "image sizes must be saved" do
    hope_image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
    hope_image.user_id = "123"
    
    assert hope_image.save
    assert_equal hope_image.sizes.size, hope_image.image.styles.size
  end
end
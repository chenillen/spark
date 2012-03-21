require 'test_helper'

class HopeTest < ActiveSupport::TestCase
  
  def setup
    Hope.destroy_all
    @hope = Hope.new(:title => 'hello baby', :body => 'hello baby'*30, :contact => '@email')
    @hope.user_id = "eleven"
  end
  
  test "attr_accesible should be work" do
    hope = Hope.new({:title => @hope.title,
                      :body => @hope.body, :contact => @hope.contact, :user_id => "123", :follows => 12, :finish => true})
    
    assert_not_nil hope.body
    assert_nil hope.user_id                  
    assert_equal 0, hope.follows
    assert_equal false, hope.finish
  end
  
  test 'title must be legal' do
    
    # title too short
    too_short_titles = ['   h', 'h', 'h       ', '  ', nil, '', "\n    ", "      \n\t     "]
    too_short_titles.each do |title|
      @hope.title = title
      assert @hope.invalid?
      assert_equal I18n.t('errors.messages.too_short', :count => 2), @hope.errors[:title].join('; ')
    end
    
    # title too long
    @hope.title = 'hel'*10 + 'h'
    assert @hope.invalid?
    assert_equal I18n.t('errors.messages.too_long', :count => 30), @hope.errors[:title].join('; ')
    
    @hope.title = 'hel'*10 + 'h'
    assert @hope.invalid?
    assert_equal I18n.t('errors.messages.too_long', :count => 30), @hope.errors[:title].join('; ')
    
    # good titles
    good_titles = ['he', "\n     \t" + 'hello'*6 + '    ']   
    good_titles.each do |title|
      @hope.title = title
      assert @hope.valid?
    end
    
  end
  
  test 'body must be legal' do
      
    # body too short
    too_short_bodys = ['d', 'hello baby'*19 + 'hellobaby' + '     ', 'hellobaby' + 'hello baby'*19, nil, '', '     ', "\n    \t   ", "   \n\t  "]
    too_short_bodys.each do |body|
      @hope.body = body
      assert @hope.invalid?
      assert_equal I18n.t('errors.messages.too_short', :count => 200), @hope.errors[:body].join('; ')
    end
    
    #body too long
    @hope.body = "hello baby"*200 + "1"
    assert @hope.invalid?
    assert_equal I18n.t('errors.messages.too_long', :count => 2000), @hope.errors[:body].join('; ')
    
    # good body
    good_bodys = ['hello baby'*20 + 'h', "hello baby"*200 + "\n      \t"]
    good_bodys.each do |body|
      @hope.body = body
      assert @hope.valid?
    end
    
  end
  
  test 'contact must be legal' do
            
    # contact too long
    @hope.contact = 'hello baby'*30 + 'h'
    assert @hope.invalid?
    assert_equal I18n.t('errors.messages.too_long', :count => 300), @hope.errors[:contact].join('; ')
    
    # good contacts
    good_contacts = ["hello baby", "    \n\t" + "hello baby"*30 + "     \n\t"]
    good_contacts.each do |contact|
      @hope.contact = contact
      assert @hope.valid?
    end
    
  end
  
  test "image should be exists" do
    HopeImage.destroy_all
    
    @hope.image_ids = [123, 324, 345]
    assert @hope.valid?
    puts @hope.image_ids
    assert_equal 0, @hope.image_ids.size
  end
  
  test "image should be create by the owner of hope" do
    @hope.image_ids = []
    for i in 1..Constant::MAX_HOPE_IMAGES
      hope_image = HopeImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
      hope_image.user_id = @hope.user_id + "huang"
      assert hope_image.save
      @hope.image_ids << hope_image.id.to_s
    end
    
    assert_equal Constant::MAX_HOPE_IMAGES, @hope.image_ids.size
    assert @hope.valid?
    
    assert_equal 0, @hope.image_ids.size
  end
  
  test 'image ids should be ok' do
    
    for i in 1..(Constant::MAX_HOPE_IMAGES + 1)
      hope_image = HopeImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
      hope_image.user_id = @hope.user_id
      assert hope_image.save
      assert_equal false, hope_image.be_used
      @hope.image_ids << hope_image.id.to_s
    end
    
    assert_equal Constant::MAX_HOPE_IMAGES + 1, @hope.image_ids.size
    # image ids too many
    assert @hope.invalid?
    assert_equal I18n.t('errors.messages.too_many_pictures', :count => Constant::MAX_HOPE_IMAGES), @hope.errors[:image_ids].join('; ')
    
    # every image id should be uniq and compact in image_ids
    assert_equal 11, @hope.image_ids.size
    @hope.image_ids.delete_at(10)
    @hope.image_ids << @hope.image_ids[1]
    
    assert @hope.valid?
    assert_equal 10, @hope.image_ids.size
    
    # used image status shoud be update to be used
    @hope.image_ids.each do |image_id|
      assert_equal true, HopeImage.find(image_id).be_used
    end
    
  end
  
  test 'hope image should be destroyed when hope was destroyed' do
    for i in 1..10
      hope_image = HopeImage.new(:image => fixture_file_upload("test/fixtures/images/heart.JPG"))
      hope_image.user_id = @hope.user_id
      assert hope_image.save
      @hope.image_ids << hope_image.id.to_s
    end
    
    assert @hope.save
    assert @hope.destroy
    @hope.image_ids.each do |image_id|
      assert_equal nil, HopeImage.find(image_id)
    end
  end
  
  test 'hope update should be deleted when hope was deleted' do
    # create update
    assert @hope.save
    hope_update_ids = []
    for i in 1..100
      hope_update = HopeUpdate.new(:body => 'hello', :hope_id => @hope.id.to_s)
      hope_update.user_id = @hope.user_id
      assert hope_update.save
      hope_update_ids << hope_update.id
    end
    
    # delete hope
    assert @hope.destroy
    for i in 1..100
      assert_equal nil, HopeUpdate.find(hope_update_ids[i-1])
    end
  end
  
  test 'hope follow should be deleted when hope was deleted' do
    assert @hope.save
    hope_follow_ids = []
    for i in 1..100
      hope_follow = HopeFollow.new(:hope_id => @hope.id.to_s)
      hope_follow.user_id = i
      assert hope_follow.save
      hope_follow_ids << hope_follow.id
    end
    
    assert @hope.destroy
    for i in 1..100
      assert_equal nil, HopeFollow.find(hope_follow_ids[i-1])
    end
  end
  
  test 'one user can only create Constant::MAX_HOPES_PER_USER hopes' do
    for i in 1..Constant::MAX_HOPES_PER_USER
      hope = Hope.new(:title => @hope.title, :body => @hope.body)
      hope.user_id = @hope.user_id
      assert hope.save
    end

    hope = Hope.new(:title => @hope.title, :body => @hope.body)
    hope.user_id = @hope.user_id
    assert_equal false, hope.save 
    assert_equal I18n.t('errors.messages.you_can_only_create_count_hopes', :count => Constant::MAX_HOPES_PER_USER), hope.errors[:too_many_hopes].join('; ')
    
    # delete one then add one, it should be valid
    Hope.first.destroy
    hope = Hope.new(:title => @hope.title, :body => @hope.body)
    hope.user_id = @hope.user_id
    assert hope.valid?
  end
  
  test 'user id must be present' do
    @hope.user_id = nil
    assert @hope.invalid?
    assert_equal I18n.t('errors.messages.can_not_be_empty'), @hope.errors[:user_id].join('; ')
  end
  
  def teardown
    HopeImage.destroy_all
  end
end
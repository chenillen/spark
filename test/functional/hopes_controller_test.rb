require 'test_helper'

class HopesControllerTest < ActionController::TestCase
  
  IMAGE_PATH = "test/fixtures/images/"
  
  def setup
    @user = User.new(:_id => '123', :pid => 123, :platform => 'hello', :username => 'baby', :user_url => 'hello', :access_token => 321321)
    assert @user.save
    
    # set hope images
    image_ids = []
    for i in 1..2
      image = HopeImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
      image.user_id =  @user.id
      assert image.save
      image_ids << image.id.to_s
    end
    
    @hope = Hope.new(:title => 'hello', :body => 'hello baby'*30, :image_ids => image_ids)
    @hope.user_id = @user.id
    assert @hope.save
  end
  
  test "should get new" do
    get :new
    assert_response :success
    assert_not_nil assigns(:hope)
  end
  
  test "show action" do
    
    # create hope update
    for i in 1..(Constant::TOP_HOPE_UPDATE_NUMBER + 20)
      update_image = HopeUpdateImage.new(:image => fixture_file_upload(IMAGE_PATH + 'hello.png'))
      update_image.user_id = @user.id
      assert update_image.save
      
      update = HopeUpdate.new(:body => 'hello', :hope_id => @hope.id.to_s, :image_id => update_image.id.to_s)
      update.user_id = @user.id
      assert update.save
    end
    
    get :show, {:id => @hope.id.to_s}
    assert_response :success
    assert_template :show
    
    # test response data
    hope_updates = assigns(:hope_updates)
    
    assert_equal @hope.id, assigns(:hope).id
    assert_equal @user.id, assigns(:creater).id
    assert_equal 2, assigns(:images).size    
    assert_equal  Constant::TOP_HOPE_UPDATE_NUMBER, hope_updates.size
    assert_equal Constant::TOP_HOPE_UPDATE_NUMBER, assigns(:updates_image_hash).size    
    hope_updates.each do |hope_update|
      assert hope_update.top
    end
    assert_equal Constant::TOP_HOPE_UPDATE_NUMBER + 20, assigns(:hope_updates_count)
    
    assert HopeUpdate.destroy_all
    assert HopeUpdateImage.destroy_all
    
    assert @hope.destroy
    get :show, {:id => @hope.id.to_s}
    assert_nil assigns(:hope)
    assert_redirected_to '/'
  end
  
  test "edit need login" do
    get :edit, {:id => @hope.id.to_s}
    assert_redirected_to "/login?source=#{request.url}"
  end
  
  test "edit should work" do
    # login
    login(@user.id)
    
    get :edit, {:id => @hope.id.to_s}
    assert_response :success
    assert_template :edit
    
    logout
  end
  # 
  
  test "edit should redirected to '/' when it not belongs to user" do
    login('dsadsa')
    get :edit, {:id => @hope.id.to_s}
    assert_redirected_to '/'
    
    logout
  end
  
  def teardown
    assert @hope.destroy
    assert @user.destroy
    assert HopeImage.destroy_all
  end
  
end
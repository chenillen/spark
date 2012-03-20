class HopeImagesController < ApplicationController

  def create
    hope_image = HopeImage.new(params[:hope_image])
    hope_image.user_id = session[:user_id]
    respond_to do |format|
      if hope_image.save
        format.html {render :json=> {:success => true, :image_id => hope_image.id, 
                                      :image_url => hope_image.image.url(:thum), :image_size => hope_image.sizes[:thum]}}
      else
        format.html {render :json => {:success => false, :errors => hope_image.errors.first}}
      end
    end
  end
  
  def update
    hope_image = HopeImage.find(params[:id]);
    respond_to do |format|
      if hope_image
        hope_image.description = params[:description];
        if session[:user_id] != hope_image.user_id
          format.json {render :json => {:success => false, :errors => [I18n.t('info.it_does_not_belong_to_you')]}}
        elsif hope_image.save
          format.json {render :json => {:success => true}}
        else  
          format.json {render :json => {:success => false, :errors => hope_image.errors.first}}
        end
      else
        format.json {render :json => {:success => false, :errors => [I18n.t('info.the_picture_does_not_exists')]}}
      end
    end
  end
  
  def destroy
    respond_to do |format|
      if (hope_image = HopeImage.find(params[:id])) && (session[:user_id] == hope_image.user_id) && hope_image.destroy
        format.json {render :json => {:success => true}}          
      else
        format.json {render :json => {:success => false}}
      end
    end
  end
  
end
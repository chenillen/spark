class HopeUpdateImagesController < ApplicationController
  
  def create
    image = HopeUpdateImage.new(:image => params[:image])
    image.user_id = session[:user_id]
    
    respond_to do |format|
      if image.save
        format.html {render :json => {:success => true, :id => image.id, :thum_url => image.image.url(:thum), :thum_size => image.sizes[:thum]}}
      else
        format.html {render :json => {:success => false, :error => image.errors.first[1]}}
      end
    end
  end
  
  def destroy
    image = HopeUpdateImage.find(params[:id])
    
    respond_to do |format|
      if image
        if image.user_id == session[:user_id]
          if image.destroy
            format.json {render :json => {:success => true}}
          else
            logger.error "#destroy <hope_update_image># id:#{params[:id]} failure"
            format.json {render :json => {:success => false, :errors => [I18n.t('info.Delete_failed')]}}
          end
        else
          format.json {render :json => {:success => false, :errors => [I18n.t('info.it_does_not_belong_to_you')]}}
        end
      else
        format.json {render :json => {:success => false, errors => [I18n.t('info.the_picture_does_not_exists')]}}
      end
    end
    
  end
  
end
  
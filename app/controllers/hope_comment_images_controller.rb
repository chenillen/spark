class HopeCommentImagesController <ApplicationController
  
  def create
    image = HopeCommentImage.new(params[:hope_comment_image])
    image.user_id = session[:user_id]
    
    respond_to do |format|
      if image.save
        format.html {render :json => {:success => true, :image_url => image.image.url(:thum), :image_size => image.sizes[:thum], :image_id => image.id}}
      else
        format.html {render :json => {:success => false, :errors => image.errors.first}}
      end
    end
  end
  
  def destroy
    image = HopeCommentImage.find(params[:id])
    
    respond_to do |format|
      if image
        if image.user_id == session[:user_id]
          if image.destroy
            format.json {render :json => {:success => true}}
          else
            logger.error "#destroy <hope_comment_image># id:#{params[:id]} failure"
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
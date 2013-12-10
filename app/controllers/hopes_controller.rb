class HopesController < ApplicationController

  skip_before_filter :authorize, :only =>[:show, :new]

  def new
    @hope = Hope.new
    respond_to  do |format|
      format.html
    end
  end                
  
  def edit
    @hope = Hope.find(params[:id])
    respond_to do |format|
      if @hope
        if @hope.user_id == session[:user_id]
          format.html
        else
          format.html {redirect_to '/', :errors => [I18n.t('info.it_does_not_belong_to_you')]}
        end
      else 
        format.html {redirect_to '/'}
      end
    end
  end              

  def update
    hope = Hope.find(params[:id])

    respond_to do |format|
      if hope
        if hope.user_id == session[:user_id]
          if hope.update_attributes(params[:hope])
            format.json {render :json => {:success => true, :redirect_url => url_for(hope)}}
          else
            format.json {render :json => {:success => false, :errors => hope.errors}}
          end
        else
          # format.html {redirect_to '/', :errors => [I18n.t('info.it_does_not_belong_to_you')]}            
          format.json {render :json => {:success => false, :redirect_url => '/'}} 
        end
      else
        # format.html {redirect_to '/'}
        format.json {render :json => {:success => false, :redirect_url => '/'}}        
      end
    end
  end
                                                       
  def show
    @hope = Hope.find(params[:id])
    respond_to do |format|
      if @hope
        # get hope images
        @images = HopeImage.find(@hope.image_ids).to_a
        # get creater
        @creater = User.safe_query.find(@hope.user_id)
        # get hope updates
        @hope_updates = HopeUpdate.where(:hope_id => @hope.id.to_s, :top => true).order_by([:created_at, -1]).limit(Constant::TOP_HOPE_UPDATE_NUMBER).to_a
        @hope_updates_count = HopeUpdate.where(:hope_id => @hope.id.to_s).count
        # get hope update image
        image_ids = []
        @hope_updates.each do |hope_update|
          image_ids << hope_update.image_id if hope_update.image_id
        end
        @updates_image_hash = {}
        if image_ids.size > 0
          hope_updates_images = HopeUpdateImage.find(image_ids).to_a
          hope_updates_images.each do |update_image|
            update_image_hash = {}
            update_image_hash[:mini_url] = update_image.image.url(:mini)
            update_image_hash[:medium_url] = update_image.image.url(:medium) 
            update_image_hash[:big_url] = update_image.image.url(:big)                        
            update_image_hash[:mini_size] = update_image.sizes["mini"]
            
            @updates_image_hash[update_image.id.to_s] = update_image_hash
          end
        end
           
        format.html
      else                                 
        format.html {redirect_to '/'}
      end
    end
  end
  
  def create
    respond_to do |format|
      hope = Hope.new(params[:hope])
      hope.user_id = session[:user_id]
      
      if hope.save
        format.json {render :json => {:success => true, :redirect_url => url_for(hope)}}
      else
        format.json {render :json => {:success => false, :errors => hope.errors}}
      end
    end
  end  
  
  def destroy
    respond_to do |format|
      if (hope = Hope.find(params[:id])) && (hope.user_id == session[:user_id])
        if hope.destroy
          format.json {render :json => {:success => true}}    
        else
          format.json {render :json  => {:success => false}}
        end
      else
        format.json {render :json => {:success => false}}
      end
    end
  end
  
  def finish
    respond_to do |format|
      if (hope = Hope.find(params[:id])) && (hope.user_id == session[:user_id]) && hope.update_attribute(:finish, !(hope.finish))
        format.json {render :json => {:success => true}} 
      else
        format.json {render :json => {:success => false}}
      end
    end
  end
  
end
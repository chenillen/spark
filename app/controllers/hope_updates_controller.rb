class HopeUpdatesController < ApplicationController
  skip_before_filter :authorize, :only => [:show_hope_updates]
  
  def create    
    respond_to do |format|
      # hope must be exists
      if (hope = Hope.find(params[:hope_update][:hope_id]))
        hope_update = HopeUpdate.new(params[:hope_update])
        hope_update.user_id = session[:user_id]
        
        if hope_update.save
          image_hash = nil
          if hope_update.image_id
            image_hash = {}
            image = HopeUpdateImage.find(hope_update.image_id) 
            image_hash[:mini_url] = image.image.url(:mini)
            image_hash[:sizes] = image.sizes
          end

          format.json {render :json => {:success => true, :hope_update => hope_update, :image => image_hash}}
        else  
          format.json {render :json => {:success => false, :errors => hope_update.errors}}
        end
      else
        format.json {render :json => {:success => false, :hope_does_not_exists => true}}
      end
    end
  end
  
  def index
    limit = params[:limit].to_i || 50
    sort = params[:sort].to_i || -1
    skip = params[:skip].to_i || 0
    

    hope_updates = get_hope_updates_by_trick(skip, limit, sort)
    
    image_ids = [];
    hope_updates.each do |hope_update|
      (image_ids << hope_update.image_id) if hope_update.image_id
    end
    
    images = HopeUpdateImage.find(image_ids).to_a
    
    images_hash = {}
    images.each do |image|
      temp = {}
      
      temp[:sizes] = image.sizes
      temp[:mini_url] = image.image.url(:mini)
      temp[:medium_url] = image.image.url(:medium)
      
      images_hash[image.id] = temp
    end
    
    respond_to do |format|
      format.json {render :json => {:success => true, :hope_updates => hope_updates, :images_hash => images_hash}}
    end
  end
  
  def destroy
    respond_to do |format|
      if (hope_update = HopeUpdate.find(params[:id])) && (hope_update.user_id == session[:user_id]) && hope_update.destroy
        format.json {render :json => {:success => true}}
      else  
        format.json {render :json => {:success => false}}
      end      
    end
  end
  
  def show_hope_updates
    respond_to do |format|
      if @hope = Hope.find(params[:hope_id])
        if params[:page]
          @page = params[:page].to_i
          @page = (@page < 1)? 1 : @page 
        else
          @page = 1
        end
        # get hope updates
        @hope_updates = get_hope_updates_by_trick((@page - 1)*50, 50, -1)
        # @hope_updates = HopeUpdate.where(:hope_id => params[:hope_id]).order_by([:created_at, -1]).limit(50).skip((@page - 1)*50).to_a
        # get hope updates count
        @updates_count = HopeUpdate.where(:hope_id => @hope.id.to_s).count
        # get hope_update_images
        image_ids = []
        @hope_updates.each do |hope_update|
          (image_ids << hope_update.image_id) if hope_update.image_id
        end
        @images_hash = {}
        if image_ids.size > 0
          images = HopeUpdateImage.find(image_ids).to_a
          images.each do |image|
            image_hash = {}
            image_hash[:mini_url] = image.image.url(:mini)
            image_hash[:medium_url] = image.image.url(:medium)            
            image_hash[:mini_size] = image.sizes["mini"]

            @images_hash[image.id.to_s] = image_hash
          end
        end
        format.html {render :updates_show}
      end
    end
  end
  
  private
    
    # TODO: TESTME
    def get_hope_updates_by_trick(skip, limit, sort)
      if sort == -1
        # not the top hope_updates, :top must be false
        if skip >= Constant::TOP_HOPE_UPDATE_NUMBER
          hope_updates = HopeUpdate.where(:hope_id => params[:hope_id], :top => false).skip(skip - Constant::TOP_HOPE_UPDATE_NUMBER).limit(limit).order_by([:created_at, sort]).to_a
        # contain the top_hope_updates
        else
          hope_updates = HopeUpdate.where(:hope_id => params[:hope_id], :top => true).skip(skip).order_by([:created_at, sort]).to_a
          # not all are top_hope_updates          
          if (limit + skip) > Constant::TOP_HOPE_UPDATE_NUMBER
            hope_updates2 = HopeUpdate.where(:hope_id => params[:hope_id], :top => false).limit(limit - hope_updates.size).order_by([:created_at, sort]).to_a
            hope_updates += hope_updates2
          end
        end
        return hope_updates
        
      elsif sort == 1
        return "please finish it"
      end
    end
end
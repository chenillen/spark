class IndexController < ApplicationController
  
  skip_before_filter :authorize, :only => [:index, :get_hopes]
  
  def index
  end
  
  def get_hopes
    if params[:limit]
      limit = params[:limit].to_i
    else
      limit = 50
    end
    if params[:skip]
      skip = params[:skip].to_i
    else
      skip = 0
    end
    # get hopes
    hopes = Hope.where(:finish => false).order_by([:follows, -1]).limit(limit).skip(skip).to_a
    # 
    # puts '----------------------------------'
    # puts Hope.where(:finish => false).order_by([:follows, -1]).limit(limit).skip(skip).execute.explain
    # puts '----------------------------------'
    
    # get hope images ids
    image_ids = []
    hopes.each do |hope|
      if hope.image_ids.size > 0
        image_ids << hope.image_ids[0]
      end
    end
    # get hope images
    images_hash = {}
    if image_ids.size > 0
      hope_images = HopeImage.find(image_ids).to_a
      # set hope images hash
      hope_images.each do |image|
        image_hash = {}
        image_hash[:mini_url] = image.image.url(:mini)
        image_hash[:mini_size] = image.sizes["mini"]
        images_hash[image.id.to_s] = image_hash
      end
    end
    
    respond_to do |format|
      format.json {render :json => {:success => true, :hopes => hopes, :images_hash => images_hash}}
    end
  end
  
end
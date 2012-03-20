class HopeCommentsController < ApplicationController
  
  skip_before_filter :authorize, :only => [:index]
  
  def create
    respond_to do |format|
      # hope must be exists
      if (hope = Hope.find(params[:hope_comment][:hope_id]))
        hope_comment = HopeComment.new(params[:hope_comment])
        hope_comment.user_id = session[:user_id]

        if hope_comment.save
          (image = HopeCommentImage.find(hope_comment.image_id)) if hope_comment.image_id
                    
          format.json {render :json => {:success => true, :hope_comment => hope_comment, :user => User.safe_query.find(hope_comment.user_id), :image => get_image_hash(image)}}
        else
          format.json {render :json => {:success => false, :errors => hope_comment.errors}}
        end
      # hope is not exists
      else
        format.json {render :json => {:success => false, :hope_does_not_exists => true}}
      end
    end
  end
  
  def index
    limit = params[:limit]
    skip = params[:skip]
    
    if (limit = limit.to_i)
      limit = 100 if limit > 100
    else
      limit = 50
    end

    unless (skip = skip.to_i)
      skip = 0
    end
    
    comments = HopeComment.where(:hope_id => params[:hope_id]).skip(skip).limit(limit).order_by([:likes, -1])
    
    respond_to do |format|
      # if don't cast it to array, it will call database when be rendered as json.
      comments = comments.to_a
      
      images_hash = {}
      users_hash = {}
      user_ids = []
      image_ids = []
      
      comments.each do |comment|
        user_ids << comment.user_id
        if comment.image_id
          image_ids << comment.image_id
        end
      end
      
      # get comment images
      if image_ids.size > 0
        images = HopeCommentImage.find(image_ids)
        images.each do |image|
          images_hash[image.id] = get_image_hash(image)
        end
      end
      
      # get users 
      users = User.safe_query.find(user_ids.uniq)
      users.each do |user|
        users_hash[user.id] = user
      end
      
      format.json {render :json => {:success => true, :comments => comments, :users => users_hash, :images => images_hash}}
    end
  end
  
  def destroy
    respond_to do |format|
      if (hope_comment = HopeComment.find(params[:id])) && (hope_comment.user_id == session[:user_id]) && hope_comment.destroy
        format.json {render :json => {:success => true}}
      else
        format.json {render :json => {:success => false}}
      end
    end
  end
  
  private
    def get_image_hash(image)
      return nil unless image
      
      image_hash = {}
      
      image_hash[:sizes] = image.sizes
      image_hash[:user_id] = image.user_id
      image_hash[:mini_url] = image.image.url(:mini)
      image_hash[:medium_url] = image.image.url(:medium)
      
      return image_hash
    end
    
end
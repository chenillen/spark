class UserHomesController < ApplicationController

  # params[:what] for "news", "follows" or "creates"
  def index
    respond_to do |format|
      case params[:reading]
      when "my_follows"
        format.html {render :my_follows}        
        
      when "my_follows_json"
        get_my_follows_json(format)
      
      when "my_hopes"
        format.html {render :my_hopes}
        
      when "my_hopes_json"
        get_my_hopes_json(format)
         
      when "my_comments"
        get_my_comments(format)
        
      when 'my_messages'
        format.html {render :my_messages}
      
      when 'new_messages_count'
        get_my_messages_count(format)
        
      when 'my_messages_json'
        
        get_my_messages_json(format)
      end
    end
  end
  
  private 
    def get_my_follows_json(format)
      if params[:limit]
         limit = params[:limit].to_i
         limit = 100 if limit > 100
       else
         limit = 50
       end

       if params[:skip]
         skip = params[:skip].to_i
       else
         skip = 0
       end
       
       follows = HopeFollow.where(:user_id => session[:user_id]).order_by([:created_at, -1]).limit(limit).skip(skip)
       
       # get hopes
       hope_ids = []
       follows.each do |follow|
         hope_ids << follow.hope_id
       end
       hopes = Hope.without(:contact, :image_ids, :follows).find(hope_ids)
       hopes_hash = {}
       hopes.each do |hope|
         hopes_hash[hope.id] = hope
       end
       
       format.json {render :json => {:success => true, :follows => follows, :hopes_hash => hopes_hash}}
    end
    
    def get_my_hopes_json(format)
      if params[:limit]
        limit = params[:limit].to_i
        limit = 100 if limit > 100
      else
        limit = 50
      end
      
      if params[:skip]
        skip = params[:skip].to_i
      else
        skip = 0
      end
      hopes = Hope.where(:user_id => session[:user_id]).order_by([:created_at, -1]).limit(limit).skip(skip).without(:contact, :image_ids).to_a
      
      # puts "-----------------------"
      # puts Hope.where(:user_id => session[:user_id]).order_by([:created_at, -1]).limit(limit).skip(skip).without(:contact, :image_ids).execute.explain
      # puts "-----------------------"

      format.json {render :json => {:success => true, :hopes => hopes}}
    end
    
    def get_my_comments(format)
      # get comments
      if params[:page]
        @page = params[:page].to_i
        @page = (@page < 1)? 1 : @page 
      else
        @page = 1
      end   
      # 
      @comments = HopeComment.where(:user_id => session[:user_id]).order_by([:created_at, -1]).limit(50).skip((@page - 1)*50).to_a
      # get comments count
      @comments_count = HopeComment.count(conditions: {user_id: session[:user_id]})
      # get ids
      hope_ids = []
      image_ids = []
      @comments.each do |comment|
        hope_ids << comment.hope_id
        (image_ids << comment.image_id) if comment.image_id
      end
      # get images
      @images_hash = {}
      if image_ids.size > 0
        images = HopeCommentImage.find(image_ids)
        
        images.each do |image|
          image_hash = {}
          image_hash[:mini_url] = image.image.url(:mini)
          image_hash[:medium_url] = image.image.url(:medium)
          image_hash[:sizes] = image.sizes

          @images_hash[image.id.to_s] = image_hash
        end
      end
      # get hopes
      @hopes_hash = {}
      if hope_ids.size > 0
        hopes = Hope.without(:body, :contact, :follows, :user_id, :image_ids).find(hope_ids.uniq)
        hopes.each do |hope|
          @hopes_hash[hope.id.to_s] = hope
        end
      end
      # format.json {render :json => {:success => true, :comments => @comments, :hopes_hash => @hopes_hash, :images_hash => @images_hash}}
      format.html {render :my_comments}
    end
    
    def get_my_messages_count(format)
      # get all follows
      follows = HopeFollow.where(:user_id => session[:user_id]).only(:hope_id)

      hope_ids = []
      follows.each do |follow|
        hope_ids << follow.hope_id
      end

      # get new messages count
      user = User.only(:new_messages_loaded_time).find(session[:user_id])
      new_messages_count = HopeUpdate.where({'hope_id' => {'$in' => hope_ids}, :top => true, 'created_at' => {'$gt' => user.new_messages_loaded_time}}).count
      # 
      # puts "-------------"
      # puts HopeUpdate.where({'hope_id' => {'$in' => hope_ids}, :top => true, 'created_at' => {'$gt' => user.new_messages_loaded_time}}).execute.explain
      # puts "-------------"
      
      format.json {render :json => {:success => true, :new_messages_count => new_messages_count}}
    end
  
    def get_my_messages_json(format)      
      # get all follows
      follows = HopeFollow.where(:user_id => session[:user_id]).only(:hope_id)
      
      hope_ids = []
      follows.each do |follow|
        hope_ids << follow.hope_id
      end
      
      # get updates
      if params[:limit]
        limit = params[:limit].to_i
        limit = 100 if limit > 100
      else
        limit = 50
      end
      
      last_message_create_time = params[:last_message_create_time]
      (last_message_create_time = Time.now.to_f) unless last_message_create_time
      
      if params[:skip]
        skip = params[:skip].to_i
      else
        skip = 0
      end
      user = User.find(session[:user_id])
      user.update_attribute(:new_messages_loaded_time, Time.now.to_f)
      hope_updates = HopeUpdate.where({'hope_id' => {'$in' => hope_ids},  :top => true, 'created_at' => {'$lt' => last_message_create_time}}).order_by([:created_at, -1]).limit(limit).to_a
      # hope_updates = HopeUpdate.any_in(hope_id: hope_ids}).order_by([:created_at, -1]).skip(skip).limit(limit).to_a
      # hope_updates = HopeUpdate.where({'created_at' => {'$lt' => last_message_create_time}, 'hope_id' => {'$in' => hope_ids}}).order_by([:created_at, -1])._addSpecial( "$maxScan" , 50 ).limit(limit).to_a
      # 
      # puts '-------------------'
      # puts HopeUpdate.any_in(hope_id: hope_ids}).order_by([:created_at, -1]).skip(skip).limit(limit).execute.explai
      # puts HopeUpdate.where({'hope_id' => {'$in' => hope_ids}, 'top' => true, 'created_at' => {'$lt' => last_message_create_time}}).order_by([:created_at, -1]).limit(limit).execute.explain
      # puts "-------------------"

      # MapReduce
      # map = "function(){emit(this, 1);}"
      # reduce = "function(){return 1;}"
      # res = HopeUpdate.collection.map_reduce(map, reduce, {:raw => true, :out => {:inline => 1}, 
      #       :query => {:hope_id => {'$in' => hope_ids}, :top => true, :created_at => {'$lt' => last_message_create_time}}, 
      #       :sort => [:created_at, -1], :limit => limit})
      # hope_updates_map = res.find().to_a
      # 
      # puts "-------------------"
      # puts res
      # puts "-------------------"
      # puts hope_updates_map
      # puts "-------------------"
      
      # get ids
      image_ids = []
      hope_ids = []
      hope_updates.each do |hope_update|
        hope_ids << hope_update.hope_id
        image_ids << hope_update.image_id if hope_update.image_id
      end
      # get updates images
      images_hash = {}
      if image_ids.size > 0
        images = HopeUpdateImage.find(image_ids)
        images.each do |image|
          image_hash = {}
          image_hash[:mini_url] = image.image.url(:mini)
          image_hash[:medium_url] = image.image.url(:medium)          
          image_hash[:mini_size] = image.sizes['mini']
        
          images_hash[image.id] = image_hash
        end
      end
      # get hopes
      hopes = Hope.without(:image_ids, :contact, :body, :follows, :image_ids).find(hope_ids.uniq)
      hopes_hash = {}
      hopes.each do |hope|
        hopes_hash[hope.id] = hope
      end
      
      format.json {render :json => {:success => true, :hopes_hash => hopes_hash, :hope_updates => hope_updates, :images_hash => images_hash}}
    end
    
end
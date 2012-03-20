class HopeFollowsController < ApplicationController
  
  def create
    respond_to do |format|
      # hope must be exist
      if hope = Hope.find(params[:hope_id]) 
        follow = HopeFollow.where(:hope_id => params[:hope_id], :user_id => session[:user_id]).limit(1)
        # unfollow before
        if follow.blank?
          follow = HopeFollow.new(:hope_id => params[:hope_id])
          follow.user_id = session[:user_id]
          if follow.save            
            format.json {render :json => {:success => true, :follow_id => follow.id}}
          else
            format.json {render :json => {:success => false, :errors => follow.errors}}
          end
        # followed  
        else
          format.json {render :json => {:success => false, :followed => true, :follow_id => follow[0].id}}
        end
      else
        format.json {render :json => {:success => false, :hope_does_not_exists => true}}
      end
    end
  end
  
  def destroy
    respond_to do |format|
      if (follow = HopeFollow.find(params[:id])) && (follow.user_id == session[:user_id]) && follow.destroy
        format.json {render :json => {:success => true}}
      else
        format.json {render :json => {:success => false}}    
      end
    end
  end
  
  def check_whether_followed
    respond_to do |format|
      if (hope_follows = HopeFollow.where(:hope_id => params[:hope_id], :user_id => session[:user_id]).to_a) && hope_follows.size > 0
        format.json {render :json => {:success => true, :follow_id => hope_follows[0].id}}
      else
        format.json {render :json => {:success => false}}        
      end
    end
  end 
    
  private

end
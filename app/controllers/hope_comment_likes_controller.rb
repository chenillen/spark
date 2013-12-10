class HopeCommentLikesController < ApplicationController
  
  def create
    respond_to do |format|
      # Hope comment must be exists
      if hope_comment = HopeComment.find(params[:hope_comment_id])
        like = HopeCommentLike.where(:hope_comment_id => params[:hope_comment_id], :user_id => session[:user_id]).limit(1)

        if like.blank?
          like = HopeCommentLike.new(:hope_comment_id => params[:hope_comment_id])
          like.user_id = session[:user_id]
          if like.save  
            format.json {render :json => {:success => true}}
          else
            format.json {render :json => {:success => false, :errors => like.errors}}  
          end
        # liked before  
        else
          format.json {render :json => {:success => false, :liked => true}}
        end
      else
        format.json {render :json => {:sucess => false, :hope_comment_does_not_exists => true}}
      end  
    end
  end

end
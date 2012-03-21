class ApplicationController < ActionController::Base
  
  before_filter :set_locale, :authorize
  protect_from_forgery

  def set_locale
    I18n.locale = request.preferred_language_from([:'zh-CN'])
  end

  def authorize
    #TODO: If user goto an correct url(like /users/2), which server can't handle it, it will raise error and don't back the changed session to client.
    # it will cause the user to relogin.
    if session[:watchdog_id] && (watchdog = Watchdog.find(session[:watchdog_id])) && (watchdog.user_id == session[:user_id])
      # timeout
      if watchdog_timeout?(watchdog)
        watchdog.delete
        need_login()
      # everything is ok. 
      elsif session[:token] == watchdog.token
        # To avoid token rush(a request doesn't go back yet and another request is coming).        
        # It is will always happen in the image uploading, the image is uploading and another request is coming that time.
        if rand(40) == 5
          new_token = Watchdog.new_token
          # update token
          if watchdog.update_attribute(:token, new_token)
            cookies[:expires_time] = Time.now.to_i + Constant::LOGIN_EXPIRES_TIME
            session[:token] = new_token
          # update token failure
          else
            need_login()
          end
        end
      # token isn't correct  
      else
        need_login()
      end
    #  
    else
      need_login()
    end
  end
  
  private
  
    def need_login
      session[:watchdog_id] = nil
      respond_to do |format|
        format.json {render :json => {:success => false, :need_login => true}}
        # when the client use iframe-post to upload files
        if params['iframe_post']
          format.html {render :json => {:success => false, :need_login => true}}
        else
          format.html {redirect_to "/login?source=#{request.url}"}        
        end
      end
    end
    
    def watchdog_timeout?(watchdog)
      if watchdog.remeber_me
        return true if (Time.now - watchdog.updated_at) > Constant::REMEMBER_ME_TIME
      else
        return true if (Time.now - watchdog.updated_at) > Constant::LOGIN_EXPIRES_TIME
      end
      
      return false
    end
  
end

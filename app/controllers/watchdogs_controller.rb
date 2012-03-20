require 'net/http'
require 'open_platforms/sina_weibo'

class WatchdogsController < ApplicationController
  skip_before_filter :authorize
  
  def new  
    if params['code']
      create
    else
      respond_to do |format|
        format.html
      end
    end
  end
  
  def create
    respond_to do |format|      
      # TODO: add other platforms
      if params['platform'] == 'SinaWeibo'
        user = login_with_sina_weibo()
        if user                    
          cookies[:expires_time] = Time.now.to_i + Constant::LOGIN_EXPIRES_TIME
          cookies[:username], cookies[:pid], cookies[:avatar_url], cookies[:avatar_size] = user.username, user.pid, user.avatar_url, user.avatar_size
          
          format.html {render :login_success}
        else
          format.html {render :login_failure}
        end
      else
        format.html {render :login_failure}        
      end
    end
  end
  
  def destroy
    respond_to do |format|
      if (dog = Watchdog.find(session[:watchdog_id])) && dog.destroy
        reset_user_info
        format.json {render :json => {:success => true}}
      else
        format.json {render :json => {:success => false}}  
      end
    end
  end
  
  private
    def login_with_sina_weibo
      res = OpenPlatforms::SinaWeibo.authenticate(params['code'])
      
      if res['uid'] && res['access_token']
        user_info = OpenPlatforms::SinaWeibo.get_user_info(res['access_token'], res['uid'])
        user_id = 'sw' + res['uid']
        
        watchdog = Watchdog.new_dog(session, user_id, false)
        
        return nil unless (user = User.find_or_create_by(:_id => user_id))
        if user.update_attributes(:platform => 'SinaWeibo', 
                                :username => user_info['screen_name'], :pid => res['uid'],
                                :user_url => 'http://www.weibo.com/' + (user_info['profile_url'] || ''), 
                                :avatar_url => user_info['profile_image_url'],
                                :large_avatar_url => user_info['avatar_large'],
                                :description => user_info['description'],
                                :verified => user_info['verified'],
                                :verified_reason => user_info['verified_reason'],
                                :allow_private_message => user_info['allow_all_act_msg'],
                                :access_token => res['access_token'],
                                :avatar_size => '50x50')   

          return user
        else
          return nil
        end  
      else
        return nil
      end
    end
    
    def reset_user_info
      cookies.delete :username
      cookies.delete :pid
      cookies.delete :avatar_url
      cookies.delete :avatar_size
      cookies.delete :expires_time
    end
  
end
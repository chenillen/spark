require 'open_platforms/abstract_platform'

module OpenPlatforms
  class SinaWeibo
    include AbstractPlatform
    API_URI = 'https://api.weibo.com/2'
    # TODO: testme when system try to handle errors with wrong uri
    ACCESS_TOKEN_URI = 'https://api.weibo.com/oauth2/access_token' 
    
    def self.authenticate(request_code)
      uri = URI.parse(ACCESS_TOKEN_URI)
      res = nil
      Net::HTTP.start(uri.host, uri.port, :use_ssl => true) do |http|
        req = Net::HTTP::Post.new(uri.path)
        req.set_form_data('client_id' => OPEN_PLATFORMS_CONFIG['sina_weibo']['client_id'], 
                          'client_secret' => OPEN_PLATFORMS_CONFIG['sina_weibo']['client_secret'], 
                          'grant_type' => 'authorization_code',
                          'code' => request_code,
                          'redirect_uri' => OPEN_PLATFORMS_CONFIG['sina_weibo']['register_url'])
        res = http.request req
      end
      
      return JSON.parse(res.body)
    end
    
    def self.get_user_info(access_token, uid)
      uri = URI.parse("https://api.weibo.com/2/users/show.json?uid=#{uid}&access_token=#{access_token}")
      res = nil
      Net::HTTP.start(uri.host, uri.port, :use_ssl => true) do |http|
        req = Net::HTTP::Get.new(uri.request_uri)
        res = http.request req
      end
      
      return JSON.parse(res.body)
    end
    
  end
end
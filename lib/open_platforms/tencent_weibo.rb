require 'open_platforms/abstract_platform'
require 'base64'
require 'hmac-sha1'

module OpenPlatforms
  class TencentWeibo
    include AbstractPlatform
    
    def self.authenticate(request_code)
      uri = URI.parse('https://open.t.qq.com/cgi-bin/oauth2/access_token')
      res = nil
      Net::HTTP.start(uri.host, uri.port, :use_ssl => true) do |http|
        req = Net::HTTP::Post.new(uri.path)
        req.set_form_data('client_id' => OPEN_PLATFORMS_CONFIG['tencent_weibo']['client_id'], 
                          'client_secret' => OPEN_PLATFORMS_CONFIG['tencent_weibo']['client_secret'], 
                          'grant_type' => 'authorization_code',
                          'code' => request_code,
                          'redirect_uri' => OPEN_PLATFORMS_CONFIG['tencent_weibo']['redirect_uri'] )
        res = http.request req
      end
      
      result = {}
      res.body.split("&").map{|value| value = value.split("="); result[value[0]] = value[1];}
      
      return result
    end
    
    def self.get_user_info(access_token, openid, openkey) 
      sig_uri = 'GET&' + URI.escape('/user/other_info') + '&' + URI.escape("appid=#{OPEN_PLATFORMS_CONFIG['tencent_weibo']['client_id']}&openid=#{openid}&openkey=#{openkey}&reqtime=#{Time.now.to_i}&wbversion=1")
      hmac = HMAC::SHA1.new(sig_uri)
      hmac.update(OPEN_PLATFORMS_CONFIG['tencent_weibo']['client_secret'])
      sig = URI.escape(Base64.encode64("#{hmac.digest}"))
      
      uri_str = "http://open.t.qq.com/api/user/other_info?format=json&appid=#{OPEN_PLATFORMS_CONFIG['tencent_weibo']['client_id']}&openid=#{openid}&openkey=#{openkey}&reqtime=#{Time.now.to_i}&wbversion=1&sig=#{sig}&fopenid=#{openid}"
      uri = URI.parse(uri_str)
      res = nil
      Net::HTTP.start(uri.host, uri.port, :use_ssl => false) do |http|
        req = Net::HTTP::Get.new(uri.request_uri)
        res = http.request req
      end
      
      return JSON.parse(res.body)['data']
    end
    
  end
end
module OpenPlatforms
  module AbstractPlatform
  
      def self.authenticate(platform, request_code)
        raise 'subclass must implement #authenticate method'
      end
  
      def self.get_user_info(access_token)
        raise "subclass must implement #get_user_info method"
      end

  end
end

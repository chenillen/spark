require 'eleven_helper/mongoid/timestamps/created_at'
require 'eleven_helper/mongoid/timestamps/updated_at'

module ElevenHelper
  module Mongoid
    module Timestamps
      extend ActiveSupport::Concern
      include CreatedAt
      include UpdatedAt
    end
  end
end
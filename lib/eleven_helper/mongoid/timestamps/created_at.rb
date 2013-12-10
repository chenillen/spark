# encoding: utf-8
module  ElevenHelper
  module Mongoid
    module Timestamps
      module CreatedAt
        extend ActiveSupport::Concern

        included do
          field :created_at, :type => Float
          set_callback :create, :before, :set_created_at, :if => :timestamping?
        end

        private        
          def set_created_at
            self.created_at = Time.now.to_f if !created_at
          end
      end
    end
  end

end
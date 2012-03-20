class HopeCommentImage
  include Mongoid::Document
  include Mongoid::Paperclip
  
  field :user_id, type: String
  field :sizes, type: Hash, default: {}
  field :be_used, type: Boolean, defaults: false
  has_mongoid_attached_file :image,
                            :hash_secret => "dakdmsadmkl3221mkdalsmdka21321dadsadale2132md",
                            :hash_data => ":class/:attachment/:id/:style/:updated_at",
                            :url => "/system/:class/:id/:style/:hash.:extension",
                            :whiny => false,
                            :convert_options => {:all => '-strip -sharpen 0x.6'},
                            :styles => {
                              :big => ['1200x1200>'],
                              :medium => ['800x800>'],
                              :small => ['400x400>'],
                              :mini => ['150x150>'],
                              :thum => ['50x50>']
                            }
  
  attr_accessible :image
  
  before_post_process :image_valid?
  after_post_process :store_image_dimension
  
  validates_presence_of :user_id,
                        :message => I18n.t('errors.messages.can_not_be_empty')
  validates_attachment_presence :image,
                                :message => I18n.t('errors.messages.image_can_not_be_empty')
  validates_attachment_size :image, 
                            :less_than => 5.megabytes,
                            :message => I18n.t('errors.messages.image_too_big', :count => 5)
  validates_attachment_content_type :image,
                                    :content_type => ['image/jpeg', 'image/png', 'image/gif', 'image/pjpeg', 'image/x-png'],
                                    :message => I18n.t('errors.messages.wrong_image_content_type')
                                    
  private
  
    # There is a error see https://github.com/thoughtbot/paperclip/issues/680
    def image_valid?
      valid?
      errors[:image_file_name].blank? && errors[:image_file_size].blank? && errors[:image_content_type].blank?
    end
  
    def store_image_dimension  
      # Attention
      # Be sure to check the image file exists or not, if the file doesn't exists, the application will stuck, and
      # everything is over!
      
      self.sizes = {}
      self.image.styles.each do |style_name, style|
        image_file = self.image.queued_for_write[style_name]
        if image_file
          self.sizes[style_name] = Paperclip::Geometry.from_file(image_file).to_s
        end
      end
    end
  
end
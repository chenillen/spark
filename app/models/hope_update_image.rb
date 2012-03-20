class HopeUpdateImage
  include Mongoid::Document
  include Mongoid::Paperclip
  
  #TODO: delete unused image if nesscerry(check update error).  
  field :be_used, type: Boolean, default: false
  field :sizes, type: Hash, default: {}
  field :user_id, type: String  
  has_mongoid_attached_file :image,
                            :hash_secret => "damdsadcdsad,ls*@&32ndjksandjksandj",
                            :hash_data => ":class/:attachment/:id/:style/:updated_at",
                            :url => "/system/:class/:id/:style/:hash.:extension",
                            :whiny => false,
                            :convert_options => {:all => '-strip -sharpen 0x.6'},
                            :styles => {
                              :original => ['2000x2000>', :jpg],
                              :big => ['1200x1200>', :jpg],
                              :medium => ['800x800>', :jpg],
                              :small => ['400x400>', :jpg],
                              :mini => ['150x150>', :jpg],
                              :thum => ['60x60>', :jpg]
                            }
  
  attr_accessible :image
  
  validates_attachment_presence :image,
                                :message => I18n.t('errors.messages.image_can_not_be_empty')
  validates_attachment_size :image, 
                            :less_than => 5.megabytes,
                            :message => I18n.t('errors.messages.image_too_big', :count => 5)
  validates_attachment_content_type :image,
                                    :content_type => ['image/jpeg', 'image/png', 'image/gif', 'image/pjpeg', 'image/x-png'],
                                    :message => I18n.t('errors.messages.wrong_image_content_type')
  validates_presence_of :user_id,
                        :message => I18n.t('errors.messages.can_not_be_empty')
 
  before_post_process :image_valid?
  after_post_process :store_image_dimension                      
  
  private
    
    def image_valid?
      valid?
      errors[:image_file_name].blank? && errors[:image_file_size].blank? && errors[:image_content_type].blank?
    end
    
    def store_image_dimension  
      # Attention
      # Be sure to check the image file exists or not, if the file doesn't exists, the application will stuck, and
      # everything is over!
      
      # mongoid set default value before save
      # if the new instance doesn't set value, the field will set to be nil
      self.sizes = {}
      self.image.styles.each do |style_name, style|
        image_file = self.image.queued_for_write[style_name]
        if image_file
          self.sizes[style_name] = Paperclip::Geometry.from_file(image_file).to_s
        end
      end
    end
  
end
module ApplicationHelper  
  
  # TODO: testme
  def spark_time(time)
    Time.zone = ActiveSupport::TimeZone.new(Constant::TIMEZONE)   
    
    time = Time.at(time).in_time_zone
    
    now = Time.now.in_time_zone
    
    min = time.min
    sec = time.sec
    
    (min = '0' + min.to_s) if min < 10
    (sec = '0' + sec.to_s) if sec < 10
    
    res = time.month.to_s + '-' + time.day.to_s + ' ' + time.hour.to_s + ':' + min.to_s + ':' + sec.to_s
    if time.year != now.year
      res = time.year.to_s + '-' + res
    end
    
    return res
  end
  
  def spark_time2(time)
    Time.zone = ActiveSupport::TimeZone.new(Constant::TIMEZONE)        
    
    time = Time.at(time).in_time_zone
    
    seconds = Time.now.to_i - time.to_i
    
    # less than 1 minute
    if seconds < 60
      return I18n.t('date.count_seconds_ago', :count => seconds)
    # less than 1 hour
    elsif seconds < 3600
      return I18n.t('date.count_minutes_ago', :count => seconds/60)
    # less than 1 day
    elsif seconds < 86400
      return I18n.t('date.count_hours_ago', :count => seconds/3600)
      
    #   less than one week
  	# 	People don't know the meaning of '20 days ago' or '15 days ago', but they know the meaning of '3 days ago' or '6 days ago',
  	#  beacuse they can measure it by week.
  	#  less than one week      
    elsif seconds < 604800
      return I18n.t('date.count_days_ago', :count => seconds/86400)
    #   larger than 1 week
    else
      return spark_time(time)
    end
  end

  def perfect_mini(size, image_length)
    size = size.map{|length| length.to_f}
    
    if (size[0] >= size[1])
			if size[0] > image_length
				size[1] *= image_length/size[0]
				size[0] = image_length
			end
		else
			if size[1] > image_length
				size[0] *= image_length/size[1]
				size[1] = image_length
			end
		end
		
		return size
  end

end

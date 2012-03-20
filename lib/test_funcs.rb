class TestFuncs
  def self.create_hopes
    hope = Hope.first
    
    for i in 1..100000
      new_hope = Hope.new(:title => i.to_s + hope.title, :body => hope.body)
      new_hope.user_id = hope.user_id
      new_hope.save
    end
  end
  
  def self.create_updates
    hopes = Hope.limit(1000).order_by([:follows, -1]).to_a
    # random create 50 follows  
    for i in 1..50
      follow_hope = hopes[rand(1000)]
      hope_follow = HopeFollow.new(:hope_id => follow_hope.id.to_s)
      hope_follow.user_id = follow_hope.user_id
      hope_follow.save
    end
    
    count = 0
    hopes.each do |hope|
      for i in 1..200
        hope_update = HopeUpdate.new(:hope_id => hope.id.to_s, :body => count)
        hope_update.user_id = hope.user_id
        hope_update.save
        
        count += 1
      end
    end
  end
end
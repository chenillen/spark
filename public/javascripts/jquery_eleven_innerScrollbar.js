/*
	jquery scroller
	dependencies: jquery ui(draggable), jquery.corner,  
	created by: Eleven Huang 2011.10.26 at xiangshan Beijing
	
*/

(function($) {
	$.fn.eleven_innerScrollbar = function(options) {
		var defaults = {
			// the scrollbar position(left, top, right, bottom)
			position: 'right',
			// scrollbar color
			color: 'black',
			// scrollbar size
			size: '12px',
			// scrollbar opacity
			opacity: 0.7
		};
		options = $.extend({}, defaults, options);
		
		return this.each(function(){
			var $this = $(this);
			var $target = options.target;
			
			$this.css('overflow', 'hidden');
			var $scroll = $("<div class='jquery_eleven_scroll' style='position: absolute;" + options.position+ ": 0px;'></div>");
			var $scrollbar = $("<div class='jquery_eleven_scrollbar' style='curosr: pointer; opacity: " + options.opacity + "; position: absolute; background-color:" + options.color + ";'></div>");			
			$scrollbar.appendTo($scroll); 
			$scroll.appendTo($this);
			
			options.position = options.position.toLowerCase();     
			if (options.position === 'right' || options.position === 'left') {
				$scroll.css({'height' : $this.css('height'), 'width' : options.size});
				var this_height = parseFloat($this.css('height'));
				var target_height = parseFloat($target.css('height'));
								
				var scrollbar_height = this_height*(this_height/target_height);
				if (scrollbar_height >= this_height ) {
					$scroll.hide();
				} else {
					// target at wrong position
					if (parseFloat($target.css('top')) > 0) $target.css('top', '0px');
					
					$scrollbar.css({'top' : parseFloat(target.css('top'))*(target_height/this_height) + 'px', 'height' : scrollbar_height, 'width' : $scroll.css('width')});   
					$scrollbar.corner();
					
					$scrollbar.draggable({
						axis: 'y',
						containment: 'parent',						
						drag: function(event, ui) {
                        	$target.css('top', -parseFloat($scrollbar.css('top'))*(target_height/this_height));
						}
					});
				};
			} else if(options.position === 'top' || options.position === 'bottom') {
				$scroll.css({'width' : $this.css('width'), 'height' : options.size});
				var this_width = parseFloat($this.css('width'));
				var target_width = parseFloat($target.css('width'));
								                                
				var scrollbar_width = this_width*(this_width/target_width);
				if (scrollbar_width >= this_width) {                        
					$scroll.hide();
				} else {
					// target at wrong position
					if (parseFloat($target.css('left')) > 0) $target.css('left', '0px');
					
					$scrollbar.corner(options.size);
					$scrollbar.css({'top' : '0px', 'left': -parseFloat($target.css('left'))*(target_width/this_width) + 'px', 'width' : scrollbar_width, 'height' : $scroll.css('height')});
					
					$scrollbar.draggable({
						axis: 'x',
						containment: 'parent',
						drag: function(event, ui) {
							$target.css('left', -parseFloat($scrollbar.css('left'))*target_width/this_width);
						}
					});
					
				};
			};
						
		});
	};
})(jQuery);
$(function() {
	// $('#header').css({'display' : 'none'});
	
	// $('#hope_logo').corner();
	var $hopes_show = $('#hopes_show');
	var $autoload_hopes_mark = $hopes_show.siblings('#autoload_hopes_mark');
	// var happy_hope_count = -1;
	// function happy_to_show() {
	// 	var $this = $(this);
	// 	var hope_show_boxes = $hopes_show.children();
	// 	
	// 	for (var i=happy_hope_count + 1; i < hope_show_boxes.length; i++) {
	// 		// alert(happy_hope_count)
	// 		var $hope_show_box = $(hope_show_boxes[i]);
	// 		if ($hope_show_box.offset().top < $this.height() + $this.scrollTop()) {
	// 			// $hope_show_box.css('letter-spacing', '0');				
	// 			$hope_show_box.animate({'color' : 'black'});
	// 			// $hope_show_box.children('.hope_sad').text(':)');
	// 			$hope_show_box.children('.hope_image_box').children('.hope_image_shielding').fadeOut(1500);
	// 			// $hope_show_box.children('.hope_body').animate({'width' : '572px'});
	// 			happy_hope_count = i;
	// 		} else {
	// 			return false;
	// 		};
	// 	};
	// 	
	// 	return true;
	// }
	
	var $autoload_hopes_tools = $hopes_show.siblings('#autoload_hopes_tools');
	var loading_hopes_complete = true;
	
	function get_hopes(limit) {
		var $window = $(window);
		
		hopes_limit = parseInt(($window.height() + $window.scrollTop() - $autoload_hopes_mark.offset().top)/89, 10) + 10;
		limit = (limit > hopes_limit)? limit : hopes_limit;
		skip = $hopes_show.children().length;
		
		$autoload_hopes_tools.children('#loading_hopes_box').show();
		$autoload_hopes_tools.children('#retry_loading_hopes_box').hide();
		loading_hopes_complete = false;
		
		$.ajaxQueue({
			url: '/index/get_hopes?limit=' + limit + '&skip=' + skip,
			type: 'GET',
			dataType: 'json',
			success: function(response) {
				if (response.success) {
					$autoload_hopes_tools.children('#loading_hopes_box').hide();
					
					var hopes = response.hopes;
					var images_hash = response.images_hash;
					var $hope_show_box_original = $hopes_show.parent().siblings('#hope_show_box_original');	
									
					for (var i=0; i < hopes.length; i++) {
						var $hope_show_box_copy = $hope_show_box_original.clone(true, true);
						// var $hope_body_show = $hope_show_box_copy.children('.hope_body_show');
						var hope = hopes[i];
						
						$hope_show_box_copy.attr('href', '/hopes/' + hope['_id']);
						$hope_show_box_copy.children('.hope_title').text(hope.title);
						// set image
						if (hope.image_ids.length > 0) {
							var image = images_hash[hope.image_ids[0]];
							var size = perfect_mini(image["mini_size"].split("x"), 119);
							var $hope_image = $hope_show_box_copy.children('.hope_image');						
							
							$hope_image.attr('src', image["mini_url"]);
							$hope_image.css({'width' : size[0] + 'px', 'height' : size[1] + 'px', 'margin-left' : (119 - size[0])/2 + 'px', 'display' : 'block'});
							
							$hope_show_box_copy.children('.hope_body').width(573);							
						};
						$hope_show_box_copy.children('.hope_body').text(hope.body.substr(0, 200) + '.....');
						
						$hope_show_box_copy.attr('id', null);
						$hope_show_box_copy.appendTo($hopes_show);
					};
				} else {
						$autoload_hopes_tools.children('#loading_hopes_box').hide();
						$autoload_hopes_tools.children('#retry_loading_hopes_box').show();
				};
			},
			error: function() {
				$autoload_hopes_tools.children('#loading_hopes_box').hide();
				$autoload_hopes_tools.children('#retry_loading_hopes_box').show();
			},
			complete: function() {
				loading_hopes_complete = true;
			}
		});
	}
	
	$('#retry_loading_hopes_action').on('click', function(event) {
		get_hopes(25);
		
		event.stopPropagation();
	});
	
	$(window).on('scroll', function() {
		var $window = $(this);
		if (($window.height() + $window.scrollTop() - $autoload_hopes_mark.offset().top) > 0) {
			if (loading_hopes_complete) {
				get_hopes(25);
			};
		};
	});
		
	get_hopes(25);
});

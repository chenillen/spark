$(function() {
	
	$('.update_image').fancybox({
		openEffect: 'none',
		closeEffect: 'none',
		type: 'image',
		closeClick: true,
		padding: 0,
		closeBtn: false,
		// closeSpeed: 'slow',
		helpers : {
			overlay : null
		},
		// closeSpeed: 'normal',					
		tpl: {
			error: '<p class="fancybox-error">' + tr("The picture can't be loaded, please try again later.") +'</p>'
		}
	});
	
	$('#user_home_menu').children('#my_messages').css('color', 'gray');
	
	var $autoload_messages_mark = $('#autoload_messages_mark');
	
	var loading_messages_complete = true;
	var last_message_create_time;
	function load_messages(limit) {
		var $window = $(window);
		var $my_messages_show = $autoload_messages_mark.siblings('#my_messages_show');
		var $autoload_messages_tools = $my_messages_show.siblings('#autoload_messages_tools');
		
		$autoload_messages_tools.children('#loading_messages_box').show();
		$autoload_messages_tools.children('#retry_loading_messages_box').hide();
		loading_messages_complete = false;
				
		messages_limit = parseInt(($window.height() + $window.scrollTop() - $autoload_messages_mark.offset().top)/80, 10) + 10;
		limit = (limit > messages_limit)? limit : messages_limit;
		
		var url = '/home?reading=my_messages_json&limit=' + limit + '&skip=' + $my_messages_show.children().length; 
		if (last_message_create_time) {
			url = url + '&last_message_create_time=' + last_message_create_time;
		};
		$.ajaxQueue({
			url:  url,
			dataType: 'json',
			type: 'GET',
			success: function(response) {
				if (response.success) {
					var $my_message_show_box_original = $autoload_messages_mark.siblings('#my_message_show_box_original');
					var hopes_hash = response.hopes_hash;
					var hope_updates = response.hope_updates;
					var images_hash = response.images_hash;
					
					$autoload_messages_tools.children('#loading_messages_box').hide();
					
					for (var i = 0; i < hope_updates.length; i++) {
						var $my_message_show_box_copy = $my_message_show_box_original.clone(true, true);
						var $update_show_box = $my_message_show_box_copy.children('.update_show_box');
						var hope_update = hope_updates[i];
						var hope = hopes_hash[hope_update.hope_id];
						if (hope) {
							var $update_body = $update_show_box.children('.update_body');
							var $update_image = $update_show_box.children('.update_image');
							$update_body.text(hope_update.body);
							// set image
							if (hope_update.image_id) {
								var image = images_hash[hope_update.image_id];
								var size = perfect_mini(image.mini_size.split("x"), 110);
								var $update_image_small = $update_image.children('.update_image_small');

								$update_image.attr('href', image.medium_url);
								$update_image.css('margin-left', (110 - size[0])/2 + 'px');
								$update_image_small.attr('src', image.mini_url);
								$update_image_small.css({
									'width' : size[0] + 'px',
									'height' : size[1] + 'px'
								});
								$update_body.width(582);
								
							} else {
								$update_body.css('width', '100%');
								$update_image.css('display', 'none');
							};

							$my_message_show_box_copy.children('.my_message_hope_title').text(hope.title);
							$my_message_show_box_copy.children('.my_message_hope_title').attr('href', '/hopes/' + hope['_id']);
							$my_message_show_box_copy.children('.my_message_updated_at').text(global_date_by_second2(hope_update.created_at));					

							$my_message_show_box_copy.attr('id', null).appendTo($my_messages_show);	
						};
						if (hope_updates.length > 0) {
							last_message_create_time = hope_updates[hope_updates.length -1].created_at;
						};
					}
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							load_messages(limit);
						}, tr('Your session was timeout, please re-login'));
					} else {
						$autoload_messages_tools.children('#loading_messages_box').hide();
						$autoload_messages_tools.children('#retry_loading_messages_box').show();
					};
				};
			},
			error: function() {
				$autoload_messages_tools.children('#loading_messages_box').hide();
				$autoload_messages_tools.children('#retry_loading_messages_box').show();
			},
			complete: function() {
				loading_messages_complete = true;
			}
		});
	}
	
	$('#retry_loading_messages_action').on('click', function(event) {
		load_messages(25);
		
		event.stopPropagation();
	});
	
	$(window).on('scroll', function() {
		var $window = $(this);
		if (($window.height() + $window.scrollTop() - $autoload_messages_mark.offset().top) > 0) {
			if (loading_messages_complete) {
				load_messages(25);
			};
		};
	});
	
	load_messages(25);
});
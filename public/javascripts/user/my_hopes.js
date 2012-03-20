$(function() {
	var $my_creates_show = $('#my_creates_show');
	var $autoloading_hopes_mark = $my_creates_show.siblings('#autoloading_hopes_mark');
	var $hope_updates = $('#hope_updates');
	var $hope_updates_context = $hope_updates.children('#hope_updates_context');
	var $hope_updates_box = $hope_updates_context.children('#hope_updates_box');
	var $window = $(window);
	
	$('#user_home_menu').children('#my_hopes').css('color', 'gray');
	
	var loading_hopes_complete = true;
	var all_hopes_loaded = false;
	function loading_hopes(limit) {
		
		if (all_hopes_loaded) {
			return;
		};
		hopes_limit = parseInt(($window.height() + $window.scrollTop() - $autoloading_hopes_mark.offset().top)/100, 10) + 10;
		limit = (limit > hopes_limit)? limit : hopes_limit;
		
		var $loading_hopes_tools = $my_creates_show.siblings('#loading_hopes_tools');
		$loading_hopes_tools.children('#loading_hopes_box').show();
		$loading_hopes_tools.children('#loading_hopes_retry_box').hide();
		
		loading_hopes_complete = false;
		$.ajaxQueue({
			url: '/home?reading=my_hopes_json&limit=' + limit + '&skip=' + $my_creates_show.children().length,
			type: 'GET',
			dataType: 'JSON',
			success: function(response) {
				if (response.success) {
					$loading_hopes_tools.children('#loading_hopes_box').hide();
					
					var $my_create_hope_box_original = $my_creates_show.siblings('#my_create_hope_box_original');					
					var hopes = response.hopes;
					for(var i = 0; i < hopes.length; i++) {
						var hope = hopes[i];
						var $my_create_hope_box_copy = $my_create_hope_box_original.clone(true, true);
						
						$my_create_hope_box_copy.attr('id', null);
						$my_create_hope_box_copy.children('.mc_hope_id').text(hope['_id']);
						$my_create_hope_box_copy.children('.mc_hope_title').text(hope['title']);
						$my_create_hope_box_copy.children('.mc_hope_title').attr('href', '/hopes/' + hope['_id']);
						$my_create_hope_box_copy.children('.mc_hope_body').text(hope['body'].substring(0, 200) + '.....');
						
						// set timestamp
						var $mc_time = $my_create_hope_box_copy.children('.mc_time');
						var create_time = global_date_by_string(hope.created_at);
						var update_time = global_date_by_string(hope.updated_at);
						
						$mc_time.children('.mc_hope_created_at').text(create_time);
						
						if (create_time !== update_time) {
							$mc_time.children('.mc_hope_updated_at').text(update_time);
						} else {
							$mc_time.children('.mc_hope_updated_at').css('display', 'none');							
						};
						
						// set follows
						if (hope.follows > 0) {
							$mc_time.siblings('.mc_hope_split').css('display', 'block');
							$mc_time.siblings('.mc_hope_followers').text(tr('&1 followers', hope.follows)).css('display', 'block');
						};
						
						$my_create_hope_box_copy.appendTo($my_creates_show);
					}
					
					if (hopes.length < limit) {
						all_hopes_loaded = true;
					};
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							loading_hopes(limit);
						}, tr('Your session was timeout, please re-login'));
					} else {
						$loading_hopes_tools.children('#loading_hopes_box').hide();
						$loading_hopes_tools.children('#loading_hopes_retry_box').show();
					};
				};
			},
			error: function() {
				$loading_hopes_tools.children('#loading_hopes_box').hide();
				$loading_hopes_tools.children('#loading_hopes_retry_box').show();
			},
			complete: function() {
				loading_hopes_complete = true;
			}
		});
	}
	
	$('#hope_loading_retry_prompt_action').on('click', function(event) {
		loading_hopes(25);
		
		event.stopPropagation();
	});
	
	$window.on('scroll', function(){
		if (($window.height() + $window.scrollTop() - $autoloading_hopes_mark.offset().top) > 0) {
			if (loading_hopes_complete) {
				loading_hopes(25);	
			};
		};
	})
	// $('.mc_hope_title').on('click', function(event) {
	// 	// TODO: testme on ie and firefox
	// 	window.location.href = '/hopes/' + $(this).siblings('.mc_hope_id').text();
	// 	
	// 	event.stopPropagation();
	// });
	
	$('.mc_edit').on('click', function(event) {
		window.location.href = '/hopes/' + $(this).parent().siblings('.mc_hope_id').text() + '/edit';
		
		event.stopPropagation();
	});

	$('.mc_update').on('click', function(event) {
		var $this = $(this);
		
		$hope_updates.appendTo($('body'));
		$hope_updates.height($(document).height());
		$hope_updates.width($(document).width());
		$hope_updates_box.css('margin-top', $(window).scrollTop() + 70 + 'px');		
		$hope_updates.fadeIn();
		
		$hope_updates_box.children('#hope_update_textarea').val('').focus();
		
		event.stopPropagation();
	});
	
	$('.mc_finish').on('click', function(event) {
		var $this = $(this);
		
		$this.hide();
		
		$.ajaxQueue({
			url: '/hopes/finish',
			type: 'POST',
			dataType: 'json',
			data: {'id' : $this.parent().siblings('.mc_hope_id').text()},
			success: function(response) {
				if (response.success) {
					if ($this.text() === tr('Finish')) {
						$this.text(tr('Finished'));
						$this.css('color', 'gray');
					} else {
						$this.text(tr('Finish'));
						$this.css('color', 'black');
					};
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							$this.click();
						}, tr('Your session was timeout, please re-login'));
					};
				};
			},
			complete: function() {
				$this.show();
			}
		});
		
		event.stopPropagation
	});
	
	$('#hope_updates_box_exit').on('click', function(event) {
		$hope_updates.fadeOut();
		
		event.stopPropagation();
	});
	
	function delete_my_hope($this) {
		$this.hide();
		$.ajaxQueue({
			url: '/hopes/' + $this.parent().siblings('.mc_hope_id').text(),
			dataType: 'json',
			type: 'POST',
			data: {"_method" : 'DELETE'},
			success: function(response) {
				if (response.success) {
					$this.parent().parent().slideUp().queue(function() {
						$(this).remove();
					});
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							delete_my_hope($this);
						}, tr('Your session was timeout, please re-login'));
					};
				};
			},
			complete: function() {
				$this.show();
			}
		});
	}
	
	$('.mc_delete').on('click', function(event) {
		var $this = $(this);
		if (confirm(tr('Are you sure to delete this hope?'))) {
			delete_my_hope($this);
		};
		
		event.stopPropagation();
	});
	
	$('.hope_update_image_file').on('change', function(event) {
		var $this = $(this);
		
		var image_name = $this.val().split("\\").pop();
		var extension = image_name.split(".").pop().toLowerCase();
		
		if ($.inArray(extension, ['jpg', 'jpeg', 'jpe', 'png', 'gif']) > -1) {
			var $hope_update_image_func = $this.parent().parent();
			var $hope_update_image_upload_box = $hope_update_image_func.siblings('.hope_update_image_upload_box');
			var $hope_update_uploaded_image_remove = $hope_update_image_upload_box.children('.hope_update_uploaded_image_remove');
			$this.parent().submit();
			
			$hope_update_image_func.hide();
			$hope_update_image_func.siblings('.hope_update_image_prompt').hide();
			$hope_update_image_upload_box.show();
			$hope_update_image_upload_box.children('.hope_update_image_uploading').show();
			$hope_update_uploaded_image_remove.css({'right' : '-6px', 'top' : '-4px'});
			$hope_update_uploaded_image_remove.show();
		} else {
			alert(tr('please upload picture with jpg, gif or png format'));
		}
		
		event.stopPropagation();
	});
	
	var $uploading_target = null;
	var image_uploading = false;
	$('.hope_update_image_form').iframePostForm({
		iframeID: 'hope_update_image_iframe',
		json: true,
		post: function() {
			$uploading_target = $(this);
			$uploading_target.parent().siblings('.hope_update_image_cancled').text(false);
			image_uploading = true;
			
			return true;
		},
		complete: function(response) {
			var $hope_update_image_func = $uploading_target.parent();
			// set it before reading response
			image_uploading = false;
			// TODO: add error option for iframePostForm
			if (response.success) {
				
				// user hadn't cancle the upload
				if ($hope_update_image_func.siblings('.hope_update_image_cancled').text() != 'true') {

					var $hope_update_image_upload_box = $hope_update_image_func.siblings('.hope_update_image_upload_box');
					var $hope_update_uploaded_image = $hope_update_image_upload_box.children('.hope_update_uploaded_image');

					$hope_update_image_upload_box.children('.hope_update_image_uploading').hide();
					$hope_update_image_upload_box.siblings('.hope_update_image_id').text(response.id);
					$hope_update_uploaded_image.attr('src', response.thum_url);
					
					var thum_size = perfect_mini(response.thum_size.split("x"), 32);
					$hope_update_uploaded_image.css({
						'width' : thum_size[0] + 'px',
						'height' : thum_size[1] + 'px',
						'left' : (32 - thum_size[0])/2 + 'px',
						'top' : (32 - thum_size[1])/2 + 'px'
					});
					
					$hope_update_uploaded_image.siblings('.hope_update_uploaded_image_remove').css({
						'right' : (32 - thum_size[0])/2 - 8 + 'px',
						'top' : (32 - thum_size[1])/2 - 8 + 'px'
					});

					$hope_update_uploaded_image.show();				
				};
			} else {
				if (response.need_login) {
					user_login.try_to_login(function() {
						$uploading_target.submit();
					}, tr('Your session was timeout, please re-login'));
				} else {
					if ($hope_update_image_func.siblings('.hope_update_image_cancled').text() != 'true') {
						var $hope_update_image_uploading = $hope_update_image_func.siblings('.hope_update_image_upload_box').children('.hope_update_image_uploading');

						alert(response.error);

						$hope_update_image_uploading.hide();
						$hope_update_image_func.find('.hope_update_image_file').attr('value', null);
						$hope_update_image_func.show();
						$hope_update_image_uploading.parent().siblings('.hope_update_image_prompt').show();
						$hope_update_image_uploading.siblings('.hope_update_uploaded_image_remove').hide();	
					};
				};
			};
		}
	});
	
	function remove_uploaded_image($hope_update_image_upload_box) {
		var $hope_update_uploaded_image = $hope_update_image_upload_box.children('.hope_update_uploaded_image');
		var $hope_update_image_func =  $hope_update_image_upload_box.siblings('.hope_update_image_func');

		image_uploading = false;
		
		$hope_update_image_upload_box.siblings('.hope_update_image_id').text('');
		$hope_update_image_upload_box.hide();		
		$hope_update_image_func.find('.hope_update_image_file').attr('value', null);
		
		$hope_update_uploaded_image.attr('src', null);
		$hope_update_uploaded_image.hide();
		$hope_update_image_upload_box.children('.hope_update_uploaded_image_remove').hide();
		
		$hope_update_image_upload_box.siblings('.hope_update_image_prompt').show();
		$hope_update_image_func.show();
	}
	
	$('.hope_update_uploaded_image_remove').on('click', function(event) {
		var $this = $(this);
		var $hope_update_image_uploading = $this.siblings('.hope_update_image_uploading');
		var $hope_update_image_upload_box = $this.parent();
		var $hope_update_image_func = $hope_update_image_upload_box.siblings('.hope_update_image_func');

		if ($hope_update_image_uploading.is(':visible')) {
			$this.hide();
			$hope_update_image_upload_box.siblings('.hope_update_image_cancled').text(true);			
			$hope_update_image_uploading.hide();
			$hope_update_image_func.find('.hope_update_image_file').attr('value', null);
			$hope_update_image_func.show();
			$hope_update_image_uploading.parent().siblings('.hope_update_image_prompt').show();			
		} else {
			$.ajaxQueue({
				url: '/hopeUpdateImages/' + $hope_update_image_upload_box.siblings('.hope_update_image_id').text(),
				type: 'POST',
				dataType: 'json',
				data: {'_method' : 'DELETE'},
				success: function(response) {
					if (response.success) {
						remove_uploaded_image($hope_update_image_upload_box);
												
					} else {
						if (response.need_login) {
							user_login.try_to_login(function() {
								$this.click();
							}, tr('Your session was timeout, please re-login'));
						} else {
							$this.show();
						};
					};
				}
			});
		};
	
		event.stopPropagation();
	});
	
	$('.hope_update_textarea').on('textchange', function(event) {
		var $this = $(this);
		var $hope_update_textarea_count = $(this).siblings('.hope_update_textarea_count');
		var remain_word_count = 300 - $this.val().length;
		
		$hope_update_textarea_count.text(remain_word_count);
		
		if (remain_word_count < 0) {
			$hope_update_textarea_count.css('color', 'red');
			$this.css('border-color', 'red');
		} else {
			$this.css('border-color', 'gray');			
			$hope_update_textarea_count.css('color', 'gray');			
		};
		
		event.stopPropagation();
	});
	
	function create_hope_update_show(hope_update, image, $hope_update_show_copy) {
		var $hope_update_image = $hope_update_show_copy.find('img.hope_update_image');
		var $hope_update_body = $hope_update_image.siblings('.hope_update_body');
		
		
		$hope_update_show_copy.children('.hope_update_id').text(hope_update['_id']);
		$hope_update_show_copy.children('.hope_update_created_at').text(global_date_by_second(hope_update.created_at));
		$hope_update_body.text(hope_update.body);
		
		if (hope_update.image_id) {
			var image_size = perfect_mini(image.sizes['mini'].split("x"), 100);

			$hope_update_image.attr('src', image.mini_url);
			$hope_update_image.css({'width' : image_size[0] + 'px', 'height' : image_size[1] + 'px', 'margin-left' : (100 - image_size[0])/2 + 'px', 'display' : 'block'});
			
			$hope_update_body.css('width', '498px');
		} else {
			$hope_update_body.css('width', '100%');
		};
		
		$hope_update_show_copy.attr('id', null);
		
		return $hope_update_show_copy;
	}
	
	$('.hope_update_add').on('click', function(event) {
		
		if (image_uploading) {
			return false;
		};
		
		var $this = $(this);
		var $hope_update_textarea = $this.parent().siblings('.hope_update_textarea');
		var $hope_update_image_id = $this.siblings('.hope_update_image_tool').children('.hope_update_image_id');
		var body = $hope_update_textarea.val();
		if (body.length > 300 || body.length == 0) {
			$hope_update_textarea.css('border-color', 'red');
			
			return false;
		} else {
			$this.hide();
			$.ajaxQueue({
				url: '/hopeUpdates',
				type: 'POST',
				dataType: 'json',
				data: {'hope_update[body]' : body, 'hope_update[hope_id]' : $this.parents('.my_create_hope_box').children('.mc_hope_id').text(), 'hope_update[image_id]' : $hope_update_image_id.text()},
				success: function(response) {
					if (response.success) {
						var hope_update = response.hope_update;
						
						var $hope_updates_show = $hope_update_textarea.siblings('.hope_updates_show');
						var $hope_update_show_copy = create_hope_update_show(response.hope_update, response.image, $('#hope_update_show_original').clone(true, true));
						var $hope_update_image_upload_box = $hope_update_image_id.siblings('.hope_update_image_upload_box');
						
						$hope_update_show_copy.css('display', 'none');
						if ($hope_updates_show.children().length > 0) {
							$hope_update_show_copy.insertBefore($hope_updates_show.children()[0]);
						} else {
							$hope_update_show_copy.appendTo($hope_updates_show);
						};
						$hope_update_show_copy.slideDown();
						
						$hope_update_textarea.val('');
						$hope_update_textarea.siblings('.hope_update_textarea_count').text(300);
						
						remove_uploaded_image($hope_update_image_upload_box);
					} else {
						if (response.need_login) {
							user_login.try_to_login(function() {
								$this.click();
							}, tr('Your session was timeout, please re-login'));
						};
					};
				},
				complete: function() {
					$this.show();
				}
			});
		};
		
		event.stopPropagation();
	});
	
	function loading_updates($hope_updates_loading_box) {
		var skip = $hope_updates_loading_box.parent().siblings('.hope_updates_show').children().length;
		var limit = 10;
		
		$hope_updates_loading_box.show();
		$hope_updates_loading_box.siblings('.hope_updates_loading_retry_box').hide();
		$hope_updates_loading_box.siblings('.hope_updates_loading_more').hide();
		
		$.ajaxQueue({
			url: '/hopeUpdates?sort=-1&limit=' + limit + '&skip=' + skip + '&hope_id=' + $hope_updates_loading_box.parents('.my_create_hope_box').children('.mc_hope_id').text(),
			type: 'GET',
			dataType: 'json',
			success: function(response) {
				if (response.success) {
					var $hope_updates_show = $hope_updates_loading_box.parent().siblings('.hope_updates_show');
					var $hope_update_show_original = $('#hope_update_show_original');
					var hope_updates = response.hope_updates;
					var images_hash = response.images_hash;
					
					for (var i=0; i < hope_updates.length; i++) {
						var hope_update = hope_updates[i];
						var $hope_update_show_copy = create_hope_update_show(hope_update, images_hash[hope_update.image_id], $hope_update_show_original.clone(true, true));
						
						$hope_update_show_copy.appendTo($hope_updates_show);						
					};

					$hope_updates_loading_box.hide();
					if (hope_updates.length >= limit) {
						$hope_updates_loading_box.siblings('.hope_updates_loading_more').show();
					}
					
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							loading_updates($hope_updates_loading_box);
						}, tr('Your session was timeout, please re-login'));
					} else {
						$hope_updates_loading_box.hide();
						$hope_updates_loading_box.siblings('.hope_updates_loading_retry_box').show();
					};
				};
			},
			error: function() {
				$hope_updates_loading_box.hide();
				$hope_updates_loading_box.siblings('.hope_updates_loading_retry_box').show();				
			}
		});
	}
	
	$('.mc_update').on('click', function(event) {
		var $this = $(this);
		var $hope_updates_box = $this.parent().siblings('.hope_updates_box');
		
		if ($hope_updates_box.is(':visible')) {
			$this.css('color', 'black');			
			$hope_updates_box.slideUp();
		} else {
			$this.css('color', 'gray');
			var $hope_updates_loading_box = $hope_updates_box.find('.hope_updates_loading_box');
			$hope_updates_box.slideDown();
			loading_updates($hope_updates_loading_box);
		};
		
		event.stopPropagation();
	});
	
	$('.hope_updates_loading_more').on('click', function(event) {
		var $this = $(this);
		$this.hide();
		loading_updates($this.siblings('.hope_updates_loading_box'));
		
		event.stopPropagation();
	});
	
	$('.hope_updates_loading_retry_action').on('click', function(event) {
		var $retry_box = $(this).parent();
		
		$retry_box.hide();
		loading_updates($retry_box.siblings('.hope_updates_loading_box'));
		
		event.stopPropagation();
	});
	
	function delete_my_update($this) {
		$.ajaxQueue({
			url: '/hopeUpdates/' + $this.siblings('.hope_update_id').text(),
			type: 'POST',
			dataType: 'json',
			data: {'_method' : 'DELETE'},
			success: function(response) {
				if (response.success) {
					var $hope_update_show = $this.parent();
					$hope_update_show.slideUp().queue(function() {
						$hope_update_show.remove();
					});
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							delete_my_update($this);
						}, tr('Your session was timeout, please re-login'));
					};
				};
			}
		});
	}
	
	$('.hope_update_delete_action').on('click', function(event) {
		if (confirm(tr('Are you sure to delete this update?'))) {
			var $this = $(this);
			
			delete_my_update($this);
		};
		
		event.stopPropagation();
	});
	
	loading_hopes(25);
});
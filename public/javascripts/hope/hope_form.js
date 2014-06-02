$(function() {
	
	$('#hope_form_title').focus();
	
	var $create_hope_success_box = $('#create_hope_success_box');
	var $hope_form_image_box_box = $('#hope_form_image_box_box');	
	var $hope_form_image_box_body = $hope_form_image_box_box.children('#hope_form_image_box_body');	
	var $hope_form_image_box_shielding = $hope_form_image_box_box.children('#hope_form_image_box_shielding');
	var $hope_form_image_box = $hope_form_image_box_body.children('#hope_form_image_box');
	var $hope_form_image_edit_shielding = $hope_form_image_box_box.children('#hope_form_image_edit_shielding');
	var $hope_form_image_edit_body = $hope_form_image_box_box.children('#hope_form_image_edit_body');
	var $hope_form_image_edit = $hope_form_image_edit_body.children('#hope_form_image_edit');
	var $upload_image_button = $('#hope_form_image_box_upload_image_button');
	var $hope_form_uploaded_images_box = $('#hope_form_uploaded_images_box')
	var new_response = null;
	var max_upload_pictures = 10;
	var uploading_image_success = false;
	var uploaded_image_thum_length = 50; 
		 
	// set corner
	$create_hope_success_box.find('#create_hope_success_message_alert').corner('3px');
	$hope_form_image_box.corner('3px');
	$hope_form_image_edit.corner('3px');  
	
	function upload_image_fail(error_message) {
		$('#hope_form_image_uploading').hide(); 		
		$('#hope_form_image_uploading_error').show();
		$('#hope_form_image_uploading_error').hide().queue(function() {
			$(this).text(error_message).dequeue();
		}).fadeIn(1000);
		$upload_image_button.animate({'top' : '100px'}, 'slow');
	}
	
	function hide_image_uploading_box() {
		var $uploading_image_desc = $('#hope_form_image_uploading_image_description');
		
		$('#hope_form_image_uploading').hide();
		$upload_image_button.animate({'top' : '100px'}, 'normal');
		$('#hope_form_image_uploading_background').css('background-image', "url('/images/pictures_64x64.png')");
		$('#hope_form_upload_image_file').attr('value', null);
		uploading_image_success = false;
		new_response = null;
	}

	function hide_edit_image_box() {
		$hope_form_image_edit_shielding.fadeOut();
		$hope_form_image_edit_body.fadeOut();		

		$hope_form_image_edit.children('#hope_form_image_edit_image_name').text('');
		$hope_form_image_edit.children('#hope_form_image_edit_image_description').val('');
	}
	
	function quit_upload_image_box() {
		$hope_form_image_box_box.fadeOut();
		// $('.shielding').fadeOut();

		$hope_form_uploaded_images_box.appendTo('#hope_form');
		$hope_form_uploaded_images_box.hide();
	}
	
	function safe_quit_upload_image_box() {
		if ($('#shielding_edit_image_box').is(":visible")) {
			hide_edit_image_box();
		} else if ($hope_form_image_box.is(':visible')) {
			quit_upload_image_box();
		};
	}
	
	$('#hope_form_box').click(function(event){
		var id = event.target.id;
		if (id == 'hope_form_upload_image_box_select_image_from_computer_button') {
			$button = $('#hope_form_upload_image_box_select_image_from_computer_button');
		}
		
		event.stopPropagation();
		
		return true;
	});     
	
	function show_create_hope_success_alert() {
		var $window = $(window);
		var margin_top = ($window.height() - 150)/2 - 60 + $window.scrollTop();
		margin_top = (margin_top > 0)? margin_top : 0;
		
		$create_hope_success_box.css({
			'height' : $(document).height() + 'px',
			'width' : $(document).width() + 'px'
		});
		$create_hope_success_box.find('#create_hope_success_message_alert').css('margin-top', margin_top + 'px');
		$create_hope_success_box.queue(function() {
			$create_hope_success_box.appendTo($('body')).dequeue();
		}).fadeIn();
		
		// $('body').css('overflow', 'hidden');
	}
	
	// show_create_hope_success_alert();
	
	$('#hope_form_submit').click(function(event) {
		var $this = $(this);
		var title = $.trim($('#hope_form_title').val());
		var body = rtrim($('#hope_form_body').val());
		var contact = $.trim($('#hope_form_contact').val());

		var $title_error = $('#hope_form_title_error');
		var $body_error = $('#hope_form_body_error');
		var $contact_error = $('#hope_form_contact_error');

		var title_error = body_error = contact_error = false;

		if (title.length == 0) {
			$title_error.text(tr('can not be empty'));
			title_error = true;
		} else if (title.length > 30) {
			$title_error.text(tr('is maximum &1 character(s)', 30));
			title_error = true;
		} else if (title.length < 2) {
			$title_error.text(tr('is minimum &1 character(s)', 2));
			title_error = true;				
		} else {
			$title_error.text('');
			title_error = false;
		}
		if (title_error) {
			$('#hope_form_title').addClass('field_error');
		} else {
			$('#hope_form_title').removeClass('field_error');
		}

		if (body.length == 0) {
			$body_error.text(tr('can not be empty'));
			body_error = true;
		} else if (body.length < 200) {
			$body_error.text(tr('is minimum &1 character(s)', 200));
			body_error = true;
		} else if (body.length > 2000) {
			$body_error.text(tr('is maximum &1 character(s)', 2000));
			body_error = true;
		} else {
			$body_error.text('');
			body_error = false;
		}
		if (body_error) {
			$('#hope_form_body').addClass('field_error');
		} else {
			$('#hope_form_body').removeClass('field_error');
		}

		if (contact.length > 300) {
			$contact_error.text(tr('is maximum &1 character(s)', 300));
			contact_error = true;
		} else {
			$contact_error.text('');
			contact_error = false;
		}
		if (contact_error) {
			$('#hope_form_contact').addClass('field_error');
		} else {
			$('#hope_form_contact').removeClass('field_error');
		}

		var result = !(title_error || body_error || contact_error);
		if (result) {
			$this.hide();
			 $hope_form = $('#hope_form');
			$.ajaxQueue({
				url: $hope_form.attr('action'),
				type: 'post',
				dataType: 'json',
				data: $hope_form.serializeArray(),
				success: function(response) {
					if (response.success) {
						show_create_hope_success_alert();
						
						if (response.redirect_url) {
							$.data(document.body, 'redirect_url', response.redirect_url);
							// window.location.href = response.redirect_url;
						} else {
							$.data(document.body, 'redirect_url', '/');
						};
					} else {
						if (response.need_login) {
							user_login.try_to_login(function() {
								$this.click();
							});
						} else {
							if (response.errors && response.errors.too_many_hopes) {
								alert(response.errors.too_many_hopes);
							};
						};
												
					};
				},
				complete: function() {
					$this.show();
				}
			});
		};  
		
		event.stopPropagation(); 
		
		return false;
	});                  
	
	$('#create_hope_success_message_ok').on('click', function(event) {
		window.location.href = $.data(document.body, 'redirect_url');
		
		event.stopPropagation();
	});
	
	$('.hope_form_uploaded_image_remove').click(function(event) {		
		if (confirm(tr('Are you sure to delete this image?'))) {
			var $uploaded_images_box = $(this).parent().parent();
			$(this).parent().fadeOut().remove();
			
			var children = $uploaded_images_box.children();

			for (var i=0; i < children.length; i++) {
				$(children[i]).css({'top' : parseInt(i/10, 10)*uploaded_image_thum_length + 'px', 'left' : (i%10)*uploaded_image_thum_length + 'px'});
			};

			if (parseInt($uploaded_images_box.css('height'), 10) > (parseInt((children.length - 1)/10, 10) + 1)*uploaded_image_thum_length) {
				$uploaded_images_box.animate({'height' : parseInt($uploaded_images_box.css('height'), 10) - uploaded_image_thum_length + 'px'}, 'normal');
				$hope_form_image_box.animate({'height' : parseInt($hope_form_image_box.css('height'), 10) - uploaded_image_thum_length + 'px'}, 'normal');		
			};	
			
			$.ajaxQueue({
				url: '/hopeImages/' + $(this).siblings('.hope_form_uploaded_image_id').attr('value'),
				type: 'POST',
				data: {'_method' : 'DELETE'},
				dataType: 'json'
			});
		};
		
		event.stopPropagation();
	}); 
	
	
	$('.hope_form_uploaded_image_thum').click(function(event) {
		// for ie
		$hope_form_image_edit_shielding.css('filter', 'Alpha(opacity=60)');		
		// for ie6
		$hope_form_image_edit_shielding.width($hope_form_image_edit_shielding.parent().width());
		$hope_form_image_edit_shielding.height($hope_form_image_edit_shielding.parent().height())		
		
		$hope_form_image_edit_shielding.fadeIn();
		$hope_form_image_edit_body.fadeIn();		
		
		$hope_form_image_edit.children('#hope_form_image_edit_background').css('background-image', "url('" + $(this).attr('src') + "')");
		$hope_form_image_edit.children('#hope_form_image_edit_image_name').text($(this).siblings('.hope_form_uploaded_image_name').text());           
		var desc = $(this).siblings('.hope_form_uploaded_image_description').text();                                     
		var $description = $hope_form_image_edit.children('#hope_form_image_edit_image_description');

		$hope_form_image_edit.children('#hope_form_image_edit_target_id').text($(this).parent().attr('id'));
		
		$description.val(desc).focus();
		$hope_form_image_edit.children('#hope_form_image_edit_description_count').text(140 - $description.val().length);
		
		event.stopPropagation();   
	});
	
	$('#hope_form_image_edit_ok').click(function(event) {		
		
		var $this = $(this);
		var description = $.trim($('#hope_form_image_edit_image_description').val());
		if (description.length > 140) {
			return false;
		};
		var $edit_target = $('#' + $(this).siblings('#hope_form_image_edit_target_id').text());
		$this.hide();
		$.ajaxQueue({
			url: '/hopeImages/' + $edit_target.children('.hope_form_uploaded_image_id').attr('value'),
			type: 'POST',
			data: {'_method' : 'PUT', 'description' : description},
			dataType: 'json',
			success: function(response) {
				if (response.success) {
					$edit_target.children('.hope_form_uploaded_image_description').text(description);
					hide_edit_image_box();
				};
			},
			complete: function(jqXHR, textStatus) {
				$this.show();
			}
		});

		event.stopPropagation();
		
		return true;
	});
	
	$('#hope_form_image_edit_cancel').click(function(event) {
		hide_edit_image_box();
		
		event.stopPropagation();		
	});
	
	$('#hope_form_image_uploading_ok').click(function(event) {
		if (!uploading_image_success) return false;
		
		// update new image description
		var $uploading_image_desc = $hope_form_image_edit.children('#hope_form_image_uploading_image_description');

		var image_desc = $.trim($uploading_image_desc.val());
		if (image_desc.length > 140) return false;
		if (image_desc.length > 0) {
			$.ajaxQueue({
				url: '/hopeImages/' + new_response.image_id,
				type: 'POST',
				data: {'_method' : 'PUT', 'description' : image_desc},
				dataType: 'json',
				success: function(data) {
					if (data.success) {
						$new_uploaded_image.children('.hope_form_uploaded_image_description').text(image_desc);
					} else {
						
					};
				}
			});
		};
		
		// add new uploaded image to thums show
		var image_size = new_response.image_size.split("x");
		perfect_mini(image_size, 40);

		var uploaded_image_count = $hope_form_uploaded_images_box.children().length;				
		var $uploaded_images_box = $hope_form_uploaded_images_box;
		if( parseInt($uploaded_images_box.css('height'), 10) < (parseInt(uploaded_image_count + 1, 10)/10) * uploaded_image_thum_length) {
			$hope_form_image_box.css('height', parseInt($hope_form_image_box.css('height'), 10) + uploaded_image_thum_length + 'px' );
			$uploaded_images_box.css('height', parseInt($uploaded_images_box.css('height'), 10) + uploaded_image_thum_length + 'px');
		};

		var $new_uploaded_image = $('#hope_form_uploaded_image_original').clone(true, true);
		var new_uploaded_image_id = 'hope_form_uploaded_image_' + new_response.image_id;
		$new_uploaded_image.attr('id', new_uploaded_image_id);
		$new_uploaded_image.children('.hope_form_uploaded_image_id').attr('value', new_response.image_id);
		$new_uploaded_image.children('.hope_form_uploaded_image_name').text($('#hope_form_image_uploading_image_name').text());
		
		var $image_thum = $new_uploaded_image.children('.hope_form_uploaded_image_thum');
		var thum_left = (40 - image_size[0])/2.0;
		var thum_top = (40 - image_size[1])/2.0 + 10;
		$image_thum.attr('src', new_response.image_url);
		$image_thum.css({'width' : image_size[0] + 'px', 'height' : image_size[1] + 'px', 'left' : thum_left + 'px', 'top' : thum_top + 'px'});
		// the remove button position
		$new_uploaded_image.children('.hope_form_uploaded_image_remove').css({'top' : thum_top - 8 + 'px', 'left' : thum_left + image_size[0] - 8 + 'px'});

		$new_uploaded_image.css({'left' : (uploaded_image_count%10)*uploaded_image_thum_length + 'px', 'top' : parseInt(uploaded_image_count/10, 10)*uploaded_image_thum_length + 'px'});
		$new_uploaded_image.appendTo($hope_form_uploaded_images_box);
		$new_uploaded_image.fadeIn();
		
		hide_image_uploading_box();
		
		event.stopPropagation(); 
		
		return true;
	});
	
	$('#hope_form_image_uploading_cancel').click(function(event) {
		hide_image_uploading_box();
		
		event.stopPropagation();
	});
	
	$('#hope_form_image_box_quit').click(function(event) {
		quit_upload_image_box();
		
		event.stopPropagation();
	});
	
	$('#hope_form_add_picture_button').click(function(event) {

		// shielding_show(200);
		$hope_form_image_box_box.appendTo($('body'));
		$hope_form_image_box_box.css({'width' : $(document).width() + 'px', 'height' : $(document).height()});
		$hope_form_image_box_box.fadeIn();
		// $hope_form_image_box.css('z-index', 201);
		
		$hope_form_uploaded_images_box.appendTo($hope_form_image_box).show();
		// $('#hope_form_uploaded_images_box').show();
		
		event.stopPropagation();
	});
		
	$('#hope_form_title').on('textchange', function(event, previousText) {

		var $title_count = $('#hope_form_title_count');
		var count = 30 - $.trim($(this).val()).length;
		
		if (count < 0) {
			$title_count.css('color', 'red');
		} else {
			$title_count.css('color', 'gray');
		}
		
		$title_count.text(count);
		
		event.stopPropagation();
	});
	
	$('#hope_form_body').on('textchange', function(event, previousText) {

		var $body_count = $('#hope_form_body_count');
		var count = 2000 - rtrim($(this).val()).length;
		
		if (count < 0) {
			$body_count.css('color', 'red');
		} else {
			$body_count.css('color', 'gray');
		}

		$body_count.text(count);

		event.stopPropagation();
	});
	
	$('#hope_form_contact').on('textchange', function(event, previousText) {
		var $contact_count = $('#hope_form_contact_count');
		var count = 300 - $.trim($(this).val()).length;
		
		if (count < 0) {
			$contact_count.css('color', 'red');
		} else {
			$contact_count.css('color', 'gray');
		}
		
		$contact_count.text(count);
		
		event.stopPropagation();
	});
	
	$('#hope_form_image_edit_image_description').on('textchange', function(event, previousText) {
		var $desc_count = $('#hope_form_image_edit_description_count');
		var count = 140 - $.trim($(this).val()).length;
		
		if (count < 0) {
			$desc_count.css('color', 'red');
		} else {
			$desc_count.css('color', 'gray');
		};                                

		$desc_count.text(count);
		
		event.stopPropagation();
	});     
	
	$('#hope_form_image_uploading_image_description').on('textchange', function(event, previousText) {
		var $desc_count = $('#hope_form_image_uploading_image_description_count');
		var count = 140 - $.trim($(this).val()).length;
		
		if (count < 0) {
			$desc_count.css('color', 'red');
		} else {
			$desc_count.css('color', 'gray');
		};                                

		$desc_count.text(count);
		
		event.stopPropagation();
	});
		
	$('#hope_form_upload_image_form').iframePostForm({
		iframeID: 'hope_form_upload_image_iframe',
		json : true,
		post : function(){
			uploading_image_success = false;	
			new_response = null;
			if ($hope_form_uploaded_images_box.children().length >= max_upload_pictures) {
				return false;
			};
			return true;
		},
		complete : function(response) {
			new_response = response;
			
			if (response.success) {
				uploading_image_success = true;
				$('#hope_form_image_uploading_loading').hide();
				$('#hope_form_image_uploaded_image_id').text(response.image_id);
				$('#hope_form_image_uploading_background').css({"background-image" : "url('" + response.image_url + "')"});				
			} else {
				if (response.need_login) {
					// uploading_image_success = true;					
					user_login.try_to_login(function() {
						$('#hope_form_upload_image_form').submit();
					});
				} else {
					upload_image_fail(response.errors[1]);				
				}
				uploading_image_success = false;
			};	
		}
	});
	    
// 	upload image
	$('#hope_form_upload_image_file').change(function(event) {
		if ($hope_form_uploaded_images_box.children().length < max_upload_pictures) {
			var image_name = $(this).val().split('\\').pop();
			var extension = image_name.split('.').pop().toLowerCase();

			if ($.inArray(extension, ['jpg', 'jpeg', 'jpe', 'png', 'gif']) > -1) {
				$upload_image_button.animate({'top' : '210px'}, 'slow');
				$hope_form_image_box_upload_image_box = $('#hope_form_image_box_upload_image_box');			
				$hope_form_image_uploading = $hope_form_image_box_upload_image_box.children('#hope_form_image_uploading');
				$hope_form_image_box_upload_image_box.children('#hope_form_image_uploading_error').hide();
				$hope_form_image_uploading.children('#hope_form_image_uploading_loading').show();			
				$hope_form_image_uploading.fadeIn('slow');
				$hope_form_image_uploading.children('#hope_form_image_uploading_image_description').val('');
				$hope_form_image_uploading.children('#hope_form_image_uploading_image_name').text(image_name);
				$hope_form_image_uploading.children('#hope_form_image_uploading_image_name').attr('title', image_name);
				$hope_form_image_uploading.children('#hope_form_image_uploading_background').attr('title', image_name);
				$('#hope_form_upload_image_form').submit(); 
				$hope_form_image_uploading.children('#hope_form_image_uploading_image_description_count').text(140);
				$hope_form_image_uploading.children('#hope_form_image_uploading_image_description').val('').focus();				
			} else {
				upload_image_fail(tr('please upload picture with jpg, gif or png format'));
			};
		} else {
			$(this).attr('value', null);
			upload_image_fail(tr('you can maximum select &1 pictures', max_upload_pictures));

			return false;
		};
		
		event.stopPropagation(); 
		
		return true;
	});
		
	$('body').on('keydown', function(event) {
		switch(event.which) {
			// esc
			case 27:
				if ($hope_form_image_box.is(':visible')) {
					safe_quit_upload_image_box();
				};
				break;
		}
	});
	
	$(window).on('resize', function(event) {
		if ($hope_form_image_box_box.is(':visible')) {
			$hope_form_image_box_box.width($('body').width());
			$hope_form_image_box_box.height($(document).height());			
		};
	});
});

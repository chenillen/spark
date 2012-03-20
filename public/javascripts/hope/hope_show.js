$(function() {
	
	var image_length = 330;
	var $hw_image = $('#hw_image');
	var $hw_image_thum_box = $('.hw_image_thum_box');
	var $hw_image_desc = $('#hw_image_description');
	var $hw_image_thum_shielding = $('#hw_image_thum_shielding');
	var $hw_image_thums = $('#hw_image_thums');
	var $hw_image_thum_selected_index = $('#hw_image_thum_selected_index');	                
	var $shielding = $('.shielding');
	var thums_count = $hw_image_thums.children().length; 
	
	// set basic info
	$.data(document.body, 'comment_added', false);
	
	// follow hope actions
	// add follow button
	// $('#header_bar').append($('<div id="follow" class="sexybutton sexysimple sexyred">' + tr('Follow') +'</div>'));
	$('#header_bar').append($('<div id="follow" class="hope_user_menu">' + tr('Follow') +'</div>'));
	$('#header_bar').append($('<div id="share" class="hope_user_menu">' + tr('Share') +'</div>'));
	// 
	function success_to_follow($follow, follow_id) {
		$.data(document.body, 'follow_id', follow_id);
		$follow.text(tr('Unfollow'));
		$follow.css('color', 'gray');
	}
	// set the callback to
	function check_follow_status() {
		var $follow = $('#follow');
		
		if($follow.attr('id')) {
			$.ajaxQueue({
				url: '/hopeFollows/check_whether_followed?hope_id=' + $.data(document.body, 'hope_id'),
				type: 'GET',
				dataType: 'json',
				success: function(response) {
					if (response.success) {
						success_to_follow($follow, response.follow_id);
					};
				}
			});
		}
	}
	// set global callback for every user login
	user_login.add_global_callback(check_follow_status);
	// check whether user followed this hope on page load
	check_follow_status();
	
	// set update image fancybox
	$('.hw_update_image').fancybox({
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
	
	function click_to_follow(event) {
		var $this = $(this);
		$this.off('click', click_to_follow);
		$this.css('opacity', 0);
		
		if ($this.text() === tr('Follow')) {
			$.ajaxQueue({
				url: '/hopeFollows',
				type: 'POST',
				dataType: 'json',
				data: {'hope_id' : $.data(document.body,  'hope_id')},
				success: function(response) {
					if (response.success) {
						success_to_follow($this, response.follow_id);
					} else {
						if (response.need_login) {
							user_login.try_to_login(function() {
								$this.click();
							});
						} else if(response.followed) {
							success_to_follow($this, response.follow_id);
						} else {
							if (response.errors.too_many_follows) {
								alert(response.errors.too_many_follows);
							};
						}
					};
				},
				complete: function() {
					$this.on('click', click_to_follow);
					$this.css('opacity', 1);					
				}
			});	
		} else {
			$.ajaxQueue({
				url: '/hopeFollows/' + $.data(document.body, 'follow_id'),
				type: 'POST',
				dataType: 'json',
				data: {'_method' : 'DELETE'},
				success: function(response) {
					if (response.success) {
						$this.text(tr('Follow'));
						$this.css('color', 'red');
					} else {
						if (response.need_login) {
							user_login.try_to_login(function() {
								$this.click();
							});
						}
					};	
				},
				complete: function() {
					$this.on('click', click_to_follow);
					$this.css('opacity', 1);					
				}
			});
		};
		
		event.stopPropagation();

	}
	$('#follow').on('click', click_to_follow);
	                               
	// add actions for image slide show, if there are images.
   	if ($hw_image_thums.attr('id')) { 
	
		// set autoplay thums   
		function autoplay_thums(index) {
			
			$hw_image.attr('src', null);	
			$hw_image.attr('src', $.data(document.body, 'small_image_urls')[index]);	
			
			var size = $.data(document.body, 'small_image_sizes')[index].split('x');
			perfect_mini(size, image_length);                                       

			var image_top = (image_length - size[1])/2;
			var image_left = (700 - size[0])/2;
			var desc_top = image_top + size[1] + 9;

			$hw_image_thum_shielding.fadeOut('fast').queue(function() {
				var shielding_left = parseFloat($hw_image_thums.css('left')) + 70*index + 'px';
				$hw_image_thum_shielding.css('left', shielding_left).dequeue();
			}).fadeIn('fast');

			$hw_image.css({'top': image_top + 'px', 'left' : image_left + 'px', 'width' : size[0] + 'px', 'height' : size[1] + 'px'}); 
			$hw_image.fadeIn('slow');
			$hw_image_desc.fadeOut('fast').queue(function() {
				$hw_image_desc.css('top', desc_top + 'px');
				$hw_image_desc.text($.data(document.body, 'image_descs')[index]).dequeue();
			}).fadeIn();                
			$hw_image_thum_selected_index.text(index);
		}

		var autoplay_intv;
		var autoplay_timeout;
		var autoplay_function = function() {    
			autoplay_intv = setInterval(function() {                                   
				var index = parseInt($hw_image_thum_selected_index.text(), 10) + 1;
				if (index == thums_count) index = 0;
				autoplay_thums(index);
			}, 3000);          
		};         

		autoplay_function();
		$hw_image_thum_box.click(function(event) { 
	 		clearInterval(autoplay_intv);
			clearTimeout(autoplay_timeout);
			autoplay_timeout = setTimeout(autoplay_function, 120000);
			var index = $(this).children('.hw_image_thum_index').text();
			autoplay_thums(index);

			event.stopPropagation(); 
		});
		      
	};     
	
	// hope image fancybox show
	var $hope_image_fancybox = null;
	$hw_image.on('click', function(event) {
		if(!$hope_image_fancybox) {
			var medium_image_urls = $.data(document.body, 'medium_image_urls');
			var mini_image_urls = $.data(document.body, 'mini_image_urls');
			var image_descs = $.data(document.body, 'image_descs');
		
			var code = '<div style="display: none;">';
			for (var i=0; i < medium_image_urls.length; i++) {
				code += "<a class='hope_image_fancybox' href=" + medium_image_urls[i] + 
						" rel='hope_image_slide' title=" + image_descs[i] + "><img src=" + mini_image_urls[i] +
						"/></a>";
			};
			code += '</div>';
		
			$hope_image_fancybox = $(code);
			$hope_image_fancybox.appendTo('body');
			$('.hope_image_fancybox').fancybox({
				padding: 0,
				closeBtn: false,
				// mouseWheel: true,
				nextClick: true,
				arrows: false,				
				type: 'image',
				prevEffect: 'none',
				nextEffect: 'none',
				// closeSpeed: 'slow',
				// loop: false,
				helpers: { 
					thumbs: {
						width: 50,
						height: 50
					}
				},
				tpl: {
					error: '<p class="fancybox-error">' + tr("The picture can't be loaded, please try again later.") +'</p>'
				}
			});
		}
		
		$($hope_image_fancybox.children('.hope_image_fancybox')[parseInt($hw_image_thum_selected_index.text(), 10)]).click();
		
		event.stopPropagation();
	});
	
	
	// image slide show  
	// var $hope_show = $('#hope_show');
	// var $slide_show_box = $('#hope_image_slide_show_box');
	// var $slide_show = $slide_show_box.children('#hope_image_slide_show');
	// var $hiss_image_description = $slide_show.children('#hiss_image_description');
	// var $hiss_nav = $slide_show.children('.hiss_nav');
	// var $nav_image_index = $slide_show.children('#hiss_center_image_index');
	// var $nav_shielding_left = $slide_show.children('#hiss_nav_shielding_left');
	// var $nav_shielding_right = $slide_show.children('#hiss_nav_shielding_right');
	// 
	// function exit_slide_show() {
	// 	$slide_show_box.fadeOut().queue(function() {
	// 		$slide_show_box.appendTo($hope_show.parent()).dequeue();
	// 	});
	// }
	// 
	// $slide_show.on('click', '#hiss_image_slide_show_exit', function(event) {
	// 	exit_slide_show();
	// });
	// 
	// $('#hw_image').on('click', function(event) {
	// 	// some computer's display resolution smaller than 1200px, if set the shielding's width smaller than 1200px, some ugly things happen. 
	// 	var shielding_width = ($('body').width() > 1200) ? $('body').width() : 1200;
	// 	$slide_show_box.css({'height' : $(document).height() + 'px', 'width' : shielding_width});
	// 	var slide_show_left = (shielding_width - 1200)/2;
	// 	// $slide_show.css('left', ((slide_show_left > 0)? slide_show_left : 0) + 'px');
	// 	$slide_show_box.queue(function() {
	// 		$slide_show_box.appendTo($('body')).dequeue();
	// 	}).fadeIn();
	// 
	// 	// get the current show image
	// 	var selected_image_index = 0;		
	// 	if ($.data(document.body, 'medium_image_sizes').length > 1) {
	// 		selected_image_index =  parseInt($hw_image_thum_selected_index.text(), 10);			
	// 	};		
	// 	$nav_image_index.text(selected_image_index);
	// 	var big_image_size = perfect_mini($.data(document.body, 'medium_image_sizes')[selected_image_index].split("x"), 800);
	// 	var image_top = (800 - big_image_size[1])/2;                                         
	// 	
	// 	// get center
	// 	var $nav_center = $slide_show.children('#hiss_nav_center');
	// 	if (!$nav_center.attr('id')) {
	// 		$nav_center = $hiss_nav.clone(true);
	// 		$nav_center.attr('id', 'hiss_nav_center');
	// 		$nav_center.css({'width' : '800px', 'height' : '800px', 'top' : 0, 'left' : '200px'});
	// 		$nav_center.insertBefore($nav_shielding_left);
	// 	};
	// 
	// 	var $nav_center_image = $nav_center.children('.hiss_nav_image');			
	// 	$nav_center_image.attr('src', $.data(document.body, 'medium_image_urls')[selected_image_index]);
	// 	$nav_center_image.css({'width' : big_image_size[0] + 'px', 'height' : big_image_size[1] + 'px' ,'top' : image_top + 'px', 'left' : (800 - big_image_size[0])/2.0 + 'px'});
	// 	$nav_center.fadeIn();
	// 	
	// 	// set description
	// 	$hiss_image_description.text($.data(document.body, 'image_descs')[selected_image_index]);
	// 	// try to keep description fit the image width
	// 	var desc_width = (big_image_size[0] > 300)? big_image_size[0] : 300;
	// 	$hiss_image_description.css({'top' : image_top + big_image_size[1] + 10 + 'px', 'width' : desc_width + 'px', 'left' : (1200 - desc_width)/2 + 'px'});
	// 	$hiss_image_description.fadeIn();
	// 	
	// 	// if it is not the last image
	// 	if (selected_image_index < ($hw_image_thums.children().length - 1)) {
	// 		var $nav_right = $slide_show.children('#hiss_nav_right');
	// 		if (!$nav_right.attr('id')) {
	// 			$nav_right = $hiss_nav.clone(true);
	// 			$nav_right.attr('id', 'hiss_nav_right');           
	// 			$nav_right.insertBefore($nav_shielding_left);
	// 		};
	// 		// set nav right position
	// 		$nav_right.css({'width' : '100px', 'height' : '100px', 'left' : '1050px', 'top' : image_top + big_image_size[1]/2 - 5 + 'px'});
	// 		// set nav right image
	// 		var size = perfect_mini($.data(document.body, 'mini_image_sizes')[selected_image_index + 1].split("x"), 100);
	// 		var $right_image = $nav_right.children('.hiss_nav_image');                                                                              
	// 		$right_image.css({'width' : size[0] + 'px', 'height' : size[1] + 'px', 'top' : ((100 - size[1])/2 + 'px'), 'left' : ((100 - size[0])/2 + 'px')});
	// 		$right_image.attr('src', $.data(document.body, 'mini_image_urls')[selected_image_index + 1]);
	// 		// set shielding                 
	// 		$nav_shielding_right.css('top', $nav_right.css('top'));
	// 		$nav_right.fadeIn();
	// 	} else {
	// 	  $slide_show.children('#hiss_nav_right').remove();  
	// 	};                           
	// 	
	// 	// if it is not the first image
	// 	if (selected_image_index > 0) {
	// 		var $nav_left = $slide_show.children('#hiss_nav_left');
	// 		if (!$nav_left.attr('id')) {
	// 			$nav_left = $hiss_nav.clone(true);
	// 			$nav_left.attr('id', 'hiss_nav_left');
	// 			$nav_left.insertBefore($nav_shielding_left);
	// 		};
	// 		// set nav left position
	// 		$nav_left.css({'width' : '100px', 'height' : '100px', 'left' : '50px', 'top' : image_top + big_image_size[1]/2 - 5 + 'px'});
	// 		// set nav left image
	// 		size = perfect_mini($.data(document.body, 'mini_image_sizes')[selected_image_index - 1].split("x"), 100);
	// 		var $left_image = $nav_left.children('.hiss_nav_image');
	// 		$left_image.css({'width' : size[0] + 'px', 'height' : size[1] + 'px', 'top' : (100 - size[1])/2 + 'px', 'left' : (100 - size[0])/2 + 'px'});
	// 		$left_image.attr('src', $.data(document.body, 'mini_image_urls')[selected_image_index - 1]);
	// 		$nav_shielding_left.css('top', $nav_left.css('top'));
	// 		$nav_left.fadeIn();
	// 	} else {
	// 		$slide_show.children('#hiss_nav_left').remove();
	// 	};
	// 	
	// 	event.stopPropagation();
	// });
	//      	
	// // from right to left
	// $slide_show.on("click", '#hiss_nav_right', function(event) {
	// 	var $nav_right = $slide_show.children('#hiss_nav_right');       
	// 	var $right_image = $nav_right.children('.hiss_nav_image');
	// 	var $nav_center = $slide_show.children('#hiss_nav_center');     
	// 	var $center_image = $nav_center.children('.hiss_nav_image');
	// 	
	// 	var index =  parseInt($nav_image_index.text(), 10);
	// 	$right_image.attr('src', $.data(document.body, 'medium_image_urls')[index + 1]);
	// 
	// 	// set the current center image index
	// 	$nav_image_index.text(index + 1);
	// 	//calculate the right image size to be center
	// 	var image_size = perfect_mini($.data(document.body, 'medium_image_sizes')[index + 1].split("x"), 800);
	// 	var image_top = (800 - image_size[1])/2;                                                
	// 	// change it for better user experience,
	// 	// the big image to being small is ugly
	// 	$center_image.attr('src', $.data(document.body, 'mini_image_urls')[index]);
	// 	// calculate the center image size to be left
	// 	var center_image_size = perfect_mini([$center_image.width(), $center_image.height()], 100);
	// 	// set shielding left top
	// 	$nav_shielding_left.css('top', image_top + image_size[1]/2 - 5 + 'px');
	// 	// animation 
	// 	$slide_show.children('#hiss_nav_left').remove();
	// 
	// 	$nav_right.animate({
	// 		'width' : '800px',
	// 		'height' : '800px',
	// 		'top' : '0px',
	// 		'left' : '200px'
	// 	}, 'normal');
	// 	
	// 	$right_image.animate({
	// 		'width' : image_size[0] + 'px',
	// 		'height' : image_size[1] + 'px',
	// 		'top' : (800 - image_size[1])/2 + 'px',
	// 		'left' : (800 - image_size[0])/2 + 'px'
	// 	}, 'normal');
	// 
	// 	$nav_center.animate({
	// 		'width' : '100px',
	// 		'height' : '100px',
	// 		'top' : image_top + image_size[1]/2 - 5 + 'px',
	// 		'left' : '50px'
	// 	}, 'normal');
	// 	
	// 	$center_image.animate({
	// 		'width' : center_image_size[0] + 'px',
	// 		'height' : center_image_size[1] + 'px',
	// 		'top' : (100 - center_image_size[1])/2 + 'px',
	// 		'left' : (100 - center_image_size[0])/2 + 'px'
	// 	}, 'normal');
	//         	// set description
	// 	$hiss_image_description.hide();
	// 	var desc_width = (image_size[0] > 300)? image_size[0] : 300;                       
	// 	$hiss_image_description.text($.data(document.body, 'image_descs')[index + 1]);
	// 	$hiss_image_description.css({'top' : image_top + image_size[1] + 10 + 'px', 'width' : desc_width + 'px', 'left' : (1200 - desc_width)/2 + 'px'});			
	// 	$hiss_image_description.fadeIn('slow');
	// 
	// 	$nav_center.attr('id', 'hiss_nav_left');
	// 	$nav_right.attr('id', 'hiss_nav_center');			
	// 				
	// 	// set nav rigth image, if there is
	// 	if ((index + 2) < thums_count) {
	// 		var $new_nav_right = $hiss_nav.clone(true);
	// 		$new_nav_right.attr('id', 'hiss_nav_right');
	// 		$new_nav_right_image = $new_nav_right.children('.hiss_nav_image');
	// 		var right_image_size = perfect_mini($.data(document.body, 'mini_image_sizes')[index + 2].split("x"), 100);
	// 		
	// 		$new_nav_right.css({'left' : '1050px', 'top' : image_top + image_size[1]/2 - 5 + 'px', 'width' : '100px', 'height' : '100px'});
	// 		$new_nav_right_image.attr('src', $.data(document.body, 'mini_image_urls')[index + 2]);
	// 		$new_nav_right_image.css({'width' : right_image_size[0] + 'px', 'height' : right_image_size[1] + 'px' ,'top' : (100 - right_image_size[1])/2 + 'px', 'left' : (100 - right_image_size[0])/2 + 'px'});
	// 		$nav_shielding_right.css('top', $new_nav_right.css('top'));
	// 
	// 		$new_nav_right.insertBefore($nav_shielding_left);
	// 		$new_nav_right.fadeIn();
	// 	};                                      
	// 	
	// 	event.stopPropagation();
	// });
	//          
	// // from left to right
	// $slide_show.on('click', '#hiss_nav_left', function(event) {
	// 	var $nav_left = $slide_show.children('#hiss_nav_left');
	// 	var $left_image = $nav_left.children('.hiss_nav_image');
	// 	var $nav_center = $slide_show.children('#hiss_nav_center');
	// 	var $center_image = $nav_center.children('.hiss_nav_image'); 
	// 	
	// 	// calculate the big image size and position
	// 	var index = parseInt($nav_image_index.text(), 10);
	// 	var big_image_size = perfect_mini($.data(document.body, 'medium_image_sizes')[index - 1].split("x"), 800);
	// 	var big_image_top = (800 - big_image_size[1])/2;
	// 	// calculate the new left image size
	// 	var center_image_size = perfect_mini($.data(document.body, 'mini_image_sizes')[index].split("x"), 100);
	// 	// set description
	// 	$hiss_image_description.hide();
	// 	$hiss_image_description.text($.data(document.body, 'image_descs')[index - 1]);
	// 	// change the center image big url to mini url
	// 	$center_image.attr('src', $.data(document.body, 'mini_image_urls')[index]);
	// 	// 
	// 	$left_image.attr('src', $.data(document.body, 'medium_image_urls')[index -1]);
	// 	// set nav shielding
	// 	$nav_shielding_right.css('top', big_image_top + big_image_size[1]/2 -5 + 'px');
	// 	
	// 	// animation
	// 	$slide_show.children('#hiss_nav_right').remove();
	// 	
	// 	$nav_left.animate({
	//                'width' : '800px',
	// 		'height' : '800px',
	// 		'left' : '200px',
	// 		'top' : '0px'
	// 	}, 'normal');
	// 	
	// 	$left_image.animate({
	// 		'width' : big_image_size[0] + 'px',
	// 		'height' : big_image_size[1] + 'px',
	// 		'top'  : big_image_top + 'px',
	// 		'left' : (800 - big_image_size[0])/2 + 'px'
	// 	}, 'mormal');
	// 	
	// 	$nav_center.animate({
	// 		'width' : '100px',
	// 		'height' : '100px',
	// 		'left' : '1050px',
	// 		'top' : big_image_top + big_image_size[1]/2 -5 + 'px'
	// 	}, 'normal');
	// 	
	// 	$center_image.animate({
	// 		'width' : center_image_size[0] + 'px',
	// 		'height' : center_image_size[1] + 'px',
	// 		'left' : (100 - center_image_size[0])/2 + 'px',
	// 		'top' : (100 - center_image_size[1])/2 + 'px'
	// 	}, 'normal');  
	// 	
	// 	// set description
	// 	$hiss_image_description.hide();                       
	// 	var desc_width = (big_image_size[0] > 300)? big_image_size[0] : 300;                       			
	// 	$hiss_image_description.text($.data(document.body, 'image_descs')[index - 1]);			
	// 	$hiss_image_description.css({'top' : big_image_top + big_image_size[1] + 10 + 'px', 'width' : desc_width + 'px', 'left' : (1200 - desc_width)/2 + 'px'});
	// 	$hiss_image_description.fadeIn('slow');			
	// 	
	// 	$nav_center.attr('id', 'hiss_nav_right');
	// 	$nav_left.attr('id', 'hiss_nav_center');
	// 	// update selected index
	// 	$nav_image_index.text(index - 1);
	// 	             
	// 	// if there are more image at left.
	// 	if (index > 1) {
	// 		var $new_nav_left = $hiss_nav.clone(true);
	// 		$new_nav_left.attr('id', 'hiss_nav_left');
	// 		var $new_left_image = $new_nav_left.children('.hiss_nav_image');
	// 		// set image
	// 		var new_left_image_size = perfect_mini($.data(document.body, 'mini_image_sizes')[index - 2].split("x"), 100);
	// 		$new_left_image.attr('src', $.data(document.body, 'mini_image_urls')[index - 2]);
	// 		$new_left_image.css({
	// 			'width' : new_left_image_size[0] + 'px',
	// 			'height' : new_left_image_size[1] + 'px',
	// 			'left' : (100 - new_left_image_size[0])/2 + 'px',
	// 			'top' : (100 - new_left_image_size[1])/2 + 'px'
	// 		});
	// 		$new_nav_left.css({
	// 			'width' : '100px',
	// 			'height' : '100px',
	// 			'left' : '50px',
	// 			'top' : big_image_top + big_image_size[1]/2 - 5 + 'px'
	// 		});
	// 		                                              
	// 		$nav_shielding_left.css('top', $new_nav_left.css('top'));
	// 		
	// 		$new_nav_left.insertBefore($nav_shielding_left);
	// 		$new_nav_left.fadeIn();
	// 	};
	// 	
	// 	event.stopPropagation();
	// });   
	// 
	// 
	// $(window).on('resize', function(event) {
	// 	if ($slide_show_box.is(":visible")) {
	// 		$slide_show_box.css({
	// 			'width' : (($('body').width() > 1200)? $('body').width() : 1200) + 'px',
	// 			'height' : $(document).height() + 'px'
	// 		});
	// 		
	// 		// var slide_show_left = ($(window).width() - 1200)/2;
	// 		// $slide_show.css({
	// 		// 	'left' : ((slide_show_left > 0 )? slide_show_left : 0) + 'px'
	// 		// }); 
	// 	};
	// });
	// 
	// $('body').on('keydown', function(event) {
	// 	switch (event.which) {
	// 		// esc
	// 		case 27:                 
	// 			if ($slide_show_box.is(":visible")) {
	// 				exit_slide_show();
	// 			};
	// 		 	break;
	// 		// arrow left
	// 		case 37:
	// 		 	if ($slide_show_box.is(":visible")) {
	// 				$slide_show.children('#hiss_nav_right').click();
	// 			};
	// 		 	break;
	// 		// arrow right
	// 		case 39:
	// 		 	if ($slide_show_box.is(":visible")) {
	// 				$slide_show.children('#hiss_nav_left').click();
	// 			};
	// 			break; 
	// 	};
	// 	
	// 	event.stopPropagation();
	// });
	// 	
	
	$('#hw_comment_add_file').on('change', function(event) {
		var image_name = $(this).val().split('\\').pop();
		var extension = image_name.split('.').pop().toLowerCase();
		
		if ($.inArray(extension, ['jpg', 'jpeg', 'jpe', 'png', 'gif']) > -1) {
			$('#hw_add_commnet_image_form').submit();
			$('#hw_comment_add_image_tool').hide();
			var $uploaded_comment_image_box = $('#uploaded_comment_image_box');
			$uploaded_comment_image_box.show();
			$uploaded_comment_image_box.children('#uploaded_comment_image_delete').show();
			$uploaded_comment_image_box.children('#uploaded_comment_image_delete').css({'top' : '4px', 'right' : '4px'});
		} else {
			alert(tr('please upload picture with jpg, gif or png format'));
		}
		
	});
	
	var image_uploading = false;
	function reset_upload_comment_image_box() {
		
		image_uploading = false;
		
		$('#hw_comment_add_image_tool').show();
		var $uploaded_comment_image_box = $('#uploaded_comment_image_box');
		$uploaded_comment_image_box.hide();
		$uploaded_comment_image_box.children('#uploaded_comment_image').attr('src', "/images/image_32x32.png");			
		$uploaded_comment_image_box.children('#uplaoding_comment_image_loading').show();
		$('#hw_comment_add_file').attr('value', null);
		$.data(document.body, 'uploaded_comment_image_id', '');
	}
	
	$('#hw_add_commnet_image_form').iframePostForm( {
		iframeID: 'hw_add_comment_iframe',
		json : true,
		post: function() {
			$.data(document.body, 'upload_comment_image_cancled', false);
			$.data(document.body, 'upload_comment_image_success', false);
			image_uploading = true;
						
			return true;
		},
		complete: function(response) {
			var $uploaded_comment_image = $('#uploaded_comment_image');
			
			image_uploading = false;			
			
			if (response.success) {
				if (!($.data(document.body, 'upload_comment_image_cancled'))) {
					$.data(document.body, 'uploaded_comment_image_id', response.image_id);
					$uploaded_comment_image.attr('src', response.image_url);
					$uploaded_comment_image.siblings('#uplaoding_comment_image_loading').hide();
					$.data(document.body, 'upload_comment_image_success', true);
					var image_size = response.image_size.split("x");
					perfect_mini(image_size, 32);
					$uploaded_comment_image.css({'width' : image_size[0], 'height' : image_size[1], 
													'top' : (32 - image_size[1])/2 + 8 + 'px', 'left' : (32 - image_size[0])/2 + 'px'});
					$uploaded_comment_image.siblings('#uploaded_comment_image_delete').css({'top' : (32 - image_size[1])/2 + 'px', 'right' : (32 - image_size[0])/2 + 'px'});	
					
					// add comment text
					$('#hw_new_comment').click().focus();
				} else {
					$.ajaxQueue({
						url: '/hopeCommentImages/' + response.image_id,
						type: 'POST',
						data: {'_method' : 'DELETE'},
						dataType: 'json'
					});
				}
			} else {
				if (!($.data(document.body, 'upload_comment_image_cancled'))) {
					if(response.need_login) {
						user_login.try_to_login(function() {
							$('#hw_add_commnet_image_form').submit();
							$('#hw_comment_add_image_tool').hide();
							$('#uploaded_comment_image_box').show();
						}, tr('please login first'));
					} else {
						alert(response.errors[1]);
						reset_upload_comment_image_box();						
					}
				};
			}
		}
	});
	
	$('#uploaded_comment_image_box').on('click', '#uploaded_comment_image_delete', function() {
		var $this = $(this);
		// avoid double click
		$this.hide();
		
		var $uploading_comment_image_success = $(this).siblings('#uploaded_comment_image_success');
		if ($.data(document.body, 'upload_comment_image_success')) {
			$.ajaxQueue({
				url: '/hopeCommentImages/' + $.data(document.body, 'uploaded_comment_image_id'),
				type: 'POST',
				data: {'_method' : 'DELETE'},
				dataType: 'json',
				success: function(response) {
					if (response.success) {
						reset_upload_comment_image_box();
					} else {
						if (response.need_login) {
							user_login.try_to_login(function() {
								$('#uploaded_comment_image_delete').click();
							});
						} else {
							alert(response.errors[1]);
						}
					};
				},
				complete: function() {
					$this.css('display', 'block');
				}
			});
		// uploading in progress and user want to cancle it			
		} else {
			$.data(document.body, 'upload_comment_image_cancled', true);			
			reset_upload_comment_image_box();
		}
	});
	
	$('#hw_new_comment').on('textchange', function(event) {
		var $this = $(this);
		var $body_count = $this.siblings('#hw_new_comment_count');		
		
		var count = 300 - $.trim($this.val()).length;
		if (count < 0) {
			$body_count.css('color', 'red');
		} else {
			$body_count.css('color', 'gray');
		};
		$body_count.text(count);
		
		event.stopPropagation();
	});
	
	$('#hw_new_comment').on('click', function(event) {
		var $this = $(this);
		if (!$.data(document.body, 'comment_added')) {
			$this.css({'color' : 'black', 'font-size' : '12px'});
			$this.val('');
			$.data(document.body, 'comment_added', true);			
		};		
	
		event.stopPropagation();	
	});
	
	// get hope comments
	var get_hope_comments_complete = true;
	var get_all_the_comments_already = false;
	var $hope_comments_box = $('#hope_comments_box');
	var $hope_special_comments_box = $hope_comments_box.siblings('#hope_special_comments_box');
	var $hope_comment_original = $hope_comments_box.parent().siblings('#hope_comment_original');	
	
	// set fancybox show	
	$('.hope_comment_image').fancybox({
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
	
	function create_hope_comment_show(comment, user, image, $hope_comment_original) {
		var $hope_comment_copy = $hope_comment_original.clone(true, true);					

		$hope_comment_copy.attr('id', '');	
		// set basic info
		$hope_comment_copy.find('div.hope_comment_id').text(comment['_id']);
		// set comments info
		$hope_comment_tools = $hope_comment_copy.find('.hope_comment_tools');
		$hope_comment_tools.children('.hope_comment_likes_count').text(tr('&1 people', comment.likes));

		// set user name
		var $user_name = $hope_comment_copy.find('.hope_user_name');
		$user_name.text(user.username);		
		$user_name.attr('href', user.user_url);
		$user_name.attr('title', user.description);
		
		// set avatar
		var $avatar = $hope_comment_copy.find('img.hope_avatar');
		// TODO: set the avatar, need change all of it 
		// user.avatar_url	= null;
		if (user.avatar_url) {
			var avatar_size = [50, 50];
			if (user.avatar_size) {
				avatar_size = user.avatar_size.split("x");
				avatar_size = perfect_mini(avatar_size, 50);							
			}
			
			$avatar.attr({'width' : avatar_size[0] + 'px', 'height' : avatar_size[1] + 'px', 'src' : user.avatar_url});
			// $avatar.css('margin-left', (50 - avatar_size[0])/2 + 'px');
		}

		// set image and body
		var $hope_comment_body = $hope_comment_copy.find('span.hope_comment_body');
		var $image = $hope_comment_copy.find('.hope_comment_image');		
		if (comment.image_id) {
			// var image = images[comment.image_id];
			var image_size = perfect_mini(image['sizes']['mini'].split("x"), 110);
			var $image_thum = $image.children('.hope_comment_image_thum');
			
			$image_thum.css({'height' : image_size[1] + 'px', 'width' : image_size[0] + 'px', 'margin-left' : (110 - image_size[0])/2 + 'px'});
			// $image.css({'height' : image_size[1] + 'px', 'width' : image_size[0] + 'px'});				
			$image_thum.attr('src', image['mini_url']);
			$image.attr({'href' : image['medium_url']});
			
			$hope_comment_body.css('width', '496px');
		} else {
			$image.css('display', 'none');
			$hope_comment_body.css('width', '100%');
		};
		//set body
		if (comment.body) {
			$hope_comment_body.text(comment.body);
		};

		$hope_comment_copy.css('display', 'block');
		
		return $hope_comment_copy;
	}
	
	$('#hw_add_comment').on('click', function(event) {
				
		var $this = $(this);
		var $hw_new_comment = $('#hw_new_comment');
		if (image_uploading || !$.data(document.body, 'comment_added')) {
			return false;
		};
		
		var body = $.trim($hw_new_comment.val());
		if ((body.length == 0 && $.data(document.body, 'uploaded_comment_image_id') == '') || body.length > 300) {
			return false;
		};
		
		$this.hide();
		$.ajaxQueue({
			url: '/hopeComments',
			type: 'POST',
			data: {"hope_comment[body]" : $hw_new_comment.val(), "hope_comment[image_id]" : $.data(document.body, 'uploaded_comment_image_id'), 
					"hope_comment[hope_id]" : $.data(document.body,  'hope_id')},
			success: function(response) {
				if (response.success) {
					var $hope_comment_original = $('#hope_comment_original');
					$hw_new_comment.val(tr('I wanna say'));
					$hw_new_comment.css({'font-size' : '11px', 'color' : 'gray'});
					$this.siblings('#hw_new_comment_count').text(300);
					$.data(document.body, 'comment_added', false);					
					reset_upload_comment_image_box();
					
					var $hope_comment_copy = create_hope_comment_show(response.hope_comment, response.user, response.image, $hope_comment_original);
					
					$hope_comment_copy.css('display', 'none');
					if ($hope_special_comments_box.children().length > 0) {
						$hope_comment_copy.insertBefore($hope_special_comments_box.children()[0]);
					} else {
						$hope_comment_copy.appendTo($hope_special_comments_box);
					};
					$hope_comment_copy.slideDown();
					
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							$this.click();
						});
					} else {
						if (response.errors.too_many_comments_per_day) {
							alert(response.errors.too_many_comments_per_day);
						};
					};
				};
			},
			complete: function() {
				$this.show();
			}
		});
		
		event.stopPropagation();
		
		return true;
	});
	
	function get_hope_comments(comments_limit) {
		
		if (get_all_the_comments_already) {
			return false;
		};
		
		// calculate commnets limit
		var $window = $(window);
		// make the page to be need scroll, that the comments could be autoload by scroll of window.
		var comments_limit_temp = parseInt((($window.height() + $window.scrollTop()) - $hope_comment_autoload.offset().top)/98, 10) + 10;
		comments_limit = (comments_limit_temp > comments_limit)? comments_limit_temp : comments_limit;
		
		var $hope_comment_replies_loading_box = $('#hope_comment_replies_loading_box');
		$hope_comment_replies_loading_box.show();
		$hope_comment_replies_loading_box.siblings('#hope_comment_replies_loading_retry_box').hide();
		
		var skip = $.data(document.body, 'comments_skip');
		if(!skip) {
			skip = 0;
			$.data(document.body, 'comments_skip', 0);
		}
		get_hope_comments_complete = false;
		$.ajaxQueue({
			url: '/hopeComments?limit=' + comments_limit + '&hope_id=' + $.data(document.body, 'hope_id') + '&skip=' + skip,
			dataType: 'json',
			type: 'GET',
			success: function(response) {
				if (response.success) {
					$hope_comment_replies_loading_box.hide();
					var comments = response.comments;
					var images = response.images;
					var users = response.users;
					
					// set skip
					var comments_skip = $.data(document.body, 'comments_skip') + comments.length;
					$.data(document.body, 'comments_skip', comments_skip);

					for (var i in comments) {
						var comment = comments[i];
						create_hope_comment_show(comment, users[comment.user_id], images[comment.image_id], $hope_comment_original).appendTo($hope_comments_box);
					};
					
					// 
					if (comments.length === 0 || comments.length < comments_limit) {
						get_all_the_comments_already = true;
						return false;
					};
					
				} else {
					$hope_comment_replies_loading_box.siblings('#hope_comment_replies_loading_retry_box').show();
				};
			},
			error: function() {
				$hope_comment_replies_loading_box.hide();				
				$hope_comment_replies_loading_box.siblings('#hope_comment_replies_loading_retry_box').show();
			},
			complete: function() {
				$hope_comment_replies_loading_box.hide();
				get_hope_comments_complete = true;
			}
		});
		
		return true;
	}
	
	var $hope_comment_autoload = $('#hope_comment_autoload');
	function autoload_comments($window) {
		// alert($window.height() + $window.scrollTop())
		// alert($hope_comment_autoload.offset().top)
		if (($window.height() + $window.scrollTop()) > $hope_comment_autoload.offset().top) {
			if (get_hope_comments_complete) {
				get_hope_comments(25);
			};
		}
	}
	
	$(window).on('scroll', function() {
		autoload_comments($(this));
	});
	
	$('#hope_comment_replies_loading_retry_action').on('click', function(event) {
		var $this = $(this);
		
		$this.parent().hide();
		$this.siblings('#hope_comment_replies_loading_box').show();
		
		get_hope_comments(25);
		
		event.stopPropagation();
	});
	
	function click_to_like(event) {
		var $this = $(this);
		
		$.ajaxQueue({
			url: '/hopeCommentLikes',
			type: 'POST',
			data: {'hope_comment_id' : $this.parents('div.hope_comment').children('.hope_comment_id').text()},
			success: function(response) {
				if (response.success) {
					$this.off('click', click_to_like);
					$this.css({'color' : 'gray', 'font-weight' : 'normal'});
					$this.attr('title', '');
					var count = parseInt($this.siblings('.hope_comment_likes_count').text(), 10);
					if(count) {
						count++;
					} else {
						count = 1;
					}
					$this.siblings('.hope_comment_likes_count').text(tr('&1 people', count));
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							$this.click();	
						});
					} else if (response.liked) {
						$this.off('click', click_to_like);
						$this.css({'color' : 'gray', 'font-weight' : 'normal'});
						$this.attr('title', '');
					}
				};
			}
		});
		
		event.stopPropagation();
		}
	
	$('span.hope_comment_likes_sign').on('click', click_to_like);
	
	// TODO: test the scroll offset on ipad and iphone
	get_hope_comments(25);
});
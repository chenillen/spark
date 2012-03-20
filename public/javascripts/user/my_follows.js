$(function() {
	
	$('#user_home_menu').children('#my_follows').css('color', 'gray');
	
	var $autoload_follows_mark = $('#autoload_follows_mark');
	var $my_follows_show = $('#my_follows_show');
	var loading_follows_complete = true;
	var all_follows_loaded = false;
	
	function load_follows(limit) {
		if (all_follows_loaded) {
			return false;
		};
		
		var $window = $(window);
		var $autoload_follows_tools = $my_follows_show.siblings('#autoload_follows_tools');
		$autoload_follows_tools.children('#loading_follows_box').show();
		$autoload_follows_tools.children('#retry_loading_follows_box').hide();		
		
		follows_limit = parseInt(($window.height() + $window.scrollTop() - $autoload_follows_mark.offset().top)/100, 10) + 10;
		limit = (limit > follows_limit)? limit : follows_limit;
		
		loading_follows_complete = false
		$.ajaxQueue({
			url: '/home?reading=my_follows_json&limit=' + limit + '&skip=' + $my_follows_show.children().length,
			dataType: 'json',
			type: 'GET',
			success: function(response) {
				if (response.success) {
					$autoload_follows_tools.children('#loading_follows_box').hide();					
					
					var $my_follow_box_original = $my_follows_show.siblings('#my_follow_box_original');
					var follows = response.follows;
					var hopes_hash = response.hopes_hash;

					for(var i = 0; i < follows.length; i ++) {
						var follow = follows[i];						
						var hope = hopes_hash[follow.hope_id];
						
						if (hope) {
							var $my_follow_box_copy = $my_follow_box_original.clone(true, true);
							
							$my_follow_box_copy.attr('id', null);
							$my_follow_box_copy.children('.mf_hope_id').text(hope['_id']);
							$my_follow_box_copy.children('.mf_hope_title').text(hope.title);
							$my_follow_box_copy.children('.mf_hope_title').attr('href', '/hopes/' + hope['_id']);
							$my_follow_box_copy.children('.mf_hope_body').text(hope.body.substring(0, 200) + '.....');												
							$my_follow_box_copy.children('.mf_follow_id').text(follow['_id']);
							// set followers
							// if (hope.follows > 0) {
							// 	$my_follow_box_copy.children('.mf_follow_followers').text(tr('&1 followers', hope.follows)).css('display', 'block');								
							// };

							$my_follow_box_copy.appendTo($my_follows_show);	
						};
					}
					
					if (follows.length < limit) {
						all_follows_loaded = true;
					};
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							load_follows(limit);
						}, tr('Your session was timeout, please re-login'));
					} else {
						$autoload_follows_tools.children('#loading_follows_box').hide();
						$autoload_follows_tools.children('#retry_loading_follows_box').show();
					};
				};
			},
			error: function() {
				$autoload_follows_tools.children('#loading_follows_box').hide();
				$autoload_follows_tools.children('#retry_loading_follows_box').show();
			},
			complete: function() {
				loading_follows_complete = true;
			}
		})
	}
	
	$('#retry_loading_follows_action').on('click', function(event) {
		load_follows(25);
		
		event.stopPropagation();
	})
	
	$(window).on('scroll', function() {
		var $window = $(this);

		if (($window.height() + $window.scrollTop() - $autoload_follows_mark.offset().top) > 0) {
			if (loading_follows_complete) {
				load_follows(25);
			};
		};
	});
	
	$('.mf_hope_title').on('click', function(event) {
		window.location.href = '/hopes/' + $(this).siblings('.mf_hope_id').text();
		
		event.stopPropagation();
	});
		
	function unfollow($this) {
		$this.hide();

		$.ajaxQueue({
			url: '/hopeFollows/' + $this.parent().siblings('.mf_follow_id').text(),
			type: 'POST',
			dataType: 'json',
			data: {'_method' : 'DELETE'},
			success: function(response) {
				if (response.success) {
					var $follow_box = $this.parent().parent();
					$follow_box.slideUp().queue(function() {
						$follow_box.remove().dequeue();
					});
				} else {
					if(response.need_login) {
						user_login.try_to_login(function() {
							unfollow($this);
						}, tr('Your session was timeout, please login'));
					}
				};
			},
			complete: function() {
				$this.show();
			}
		});	
	}
	
	$('.mf_unfollow').on('click', function(event) {
		if (confirm(tr('Are you sure to unfollow?'))) {
			var $this = $(this);
			unfollow($this);
		}
		
		event.stopPropagation();		
	});
	
	load_follows(25);
})
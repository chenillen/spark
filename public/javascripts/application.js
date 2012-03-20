// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

// TODO: test it
function convert_date_by_second(date_by_second) {
	var date_now = new Date();
	var date = new Date(date_by_second*1000); 	
	seconds = parseInt((date_now.getTime())/1000 - date_by_second, 10);
	
	// less than one minute
	if (seconds < 60) {
		return tr('&1 seconds ago', seconds);
	// 	less than one hour
	} else if (seconds < 3600) {
		return tr('&1 minutes ago', parseInt(seconds/60, 10));
	// 	less than 24 hours(one day)
	} else if (seconds < 86400) {
		return tr('&1 hours ago', parseInt(seconds/3600, 10));
		
	// 	People don't know the meaning of '20 days ago' or '15 days ago', but they know the meaning of '3 days ago' or '6 days ago',
	//  beacuse they can measure it by week.
	//  less than one week
	} else if (seconds < 604800) {
		return tr('&1 days ago', parseInt(seconds/86400, 10));
	// 	others
	} else {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		
		if (minutes < 10) {
			minutes = '0' + minutes;
		};
		
		if (year == date_now.getFullYear()) {
			return month + '-' + day + ', ' + hours + ':' + minutes;
		};
		return year + '-' + month + '-' + day + ', ' + hours + ':' + minutes;
	}
	
}

function convert_date(date) {
	var date_now = new Date();
	seconds = parseInt((date_now.getTime())/1000 - (date.getTime())/1000, 10);
	
	// less than one minute
	if (seconds < 60) {
		return tr('&1 seconds ago', seconds);
	// 	less than one hour
	} else if (seconds < 3600) {
		return tr('&1 minutes ago', parseInt(seconds/60, 10));
	// 	less than 24 hours(one day)
	} else if (seconds < 86400) {
		return tr('&1 hours ago', parseInt(seconds/3600, 10));
		
	// 	People don't know the meaning of '20 days ago' or '15 days ago', but they know the meaning of '3 days ago' or '6 days ago',
	//  beacuse they can measure it by week.
	//  less than one week
	} else if (seconds < 604800) {
		return tr('&1 days ago', parseInt(seconds/86400, 10));
	// 	others
	} else {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		
		if (minutes < 10) {
			minutes = '0' + minutes;
		};
		
		if (year == date_now.getFullYear()) {
			return month + '-' + day + ' ' + hours + ':' + minutes;
		};
		return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
	}
	
}


function convert_date2(date) {
	var date_now = new Date();	
	
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	
	if (minutes < 10) {
		minutes = '0' + minutes;
	};
	
	if (seconds < 10) {
		seconds = '0' + seconds;
	};
	
	result = month + '-' + day + ' ' + hours + ':' + minutes + ":" + seconds;
	if (year == date_now.getFullYear()) {
		return result;
	} else {
		return year + "-" + result;
	}	
}

function global_date_by_second(date_by_second) {
	var date = new Date(date_by_second*1000);
	return convert_date2(date);
}

function global_date_by_second2(date_by_second) {
	var date = new Date(date_by_second*1000);
	return convert_date(date);
}

function global_date_by_string(date_string) {
	var date = new Date(date_string);
	return convert_date2(date);
}

function global_date_by_string2(date_string) {
	var date = new Date(date_string);
	return convert_date(date);
}

function perfect_mini(size, restrict_length) { 
	size[0] = parseFloat(size[0]);
 	size[1] = parseFloat(size[1]);
	
	if (size[0] >= size[1]) {
		if (size[0] > restrict_length) {
			size[1] *= restrict_length/size[0];
			size[0] = restrict_length;
		};
	} else {
		if (size[1] > restrict_length) {
			size[0] *= restrict_length/size[1];
			size[1] = restrict_length;
		};
	}
	return size;
}

function rtrim(str) {
	return str.replace(/\s+$/,"");
}                                 

function ltrim(str) {
	return str.replace(/^\s+/,"");
}              

function trim(str) {
	return ltrim(rtrim(str));
}                            

// $.val() have some special bugs
// Note: At present, using .val() on textarea elements strips carriage return characters from the browser-reported value. 
// When this value is sent to the server via XHR however, 
// carriage returns are preserved (or added by browsers which do not include them in the raw value). 
// A workaround for this issue can be achieved using a valHook as follows:
$.valHooks.textarea = {
    get: function( elem ) {
        return elem.value.replace( /\r?\n/g, "\r\n" );
    }
};

// login fields and functions
// var login_success, try_to_login, login_success_callback;
var user_login;
$(function() {
	
	// add csrf-token for ajax post
	$("body").bind("ajaxSend", function(elm, xhr, s){
	   if (s.type == "POST") {
	      xhr.setRequestHeader('X-CSRF-Token', $('meta[name=csrf-token]').attr("content"));
	   }
	});
	
	// fix the mobile safari offset problem
	// #TODO: fix the mobile safari offset problem
	// it doesn't work perfect on iphone, when there first loading view need scroll.
	if (/webkit.*mobile/i.test(navigator.userAgent)) {
	  (function($) {
	      $.fn.offsetOld = $.fn.offset;
	      $.fn.offset = function() {
	        var result = this.offsetOld();
	        result.top -= window.scrollY;
	        result.left -= window.scrollX;
	
	        return result;
	      };
	  })(jQuery);
	}
	
	var $login_wall_shielding = $('#login_wall_shielding');
	var $login_wall_exit = $login_wall_shielding.children('#login_wall_exit');
	var $login_wall = $login_wall_shielding.children('#login_wall');
	var $window = $(window);
	
	var get_new_messages_interval;
	function show_new_messages_count() {
		$.ajaxQueue({
			url: '/home?reading=new_messages_count',
			type: 'GET',
			dataType: 'JSON',
			success: function(response) {
				if (response.success) {
					var $user_home_link = $('#user_home_link');
					var new_messages_count = response.new_messages_count;

					var $new_messages_count_warp = null;
					if ($user_home_link.is(':visible') && (new_messages_count > 0)) {
						$new_messages_count_warp = $user_home_link.children('.new_messages_count_wrap');
						if (!($new_messages_count_warp.attr('class'))) {
							$new_messages_count_warp = $('#new_messages_count_wrap_original').clone(true, true);
							$new_messages_count_warp.attr('id', null);
							
							$new_messages_count_warp.appendTo($user_home_link);
						};
						
						$new_messages_count_warp.children('.new_messages_count').text(new_messages_count);
					} else {
						var $my_messages = $user_home_link.siblings('#user_home_menu').children('#my_messages');
						if ($my_messages.is(':visible') && (new_messages_count > 0)) {
							$new_messages_count_warp = $my_messages.children('.new_messages_count_wrap');
							if (!($new_messages_count_warp.attr('class'))) {
								// alert('hello');
								$new_messages_count_warp = $('#new_messages_count_wrap_original').clone(true, true);
								$new_messages_count_warp.attr('id', null);

								$new_messages_count_warp.appendTo($my_messages);
							};
							
							$new_messages_count_warp.children('.new_messages_count').text(new_messages_count);
						};
					};
				} else {
					if (response.need_login) {
						clearInterval(get_new_messages_interval);
					};
				};
			}
		});
	}
	
	function set_new_messages_interval() {
		// show_new_messages_count();
		setTimeout(show_new_messages_count, 2000);		
		
		clearInterval(get_new_messages_interval);
		get_new_messages_interval = setInterval(show_new_messages_count, 360000);
	}
	
	function Login() {
		var login_success_callback = null;
		var global_callbacks = [];
		
		this.try_to_login = function(login_succ_callback, login_message, hide_exit_door) {
			login_success_callback = login_succ_callback;
			$login_wall_shielding.css({'width' : $('body').width() + 'px', 'height' : get_browser_height()});
			login_message = login_message? login_message : tr('please login first');

			$login_wall.children('#login_info').text(login_message);

			if (hide_exit_door) {
				$login_wall_shielding.children('#login_wall_exit').hide();
			} else {
				$login_wall_shielding.children('#login_wall_exit').show();
			};
			$login_wall_shielding.fadeIn();		
			keep_login_wall_position();
		};
		
		this.add_global_callback = function(callback) {
			global_callbacks.push(callback);
		};
		
		this.login_success = function() {
			set_new_messages_interval();
			set_user_bar();
			if (login_success_callback) {
				login_success_callback();
				login_success_callback = null;			
			};
			$login_wall_shielding.fadeOut();
			var source = $(document).getUrlParam("source");
			
			if (source) {
				window.location.replace(source);
			} else {
				for (var i=0; i < global_callbacks.length; i++) {
					global_callbacks[i]();
				};
			}
		};
	}

	user_login = new Login();
		
	function keep_login_wall_position() {
		$login_wall.css('margin-top',  $window.scrollTop() + $window.height()/2 - 160 + 'px');
		$login_wall_exit.css('top', $window.scrollTop() + 10 + 'px');
	}
	
	function get_browser_height() {
		var document_height = $(document).height();
		var window_height = $window.height();
		return (document_height > window_height)? (document_height + 'px'):(window_height + 'px');
	}
	
	// function keep_home_bar_position() {
	// 	$home_bar_shielding.css('top',  $window.scrollTop() + $window.height() - 70 +'px');
	// }
	
	$window.on('scroll', function(event) {
		keep_login_wall_position();
		// keep_home_bar_position()
	});
	
	$window.on('resize', function() {
		$login_wall_shielding.width($('body').width());
		keep_login_wall_position();
		if ($(".shielding").is(":visible")) {
			$('.shielding').width($('body').width());
		};
	});
	
	$login_wall_shielding.on('click', '#login_wall_exit', function() {
		$login_wall_shielding.fadeOut();
	});
	
	$login_wall.on('click', function(event) {
		var $self = $(self);
		var id = event.target.id;

		if (id === 'sina_weibo_login_icon') {
			var window_left = ($window.width() - 600)/2;
			window_left = (window_left > 0)? window_left : 0;
			var window_top = ($window.height() - 390)/2 + 20;
			window_top = (window_top > 0)? window_top : 0;
			var win = window.open('https://api.weibo.com/oauth2/authorize?client_id=13450026&response_type=code&redirect_uri=http://xiwangbang.com/login?platform=SinaWeibo', 
									'login',
									'fullscreen=no,width=600px,height=435px' + ",left=" + window_left + 'px' + ",top=" + window_top + 'px'); 
			win.window.focus();
		} else if (id === "tencent_weibo_login_icon") {
			
		};
		
		event.stopPropagation();
	});
	
	$('body').on('keydown', function(event) {
		switch (event.which) {
			// esc
			case 27:
				if ($login_wall_shielding.is(":visible")) {
					$login_wall_shielding.fadeOut();
				};
			 	break;
		};
		
		event.stopPropagation();
	});
	var $header = $('#header');
	
	function set_user_bar() {
		var $user_bar = $header.find('#user_bar');
		
		var time_now = ((new Date()).getTime())/1000;
		if ((time_now - $.cookie('expires_time')) > 0) {
			$user_bar.hide();
			$user_bar.siblings('#login').show();
			$user_bar.siblings('#logout').hide();
			
			return false;
		};
		
		// set avatar
		var $avatar = $user_bar.children('#avatar');
		var avatar_url = $.cookie('avatar_url');
		if (avatar_url) {
			avatar_size = $.cookie('avatar_size');
			if (avatar_size) {
				avatar_size = perfect_mini($.cookie('avatar_size').split('x'), 30);					
			} else {
				avatar_size = [30, 30];
			}

			$avatar.attr({'width' : avatar_size[0] + 'px', 'height' : avatar_size[1] + 'px', 'src' : $.cookie('avatar_url')});
			$avatar.css('top', (39 - avatar_size[1])/2 + 'px');
		} else {
			$avatar.hide();
		};
		//set name
		$user_bar.children('#username').text($.cookie('username'));
		
		$user_bar.siblings('#login').hide();
		$user_bar.siblings('#logout').show();
		$user_bar.css('width', '').show();		
		
		return true;
	}
	
	$('#login').on('click', function(event) {
		user_login.try_to_login();
		
		event.stopPropagation();
	});
	
	function click_to_logout(event) {
		var $this = $(this);
		$this.off('click', click_to_logout);
		$this.css('opacity', 0);
		
		$.ajaxQueue({
			url: '/logout',
			type: 'POST',
			data: {'_method' : 'DELETE'},
			dataType: 'json',
			success: function(response) {
				if (response.success) {
					$this.hide();
					$this.siblings('#login').show();
					$this.siblings('#user_bar').animate({width: 0}, function() {
						$this.siblings('#user_bar').hide();
					});
				};
			},
			complete: function() {
				$this.on('click', click_to_logout);
				$this.css('opacity', 1);	
			}
		});
		
		event.stopPropagation();
	}
		
	$('#logout').on('click', click_to_logout);
	
	set_user_bar();
	set_new_messages_interval();
});
$(function() {
	var $user_bar = $('#user_bar');
	var $user_home_menu = $('#user_home_menu');
	var $user_home_box = $('#user_home_box');
	
	$user_bar.children('#user_home_link').hide();
	$user_home_menu.appendTo($user_bar);
	
	$user_home_menu.on('click', '.user_home_func', function(event) {
		var $this = $(this);
		
		// $user_home_menu.find('.user_home_func').removeClass('user_home_func_clicked');
		// $this.addClass('user_home_func_clicked');
		window.location.href = '/home?reading=' + $(this).attr('id');
		
		event.stopPropagation();
	});	
});
$(function() {
	
	$('#user_home_menu').children('#my_comments').css('color', 'gray');
	
	var $my_comments_home = $('#my_comments_home');
	
	$('.comment_image').fancybox({
		openEffect: 'none',
		closeEffect: 'elastic',
		type: 'image',
		closeClick: true,
		padding: 0,
		closeBtn: false,
		// closeSpeed: 'slow',
		helpers : {
			// overlay : null
		},
		// closeSpeed: 'normal',					
		tpl: {
			error: '<p class="fancybox-error">' + tr("The picture can't be loaded, please try again later.") +'</p>'
		}
	});
	
	$('.my_comment_show').hover(function() {
		$(this).find('.comment_remove').show();
	}, function() {
		$(this).find('.comment_remove').hide();
	});
	
	function remove_comment($this) {
		$.ajaxQueue({
			url: '/hopeComments/' + $this.parent().siblings('.comment_id').text(),
			type: 'POST',
			dataType: 'JSON',
			data: {'_method' : 'DELETE'},
			success: function(response) {
				if (response.success) {
					var $comment_box = $this.parent().parent();
					
					$comment_box.slideUp().queue(function() {
						$comment_box.remove();
					});
				} else {
					if (response.need_login) {
						user_login.try_to_login(function() {
							remove_comment($this);
						}, tr('Your session was timeout, please re-login'));
					}
				};
			}
		})
	}
	
	$('.comment_remove').on('click', function(event) {
		if (confirm(tr('Are you sure to delete this comment?'))) {
			var $this = $(this);			
			remove_comment($this);
		};
		
		event.stopPropagation();
	});
});
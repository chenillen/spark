$(function() {
	$('.update_image').fancybox({
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
});
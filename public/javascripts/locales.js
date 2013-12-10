var spark_locales = {
	'zh-CN' : {
		'is minimum &1 character(s)' : '最少&1个字',
		'is maximum &1 character(s)' : '最多&1个字',
		'can not be empty' : '不能为空',
		'please upload picture with jpg, gif or png format' : '请上传jpg/jpeg, gif, png格式图片',
		'maximum picture size is &1m' : '图片最大为&1m',
		'picture description' : '图片描述',
		'you can maximum select &1 pictures' : '您最多能选择&1张图片',
		'maximum &1 characters' : '最多&1字...',
		'Are you sure?' : '确定?',
		'Add comment' : '添加留言',
		'please login first' : '请先登陆',
		'Your session was timeout, please login' : '您的登陆已超时，请重新登陆',
		'I wanna say' : '我要留言...',
		'&1 people' : function(args) {
			if (args[1] == 0) {
				return '还没有人';
			};
			return args[1] + '人';
		},
		'&1(replies)' : function(args) {
			if (args[1] == 0) {
				return '还没有';
			};
			return args[1];
		},
		'Follow' : '关注',
		'Followed' : '已关注',
		'Unfollow' : '取消关注',
		'Share' : '转发',
		'&1 comments' : '条回复',
		// date
		'&1 seconds ago' : '&1秒钟前',
		'&1 minutes ago' : '&1分钟前',
		'&1 hours ago' : '&1小时前',
		'&1 days ago' : '&1天前',
		'Your session was timeout, please re-login' : '您的登陆已经超时，请重新登陆',
		'created at &1' : '创建于&1',
		'updated at &1' : '更新于&1',
		'Are you sure to delete this hope?' : '您确定要删除此文章么？',
		'Are you sure to delete this update?' : '您确定要删除此更新么？',
		'Are you sure to unfollow?' : '您确定要取消关注么？',
		'Are you sure to delete this image?' : '您确定要删除此图片么？',
		'Are you sure to delete this comment?' : '您确定要删除此评论么？',
		'&1 followers' : '&1人关注',
		'Finish' : '结束',
		'Finished' : '已结束',
		"The picture can't be loaded, please try again later." : "图片无法加载，请稍后重试。"
	},
	en : {
		'is minimum &1 character(s)' : function(args) {
			if (args[1] == 1) {
				return 'is minimum 1 character';
			};
			return 'is minimum ' + args[1] + ' characters';
		},
		'is maximum &1 character(s)' : function(args) {
			if (args[1] == 1) {
				return 'is maximum 1 character';
			};
			return 'is maximum' + args[1] + 'characters';
		},
		'can not be empty' : 'can not be empty',
		'please upload picture with jpg, gif or png format' : 'please select picture with jpg/jpeg, gif or png format',
		'maximum picture size is &1m' : "maximum picture size is &1m",
		'picture description' : 'picture description',
		'you can maximum select &1 pictures' : 'you can maximum select &1 pictures',
		'maximum &1 characters' : 'maximum &1 characters....',
		'Are you sure?' : 'Are you sure?',
		'Add comment' : 'Add comment',
		'please login first' : 'Please login',
		'Your session was timeout, please login' : 'Your session was timeout, please login',
		'I wanna say' : 'I wanna say....',
		'Follow' : 'Follow',
		'Followed' : 'Followed',
		'Unfollow' : 'Unfollow',
		'Share' : 'Share',
		'&1 people' : '&1 people ',
		'&1 comments' : function(args) {
			if (args[1] == 1) {
				return 'comment';
			};
			return 'comments';
		},
		// date
		'&1 seconds ago' : function() {
			if (args[1] <= 1) {
				return '1 second ago';
			};
			return args[1] + ' seconds ago';
		},
		'&1 minutes ago' : function() {
			if (args[1] <= 1) {
				return '1 minute ago';
			};
			return args[1] + ' minutes ago';
		},
		'&1 hours ago' : function() {
			if (args[1] <= 1) {
				return '1 hour ago';
			};
			return args[1] + ' hours ago';
		},
		'&1 days ago' : function() {
			if (args[1] <= 1) {
				return '1 day ago';
			};
			return args[1] + ' days ago';
		},
		'Your session was timeout, please re-login' : 'Your session was timeout, please re-login',
		'created at &1' : 'created at &1',
		'updated at &1' : 'updated at &1',
		'Are you sure to delete this hope?' : 'Are your sure to delete this hope?',
		'Are you sure to delete this update?' : 'Are you sure to delete this update?',
		'Are you sure to unfollow?' : 'Are you sure to unfollow?',
		'Are you sure to delete this image?' : 'Are you sure to delete this image?',
		'Are you sure to delete this comment?' : 'Are you sure to delete this comment',		
		'&1 followers' : function() {
			if (args[1] <= 1) {
				return '1 followers';
			};
			return args[1] + ' followers';
		},
		'Finish' : 'Finish',
		'Finished' : 'Finished',
		"The picture can't be loaded, please try again later." : "The picture can't be loaded, please try again later."
	}
};
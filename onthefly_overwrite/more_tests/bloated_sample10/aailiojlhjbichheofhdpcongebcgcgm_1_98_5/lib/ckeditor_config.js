(function(){
	'use strict';

	window.addEventListener('message', function (event) {
		if(event.origin !== 'https://www.youtube.com' || !event.data.ckeditor) {
			return;
		}

		CKEDITOR.disableAutoInline = true;

		if (window.freedom_ckeditor) {
			window.freedom_ckeditor.setReadOnly(false);
			return;
		}

		window.freedom_ckeditor = CKEDITOR.inline(event.data.id || 'freedom_content_editable', {
			customConfig: 'https://s3.amazonaws.com/heartbeat.asset/ckeditor/config.js'
		});
	}, false);
}());
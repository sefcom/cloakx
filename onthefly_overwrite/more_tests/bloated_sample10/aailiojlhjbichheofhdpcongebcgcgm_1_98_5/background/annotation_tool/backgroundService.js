window.chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'get_video_annotation') {
        annotationService.load_annotation(request.video_id, function(err, result) {
            sendResponse(err ? null : result);
        });
    }

    if (request.message === 'get_auth_token') {
        annotationService.get_auth_token(request.video_id, function(err, result) {
            sendResponse(err ? null : result);
        });
    }

    if (request.message === 'copy_annotation') {
        annotationService.copy_annotation(
            request.token,
            request.src_video,
            request.video,
            request.metadata,
            function(err, result) {
                sendResponse(err ? null : result);
            });
    }

    if (request.message === 'delete_annotation') {
        annotationService.delete_annotation(
            request.token,
            request.video,
            request.delete_all,
            function(err, result) {
                sendResponse(err ? null : result);
            });
    }

    if (request.message === 'make_videobar') {
        annotationService.make_videobar(
            request.token,
            request.video,
            request.template,
            function(err, result) {
                sendResponse(err ? null : result);
            });
    }

    return true;
});

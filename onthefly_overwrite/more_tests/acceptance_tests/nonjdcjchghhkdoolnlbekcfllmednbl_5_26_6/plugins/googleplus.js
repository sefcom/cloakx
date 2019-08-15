﻿var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Google+',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="proxy\?url="]',
            /.*proxy\?url=([^&]+).*/,
            '$1'
        );
        callback($(res));
    }
});
﻿var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Cyworld',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="thumb.cyworld.com"]',
            /.+(http:.*)/,
            '$1'
        );
        callback($(res));
    }
});

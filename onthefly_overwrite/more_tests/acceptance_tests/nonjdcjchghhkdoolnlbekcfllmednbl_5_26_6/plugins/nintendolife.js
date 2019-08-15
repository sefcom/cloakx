﻿var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Nintendo Life',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img, img.framed',
            /(icon|tiny|small)\./,
            'large.'
        );
        callback($(res));
    }
});
﻿var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'deviantART',
    prepareImgLinks:function (callback) {
        if (location.host.indexOf('deviantart.com') == -1) {
            $('a[href*=".deviantart.com/art/"], a[href^="http://fav.me/"]').one('mouseenter', function () {
                hoverZoom.prepareOEmbedLink(this, 'https://backend.deviantart.com/oembed?url=', this.href);
            });
        }
    }
});
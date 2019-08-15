var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Maxmodels',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="galerie"][src*="/m"], img[src*="galerie"][src*="/k"]',
            /\/(m|k)(\d+\.)/,
            '/p$2'
        );
        hoverZoom.urlReplace(res,
            'img[src*="miniatury"]',
            '/miniatury',
            ''
        );
        callback($(res));
    }
});
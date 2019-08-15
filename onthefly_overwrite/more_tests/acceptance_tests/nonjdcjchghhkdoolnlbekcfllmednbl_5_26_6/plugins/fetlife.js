var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'fetlife',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="flpics"]', /_\d+\.jpg/, '_958.jpg');
        callback($(res));
    }
});
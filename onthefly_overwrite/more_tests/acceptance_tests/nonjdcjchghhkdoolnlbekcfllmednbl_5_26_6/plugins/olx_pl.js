var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Olx.pl',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a.thumb img',
            /_\d+x\d+_/,
            '_1000x700_'
        );
        callback($(res));
    }
});
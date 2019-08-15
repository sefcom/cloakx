var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'deviantART',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[data-super-img]').each(function () {
            var _this = $(this),
                url = this.dataset.superImg;
            if (options.showHighRes && this.dataset.superFullImg)
                url = this.dataset.superFullImg;
            _this.data().hoverZoomSrc = [url];
            res.push(_this);
        });
        hoverZoom.urlReplace(res,
            'a:not([data-super-img]) img[src*="deviantart.net/fs"], [style*="deviantart.net/fs"]',
            /\/(fs\d+)\/\d+\w+\//,
            '/$1/',
            ':eq(0)'
        );
        callback($(res));
    }
});
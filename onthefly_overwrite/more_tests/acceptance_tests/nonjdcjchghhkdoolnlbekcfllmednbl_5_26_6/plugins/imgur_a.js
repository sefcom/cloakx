var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Imgur',
    prepareImgLinks:function (callback) {

        var res = [];

        function createUrls(hash) {
            var srcs = ['http://i.imgur.com/' + hash + '.jpg'];
            // Same array duplicated several times so that a retry is done if an image fails to load
            //return srcs.concat(srcs).concat(srcs).concat(srcs);
            return srcs;
        }
        
        function htmlDecode(input){
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.textContent;
        }

        function prepareImgLink() {
            var link = $(this), data = link.data(), href = link.attr('href');
            if (href.indexOf('gallery') == -1 && data.hoverZoomSrc) {
                return;
            }
            href = href.replace(/\?.*/, '');
            
            if (options.zoomVideos && (href.substr(-3) == 'gif' || href.substr(-4) == 'gifv')) {
                data.hoverZoomSrc = [href.replace(/\.gifv?/, '.mp4'), href];
                res.push(link);
            } else {
                var matches = href.match(/(?:\/(a|gallery|signin))?\/([^\W_]{5,8})(?:\/|\.[a-zA-Z]+|#([^\W_]{5,8}|\d+))?(\/new|\/all|\?\d*)?$/);
                if (matches && matches[2]) {

                    var view = matches[1];
                    var hash = matches[2];
                    var excl = ['imgur', 'forum', 'stats', 'signin', 'upgrade'];
                    if (excl.indexOf(hash) > -1) {
                        return;
                    }
                    
                    switch (view) {
                        case 'signin':
                            return;
                        case 'a': // album view:
                        case 'gallery':
                            var anchor = matches[3];
                            if (!anchor || anchor.match(/^\d+$/)) { // whole album or indexed image
                                $.getJSON('https://imgur.com/ajaxalbums/getimages/' + hash + '/hit.json?all=true', function(album) {
                                    if (album && album.data && Array.isArray(album.data.images)) {
                                        data.hoverZoomGallerySrc = [];
                                        data.hoverZoomGalleryCaption = [];
                                        album.data.images.forEach(function (img){
                                            var caption = img.title ? img.title : '';
                                            if (img.description) {
                                                if (caption) {
                                                    caption += ' - ';
                                                }
                                                caption += img.description;
                                            }
                                            data.hoverZoomGalleryCaption.push(htmlDecode(caption));
                                            data.hoverZoomGallerySrc.push(['https://i.imgur.com/' + img.hash + img.ext]); //(img.animated ? '.mp4' : img.ext)]);
                                            data.hoverZoomSrc = undefined;
                                        });
                                        callback($([link]));                                            
                                    }
                                });
                            }
                            break;
                        case undefined:
                        default: // single pic view
                            data.hoverZoomSrc = createUrls(hash);
                            res.push(link);
                    }
                }
            }
        }

        // Every sites
        $('a[href*="//imgur.com/"], a[href*="//www.imgur.com/"], a[href*="//i.imgur.com/"], a[href*="//m.imgur.com/"]').each(prepareImgLink);

        // On imgur.com (galleries, etc)
        if (window.location.host.indexOf('imgur.com') > -1) {
            hoverZoom.urlReplace(res, 'a img[src*="b."]', 'b.', '.');
            minSplitLength = 2;
            $('a[href*="/gallery/"]').each(prepareImgLink);
        }

        if (res.length) {
            callback($(res));
        }
    }

});

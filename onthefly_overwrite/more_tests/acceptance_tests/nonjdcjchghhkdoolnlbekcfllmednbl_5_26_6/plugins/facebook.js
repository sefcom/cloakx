var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Facebook',
    prepareImgLinks:function (callback) {

        $('img[src*="fbcdn"]:not(.spotlight), img[src*="fbexternal"], [style*="fbcdn"]:not([data-reactid]), [style*="fbexternal"]').each(function () {
            var img = $(this),
                link = img.parents('a'),
                data = link.data();
            if (!data || data.hoverZoomSrc || link.hasClass('UFICommentLink') || link.hasClass('messagesContent') || link.attr('href').indexOf('notif') != -1) return;

            var src = hoverZoom.getThumbUrl(this),
                origSrc = src;
            if (src.indexOf('safe_image.php') > -1) {
                src = unescape(src.substr(src.lastIndexOf('&url=') + 5));
                if (src.indexOf('?') > -1) {
                    src = src.substr(0, src.indexOf('?'));
                }
                if (src.indexOf('&') > -1) {
                    src = src.substr(0, src.indexOf('&'));
                }
                // Picasa hosted images
                if (src.indexOf('ggpht.com') > -1 || src.indexOf('blogspot.com') > -1) {
                    src = src.replace(/\/s\d+(-c)?\//, options.showHighRes ? '/s0/' : '/s800/');
                }
                // Youtube images
                if (src.indexOf('ytimg.com') > -1) {
                    src = src.replace(/\/(\d|(hq)?default)\.jpg/, '/0.jpg');
                }
            } else {
                var reg = src.match(/\d+_(\d+)_\d+/);
                if (reg) {
                    //src = 'https://www.facebook.com/photo/download/?fbid=' + reg[1];
                    hoverZoom.prepareFromDocument(link, 'https://mbasic.facebook.com/photo.php?fbid=' + reg[1], function(doc) {
                        var links = doc.querySelectorAll('a[href*="fbcdn"]');
                        return links.length > 0 ? links[links.length-1].href : false;
                    });                    
                }
            }

            data.hoverZoomSrc = [src];
            link.addClass('hoverZoomLink');
        });

        /*function fetchPhoto(link, attr) {
            var regex = /fbid=(\d+).*.?/, matches = regex.exec(link.attr(attr)), fbid = matches.length > 1 ? matches[1] : '';
            if (fbid) {
                hoverZoom.prepareFromDocument(link, 'https://mbasic.facebook.com/photo.php?fbid=' + fbid, function(doc) {
                    var links = doc.querySelectorAll('a[href*="fbcdn"]');
                    return links.length > 0 ? links[links.length-1].href : false;
                });
            } else {
                var url = link.attr(attr).replace('photo.php', 'photo/download/');
                link.data().hoverZoomSrc = [url];
                link.addClass('hoverZoomLink');
            }
        }

        $('a[href*="/photo.php"]').one('mouseover', function () {
            var link = $(this);
            fetchPhoto(link, 'href');
        });

        $('a[ajaxify*="&fbid="]').one('mouseover', function () {
            var link = $(this);
            fetchPhoto(link, 'ajaxify');
        });*/

        $('a[ajaxify*="src="]:not(.coverWrap)').one('mouseover', function () {
            var link = $(this),
                data = link.data();
            if (data.hoverZoomSrc) {
                return;
            }
            var key, src = link.attr('ajaxify');
            if (!options.showHighRes && src.indexOf('smallsrc=') > -1)
                key = 'smallsrc=';
            else
                key = 'src=';
            src = src.substr(src.indexOf(key) + key.length);
            src = unescape(src.substr(0, src.indexOf('&')));
            data.hoverZoomSrc = [src];
            link.addClass('hoverZoomLink');
        });

        function getTooltip(link) {
            var tooltip = link.find('[title], [alt]').add(link.parent('[title], [alt]')).add(link);
            var tooltipText = tooltip.attr('title') || tooltip.attr('alt');
            if (tooltipText) {
                return tooltipText;
            }
            tooltip = link.find('.uiTooltipText:eq(0)');
            var filter = '.actorName:eq(0), .passiveName:eq(0), .ego_title:eq(0), .uiAttachmentTitle:eq(0), .UIIntentionalStory_Names:eq(0), .fsl:eq(0)';
            if (!tooltip.text()) {
                tooltip = link.parent().find(filter).eq(0);
            }
            if (!tooltip.text()) {
                tooltip = link.parent().parent().find(filter).eq(0);
            }
            while (tooltip.children().length) {
                tooltip = tooltip.children().eq(0);
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.album:eq(0)').find('.desc a');
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.UIObjectListing:eq(0)').find('.UIObjectListing_Title');
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.UIStoryAttachment:eq(0)').find('.UIStoryAttachment_Title');
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.buddyRow:eq(0)').find('.UIImageBlock_Content');
            }
            return tooltip.text();
        }
    }
});
// This plugin makes use of the eBay API

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'eBay',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        var appId = 'RomainVa-3007-4951-b943-aaedf0d9af84';
        var requestUrlBase = 'http://open.api.ebay.com/shopping?appid=' + appId + '&version=687&siteid=0&callname=GetMultipleItems&responseencoding=JSON&ItemID=';
        var itemIndex = 0;
        var hzItems = [], itemIds = [];
        var cachePrefix = 'cache_eBayItem_' + (options.showHighRes ? 'hi' : 'lo') + '_';

        hoverZoom.urlReplace(res,
            'img[src*="~~"]',
            /~~(\d+)?_\d+\./,
            '~~$1_32.'
        );

        function getIdFromURL(url) {
            if (!url) {
                return false;
            }
            var reg = url.match(/\d{9,12}/);
            if (!reg) {
                return false;
            }
            return reg[0];
        }

        // First we gather all the products on the page and we store their eBay ID and
        // the link that will receive the 'hoverZoomSrc' data.
        $('a img[src*="ebaystatic.com"]').each(function () {
            var img = $(this);
            if (img.hasClass('imgPrv') || img.parents('.hol').length) {
                return;
            }
            var item = { thumb:this, id:'' },
                link = img.parents('a[href*=".ebay."]:eq(0)');
            if (!link.length) {
                link = $(this).parents('table:eq(0)').find('a[href*=".ebay."]');
            }
            if (!link.length) {
                link = $(this).parents('div:eq(0)').find('a[href*=".ebay."]');
            }
            item.id = getIdFromURL(link.attr('href'));
            if (item.id) {
                itemIds.push(item.id);
                hzItems.push(item);
            }
        });

        // Check if some urls were stored
        for (var i = 0; i < hzItems.length; i++) {
            var storedItem = localStorage[cachePrefix + hzItems[i].id];
            if (storedItem) {
                storedItem = JSON.parse(storedItem);
                var thumb = $(hzItems[i].thumb), data = thumb.data();
                data.hoverZoomSrc = [storedItem.pictureUrl];
                data.hoverZoomCaption = storedItem.title;
                res.push(thumb);
                hzItems.splice(i, 1);
                i--;
            }
        }
        if (res.length > 0) {
            callback($(res));
            res = [];
        }

        // Then we make calls to the eBay API to get details on the items
        // using the IDs we found
        function getItems() {

            // Each call can get a maximum number of 20 items, so we have to iterate
            var indexEnd = Math.min(itemIndex + 20, itemIds.length);
            var itemBunch = itemIds.slice(itemIndex, indexEnd);
            itemIndex = indexEnd;
            var requestUrl = requestUrlBase + itemBunch.join(',');
            //console.log('requestUrl: ' + requestUrl);

            // Ajax calls are made through the background page (not possible from a content script)
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (data) {
                //console.log(data);
                var getMultipleItemsResponse = JSON.parse(data);
                if (getMultipleItemsResponse.Errors)
                    return;
                for (var i = 0; i < getMultipleItemsResponse.Item.length; i++) {
                    var item = getMultipleItemsResponse.Item[i];
                    //console.log(item);
                    for (var j = 0; j < hzItems.length; j++) {
                        if (hzItems[j].id == item.ItemID && item.PictureURL && item.PictureURL.length > 0) {
                            var thumb = $(hzItems[j].thumb), data = thumb.data(), url = item.PictureURL[0].replace(/~~(\d+)?_\d+\./, '~~$1_32.');
                            data.hoverZoomSrc = [url];
                            data.hoverZoomCaption = item.Title;
                            //console.log(thumb);
                            res.push(thumb);

                            // Items are stored to lessen API calls
                            localStorage[cachePrefix + item.ItemID] = JSON.stringify({pictureUrl:url, title:item.Title});
                        }
                    }
                }
                callback($(res));
                res = [];
                if (itemIndex < itemIds.length) {
                    // Continue with the next 20 items
                    getItems();
                }
            });
        }

        if (hzItems.length > 0) {
            getItems();
        }
    }
});
var APITracking = {
    apiRoute : '/tracking',

    searchAttachmentTracking : function(page, pageSize, filter, sort) {
        var command = this.apiRoute + '/attachment/search';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(filter) {
            data.filter = JSV.stringify(filter);
        }
        if(sort) {
            data.sort = JSV.stringify(sort);
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    searchMessageTracking : function(page, pageSize, filter, sort) {
        var command = this.apiRoute + '/message/search';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(filter) {
            data.filter = JSV.stringify(filter);
        }
        if(sort) {
            data.sort = JSV.stringify(sort);
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    searchUserTracking : function(page, pageSize, filter, sort) {
        var command = this.apiRoute + '/user/search';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(filter) {
            data.filter = JSV.stringify(filter);
        }
        if(sort) {
            data.sort = JSV.stringify(sort);
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    searchTracking : function(page, pageSize, filter, sort) {
        var command = this.apiRoute + '/search';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(filter) {
            data.filter = JSV.stringify(filter);
        }
        if(sort) {
            data.sort = JSV.stringify(sort);
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    }
};

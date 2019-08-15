var ServiceTracking = {

    bind : function() {
        App.vent.on('api:search:tracking:attachment', this.searchAttachmentTracking, this);
        App.vent.on('api:search:tracking:message', this.searchMessageTracking, this);
        App.vent.on('api:search:tracking:user', this.searchUserTracking, this);
        App.vent.on('api:search:tracking', this.searchTracking, this);
    },

    unbind : function() {
        App.vent.off('api:search:tracking:attachment', this.searchAttachmentTracking, this);
        App.vent.off('api:search:tracking:message', this.searchMessageTracking, this);
        App.vent.off('api:search:tracking:user', this.searchUserTracking, this);
        App.vent.off('api:search:tracking', this.searchTracking, this);
    },

    searchAttachmentTracking : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        var request = APITracking.searchAttachmentTracking(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceTracking.searchAttachmentTracking_, vCallback);
    },

    searchAttachmentTracking_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:tracking:attachment:complete', response);
    },

    searchMessageTracking : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        var request = APITracking.searchMessageTracking(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceTracking.searchMessageTracking_, vCallback);
    },

    searchMessageTracking_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:tracking:message:complete', response);
    },

    searchUserTracking : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        var request = APITracking.searchUserTracking(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceTracking.searchUserTracking_, vCallback);
    },

    searchUserTracking_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:tracking:user:complete', response);
    },

    searchTracking : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        var request = APITracking.searchTracking(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceTracking.searchTracking_, vCallback);
    },

    searchTracking_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:tracking:complete', response);
    }
};

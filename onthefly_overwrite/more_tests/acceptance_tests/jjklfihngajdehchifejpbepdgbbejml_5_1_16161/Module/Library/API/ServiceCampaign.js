var ServiceCampaign = {

    bind : function() {
        App.vent.on('api:get:campaign', this.getCampaign, this);
        App.vent.on('api:search:campaigns', this.searchCampaigns, this);
        App.vent.on('api:create:campaign', this.createCampaign, this);
        App.vent.on('api:update:campaign', this.updateCampaign, this);


        App.vent.on('api:start:campaign', this.startCampaign, this);
        App.vent.on('api:stop:campaign', this.stopCampaign, this);
        App.vent.on('api:add:campaign:recipients', this.addCampaignRecipients, this);
        App.vent.on('api:remove:campaign:recipients', this.removeCampaignRecipients, this);
        App.vent.on('api:search:campaign:recipients', this.searchCampaignRecipients, this);
    },

    unbind : function() {
        App.vent.off('api:get:campaign', this.getCampaign, this);
        App.vent.off('api:search:campaigns', this.searchCampaigns, this);
        App.vent.off('api:create:campaign', this.createCampaign, this);
        App.vent.off('api:update:campaign', this.updateCampaign, this);

        App.vent.off('api:start:campaign', this.startCampaign, this);
        App.vent.off('api:stop:campaign', this.stopCampaign, this);
        App.vent.off('api:add:campaign:recipients', this.addCampaignRecipients, this);
        App.vent.off('api:remove:campaign:recipients', this.removeCampaignRecipients, this);
        App.vent.off('api:search:campaign:recipients', this.searchCampaignRecipients, this);
    },

    getCampaign : function({guid}, vCallback){
        var request = APICampaign.searchCampaigns(1, 1, {
            campaignGuids: [guid]
        }, false);
        MessagingAPI.handleRequest(request, ServiceCampaign.getCampaign_, vCallback);

        return request.request;
    },

    getCampaign_ : function(response, vCallback){
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:get:campaign:complete', response);
    },

    //https://awsdev.betasabrina.com/mshltestingservice/api/json/metadata?op=SearchCampaigns
    searchCampaigns : function({page, pageSize, filter, sort}, vCallback) {
        var request = APICampaign.searchCampaigns(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceCampaign.searchCampaigns_, vCallback);

        return request.request;
    },

    searchCampaigns_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:campaigns:complete', response);
    },

    //https://awsdev.betasabrina.com/mshltestingservice/api/json/metadata?op=CreateCampaign
    createCampaign : function({name, mode}, vCallback) {
        var request = APICampaign.createCampaign(name, mode);
        MessagingAPI.handleRequest(request, ServiceCampaign.createCampaign_, vCallback);

        return request.request;
    },

    createCampaign_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:create:campaign:complete', response);
    },

    //https://awsdev.betasabrina.com/mshltestingservice/api/json/metadata?op=UpdateCampaign
    updateCampaign : function({guid, name}, vCallback) {
        var request = APICampaign.updateCampaign(guid, name);
        MessagingAPI.handleRequest(request, ServiceCampaign.updateCampaign_, vCallback);

        return request.request;
    },

    updateCampaign_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:update:campaign:complete', response);
    },

    startCampaign : function({guid}, vCallback) {
        var request = APICampaign.startCampaign(guid);
        MessagingAPI.handleRequest(request, ServiceCampaign.startCampaign_, vCallback);

        return request.request;
    },

    startCampaign_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:start:campaign:complete', response);
    },

    stopCampaign : function({guid}, vCallback) {
        var request = APICampaign.stopCampaign(guid);
        MessagingAPI.handleRequest(request, ServiceCampaign.stopCampaign_, vCallback);

        return request.request;
    },

    stopCampaign_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:stop:campaign:complete', response);
    },

    addCampaignRecipients : function({guid, emailAddresses}, vCallback) {
        var request = APICampaign.addCampaignRecipients(guid, emailAddresses);
        MessagingAPI.handleRequest(request, ServiceCampaign.addCampaignRecipients_, vCallback);

        return request.request;
    },

    addCampaignRecipients_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:add:campaign:recipients:complete', response);
    },

    removeCampaignRecipients : function({guid, emailAddresses, removeAll, recallMessagesSent}, vCallback) {
        var request = APICampaign.removeCampaignRecipients(guid, emailAddresses, removeAll, recallMessagesSent);
        MessagingAPI.handleRequest(request, ServiceCampaign.removeCampaignRecipients_, vCallback);

        return request.request;
    },

    removeCampaignRecipients_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:remove:campaign:recipients:complete', response);
    },

    searchCampaignRecipients : function({guid, page, pageSize, criteria, statuses}, vCallback) {
        var request = APICampaign.searchCampaignRecipients(guid, page, pageSize, criteria, statuses);
        MessagingAPI.handleRequest(request, ServiceCampaign.searchCampaignRecipients_, vCallback);

        return request.request;
    },

    searchCampaignRecipients_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:campaign:recipients:complete', response);
    }
};

if (typeof module != "undefined" && module.exports) {
    module.exports = ServiceCampaign;
} else {
    window.ServiceCampaign = ServiceCampaign;
}

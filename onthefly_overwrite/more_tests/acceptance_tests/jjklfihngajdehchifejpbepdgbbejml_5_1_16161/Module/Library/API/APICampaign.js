var APICampaign = {
    apiRoute : '/campaigns',

    searchCampaigns : function(page, pageSize, filter, sort) {
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
    },

    createCampaign : function(name, mode) {
        var command = this.apiRoute;
        var data = {};
        if(name) {
            data.name = name;
        }
        if(mode) {
            data.mode = mode;
        } else {
            data.mode = 'Automatic';
        }

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    updateCampaign : function(guid, name) {
        var command = this.apiRoute + '/' + guid;
        var data = {
            campaignGuid: guid
        };
        if(name) {
            data.name = name;
        }

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },

    startCampaign : function(guid) {
        var command = this.apiRoute + '/' + guid + '/start';
        var data = {
            campaignGuid: guid
        };

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    stopCampaign : function(guid) {
        var command = this.apiRoute + '/' + guid + '/stop';
        var data = {
            campaignGuid: guid
        };

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    addCampaignRecipients : function(guid, emails) {
        var command = this.apiRoute + '/' + guid + '/recipients';
        var data = {
            campaignGuid: guid,
            emailAddresses: emails
        };

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    removeCampaignRecipients : function(guid, emails, removeAll, recallMessagesSent) {
        var command = this.apiRoute + '/' + guid + '/recipients';
        var data = {
            campaignGuid: guid,
			   emails: emails,
            recallMessagesSent: recallMessagesSent,
            removeAll: !!removeAll
        };

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'DELETE', data);
    },

    searchCampaignRecipients : function(guid, page, pageSize, criteria, statuses) {
        var command = this.apiRoute + '/' + guid + '/recipients';
        var data = {
            campaignGuid: guid
        };

        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(criteria) {
            data.searchCriteria = criteria;
        }
        if(statuses) {
            data.statuses = JSV.stringify(statuses);
        }

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    }
};

if (typeof module != "undefined" && module.exports) {
    module.exports = APICampaign;
} else {
    window.APICampaign = APICampaign;
}

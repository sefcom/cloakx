var APIService = {
    publicRoute : '/public',
    apiRoute : '/service',
    /*
    getServiceConfiguration : function() {
        var command = this.publicRoute + this.apiRoute + "/configuration";
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },
    */
    getServicePublicSettings : function() {
        var command = this.publicRoute + this.apiRoute + "/settings";
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },    
    getServiceSettings : function() {
        var command = this.apiRoute + "/settings";
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    }
};

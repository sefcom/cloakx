var API = {
    publicRoute : '/public',
    apiRoute : '',

    getAuthData : function(authGuid) {
        var command = this.apiRoute + '/authdata/' + authGuid;
        var data = {
                authGuid : authGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    getData : function(token) {
        var command = this.apiRoute + '/data/' + token;
        var data = {
            token : token
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    login : function(username, password) {
        var command = this.apiRoute + "/login";
        var data = {
            username : username,
            password : password,
            cookieless: MessagingAPI.cookieless
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    authenticate : function() {
        var command = this.apiRoute + "/authenticate";
        var data = {
            authenticationToken: MessagingAPI.authToken,
            cookieless: MessagingAPI.cookieless
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },


    pingVPS : function(vps) {
        var command = this.apiRoute + this.publicRoute + "/ping";
        return MessagingAPI.requestVPS(vps, command, 'GET');
    },

    ping : function() {
        var command = this.apiRoute + this.publicRoute + "/ping";
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET');
    },

    cping : function() {
        var command = this.apiRoute + "/ping";
        return MessagingAPI.request(MessagingAPI.ssoUrl, command, 'GET');
    },
    logoutProxy : function() {
        var command = this.apiRoute + "/logout";
        var data = {};
        return MessagingAPI.proxyRequest(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    logout : function() {
        var command = this.apiRoute + "/logout";
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    publicAuthenticateSSOUser : function(emailAddress, password) {
        var command = this.publicRoute + '/sso';
        var data = {
            emailAddress : emailAddress,
            password : password
        };
        return MessagingAPI.request(MessagingAPI.ssoUrl, command, 'POST', data);
    },

    publicGetSSOUser : function(emailAddress, serviceGuid) {
        var command = this.publicRoute + '/sso';
        var data = {
            emailAddress : emailAddress
        };
        if(serviceGuid) {
            data.serviceGuid = serviceGuid;
        }
        return MessagingAPI.request(MessagingAPI.ssoUrl, command, 'GET', data, true);
    },

    publicGetService : function(guid) {
        var command = this.publicRoute + "/services/" + guid;
        var data = {
            'serviceGuid': guid
        };
        return MessagingAPI.request(MessagingAPI.ssoUrl, command, 'GET', data);
    },

    publicGetServiceSingle : function(code) {
        var command = this.publicRoute + "/services/single";
        var data = {
            'serviceCode': code
        };
        return MessagingAPI.request(MessagingAPI.ssoUrl, command, 'GET', data, true);
    },

    searchService : function(code) {
        var command = this.apiRoute + "/services/";
        var data = {
            'code': code
        };
        return MessagingAPI.request(MessagingAPI.ssoUrl, command, 'GET', data, true);
    }
};

if (typeof module != "undefined" && module.exports) {
    module.exports = API;
} else {
    window.API = API;
}

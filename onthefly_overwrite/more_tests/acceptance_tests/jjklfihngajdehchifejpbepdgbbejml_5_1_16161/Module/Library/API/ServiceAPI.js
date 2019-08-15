var ServiceAPI = {

    bindEvent : function() {
        this.unbindEvent();
        ServiceAPI.bind();
        ServiceAttachment.bind();
        ServiceMessage.bind();
        if (typeof ServiceCampaign != 'undefined')
            ServiceCampaign.bind();
        ServiceService.bind();
        ServiceTracking.bind();
        ServiceUser.bind();
        E2Service.bindEvent();
    },

    unbindEvent : function() {
        ServiceAPI.unbind();
        ServiceAttachment.unbind();
        ServiceMessage.unbind();
        if (typeof ServiceCampaign != 'undefined')
            ServiceCampaign.unbind();
        ServiceService.unbind();
        ServiceTracking.unbind();
        ServiceUser.unbind();
        E2Service.unbindEvent();
    },

    bind : function() {
        App.vent.on('api:public:get:service', this.publicGetService, this);
        App.vent.on('api:public:get:sso:user', this.publicGetSSOUser, this);
        App.vent.on('api:public:get:sso:user:service', this.publicGetSSOUserService, this);
        App.vent.on('api:public:auth:sso:user', this.publicAuthenticateSSOUser, this);
        App.vent.on('api:ping:vps', this.pingVPS, this);
        App.vent.on('api:ping', this.ping, this);
        App.vent.on('api:cping', this.ping, this);
        App.vent.on('api:login', this.login, this);
        App.vent.on('api:auth', this.authenticate, this);
        App.vent.on('api:auth:renew', this.authenticateRenew, this);
        App.vent.on('api:logout:proxy', this.logoutProxy, this);
        App.vent.on('api:logout', this.logout, this);
        App.vent.on('api:search:service', this.searchService, this);
        App.vent.on('api:public:get:single:service', this.publicGetServiceSingle, this);
        App.vent.on('api:set:session:token', MessagingAPI.setSessionToken);
        App.vent.on('api:get:auth:data', this.getAuthData, this);
        App.vent.on('api:get:data', this.getData, this);
    },

    unbind : function() {
        App.vent.off('api:public:get:service', this.publicGetService, this);
        App.vent.off('api:public:get:sso:user', this.publicGetSSOUser, this);
        App.vent.off('api:public:get:sso:user:service', this.publicGetSSOUserService, this);
        App.vent.off('api:public:auth:sso:user', this.publicAuthenticateSSOUser, this);
        App.vent.off('api:ping:vps', this.pingVPS, this);
        App.vent.off('api:ping', this.ping, this);
        App.vent.off('api:cping', this.ping, this);
        App.vent.off('api:login', this.login, this);
        App.vent.off('api:auth', this.authenticate, this);
        App.vent.on('api:auth:renew', this.authenticateRenew, this);
        App.vent.off('api:logout:proxy', this.logoutProxy, this);
        App.vent.off('api:logout', this.logout, this);
        App.vent.off('api:search:service', this.searchService, this);
        App.vent.off('api:public:get:single:service', this.publicGetServiceSingle, this);
        App.vent.off('api:set:session:token', MessagingAPI.setSessionToken);
        App.vent.off('api:get:auth:data', this.getAuthData, this);
        App.vent.off('api:get:data', this.getData, this);
    },


    publicGetService : function(guid, vCallback) {
        var request = API.publicGetService(guid);
        MessagingAPI.handleRequest(request, ServiceAPI.publicGetService_, vCallback);
    },

    publicGetService_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:public:get:service:complete', response);
    },

    publicGetSSOUserService : function(emailAddress, serviceGuid, vCallback) {
        var request = API.publicGetSSOUser(emailAddress, serviceGuid);
        MessagingAPI.handleRequest(request, ServiceAPI.publicGetSSOUserService_, vCallback);
        return request.request;
    },

    publicGetSSOUserService_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:public:get:sso:user:service:complete', response);
    },

    publicGetSSOUser : function(emailAddress, vCallback) {
        var request = API.publicGetSSOUser(emailAddress);
        MessagingAPI.handleRequest(request, ServiceAPI.publicGetSSOUser_, vCallback);
        return request.request;
    },

    publicGetSSOUser_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:public:get:sso:user:complete', response);
    },

    publicAuthenticateSSOUser : function(emailAddress, password, vCallback) {
        var request = API.publicAuthenticateSSOUser(emailAddress, password);
        MessagingAPI.handleRequest(request, ServiceAPI.publicAuthenticateSSOUser_, vCallback);
        return request.request;
    },

    publicAuthenticateSSOUser_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:public:auth:sso:user:complete', response);
    },

    pingVPS : function(vps, vCallback) {
        vps = vps.replace('/services/api.aspx', '');
        var request = API.pingVPS(vps);
        MessagingAPI.handleRequest(request, ServiceAPI.pingVPS_, vCallback);
        return request.request;
    },
    pingVPS_ : function(response, vCallback) {
        if (response && response.version) {
            var version = "/v1";
            /*
             * var version = response.version; if (version.indexOf('/') > -1) {
             * version = version.substr(version.indexOf('/')); } else { version =
             * "/" + version; }
             */
            MessagingAPI.apiVersion = version;
            MessagingAPI.buildVersion = response.build;
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:ping:vps:complete', response);
    },

    ping : function(vCallback) {
        var request = API.ping();
        MessagingAPI.handleRequest(request, ServiceAPI.ping_, vCallback);
        return request.request;
    },
    ping_ : function(response, vCallback) {
        if (response && response.version) {
            var version = "/v1";
            /*
             * var version = response.version; if (version.indexOf('/') > -1) {
             * version = version.substr(version.indexOf('/')); } else { version =
             * "/" + version; }
             */
            MessagingAPI.apiVersion = version;
            MessagingAPI.buildVersion = response.build;
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:ping:complete', response);
    },

    cping : function(vCallback) {
        var request = API.cping();
        MessagingAPI.handleRequest(request, ServiceAPI.cping_, vCallback);
        return request.request;
    },
    cping_ : function(response, vCallback) {
        if (response && response.version) {
            var version = "/v1";
            /*
             * var version = response.version; if (version.indexOf('/') > -1) {
             * version = version.substr(version.indexOf('/')); } else { version =
             * "/" + version; }
             */
            MessagingAPI.cccVersion = version;
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:cping:complete', response);
    },

    login : function(username, password, vCallback) {
        var request = API.login(username, password);
        MessagingAPI.handleRequest(request, ServiceAPI.login_, vCallback);
        return request.request;
    },
    login_ : function(response, vCallback) {
        if (response && !response.responseStatus) {
            E2Service.token = response.sessionToken;
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:login:complete', response);
    },

    authenticate : function(vCallback) {
        var request = API.authenticate();
        MessagingAPI.handleRequest(request, ServiceAPI.authenticate_, vCallback);
    },
    authenticate_ : function(response, vCallback) {
        if (response && !response.responseStatus) {
            E2Service.token = response.sessionToken;
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:auth:complete', response);
    },

    authenticateRenew : function(vCallback) {
        var request = API.authenticate();
        MessagingAPI.handleRequest(request, ServiceAPI.authenticateRenew_, vCallback);
    },

    authenticateRenew_ : function(response, vCallback) {
        if (response && !response.responseStatus) {
            App.setPreferences({
                token: response.sessionToken
            });
            E2Service.token = response.sessionToken;
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:auth:renew:complete', response);
    },


    logoutProxy : function(vCallback) {
        var request = API.logoutProxy();
        MessagingAPI.handleRequest(request, ServiceAPI.logoutProxy_, vCallback);
    },
    logoutProxy_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:logout:proxy:complete', response);
    },

    logout : function(vCallback) {
        var request = API.logout();
        MessagingAPI.handleRequest(request, ServiceAPI.logout_, vCallback);
    },
    logout_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:logout:complete', response);
    },

    searchService : function(code, vCallback) {
        var request = API.searchService(code);
        MessagingAPI.handleRequest(request, ServiceAPI.searchService_, vCallback);
        return request.request;
    },

    searchService_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:search:service:complete', response);
    },

    publicGetServiceSingle : function(code, vCallback) {

        var useCached;
        if (App.getPreferences) {
            var encodeResponse = App.getPreferences().publicgetservicesingle;
            try {
                var response = JSON.parse(encodeResponse);
                if(typeof response == "object") {
                    useCached = true;
                }

                if(useCached) {
                    if (vCallback) {
                        vCallback(response);
                    }
                    vCallback = function() {
                    };
                }
            } catch (e) {

            }
        }

        var request = API.publicGetServiceSingle(code);
        MessagingAPI.handleRequest(request, ServiceAPI.publicGetServiceSingle_, vCallback);
        return request.request;
    },

    publicGetServiceSingle_ : function(response, vCallback) {
        //save it

        if (App.setPreferences) {
            if (response && !response.responseStatus) {
                var encodeResponse = JSON.stringify(response);
                App.setPreferences({'publicgetservicesingle': encodeResponse});
            }
        }
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:public:get:single:service:complete', response);
    },

    getAuthData : function(authGuid, vCallback) {
        var request = API.getAuthData(authGuid);
        MessagingAPI.handleRequest(request, ServiceAPI.getAuthData_, vCallback);
        return request.request;
    },

    getAuthData_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:get:auth:data:complete', response);
    },

    getData : function(token, vCallback) {
        var request = API.getData(token);
        MessagingAPI.handleRequest(request, ServiceAPI.getData_, vCallback);
        return request.request;
    },

    getData_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:get:data:complete', response);
    },
};

if (typeof module != "undefined" && module.exports) {
    module.exports = ServiceAPI;
} else {
    window.ServiceAPI = ServiceAPI;
}

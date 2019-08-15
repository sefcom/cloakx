var ServiceService = {

    bind : function() {
        Application.vent.subscribe('api:public:get:service:settings', this.getServicePublicSettings, this);
        Application.vent.subscribe('api:get:service:settings', this.getServiceSettings, this);
    },

    unbind : function() {
        Application.vent.unsubscribe('api:public:get:service:settings', this.getServicePublicSettings, this);
        Application.vent.unsubscribe('api:get:service:settings', this.getServiceSettings, this);
    },

    Data : {
    // public_settings : {},
    // settings : {}
    },
    /*
     * getServiceConfiguration : function(vCallback) { var request =
     * APIService.getServiceConfiguration(); MessagingAPI.handleRequest(request,
     * ServiceService.getServiceConfiguration_, vCallback); },
     * 
     * getServiceConfiguration_ : function(response, vCallback) {
     * //console.log('=== getServiceConfiguration_ ===');
     * //console.log(response); vCallback(response); },
     */

    getServicePublicSettings : function(vCallback) {
        var useCached;
        if (App.getPreferences) {
            var encodeResponse = App.getPreferences().servicepublicsettings;
            try {
                var response = JSON.parse(encodeResponse);
                var now = new Date().getTime();
                if(response.timestamp && (response.timestamp + 60 * 60 * 1000) > now) {
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

        var request = APIService.getServicePublicSettings();
        MessagingAPI.handleRequest(request, ServiceService.getServicePublicSettings_, vCallback);
    },

    getServicePublicSettings_ : function(response, vCallback) {
        // console.log('=== getServicePublicSettings_ ===');

        if (response && !response.responseStatus) {
            ServiceService.Data.public_settings = response;
            ServiceService.Data.settings = response;
            if (App.setPreferences) {
                response.timestamp = new Date().getTime();
                var encodeResponse = JSON.stringify(response);
                App.setPreferences({'servicepublicsettings': encodeResponse});
            }
        }
        if(vCallback) {
            vCallback(response);
        }
        Application.vent.publish('api:public:get:service:settings:complete', response);
    },

    getServiceSettings : function(vCallback) {
        var request = APIService.getServiceSettings();
        MessagingAPI.handleRequest(request, ServiceService.getServiceSettings_, vCallback);
    },

    getServiceSettings_ : function(response, vCallback) {
        // console.log('=== getServiceSettings_ ===');
        if (response && !response.responseStatus) {
            ServiceService.Data.private_settings = response;
        }
        if(vCallback) {
            vCallback(response);
        }
        Application.vent.publish('api:get:service:settings:complete', response);
    }
};

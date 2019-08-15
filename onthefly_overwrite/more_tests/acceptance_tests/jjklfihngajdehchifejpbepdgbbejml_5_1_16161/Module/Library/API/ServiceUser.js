var ServiceUser = {
    Data : {
    // settings : {}
    },

    bind : function() {
        App.vent.on('api:public:get:quickregistration', this.getQuickRegistration, this);
        App.vent.on('api:user:aliases:confirm', this.confirmUserAlias, this);
        App.vent.on('api:remove:user:alias', this.removeUserAlias, this);
        App.vent.on('api:promote:user:alias', this.promoteUserAlias, this);
        App.vent.on('api:add:user:alias', this.addUserAlias, this);
        App.vent.on('api:get:user:alias', this.getUserAlias, this);
        App.vent.on('api:confirm:registration', this.confirmRegistration, this);
        App.vent.on('api:register:user', this.registerUser, this);
        App.vent.on('api:expire:auth:token', this.expireAuthenticationToken, this);
        App.vent.on('api:expire:auth:tokens', this.expireAuthenticationTokens, this);
        App.vent.on('api:get:new:authentication:token', this.getNewAuthenticationToken, this);
        App.vent.on('api:update:user:settings', this.updateUserSettings, this);
        App.vent.on('api:get:user:settings', this.getUserSettings, this);
        App.vent.on('api:forget:password', this.forgetPassword, this);
        App.vent.on('api:reset:password', this.resetPassword, this);
        App.vent.on('api:update:password', this.updatePassword, this);
        App.vent.on('api:get:user:contacts', this.getUserContacts, this);
        App.vent.on('api:activeate:user:message', this.activateUserMessage, this);
    },

    unbind : function() {
        App.vent.off('api:public:get:quickregistration', this.getQuickRegistration, this);
        App.vent.off('api:user:aliases:confirm', this.confirmUserAlias, this);
        App.vent.off('api:remove:user:alias', this.removeUserAlias, this);
        App.vent.off('api:promote:user:alias', this.promoteUserAlias, this);
        App.vent.off('api:add:user:alias', this.addUserAlias, this);
        App.vent.off('api:get:user:alias', this.getUserAlias, this);
        App.vent.off('api:confirm:registration', this.confirmRegistration, this);
        App.vent.off('api:register:user', this.registerUser, this);
        App.vent.off('api:expire:authentication:token', this.expireAuthenticationToken, this);
        App.vent.off('api:expire:authentication:tokens', this.expireAuthenticationTokens, this);
        App.vent.off('api:get:new:authentication:token', this.getNewAuthenticationToken, this);
        App.vent.off('api:update:user:settings', this.updateUserSettings, this);
        App.vent.off('api:get:user:settings', this.getUserSettings, this);
        App.vent.off('api:forget:password', this.forgetPassword, this);
        App.vent.off('api:reset:password', this.resetPassword, this);
        App.vent.off('api:update:password', this.updatePassword, this);
        App.vent.off('api:get:user:contacts', this.getUserContacts, this);
        App.vent.off('api:activeate:user:message', this.activateUserMessage, this);
    },

    getQuickRegistration : function(token, vCallback) {
        var request = APIUser.getQuickRegistration(token);
        MessagingAPI.handleRequest(request, ServiceUser.getQuickRegistration_, vCallback);
    },

    getQuickRegistration_ : function(response, vCallback) {
        if (vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:public:get:quickregistration:complete', response);
    },

    confirmUserAlias : function(token, password, vCallback) {
        var request = APIUser.confirmUserAlias(token, password);
        MessagingAPI.handleRequest(request, ServiceUser.confirmUserAlias_, vCallback);
    },

    confirmUserAlias_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:user:aliases:confirm:complete', response);
    },

    removeUserAlias : function(email, vCallback) {
        var request = APIUser.removeUserAlias(email);
        MessagingAPI.handleRequest(request, ServiceUser.removeUserAlias_, vCallback);
    },
    removeUserAlias_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:remove:user:alias:complete', response);
    },

    promoteUserAlias : function(email, opword, npword, vCallback) {
        var request = APIUser.promoteUserAlias(email, opword, npword);
        MessagingAPI.handleRequest(request, ServiceUser.promoteUserAlias_, vCallback);
    },
    promoteUserAlias_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:promote:user:alias:complete', response);
    },

    addUserAlias : function(email, vCallback) {
        var request = APIUser.addUserAlias(email);
        MessagingAPI.handleRequest(request, ServiceUser.addUserAlias_, vCallback);
    },
    addUserAlias_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:add:user:alias:complete', response);
    },

    getUserAlias : function(vCallback) {
        var request = APIUser.getUserAlias();
        MessagingAPI.handleRequest(request, ServiceUser.getUserAlias_, vCallback);
    },
    getUserAlias_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:get:user:alias:complete', response);
    },

    confirmRegistration : function(token, vCallback) {
        var request = APIUser.confirmRegistration(token);
        MessagingAPI.handleRequest(request, ServiceUser.confirmRegistration_, vCallback);
    },
    confirmRegistration_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:confirm:registration:complete', response);
    },

    resendRegistration : function(token, emailAddress, vCallback) {
        var request = APIUser.resendRegistration(token, emailAddress);
        MessagingAPI.handleRequest(request, ServiceUser.confirmRegistration_, vCallback);
    },
    resendRegistration_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:resend:registration:complete', response);
    },

    registerUser : function(emailAddress, firstName, lastName, password, quickRegistrationKey, craCode, language, terms, vCallback) {
        firstName = striptags(firstName);
        lastName = striptags(lastName);
        var request = APIUser.registerUser(emailAddress, firstName, lastName, password, quickRegistrationKey, craCode, language, terms);
        MessagingAPI.handleRequest(request, ServiceUser.registerUser_, vCallback);
    },
    registerUser_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:register:user:complete', response);
    },

    expireAuthenticationToken : function(vCallback) {
        var request = APIUser.expireAuthenticationToken();
        MessagingAPI.handleRequest(request, ServiceUser.expireAuthenticationToken_, vCallback);
    },
    expireAuthenticationToken_ : function(response, vCallback) {
        if (response && !response.responseStatus) {
            MessagingAPI.setAuthToken('');
        }
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:expire:auth:token:complete', response);
    },

    expireAuthenticationTokens : function(vCallback) {
        var request = APIUser.expireAuthenticationTokens();
        MessagingAPI.handleRequest(request, ServiceUser.expireAuthenticationTokens_, vCallback);
    },
    expireAuthenticationTokens_ : function(response, vCallback) {
        if (response && !response.responseStatus) {
            MessagingAPI.setAuthToken('');
        }
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:expire:auth:tokens:complete', response);
    },

    getNewAuthenticationToken : function(vCallback) {
        var request = APIUser.getNewAuthenticationToken();
        MessagingAPI.handleRequest(request, ServiceUser.getNewAuthenticationToken_, vCallback);
    },
    getNewAuthenticationToken_ : function(response, vCallback) {
        // console.log('=== getNewAuthenticationToken_ ===');
        // console.log(response);
        if (response && !response.responseStatus) {
            MessagingAPI.setAuthToken(response.authenticationToken);
        }
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:get:new:authentication:token:complete', response);
    },

    updateUserSettings : function(settings, vCallback) {
        var request = APIUser.updateUserSettings(settings);
        MessagingAPI.handleRequest(request, ServiceUser.updateUserSettings_, vCallback);
    },
    updateUserSettings_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:update:user:settings:complete', response);
    },

    forgetPassword : function(emailAddress, vCallback) {
        var request = APIUser.forgetPassword(emailAddress);
        MessagingAPI.handleRequest(request, ServiceUser.forgetPassword_, vCallback);
    },
    forgetPassword_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:forget:password:complete', response);
    },

    resetPassword : function(token, password, vCallback) {
        var request = APIUser.resetPassword(token, password);
        MessagingAPI.handleRequest(request, ServiceUser.resetPassword_, vCallback);
    },
    resetPassword_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:reset:password:complete', response);
    },

    updatePassword : function(oldPassword, newPassword, vCallback) {
        var request = APIUser.updatePassword(oldPassword, newPassword);
        MessagingAPI.handleRequest(request, ServiceUser.updatePassword_, vCallback);
    },
    updatePassword_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:update:password:complete', response);
    },

    getUserContacts : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var request = APIUser.getUserContacts(page, pageSize);
        MessagingAPI.handleRequest(request, ServiceUser.getUserContacts_, vCallback);
    },
    getUserContacts_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:get:user:contacts:complete', response);
    },

    getUserSettings : function(vCallback) {
        var request = APIUser.getUserSettings();
        MessagingAPI.handleRequest(request, ServiceUser.getUserSettings_, vCallback);
    },
    getUserSettings_ : function(response, vCallback) {
        // console.log("==== getUserSettings_ ====");
        // console.log(response);
        if (response && !response.responseStatus) {
            ServiceUser.Data.settings = response;
        }
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:get:user:settings:complete', response);
    },
    activateUserMessage : function(vCallback) {
        var request = APIUser.activateUserMessage();
        MessagingAPI.handleRequest(request, ServiceUser.activateUserMessage_, vCallback);
    },
    activateUserMessage_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.publish('api:activeate:user:message:complete', response);
    }
};

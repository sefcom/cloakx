var APIUser = {
    publicRoute : '/public',
    apiRoute : '/user',
    apiRoute2 : '/users',

    getQuickRegistration : function(token) {
        var command = this.publicRoute + this.apiRoute2 + "/quickregistration";
        var data = {
            'quickRegistrationToken': token
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    confirmUserAlias : function(token, password) {
        var command = this.apiRoute + '/aliases/confirm';
        var data = {
            confirmationToken : token
        };
        if(password && password.length) {
            data.password = password;
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    removeUserAlias : function(email) {
        var command = this.apiRoute + '/aliases';
        var data = {
            emailAlias : email
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'DELETE', data);
    },
    promoteUserAlias : function(email, opword, npword) {
        var command = this.apiRoute + '/aliases';
        var data = {
            emailAlias : email,
            oldPassword : opword,
            newPassword : npword
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },
    addUserAlias : function(email) {
        var command = this.apiRoute + '/aliases';
        var data = {
            emailAlias : email
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    getUserAlias : function() {
        var command = this.apiRoute + '/aliases';
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },

    confirmRegistration : function(token) {
        var command = this.publicRoute + this.apiRoute2 + '/registration';
        var data = {
            registrationConfirmationToken : token
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },

    resendRegistration : function(token, emailAddress) {
        var command = this.publicRoute + this.apiRoute2 + '/registration/resendconfirmation';
        var data = {};

        if (emailAddress) {
            data.emailAddress = emailAddress;
        }

        if (token) {
            data.registrationConfirmationToken = token;
        }

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    registerUser : function(emailAddress, firstName, lastName, password, quickRegistrationKey, craCode, language, terms) {
        var command = this.publicRoute + this.apiRoute2 + '/registration';
        var data = {
            emailAddress : emailAddress,
            firstName : striptags(firstName),
            lastName : striptags(lastName),
            password : password,
            quickRegistrationKey : quickRegistrationKey,
            craCode : craCode,
            language : language,
            termsAccepted : terms
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
    expireAuthenticationToken : function() {
        var command = this.apiRoute + "/authenticationtoken";
        var data = {
            authenticationToken : MessagingAPI.authToken
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'DELETE', data);
    },
    expireAuthenticationTokens : function() {
        var command = this.apiRoute + "/authenticationtokens";
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'DELETE', data);
    },
    getNewAuthenticationToken : function() {
        var command = this.apiRoute + "/authenticationtoken";
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },
    updateUserSettings : function(settings) {
        var command = this.apiRoute + '/settings';
        var data = settings;
        if (data.firstName) {
            data.firstName = striptags(data.firstName).replace(/&amp;/g, '&')
        }
        if (data.lastName) {
            data.lastName = striptags(data.lastName).replace(/&amp;/g, '&')
        }
        if (data.signatureHtml) {
            data.signatureHtml = striptags(data.signatureHtml, MessagingAPI.allowedTags, true);
        }
        if (data.outOfOfficeMessage) {
            data.outOfOfficeMessage = striptags(data.outOfOfficeMessage, MessagingAPI.allowedTags, true);
        }
        /*
         * { firstName : settings.firstName, lastName : settings.lastName,
         * language : settings.language, autoRetrieveMessage :
         * settings.autoRetrieveMessage, outOfOfficeEnabled :
         * settings.outOfOffice.enabled, outOfOfficeMessage :
         * settings.outOfOffice.message };
         */
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },
    forgetPassword : function(emailAddress) {
        var command = this.publicRoute + this.apiRoute2 + '/forgotpassword';
        var data = {
            emailAddress : emailAddress
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
    resetPassword : function(forgotPasswordToken, newPassword) {
        var command = this.publicRoute + this.apiRoute2 + '/resetpassword';
        var data = {
            forgotPasswordToken : forgotPasswordToken,
            newPassword : newPassword
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
    updatePassword : function(oldPassword, newPassword) {
        var command = this.apiRoute + '/updatepassword';
        var data = {
            oldPassword : oldPassword,
            newPassword : newPassword
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);

    },
    getUserContacts : function(page, pageSize) {
        var command = this.apiRoute + '/contacts';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },
    getUserSettings : function() {
        var command = this.apiRoute + '/settings';
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },
    activateUserMessage : function() {
        var command = this.apiRoute + '/activationmessage';
        var data = {};
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    }
};

var printFn = function() {
    console.log(arguments);
};

var MessagingAPI = {
    vpsUrl : SSO_URL,
    ssoUrl : SSO_URL,
    authToken : '',
    apiRoute : '/api',
    apiVersion : '/v1',
    cookieless : true,
    versionLabel: {
        P4: '5.13.15327.1',
        P5: '5.15.15352.1',
        MARCH2016: '5.20.*',
        MAY2016: '5.30.*'
    },
    allowedTags : ["a","abbr","address","area","article","audio","b","br","caption","cite","code","col","colgroup","data","dd","del","dfn","div","dl","dt","em","figcaption","figure","footer","h1","h2","h3","h4","h5","h6","header","hgroup","hr","i","img","ins","kbd","li","map","mark","nav","ol","p","pre","q","samp","section","small","span","strong","sub","sup","table","tbody","td","tfoot","th","thead","time","tr","u","ul","var","video"],
    versionCompare : function(v1, v2) {
        if (v1 == v2) {
            return 0;
        }

        v1 = v1.split('.');
        v2 = v2.split('.');
        var same = 0, v1v, v2v;
        for(var i = 0; i < v1.length && same === 0; i++) {
            if(typeof v2[i] == "undefined") {
                same = 1;
            } else if(v1[i] != v2[i]) {
                v1v = parseInt(v1[i]);
                v2v = parseInt(v2[i]);

                if (isNaN(v1v))
                    v1v = -1

                if (isNaN(v2v))
                    v2v = -1

                if(v1v < v2v) {
                    same = -1;
                } else if (v1v > v2v) {
                    same = 1;
                }
            }
        }

        if(same === 0) {
            if(v1.length < v2.length) {
                same = 1;
            }
        }
        return same;
    },



    resetVPSUrl : function() {
        MessagingAPI.vpsUrl = MessagingAPI.ssoUrl;
        MessagingAPI.apiVersion = '';
    },

    checkVpsUrl : function() {
        var urlparser = window.location.href.split('/');
        var base_url = urlparser[2];
        var service_code = false;
        if (urlparser.length > 3) {
            service_code = urlparser[3];
        }

        if (service_code) {
            var vpsurl = "https://" + base_url + "/" + service_code;
            Application.setPreferences({
                apiUrl : vpsurl
            });
        }
    },

    setSessionToken : function(token) {
        Application.sessionToken = token;
        E2Service.token = token;
    },

    setAuthToken : function(token) {
        MessagingAPI.authToken = token;
        E2Service.authKey = token;
    },

    proxyRequest : function(url, command, type, data, plain, header) {
        // Enable CORS withCrediential for legacy API
        Application.shouldEnableCors(true);
        var me = this;
        var cmd = '';
        if (url == me.ssoUrl) {
            cmd = url + me.apiRoute + command;
        } else if (url == me.vpsUrl) {
            cmd = url + me.apiRoute + me.apiVersion + command;
        }
        if (command == "/public/ping") {
            cmd = url + me.apiRoute + command;
        }

        var request = jQuery.ajax({
            async: true,
            url : cmd,
            type : type,
            crossDomain : true,
            data : (plain) ? data : JSON.stringify(data),
            traditional : (plain) ? true : false,
            contentType : 'application/json',
            dataType : 'json',
            beforeSend : function(x) {
                x.setRequestHeader("Accept", "application/json");
                if (Application && Application.sessionToken) {
                    x.setRequestHeader("X-sm-session-token", Application.sessionToken);
                }

                if (Application && Application.proxySessionToken) {
                    x.setRequestHeader("X-sm-session-token", Application.proxySessionToken);
                }

                if (url != me.ssoUrl) {
                    x.setRequestHeader('x-sm-client-name', 'WebApp');
                    x.setRequestHeader('x-sm-client-version', Version.VERSION);
                }

                if (header && header.length) {
                    for(var i = 0; i < header.length; i++) {
                        x.setRequestHeader(header[i].title, header[i].value);
                    }
                }

                // x.setRequestHeader("Content-Type", "application/json");
                // if(typeof sso != 'boolean' || !sso) {
                // x.setRequestHeader("MsgApiVersion", me.apiVersion);
                // }
            }
        });

        return {
            request : request,
            json : JSON.stringify(data)
        };
    },

    requestAttachment : function(url, command, name, download, data, plain, header) {
        // Enable CORS withCrediential for legacy API
        var type = 'GET';
        Application.shouldEnableCors(true);
        var me = this;
        var cmd = '';
        if (url == me.ssoUrl) {
            cmd = url + me.apiRoute + command;
        } else if (url == me.vpsUrl) {
            cmd = url + me.apiRoute + me.apiVersion + command;
        }
        if (command == "/public/ping") {
            cmd = url + me.apiRoute + command;
        }

        var datalist = [];
        if (data) {
            for( var key in data) {
                datalist.push(key + "=" + data[key]);
            }
        }
        if (datalist.length) {
            for(var i = 0; i < datalist.length; i++) {
                if (i == 0) {
                    cmd += "?";
                } else {
                    cmd += "&";
                }
                cmd += datalist[i];
            }
        }
        var request = new XMLHttpRequest();
        request.open('GET', cmd, true);
        request.responseType = 'arraybuffer'
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader('x-sm-client-name', 'WebApp');
        request.setRequestHeader('x-sm-client-version', Version.VERSION);

        if (Application && Application.sessionToken) {
            request.setRequestHeader("X-sm-session-token", Application.sessionToken);
        } else if (Application.getPreferences && Application.getPreferences().token) {
            request.setRequestHeader("X-sm-session-token", Application.getPreferences().token);
        }



        return {
            request : request,
            json : JSON.stringify(data),
            guid : data.attachmentGuid,
            chunk : data.chunkNumber,
            name : name,
            download : download
        };
    },
    requestVPS : function(url, command, type, data, plain, header) {
        // Enable CORS withCrediential for legacy API
        Application.shouldEnableCors(true);
        var me = this;
        var cmd = '';

        var request = jQuery.ajax({
            async: true,
            url : url + me.apiRoute + command,
            type : type,
            crossDomain : true,
            data : (plain) ? data : JSON.stringify(data),
            traditional : (plain) ? true : false,
            contentType : 'application/json',
            dataType : 'json',
            beforeSend : function(x) {
                x.setRequestHeader("Accept", "application/json");
                if (Application && Application.sessionToken) {
                    x.setRequestHeader("X-sm-session-token", Application.sessionToken);
                } else if (Application.getPreferences && Application.getPreferences().token) {
                    x.setRequestHeader("X-sm-session-token", Application.getPreferences().token);
                }



                x.setRequestHeader('x-sm-client-name', 'WebApp');
                x.setRequestHeader('x-sm-client-version', Version.VERSION);

                if (header && header.length) {
                    for(var i = 0; i < header.length; i++) {
                        x.setRequestHeader(header[i].title, header[i].value);
                    }
                }

                // x.setRequestHeader("Content-Type", "application/json");
                // if(typeof sso != 'boolean' || !sso) {
                // x.setRequestHeader("MsgApiVersion", me.apiVersion);
                // }
            }
        });

        return {
            request : request,
            json : JSON.stringify(data)
        };
    },
    request : function(url, command, type, data, plain, header) {
        // Enable CORS withCrediential for legacy API
        Application.shouldEnableCors(true);
        var me = this;
        var cmd = '';
        var sso = false;
        if (url == me.ssoUrl) {
            cmd = url + me.apiRoute + command;
            sso = true;
        } else if (url == me.vpsUrl) {
            cmd = url + me.apiRoute + me.apiVersion + command;
        }
        if (command == "/public/ping") {
            cmd = url + me.apiRoute + command;
        }

        var request = jQuery.ajax({
            async: true,
            url : cmd,
            type : type,
            crossDomain : true,
            data : (plain) ? data : JSON.stringify(data),
            traditional : (plain) ? true : false,
            contentType : 'application/json',
            dataType : 'json',
            beforeSend : function(x) {
                x.setRequestHeader("Accept", "application/json");
                if(!sso) {

                    if (Application.getPreferences && Application.getPreferences().token) {
                        x.setRequestHeader("X-sm-session-token", Application.getPreferences().token);
                    } else if (Application && Application.proxySessionToken) {
                        x.setRequestHeader("X-sm-session-token", Application.proxySessionToken);
                    } else if (Application && Application.sessionToken) {
                        x.setRequestHeader("X-sm-session-token", Application.sessionToken);
                    }

                }
                if (url != me.ssoUrl) {
                    x.setRequestHeader('x-sm-client-name', 'WebApp');
                    x.setRequestHeader('x-sm-client-version', Version.VERSION);
                }

                if (header && header.length) {
                    for(var i = 0; i < header.length; i++) {
                        x.setRequestHeader(header[i].title, header[i].value);
                    }
                }

                // x.setRequestHeader("Content-Type", "application/json");
                // if(typeof sso != 'boolean' || !sso) {
                // x.setRequestHeader("MsgApiVersion", me.apiVersion);
                // }
            }
        });

        return {
            request : request,
            json : JSON.stringify(data)
        };
    },
    createSuccessResponse : function(oResponse) {
        //Application.log(oResponse);
        return oResponse;
    },
    createFailureResponse : function(jqx) {
        var res = {
            responseStatus: {
                errorCode: 0
            }
        };
        if (jqx.responseJSON) {
            res = jqx.responseJSON;
        } else {
            res.responseStatus.errorCode = jqx.status;
        }
        return res;
    },

    handleRequestAttachment : function(xhr, callback, vCallback) {
        var response = false, res;
        xhr.request.onload = function() {
            if (xhr.request.status == 200) {
                response = xhr.request.response;
            } else {
                res = String.fromCharCode.apply(null, new Uint8Array(xhr.request.response));
                try {
                    res = JSON.parse(res);
                } catch(e) {
                    res = false;
                }
                response = {};
                if(res) {
                    response = res;
                } else {
                    response.responseStatus = {
                        errorCode : xhr.request.status,
                        message : xhr.request.statusText
                    };
                }
            }
            MessagingAPI.onRequestAttachmentComplete(response, xhr, callback, vCallback);
        };
        xhr.request.send();
        // if(resendFunc) resendFunc();
    },
    handleRequest : function(deferred, callback, vCallback) {
        var oResponse;
        deferred.request.done(function(oResponse, textStatus, jqx) {
            oResponse = MessagingAPI.createSuccessResponse(oResponse);
            var pass = true;
            if (oResponse && oResponse.responseStatus && oResponse.responseStatus.errorCode) {
                switch(oResponse.responseStatus.errorCode) {
                    case '50':
                        if (!View.checkMaintenance) {
                            View.maintenanceMode();
                            pass = false;
                        }
                        break;
                    case '31':
                        View.suspendedMode();
                        pass = false;
                        break;

                }
            }
            if (pass) {
                MessagingAPI.onRequestComplete(oResponse, deferred.json, callback, vCallback);
            }
        });

        deferred.request.fail(function(jqx, textStatus, errorCode) {
            oResponse = MessagingAPI.createFailureResponse(jqx);
            var pass = true;
            if (oResponse && oResponse.responseStatus && oResponse.responseStatus.errorCode) {
                switch(oResponse.responseStatus.errorCode) {
                    case '50':
                        if (!View.checkMaintenance) {
                            View.maintenanceMode();
                            pass = false;
                        }
                        break;
                    case '31':
                        View.suspendedMode();
                        pass = false;
                        break;

                }
            }
            if (pass) {
                MessagingAPI.onRequestFail(oResponse, deferred.json, callback, vCallback);
            }
            // navigator.notification.alert('There is a internet connection
            // problem. Please try again later.');
            //Application.log('it looks like there is an internet connection problem');
        });
        // if(resendFunc) resendFunc();
    },

    onRequestAttachmentComplete : function(e2Response, request, callback, vCallback) {
        callback(e2Response, request, vCallback);
    },

    onRequestComplete : function(e2Response, json, callback, vCallback) {
        var req;
        if(json) {
            try {
                req = JSON.parse(json);
            } catch (e) {
                req = json
            }
        }
        callback(e2Response, vCallback, req);
    },
    onRequestFail : function(e2Response, json, callback, vCallback) {
        var req;
        if(json) {
            try {
                req = JSON.parse(json);
            } catch (e) {
                req = json
            }
        }
        callback(e2Response, vCallback, req);
    }
};

if (typeof module != "undefined" && module.exports) {
    module.exports = MessagingAPI;
} else {
    window.MessagingAPI = MessagingAPI;
}

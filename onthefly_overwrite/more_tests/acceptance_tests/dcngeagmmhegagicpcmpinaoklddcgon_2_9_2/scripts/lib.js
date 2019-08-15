var browser = chrome;

LacunaWebPKI = function(license) {
    this.license = null;
    this.defaultErrorCallback = null;
    this.angularScope = null;
    this.brand = null;
    this.restPkiUrl = null;
    if (license) {
        this.license = license;
    }
};

(function($) {
    $.Promise = function(angularScope) {
        this.successCallback = function() {};
        this.errorCallback = function() {};
        this.angularScope = angularScope;
    };
    $.Promise.prototype.success = function(callback) {
        this.successCallback = callback;
        return this;
    };
    $.Promise.prototype.error = function(callback) {
        this.errorCallback = callback;
        return this;
    };
    $.Promise.prototype._invokeSuccess = function(result, delay) {
        if (delay > 0) {
            var self = this;
            setTimeout(function() {
                self._invokeSuccess(result);
            }, delay);
        } else {
            var callback = this.successCallback || function() {
                $._log("Success ignored (no callback registered)");
            };
            this._apply(function() {
                callback(result);
            });
        }
    };
    $.Promise.prototype._invokeError = function(message, error, origin, delay) {
        if (delay > 0) {
            var self = this;
            setTimeout(function() {
                self._invokeError(message, error, origin);
            }, delay);
        } else {
            var callback = this.errorCallback || function(message, error, origin) {
                throw "Web PKI error originated at " + origin + ": " + message + "\n" + error;
            };
            this._apply(function() {
                callback(message, error, origin);
            });
        }
    };
    $.Promise.prototype._apply = function(callback) {
        if (this.angularScope) {
            var phase = this.angularScope.$root.$$phase;
            if (phase == "$apply" || phase == "$digest") {
                callback();
            } else {
                this.angularScope.$apply(function() {
                    callback();
                });
            }
        } else {
            callback();
        }
    };
    $._installUrl = "https://get.webpkiplugin.com/";
    $._chromeExtensionId = "dcngeagmmhegagicpcmpinaoklddcgon";
    $._firefoxExtensionId = "webpki@lacunasoftware.com";
    $._chromeExtensionFirstVersionWithSelfUpdate = "2.0.20";
    $._chromeExtensionRequiredVersion = "2.6.6";
    $._firefoxExtensionRequiredVersion = "0.0.0";
    $._chromeNativeWinRequiredVersion = "2.2.8";
    $._chromeNativeLinuxRequiredVersion = "2.4.1";
    $._chromeNativeMacRequiredVersion = "2.4.1";
    $._ieAddonRequiredVersion = "2.2.4";
    $._chromeInstallationStates = {
        INSTALLED: 0,
        EXTENSION_NOT_INSTALLED: 1,
        EXTENSION_OUTDATED: 2,
        NATIVE_NOT_INSTALLED: 3,
        NATIVE_OUTDATED: 4
    };
    $._certKeyUsages = {
        crlSign: 2,
        dataEncipherment: 16,
        decipherOnly: 32768,
        digitalSignature: 128,
        encipherOnly: 1,
        keyAgreement: 8,
        keyCertSign: 4,
        keyEncipherment: 32,
        nonRepudiation: 64
    };
    $._nativeInfo = {};
    $.installationStates = {
        INSTALLED: 0,
        NOT_INSTALLED: 1,
        OUTDATED: 2,
        BROWSER_NOT_SUPPORTED: 3
    };
    $.padesPolicies = {
        basic: "basic",
        brazilAdrBasica: "brazilAdrBasica"
    };
    $.cadesPolicies = {
        bes: "cadesBes",
        brazilAdrBasica: "brazilAdrBasica"
    };
    $.cadesAcceptablePolicies = {
        pkiBrazil: [ "brazilAdrBasica", "brazilAdrTempo", "brazilAdrValidacao", "brazilAdrCompleta", "brazilAdrArquivamento" ]
    };
    $.standardTrustArbitrators = {
        pkiBrazil: {
            type: "standard",
            standardArbitrator: "pkiBrazil"
        },
        pkiItaly: {
            type: "standard",
            standardArbitrator: "pkiItaly"
        },
        pkiPeru: {
            type: "standard",
            standardArbitrator: "pkiPeru"
        },
        windows: {
            type: "standard",
            standardArbitrator: "windows"
        }
    };
    $.outputModes = {
        showSaveFileDialog: "showSaveFileDialog",
        saveInFolder: "saveInFolder",
        autoSave: "autoSave"
    };
    $.trustArbitratorTypes = {
        trustedRoot: "trustedRoot",
        tsl: "tsl",
        standard: "standard"
    };
    $.padesPaperSizes = {
        custom: "custom",
        a0: "a0",
        a1: "a1",
        a2: "a2",
        a3: "a3",
        a4: "a4",
        a5: "a5",
        a6: "a6",
        a7: "a7",
        a8: "a8",
        letter: "letter",
        legal: "legal",
        ledger: "ledger"
    };
    $.padesHorizontalAlign = {
        left: "left",
        center: "center",
        rigth: "rigth"
    };
    $.padesVerticalAlign = {
        top: "top",
        center: "center",
        bottom: "bottom"
    };
    $.padesMeasurementUnits = {
        centimeters: "centimeters",
        pdfPoints: "pdfPoints"
    };
    $.padesPageOrientations = {
        auto: "auto",
        portrait: "portrait",
        landscape: "landscape"
    };
    $.markElementTypes = {
        text: "text",
        image: "image"
    };
    $.markTextStyle = {
        normal: 0,
        bold: 1,
        italic: 2
    };
    $.passwordPolicies = {
        lettersAndNumbers: 1,
        upperAndLowerCase: 2,
        specialCharacters: 4
    };
    $.pkcs11Modules = {
        safeSign: {
            win: "aetpkss1.dll",
            linux: "libaetpkss.so.3",
            mac: "libaetpkss.dylib"
        },
        safeNet: {
            win: "eTPKCS11.dll",
            linux: "libeToken.so",
            mac: "libeToken.dylib"
        }
    };
    $._compareVersions = function(v1, v2) {
        var v1parts = v1.split(".");
        var v2parts = v2.split(".");
        function isPositiveInteger(x) {
            return /^\d+$/.test(x);
        }
        function validateParts(parts) {
            for (var i = 0; i < parts.length; ++i) {
                if (!isPositiveInteger(parts[i])) {
                    return false;
                }
            }
            return true;
        }
        if (!validateParts(v1parts) || !validateParts(v2parts)) {
            return NaN;
        }
        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }
            var v1p = parseInt(v1parts[i], 10);
            var v2p = parseInt(v2parts[i], 10);
            if (v1p === v2p) {
                continue;
            }
            if (v1p > v2p) {
                return 1;
            }
            return -1;
        }
        if (v1parts.length != v2parts.length) {
            return -1;
        }
        return 0;
    };
    $._log = function(message) {
        if (window.console) {
            window.console.log(message);
        }
    };
    $._parseDataUrl = function(url) {
        var match = /^data:(.+);base64,(.+)$/.exec(url);
        if (!match) {
            $._log("failed to parse data url");
            return null;
        }
        return {
            mimeType: match[1],
            content: match[2]
        };
    };
    $._downloadResource = function(url, callBack) {
        $._log("resolving resource reference: " + url);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.onload = function() {
            var responseReader = new FileReader();
            responseReader.onloadend = function() {
                $._log("resource reference resolved");
                var resource = $._parseDataUrl(responseReader.result);
                callBack(resource);
            };
            responseReader.readAsDataURL(xhr.response);
        };
        xhr.send();
    };
    $._getRequestOsP11Modules = function(p11Modules) {
        if (!p11Modules || !p11Modules.length) {
            return null;
        }
        osModules = [];
        for (var i = 0; i < p11Modules.length; i++) {
            if ($._nativeInfo.os === "Windows") {
                osModules.push(p11Modules[i].win);
            } else if ($._nativeInfo.os === "Linux") {
                osModules.push(p11Modules[i].linux);
            } else if ($._nativeInfo.os === "Darwin") {
                osModules.push(p11Modules[i].mac);
            }
        }
        return osModules;
    };
    $._createContext = function(args) {
        var promise = new $.Promise(this.angularScope);
        if (args && args.success) {
            promise.success(args.success);
        }
        if (args && args.error) {
            promise.error(args.error);
        } else {
            promise.error(this.defaultErrorCallback);
        }
        var context = {
            promise: promise,
            license: this.license
        };
        return context;
    };
    $.init = function(args) {
        if (!args) {
            args = {};
        } else if (typeof args === "function") {
            args = {
                ready: args
            };
        }
        if (args.license) {
            this.license = args.license;
        }
        if (args.defaultError) {
            this.defaultErrorCallback = args.defaultError;
        }
        if (args.angularScope) {
            this.angularScope = args.angularScope;
        }
        if (args.brand) {
            this.brand = args.brand;
        }
        if (args.restPkiUrl) {
            this.restPkiUrl = args.restPkiUrl;
        }
        var self = this;
        var onCheckInstalledSuccess = function(result) {
            if (result.isInstalled) {
                if (args.ready) {
                    args.ready();
                } else {
                    $._log("Web PKI ready (no callback registered)");
                }
            } else {
                if (args.notInstalled) {
                    args.notInstalled(result.status, result.message, result.browserSpecificStatus);
                } else {
                    self.redirectToInstallPage();
                }
            }
        };
        var context = this._createContext({
            success: onCheckInstalledSuccess,
            error: args.error
        });
        $._requestHandler.checkInstalled(context);
        return context.promise;
    };
    $.getVersion = function(args) {
        var context = this._createContext(args);
        $._requestHandler.sendCommand(context, "getVersion", null);
        return context.promise;
    };
    $.listCertificates = function(args) {
        if (!args) {
            args = {};
        } else if (args.filter) {
            if (typeof args.filter !== "function") {
                if (typeof args.filter === "boolean") {
                    throw 'args.filter must be a function (hint: if you used "pki.filters.xxx()", try removing the "()")';
                } else {
                    throw "args.filter must be a function, received " + typeof args.filter;
                }
            }
        }
        var context = this._createContext(args);
        $._requestHandler.sendCommand(context, "listCertificates", null, function(result) {
            return $._processCertificates(result, args.filter, args.selectId, args.selectOptionFormatter);
        });
        return context.promise;
    };
    $._processCertificates = function(result, filter, selectId, selectOptionFormatter) {
        var toReturn = [];
        for (var i = 0; i < result.length; i++) {
            var cert = result[i];
            cert.validityStart = new Date(cert.validityStart);
            cert.validityEnd = new Date(cert.validityEnd);
            cert.keyUsage = $._processKeyUsage(cert.keyUsage);
            if (cert.pkiBrazil && cert.pkiBrazil.dateOfBirth) {
                var s = cert.pkiBrazil.dateOfBirth;
                cert.pkiBrazil.dateOfBirth = new Date(parseInt(s.slice(0, 4), 10), parseInt(s.slice(5, 7), 10) - 1, parseInt(s.slice(8, 10), 10));
            }
            if (filter) {
                if (filter(cert)) {
                    toReturn.push(cert);
                }
            } else {
                toReturn.push(cert);
            }
        }
        if (selectId) {
            if (!selectOptionFormatter) {
                selectOptionFormatter = function(c) {
                    return c.subjectName + " (issued by " + c.issuerName + ")";
                };
            }
            var select = document.getElementById(selectId);
            while (select.options.length > 0) {
                select.remove(0);
            }
            for (var j = 0; j < toReturn.length; j++) {
                var c = toReturn[j];
                var option = document.createElement("option");
                option.value = c.thumbprint;
                option.text = selectOptionFormatter(c);
                select.add(option);
            }
        }
        return toReturn;
    };
    $._processKeyUsage = function(keyUsageValue) {
        return {
            crlSign: (keyUsageValue & $._certKeyUsages.crlSign) !== 0,
            dataEncipherment: (keyUsageValue & $._certKeyUsages.dataEncipherment) !== 0,
            decipherOnly: (keyUsageValue & $._certKeyUsages.decipherOnly) !== 0,
            digitalSignature: (keyUsageValue & $._certKeyUsages.digitalSignature) !== 0,
            encipherOnly: (keyUsageValue & $._certKeyUsages.encipherOnly) !== 0,
            keyAgreement: (keyUsageValue & $._certKeyUsages.keyAgreement) !== 0,
            keyCertSign: (keyUsageValue & $._certKeyUsages.keyCertSign) !== 0,
            keyEncipherment: (keyUsageValue & $._certKeyUsages.keyEncipherment) !== 0,
            nonRepudiation: (keyUsageValue & $._certKeyUsages.nonRepudiation) !== 0
        };
    };
    $.filters = {
        isPkiBrazilPessoaFisica: function(cert) {
            if (typeof cert == "undefined") {
                throw 'filter called without cert argument (hint: if you are using "pki.filters.isPkiBrazilPessoaFisica()", try "pki.filters.isPkiBrazilPessoaFisica")';
            }
            return cert.pkiBrazil && (cert.pkiBrazil.cpf || "") !== "" && (cert.pkiBrazil.cnpj || "") === "";
        },
        hasPkiBrazilCpf: function(cert) {
            if (typeof cert == "undefined") {
                throw 'filter called without cert argument (hint: if you are using "pki.filters.hasPkiBrazilCpf()", try "pki.filters.hasPkiBrazilCpf")';
            }
            return cert.pkiBrazil && (cert.pkiBrazil.cpf || "") !== "";
        },
        hasPkiBrazilCnpj: function(cert) {
            if (typeof cert == "undefined") {
                throw 'filter called without cert argument (hint: if you are using "pki.filters.hasPkiBrazilCnpj()", try "pki.filters.hasPkiBrazilCnpj")';
            }
            return cert.pkiBrazil && (cert.pkiBrazil.cnpj || "") !== "";
        },
        pkiBrazilCpfEquals: function(cpf) {
            if (typeof cpf !== "string") {
                throw 'cpf must be a string (hint: if you are using "pki.filters.pkiBrazilCpfEquals", try "pki.filters.pkiBrazilCpfEquals(' + "'" + "somecpf" + "'" + ')")';
            }
            return function(cert) {
                return cert.pkiBrazil && cert.pkiBrazil.cpf === cpf;
            };
        },
        pkiBrazilCnpjEquals: function(cnpj) {
            if (typeof cnpj !== "string") {
                throw 'cnpj must be a string (hint: if you are using "pki.filters.pkiBrazilCnpjEquals", try "pki.filters.pkiBrazilCnpjEquals(' + "'" + "somecnpj" + "'" + ')")';
            }
            return function(cert) {
                return cert.pkiBrazil && cert.pkiBrazil.cnpj === cnpj;
            };
        },
        hasPkiItalyCodiceFiscale: function(cert) {
            if (typeof cert == "undefined") {
                throw 'filter called without cert argument (hint: if you are using "pki.filters.hasPkiItalyCodiceFiscale()", try "pki.filters.hasPkiItalyCodiceFiscale")';
            }
            return cert.pkiItaly && (cert.pkiItaly.codiceFiscale || "") !== "";
        },
        pkiItalyCodiceFiscaleEquals: function(cf) {
            if (typeof cf !== "string") {
                throw 'cf must be a string (hint: if you are using "pki.filters.pkiItalyCodiceFiscaleEquals", try "pki.filters.pkiItalyCodiceFiscaleEquals(' + "'" + "someCodice" + "'" + ')")';
            }
            return function(cert) {
                return cert.pkiItaly && cert.pkiItaly.codiceFiscale === cf;
            };
        },
        isWithinValidity: function(cert) {
            if (typeof cert == "undefined") {
                throw 'filter called without cert argument (hint: if you are using "pki.filters.isWithinValidity()", try "pki.filters.isWithinValidity")';
            }
            var now = new Date();
            return cert.validityStart <= now && now <= cert.validityEnd;
        },
        all: function() {
            var filters;
            if (arguments.length === 1 && typeof arguments[0] === "object") {
                filters = arguments[0];
            } else {
                filters = arguments;
            }
            return function(cert) {
                for (var i = 0; i < filters.length; i++) {
                    var filter = filters[i];
                    if (!filter(cert)) {
                        return false;
                    }
                }
                return true;
            };
        },
        any: function() {
            var filters;
            if (arguments.length === 1 && typeof arguments[0] === "object") {
                filters = arguments[0];
            } else {
                filters = arguments;
            }
            return function(cert) {
                for (var i = 0; i < filters.length; i++) {
                    var filter = filters[i];
                    if (filter(cert)) {
                        return true;
                    }
                }
                return false;
            };
        }
    };
    $.readCertificate = function(args) {
        if (typeof args === "string") {
            args = {
                thumbprint: args
            };
        }
        var context = this._createContext(args);
        $._requestHandler.sendCommand(context, "readCertificate", {
            certificateThumbprint: args.thumbprint
        });
        return context.promise;
    };
    $.saveFile = function(content) {
        var context = this._createContext({});
        $._requestHandler.sendCommand(context, "saveFile", content);
        return context.promise;
    };
    $.pollNative = function(args) {
        if (!args) {
            args = {};
        }
        var context = this._createContext(args);
        var requiredNativeWinVersion = null;
        var requiredNativeLinuxVersion = null;
        var requiredNativeMacVersion = null;
        $._requestHandler.sendCommand(context, "pollNative", {
            requiredNativeWinVersion: requiredNativeWinVersion,
            requiredNativeLinuxVersion: requiredNativeLinuxVersion,
            requiredNativeMacVersion: requiredNativeMacVersion
        });
        return context.promise;
    };
    $.importPkcs12 = function(args) {
        var context = this._createContext(args);
        $._requestHandler.sendCommand(context, "importPkcs12", null);
        return context.promise;
    };
    $.removeCertificate = function(args) {
        if (!args) {
            args = {};
        }
        var context = this._createContext(args);
        $._requestHandler.sendCommand(context, "removeCertificate", args.thumbprint);
        return context.promise;
    };
    $.signPdf = function(args) {
        var context = this._createContext(args);
        var request = {
            fileId: args.fileId,
            certificateThumbprint: args.certificateThumbprint,
            output: {
                mode: args.output.mode,
                folderId: args.output.folderId,
                dialogTitle: args.output.dialogTitle,
                fileNameSuffix: args.output.fileNameSuffix
            },
            trustArbitrators: args.trustArbitrators,
            clearPolicyTrustArbitrators: args.clearPolicyTrustArbitrators,
            visualRepresentation: args.visualRepresentation,
            pdfMarks: args.pdfMarks,
            bypassMarksIfSigned: args.bypassMarksIfSigned,
            policy: args.policy
        };
        if (request.visualRepresentation && request.visualRepresentation.image && request.visualRepresentation.image.resource && !request.visualRepresentation.image.resource.content && request.visualRepresentation.image.resource.url && !/^(https?:)?\/\//.exec(request.visualRepresentation.image.resource.url)) {
            $._downloadResource(request.visualRepresentation.image.resource.url, function(resource) {
                request.visualRepresentation.image.resource = resource;
                $._requestHandler.sendCommand(context, "signPdf", request);
            });
        } else {
            $._requestHandler.sendCommand(context, "signPdf", request);
        }
        return context.promise;
    };
    $.signCades = function(args) {
        var context = this._createContext(args);
        var request = {
            fileId: args.fileId,
            certificateThumbprint: args.certificateThumbprint,
            output: {
                mode: args.output.mode,
                folderId: args.output.folderId,
                dialogTitle: args.output.dialogTitle,
                fileNameSuffix: args.output.fileNameSuffix
            },
            trustArbitrators: args.trustArbitrators,
            clearPolicyTrustArbitrators: args.clearPolicyTrustArbitrators,
            cmsToCosignFileId: args.cmsToCosignFileId,
            autoDetectCosign: args.autoDetectCosign,
            includeEncapsulatedContent: args.includeEncapsulatedContent === null || args.includeEncapsulatedContent === undefined ? true : args.includeEncapsulatedContent,
            policy: args.policy
        };
        $._requestHandler.sendCommand(context, "signCades", request);
        return context.promise;
    };
    $.openPades = function(args) {
        var context = this._createContext(args);
        var request = {
            signatureFileId: args.signatureFileId,
            validate: args.validate,
            dateReference: args.dateReference,
            trustArbitrators: args.trustArbitrators,
            clearPolicyTrustArbitrators: args.clearPolicyTrustArbitrators,
            specificPolicy: args.specificPolicy
        };
        $._requestHandler.sendCommand(context, "openPades", request);
        return context.promise;
    };
    $.openCades = function(args) {
        var context = this._createContext(args);
        var request = {
            signatureFileId: args.signatureFileId,
            originalFileId: args.originalFileId,
            validate: args.validate,
            dateReference: args.dateReference,
            trustArbitrators: args.trustArbitrators,
            clearPolicyTrustArbitrators: args.clearPolicyTrustArbitrators,
            specificPolicy: args.specificPolicy,
            acceptablePolicies: args.acceptablePolicies
        };
        $._requestHandler.sendCommand(context, "openCades", request);
        return context.promise;
    };
    $.listTokens = function(args) {
        var context = this._createContext(args);
        var request = {
            pkcs11Modules: $._getRequestOsP11Modules(args.pkcs11Modules)
        };
        $._requestHandler.sendCommand(context, "listTokens", request);
        return context.promise;
    };
    $.generateTokenRsaKeyPair = function(args) {
        var context = this._createContext(args);
        var request = {
            pkcs11Modules: $._getRequestOsP11Modules(args.pkcs11Modules),
            subjectName: args.subjectName,
            tokenSerialNumber: args.tokenSerialNumber,
            keyLabel: args.keyLabel,
            keySize: args.keySize
        };
        $._requestHandler.sendCommand(context, "generateTokenRsaKeyPair", request);
        return context.promise;
    };
    $.generateSoftwareRsaKeyPair = function(args) {
        var context = this._createContext(args);
        var request = {
            subjectName: args.subjectName,
            keySize: args.keySize
        };
        $._requestHandler.sendCommand(context, "generateSoftwareRsaKeyPair", request);
        return context.promise;
    };
    $.importTokenCertificate = function(args) {
        var context = this._createContext(args);
        var request = {
            pkcs11Modules: $._getRequestOsP11Modules(args.pkcs11Modules),
            tokenSerialNumber: args.tokenSerialNumber,
            certificateContent: args.certificateContent,
            certificateLabel: args.certificateLabel
        };
        $._requestHandler.sendCommand(context, "importTokenCertificate", request);
        return context.promise;
    };
    $.importCertificate = function(args) {
        var context = this._createContext(args);
        var request = {
            certificateContent: args.certificateContent,
            passwordPolicies: args.passwordPolicies,
            passwordMinLength: args.passwordMinLength,
            savePkcs12: args.savePkcs12
        };
        $._requestHandler.sendCommand(context, "importCertificate", request);
        return context.promise;
    };
    if ($._requestHandler === undefined) {
        $._requestHandler = new function() {
            var requestEventName = "com.lacunasoftware.WebPKI.RequestEvent";
            var responseEventName = "com.lacunasoftware.WebPKI.ResponseEvent";
            var pendingRequests = {};
            var eventPagePortName = "com.lacunasoftware.WebPKI.Port";
            var port = null;
            var s4 = function() {
                return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
            };
            var generateGuid = function() {
                return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
            };
            var registerPromise = function(promise, responseProcessor) {
                var requestId = generateGuid();
                pendingRequests[requestId] = {
                    promise: promise,
                    responseProcessor: responseProcessor
                };
                return requestId;
            };
            var sendCommand = function(context, command, request, responseProcessor) {
                var requestId = registerPromise(context.promise, responseProcessor);
                var message = {
                    requestId: requestId,
                    license: context.license,
                    command: command,
                    request: request
                };
                if (port === null) {
                    port = browser.runtime.connect({
                        name: eventPagePortName
                    });
                    port.onMessage.addListener(function(response) {
                        onResponseReceived(response);
                        console.log(response);
                    });
                    console.log("[ContentScript] opened port with extension");
                }
                message.domain = "@popup";
                port.postMessage(message);
            };
            var checkInstalled = function(context) {
                initializeExtension(context);
            };
            var initializeExtension = function(context) {
                $._log("initializing extension");
                var subPromise = new $.Promise(null);
                subPromise.success(function(response) {
                    if (response.isReady) {
                        context.promise._invokeSuccess({
                            isInstalled: true,
                            platformInfo: response.platformInfo,
                            nativeInfo: response.nativeInfo
                        });
                    } else {
                        context.promise._invokeSuccess({
                            isInstalled: false,
                            status: convertInstallationStatus(response.status),
                            browserSpecificStatus: response.status,
                            message: response.message,
                            platformInfo: response.platformInfo,
                            nativeInfo: response.nativeInfo
                        });
                    }
                });
                subPromise.error(function(message, error, origin) {
                    context.promise._invokeError(message, error, origin);
                });
                sendCommand({
                    license: context.license,
                    promise: subPromise
                }, "initialize", null);
            };
            var convertInstallationStatus = function(bss) {
                if (bss === $._chromeInstallationStates.INSTALLED) {
                    return $.installationStates.INSTALLED;
                } else if (bss === $._chromeInstallationStates.EXTENSION_OUTDATED || bss === $._chromeInstallationStates.NATIVE_OUTDATED) {
                    return $.installationStates.OUTDATED;
                } else {
                    return $.installationStates.NOT_INSTALLED;
                }
            };
            var onResponseReceived = function(result) {
                var request = pendingRequests[result.requestId];
                delete pendingRequests[result.requestId];
                if (result.success) {
                    if (request.responseProcessor) {
                        result.response = request.responseProcessor(result.response);
                    }
                    request.promise._invokeSuccess(result.response);
                } else {
                    request.promise._invokeError(result.exception.message, result.exception.complete, result.exception.origin);
                }
            };
            this.sendCommand = sendCommand;
            this.checkInstalled = checkInstalled;
        }();
    }
})(LacunaWebPKI.prototype);
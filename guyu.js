history.forward();
//The above is done to stop the user from clicking the "Back" button.


/* copied from jslint guy */
/* use this when creating a new object that inherits from another
 * eg. var newObject = Object.create(existingObject);
*/
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() { }
        F.prototype = o;
        return new F();
    };
}

/* Array pollyfills (these should go elsewhere) */
if (typeof Array.clone !== 'function') {
    Array.clone = function (o) {
        return $.extend(true, [], o);
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun /*, thisArg */) {

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                if (fun.call(thisArg, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}

if (typeof Guyu === "undefined") {
    Guyu = {};
}

var IMAGE_TRANSPARENT_DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAIAAAOv//wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';  // base64 of '/solv2/images/transparent.gif'

if ($('html').hasClass('sol-vnext')) {

    Guyu.browser = (function () {
        var $html = $('html');
        var mobileRegEx = /iPhone|Andriod|BlackBerry|Nokia|SymbianOS/i;
        var msieVersion = function (v) {
            var isVersion;
            return function () {
                if (typeof isVersion === "undefined") {
                    isVersion = $html.hasClass(v);
                }
                return isVersion;
            };
        };

        // take from jQuery 1.8.3
        var uaMatch = (function (ua) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

            return {
                browser: match[1] || "",
                version: match[2] || "0"
            };
        })(navigator.userAgent);

        var browser = {
            version: uaMatch.version,
            msie6: msieVersion('ie6'),
            msie7: msieVersion('ie7'),
            msie8: msieVersion('ie8'),
            msie9: msieVersion('ie9'),
            isMobileDevice: function () {
                return navigator.userAgent.match(mobileRegEx) !== null;
            },
            isMobileSafari: function () {
                return navigator.userAgent.match(/iPad|iPhone|iPod/i) !== null;
            },
            supportsPng: function () {
                return !Guyu.browser.msie6();
            },
            imageExtension: function () {
                return Guyu.browser.supportsPng() ? '.png' : '.gif';
            },
            spriteCssClass: function () {
                return 'master_sprite_' + (Guyu.browser.supportsPng() ? 'png' : 'gif');
            },
            iconCssClass: function () {
                return 'icon_' + (Guyu.browser.supportsPng() ? 'png' : 'gif');
            },
            isHttps: function () {
                return (document.location.protocol || '').toLowerCase() === "https:";
            }
        };

        if (uaMatch.browser) {
            browser[uaMatch.browser] = true;
        }

        return browser;

    })();
} else {
    /*
      extend jQuery browser functions to return boolean for specific versions
      these should be changed to use Modernizr or similar (Above part of this condition now uses the Guyu.browser for vNExt)
    */

    jQuery.browser = jQuery.browser || { msie: false, version: 0 }; // as of JQuery 1.9 jQuery.browser was removed (This is for supporting mixed versions of jQuery in SOL)
    jQuery.extend(jQuery.browser, {
        msie6: function () {
            return jQuery.browser.msie === true && parseInt(jQuery.browser.version, 10) === 6;
        },
        msie7: function () {
            return jQuery.browser.msie === true && parseInt(jQuery.browser.version, 10) === 7;
        },
        msie8: function () {
            return jQuery.browser.msie === true && parseInt(jQuery.browser.version, 10) === 8;
        },
        msie9: function () {
            return jQuery.browser.msie === true && parseInt(jQuery.browser.version, 10) === 9;
        },
        mobileRegEx: /iPhone|Andriod|BlackBerry|Nokia|SymbianOS/i,
        isMobileDevice: function () {
            return navigator.userAgent.match(this.mobileRegEx) !== null;
        },
        isMobileSafari: function () {
            return navigator.userAgent.match(/iPad|iPhone|iPod/i) !== null;
        },
        supportsPng: function () {
            return !jQuery.browser.msie6();
        },
        imageExtension: function () {
            return jQuery.browser.supportsPng() ? '.png' : '.gif';
        },
        spriteCssClass: function () {
            return 'master_sprite_' + (jQuery.browser.supportsPng() ? 'png' : 'gif');
        },
        iconCssClass: function () {
            return 'icon_' + (jQuery.browser.supportsPng() ? 'png' : 'gif');
        },
        isHttps: function () {
            return (document.location.protocol || '').toLowerCase() === "https:";
        }
    });

    Guyu.browser = jQuery.browser;
}

(function ($) {
    $.ajaxPrefilter(function () {
        Guyu.autoLogout.setTimer();
    });
})(window.jQuery);

(function ($) {
    jQuery.extend(Guyu,
        {
            // add functions to be called by passing in execute = function() else call functions by Guyu.ready()
            ready: function (execute) {

                Guyu._ready = Guyu._ready || [];

                if (typeof execute === "function") {

                    Guyu._ready.push(execute);

                } else if (typeof execute === "undefined") {

                    $(document).ready(function () {
                        var f;
                        while (f = Guyu._ready.shift()) {
                            if (typeof f === "function") {
                                f.call(window);
                            }
                        };
                    });

                }
            },
            autocompleter: {
                width: 277
            },
            minimumTimeout: 12,
            fadeDuration: 'fast',
            slideDuration: 'fast',
            dateFormat: 'd MMM yyyy',
            formatDate: function (dateString) { return Guyu.formatDateOrTime(dateString, Guyu.dateFormat); },
            dateFormatNoYear: 'ddd d MMM',
            formatDateNoYear: function (dateString) { return Guyu.formatDateOrTime(dateString, Guyu.dateFormatNoYear); },
            dateFormatItinerary: 'ddd d MMM yyyy',
            formatItineraryDate: function (dateString) { return Guyu.formatDateOrTime(dateString, Guyu.dateFormatItinerary); },
            formatBaggageAllowance: function (baggageAllowance) { return formatBaggageAllowance(baggageAllowance); },
            timeFormat: 'hh:mm tt',
            formatTime: function (timeString) { return Guyu.formatDateOrTime(timeString, Guyu.timeFormat); },
            dateTimeFormat: function () { return Guyu.dateFormat + ' ' + Guyu.timeFormat; },
            formatDateTime: function (dateTimeString) { return Guyu.formatDateOrTime(dateTimeString, Guyu.dateTimeFormat()); },
            dayDateTimeFormat: function () { return 'ddd ' + Guyu.dateFormat + ' ' + Guyu.timeFormat; },
            formatDayDateTime: function (dayDateTimeString) { return Guyu.formatDateOrTime(dayDateTimeString, Guyu.dayDateTimeFormat()); },
            dayDateFormat: function () { return 'dddd, ' + Guyu.dateFormat; },
            formatDayDate: function (dayDateString) { return Guyu.formatDateOrTime(dayDateString, Guyu.dayDateFormat()); },
            creditCardDateFormat: 'MMMM yyyy',
            formatcreditCardDate: function (creditCardDate) { return Guyu.formatDateOrTime(creditCardDate, Guyu.creditCardDateFormat); },
            formatDateOrTime: function (dateOrTimeString, format) {
                try {
                    if ($.isUndefined(dateOrTimeString)) {
                        return '';
                    }
                    if (typeof dateOrTimeString === 'object') {
                        return dateOrTimeString.toString(format);
                    } else {
                        return dateOrTimeString.length === 0 ? dateOrTimeString : Date.parse(dateOrTimeString).toString(format);
                    }
                } catch (e) {
                    return dateOrTimeString;
                }
            },
            defaultDateTimeString: '1/01/0001 12:00:00 a.m.',
            dotNetMinDateTime: '0001-01-01T00:00:00',
            isDotNetMinDateTime: function (dateTime) {
                if ('string' === typeof dateTime) {
                    return dateTime === Guyu.dotNetMinDateTime;
                }
                return false;
            },
            readonlyItemsToRemove: [],
            readonlyItemsToIgnore: [],
            readonlyItemsToDisable: [],
            setReadonly: function () {
                $(Guyu.readonlyItemsToRemove.join(',')).not(Guyu.readonlyItemsToIgnore.join(',')).remove();
                $(Guyu.readonlyItemsToDisable.join(',')).not(Guyu.readonlyItemsToIgnore.join(',')).prop('disabled', 'disabled');

                if (!$.isUndefinedOrNull(pageOptions.hasFullAccess) && !pageOptions.hasFullAccess) {
                    $('input, select').not('input[type="image"]').prop('disabled', 'disabled');
                    if (typeof GuyuAutocompleters !== "undefined" && !$.isUndefinedOrNull(GuyuAutocompleters)) {
                        $.each(GuyuAutocompleters, function (count, GuyuAutocompleter) {
                            GuyuAutocompleter.Guyuautocompleter('disable');
                        });
                    }
                    $('#cloneButton').hide();
                    $('#myTravellerAuthorisees_traveller, #myTravellerAuthorisers_traveller, #authorisers_mytravellers, #myTravellers_traveller, #travellers_coordinators, #travellers_mytravellers, #authorisers_mytravellers, #authorisers_authorisers, #myTravellerCoordinators_traveller').prop('disabled', false);
                }
            },
            clearFloat: '<div class="float_clear"></div>',
            tracingEnabled: function () {
                var cookie = Guyu.Cookies.getItem('soTracing');
                return (cookie && cookie.value === 'true') || false;
            },
            trace: function (message) {
                if (window.console && Guyu.tracingEnabled()) {
                    console.log(message);
                }
            },

            enableTracing: function (enable) {
                if (enable) {
                    Guyu.Cookies.set(new Guyu.Cookie('soTracing', 'true'));
                } else {
                    Guyu.Cookies.reset('soTracing');
                }

                $('html', window.parent.document).toggleClass('sol-tracing', enable);

                //lighbox support
                var lightboxIframe = $('#lightbox_iframe');
                $('html').toggleClass('sol-tracing', enable); //if the focus is on the lightbox
                $('html', lightboxIframe.contents()).toggleClass('sol-tracing', enable); //if the focus is on the parent
            },
            rootUrl: function (url) { // root base the url
                if (url && typeof url === "string" && !url.startsWith('http') && !url.startsWith('#') && !url.startsWith('/')) {
                    url = '/' + url;
                }
                return url;
            },
            jumpPage: function (url) {
                if (typeof url === 'undefined') {
                    return;
                }

                var n = url.indexOf('#');
                if (n !== -1) {
                    url = url.slice(0, n);
                }
                window.location.href = Guyu.rootUrl(url);
            },
            autoLogout: {
                setTimer: function (waitInMinutes) {
                    var self = this;
                    self.waitInMinutes = waitInMinutes || self.waitInMinutes;

                    if (!self.waitInMinutes) {
                        return;
                    }

                    self.wait = Math.round(0.75 * self._calulateMsFromMinutes(self.waitInMinutes));

                    if (self._timeout) {
                        clearTimeout(self._timeout);
                    }

                    self._timeout = setTimeout(function () {
                        self.endTime = new Date().getTime() + Math.round(60 * 1000 * 0.25 * self.waitInMinutes) - 10000;
                        Guyu.LightBox.showMessageBox('Are you still there?', '', {
                            showRefresh: true,
                            afterShow: function () {
                                self.updateInterval = window.setInterval(function () {
                                    var time = new Date().getTime();
                                    $('#lightbox_message_message').html(self._formatMessage.call(self, self.endTime - time));
                                    if (self.endTime - time <= 0) {
                                        window.clearInterval(self.updateInterval);
                                        Guyu.logout(true);
                                    }
                                }, 250);
                            },
                            beforeHide: function (buttonPressed) {
                                window.clearInterval(self.updateInterval);

                                if (buttonPressed === Guyu.LightBox.buttonType.Refresh) {
                                    // ping the server
                                    $.get('/Web/Account/Ping');
                                    self.setTimer(self.waitInMinutes);
                                    return true;
                                }
                                return false;
                            }
                        });
                    }, self.wait);
                },
                _started: new Date(),
                _calulateMsFromMinutes: function (minutes) {
                    return minutes * (60 * 1000);
                },
                _formatMessage: function (remaining) {
                    return 'We noticed your session has been inactive<br/>' +
                        'and will timeout in ' + this._formatTime(remaining) + '<br/>' +
                        "Click 'Refresh' to extend your time.";
                },
                _formatTime: function (millisec) {
                    var seconds = (millisec / 1000).toFixed(0);
                    var minutes = Math.floor(seconds / 60);
                    var hours = "";
                    if (minutes > 59) {
                        hours = Math.floor(minutes / 60);
                        hours = (hours >= 10) ? hours : "0" + hours;
                        minutes = minutes - (hours * 60);
                        minutes = (minutes >= 10) ? minutes : "0" + minutes;
                    }

                    seconds = Math.floor(seconds % 60);
                    seconds = (seconds >= 10) ? seconds : "0" + seconds;
                    if (hours != "") {
                        return hours + ":" + minutes + ":" + seconds;
                    }
                    return minutes + ":" + seconds;
                }
            },
            logout: function (sessionTimedOut) {
                $.postJSON('/Web/Account/LogOut', { sessionTimedOut: sessionTimedOut || false },
                    function (json) {
                        if (Guyu && json && json.ObjectResponse) {
                            Guyu.jumpPage(json.ObjectResponse);
                        }
                        else if (Guyu !== undefined && Guyu.User !== undefined && Guyu.User.ssoEnabled) {
                            Guyu.jumpPage('/Web/Account/LoggedOut');
                        } else {
                            if (pageOptions !== undefined && pageOptions.loginCorporateCode !== undefined && pageOptions.loginCorporateCode.length > 0) {
                                Guyu.jumpPage('/Login/' + pageOptions.loginCorporateCode);
                            } else {
                                if (pageOptions !== undefined && pageOptions.loginGdsConnectionCode !== undefined && pageOptions.loginGdsConnectionCode.length > 0) {
                                    Guyu.jumpPage('/Branch/' + pageOptions.loginGdsConnectionCode);
                                } else {
                                    Guyu.jumpPage('/Login.aspx');
                                }
                            }
                        }
                    }
                );
            },
            key: {
                SHIFT: 16,
                CTRL: 17,
                ALT: 18,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                DELETE: 46,
                TAB: 9,
                ENTER: 13,
                ESCAPE: 27,
                COMMA: 188,
                PAGEUP: 33,
                PAGEDOWN: 34,
                BACKSPACE: 8,
                APOSTROPHE: 222,
                CAPSLOCK: 20,
                A: 65,
                B: 66,
                C: 67,
                D: 68,
                E: 69,
                F: 70,
                G: 71,
                H: 72,
                I: 73,
                J: 74,
                K: 75,
                L: 76,
                M: 77,
                N: 78,
                O: 79,
                P: 80,
                Q: 81,
                R: 82,
                S: 83,
                T: 84,
                U: 85,
                V: 86,
                W: 87,
                X: 88,
                Y: 89,
                Z: 90,
                a: 97,
                b: 98,
                c: 99,
                d: 100,
                e: 101,
                f: 102,
                g: 103,
                h: 104,
                i: 105,
                j: 106,
                k: 107,
                l: 108,
                m: 109,
                n: 110,
                o: 111,
                p: 112,
                q: 113,
                r: 114,
                s: 115,
                t: 116,
                u: 117,
                v: 118,
                w: 119,
                x: 120,
                y: 121,
                z: 122

            },
            // preload animated loading gif so it displays when required, rather than spending its time downloading	                    
            loadingImage: $(document.createElement('div')).append($(document.createElement('img')).attr({ 'id': 'information_loading', 'alt': '', 'src': baseImageUrl() + 'status_loading_small.gif' })),

            // copy parent PageState window PageState
            copyParentPageState: function () { jQuery.extend(Guyu, { PageState: window.parent.Guyu.PageState }); },
            // copy parent pageOptions window pageOptions
            copyParentPageOptions: function () { jQuery.extend(Guyu, { pageOptions: window.parent.pageOptions }); },
            // gets the img to use for stop overs
            stopsImg: function (stops) {
                if (!stops || parseInt(stops) === 0) return '';
                var img_src = Guyu.browser.supportsPng()
                    ? '/SOLV2/Images/so-qb-air-select/stops_' + stops + '.png'
                    : '/SOLV2/Images/so-qb-air-select/stops_' + stops + '_deselected.gif';
                return '<img alt="" src="' + img_src + '" title="This flight has ' + stops + ' Stop over(s)" class="information"/>';
            },
            // helper method to validate all required input/selects, returns the jquery collection of requried items that are blank
            /* argument 1 is optional options 
                {
                    requiredSelector : 'string',
                    errorDisplayId   : 'string',
                    context          : jQuery object (defaults to $(document),
                    numeric          : [] array of string ids which are numberics (No zeros allowd),
                    autocompleters   : [] array of ui.autocompleter variables,
                    files            : jQuery collection of file inputs to test extensions data-restricted-extensions-regex
                }
        
            */
            validateRequireds: function () {
                var options = jQuery.extend({
                    requiredSelector: 'input.required:visible, select.required:visible, textarea.required:visible',
                    errorDisplayId: '#page_error',
                    context: $(document),
                    numeric: [],
                    autocompleters: [],
                    radioGroups: [], // names of radio group
                    files: $([]) // restrict file types
                }, arguments[0]),
                    pageError = $(options.errorDisplayId),
                    requireds = $(options.requiredSelector, options.context);

                pageError.removePageError();
                requireds.removeError();
                options.files.removeError();

                var blankRequireds = requireds.filter(':blank'),
                    numericCount = 0;

                // check required nuermics which are zero
                $.each(options.numeric, function (index, id) {
                    var numeric = requireds.filter(id);
                    if (numeric.length === 0) {
                        return true; // continue
                    }
                    if (!numeric.is(':numeric')) {
                        blankRequireds = blankRequireds.add(numeric);
                        numericCount += 1;
                    }
                });


                // add error here as autocompleters have their own addError
                if (blankRequireds.length > 0) {
                    blankRequireds.addError('');
                }

                // check radio groups
                $.each(options.radioGroups, function (index, item) {
                    var name = typeof item === "string" ? item : $(item).prop('name'),
                        checkboxes = $('input:radio[name="' + name + '"]', options.context);

                    if (checkboxes.length > 0) {
                        var first = checkboxes.eq(0);
                        first.parent().removeError('');
                        if (checkboxes.filter(':checked').length === 0) {
                            first.parent().addError('');
                            blankRequireds = blankRequireds.add(first);
                        }
                    }
                });

                // check autocompleters
                $.each(options.autocompleters, function (index, autocompleter) {
                    autocompleter.Guyuautocompleter('removeError');

                    var value = autocompleter.Guyuautocompleter('getValue');
                    if (value.id.length === 0 || $.isUndefined(value.data)) {
                        autocompleter.Guyuautocompleter('addError');
                        blankRequireds = blankRequireds.add(autocompleter);
                    }
                });

                // file extensions
                $.each(options.files.filter(':not(:blank)'), function (index, file) {

                    var $file = $(file),
                        restrictExtensions = $file.data().restrictExtensionsRegex;

                    if (restrictExtensions) {

                        var validExtensions = new RegExp(restrictExtensions, "gi");

                        if (Guyu.url($file.val()).extension.match(validExtensions) === null) {
                            $file.addError('File types supported are .' + restrictExtensions.split('|').join(' .'));
                            blankRequireds = blankRequireds.add($file);
                        }

                    }

                });

                var blankRequiredsWarning = "required";
                var hiddenReadOnlyRequiredsWarning = "You are unable to save the profile as you do not have permission to access all mandatory fields.<br>Please contact your Administrator for assistance.";
                if (blankRequireds.length > 0) {
                    var hiddenReadyOnlyRequiredFields = false;

                    $.each(blankRequireds, function (index, blankRequired) {
                        if (blankRequired.disabled) {
                            hiddenReadyOnlyRequiredFields = true;
                            return false;
                        }
                    });

                    if (hiddenReadyOnlyRequiredFields) {
                        blankRequiredsWarning = hiddenReadOnlyRequiredsWarning;
                    }
                    pageError.showPageError((numericCount === blankRequireds.length ? 'Numeric ' : '') + blankRequiredsWarning, { showTimestamp: false });
                    return blankRequireds;
                }

                if (typeof (customFieldPageData) !== "undefined" && customFieldPageData.fields !== undefined && customFieldPageData.fields.length > 0) {
                    var hiddenRequiredFields = false;
                    $.each(customFieldPageData.fields, function (index, customField) {
                        if (customField.hidden && customField.mandatory && customField.defaultValue === "" && customField.actualData === "") {
                            hiddenRequiredFields = true;
                            return false;
                        }
                    });
                    if (hiddenRequiredFields) {
                        pageError.showPageError(hiddenReadOnlyRequiredsWarning);
                        return customFieldPageData.fields;
                    }
                }
                return validateOptionalRequiredFields();
            },

            validateLandDateLeadTime: function (landType, landId, dateTime) {
                return new Guyu.Promise(function (resolve, reject) {
                    if (pageOptions.leadTimeBreakPolicy) {
                        resolve();
                    } else {
                        Guyu.fetch('/Web/LeadTime/ValidateBooking' + landType + '/' + Guyu.PageState.bookingId, { body: { landId: landId, dateTime: dateTime } }).then(function (json) {
                            if (json.ObjectResponse.LeadTimeOk) {
                                resolve();
                            } else {
                                reject(json.ObjectResponse);
                            }
                        }).fail(function () {
                            reject();
                        });

                    }
                });
            },

            // displays list of travellers
            displayTravellers: function (options) {
                options.travellersDiv.empty();

                if (options.travellers.length == 0) {
                    if (options.btnSearch.is(':visible') && options.btnCreate.is(':visible')) {
                        options.travellersDiv.append('<div class="traveller_info">Click \'Search\' to add an existing traveller.</div>')
                            .append('<div class="traveller_info">Click \'Add Guest\' to add a guest traveller.</div>');
                    } else if (options.btnSearch.is(':visible')) {
                        options.travellersDiv.append('<div class="traveller_info">Click \'Search\' to add an existing traveller.</div>');
                    } else if (options.btnCreate.is(':visible')) {
                        options.travellersDiv.append('<div class="traveller_info">Click \'Add Guest\' to add a guest traveller.</div>');
                    }
                    return;
                }

                $.each(options.travellers, function (i, item) {
                    var row = $('<div/>').addClass('row').data('traveller', item),
                        cell1 = $('<div/>').addClass('cell cell1').appendTo(row);

                    if (options.canCreateTraveller || options.userSelectedTravellers > 1) {
                        cell1.append($(document.createElement('img')).addClass('link').addClass('deletebutton').attr({ src: '/SOLV2/Images/master_button_delete_enabled.gif', alt: '', title: 'Click here to delete traveller' }).data('traveller', item).bind('click', options.context, options.deleteTravellerCallback));
                    } else {
                        cell1.append($(document.createElement('img')).addClass('link').addClass('deletebutton').attr({ src: '/SOLV2/Images/master_button_delete_disabled.gif', alt: '', title: '' }).hide().data('traveller', item));
                    }

                    var cell2 = $(document.createElement('div'))
                        .addClass('cell cell2 ellipse strong information')
                        .attr('title', (item.CL_sClient_Profile_Code === null || item.CL_sClient_Profile_Code.length === 0 ? 'Created Traveller' : 'ProfileCode: ' + item.CL_sClient_Profile_Code)).text(item.PA_sPassenger_Name)
                        .appendTo(row);

                    if (!$.isUndefined(item.Expiry_Alerts) && item.Expiry_Alerts.length > 0) {
                        $('<div/>')
                            .addClass(Guyu.browser.spriteCssClass())
                            .addClass('cell cell3 information icon_warning_small expiry_alert')
                            .appendTo(row)
                            .toolTip(item.Expiry_Alerts, { heading: 'Expiry Alert', showBy: 'mouse', width: 220 });
                    }

                    row.append(Guyu.clearFloat);
                    options.travellersDiv.append(row);
                });
            },

            deleteQuickBookingCookies: function () {
                return Guyu.fetch('/Web/QuickBooking/DeleteCookies', {});
            },

            getBookingTypeIcon: function (bookingType) {
                if (bookingType === Guyu.Globals.bookingType.travelAgency) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Travel Agency Booking" title="This is a Travel Agency Booking."/>';
                }
                if (bookingType === Guyu.Globals.bookingType.quickBooking) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Quick Booking" title="This is an Online Booking."/>';
                }
                if (bookingType === Guyu.Globals.bookingType.customBooking) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Custom Booking" title="This is an Online Custom Booking request."/>';
                }
                if (bookingType === Guyu.Globals.bookingType.travelAgencyTakeover) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Travel Agency Takeover" title="Control of this Booking has been Taken over by the Travel Agency."/>';
                }
                if (bookingType === Guyu.Globals.bookingType.consultant) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Consultant Booking" title="This booking was created by a Travel Consultant"/>';
                }
                if (bookingType === Guyu.Globals.bookingType.groupBooking) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Group Booking" title="This booking was created as part of a Group Booking"/>';
                }
                if (bookingType === Guyu.Globals.bookingType.groupBookingTa) {
                    return '<img class="information ' + Guyu.browser.spriteCssClass() + ' ' + Guyu.getBookingTypeIconClass(bookingType) + '" src="/SOLV2/Images/transparent.gif" alt="Group Booking Travel Agency Takeover" title="This booking was created as part of a Group Booking. Control of this Booking has been Taken over by the Travel Agency."/>';
                }
                return bookingType;
            },

            getBookingTypeIconClass: function (bookingType) {
                if (bookingType === Guyu.Globals.bookingType.travelAgency) {
                    return 'bookingtype_travelagency';
                }
                if (bookingType === Guyu.Globals.bookingType.quickBooking) {
                    return 'bookingtype_web';
                }
                if (bookingType === Guyu.Globals.bookingType.customBooking) {
                    return 'bookingtype_custombooking';
                }
                if (bookingType === Guyu.Globals.bookingType.travelAgencyTakeover) {
                    return 'bookingtype_travelagencytakeover';
                }
                if (bookingType === Guyu.Globals.bookingType.consultant) {
                    return 'bookingtype_consultant';
                }
                if (bookingType === Guyu.Globals.bookingType.groupBooking) {
                    return 'bookingtype_group';
                }
                if (bookingType === Guyu.Globals.bookingType.groupBookingTa) {
                    return 'bookingtype_group_ta';
                }
                return bookingType;
            },

            getBookingStatusIcon: function (bookingStatus, toolTip) {
                var message;
                switch (bookingStatus) {
                    case 'Pending':
                        message = '<img class="information" src="/SOLV2/Images/status_pending.gif" alt="Pending Authorisation" title="This Booking is Pending Authorisation.';
                        break;
                    case 'Authorised':
                    case 'Authorisation In Progress':
                        message = '<img class="information" src="/SOLV2/Images/status_authorised.gif" alt="Authorised" title="This Booking has been Authorised and is awaiting Ticketing.';
                        break;
                    case 'Rejected':
                    case 'Rejection In Progress':
                        message = '<img class="information" src="/SOLV2/Images/status_rejected.gif" alt="Rejected" title="This Booking has been Rejected by an Authoriser. See its details for more info.';
                        break;
                    case 'Ticketed':
                        message = '<img class="information" src="/SOLV2/Images/status_ticketed.gif" alt="Ticketed" title="This Booking has been Ticketed.';
                        break;
                    case 'Pending Cancellation':
                        message = '<img class="information" src="/SOLV2/Images/status_pendingcancellation.gif" alt="Pending Cancellation" title="This Booking is Pending Cancellation.';
                        break;
                    case 'Cancelled':
                        message = '<img class="information" src="/SOLV2/Images/status_cancelled.gif" alt="Cancelled" title="This Booking has been Cancelled.';
                        break;
                    default:
                        return bookingStatus;
                }

                if (toolTip) {
                    message = message + ' ' + toolTip;
                }

                return message + '"/>';
            },

            getContainsImage: function (contains) {
                var CONTAINS_AIR = 1;
                var CONTAINS_CAR = 2;
                var CONTAINS_HOTEL = 4;
                var CONTAINS_OTHER = 8;
                var CONTAINS_TRANSFER = 16;

                contains = parseInt(contains, 10);

                var imgs = '';

                if ((contains & CONTAINS_AIR) === CONTAINS_AIR) {
                    imgs += '<img class="information" src="/SOLV2/Images/itinerary/itinerary_segment_flight.gif" alt="Flight" title="Contains at least 1 Flight segment" />';
                }
                if ((contains & CONTAINS_CAR) === CONTAINS_CAR) {
                    imgs += '<img class="information" src="/SOLV2/Images/itinerary/itinerary_segment_car.gif" alt="Car" title="Contains at least 1 Car segment" />';
                }
                if ((contains & CONTAINS_HOTEL) === CONTAINS_HOTEL) {
                    imgs += '<img class="information" src="/SOLV2/Images/itinerary/itinerary_segment_hotel.gif" alt="Hotel" title="Contains at least 1 Hotel segment" />';
                }
                if ((contains & CONTAINS_TRANSFER) === CONTAINS_TRANSFER) {
                    imgs += '<img class="information" src="/SOLV2/Images/itinerary/itinerary_segment_taxi.gif" alt="Transfer" title="Contains at least 1 Transfer segment" />';
                }
                return imgs;
            },

            url: function (path) {
                var parts = path.split('?'),
                    url = parts[0],
                    querystring = parts.length === 1 ? '' : parts[1],
                    urlParts = url.split('/'),
                    fileName = urlParts[urlParts.length - 1],
                    fileParts = fileName.split('.'),
                    extension = fileParts.length === 1 ? '' : fileParts[fileParts.length - 1];
                return {
                    url: url,
                    file: fileName,
                    name: fileParts[0],
                    extension: extension,
                    querystring: querystring
                };
            },

            // status bar
            statusBar: {
                _container: undefined,
                _showing: false,
                _setSizePosition: function () {
                    var wnd = $(window),
                        height = this._container.height();
                    this._container.css('top', (wnd.scrollTop() + wnd.height() - height - this._heightExtra) + 'px');
                },
                initialise: function () {
                    var self = this;
                    if ($.isUndefined(self._container)) {
                        self._container = $(document.createElement('div')).addClass('statusbar').hide();
                        $(document.body).append(self._container);
                        var layout = self._container.layout();
                        self._heightExtra = layout.border.top + layout.border.bottom + layout.padding.top + layout.padding.bottom;
                    }
                },
                show: function (message, callback) {
                    var self = this;
                    self._showing = true;
                    self.initialise();
                    self._container.empty().html(message).show();
                    self._setSizePosition();
                    $(window).bind('scroll.statusbar', function () {
                        self._setSizePosition();
                    });

                    if (self._showing === false) {
                        self.hide();
                    }
                    self._showing === false;

                    if (!$.isUndefined(callback)) {
                        setTimeout(callback, Guyu.minimumTimeout);
                    }
                },
                hide: function () {
                    if (!$.isUndefined(this._container)) {
                        this._container.hide();
                        $(window).unbind('scroll.statusbar');
                    }
                    this._showing = false;
                }
            },

            mapping: {

                providers: {
                    google: 'google',
                    bing: 'bing'
                },

                controlSize: {
                    normal: 'normal',
                    small: 'small'
                },

                instance: [],
                mapapi: undefined,
                mapIconType: {
                    airport: 'airport',
                    city: 'city',
                    office: 'office',
                    address: 'address',
                    hotel: 'hotel',
                    hotelBreaksPolicy: 'hotelBreaksPolicy',
                    hotelOther: 'hotelOther',
                    car: 'car',
                    carBreaksPolicy: 'carBreaksPolicy',
                    carOther: 'carOther',
                    flightN: 'flightN',
                    flightNE: 'flightNE',
                    flightE: 'flightE',
                    flightSE: 'flightSE',
                    flightS: 'flightS',
                    flightSW: 'flightSW',
                    flightW: 'flightW',
                    flightNW: 'flightNW'
                },

                getDefaultOptions: function () {
                    return {
                        provider: Guyu.mapping.providers.google,
                        container: undefined,
                        loaded: $.emptyFunction
                    };
                },

                // initialise mapping for the mapping provider, loaded callback returns mapping supported for browser
                initialise: function (instanceName, options) {

                    if (!instanceName) {
                        alert('Developer Error: A mapping \'instanceName\' must be supplied for the instance of the map');
                    }

                    this.initialiseMapIcons();

                    if (!this.instance[instanceName]) {
                        this.instance[instanceName] =
                            {
                                options: $.extend({}, this.getDefaultOptions(), options)
                            };
                    }

                    if (!this[this.instance[instanceName].options.provider]) {
                        this.instance[instanceName].options.loaded.call(this, false);
                        return;
                    }

                    this[this.instance[instanceName].options.provider].initialise(instanceName);
                },

                initialiseMapIcons: function () {

                    if (this.mapIcons && this.mapIcons.length > 0) {
                        return;
                    }

                    this.mapIcons = [];

                    var size = { width: 28, height: 32 },
                        origin = { x: 0, y: 0 },
                        anchor = { x: 14, y: 32 };

                    this.mapIcons[Guyu.mapping.mapIconType.office] = { icon: "/SOLV2/Images/maps/map_marker_office.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.airport] = { icon: "/SOLV2/Images/maps/map_marker_airport.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.city] = { icon: "/SOLV2/Images/maps/map_marker_city.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.address] = { icon: "/SOLV2/Images/maps/map_marker_address.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.hotel] = { icon: "/SOLV2/Images/maps/map_marker_hotel.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.hotelBreaksPolicy] = { icon: "/SOLV2/Images/maps/map_marker_hotel_breakspolicy.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.hotelOther] = { icon: "/SOLV2/Images/maps/map_marker_hotel_other.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.car] = { icon: "/SOLV2/Images/maps/map_marker_car.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.carBreaksPolicy] = { icon: "/SOLV2/Images/maps/map_marker_car_breakspolicy.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.carOther] = { icon: "/SOLV2/Images/maps/map_marker_car_other.png", size: size, origin: origin, anchor: anchor };

                    // flights icons are different size and have no shadow
                    size = { width: 19, height: 19 };
                    anchor = { x: 9, y: 9 };

                    this.mapIcons[Guyu.mapping.mapIconType.flightNW] = { icon: "/SOLV2/Images/maps/map_marker_flight_nw.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.flightNE] = { icon: "/SOLV2/Images/maps/map_marker_flight_ne.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.flightSW] = { icon: "/SOLV2/Images/maps/map_marker_flight_sw.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.flightSE] = { icon: "/SOLV2/Images/maps/map_marker_flight_se.png", size: size, origin: origin, anchor: anchor };

                    // Flight N,S different again
                    size = { width: 21, height: 22 };
                    anchor = { x: 10, y: 11 };
                    this.mapIcons[Guyu.mapping.mapIconType.flightN] = { icon: "/SOLV2/Images/maps/map_marker_flight_n.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.flightS] = { icon: "/SOLV2/Images/maps/map_marker_flight_s.png", size: size, origin: origin, anchor: anchor };

                    // Flight E,W different again
                    size = { width: 21, height: 21 };
                    anchor = { x: 10, y: 10 };
                    this.mapIcons[Guyu.mapping.mapIconType.flightE] = { icon: "/SOLV2/Images/maps/map_marker_flight_e.png", size: size, origin: origin, anchor: anchor };
                    this.mapIcons[Guyu.mapping.mapIconType.flightW] = { icon: "/SOLV2/Images/maps/map_marker_flight_w.png", size: size, origin: origin, anchor: anchor };
                },

                create: function (instanceName, options) {
                    if (!instanceName) {
                        alert('Developer Error: A mapping \'instanceName\' must be supplied for the instance of the map');
                    }
                    if (!this.instance[instanceName]) {
                        alert('Developer Error: Mapping instance \'' + instanceName + '\' does not exist');
                    }

                    $.extend(this.instance[instanceName].options, { controlSize: Guyu.mapping.controlSize.normal, infoHeight: 'auto', infoWidth: 200 }, options);

                    var map = this[this.instance[instanceName].options.provider].create(instanceName, this.instance[instanceName].options);
                    this.panToWorldView(instanceName, {});
                    return map;
                },

                destroy: function (instanceName, options) {

                    function destroyInstance(name, opts) {
                        if (!Guyu.mapping.instance[name]) {
                            return;
                        }

                        if (Guyu.mapping.instance[name].options && Guyu.mapping[Guyu.mapping.instance[name].options.provider]) {
                            (Guyu.mapping[Guyu.mapping.instance[name].options.provider].destroy || $.emptyFunction).call(this, name, opts);
                        }

                        Guyu.mapping.instance[name] = undefined;
                    }

                    var opts = $.extend({}, { unloading: false }, options);

                    if (instanceName) {
                        destroyInstance(instanceName, opts);
                    } else {
                        for (var name in Guyu.mapping.instance) {
                            if (!jQuery.isFunction(Guyu.mapping.instance[name])) {
                                destroyInstance(name, opts);
                            }
                        }
                    }

                    $(window).unbind('unload.mapping');
                },

                reset: function (instanceName) {

                    function resetInstance(name) {
                        if (!Guyu.mapping.instance[name] || !Guyu.mapping.instance[name].options) {
                            return;
                        }
                        Guyu.mapping[Guyu.mapping.instance[name].options.provider].reset(name);
                    }

                    if (instanceName) {
                        resetInstance(instanceName);
                    } else {
                        for (var name in Guyu.mapping.instance) {
                            resetInstance(name);
                        }
                    }

                },

                getStaticMap: function (provider, options) {
                    return Guyu.mapping[provider].getStaticMap(options);
                },

                createPoint: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].createPoint(instanceName, options);
                },

                convertPointToLatLng: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].convertPointToLatLng(instanceName, options);
                },

                createMarker: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    var marker = Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].createMarker(instanceName, options);
                    marker._sol_options = options;
                    marker._sol_html = options.html;
                    marker._sol_point = options.point;
                    marker.point = options.point;
                    return marker;
                },

                getMarkerLatLng: function (instanceName, marker) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].getMarkerLatLng(instanceName, marker);
                },

                removeMarker: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].removeMarker(instanceName, options);
                },

                // {marker: marker, visible: boolean (optional), zIndex: number (optional)} 
                setMarkerOptions: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].setMarkerOptions(instanceName, options);
                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].getMarkerOptions(instanceName, { marker: options.marker });
                },

                getMarkerOptions: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].getMarkerOptions(instanceName, options);
                },

                createPolyline: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].createPolyline(instanceName, options);
                },

                removePolyline: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].removePolyline(instanceName, options);
                },

                addEvent: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    var event = Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].addEvent(instanceName, options);
                    Guyu.mapping.instance[instanceName].events.push(event);
                    return event;
                },

                removeEvent: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].removeEvent(instanceName, options);
                    for (var i = 0; i < Guyu.mapping.instance[instanceName].events.length; i++) {
                        if (options.handler && Guyu.mapping.instance[instanceName].events[i] === options.handler) {
                            Guyu.mapping.instance[instanceName].events.splice(i, 1);
                            options.handler = undefined;
                            break;
                        }
                    }
                },

                triggerEvent: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].triggerEvent(instanceName, options);
                },

                drawCircle: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].drawCircle(instanceName, options);
                },

                removeCircle: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].removeCircle(instanceName, options);
                },

                panToMarker: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    Guyu.mapping.instance[instanceName]._worldView = false;
                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].panToMarker(instanceName, options);
                },

                distanceInKm: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    var from = Guyu.mapping.convertPointToLatLng(instanceName, { point: options.from }),
                        to = Guyu.mapping.convertPointToLatLng(instanceName, { point: options.to });

                    return LatLon.distHaversine(from.lat.toString().parseDeg(), from.lng.toString().parseDeg(), to.lat.toString().parseDeg(), to.lng.toString().parseDeg()).toString().formatAsNumber(2);
                },

                panToWorldView: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    Guyu.mapping.setCenter(instanceName, { center: Guyu.mapping.createPoint(instanceName, { lat: 0, lng: 0 }) });
                    Guyu.mapping.setZoom(instanceName, { zoom: 1 });

                    Guyu.mapping.instance[instanceName]._worldView = true;
                },

                isWorldView: function (instanceName) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return false;
                    }

                    return Guyu.mapping.instance[instanceName]._worldView || false;
                },

                getMapOptions: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    return Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].getMapOptions(instanceName, options);
                },

                // options { center: point } // returns jQuery deffered
                setCenter: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }

                    Guyu.mapping.instance[instanceName]._worldView = false;

                    var deferred = $.Deferred();
                    $.when(Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].setCenter(instanceName, options))
                        .done(function () {
                            deferred.resolve(instanceName, Guyu.mapping.getMapOptions(instanceName));
                        });
                    return deferred.promise();
                },

                // options { zoom: number } returns jQuery Deferred
                setZoom: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    Guyu.mapping.instance[instanceName]._worldView = false;

                    var deferred = $.Deferred();

                    if (Guyu.mapping.getMapOptions(instanceName).zoom === (options.zoom || 0)) {
                        deferred.resolve(instanceName, Guyu.mapping.getMapOptions(instanceName));
                    } else {
                        $.when(Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].setZoom(instanceName, options))
                            .done(function () {
                                deferred.resolve(instanceName, Guyu.mapping.getMapOptions(instanceName));
                            });
                    }
                    return deferred.promise();
                },

                resize: function (instanceName, options) {
                    if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }
                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].resize(instanceName, options);
                },

                geocode: function (instanceName, options) {
                    /*if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map || !Guyu.mapping.instance[instanceName].options) {
                        return;
                    }*/

                    var opts = $.extend({}, { error: function () { }, callback: function () { } }, options);

                    Guyu.mapping[Guyu.mapping.instance[instanceName].options.provider].geocode(instanceName, options);
                },

                /* calculates a Lat/Lng square from points travelled to */
                /* this method requires the latlng.js file */
                mapSquare: function () {
                    return {
                        topLeft: {
                            lat: undefined,
                            lng: undefined
                        },
                        topRight: {
                            lat: undefined,
                            lng: undefined
                        },
                        bottomLeft: {
                            lat: undefined,
                            lng: undefined
                        },
                        bottomRight: {
                            lat: undefined,
                            lng: undefined
                        },
                        addPoint: function (lat, lng) {
                            /* calculate square as 0,0 to 180,360 */
                            lat = lat + 90;
                            lng = lng + 180;

                            /* bottom left  lat 0, lng 0 */
                            if ($.isUndefined(this.bottomLeft.lat) || this.bottomLeft.lat > lat) {
                                this.bottomLeft.lat = lat;
                            }
                            if ($.isUndefined(this.bottomLeft.lng) || this.bottomLeft.lng > lng) {
                                this.bottomLeft.lng = lng;
                            }

                            /* bottom right lat 0, lng 360 */
                            if ($.isUndefined(this.bottomRight.lat) || this.bottomRight.lat > lat) {
                                this.bottomRight.lat = lat;
                            }
                            if ($.isUndefined(this.bottomRight.lng) || this.bottomRight.lng < lng) {
                                this.bottomRight.lng = lng;
                            }

                            /* top left lat 180, lng 0 */
                            if ($.isUndefined(this.topLeft.lat) || this.topLeft.lat < lat) {
                                this.topLeft.lat = lat;
                            }
                            if ($.isUndefined(this.topLeft.lng) || this.topLeft.lng > lng) {
                                this.topLeft.lng = lng;
                            }

                            /* top left lat 180, lng 360 */
                            if ($.isUndefined(this.topRight.lat) || this.topRight.lat < lat) {
                                this.topRight.lat = lat;
                            }
                            if ($.isUndefined(this.topRight.lng) || this.topRight.lng < lng) {
                                this.topRight.lng = lng;
                            }
                        },
                        getSquareAsLatLng: function () {
                            return {
                                bottom: {
                                    left: {
                                        lat: this.bottomLeft.lat - 90,
                                        lng: this.bottomLeft.lng - 180
                                    },
                                    right: {
                                        lat: this.bottomRight.lat - 90,
                                        lng: this.bottomRight.lng - 180
                                    }
                                },
                                top: {
                                    left: {
                                        lat: this.topLeft.lat - 90,
                                        lng: this.topLeft.lng - 180
                                    },
                                    right: {
                                        lat: this.topRight.lat - 90,
                                        lng: this.topRight.lng - 180
                                    }
                                }
                            };
                        },

                        getDiff: function () {
                            return {
                                lat: (this.topLeft.lat - this.bottomLeft.lat),
                                lng: (this.bottomRight.lng - this.bottomLeft.lng)
                            };
                        },

                        getMiddle: function () {
                            var diff = this.getDiff();
                            return {
                                lat: (diff.lat === 0 ? this.topLeft.lat : this.bottomLeft.lat + (diff.lat / 2)) - 90,
                                lng: (diff.lng === 0 ? this.topLeft.lng : this.bottomLeft.lng + (diff.lng / 2)) - 180
                            };
                        },

                        getSurfaceArea: function () {
                            var diff = this.getDiff();
                            return (diff.lat * diff.lng);
                        }
                    };
                },

                bing: {

                    initialised: false,
                    script: undefined,
                    mapIcons: [],

                    initialise: function (instanceName) {

                        if (this.initialised || this.script) {
                            Guyu.mapping.instance[instanceName].options.loaded.call(this, true);
                            return;
                        }

                        var self = this,
                            baseUrl = '://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=bingMapsOnScriptLoad',
                            src = Guyu.browser.isHttps()
                                ? 'https' + baseUrl + '&s=1'
                                : 'http' + baseUrl;

                        this.script = $('<script/>')
                            .attr({ 'type': 'text/javascript', src: src, charset: 'UTF-8' })
                            .data('instanceName', instanceName);

                        $(document).find('head:first').append(this.script);
                        $(window).bind('unload.mapping', function () {
                            Guyu.mapping.destroy(instanceName, { unloading: true });
                        });

                    },

                    loadMap: function () {

                        var self = this;
                        self.initialised = true;
                        self.initialiseMapIcons();

                        var instanceName = self.script.data('instanceName');
                        Guyu.mapping.instance[instanceName].options.loaded.call(self, true);
                    },

                    initialiseMapIcons: function () {
                        if (this.mapIcons && this.mapIcons.length > 0) {
                            return;
                        }

                        this.mapIcons = [];

                        for (var mapIconType in Guyu.mapping.mapIcons) {
                            this.mapIcons[mapIconType] = Guyu.mapping.mapIcons[mapIconType];
                        }
                    },

                    create: function (instanceName, options) {
                        if (!this.initialised || !options.container) {
                            return;
                        }

                        if (Guyu.mapping.instance[instanceName].map) {
                            return Guyu.mapping.instance[instanceName].map;
                        }

                        var opts = $.extend({}, { center: { lat: 0, lng: 0 }, mapTypeId: Microsoft.Maps.MapTypeId.road, zoom: 0 }, options);

                        var map = new Microsoft.Maps.Map(options.container, {
                            credentials: Guyu.mapping.instance[instanceName].options.key,
                            mapTypeId: opts.mapTypeId,
                            center: Guyu.mapping.createPoint(instanceName, opts.center),
                            zoom: opts.zoom,
                            enableSearchLogo: false
                        });

                        if (options.width && map.getWidth() !== options.width) {
                            map.setOptions({ width: options.width, height: options.height || map.getHeight() });
                        }

                        Guyu.mapping.instance[instanceName].map = map;
                        Guyu.mapping.instance[instanceName].markers = [];
                        Guyu.mapping.instance[instanceName].overlays = [];
                        Guyu.mapping.instance[instanceName].events = [];

                        return Guyu.mapping.instance[instanceName].map;
                    },

                    _showInfo: function (instanceName, marker) {

                        if (!marker || !marker._sol_options || !marker._sol_options.html) {
                            return;
                        }

                        var self = this;
                        self._hideInfo(instanceName);

                        var mapOptions = Guyu.mapping.instance[instanceName].options,
                            infoDimensions = {
                                width: marker._sol_options.infoWidth || mapOptions.infoWidth,
                                height: marker._sol_options.infoHeight || mapOptions.infoHeight
                            };

                        // create custom html for info  
                        var contentId = 'sol_' + instanceName + '_bing_info_content',
                            html = $('<div/>').append(
                                $('<div style="background-color:white; border: 1px solid rgb(136,136,136); padding: 5px;border-radius: 5px;"/>')
                                    .width(infoDimensions.width)
                                    .height(infoDimensions.height)
                                    .append('<div style="text-align:right"><span class="bing_info_close link" title="Close">X</span></div>')
                                    .append($('<div class="sol_bing_content" style="margin-top: 3px;margin-bottom: 3px;"></div>')
                                        .attr('id', contentId)
                                        .height(function (i, value) {
                                            return infoDimensions.height.toString().toLowerCase() === 'auto'
                                                ? 'auto'
                                                : (parseInt(infoDimensions.height, 10) - 26);
                                        })
                                        .css('overflow', function (i, value) {
                                            return infoDimensions.height.toString().toLowerCase() === 'auto'
                                                ? 'visible'
                                                : 'auto';
                                        })));

                        var infoBox = new Microsoft.Maps.Infobox(marker.getLocation(), {
                            visible: true,
                            htmlContent: html.html(),
                            showCloseButton: true,
                            showPointer: true,
                            offset: new Microsoft.Maps.Point(0, 0)
                        });
                        infoBox.setLocation(marker.getLocation());

                        Guyu.mapping.instance[instanceName].map.entities.push(infoBox);
                        Guyu.mapping.instance[instanceName].infoBox = infoBox;

                        $('#' + contentId).append(marker._sol_options.html);

                        Guyu.mapping.addEvent(instanceName, {
                            object: infoBox, eventName: 'click', handler: function (e) {
                                var $target = $(e.originalEvent.target);
                                if ($target.is('span.bing_info_close')) {
                                    e.handled = true;
                                    self._hideInfo(instanceName);
                                } else if ($target.is('span.link')) {
                                    e.handled = true;
                                    $target.click();
                                }
                            }
                        });

                        /*
                        Guyu.mapping.instance[instanceName].infoBox.setOptions({
                            visible: true,
                            description: 'Loading...',
                            offset: new Microsoft.Maps.Point(0, Math.floor(marker.getHeight() / 2))
                        });

                        // hack find description node to place html into as not supported by Bing
                        var node;
                        if (Guyu.mapping.instance[instanceName].infoBox.cm1001_er_etr && Guyu.mapping.instance[instanceName].infoBox.cm1001_er_etr.descriptionNode) {
                            node = Guyu.mapping.instance[instanceName].infoBox.cm1001_er_etr.descriptionNode;
                        } else {
                            for (var s in Guyu.mapping.instance[instanceName].infoBox) {
                                if (Guyu.mapping.instance[instanceName].infoBox[s] && Guyu.mapping.instance[instanceName].infoBox[s].descriptionNode) {
                                    node = Guyu.mapping.instance[instanceName].infoBox[s].descriptionNode;
                                    break;
                                }
                            }
                        }
                        if (node) {
                            $(node).empty().append(marker._sol_html);
                        } else {
                            Guyu.mapping.instance[instanceName].infoBox.setOptions({visible: false});
                        }
                        */
                    },

                    _hideInfo: function (instanceName) {
                        if (Guyu.mapping.instance[instanceName].infoBox) {
                            Guyu.mapping.instance[instanceName].map.entities.remove(Guyu.mapping.instance[instanceName].infoBox);
                            Guyu.mapping.instance[instanceName].infoBox = undefined;
                        }
                    },

                    reset: function (instanceName) {
                        if (!Guyu.mapping.instance[instanceName].map) {
                            return;
                        }

                        Guyu.mapping.instance[instanceName].map.entities.clear();
                        Guyu.mapping.instance[instanceName].markers = [];
                        Guyu.mapping.instance[instanceName].overlays = [];
                        Guyu.mapping.instance[instanceName].events = [];
                        Guyu.mapping.instance[instanceName].infoBox = undefined;

                        Guyu.mapping.panToWorldView(instanceName, {});
                    },

                    destroy: function (instanceName, options) {
                        if (typeof Guyu.mapping.instance[instanceName].map === "undefined") {
                            return;
                        }

                        // hack for custom bing 7.0 infobox
                        $('span.bing_info_close[data-instanceName="' + instanceName + '"]').die('click');

                        Guyu.mapping.instance[instanceName].map.dispose();
                        $(Guyu.mapping.instance[instanceName].map.mapelement).empty();
                        Guyu.mapping.instance[instanceName].map = undefined;
                    },

                    createPoint: function (instanceName, options) {
                        if (!Guyu.mapping.instance[instanceName] || !Guyu.mapping.instance[instanceName].map) {
                            return;
                        }

                        return new Microsoft.Maps.Location(options.lat, Microsoft.Maps.Location.normalizeLongitude(options.lng));
                    },

                    convertPointToLatLng: function (instanceName, options) {
                        return {
                            lat: parseFloat(options.point.latitude),
                            lng: parseFloat(options.point.longitude)
                        };
                    },

                    setZoom: function (instanceName, options) {
                        var deferred = $.Deferred();
                        var event = Guyu.mapping.addEvent(instanceName, {
                            eventName: 'viewchangeend', handler: function () {
                                Guyu.mapping.removeEvent(instanceName, { handler: event });
                                deferred.resolve();
                            }
                        });
                        Guyu.mapping.instance[instanceName].map.setView({ zoom: options.zoom });
                        return deferred.promise();
                    },

                    setCenter: function (instanceName, options) {
                        var deferred = $.Deferred();
                        var event = Guyu.mapping.addEvent(instanceName, {
                            eventName: 'viewchangeend', handler: function () {
                                Guyu.mapping.removeEvent(instanceName, { handler: event });
                                deferred.resolve();
                            }
                        });
                        Guyu.mapping.instance[instanceName].map.setView({ center: options.center });
                        return deferred.promise();
                    },

                    resize: function (instanceName, options) {
                        var viewOptions = {
                            width: options.width || Guyu.mapping.instance[instanceName].map.getWidth(),
                            height: options.height || Guyu.mapping.instance[instanceName].map.getHeight()
                        };
                        Guyu.mapping.instance[instanceName].map.setOptions(viewOptions);
                    },

                    getMapOptions: function (instanceName, options) {
                        return {
                            center: this.convertPointToLatLng(instanceName, { point: Guyu.mapping.instance[instanceName].map.getCenter() }),
                            zoom: Guyu.mapping.instance[instanceName].map.getZoom()
                        };
                    },

                    _getId: function (instanceName, prefix) {
                        return instanceName + '_entity_' + prefix + '_' + Math.random().toString().substring(2);
                    },

                    _setId: function (instanceName, prefix, entity) {
                        entity._sol_id = this._getId(instanceName, prefix);
                    },

                    // options {point, iconType, html, tooltip, infoWidth, infoHeight}
                    createMarker: function (instanceName, options) {

                        var self = this,
                            id = self._getId(instanceName, options.iconType),
                            mapIcon = this.mapIcons[options.iconType],
                            marker = new Microsoft.Maps.Pushpin(options.point, {
                                id: id,
                                typeName: id,
                                draggable: options.draggable,
                                visible: true,
                                icon: mapIcon.icon,
                                width: mapIcon.size.width,
                                height: mapIcon.size.height,
                                anchor: new Microsoft.Maps.Point(mapIcon.anchor.x, mapIcon.anchor.y)
                            });

                        this._setId(instanceName, options.iconType, marker);

                        Guyu.mapping.instance[instanceName].map.entities.push(marker);

                        // hack to set tool tip
                        var dom;
                        if (marker.cm1001_er_der && marker.cm1001_er_der.dom) {
                            dom = marker.cm1001_er_der.dom;
                        } else {
                            for (var s in marker) {
                                if (marker[s] && marker[s].dom) {
                                    dom = marker[s].dom;
                                    break;
                                }
                            }
                        }
                        // hack
                        if (dom) {
                            marker._sol_element = $(dom).attr('title', options.tooltip);

                            if (options.html || (options.click || $.isFunction(options.click))) {

                                marker._sol_element.css('cursor', 'pointer');

                                Guyu.mapping.addEvent(instanceName, {
                                    object: marker, eventName: 'click', handler: function (e) {
                                        self._showInfo(instanceName, this.target);
                                        if (options.click || $.isFunction(options.click)) {
                                            options.click.apply(this, options.clickArgs || []);
                                        }
                                        if (e) {
                                            e.handled = true; // cancel buble
                                        }
                                    }
                                });
                            }

                        }

                        Guyu.mapping.instance[instanceName].markers.push(marker);
                        return marker;
                    },

                    removeMarker: function (instanceName, options) {
                        var uniqueId = options.marker.getTypeName();

                        for (var i = 0; i < Guyu.mapping.instance[instanceName].markers.length; i++) {
                            if (Guyu.mapping.instance[instanceName].markers[i].getTypeName() === uniqueId) {
                                Guyu.mapping.instance[instanceName].markers.splice(i, 1);
                                break;
                            }
                        }

                        this._hideInfo(instanceName);
                        Guyu.mapping.instance[instanceName].map.entities.remove(options.marker);
                    },

                    getMarkerLatLng: function (instanceName, marker) {

                        var position = marker.getLocation();

                        return {
                            lat: position.latitude,
                            lng: position.longitude
                        };

                    },

                    setMarkerOptions: function (instanceName, options) {
                        if (typeof options.visible === "boolean") {
                            options.marker.setOptions({ visible: options.visible });
                        }
                        if (typeof options.zIndex === "number") {
                            options.marker.setOptions({ zIndex: options.zIndex });
                        }
                        // bing 7.0 hack 
                        if (options.visible && options.marker._sol_html && options.marker._sol_element) {
                            options.marker._sol_element.css('cursor', 'pointer');
                        }
                    },

                    getMarkerOptions: function (instanceName, options) {
                        return {
                            visible: options.marker.getVisible(),
                            zIndex: options.marker.getZIndex()
                        };
                    },

                    panToMarker: function (instanceName, marker) {
                        var self = this;
                        Guyu.mapping.setCenter(instanceName, { center: marker.getLocation() }).done(function () {
                            self._showInfo(instanceName, marker);
                        });
                    },

                    // options {points [], color, size, opacity}
                    createPolyline: function (instanceName, options) {

                        var rgb = options.color.convertHexColorToRgb(),
                            polyline = new Microsoft.Maps.Polyline(options.points, {
                                visible: true,
                                strokeThickness: options.size,
                                color: new Microsoft.Maps.Color(options.opacity, rgb.r, rgb.g, rgb.b)
                            });

                        this._setId(instanceName, 'polyline', polyline);

                        Guyu.mapping.instance[instanceName].map.entities.push(polyline);
                        Guyu.mapping.instance[instanceName].overlays.push(polyline);
                        return polyline;
                    },

                    // {latLng, radius, strokeColor, strokeWeight, strokeOpacity, fillColor, fillOpacity}
                    drawCircle: function (instanceName, options) {

                        function _getCirclePoints(latlong, radius) {
                            var R = 6371, // earth's mean radius in km
                                lat = (latlong.latitude * Math.PI) / 180, //rad
                                lon = (latlong.longitude * Math.PI) / 180, //rad
                                d = parseFloat(radius) / R,  // d = angular distance covered on earth's surface
                                points = [];

                            for (x = 0; x <= 360; x++) {
                                var p2 = new Microsoft.Maps.Location(0, 0),
                                    brng = x * Math.PI / 180; //rad
                                p2.latitude = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng));
                                p2.longitude = ((lon + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(p2.latitude))) * 180) / Math.PI;
                                p2.latitude = (p2.latitude * 180) / Math.PI;
                                points.push(p2);
                            }

                            return points;
                        }

                        function _convertToRgb(color) {
                            var rgb = {
                                r: 0,
                                g: 0,
                                b: 0
                            };
                            var rgbColor = color.toUpperCase().replace('RGB(', '').replace(')', '').split(',');

                            if (rgbColor.length !== 3) {
                                return rgb;
                            }

                            rgb.r = parseInt(rgbColor[0], 10);
                            rgb.g = parseInt(rgbColor[1], 10);
                            rgb.b = parseInt(rgbColor[2], 10);
                            return rgb;
                        }

                        // bing opacity is 0-255, sol is a percent e.g. .75
                        function _getOpacity(opacity) {
                            // onePercent = 2.55 (255 / 100)
                            return Math.abs(2.55 * (parseFloat(opacity || 1) * 100));
                        }

                        var lineColor = _convertToRgb(options.strokeColor),
                            fillColor = _convertToRgb(options.fillColor),
                            circle = new Microsoft.Maps.Polygon(_getCirclePoints(options.latLng, options.radius), {
                                fillColor: new Microsoft.Maps.Color(_getOpacity(options.fillOpacity), fillColor.r, fillColor.g, fillColor.b),
                                strokeColor: new Microsoft.Maps.Color(_getOpacity(options.strokeOpacity), lineColor.r, lineColor.g, lineColor.b),
                                strokeThickness: options.strokeWeight,
                                visible: true
                            });

                        this._setId(instanceName, 'circle', circle);

                        Guyu.mapping.instance[instanceName].map.entities.push(circle);
                        Guyu.mapping.instance[instanceName].overlays.push(circle);
                        return circle;
                    },

                    _deleteOverlayShape: function (instanceName, shape) {
                        var uniqueId = shape._sol_id;

                        for (var i = 0; i < Guyu.mapping.instance[instanceName].overlays.length; i++) {
                            if (Guyu.mapping.instance[instanceName].overlays[i]._sol_id === uniqueId) {
                                Guyu.mapping.instance[instanceName].overlays.splice(i, 1);
                                break;
                            }
                        }

                        Guyu.mapping.instance[instanceName].map.entities.remove(shape);
                    },

                    removeCircle: function (instanceName, options) {
                        this._deleteOverlayShape(instanceName, options.circle);
                    },

                    removePolyline: function (instanceName, options) {
                        this._deleteOverlayShape(instanceName, options.polyline);
                    },

                    // {object, eventName, handler}
                    addEvent: function (instanceName, options) {
                        return Microsoft.Maps.Events.addHandler(options.object || Guyu.mapping.instance[instanceName].map, options.eventName, options.handler);
                    },

                    // {handler}
                    removeEvent: function (instanceName, options) {
                        Microsoft.Maps.Events.removeHandler(options.handler);
                    },

                    // {object, eventName, args}
                    triggerEvent: function (instanceName, options) {
                        Microsoft.Maps.Events.invoke(options.object || Guyu.mapping.instance[instanceName].map, options.eventName, options.args);
                    },

                    getStaticMap: function (options) {
                        var protocol = Guyu.browser.isHttps() ? 'https' : 'http',
                            url = protocol + '://dev.virtualearth.net/REST/v1/Imagery/Map/Road',
                            center = { lat: options.lat, lng: options.lng },
                            pushpins = '';

                        if ($.isUndefined(options.markers) || options.markers.length === 0) {
                            pushpins = '&pp=' + options.lat + ',' + options.lng + ';4;A';
                        } else {
                            $.each(options.markers, function (index, marker) {
                                pushpins += '&pp='
                                    + marker.lat + ',' + marker.lng
                                    + ';' + ((marker.colour || 'green').toString().toLowerCase() === 'green' ? '4' : '10')
                                    + ';' + ($.isUndefined(marker.id) ? String.fromCharCode(97 + index) : marker.id).toUpperCase();

                                // bing only supports max 18
                                if (index >= 17) {
                                    return false;
                                }
                            });

                            if (!options.lat) {
                                var from = new LatLon(options.markers[0].lat, options.markers[0].lng),
                                    to = new LatLon(options.markers[options.markers.length - 1].lat, options.markers[options.markers.length - 1].lng),
                                    midpoint = from.getHalfway(to);

                                center.lat = midpoint.lat;
                                center.lng = midpoint.lon;
                            }
                        }

                        /* path not suppored on Bing */
                        return url + '/' + center.lat + ',' + center.lng + '/' + (options.zoom || '10')
                            + '?mapSize=' + options.width + ',' + options.height
                            + pushpins
                            + '&key=' + options.key;
                    },

                    geocode: function (instanceName, options) {

                        Guyu.mapping.instance[instanceName].map.getCredentials(function (credentials) {

                            var protocol = Guyu.browser.isHttps() ? 'https' : 'http',
                                restUrl = protocol + '://dev.virtualearth.net/REST/v1/Locations?'
                                    + 'key=' + credentials
                                    + '&output=json'
                                    + '&jsonp=?',
                                addressUrl = restUrl + '&countryRegion=' + (options.country || '')
                                    + '&addressLine=' + options.address,
                                locationUrl = restUrl + '&query=' + options.address + ((options.country || '').length === 0 ? '' : ',' + options.country);

                            /* bing cant search for landmarks and address in a single query so have to do it in multiple */
                            $.when($.getJSON(addressUrl), $.getJSON(locationUrl))
                                .done(function (addressResults, locationResults) {

                                    var groupedResults = [addressResults[0], locationResults[0]],
                                        addresses = [];

                                    $.each(groupedResults, function (i, results) {

                                        if (results.statusCode === 401) {
                                            alert("Access was denied to Bing Maps because of incorrect Bing Maps credentials.\n\nPlease contact your Help desk.");
                                            return false;
                                        } else if (results.errorDetails && results.errorDetails.length > 0) {
                                            options.error(results.errorDetails);
                                            return false;
                                        }

                                        if (results.resourceSets.length > 0) {
                                            $.each(results.resourceSets[0].resources, function () {
                                                addresses.push({
                                                    address: this.name,
                                                    country: this.address.countryRegion,
                                                    point: Guyu.mapping.createPoint(instanceName, { lat: this.point.coordinates[0], lng: this.point.coordinates[1] })
                                                });
                                            });
                                        }
                                    });

                                    addresses.sort(function (left, right) {
                                        if (left.address < right.address) {
                                            return -1;
                                        }
                                        if (left.address > right.address) {
                                            return 1;
                                        }
                                        return 0;
                                    });

                                    options.callback(addresses);
                                })
                                .fail(function (jqXHR, ajaxSettings, thrownError) {
                                    if ($.isFunction(options.error)) {
                                        options.error(null, jqXHR, ajaxSettings, thrownError);
                                    }
                                });

                        });

                    }

                },

                google: {

                    initialised: false,
                    initialisedWithInstanceName: undefined,
                    mapIcons: [],

                    initialise: function (instanceName) {

                        if (this.initialised && window.google && window.google.maps) {
                            Guyu.mapping.instance[instanceName].geocoder = new google.maps.Geocoder();
                            Guyu.mapping.instance[instanceName].options.loaded.call(this, true);
                            return;
                        }

                        var googleMapsKey = Guyu.mapping.instance[instanceName].options.key;

                        this.initialisedWithInstanceName = instanceName;
                        $('body').append('<script src="https://maps.googleapis.com/maps/api/js?key=' + googleMapsKey + '&callback=Guyu.mapping.google.loadMap"></script>');

                        $(window).bind('unload.mapping', function () {
                            Guyu.mapping.destroy(instanceName, { unloading: true });
                        });

                    },

                    loadMap: function () {
                        var self = Guyu.mapping.google;
                        self.initialised = true;
                        self.initialiseMapIcons();

                        var instanceName = self.initialisedWithInstanceName;
                        Guyu.mapping.instance[instanceName].geocoder = new google.maps.Geocoder();
                        Guyu.mapping.instance[instanceName].options.loaded.call(self, true);
                    },

                    initialiseMapIcons: function () {

                        if (this.mapIcons && this.mapIcons.length > 0) {
                            return;
                        }

                        this.mapIcons = [];

                        for (var mapIconType in Guyu.mapping.mapIcons) {
                            if (!jQuery.isFunction(Guyu.mapping.mapIcons[mapIconType])) {
                                var mapIcon = Guyu.mapping.mapIcons[mapIconType],
                                    size = new google.maps.Size(mapIcon.size.width, mapIcon.size.height),
                                    origin = new google.maps.Point(mapIcon.origin.x, mapIcon.origin.y),
                                    anchor = new google.maps.Point(mapIcon.anchor.x, mapIcon.anchor.y),
                                    markerImage = new google.maps.MarkerImage(mapIcon.icon, size, origin, anchor);

                                this.mapIcons[mapIconType] = markerImage;
                            }
                        }
                    },

                    // {container, infoWidth}
                    create: function (instanceName, options) {
                        if (!this.initialised || !options.container) {
                            return;
                        }

                        if (Guyu.mapping.instance[instanceName].map) {
                            return Guyu.mapping.instance[instanceName].map;
                        }

                        var opts = $.extend({}, { center: { lat: 0, lng: 0 }, mapTypeId: google.maps.MapTypeId.ROADMAP, zoom: 0 }, options),
                            mapOptions = {
                                center: Guyu.mapping.createPoint(instanceName, opts.center),
                                mapTypeId: opts.mapTypeId,
                                zoom: opts.zoom
                            };

                        if (opts.controlSize === Guyu.mapping.controlSize.small) {
                            mapOptions.mapTypeControlOptions = { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU };
                            mapOptions.navigationControlOptions = { style: google.maps.NavigationControlStyle.SMALL };
                        }

                        Guyu.mapping.instance[instanceName].map = new google.maps.Map(options.container, mapOptions);
                        Guyu.mapping.instance[instanceName].infowindow = new google.maps.InfoWindow({ maxWidth: options.infoWidth });
                        Guyu.mapping.instance[instanceName].markers = [];
                        Guyu.mapping.instance[instanceName].overlays = [];
                        Guyu.mapping.instance[instanceName].events = [];

                        return Guyu.mapping.instance[instanceName].map;
                    },

                    reset: function (instanceName) {

                        if (!Guyu.mapping.instance[instanceName].map) {
                            return;
                        }

                        Guyu.mapping.instance[instanceName].infowindow.close();

                        $.each(Guyu.mapping.instance[instanceName].events, function (index, listener) {
                            google.maps.event.removeListener(listener);
                        });
                        Guyu.mapping.instance[instanceName].events = [];

                        $.each(Guyu.mapping.instance[instanceName].markers, function (index, marker) {
                            marker.setMap(null);
                        });
                        Guyu.mapping.instance[instanceName].markers = [];

                        $.each(Guyu.mapping.instance[instanceName].overlays, function (index, overlay) {
                            overlay.setMap(null);
                        });

                        Guyu.mapping.instance[instanceName].overlays = [];

                        Guyu.mapping.panToWorldView(instanceName, {});
                    },

                    destroy: function (instanceName) {
                        Guyu.mapping.google.reset(instanceName);
                        Guyu.mapping.instance[instanceName].geocoder = undefined;

                        if (typeof Guyu.mapping.instance[instanceName].map === "undefined") {
                            return;
                        }

                        $(Guyu.mapping.instance[instanceName].map.getDiv()).empty();
                        Guyu.mapping.instance[instanceName].map = undefined;
                    },

                    setZoom: function (instanceName, options) {
                        var deferred = $.Deferred();
                        var event = Guyu.mapping.addEvent(instanceName, {
                            eventName: 'zoom_changed', handler: function () {
                                Guyu.mapping.removeEvent(instanceName, { handler: event });
                                deferred.resolve();
                            }
                        });
                        Guyu.mapping.instance[instanceName].map.setZoom(options.zoom);
                        return deferred.promise();
                    },

                    setCenter: function (instanceName, options) {
                        var deferred = $.Deferred();
                        var event = Guyu.mapping.addEvent(instanceName, {
                            eventName: 'center_changed', handler: function () {
                                Guyu.mapping.removeEvent(instanceName, { handler: event });
                                deferred.resolve();
                            }
                        });

                        try {
                            Guyu.mapping.instance[instanceName].map.setCenter(options.center);
                        } catch (e) {
                        }

                        return deferred.promise();
                    },

                    resize: function (instanceName, options) {
                        google.maps.event.trigger(Guyu.mapping.instance[instanceName].map, 'resize');
                    },

                    getMapOptions: function (instanceName, options) {
                        return {
                            center: this.convertPointToLatLng(instanceName, { point: Guyu.mapping.instance[instanceName].map.getCenter() }),
                            zoom: Guyu.mapping.instance[instanceName].map.getZoom()
                        };
                    },

                    createPoint: function (instanceName, options) {
                        return new google.maps.LatLng(options.lat, options.lng);
                    },

                    convertPointToLatLng: function (instanceName, options) {
                        return {
                            lat: options.point.lat(),
                            lng: options.point.lng()
                        };
                    },

                    // options {point, map, iconType, html, tooltip}
                    createMarker: function (instanceName, options) {

                        var markerOptions = {
                            position: options.point,
                            map: Guyu.mapping.instance[instanceName].map,
                            title: options.tooltip,
                            flat: true,
                            icon: Guyu.mapping.google.mapIcons[options.iconType],
                            clickable: true,
                            draggable: options.draggable,
                            visible: true
                        },
                            marker = new google.maps.Marker(markerOptions);

                        if (options.html) {
                            marker.html = (options.html.jquery) ? options.html.get(0) : options.html;

                            Guyu.mapping.instance[instanceName].events.push(
                                google.maps.event.addListener(marker, 'click', function () {
                                    Guyu.mapping.google._showInfo(instanceName, { marker: marker });
                                    if ($.isFunction(options.click)) {
                                        options.click.apply(this, options.clickArgs || []);
                                    }
                                })
                            );
                        }

                        Guyu.mapping.instance[instanceName].markers.push(marker);
                        return marker;
                    },

                    // {marker}
                    removeMarker: function (instanceName, options) {
                        var newMarkers = [],
                            uniqueId = options.marker.getPosition().lat() + '|' + options.marker.getPosition().lng();

                        for (var i = 0; i < Guyu.mapping.instance[instanceName].markers.length; i++) {
                            if ((Guyu.mapping.instance[instanceName].markers[i].getPosition().lat() + '|' + options.marker.getPosition().lng()) !== uniqueId) {
                                newMarkers.push(options.marker);
                            }
                        }

                        this._closeInfo(instanceName, { marker: options.marker });
                        options.marker.setMap(null);

                        Guyu.mapping.instance[instanceName].markers = newMarkers;
                    },

                    getMarkerLatLng: function (instanceName, marker) {

                        var position = marker.getPosition();

                        return {
                            lat: position.lat(),
                            lng: position.lng()
                        };

                    },

                    setMarkerOptions: function (instanceName, options) {
                        if (typeof options.visible === "boolean") {
                            options.marker.setVisible(options.visible);
                        }

                        if (typeof options.zIndex === "number") {
                            options.marker.setZIndex(options.zIndex);
                        }
                    },

                    getMarkerOptions: function (instanceName, options) {
                        return {
                            visible: options.marker.getVisible(),
                            zIndex: options.marker.getZIndex() || 1
                        };
                    },

                    _removeOverlay: function (instanceName, overlay) {
                        var newOverlays = [],
                            uniqueId = overlay._uniqueId;

                        for (var i = 0; i < Guyu.mapping.instance[instanceName].overlays.length; i++) {
                            if (Guyu.mapping.instance[instanceName].overlays[i]._uniqueId !== uniqueId) {
                                newOverlays.push(Guyu.mapping.instance[instanceName].overlays[i]);
                            }
                        }

                        overlay.setMap(null);
                        Guyu.mapping.instance[instanceName].overlays = newOverlays;

                    },

                    removeCircle: function (instanceName, options) {
                        this._removeOverlay(instanceName, options.circle);
                    },

                    removePolyline: function (instanceName, options) {
                        this._removeOverlay(instanceName, options.polyline);
                    },

                    _closeInfo: function (instanceName, options) {
                        if (!options || !options.marker || !options.marker.map) {
                            return;
                        }
                        var info = Guyu.mapping.instance[instanceName].infowindow,
                            infoPos = info.getPosition();

                        if (infoPos === undefined) {
                            return;
                        }

                        if (infoPos.equals(options.marker.getPosition())) {
                            info.close();
                        }
                    },

                    _showInfo: function (instanceName, options) {

                        var info = Guyu.mapping.instance[instanceName].infowindow,
                            dimensions = this._getIconDimensions(options.marker.getIcon());

                        info.close();
                        info.setOptions(
                            {
                                content: options.marker.html,
                                position: options.marker.getPosition(),
                                pixelOffset: new google.maps.Size(0, dimensions.height, 'px', 'px')
                            });
                        info.open(options.marker.map, options.marker);
                    },

                    // options {points [], color, size, opacity}
                    createPolyline: function (instanceName, options) {
                        var polylineOptions = {
                            path: options.points,
                            strokeColor: options.color,
                            strokeOpacity: options.opacity,
                            strokeWeight: options.size
                        };

                        var polyline = new google.maps.Polyline(polylineOptions);
                        polyline._uniqueId = 'polyline_' + (new Date()).toUTCString();
                        polyline.setMap(Guyu.mapping.instance[instanceName].map);

                        Guyu.mapping.instance[instanceName].overlays.push(polyline);

                        return polyline;
                    },


                    // {object, eventName, handler}
                    addEvent: function (instanceName, options) {
                        return google.maps.event.addListener(options.object || Guyu.mapping.instance[instanceName].map, options.eventName, options.handler);
                    },

                    // {handler}
                    removeEvent: function (instanceName, options) {
                        google.maps.event.removeListener(options.handler);
                    },

                    // {object, eventName, args}
                    triggerEvent: function (instanceName, options) {
                        google.maps.event.trigger(options.object || Guyu.mapping.instance[instanceName].map, options.eventName, options.args);
                    },

                    // {latLng, radius, strokeColor, strokeWeight, strokeOpacity, fillColor, fillOpacity}
                    drawCircle: function (instanceName, options) {

                        var circle = new google.maps.Circle({
                            strokeColor: options.strokeColor,
                            strokeOpacity: options.strokeOpacity,
                            strokeWeight: options.strokeWeight,
                            fillColor: options.fillColor,
                            fillOpacity: options.fillOpacity,
                            center: options.latLng,
                            radius: options.radius * 1000 // convert km to metres
                        });
                        circle.setMap(Guyu.mapping.instance[instanceName].map);
                        circle._uniqueId = 'circle_' + (new Date()).toUTCString();

                        Guyu.mapping.instance[instanceName].overlays.push(circle);

                        return circle;
                    },

                    panToMarker: function (instanceName, marker) {
                        marker.map.panTo(marker.position);
                        google.maps.event.trigger(marker, 'click');
                    },

                    getStaticMap: function (options) {
                        var markers = '',
                            mapPosition = '',
                            path = '';

                        if ($.isUndefined(options.markers) || options.markers.length === 0) {
                            markers = '&markers=size:mid|color:green|label:A|' + options.lat + ',' + options.lng;
                            mapPosition = 'center=' + options.lat + ',' + options.lng + '&zoom=' + options.zoom + '&';
                        } else {
                            $.each(options.markers, function (index, marker) {
                                markers += '&markers='
                                    + 'size:mid|color:' + ($.isUndefined(marker.colour) ? 'green' : marker.colour) + '|'
                                    + 'label:' + ($.isUndefined(marker.id) ? String.fromCharCode(97 + index) : marker.id).toUpperCase()
                                    + '|' + marker.lat + ',' + marker.lng;
                            });
                            if (!$.isUndefined(options.path) && options.path.points.length > 0) {
                                path = '&path=color:0x' + options.path.colour + 'ff,weight:' + options.path.size;
                                $.each(options.path.points, function (pointIndex, point) {
                                    path += '|' + point.lat + ',' + point.lng;
                                });
                            }
                            if (!$.isUndefined(options.zoom)) {
                                mapPosition = 'zoom=' + options.zoom + '&';
                            }
                        }

                        return 'https://maps.googleapis.com/maps/api/staticmap?key=' + options.key + '&sensor=false&' + mapPosition + 'size=' + options.width + 'x' + options.height + markers + path;
                    },

                    geocode: function (instanceName, options) {

                        var geocoderRequest = {
                            country: options.country,
                            address: options.address
                        };

                        if (options.countryName && !geocoderRequest.address.endsWith(options.countryName)) {
                            geocoderRequest.address += ', ' + options.countryName;
                        }

                        Guyu.mapping.instance[instanceName].geocoder.geocode(geocoderRequest, function (arrayOfGeocoderResponse, geocoderStatus) {
                            if (geocoderStatus !== google.maps.GeocoderStatus.OK) { // indicates that the geocode was successful.
                                options.error('Invalid status: ' + geocoderStatus);
                                return;
                            }

                            var addresses = [];
                            for (var i = 0; i < arrayOfGeocoderResponse.length; i++) {
                                addresses.push({
                                    address: arrayOfGeocoderResponse[i].formatted_address,
                                    country: '',
                                    point: arrayOfGeocoderResponse[i].geometry.location
                                });
                            }
                            options.callback(addresses, true);
                        });

                    },

                    // google Helpers
                    _getIconDimensions: function (icon) {

                        for (var n in icon) {
                            if (!icon[n].width) {
                                continue;
                            }
                            return {
                                width: icon[n].width,
                                height: icon[n].height
                            };
                        }

                        return {
                            width: 0,
                            height: 0
                        };
                    }

                }
            },

            logger: {
                create: function () {
                    return {
                        _items: [],
                        insert: function (label) {
                            this._items.push({ label: label, time: new Date() });
                            return this;
                        },
                        reset: function () {
                            this._items = [];
                            return this;
                        },
                        toString: function () {
                            var response = '';
                            $.each(this._items, function (index, item) {
                                response += (response.length === 0 ? '' : '\n') + item.time.toString('T') + ': ' + item.label;
                            });
                            return response;
                        }
                    };
                }
            },

            createUniqueUrlTimestamp: function () {
                return 'stamp=' + (+new Date);
            },

            googleTagManager: {

                /**
                 * Push an event to Google Tag Manager
                 * @param {} eventName string
                 * @param {} values object must be in the format { "Guyu.propnamea": value, "Guyu.propnameb": value }
                 */
                event: function (eventName, values) {
                    if ($.isArray(window.dataLayer)) {
                        var dataEventTag = $.extend({}, { "event": eventName }, values);
                        window.dataLayer.push(dataEventTag);
                    }
                },

                /**
                 * 
                 * @param {} variable object must be in the format { "Guyu.variablefoo": value, "Guyu.variablebar": value }  
                 */
                addVariable: function (variable) {
                    if ($.isArray(window.dataLayer)) {
                        window.dataLayer.push(variable);
                    }
                }
            }

        }

    );
})(window.jQuery);

jQuery.extend(Guyu, {

    Glossary: {
        apply: function (context) {

            $('span.glossary[data-Guyu-ui="Guyuglossary"]', context || $('html')).each(function () {

                var $this = $(this);
                if (typeof $this.data === "function") {
                    var data = $this.data();

                    if (!data.glossaryAppplied) {
                        $this.toolTip($('<div class="Guyuglossary_definition"/>').html(data.definition),
                            {
                                heading: data.term,
                                showBy: data.position,
                                left: data.offsetLeft,
                                top: data.offsetTop,
                                width: data.width
                            });
                        $this.data('glossaryAppplied', true);
                    }
                }
            });

        }
    }

});

(function ($) {
    /* light box */
    jQuery.extend(Guyu, {

        /*
        * LightBox for display modal type window or message box;
        *   LightBox.showPage(url[, options]) to load lightbox with an external page inside an iframe. 
        *       url     : is the url of the page to load
        *       options : optional options (see options below)
        *
        *   LightBox.showProcessingMessageBox(message) to show a lightbox small system processing window with bright message
        *       message : short message to show after the animated gif
        *
        *   LightBox.showMessageBox(title, message[, options]) to show a message box. Height is automatically calculated on message size
        *       title   : title of the message box
        *       message : message can be straight text or html
        *       options : optional options (see options below)
        *   
        *       options : are class of options to describe how the LightBox displays/interacts,
        *                 if anything other than the default is required then you will need to pass it through.
        *                 
        *                 defaults are;
        *
        *                   showButtons: default true,  (This will hide/show the buttons footer bar)
        *                   showClose  : false,
        *                   showPrint  : false,
        *                   showAccept : false,
        *                   showDecline: false,
        *                   showOk     : false,
        *                   showSave   : false,
        *                   showAdd    : false,
        *                   showCancel : false,
        *                   showYes    : false,
        *                   showNo     : false,
        *                   showDelete : false,
            *                   showRedIgnore : false,
            *                   showSelect : false,
        *                   showChange : false,
        *                   afterShow  : function () {} (this gets called once the lightbox is loaded and is visible
        *                   beforeHide    : function () {return true;}   (this is where you place a callback function, OR { return jQuery Promise }
        *                                                  the signature is function (buttonPressed) where buttonPress = Guyu.LightBox.buttonType (string).  Must return true or false; false meaning that it will stop processing and therefore
        *                                                   will not hide the LightBox.
        *                   afterHide    : function () {}   (this is where you place a callback function, 
        *                                                  the signature is function (buttonPressed) where buttonPress = Guyu.LightBox.buttonType (string)
        *                   customButtons : Array of { isOk : true/false/undefined (captures the enter key and assigns it to this button), src : 'source of button image', buttonType : 'the key of the button that is returned during buttonpressed', width: number of pixels wide
        *                   params     : [] (This is where you can pass in an array of parameters to append to the querystring, passin as array of objects e.g. [ { name: 'flightid', value: 'ABC123' }, { name: 'Origin', value: 'AKL' } ]
            *                   orderButtons : Array of buttons to display in order. Specifying order buttons will ignore the showX flags
        *                   context    : (place holder to store calling object if nes)
        *                   messageBoxType : string default '', css class name for message box title e.g. 'warning', 'alert' (Message Box only)
        *                   width : number in px or 'max' for full width
        *                   height: number in px or 'max' to fit full window height screen
        *                   useQueue: default false, (if set to true the lightbox show(currently only showPage function) request will be push into a queue instead of show it immediately)
        *                   
        */
        LightBox: {
            buttonType: {
                Close: 'Close',
                Print: 'Print',
                Accept: 'Accept',
                Next: 'Next',
                Decline: 'Decline',
                Ok: 'Ok',
                Edit: 'Edit',
                Save: 'Save',
                Add: 'Add',
                Search: 'Search',
                Enable: 'Enable',
                Cancel: 'Cancel',
                Discard: 'Discard',
                Yes: 'Yes',
                No: 'No',
                Change: 'Change',
                RedIgnore: 'RedIgnore',
                Select: 'Select',
                Delete: 'Delete',
                Continue: 'Continue',
                Refresh: 'Refresh'
            },
            showMode: {
                page: 'page',
                message: 'message',
                processing: 'processing'
            },
            container: null,
            container_content: null,
            loading: null,
            footer_buttons: null,
            footer_nobuttons: null,
            footer_center: null,
            overlay: null,
            currentShowMode: null,
            toString: function () { return 'Guyu.LightBox'; },
            context: undefined,
            requestQueue: [],
            queueCheckTimeOut: 500,
            currentQueueItem: null,

            initialize: function () {
                this.overlay = $(document.createElement('div')).attr({ 'id': 'lightbox_overlay' }).hide();
                this.overlay.click(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                this.overlay.dblclick(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                this.overlay.select(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                $(document.body).append(this.overlay);
                this.container = $(document.createElement('div')).attr({ 'id': 'lightbox' }).hide();
                this.container.append($(document.createElement('ul')).attr({ 'id': 'lightbox_header' }));
                this.defaultLoadingMessage = 'Connecting...';
                this.loading = $(document.createElement('div')).attr('id', 'lightbox_loading').attr('style', 'height: 20px; background-color:white;padding-left: 10px;').append(Guyu.loadingImage.clone().append('<span class=\'small label\'>' + this.defaultLoadingMessage + '</span>'));
                this.container.append(this.loading);
                this.hideLoading();

                this.container_content = $(document.createElement('div')).attr({ 'id': 'lightbox_content' });
                this.message = $(document.createElement('div')).attr({ 'id': 'lightbox_message' }).hide();
                this.container.append(this.container_content.append(this.message));

                // buttons
                this.initializeButtons();

                this.footer_center = $(document.createElement('li')).attr({ 'id': 'lightbox_footer_center', 'class': 'float_left' });
                this.footer_buttons = $(document.createElement('ul')).attr({ 'id': 'lightbox_footer' }).append(this.footer_center);
                this.footer_nobuttons = $(document.createElement('ul')).attr({ 'id': 'lightbox_footer_nobuttons' })
                    .append($(document.createElement('li')).attr({ 'id': 'lightbox_footer_nobuttons_center' }).addClass('float_left'));

                this.container.append(this.footer_buttons);
                this.container.append(this.footer_nobuttons);
                $(document.body).append(this.container);
            },

            initializeButtons: function () {
                this.buttonClose = this.createEventButton("Close", "btn-default", this.buttonType.Close);
                this.buttonPrint = this.createEventButton("Print", "btn-default", this.buttonType.Print);
                this.buttonAccept = this.createEventButton("Accept", "btn-success", this.buttonType.Accept);
                this.buttonNext = this.createEventButton("Next", "btn-success", this.buttonType.Next);
                this.buttonDecline = this.createEventButton("Decline", "btn-default", this.buttonType.Decline);
                this.buttonOk = this.createEventButton("Ok", "btn-primary", this.buttonType.Ok);
                this.buttonEdit = this.createEventButton("Edit", "btn-default", this.buttonType.Edit);
                this.buttonSave = this.createEventButton("Save", "btn-success", this.buttonType.Save);
                this.buttonAdd = this.createEventButton("Add", "btn-success", this.buttonType.Add);
                this.buttonSearch = this.createEventButton("Search", "btn-primary", this.buttonType.Search);
                this.buttonEnable = this.createEventButton("Enable", "btn-success", this.buttonType.Enable);
                this.buttonCancel = this.createEventButton("Cancel", "btn-default", this.buttonType.Cancel);
                this.buttonDiscard = this.createEventButton("Discard", "btn-primary", this.buttonType.Discard);
                this.buttonYes = this.createEventButton("Yes", "btn-primary", this.buttonType.Yes);
                this.buttonNo = this.createEventButton("No", "btn-default", this.buttonType.No);
                this.buttonChange = this.createEventButton("Change", "btn-primary", this.buttonType.Change);
                this.buttonRedIgnore = this.createEventButton("Ignore", "btn-danger", this.buttonType.RedIgnore);
                this.buttonSelect = this.createEventButton("Select", "btn-success", this.buttonType.Select);
                this.buttonDelete = this.createEventButton("Delete", "btn-warning", this.buttonType.Delete);
                this.buttonContinue = this.createEventButton("Continue", "btn-success", this.buttonType.Continue);
                this.buttonRefresh = this.createEventButton("Refresh", "btn-success", this.buttonType.Refresh);
            },

            defaultOptions: function () {
                return {
                    showButtons: true,
                    showClose: false,
                    showPrint: false,
                    showAccept: false,
                    showNext: false,
                    showDecline: false,
                    showOk: false,
                    showEdit: false,
                    showSave: false,
                    showAdd: false,
                    showSearch: false,
                    showEnable: false,
                    showCancel: false,
                    showDiscard: false,
                    showYes: false,
                    showNo: false,
                    showChange: false,
                    showRedIgnore: false,
                    showSelect: false,
                    showDelete: false,
                    showContinue: false,
                    showRefresh: false,
                    afterShow: function () { },
                    beforeHide: function () { return true; },
                    afterHide: function () { },
                    customButtons: [],
                    params: [],
                    orderButtons: [],
                    context: undefined,
                    enableAfterShow: true,
                    useQueue: false
                };
            },

            // depricated: old image buttons
            createButton: function (buttonType, src, tooltip) {
                if (buttonType === null || buttonType === undefined) return;

                var button = $(document.createElement('input')).attr({ 'type': 'image', src: '/SOLV2/Images/transparent.gif' }).addClass('link float_right').val(buttonType);
                if (tooltip) { button.prop('title', tooltip); }

                // if not a custom button then use the standard background button image from the sprites
                if (src) {
                    button.attr('src', src);
                } else {
                    button.addClass(Guyu.browser.spriteCssClass()).addClass('lightbox_button_' + buttonType.toLowerCase());
                }

                if (buttonType === this.buttonType.Print) {
                    return button.bind('click', this, function (event) {
                        event.data.print();
                    });
                }
                return button.bind('click', this, function (event) {
                    event.data.buttonClicked(buttonType);
                });
            },

            createEventButton: function (text, style, buttonType) {
                var button = this.createBaseButton(text, style);
                this.addButtonEvent(buttonType, button);
                return button;
            },

            // create a button with text and a layout style 
            // Style: btn-primary (blue), btn-default (gray), btn-success (green), btn-warning (orange), btn-danger (red)
            createBaseButton: function (text, style) {
                return $(document.createElement('button')).addClass('link float_right btn btn-lightbox').addClass(style).html(text);
            },

            // add click events to the button based on the button type
            addButtonEvent: function (buttonType, button) {
                if (buttonType === this.buttonType.Print) {
                    button.bind('click', this, function (event) {
                        event.data.print();
                    });
                    return;
                }
                button.bind('click', this, function (event) {
                    event.data.buttonClicked(buttonType);
                });
            },

            isVisible: function () {
                return this.container !== null && this.container.is(':visible');
            },

            // show message box with title, message, and checkbox with label
            showMessageBoxWithCheckbox: function (title, message, checkboxMessage) {
                this.preShow(Guyu.LightBox.showMode.message);

                this.removeFrame();

                // set message box default options
                var messageBoxDefaults = {
                    width: 300, // content message width
                    messageBoxType: ''
                };
                this.options = jQuery.extend({}, this.defaultOptions(), messageBoxDefaults, arguments[3]);

                if (!$.isUndefined(title) && title.length > 0) {
                    this.message.append($(document.createElement('div')).attr('id', 'lightbox_message_title').html(title).addClass(this.options.messageBoxType));
                }

                var messageHtml = '<div id="lightbox_message_title">' + title + '</div><span id="lightbox_message_message">' + message + '</span><br/><br/><input type="checkbox" id="apiTestMode"><label for="apiTestMode">' + checkboxMessage + '</label>';
                this.message.html(messageHtml).show();
                this.show();
            },

            sortQueue: function () {
                this.requestQueue.sort(function (a, b) { return a.time - b.time; });
            },

            // shows a message box with a loading animated gif, and no buttons
            showProcessingMessageBox: function (message, lightBoxOptions) {
                this.preShow(Guyu.LightBox.showMode.processing);

                this.removeFrame();

                // set processing box default options
                var processingDefaults = {
                    showButtons: false,
                    width: 300
                };
                this.options = jQuery.extend({}, this.defaultOptions(), processingDefaults, lightBoxOptions);

                this.processingMessage = message;

                var messageHtml = '<div id="lightbox_message_message"><img id="lightbox_processing_image" alt="" src="/SOLV2/Images/status_loading.gif" /><span id="lightbox_processing_message">' + message + '</span></div>';
                this.message.html(messageHtml).show();
                this.show();
            },

            // show message box, can pass in custom options as second parameter, automatically resizes height
            showMessageBox: function (title, message) {
                this.preShow(Guyu.LightBox.showMode.message);

                this.removeFrame();

                // set message box default options
                var messageBoxDefaults = {
                    width: 300, // content message width
                    messageBoxType: ''
                };
                this.options = jQuery.extend({}, this.defaultOptions(), messageBoxDefaults, arguments[2]);

                this.message.empty();

                if (!$.isUndefined(title) && title.length > 0) {
                    this.message.append($(document.createElement('div')).attr('id', 'lightbox_message_title').html(title).addClass(this.options.messageBoxType));
                }

                var messageDiv = $(document.createElement('div')).attr('id', 'lightbox_message_message');
                if (message !== null && !$.isUndefined(message)) {
                    if ($.isUndefined(message.each)) {
                        messageDiv.html(message);
                    } else {
                        messageDiv.append(message);
                    }
                }
                this.message.append(messageDiv).show();
                this.show();
            },

            sortQueue: function () {
                this.requestQueue.sort(function (a, b) { return a.time - b.time; });
            },

            // show lightbox with iframe link to another page, can pass in custom options as second parameter
            showPage: function (url, options) {
                if (options === null || options === undefined) {
                    options = {};
                    options.useQueue = true;
                }

                if (options.useQueue) {
                    var requestItem = { type: 'Page', time: new Date().getTime(), url: url, options: options };

                    this.requestQueue.push(requestItem);

                    if (this.currentQueueItem !== null) {
                        return;
                    }

                    this.currentQueueItem = requestItem;
                }

                this.preShow(Guyu.LightBox.showMode.page);

                this.hideButtons();
                this.message.html('').hide();

                var pageDefaults = {
                    width: 397, // _content width
                    height: 363  // _content height // set to 0 for no height
                };
                this.options = jQuery.extend({}, this.defaultOptions(), pageDefaults, options);

                if (this.options.height === 'max') {
                    this.options.height = $(window).height() - 40;
                }

                if (this.options.width === 'max') {
                    this.options.width = ($('#master > #page > #content').width() || $(window).width()) - 20;
                }

                this.removeFrame();
                for (var i = 0; i < this.options.params.length; i++) {
                    url += (url.toString().indexOf('?', 0) < 0) ? '?' : '&';
                    url += this.options.params[i].name + '=' + escape(this.options.params[i].value);
                }

                setTimeout(function () {
                    Guyu.LightBox.loadFrame(Guyu.rootUrl(url));
                }, Guyu.minimumTimeout);

                if (Guyu.browser.isMobileSafari()) {
                    this.container_content.css("cssText", "overflow:scroll !important");
                    this.container_content.css('-webkit-overflow-scrolling', 'touch');
                }
            },

            loadFrame: function (url) {

                var wcfPattern = /\.svc|\.asmx/i,
                    aspPattern = /\.asp/i,
                    mvcPattern = /\/Web\//i;

                var isMvc = mvcPattern.test((url)) && !aspPattern.test(url) && !wcfPattern.test(url);

                if (isMvc || aspPattern.test(url) || wcfPattern.test(url)) {
                    url.indexOf('?') === -1 ? url += '?' : url += '&';
                    url += 'lightbox=yes';
                }

                this.iframe = $(document.createElement('iframe'))
                    .attr({
                        id: 'lightbox_iframe',
                        name: 'lightbox_iframe',
                        frameBorder: '0',
                        src: Guyu.rootUrl(url)
                    })
                    .prependTo(this.container_content);
                this.show();

            },

            removeFrame: function () {
                if (this.iframe) {
                    this.iframe.remove();
                    this.iframe = undefined;
                }
            },

            afterShow: function () {
                this.options.afterShow.call(this);
            },

            preShow: function (showMode) {
                this.currentShowMode = showMode;
                this.loaded = false;
                this.buttonPressed = undefined;
                this.processingMessage = null;

                if (this.container === null) {
                    this.initialize();
                }
            },

            show: function () {

                if (Guyu && Guyu.autoLogout) {
                    Guyu.autoLogout.setTimer();
                }

                // set context object placeholder that launched lightbox, not always used
                this.context = this.options.context;

                // setup 
                this.container_content.attr('class', '').addClass('showmode_' + this.currentShowMode);
                var buttonPanel = this.footer_center[0];

                // check for custom order buttons
                if (this.options.orderButtons.length === 0) {
                    // hide all buttons
                    this.hideButtons();
                    this.addButtons();

                    // show required buttons
                    this.buttonClose.toggle(this.options.showClose === true);
                    this.buttonPrint.toggle(this.options.showPrint === true);
                    this.buttonAccept.toggle(this.options.showAccept === true);
                    this.buttonNext.toggle(this.options.showNext === true);
                    this.buttonDecline.toggle(this.options.showDecline === true);
                    this.buttonOk.toggle(this.options.showOk === true);
                    this.buttonEdit.toggle(this.options.showEdit === true);
                    this.buttonSave.toggle(this.options.showSave === true);
                    this.buttonAdd.toggle(this.options.showAdd === true);
                    this.buttonSearch.toggle(this.options.showSearch === true);
                    this.buttonEnable.toggle(this.options.showEnable === true);
                    this.buttonCancel.toggle(this.options.showCancel === true);
                    this.buttonDiscard.toggle(this.options.showDiscard === true);
                    this.buttonYes.toggle(this.options.showYes === true);
                    this.buttonNo.toggle(this.options.showNo === true);
                    this.buttonChange.toggle(this.options.showChange === true);
                    this.buttonRedIgnore.toggle(this.options.showRedIgnore === true);
                    this.buttonSelect.toggle(this.options.showSelect === true);
                    this.buttonDelete.toggle(this.options.showDelete === true);
                    this.buttonContinue.toggle(this.options.showContinue === true);
                    this.buttonRefresh.toggle(this.options.showRefresh === true);
                } else {
                    // remove all buttons
                    this.removeButtons();

                    // add buttons according to the order
                    for (var i = this.options.orderButtons.length - 1; i >= 0; i--) {
                        if (this.options.orderButtons[i]) {
                            this.options.orderButtons[i].appendTo(buttonPanel);
                        }
                    }
                }

                // add custom buttons
                for (var i = 0; i < this.options.customButtons.length; i++) {
                    this.addCustomButton(this.options.customButtons[i]);
                }

                // hide callbacks
                this.beforeHide = this.options.beforeHide;
                this.afterHide = this.options.afterHide;

                // show buttons footer
                if (this.options.showButtons) {
                    this.footer_buttons.show();
                    this.footer_nobuttons.hide();
                } else {
                    this.footer_buttons.hide();
                    this.footer_nobuttons.show();
                }

                this.setSizePosition();

                var self = this;

                // only call AfterShow for non iframes, the iframe AfterShow is called once the iframe has loaded
                function callAfterShow() {
                    if (self.currentShowMode === Guyu.LightBox.showMode.page) {
                        self.setHeight();
                        return;
                    }
                    Guyu.LightBox.options.afterShow.call(self);
                }

                function setLoaded() {
                    if (self.currentShowMode === Guyu.LightBox.showMode.page) {
                        return;
                    }
                    self.loaded = true;
                }

                // IE6 bug - hide selects for IE6

                if (Guyu.browser.msie6()) {
                    self.disableSelects();
                    self.overlay.show();
                    self.container.show();
                    callAfterShow();
                    if (self.options.enableAfterShow) {
                        self.enable();
                    }
                    setLoaded();
                } else {
                    this.overlay.fadeIn(Guyu.fadeDuration, function () {
                        self.container.fadeIn(Guyu.fadeDuration, function () {
                            callAfterShow();
                            if (self.options.enableAfterShow) {
                                self.enable();
                            }
                            setLoaded();
                        });
                    });
                }

                // attach events
                if (!Guyu.browser.isMobileDevice()) {
                    $(document).bind('keydown.' + this.toString(), this, this.keyDown);
                    $(window).bind('resize.' + this.toString(), this, function (event) {
                        event.data.setSizePosition();
                        event.data.setHeight();
                    });
                }

            },

            addButtons: function () {
                var buttonPanel = this.footer_center[0];
                // only add the buttons if they haven't been added yet

                this.buttonClose.appendTo(buttonPanel);
                this.buttonPrint.appendTo(buttonPanel);
                this.buttonAccept.appendTo(buttonPanel);
                this.buttonNext.appendTo(buttonPanel);
                this.buttonDecline.appendTo(buttonPanel);
                this.buttonOk.appendTo(buttonPanel);
                this.buttonEdit.appendTo(buttonPanel);
                this.buttonSearch.appendTo(buttonPanel);
                this.buttonEnable.appendTo(buttonPanel);
                this.buttonSave.appendTo(buttonPanel);
                this.buttonAdd.appendTo(buttonPanel);
                this.buttonCancel.appendTo(buttonPanel);
                this.buttonDiscard.appendTo(buttonPanel);
                this.buttonYes.appendTo(buttonPanel);
                this.buttonNo.appendTo(buttonPanel);
                this.buttonChange.appendTo(buttonPanel);
                this.buttonRedIgnore.appendTo(buttonPanel);
                this.buttonSelect.appendTo(buttonPanel);
                this.buttonDelete.appendTo(buttonPanel);
                this.buttonContinue.appendTo(buttonPanel);
                this.buttonRefresh.appendTo(buttonPanel);
            },

            removeButtons: function () {
                var buttonPanel = this.footer_center[0];
                var buttons = buttonPanel.children;
                while (buttons && buttons.length > 0) {
                    $(buttons[0]).remove();
                }
            },

            hideButtons: function () {
                this.container.find('#lightbox_footer_center input').hide().removeData('hideVisible');
                this.container.find('#lightbox_footer_center button').hide().removeData('hideVisible');
            },

            hideEnabledButtons: function () {
                this.container.find('#lightbox_footer_center input:visible').each(function () {
                    var context = $(this);
                    context.data('hideVisible', true).hide();
                });
                this.container.find('#lightbox_footer_center button:visible').each(function () {
                    var context = $(this);
                    context.data('hideVisible', true).hide();
                });
            },

            showEnabledButtons: function () {
                this.container.find('#lightbox_footer_center input').each(function () {
                    var context = $(this);
                    if (!$.isUndefined(context.data('hideVisible'))) {
                        context.show();
                    }
                });
                this.container.find('#lightbox_footer_center button').each(function () {
                    var context = $(this);
                    if (!$.isUndefined(context.data('hideVisible'))) {
                        context.show();
                    }
                });
            },

            addCustomButton: function (customButton) {
                if (customButton.buttonType === null || customButton.buttonType === undefined) return;

                if (this.footer_center.find('input[value="' + customButton.buttonType + '"]').show().length > 0) {
                    return;
                }

                var button = this.createButton(customButton.buttonType, customButton.src, customButton.tooltip).data('customButton', customButton);
                if (!$.isUndefined(customButton.width)) {
                    button.width(customButton.width);
                }
                if ($.isUndefined(customButton.isOk) || customButton.isOk === true) {
                    this.footer_center.append(button);
                } else {
                    this.footer_center.prepend(button);
                }
            },

            showCustomButton: function (customButtonType) {
                this.footer_center.find('input[value="' + customButtonType + '"]').show();
            },

            hideCustomButton: function (customButtonType) {
                this.footer_center.find('input[value="' + customButtonType + '"]').hide();
            },

            enableButton: function (buttonType) {
                this.footer_center.find('input[value="' + buttonType + '"]').removeAttr('disabled').removeClass('lightbox_disabled').show();
            },

            disableSelects: function () {
                var container = this.message.get(0);

                $('select').each(function () {
                    if (!jQuery.contains(container, this)) {
                        $(this).addClass('lightbox_disabled');
                    }
                });

            },

            enableSelects: function () {
                $('select.lightbox_disabled').removeClass('lightbox_disabled');
            },

            setProcessingMessage: function (message) {
                this.message.find('#lightbox_processing_message').html(message);
            },

            setSizePosition: function () {
                var doc = $(document),
                    dimensions = {
                        width: doc.width(),
                        height: doc.height()
                    },
                    layout = this.container_content.layout(),
                    maxWidth = this.options.width + layout.border.left + layout.padding.left + layout.border.right + layout.padding.right;

                this.overlay.css({ width: dimensions.width + 'px', height: dimensions.height + 'px', opacity: 0.5 });
                this.container.width(maxWidth).find('#lightbox_header, #lightbox_footer, #lightbox_footer_nobuttons').width(maxWidth);
                this.container_content.width(this.options.width);
                if (this.currentShowMode === Guyu.LightBox.showMode.page && this.options.height > 0) {
                    this.container_content.height(this.options.height);
                } else {
                    this.container_content.height('auto');
                }

                this.container.find('#lightbox_header_center, #lightbox_footer_center, #lightbox_footer_nobuttons_center').width(maxWidth - 16);
                this.setPosition();
            },

            setPosition: function () {
                // mobile devices will always show popups at top of screen, so position screen there after show
                var wnd = $(window),
                    doc = $(document),
                    top = Guyu.browser.isMobileDevice() ? 20 : (doc.scrollTop() + (wnd.height() - this.container.height()) / 2);

                this.container.css({
                    'left': (doc.scrollLeft() + (wnd.width() - this.container.width()) / 2) + 'px',
                    'top': top + 'px'
                });

                if (Guyu.browser.isMobileDevice()) {
                    window.scrollTo(0, 0);
                }

            },

            setMobileHeight: function () {
                if (!Guyu.browser.isMobileDevice()) {
                    return;
                }
                if (this.iframe) {
                    try { // this captures permission denied errors accessing iframes from another domain
                        this.iframe.css('height', $(this.currentFrame().document.body).height() + 'px');
                    } catch (e) { }
                }
            },

            setMobileSafariHeight: function (height) {
                if (!Guyu.browser.isMobileSafari()) {
                    return;
                }
                if (this.iframe) {
                    this.iframe.height(height);
                    this.container_content.height(height);
                }
            },

            setHeight: function () {
                if (Guyu.browser.isMobileDevice()) {
                    this.container.css('height', 'auto');
                    this.container_content.css('height', 'auto');
                    if (this.iframe) {
                        this.iframe.css('height', 'auto');
                    }
                    return;
                }

                var wnd = $(window);
                var wndHeight = wnd.height();
                var containerHeight = this.container.height();
                var contentHeight = this.container_content.height();

                if (wndHeight <= containerHeight) {
                    var diff = (containerHeight - wndHeight) + 10; // add 10px margin to allow window sit inside browser window
                    containerHeight = containerHeight - diff;
                    contentHeight = contentHeight - diff;
                    this.container_content.css('height', contentHeight + 'px');
                    this.container.css({
                        top: ($(document).scrollTop() + (wndHeight - containerHeight) / 2) + 'px',
                        height: containerHeight + 'px'
                    });
                }

                if (this.iframe) {
                    this.iframe.css('height', contentHeight + 'px');
                }
            },

            hide: function (callBack) {
                var self = this;

                return new Guyu.Promise(function (resolve, reject) {
                    if (self.container !== null) {
                        if (Guyu.browser.msie6()) {
                            self.container.hide();
                        } else {
                            self.container.fadeOut(Guyu.fadeDuration);
                        }
                    }

                    var signalComplete = function () {
                        if ($.isFunction(callBack)) {
                            callBack.call(self);
                        }
                        resolve();
                    };
                    if (self.overlay !== null) {
                        if (Guyu.browser.msie6()) {
                            self.overlay.hide();
                            signalComplete();
                        } else {
                            self.overlay.fadeOut(Guyu.fadeDuration, signalComplete);
                        }
                    } else {
                        signalComplete();
                    }

                    $(document).unbind('keydown.' + self.toString());
                    $(window).unbind('resize.' + self.toString());

                    // IE6 bug - hide selects for IE6
                    if (Guyu.browser.msie6()) {
                        self.enableSelects();
                    }

                    if (self.options && self.options.useQueue) {

                        var index = self.requestQueue.indexOf(self.currentQueueItem);
                        if (index > -1) {
                            self.requestQueue.splice(index, 1);
                        }
                        self.currentQueueItem = null;

                        if (self.requestQueue.length > 0) {
                            self.sortQueue();
                            var param = self.requestQueue[0];
                            self.requestQueue.shift();
                            switch (param.type) {
                                case 'Page':
                                    setTimeout(function () {
                                        Guyu.LightBox.showPage(param.url, param.options);
                                    }, Guyu.LightBox.queueCheckTimeOut);
                                default:
                            }
                        }
                    }

                    // Reset all buttons and events
                    self.initializeButtons();
                });
            },

            disable: function (opts) {
                var options = $.extend({ message: this.defaultLoadingMessage }, opts);

                this.updateLoading(options.message);
                this.showLoading();
                this.footer_center.find('input:visible,button:visible').attr('disabled', 'disabled');
                if (this.iframe && this.currentFrame()) {
                    try { // this captures permission denied errors accessing iframes from another domain
                        $(this.currentFrame().document.body).find('input:image:visible:enabled, input:button:visible:enabled, input:file:visible:enabled, input:submit:visible:enabled, input:reset:visible:enabled').addClass('lightbox_temp_disabled').attr({ 'disabled': 'disabled' });
                    } catch (e) { }

                }
            },

            enable: function () {
                if (this.footer_center === null) {
                    return;
                }
                this.footer_center.find('input:visible,button:visible').removeAttr('disabled');
                if (this.iframe && this.currentFrame()) {
                    try { // this captures permission denied errors accessing iframes from another domain
                        $(this.currentFrame().document.body).find('.lightbox_temp_disabled').each(function () {
                            var context = $(this);
                            context.removeClass('lightbox_temp_disabled').removeAttr('disabled');
                        });
                    } catch (e) { }
                }
                this.hideLoading();
            },

            hideLoading: function () {
                this.loading.find('div').hide();
            },

            showLoading: function () {
                this.loading.find('div').show();
            },

            updateLoading: function (message) {
                this.loading.find('span.label').html(message);
            },

            print: function (event) {
                if (!this.iframe || !this.iframe.is(":visible") || typeof this.currentFrame() === "undefined") {
                    return;
                }

                this.currentFrame().focus();
                this.currentFrame().printPage();
            },

            currentFrame: function () {
                return this.iframe ? this.iframe.get(0).contentWindow : undefined;
            },

            increasePaddingBottom: function (paddingBottomToIncrease) {
                var currentPaddingBottom = parseInt(this.container_content.css('padding-bottom').replace('px', ''));
                this.container_content.css('padding-bottom', (currentPaddingBottom + paddingBottomToIncrease) + 'px');
            },

            /* events */
            _beforeHideResult: function (buttonPressed) {
                var self = this;
                var deferred = $.Deferred();

                if ($.isFunction(self.beforeHide)) {
                    var result = self.beforeHide.call(self, buttonPressed);
                    if (typeof result === 'object' && 'then' in result) {
                        result.then(function (data) {
                            deferred.resolve(data);
                        }).fail(function () {
                            deferred.reject();
                        });
                    } else {
                        deferred.resolve(result);
                    }
                } else {
                    deferred.resolve(true);
                }

                return deferred.promise();
            },

            buttonClicked: function (buttonPressed) {
                this.buttonPressed = buttonPressed;

                // beforeHide callback
                var self = this;
                self._beforeHideResult(buttonPressed).then(function (okToClose) {
                    if (okToClose) {
                        self.hide(function () {
                            if ($.isFunction(Guyu.LightBox.afterHide)) {
                                Guyu.LightBox.afterHide.call(Guyu.LightBox, buttonPressed);
                            }
                        });
                    }
                });

            },

            keyDown: function (event) {
                if (event.data.toString() !== Guyu.LightBox.toString()) {
                    return;
                }

                if (event.keyCode !== Guyu.key.ENTER && event.keyCode !== Guyu.key.ESCAPE) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();

                var context = event.data;

                // enter, check for default Ok, Close, Print, Yes,
                if (event.keyCode === Guyu.key.ENTER) {
                    if (context.buttonPrint.is(":visible")) {
                        context.print();
                        return;
                    }

                    if (context.buttonOk.is(":visible")) {
                        context.buttonOk.click();
                        return;
                    }
                    if (context.buttonSave.is(":visible")) {
                        context.buttonSave.click();
                        return;
                    }
                    if (context.buttonAdd.is(":visible")) {
                        context.buttonAdd.click();
                        return;
                    }
                    if (context.buttonYes.is(":visible")) {
                        context.buttonYes.click();
                        return;
                    }
                    if (context.buttonAccept.is(":visible")) {
                        context.buttonAccept.click();
                        return;
                    }
                    if (context.buttonNext.is(":visible")) {
                        context.buttonNext.click();
                        return;
                    }
                    if (context.buttonChange.is(":visible")) {
                        context.buttonChange.click();
                        return;
                    }
                    if (context.buttonRedIgnore.is(":visible")) {
                        context.buttonRedIgnore.click();
                        return;
                    }
                    if (context.buttonSelect.is(":visible")) {
                        context.buttonSelect.click();
                        return;
                    }
                    if (context.buttonContinue.is(":visible")) {
                        context.buttonContinue.click();
                        return;
                    }

                    /* check custom buttons */
                    context.footer_center.find('input:visible').each(function (index, input) {
                        var context = $(input);
                        if ($.isUndefined(context.data('customButton')) || context.data('customButton').isOk === false) return true; // continue the .each loop
                        context.click();
                        return false; //  break out of the .each loop
                    });

                    return;
                }

                // esc, then close lightbox
                if (context.buttonClose.is(":visible")) {
                    context.buttonClose.click();
                    return;
                }
                if (context.buttonCancel.is(":visible")) {
                    context.buttonCancel.click();
                    return;
                }
                if (context.buttonNo.is(":visible")) {
                    context.buttonNo.click();
                    return;
                }
                if (context.buttonDecline.is(":visible")) {
                    context.buttonDecline.click();
                    return;
                }
                if (context.buttonEdit.is(":visible")) {
                    context.buttonEdit.click();
                    return;
                }

                /* check custom buttons */
                context.footer_center.find('input:visible').each(function (index, input) {
                    var context = $(input);
                    if ($.isUndefined(context.data('customButton')) || context.data('customButton').isOk === true) return true; // continue the .each loop
                    context.click();
                    return false; //  break out of the .each loop
                });

            }
            /* end of events */

        }
    }
    );
})(jQuery);

jQuery.extend(Guyu,
    {
        DropDowns: {
            setWaiting: function (dropDown, waitingValue) {
                var combo = $(dropDown).get(0);
                combo.options.length = 0;
                combo.options[combo.options.length] = new Option(waitingValue, '');
            },

            setOptions: function (dropDown, valueField, displayField, ajaxUrl, ajaxParameters, callBack, options) {
                Guyu.DropDowns.setWaiting(dropDown, 'Loading...');

                return Guyu.fetch(ajaxUrl, {
                    body: ajaxParameters
                }).then(function (json) {
                    return Guyu.DropDowns.setAjaxRsOptions(dropDown, valueField, displayField, json.Items, callBack, options);
                });
            },

            setAjaxRsOptions: function (dropDown, valueField, displayField, ajaxRs, callBack, options) {
                return new Guyu.Promise(function (resolve, reject) {
                    Guyu.DropDowns.setWaiting(dropDown, 'Loading...');
                    var opts = $.extend({}, Guyu.DropDowns.setOptions.defaults, options);

                    dropDown.options.length = 0;

                    if (opts.selectOptionRequired && (ajaxRs.length > 1 || opts.forceRequired)) {
                        var optionRequired = new Option(opts.selectText, opts.selectValue);
                        $(optionRequired).data('optionData', {});
                        dropDown.options[dropDown.options.length] = optionRequired;
                    }

                    for (var i = 0; i < ajaxRs.length; i++) {
                        var item = ajaxRs[i],
                            value = typeof item === "string" ? item : Guyu.DropDowns.getDisplayFieldValue(item, displayField) || '',
                            text = typeof item === "string" ? item : item[valueField],
                            option = new Option(value, text);

                        $(option)
                            .data('optionData', item)
                            .attr({ title: option.text })
                            .prop('selected', function () {
                                return ajaxRs.length === 1 && i === 0 && opts.selectSingleItem;
                            });

                        dropDown.options[dropDown.options.length] = option;
                    }

                    $.isFunction(callBack) ? callBack(dropDown) : function () { };
                    resolve(dropDown);
                });
            },

            /*Used to get the Display value from either the string passed in or the DisplayOption class*/
            getDisplayFieldValue: function (item, displayField) {
                switch (typeof displayField) {
                    case 'string':
                        return item[displayField];
                    case 'object':
                        var displayValue = '';

                        $.each(displayField, function (arrayCounter, arrayItem) {
                            if (item[arrayItem.fieldName].length != 0) {
                                displayValue += arrayItem.startDelimiter + item[arrayItem.fieldName] + arrayItem.endDelimiter;
                            }
                        });

                        return displayValue;
                    default:
                        return '';
                }
            },

            Title: {
                getId: function (comboId) {
                    var selectedValue = $('#' + comboId).val();

                    if (selectedValue.length === 0) return -1;

                    return parseInt(selectedValue.split('||')[0]);
                },

                getDescription: function (comboId) {
                    var selectedValue = $('#' + comboId).val();

                    if (selectedValue.length === 0) return '';

                    return selectedValue.split('||')[1];
                },

                getSex: function (comboId) {
                    var selectedValue = $('#' + comboId).val();

                    if (selectedValue.length === 0) return 0;

                    return selectedValue.split('||')[2];
                }
            }
        }
    });

jQuery.extend(Guyu.DropDowns, {
    DisplayOption: function () {
        var setOptions = function (args) {
            return {
                fieldName: args[0],
                startDelimiter: args[1] === null ? '' : args[1],
                endDelimiter: args[2] === null ? '' : args[2]
            };
        };

        var options = setOptions(arguments);

        return {
            fieldName: options.fieldName,
            startDelimiter: options.startDelimiter,
            endDelimiter: options.endDelimiter,
            selectSingleItem: false // when only 1 item, select by default
        };
    }
});

jQuery.extend(Guyu.DropDowns.setOptions, {
    defaults: { selectOptionRequired: false, selectValue: '', selectText: '< Please Select >', forceRequired: false }
});

jQuery.extend(Guyu,
    {
        /* static helper methods for accessing cookies */
        Cookies: {
            /* get all cookies in the current document
             * returns an Array of Guyu.Cookie objects
            */
            get: function () {
                var result = [];
                if (document.cookie.length === 0) {
                    return result;
                }

                var cookies = document.cookie.split("; ");
                for (var i = 0; i < cookies.length; i++) {
                    result.push(new Guyu.Cookie(cookies[i]));
                }
                return result;
            },

            /* get cookie by name
             *  returns:
             *    undefined - equals not found
             *    Guyu.Cookie - if found
             */
            getItem: function (cookieName) {
                var cookies = Guyu.Cookies.get();
                for (var i = 0; i < cookies.length; i++) {
                    if (cookies[i].name === cookieName) {
                        return cookies[i];
                    }
                }
                return undefined;
            },

            /* set/add cookie to the current document */
            set: function (cookie) {
                document.cookie = cookie.toString();
            },

            /* reset/expire cookies - no args will reset all cookies, single string will reset a single cookie, an array of cookie names string will reset multiple*/
            reset: function (cookieName) {
                if ($.isUndefined(cookieName)) {
                    var tracingEnabled = Guyu.tracingEnabled(),
                        cookies = this.get();

                    for (var i = 0; i < cookies.length; i++) {
                        cookies[i].reset();
                    }

                    Guyu.enableTracing(tracingEnabled);

                } else if (typeof cookieName === "string") {
                    var cookie = new Guyu.Cookie(cookieName);
                    cookie.reset();
                } else {
                    $(cookieName).each(function (i) {
                        var cookie = new Guyu.Cookie(this.toString());
                        cookie.reset();
                    });
                }
            },

            toString: function () {
                return "Guyu.Cookies";
            }
        },


        /* instance class for working with a cookie
        * constructor can be called via 2 ways
        *       1: with the raw cookie eg new Cookie("cookieName=cookieValue")
        *       2: with the actual values, new Cookie(cookieName, cookieValue, [optional expiryDate])
        */

        Cookie: function () {

            // helper function to get options based on the new instance contructor parameters passed in. see help for the class
            var getOptions = function (args) {
                if (args.length === 1) {
                    var cookieParts = args[0].split("=");
                    return {
                        name: cookieParts[0],
                        value: (cookieParts.length < 2 ? "" : cookieParts[1])
                    };
                } else {
                    return {
                        name: args[0],
                        value: args[1],
                        expiryDate: args[2]
                    };
                }
            };

            var options = getOptions(arguments);

            /* actual code that creates the Cookie instance */
            return {
                name: options.name,
                value: options.value,
                expiryDate: options.expiryDate,

                reset: function () {
                    // if cookie name ends in 'DoNotExpire' then allow it to persist across sessions
                    // such cookies used by Guyu.Lightbox for "do not show again" checkbox
                    if (this.name.indexOf('DoNotExpire') == -1) {
                        this.value = "";
                        this.expiryDate = new Date();
                        this.expiryDate.setDate(this.expiryDate.getDate() - 1);
                        Guyu.Cookies.set(this);
                    }
                },

                set: function (value) {
                    this.value = value;
                    Guyu.Cookies.set(this);
                },

                toString: function () {
                    return this.name + "=" + this.value + (typeof this.expiryDate === "undefined" ? "" : ";expires=" + this.expiryDate.toUTCString()) + ";path=/";
                }
            };
        },

        RichTextEditor: {

            /*
                Creates a Rich Text Editor (yuiEditor) for a TextArea
                Triggers event 'Guyurichtexteditor.loaded' on the TextArea when loaded
                
                id: The id of the TextArea (excluding the #)
                options: (override/extend the default options)
            */
            create: function (id, options) {

                $('body').addClass('yui-skin-sam');

                var $element = $('#' + id),
                    yuiEditor,
                    isLoading = true,
                    loadingId = undefined,
                    loading = function () {

                        if (loadingId) {
                            loadingId = clearTimeout(loadingId);
                        } else {
                            $element.trigger('Guyurichtexteditor.beforeloaded', [yuiEditor]);
                        }

                        loadingId = setTimeout(function () {
                            isLoading = false;
                            yuiEditor.solIsLoaded = true;
                            $element.trigger('Guyurichtexteditor.afterloaded', [yuiEditor]);
                        }, 1000);

                    };

                loading();

                yuiEditor = new YAHOO.widget.Editor(id, Guyu.RichTextEditor.getDefaults(options));
                yuiEditor.solIsLoaded = false;  // SOL custom override

                yuiEditor.on('editorContentLoaded', function () {
                    $element.trigger('Guyurichtexteditor.loaded', [yuiEditor]);

                    this.on('afterNodeChange', function () {

                        if (yuiEditor.solIsLoaded === false) {
                            loading();
                        } else if (yuiEditor.solIsLoaded === true && yuiEditor.getEditorHTML() !== $element.text()) {
                            $element.change();
                        }

                    }, this, true);

                }, yuiEditor, true);


                // When user adds/edits a hyperlink, there is a checkbox that allows them to choose "open in new window" or not
                // Force this to be checked and hide it  
                yuiEditor.on('afterOpenWindow', function (args) {
                    if (args.win.name === 'createlink') {
                        var checkboxid = this.get('id') + '_createlink_target',
                            labelid = "label[for='" + checkboxid + "']",
                            checkbox = $('#' + checkboxid);

                        checkbox.prop('checked', true);
                        $(labelid).hide();   // label is the parent of the checkbox so this hides the checkbox + label
                        checkbox.click(function (event) {
                            event.preventDefault();
                            return false;
                        });  // if user clicks, do not allow to be unticked (probably not needed since it's hidden lol)
                    }
                });

                $element.data('richTextMode', true);

                return yuiEditor;

            },

            options: {
                links: true,  // allow html links to be inserted
                height: '200px',
                width: '800px'
            },

            getDefaults: function (options) {

                var opts = $.extend(true, this.options, options),
                    defaults = {
                        height: opts.height,
                        width: opts.width,
                        dompath: false,
                        focusAtStart: false,
                        toolbar: {
                            collapse: true,
                            titlebar: '',
                            draggable: false,
                            buttonType: 'advanced',
                            buttons: [
                                {
                                    group: 'fontstyle', label: 'Font Name and Size',
                                    buttons: [
                                        {
                                            type: 'select', label: 'Arial', value: 'fontname', disabled: true,
                                            menu: [
                                                { text: 'Arial' },
                                                { text: 'Arial Black' },
                                                { text: 'Comic Sans MS' },
                                                { text: 'Courier New' },
                                                { text: 'Lucida Console' },
                                                { text: 'Tahoma' },
                                                { text: 'Times New Roman' },
                                                { text: 'Trebuchet MS', checked: true },
                                                { text: 'Verdana' }
                                            ]
                                        },
                                        { type: 'spin', label: '13', value: 'fontsize', range: [9, 75], disabled: true }
                                    ]
                                },
                                { type: 'separator' },
                                {
                                    group: 'textstyle', label: 'Font Style',
                                    buttons: [
                                        { type: 'push', label: 'Bold CTRL + SHIFT + B', value: 'bold' },
                                        { type: 'push', label: 'Italic CTRL + SHIFT + I', value: 'italic' },
                                        { type: 'push', label: 'Underline CTRL + SHIFT + U', value: 'underline' },
                                        { type: 'color', label: 'Font Color', value: 'forecolor', disabled: true }
                                        // { type: 'separator' },
                                        // { type: 'push', label: 'Remove Formatting', value: 'removeformat', disabled: true },
                                        //  { type: 'push', label: 'Show/Hide Hidden Elements', value: 'hiddenelements' }
                                    ]
                                },
                                { type: 'separator' },
                                {
                                    group: 'alignment', label: 'Alignment',
                                    buttons: [
                                        { type: 'push', label: 'Align Left CTRL + SHIFT + [', value: 'justifyleft' },
                                        { type: 'push', label: 'Align Center CTRL + SHIFT + |', value: 'justifycenter' },
                                        { type: 'push', label: 'Align Right CTRL + SHIFT + ]', value: 'justifyright' },
                                        { type: 'push', label: 'Justify', value: 'justifyfull' }
                                    ]
                                },
                                { type: 'separator' },
                                {
                                    group: 'parastyle', label: 'Paragraph Style',
                                    buttons: [
                                        {
                                            type: 'select', label: 'Normal', value: 'heading', disabled: false,
                                            menu: [
                                                { text: 'Normal', value: 'none', checked: true },
                                                { text: 'Header 1', value: 'h1' },
                                                { text: 'Header 2', value: 'h2' },
                                                { text: 'Header 3', value: 'h3' },
                                                { text: 'Header 4', value: 'h4' },
                                                { text: 'Header 5', value: 'h5' },
                                                { text: 'Header 6', value: 'h6' }]
                                        },
                                        // { type: 'separator' },
                                        { type: 'push', label: 'Indent', value: 'indent', disabled: false },
                                        { type: 'push', label: 'Outdent', value: 'outdent', disabled: false },
                                        { type: 'push', label: 'Create an Unordered List', value: 'insertunorderedlist' },
                                        { type: 'push', label: 'Create an Ordered List', value: 'insertorderedlist' }
                                    ]
                                }
                            ]

                        }
                    };

                if (opts.links) {
                    defaults.toolbar.buttons.push({ type: 'separator' });
                    defaults.toolbar.buttons.push({
                        group: 'insertitem', label: 'Insert Link',
                        buttons: [
                            { type: 'push', label: 'HTML Link CTRL + SHIFT + L', value: 'createlink', disabled: true }
                        ]
                    });
                }

                return defaults;


            },

            /* Toggle between RichTextMode or PlainText mode
                richTextMode: boolean 
            */
            toggle: function (yuiEditor, richTextMode) {

                var $textarea = $(yuiEditor.get('textarea')),
                    $fc = $textarea.prev();

                if (richTextMode) {

                    $fc.css('position', 'static')
                        .css('top', '0')
                        .css('left', '0');
                    $textarea.css('visibility', 'hidden')
                        .css('top', '-9999px')
                        .css('left', '  -9999px')
                        .css('position', 'absolute')
                        .data('richTextMode', true);

                    yuiEditor.get('element_cont').addClass('yui-editor-container');
                    yuiEditor._setDesignMode('on');
                    yuiEditor.setEditorHTML($textarea.val().replace(/\n/g, '<br>'));

                } else {

                    yuiEditor.saveHTML();

                    var stripHtml = /<\S[^><]*>/g,
                        stripped = $textarea.get(0).value.replace(/<br>/gi, '\n').replace(stripHtml, '');

                    $textarea.val(stripped);

                    $fc.css('position', 'absolute')
                        .css('top', '-9999px')
                        .css('left', '-9999px');

                    yuiEditor.get('element_cont').removeClass('yui-editor-container');

                    $textarea.css('visibility', 'visible')
                        .css('top', '')
                        .css('left', '')
                        .css('position', 'static')
                        .data('richTextMode', false);
                }

            }

        }

    }
);

/* create jQuery plugin for display grids as paging */
(function ($) {

    $.extend($.expr[':'], {
        // check for text within text and ignore case
        containsIgnoreCase: "(a.textContent||a.innerText||jQuery(a).text()||'').toLowerCase().indexOf((m[3]||'').toLowerCase())>=0",

        // check if element has value, trims of left/right spaces before testing
        blank: function (a) {
            return $.trim($(a).val()) === '';
        },

        // check if element is displayed (This returns true if element is visible in a hidden tab)
        displayed: function (a) {
            return $(a).css('display').toLowerCase() !== 'none';
        },

        numeric: function (a) {
            return $(a).val().isNumeric();
        }
    });

    $.fn.fitToParent = function () {

        return this.each(function (i) {
            // remove width/height attributes that browser puts on it after it tries to resize
            var context = $(this).removeAttr('width').removeAttr('height'),
                layout = context.layout();

            var parent = context.parent();

            var parentWidth = parent.width();
            var parentHeight = parent.height();

            function scaleDownWidth(newWidth, origWidth, origHeight) {
                context.width(newWidth);

                // get percentage reduction
                var percentage = (newWidth / origWidth);
                context.height(Math.floor(origHeight * percentage));
            }

            function scaleDownHeight(newHeight, origHeight, origWidth) {
                context.height(newHeight);

                // get percentage reduction
                var percentage = (newHeight / origHeight);
                context.width(Math.floor(origWidth * percentage));
            }

            function resize() {

                var contextLayout = context.layout(),
                    contextWidth = contextLayout.totalWidth(false),
                    nonimageWidth = contextWidth - contextLayout.width,
                    contextHeight = contextLayout.totalHeight(false),
                    nonimageHeight = contextHeight - contextLayout.height;

                // get scaling working correct way                
                if (contextWidth >= contextHeight) {
                    if (contextWidth > parentWidth) {
                        scaleDownWidth(parentWidth - nonimageWidth, contextLayout.width, contextLayout.height);
                    } else if (contextHeight > parentHeight) {
                        scaleDownHeight(parentHeight - nonimageHeight, contextLayout.height, contextLayout.width);
                    }
                } else {
                    if (contextHeight > parentHeight) {
                        scaleDownHeight(parentHeight - nonimageHeight, contextLayout.height, contextLayout.width);
                    } else if (contextWidth > parentWidth) {
                        scaleDownWidth(parentWidth - nonimageWidth, contextLayout.width, contextLayout.height);
                    }
                }

                // recheck new dimensions, it still not fit call ones self (recursion)
                contextLayout = context.layout();
                contextWidth = contextLayout.totalWidth(false);
                contextHeight = contextLayout.totalHeight(false);

                if (contextHeight > parentHeight || contextWidth > parentWidth) {
                    resize();
                }
            }

            if (layout.totalWidth(false) > parentWidth || layout.totalHeight(false) > parentHeight) {
                resize();
            }

        });
    };

    $.fn.increaseHeightToParent = function (paddingToRemove) {

        return this.each(function (i) {
            // remove width/height attributes that browser puts on it after it tries to resize
            var context = $(this).removeAttr('height'),
                layout = context.layout();

            var parent = context.parent();

            var parentHeight = parent.height() - paddingToRemove;

            function resize() {

                var contextLayout = context.layout(),
                    contextHeight = contextLayout.totalHeight(false),
                    nonimageHeight = contextHeight - contextLayout.height;

                // get scaling working correct way                
                if (contextHeight < parentHeight) {
                    context.height(parentHeight - nonimageHeight);
                }

                // recheck new dimensions, it still not fit call ones self (recursion)
                contextLayout = context.layout();
                contextHeight = contextLayout.totalHeight(false);

                if (contextHeight < parentHeight) {
                    resize();
                }
            }

            if (layout.totalHeight(false) < parentHeight) {
                resize();
            }

        });
    };

    // vertically align an item inside its parent
    $.fn.verticallyAlign = function () {
        return this.each(function (i) {
            var context = $(this);
            var center = parseInt(context.parent().height() / 2);
            var contextHeight = context.height();
            context.css({ 'margin-top': (center - parseInt(contextHeight / 2)) + 'px' });
        });
    };

    $.fn.removeInvalidAlphaCharacters = function () {
        return this.each(function (i) {
            $(this).val(jQuery.trim($(this).val().replace(/[^A-Za-z\s]+/g, "")));
        });
    };

    $.fn.removeInvalidGDSCharacters = function () {
        return this.each(function (i) {
            $(this).val(jQuery.trim($(this).val().replace(/[\[\]\/\\~/@+;]/, "")));
        });
    };

    $.fn.removeInvalidGDSCharactersForOrderNumber = function () {
        return this.each(function (i) {
            $(this).val(jQuery.trim($(this).val().replace(/[\[\]\\~@+;]/, "")));
        });
    };

    $.fn.removeInvalidNumericCharacters = function () {
        return this.each(function (i) {
            $(this).val(jQuery.trim($(this).val().replace(/[^0-9]+/g, "")));
        });
    };

    $.extend($,
        {
            isUndefined: function (object) {
                return typeof object === "undefined";
            },
            isUndefinedOrNull: function (object) {
                return typeof object === "undefined" || object === null;
            },
            emptyFunction: function () { }
        });

    /* jQuery plugin for showing tooltips
     * this can be called in various ways
     *
     *  $.toolTip(message, options)
     *      message (optional): optional html string to show
     *      options (optional): { 
     *                              showBy : 'element' or   - show by the element
     *                                       'mouse'        - show by the mouse pointer,
     *                                       'elementLeft'         
     *                                       'elementRight'
     *                                       'elementBottomLeft'
     *                              width  : 200 (default)  - set width of tool tip
     *                              heading: null (default) - set to a string value to display a heading, null will hide the heading 
     *                              left   : 2 (number default 2, offset from position)
     *                              top    : 2 (number default 2  , offset from position)
     *
     *  CSS styles : create a style for #tip{} (Div)
     *
     * simple  - find all elements that have a 'title' attribute and attach a tooltip with the 'title' as the tooltip
     *      html      : <div title="tool tip messge"></div>
     *                  <p title="tool tip messge 2"></p>
     *      javascript: $('*', $(document.body)).toolTip();
     *
     * advanced - show html content as the tooltip
     *      html      : <div id="abc">On mouse over the tooltip will show</div>
     *      javascript: $('#abc').toolTip('<b>Tooltip</b><br/>Sample Tooltip');     
    */
    $.fn.toolTip = function (message, options) {

        var borderBox = $('html').hasClass('sol-vnext') && $('html').css('box-sizing') === 'border-box';

        return this.each(function (i) {
            var context = $(this),
                opts = $.extend({}, $.fn.toolTip.defaults, options);

            if (message !== '') {

                context.data('tooltip_message', message).tooltip({
                    showURL: false,
                    left: opts.left,
                    top: opts.top,
                    track: opts.showBy === 'mouse',
                    showBy: opts.showBy,
                    bodyHandler: function () {
                        var tip = $('#tip');
                        if (tip.length === 0 || (tip.html() === '' && message.length > 0)) {
                            tip = $.fn.toolTip.createContainer().appendTo($(document.body));
                            tip.data('width-offset', borderBox ? parseInt(tip.css('border-left-width'), 10) * 2 : 0);
                        }
                        if (message.length > 0) {
                            if (opts.heading.length === 0) {
                                tip.find('#tip_content_heading').hide();
                            } else {
                                tip.find('#tip_content_heading').html(opts.heading).show();
                            }
                            tip.find('#tip_content_blurb').html(message);
                            tip.css('width', (opts.width + tip.data('width-offset')) + 'px');
                        }
                        return tip;
                    }
                });
            } else {
                context.data('tooltip_message', message).tooltip();
            }
        });

    };
    $.fn.toolTip.hide = function (context) {
        // TODO remove this function, left for backwards compatibility before moving to jquery.tooltip
        //$('#tip').hide();
    };

    $.fn.toolTip.remove = function () {
        $('#tip').html('');
    };

    $.fn.toolTip.createContainer = function () {
        return $(document.createElement('div'))
            .attr('id', 'tip')
            .append('<div id="tip_content"><h2 id="tip_content_heading"></h2><p id="tip_content_blurb"></p></div>');
    };

    $.fn.toolTip.defaults = { showBy: 'element', timeout: 2000, width: 200, heading: '', left: 2, top: 2 };

    /* end of toolTip() */

    $.fn.pageGrid = function (options) {

        return this.each(function (i) {
            var context = $(this);

            var opts = typeof context.data("savedOptions") === "undefined"
                ? $.extend({}, $.fn.pageGrid.defaults, options)
                : $.extend({}, context.data("savedOptions"), options);

            // initialize firsttime through
            if (typeof opts.initialized === "undefined") {
                if (typeof opts.filterElement !== "undefined") opts.filterElement.keyup(function () { context.pageGrid({ filterValue: $(this).val() }); });
                opts.initialized = true;
            }

            var total = context.find('div.total');
            if (total.length === 0) {
                total = $(document.createElement('div')).addClass('total');
                context.append(total);
            }

            /* create nav links */
            var navId = context.attr('id') + '_navigation';
            var navigation = context.find('#' + navId);
            if (navigation.length === 0) {
                navigation = $(document.createElement('div')).attr({ 'id': navId }).addClass('navigation');
                navigation.append($(document.createElement('span')).text(opts.first).addClass('link').click(function (event) {
                    context.pageGrid({ navigate: 'first' });
                })).append($(document.createElement('span')).text(opts.prev).addClass('link').click(function (event) {
                    context.pageGrid({ navigate: 'prev' });
                })).append($(document.createElement('span')).text(opts.next).addClass('link').click(function (event) {
                    context.pageGrid({ navigate: 'next' });
                })).append($(document.createElement('span')).text(opts.last).addClass('link').click(function (event) {
                    context.pageGrid({ navigate: 'last' });
                })).append($(document.createElement('span')).attr({ 'id': navId + '_paging' }));
                context.append(navigation);
            }

            var rows = context.find('.row');
            rows.removeClass('rowalternate');

            // filter rows if filter applied
            if (opts.filterCell.length > 0) {
                // reset to first page if filtering is dirrent from last filter
                if (typeof opts.filterLastValue !== "undefined" && opts.filterLastValue !== opts.filterValue) {
                    opts.navigate = 'first';
                    opts.currentPage = 1;
                }
                var filterValue = typeof opts.filterValue === 'undefined' ? '' : opts.filterValue;
                opts.filterLastValue = filterValue;
                if (filterValue.length > 0) {
                    rows.hide(); //hide all rows, so filter will only show filtered rows
                    rows = context.find(opts.filterCell + ':containsIgnoreCase("' + opts.filterValue + '")').parent();
                }
            }

            total.text('Total: ' + rows.length);

            // dont worry about paging limited rows                                        
            if (rows.length <= opts.pageSize) {
                navigation.hide();
                rows.show();
                context.find('.row:visible:even').addClass('rowalternate');
                // persist opts bewteen page navigation
                context.data("savedOptions", opts);
                return;
            }

            // enable paging for lots of rows
            navigation.show();

            var lastPage = parseInt(rows.length / opts.pageSize) + 1;
            switch (opts.navigate) {
                case 'first':
                    opts.currentPage = 1;
                    break;
                case 'last':
                    opts.currentPage = lastPage;
                    break;
                case 'next':
                    if (opts.currentPage < lastPage) opts.currentPage++;
                    break;
                case 'prev':
                    if (opts.currentPage > 1) opts.currentPage--;
                    break;
            }

            var startingRow;
            switch (opts.currentPage) {
                case 1: // first
                    startingRow = 0;
                    break;
                default: // any otherpage in between
                    startingRow = ((opts.pageSize * opts.currentPage) - opts.pageSize);
                    break;
            }
            var endingRow = startingRow + (opts.pageSize - 1);

            rows.each(function (i) {
                if (i < startingRow || i > endingRow) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
            context.find('.row:visible:even').addClass('rowalternate');

            //if (navigation.is
            if (opts.currentPage === lastPage) {
                navigation.find('span.link:contains("' + opts.next + '")').hide();
                navigation.find('span.link:contains("' + opts.prev + '")').show();
            } else if (opts.currentPage === 1) {
                navigation.find('span.link:contains("' + opts.next + '")').show();
                navigation.find('span.link:contains("' + opts.prev + '")').hide();
            } else {
                navigation.find('span.link').show();
            }
            navigation.find('span:not(.link)').text('Page ' + opts.currentPage + ' of ' + lastPage);

            // persist options bewteen page navigation
            context.data("savedOptions", opts);
        });
    };

    // private methods

    // defaults
    $.fn.pageGrid.defaults = { currentPage: 1, pageSize: 10, navigate: 'first', next: 'Next', prev: 'Prev', first: 'First', last: 'Last', filterCell: '', filterValue: '', filterElement: undefined };


    /* Show page error */
    $.fn.showPageError = function (message, options) {
        var opts = $.extend({}, $.fn.showPageError.defaults, options);

        //Hide the Wait window if it exists.
        if (opts.hideLightBox && (Guyu.WaitWindow.isVisible() || Guyu.LightBox.currentShowMode === Guyu.LightBox.showMode.processing)) {
            Guyu.WaitWindow.hide();
            window.scrollTo(0, 0);
        }

        if (message && typeof message === "string") {
            message = message.replace('The transaction ended in the trigger. The batch has been aborted.', '');
            message = message.replace('The Microsoft Distributed Transaction Coordinator (MS DTC) has cancelled the distributed transaction.', '');
        }

        if (message && message.formatAsHtml) {
            message = message.formatAsHtml();
        }

        return this.each(function (i) {
            var context = $(this),
                position = context.position();

            function setUniqueId() {
                if (!opts.json || !opts.json.ObjectResponse || !opts.json.ObjectResponse.UniqueId) {
                    return;
                }

                var errorLogs = context.data('error_logs') || [];

                errorLogs.push({ uniqueid: opts.json.ObjectResponse.UniqueId, debugMessage: opts.json.ObjectResponse.DebugMessage });
                context.data('error_logs', errorLogs);
            }

            if (opts.scroll === true) {
                window.scrollTo(position.left, position.top);
            }

            // check if appending to current error
            if (opts.append === true && context.find('div.' + opts.className).length > 0) {
                setUniqueId();

                context.find('div.' + opts.className)
                    .append('<br/>')
                    .append(message)
                    .append(additionalMessage());
                return;
            }

            // create new error
            context.removePageError();

            setUniqueId();

            var row = $(document.createElement("div")).addClass("row"),
                alertdiv = $(document.createElement("div")).addClass("cell cell2").addClass(opts.className).append(message);

            if (opts.showTimestamp && context.attr('id') === "page_error") {
                var currentDateTime = new Date();
                var currentTime = "(" + currentDateTime.getDate().toString().padLeft(2, '0') + '/' + (currentDateTime.getMonth() + 1).toString().padLeft(2, '0') + '/' + currentDateTime.getFullYear().toString().substring(2, 4) + ' '
                    + currentDateTime.getHours().toString().padLeft(2, '0') + ':' + currentDateTime.getMinutes().toString().padLeft(2, '0') + ")";
                var currentTimeSpan = $(document.createElement("span")).addClass("errortimestamp").append(currentTime);

                function appendDotSpace(messageString) {
                    if (messageString.length > 0) {
                        if (messageString.substring(messageString.length - 1) === ".") {
                            return messageString + " ";
                        } else {
                            return messageString + ". ";
                        }
                    }
                    return messageString;
                }

                if (message && typeof message === "string") {
                    alertdiv.text(appendDotSpace(alertdiv.text())).append(currentTimeSpan);
                } else {
                    message.text(appendDotSpace(message.text())).append(currentTimeSpan);
                }
            }

            function appendAdditionalMessage(toolTipMessage) {
                if (toolTipMessage.length > 0) {
                    return $(' <img alt="" class="information icon_help" src="/SOLV2/Images/transparent.gif"/>').addClass(Guyu.browser.spriteCssClass()).toolTip(toolTipMessage, { width: 300, heading: 'Additional Information' });
                }
            }

            function additionalMessage() {
                if (opts.additionalMessage) {
                    return appendAdditionalMessage(opts.additionalMessage);
                } else if (opts.json && opts.json.ObjectResponse && opts.json.ObjectResponse.DebugMessage && opts.json.ObjectResponse.DebugMessage !== message) {
                    var addMsg = '';
                    if (opts.json.ObjectResponse.ErrorNumber) {
                        addMsg += '<span class="small">Error Number:</span><br/>' + opts.json.ObjectResponse.ErrorNumber + '<br/>';
                    }
                    return appendAdditionalMessage(addMsg + '<br/><span class="small">Message:</span><br/>' + opts.json.ObjectResponse.DebugMessage.formatAsHtml());
                }
            }

            alertdiv.append(additionalMessage());

            if (opts.className === 'alert') {
                row.append($('<div class="cell cell1 icon_alert_large"></div>').addClass(Guyu.browser.spriteCssClass()));
            }
            row.append(alertdiv)
                .append(Guyu.clearFloat);

            if (opts.position === 'end') {
                context.append(row);
            } else {
                context.prepend(row);
            }
            context.fadeIn(Guyu.fadeDuration);
        });
    };
    $.fn.showPageError.defaults = { append: false, scroll: true, className: 'alert', position: 'end', additionalMessage: undefined, json: undefined, hideLightBox: true, showTimestamp: true };

    /* Remove page error */
    $.fn.removePageError = function (options) {
        var opts = $.extend({}, $.fn.removePageError.defaults, options);

        return this.each(function (i) {
            var context = $(this);

            context.removeAttr('data-uniqueid');

            if (!opts.onlyIfBlank || (opts.onlyIfBlank && context.find('div.' + opts.className).children().length === 0)) {
                context.empty();
            }
        });
    };
    $.fn.removePageError.defaults = { onlyIfBlank: false, className: $.fn.showPageError.defaults.className };

    // Used for AT results
    $.fn.pageErrorLog = function () {
        var totalErrors = [];

        this.each(function () {
            var errors = $(this).pageErrors();
            for (var i = 0; i < errors.length; i++) {
                totalErrors.push(errors[i]);
            }
        });

        if (JSON) {
            return JSON.stringify(totalErrors);
        }

        if (totalErrors.length === 0) {
            return "[]";
        }

        var log = '';
        for (var i = 0; i < totalErrors.length; i++) {
            if (log.length > 0) {
                log += ",";
            }
            log += '{"lightboxHref":"' + totalErrors[i].lightboxHref + '",uniqueid":"' + totalErrors[i].uniqueid + '","debugMessage":"' + totalErrors[i].debugMessage.replace(/"/g, "") + '"}';
        }

        return '[' + log + ']';
    },

        $.fn.pageErrors = function () {
            var errors = [],
                currentFrame = Guyu.LightBox.currentFrame();

            function add(data, lightbox) {
                if (data && data.error_logs && data.error_logs.length) {
                    for (var i = 0; i < data.error_logs.length; i++) {
                        errors.push($.extend({ lightboxHref: lightbox }, data.error_logs[i]));
                    }
                }
            }

            this.each(function (i) {
                var $this = $(this);

                add($this.data());
                if (currentFrame) {
                    var element = $('#' + this.id, currentFrame.document);
                    add(currentFrame.$.data(element[0]), currentFrame.document.location.href);
                }
            });

            return errors;
        };

    /* Show Information on the page
            - message (string) this is the message shown on the screen
            - options (not required)
                showLoading : true/false (default false) Show the spining loading image
                append      : true/false (default false) Append to the existing information shown
                hide        : true/false (default true) Hides the information after the showDuration period
                showDuration: int (default 5000, 5 Seconds) The number of milliseconds to show the message before it fades out
                scroll      : true/false (default true) Scrolls the message into view
                callback    : function (default empty function) This gets called after the fade out of the message
                aboveLightbox : true / false (default false)  Will add a class to the message to display it above a lightbox.
                maxWidth : (set this to a width, if width is too wide)
                top: top position offset (+/-px)
                
    */
    $.fn.showInformation = function (message, options) {

        if (!message) {
            return this;
        }

        return this.each(function (i) {

            var context = $(this),
                opts = $.extend({}, $.fn.showInformation.defaults, options);

            if (opts.scroll === true) {
                var position = context.get(0).tagName.toLowerCase() === 'body'
                    ? { left: 0, top: 0 }
                    : context.position();
                window.scrollTo(position.left, position.top);
            }

            var container = $('#information');

            // create information container
            var item = $('<li/>');
            if (container.length === 0) {
                container = $(document.createElement('ul'))
                    .attr('id', 'information')
                    .hide()
                    .appendTo($(document.body));
                item.addClass('float_left');
            } else if (opts.append === false) {
                container.empty();
                item.addClass('float_left');
            }

            if (opts.showLoading === true && container.children().length === 0) {
                $('<li/>').addClass('float_left')
                    .append(Guyu.loadingImage.html())
                    .appendTo(container);
            }
            item.append(message).appendTo(container);

            if (opts.aboveLightbox) {
                container.addClass('abovelightbox');
            }

            if (container.is(':visible')) {
                container.hide();
            }

            var offset = context.offset();
            var top = offset.top + opts.top;

            container.css({ left: offset.left + 'px', top: top + 'px' });

            var containerLayout = container.layout(),
                informationBorderPadding = (containerLayout.padding.left + containerLayout.border.left),
                maxWidth = $.isUndefined(opts.maxWidth)
                    ? context.width() - (informationBorderPadding * 2) - (40) // 40px = 20px*2 left/right for margin in from context
                    : opts.maxWidth;

            if (container.width() > maxWidth) {
                container.css({ width: maxWidth + 'px' });
            } else {
                container.css({ width: '' }); // remove the width
            }

            // align center
            container.css({ left: (context.offset().left + (parseInt(context.width() / 2, 10)) - parseInt(container.width() / 2, 10) - parseInt(informationBorderPadding / 2, 10)) + 'px' });
            if (Guyu.browser.msie6()) {
                container.show();
            } else {
                container.fadeIn(Guyu.fadeDuration);
            }

            if (opts.hide === true) {
                setTimeout(function () {
                    if (Guyu.browser.msie6()) {
                        container.hide();
                    } else {
                        container.fadeOut(Guyu.fadeDuration, opts.callback);
                    }
                }, opts.showDuration);
            }
        });
    };
    $.fn.showInformation.defaults = { callback: $.emptyFunction, append: false, hide: true, showLoading: false, showDuration: 5000, scroll: true, aboveLightbox: false, top: 0 };

    /* Remove page information */
    $.fn.removeInformation = function () {
        return $('#information').remove();
    };

    /* extended jQuery function to add an error message to an element */
    /* will place a red box around the parent element and insert an error message after the element*/
    $.fn.addError = function (messages, setFocusToFirst, options) {
        var opts = $.extend({}, { position: 'append' }, options),
            setFocus = $.isUndefined(setFocusToFirst) ? true : setFocusToFirst;

        return this.each(function (i) {
            // check if message is the same for all elements or different message for each element
            var message = typeof messages === "string" ? messages : messages[i],
                context = $(this);
            context.addClass('error');

            // IE select highlight workaround, or INPUT type FILE
            if (context.is('input:file') || (this.tagName.toLowerCase() === 'select' && Guyu.browser.msie)) {
                if (context.parent().hasClass('errorcontainer')) {
                    context.parent().addClass('error');
                } else {
                    context.wrap('<div class="error errorcontainer"></div>');
                }
            }

            // add error message if message passed in and a message hasnt already been added (i.e no duplicated messages)
            if (message.length > 0 && !context.parent().hasClass('error_element')) {
                var errorElement = $(document.createElement('div')).addClass('error_element alert').html(message);
                // attach error message to the parent (this is not the IE workaround div)
                context.parents().each(function (index) {
                    var parent = $(this);
                    if (!parent.hasClass('error')) {
                        if (opts.position === 'after') {
                            context.after(errorElement);
                        } else {
                            parent.append(errorElement);
                        }
                        return false; //break each
                    }
                });
            }

            if (i === 0 && setFocus === true) {
                $(this).focus();
            }
        });
    };

    $.fn.removeError = function () {
        return this.each(function (i) {

            var context = $(this).removeClass('error'),
                parent = context.parent();

            if (parent.hasClass('errorcontainer')) {
                parent.removeClass('error');
                if (parent.next().hasClass('error_element')) {
                    parent.next().remove();
                }
            }

            if (context.next().hasClass('error_element')) {
                context.next().remove();
            }
        });
    };

    // populate a combo with Guyu allowd times
    $.fn.times = function (options) {
        var opts = $.extend({}, $.fn.times.defaults, options);
        var times = Guyu.Globals.timesJSON();

        function addOption(combo, val) {
            var option = new Option(val, val);
            combo.get(0).options[combo.get(0).options.length] = option;
        };

        return this.each(function () {
            var context = $(this).html('');
            if (opts.includeFlightTime === true) {
                addOption(context, 'Flight Time');
            }
            $.each(times, function (index, time) {
                if (time.IsAny === false || opts.includeAny === true) {
                    addOption(context, time.Time);
                }
            });
        });
    };
    $.fn.times.defaults = {
        includeAny: true,
        includeFlightTime: false
    };

    /*Extending the jQuery UI DatePicker*/
    $.fn.GuyuPastDatePicker = function (options) {
        var opts = $.extend({}, $.fn.GuyuPastDatePicker.defaults, options);
        return this.each(function () {
            var currentYear = (new Date).getFullYear().toString();
            var backDatedYear = (parseInt(currentYear, 10) - parseInt(opts.yearsBack, 10)).toString();
            $(this).GuyuDatePicker($.extend({}, { showStatus: true, changeYear: true, changeMonth: true, yearRange: backDatedYear + ':' + currentYear, maxDate: 0, defaultDate: '-1y' }, opts));
        });
    };
    $.fn.GuyuPastDatePicker.defaults = { yearsBack: '110' };

    $.fn.GuyuFutureDatePicker = function (options) {
        var opts = $.extend({}, $.fn.GuyuFutureDatePicker.defaults, options);

        return this.each(function () {
            var currentYear = (new Date).getFullYear().toString();
            var futureDatedYear = (parseInt(currentYear, 10) + parseInt(opts.yearsOut, 10)).toString();
            $(this).GuyuDatePicker($.extend({}, { showStatus: true, changeYear: true, changeMonth: true, yearRange: currentYear + ':' + futureDatedYear, minDate: 0, defaultDate: '+1y' }, opts));
        });
    };
    $.fn.GuyuFutureDatePicker.defaults = { yearsOut: '110' };


    $.fn.GuyuDatePicker = function (options) {
        var opts = $.extend({}, $.fn.GuyuDatePicker.defaults, options);

        return this.each(function () {
            $(this).datepicker(opts).addClass('link').attr('readonly', 'readonly');
        });
    };

    $.fn.GuyuGdsDatePicker = function (options) {
        var opts = $.extend({}, $.fn.GuyuDatePicker.defaults, $.fn.GuyuGdsDatePicker.defaults, options === undefined ? {} : options);
        // ie6 too slow with standard 3mth calendar
        if (Guyu.browser.msie6() || Guyu.browser.isMobileDevice()) {
            opts.numberOfMonths = 1;
            opts.stepMonths = 1;
            opts.changeMonth = true;
            opts.changeYear = true;
        }
        return this.each(function () {
            $(this).GuyuDatePicker(opts);
        });
    };

    $.fn.GuyuDatePicker.defaults = {
        dateFormat: 'dd M yy',
        closeText: 'Close',
        closeAtTop: false,
        hideIfNoPrevNext: true,
        navigationAsDateFormat: false,
        prevText: '<',
        currentText: 'Current Selected',
        nextText: '>',
        buttonImage: '/SOLV2/images/master_button_calendar.gif',
        showOn: 'both',
        buttonImageOnly: true,
        gotoCurrent: true,  // false = today, true = current selected
        firstDay: 1,
        dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        showButtonPanel: true,
        changeMonth: false,
        duration: ''
    };

    $.fn.GuyuGdsDatePicker.defaults = {
        minDate: 0,
        maxDate: 362,
        mandatory: true,
        //numberOfMonths: [2, 3], // Use this if we want to have 6 months shown at a time in two rows (3 per row).
        numberOfMonths: 3,
        stepMonths: 3
    };

    /*This function will set the min and max dates according to the other calendars that are within the same name; eg dteSeg1 and dteSeg2
    You will need to set the beforeShow to $.fn.GuyuGdsDatePicker.setMinMaxFromSameType and set baseCalendarName to the calendar name that is common; 
    eg dteSeg for dteSeg1*/
    $.fn.GuyuGdsDatePicker.setMinMaxFromSameType = function () {
        var baseCalendarName = arguments[1].settings.baseCalendarName;
        var thisDateSegment = parseInt(this.id.replace(baseCalendarName, ''));

        var previousDateToChange = $('#' + baseCalendarName + (thisDateSegment - 1));
        var nextDateToChange = $('#' + baseCalendarName + (thisDateSegment + 1));

        return {
            minDate: (previousDateToChange.length > 0 && $(previousDateToChange).val().length > 0 ? $(previousDateToChange).datepicker("getDate") : 0),
            maxDate: (nextDateToChange.length > 0 && $(nextDateToChange).val().length > 0 ? $(nextDateToChange).datepicker("getDate") : 362)
        };
    };

    /*This function will set the min and max dates according to the other calendar that is passed in as the options for creating the calendar.
    You will need to set the beforeShow to $.fn.GuyuGdsDatePicker.setMinMaxFromOtherCalendar, set otherCalendarId to the other calendar and set setMin
    or setMax for the value that should be set.*/
    $.fn.GuyuGdsDatePicker.setMinMaxFromOtherCalendar = function () {
        var baseCalendarName = arguments[1].settings.otherCalendarId;

        var otherDate = $('#' + baseCalendarName).datepicker("getDate");
        var maxDays = arguments[1].settings.maxDays && arguments[1].settings.maxDays > 0 ? arguments[1].settings.maxDays : 362;

        return {
            minDate: (arguments[1].settings.setMin ? otherDate : 0),
            maxDate: (arguments[1].settings.setMax ? (otherDate || maxDays) : maxDays)
        };
    };

    $.extend(Guyu, {
        isValidPostJsonResult: function (json, quickBookingEngine) {

            //\Guyu.interfaces\lightweight\enums.cs - ReturnCode  
            var QUICKBOOKING_EXPIRED_ERROR = -300000001;
            var RAPIDBOOKING_EXPIRED_ERROR = -300000002;

            if (json && json.ObjectResponse && (json.ObjectResponse.ErrorNumber === QUICKBOOKING_EXPIRED_ERROR || json.ObjectResponse.ErrorNumber === RAPIDBOOKING_EXPIRED_ERROR)) {

                var actionText = json.ObjectResponse.ErrorParamaters.BookingId ? 'return to the booking details page' : 'start a new booking';
                var htmlMsg = $('<div />')
                    .append('<p>Your new booking has expired.</p>')
                    .append('<ol><li>Click \'Ok\' to ' + actionText + '.</li><li>Click \'Cancel\' to go to ' + Guyu.trademark.online + ' home page.</li></ol>')
                    .width(300)
                    .css('text-align', 'left');


                Guyu.LightBox.showMessageBox('New Booking Expired', htmlMsg, {
                    showOk: true,
                    showCancel: true,
                    messageBoxType: 'alert',
                    width: 350,
                    beforeHide: function (buttonPressed) {
                        Guyu.LightBox.disable();
                        Guyu.deleteQuickBookingCookies().then(function () {
                            if (buttonPressed !== Guyu.LightBox.buttonType.Ok) {
                                Guyu.jumpPage('/Web/Home');
                            } else if (quickBookingEngine === Guyu.Globals.quickBookingEngine.rapidBooking) {
                                Guyu.jumpPage('/Web/RapidBooking');
                            } else if (json.ObjectResponse.ErrorParamaters.BookingId) {
                                Guyu.jumpPage('/Web/Booking/Detail/' + json.ObjectResponse.ErrorParamaters.BookingId);
                            } else {
                                createQuickBooking().then(function (quickBookingId) {
                                    Guyu.jumpPage('/Web/Booking/' + quickBookingId + '/Criteria');
                                });
                            }
                        });

                        return false;
                    }
                });

                return false;
            }

            return true;
        }
    });


    /* Function to get JSON via a Post rather than a Get
        returns $.ajax object
    */
    $.postJSON = function (url, options, successcallback, context, errorcallback, headers) {

        if (!url) {
            var defer = $.Deferred();
            defer.reject('Invalid url');
            return defer.promise();
        }

        var opts,
            pageOpts;

        try {
            pageOpts = pageOptions;
        } catch (e) {
            pageOpts = undefined;
        }

        var extraData = {
            MainObjectType: $.isUndefined(Guyu.PageState) ? '' : Guyu.PageState.mainObjectType,
            BookingId: $.isUndefined(pageOpts) ? -1 : $.isUndefined(pageOpts.bookingId) ? -1 : pageOpts.bookingId,
            ProfileId: $.isUndefined(pageOpts) ? -1 : $.isUndefined(pageOpts.profileId) ? -1 : pageOpts.profileId,
            windowLocation: encodeURI(window.location)
        };

        var overrideExtraData = function (extraDataKey, optionsKey) {
            if ($.isArray(options)) {
                // extra overrides 
                options = $.grep(options, function (option, i) {
                    if (option.name === optionsKey) {
                        extraData[extraDataKey] = option.value;
                        return false;
                    }
                    return true;
                });
            } else if (options && !$.isUndefined(options[optionsKey])) {
                extraData[extraDataKey] = options[optionsKey];
                delete options[optionsKey];
            }
        };

        overrideExtraData('BookingId', 'bookingId');
        overrideExtraData('ProfileId', 'profileId');

        if ($.isArray(options)) {
            opts = options;
            opts.push({ name: 'MainObjectType', value: extraData.MainObjectType });
            opts.push({ name: 'BookingId', value: extraData.BookingId });
            opts.push({ name: 'ProfileId', value: extraData.ProfileId });
            opts.push({ name: 'windowLocation', value: extraData.windowLocation });
        } else {
            opts = $.extend(extraData, options);
        }

        url = Guyu.rootUrl(url);
        if (url.indexOf('?') !== -1) {
            url = url + '&stamp=' + (new Date()).getTime();
        } else {
            url = url + '?stamp=' + (new Date()).getTime();
        }

        return $.ajax({
            type: 'POST',
            url: url,
            data: opts,
            headers: headers,
            success: function (json) {
                var quickBookingEngine = (Guyu.PageState || {}).quickBookingEngine || Guyu.Globals.quickBookingEngine.quickBookingWizard;
                if (Guyu.isValidPostJsonResult(json, quickBookingEngine) && !$.isUndefined(successcallback) && successcallback !== null) {
                    if (json === null) {
                        json = { Exception: 'No response received from the Server, please try again.' };
                    }
                    successcallback.call(this, json);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest !== null && XMLHttpRequest !== undefined && (XMLHttpRequest.readyState === 0 || XMLHttpRequest.Status)) return;

                if ($.isFunction(errorcallback)) {
                    errorcallback.call(this, XMLHttpRequest, textStatus, errorThrown, url, opts);
                } else {
                    $.postHTML.defaults.error.call(this, XMLHttpRequest, textStatus, errorThrown, url, opts);
                }
            },
            dataType: 'json',
            context: context
        });
    };

    /* Function to call AJAX page that returns HTML JSON via a Post
     * sets a default error handler, that you can override
    */
    $.postHTML = function (options) {
        var opts = $.extend($.postHTML.defaults, options);

        opts.data.windowLocation = encodeURI(window.location);

        return $.ajax({
            type: 'POST',
            url: Guyu.rootUrl(opts.url),
            data: opts.data,
            success: opts.success,
            error: opts.error,
            dataType: 'html'
        });
    };

    $.postHTML.defaults = {
        error: function (XMLHttpRequest, textStatus, errorThrown, url, data) {
            $.ajaxSetup({ async: true });
            $.showAjaxError.call(this, $('#page_error'), XMLHttpRequest, textStatus, errorThrown, url, data);
        }
    };

    /* show ajax error */
    $.showAjaxError = function (context, XMLHttpRequest, textStatus, errorThrown, url, data) {

        if (!$.isUndefined(Guyu)) {
            if (Guyu.WaitWindow.isVisible()) {
                Guyu.WaitWindow.hide();
            }
            if (Guyu.LightBox.currentShowMode === Guyu.LightBox.showMode.processing) {
                Guyu.LightBox.hide();
            }
        }

        if (!$.isUndefined(window.parent) && !$.isUndefined(window.parent.Guyu)) {
            window.parent.Guyu.LightBox.enable();
            if (!$.isUndefined(window.parent.Guyu.LightBox.buttonCancel)) {
                window.parent.Guyu.LightBox.buttonCancel.show();
            }
        }

        function getErrorMessage() {
            var aspErrorCodes = [
                { code: "800A0005", message: "Invalid Procedure Call (VBScript 0x800A0005)" },
                { code: "800A000D", message: "Type Mismatch (VBScript 0x800A000D)" },
                { code: "800A0035", message: "File not found (VBScript 0x800A0035)" },
                { code: "800A003A", message: "File Already Exists (VBScript 0x800A003A)" },
                { code: "800A0046", message: "Permission denied (VBScript 0x800A0046)" },
                { code: "800A004C", message: "Path not found (VBScript 0x800A004C)" },
                { code: "800A01A8", message: "Object required (VBScript 0x800A01A8)" },
                { code: "800A01AD", message: "ActiveX component can't create object (VBScript 0x800A01AD)" },
                { code: "800A01B6", message: "Object doesn't support this property or method (VBScript 0x800A01B6)" },
                { code: "800A01BD", message: "Object doesn't support this ACTION (VBScript 0x800A01BD)" },
                { code: "800A01C3", message: "Object not a collection (VBScript 0x800A01C3)" },
                { code: "800A01C2", message: "Invalid property assignment (VBScript 0x800A01C2)" },
                { code: "800A01CE", message: "Remote Server does not exist (or is unavailable) (VBScript 0x800A01CE)" },
                { code: "800A01F4", message: "Variable undefined (VBScript 0x800A01F4)" },
                { code: "800A01F5", message: "Illegal assignment (VBScript 0x800A01F5)" },
                { code: "800A03EA", message: "Syntax Error (VBScript 0x800A03EA)" },
                { code: "800A03EE", message: "Expected ')' (VBScript 0x800A03EE)" },
                { code: "800A03F1", message: "Variable is undefined (VBScript 0x800A03F1)" },
                { code: "800A03F2", message: "Expected Identifier (VBScript 0x800A03F2)" },
                { code: "800A03F4", message: "Variable Undefined (VBScript 0x800A03F4)" },
                { code: "800A03F6", message: "Expected End (VBScript 0x800A03F6)" },
                { code: "800A03FD", message: "Expected 'Case' (VBScript 0x800A03FD)" },
                { code: "800A0400", message: "Expected statement (VBScript 0x800A0400)" },
                { code: "800A0401", message: "Expected end of statement (VBScript 0x800A0401)" },
                { code: "800A0407", message: "Invalid Number (VBScript 0x800A0407)" },
                { code: "800A0408", message: "Invalid Character (VBScript 0x800A0408)" },
                { code: "800A0409", message: "Unterminated string constant (VBScript 0x800A0409)" },
                { code: "800A041F", message: "Unexpected Next (VBScript 0x800A041F)" },
                { code: "800A139B", message: "- Expected ']' in regular expression (VBScript 0x800A139B)" },
                { code: "800A139A", message: "Expected quantifier in regular expression (VBScript 0x800A139A)" },
                { code: "800A0CC1", message: "Item cannot be found in the collection (VBScript 0x800A0CC1)" },
                { code: "ASP 0100", message: "Out of memory (ASP 0100)" },
                { code: "ASP 0101", message: "Unexpected error (ASP 0101)" },
                { code: "ASP 0102", message: "Expecting string input (ASP 0102)" },
                { code: "ASP 0103", message: "Expecting numeric input (ASP 0103)" },
                { code: "ASP 0104", message: "Operation not Allowed (ASP 0104)" },
                { code: "ASP 0105", message: "Index out of range (ASP 0105)" },
                { code: "ASP 0106", message: "Type Mismatch (ASP 0106)" },
                { code: "ASP 0107", message: "Stack Overflow (ASP 0107)" },
                { code: "ASP 0108", message: "Create object failed (ASP 0108)" },
                { code: "ASP 0109", message: "Member not found (ASP 0109)" },
                { code: "ASP 0110", message: "Unknown name (ASP 0110)" },
                { code: "ASP 0111", message: "Unknown interface (ASP 0111)" },
                { code: "ASP 0112", message: "Missing parameter (ASP 0112)" },
                { code: "ASP 0113", message: "Script timed out (ASP 0113)" },
                { code: "ASP 0114", message: "Object not free threaded (ASP 0114)" },
                { code: "ASP 0115", message: "Unexpected error (ASP 0115)" },
                { code: "ASP 0116", message: "Missing close of script delimiter (ASP 0116)" },
                { code: "ASP 0117", message: "Missing close of script tag (ASP 0117)" },
                { code: "ASP 0118", message: "Missing close of object tag (ASP 0118)" },
                { code: "ASP 0119", message: "Missing Classid or Progid attribute (ASP 0119)" },
                { code: "ASP 0120", message: "Invalid Runat attribute (ASP 0120)" },
                { code: "ASP 0121", message: "Invalid Scope in object tag (ASP 0121)" },
                { code: "ASP 0122", message: "Invalid Scope in object tag (ASP 0122)" },
                { code: "ASP 0123", message: "Missing Id attribute (ASP 0123)" },
                { code: "ASP 0124", message: "Missing Language attribute (ASP 0124)" },
                { code: "ASP 0125", message: "Missing close of attribute (ASP 0125)" },
                { code: "ASP 0126", message: "Include file not found (ASP 0126)" },
                { code: "ASP 0127", message: "Missing close of HTML comment (ASP 0127)" },
                { code: "ASP 0128", message: "Missing File or Virtual attribute (ASP 0128)" },
                { code: "ASP 0129", message: "Unknown scripting language (ASP 0129)" },
                { code: "ASP 0130", message: "Invalid File attribute (ASP 0130)" },
                { code: "ASP 0131", message: "Disallowed Parent Path (ASP 0131)" },
                { code: "ASP 0132", message: "Compilation Error (ASP 0132)" },
                { code: "ASP 0133", message: "Invalid ClassID attribute (ASP 0133)" },
                { code: "ASP 0134", message: "Invalid ProgID attribute (ASP 0134)" },
                { code: "ASP 0135", message: "Cyclic Include (ASP 0135)" },
                { code: "ASP 0136", message: "Invalid object instance name (ASP 0136)" },
                { code: "ASP 0137", message: "Invalid Global Script (ASP 0137)" },
                { code: "ASP 0138", message: "Nested Script Block (ASP 0138)" },
                { code: "ASP 0139", message: "Nested Object (ASP 0139)" },
                { code: "ASP 0140", message: "Page Command Out Of Order (ASP 0140)" },
                { code: "ASP 0141", message: "Page Command Repeated (ASP 0141)" },
                { code: "ASP 0142", message: "Thread token error (ASP 0142)" },
                { code: "ASP 0143", message: "Invalid Application Name (ASP 0143)" },
                { code: "ASP 0144", message: "Initialization Error (ASP 0144)" },
                { code: "ASP 0145", message: "New Application Failed (ASP 0145)" },
                { code: "ASP 0146", message: "New Session Failed (ASP 0146)" },
                { code: "ASP 0147", message: "500 Server Error (ASP 0147)" },
                { code: "ASP 0148", message: "Server Too Busy (ASP 0148)" },
                { code: "ASP 0149", message: "Application Restarting (ASP 0149)" },
                { code: "ASP 0150", message: "Application Directory Error (ASP 0150)" },
                { code: "ASP 0151", message: "Change Notification Error (ASP 0151)" },
                { code: "ASP 0152", message: "Security Error (ASP 0152)" },
                { code: "ASP 0153", message: "Thread Error (ASP 0153)" },
                { code: "ASP 0154", message: "Write HTTP Header Error (ASP 0154)" },
                { code: "ASP 0155", message: "Write Page Content Error (ASP 0155)" },
                { code: "ASP 0156", message: "Header Error (ASP 0156)" },
                { code: "ASP 0157", message: "Buffering On (ASP 0157)" },
                { code: "ASP 0158", message: "Missing URL (ASP 0158)" },
                { code: "ASP 0159", message: "Buffering Off (ASP 0159)" },
                { code: "ASP 0160", message: "Logging Failure (ASP 0160)" },
                { code: "ASP 0161", message: "Data Type Error (ASP 0161)" },
                { code: "ASP 0162", message: "Cannot Modify Cookie (ASP 0162)" },
                { code: "ASP 0163", message: "Invalid Comma Use (ASP 0163)" },
                { code: "ASP 0164", message: "Invalid TimeOut Value (ASP 0164)" },
                { code: "ASP 0165", message: "SessionID Error (ASP 0165)" },
                { code: "ASP 0166", message: "Uninitialized Object (ASP 0166)" },
                { code: "ASP 0167", message: "Session Initialization Error (ASP 0167)" },
                { code: "ASP 0168", message: "Disallowed object use (ASP 0168)" },
                { code: "ASP 0169", message: "Missing object information (ASP 0169)" },
                { code: "ASP 0170", message: "Delete Session Error (ASP 0170)" },
                { code: "ASP 0171", message: "Missing Path (ASP 0171)" },
                { code: "ASP 0172", message: "Invalid Path (ASP 0172)" },
                { code: "ASP 0173", message: "Invalid Path Character (ASP 0173)" },
                { code: "ASP 0174", message: "Invalid Path Character(s) (ASP 0174)" },
                { code: "ASP 0175", message: "Disallowed Path Characters (ASP 0175)" },
                { code: "ASP 0176", message: "Path Not Found (ASP 0176)" },
                { code: "ASP 0177", message: "Server.CreateObject Failed (ASP 0177)" },
                { code: "ASP 0178", message: "Server.CreateObject Access Error (ASP 0178)" },
                { code: "ASP 0179", message: "Application Initialization Error (ASP 0179)" },
                { code: "ASP 0180", message: "Disallowed object use (ASP 0180)" },
                { code: "ASP 0181", message: "Invalid threading model (ASP 0181)" },
                { code: "ASP 0182", message: "Missing object information (ASP 0182)" },
                { code: "ASP 0183", message: "Empty Cookie Key (ASP 0183)" },
                { code: "ASP 0184", message: "Missing Cookie Name (ASP 0184)" },
                { code: "ASP 0185", message: "Missing Default Property (ASP 0185)" },
                { code: "ASP 0186", message: "Error parsing certificate (ASP 0186)" },
                { code: "ASP 0187", message: "Object addition conflict (ASP 0187)" },
                { code: "ASP 0188", message: "Disallowed object use (ASP 0188)" },
                { code: "ASP 0189", message: "Disallowed object use (ASP 0189)" },
                { code: "ASP 0190", message: "Unexpected error (ASP 0190)" },
                { code: "ASP 0191", message: "Unexpected error (ASP 0191)" },
                { code: "ASP 0192", message: "Unexpected error (ASP 0192)" },
                { code: "ASP 0193", message: "OnStartPage Failed (ASP 0193)" },
                { code: "ASP 0194", message: "OnEndPage Failed (ASP 0194)" },
                { code: "ASP 0195", message: "Invalid Server Method Call (ASP 0195)" },
                { code: "ASP 0196", message: "Cannot launch out of process component (ASP 0196)" },
                { code: "ASP 0197", message: "Disallowed object use (ASP 0197)" },
                { code: "ASP 0198", message: "Server shutting down (ASP 0198)" },
                { code: "ASP 0199", message: "Disallowed object use (ASP 0199)" },
                { code: "ASP 0200", message: "Out of Range 'Expires' attribute (ASP 0200)" },
                { code: "ASP 0201", message: "Invalid Default Script Language (ASP 0201)" },
                { code: "ASP 0202", message: "Missing Code Page (ASP 0202)" },
                { code: "ASP 0203", message: "Invalid Code Page (ASP 0203)" },
                { code: "ASP 0204", message: "Invalid CodePage Value (ASP 0204)" },
                { code: "ASP 0205", message: "Change Notification (ASP 0205)" },
                { code: "ASP 0206", message: "Cannot call BinaryRead (ASP 0206)" },
                { code: "ASP 0207", message: "Cannot use Request.Form (ASP 0207)" },
                { code: "ASP 0208", message: "Cannot use generic Request collection (ASP 0208)" },
                { code: "ASP 0209", message: "Illegal value for TRANSACTION property (ASP 0209)" },
                { code: "ASP 0210", message: "Method not implemented (ASP 0210)" },
                { code: "ASP 0211", message: "Object out of scope (ASP 0211)" },
                { code: "ASP 0212", message: "Cannot Clear Buffer (ASP 0212)" },
                { code: "ASP 0214", message: "Invalid Path parameter (ASP 0214)" },
                { code: "ASP 0215", message: "Illegal value for ENABLESESSIONSTATE property (ASP 0215)" },
                { code: "ASP 0216", message: "MSDTC Service not running (ASP 0216)" },
                { code: "ASP 0217", message: "Invalid Scope in object tag (ASP 0217)" },
                { code: "ASP 0218", message: "Missing LCID (ASP 0218)" },
                { code: "ASP 0219", message: "Invalid LCID (ASP 0219)" },
                { code: "ASP 0220", message: "Requests for GLOBAL.ASA Not Allowed (ASP 0220)" },
                { code: "ASP 0221", message: "Invalid @ Command directive (ASP 0221)" },
                { code: "ASP 0222", message: "Invalid TypeLib Specification (ASP 0222)" },
                { code: "ASP 0223", message: "TypeLib Not Found (ASP 0223)" },
                { code: "ASP 0224", message: "Cannot load TypeLib (ASP 0224)" },
                { code: "ASP 0225", message: "Cannot wrap TypeLibs (ASP 0225)" },
                { code: "ASP 0226", message: "Cannot modify StaticObjects (ASP 0226)" },
                { code: "ASP 0227", message: "Server.Execute Failed (ASP 0227)" },
                { code: "ASP 0228", message: "Server.Execute Error (ASP 0228)" },
                { code: "ASP 0229", message: "Server.Transfer Failed (ASP 0229)" },
                { code: "ASP 0230", message: "Server.Transfer Error (ASP 0230)" },
                { code: "ASP 0231", message: "Server.Execute Error (ASP 0231)" },
                { code: "ASP 0232", message: "Invalid Cookie Specification (ASP 0232)" },
                { code: "ASP 0233", message: "Cannot load cookie script source (ASP 0233)" },
                { code: "ASP 0234", message: "Invalid include directive (ASP 0234)" },
                { code: "ASP 0235", message: "Server.Transfer Error (ASP 0235)" },
                { code: "ASP 0236", message: "Invalid Cookie Specification (ASP 0236)" },
                { code: "ASP 0237", message: "Invalid Cookie Specification (ASP 0237)" },
                { code: "ASP 0238", message: "Missing attribute value (ASP 0238)" },
                { code: "ASP 0239", message: "Cannot process file (ASP 0239)" },
                { code: "ASP 0240", message: "Script Engine Exception (ASP 0240)" },
                { code: "ASP 0241", message: "CreateObject Exception (ASP 0241)" },
                { code: "ASP 0242", message: "Query OnStartPage Interface Exception (ASP 0242)" },
                { code: "ASP 0243", message: "Invalid METADATA tag in Global.asa (ASP 0243)" },
                { code: "ASP 0244", message: "Cannot Enable Session State (ASP 0244)" },
                { code: "ASP 0245", message: "Mixed usage of Code Page values (ASP 0245)" },
                { code: "ASP 0246", message: "Too many concurrent users. Please try again later. (ASP 0246)" },
                { code: "ASP 0247", message: "Bad Argument to BinaryRead. (ASP 0247)" },
                { code: "ASP 0248", message: "Script isn't transacted. This ASP file must be transacted in order to use the ObjectContext object. (ASP 0248)" },
                { code: "ASP 0249", message: "Cannot use IStream on Request. Cannot use IStream on Request object after using Request.Form collection or Request.BinaryRead. (ASP 0249)" },
                { code: "ASP 0250", message: "Invalid Default Code Page. The default code page specified for this application is invalid. (ASP 0250)" },
                { code: "ASP 0251", message: "Response Buffer Limit Exceeded. Execution of the ASP page caused the Response Buffer to exceed its configured limit. (ASP 0251)" }];

            var xmlHttpRequestStatusMessages = [
                { id: "12002", message: "Proxy server timeout.  Please contact your IT department as the request has been timed out by a Proxy Server. (Microsoft.XMLHttpRequest 12002)" },
                { id: "12152", message: "The server response could not be parsed. (Microsoft.XMLHttpRequest 12152)" }
            ];

            var errorThrownMessage = typeof errorThrown === 'undefined' ? '' : errorThrown.toString() + ' (' + (errorThrown.number || + '0') + ')',
                textStatusMessage = '';

            if (textStatus && textStatus !== 'success') {

                var textStatusMessages = [
                    { id: "parsererror", message: "The server response could not be parsed." },
                    { id: "timeout", message: "The browser connection has timed out before the server could respond." }
                ];

                for (var errorIndex = 0; errorIndex < textStatusMessages.length; errorIndex++) {
                    if (textStatusMessages[errorIndex].id === textStatus) {
                        return textStatusMessages[errorIndex].message;
                    }
                }

                if (!textStatusMessage) {
                    textStatusMessage = 'The server response failed with "' + textStatus + '". ' + errorThrownMessage;
                }
            }

            if ($.isUndefined(XMLHttpRequest.responseText) || XMLHttpRequest.responseText.length === 0) {
                if (!$.isUndefined(XMLHttpRequest.status)) {
                    for (var errorIndex = 0; errorIndex < xmlHttpRequestStatusMessages.length; errorIndex++) {
                        var xmlHttpRequestErrorCode = xmlHttpRequestStatusMessages[errorIndex],
                            reg = new RegExp(xmlHttpRequestErrorCode.id, "gi");
                        if (reg.test(XMLHttpRequest.status)) {
                            return xmlHttpRequestErrorCode.message;
                        }
                    }

                    return XMLHttpRequest.statusText + ' (XML Http Request Status: ' + XMLHttpRequest.status + '). ' + textStatusMessage;
                }

                return XMLHttpRequest.statusText + '. ' + textStatusMessage;
            }

            for (var errorIndex = 0; errorIndex < aspErrorCodes.length; errorIndex++) {
                var aspErrorCode = aspErrorCodes[errorIndex],
                    reg = new RegExp(aspErrorCode.code, "gi");
                if (reg.test(XMLHttpRequest.responseText)) {
                    return aspErrorCode.message;
                }
            }

            return 'Server error '
                + (XMLHttpRequest.statusText === 'OK' ? '' : XMLHttpRequest.statusText)
                + '. "' + (textStatus || '') + '". ' + textStatusMessage
                + '. ' + errorThrownMessage;
        }

        var errorMessage = '',
            exception = false;

        try {
            if (!$.isUndefined(XMLHttpRequest)) {
                if (XMLHttpRequest.status.toString() === '0' && textStatus === 'success') {
                    return;
                }
                errorMessage = getErrorMessage();
            } else if (!$.isUndefined(textStatus)) {
                errorMessage = textStatus;
            } else {
                errorMessage = errorThrown;
            }
        }
        catch (e) {
            exception = true;
            errorMessage = textStatus;
        }

        function appendMessage(caption, text) {
            return errorMessage += '<span class="small">' + caption + ':</span> ' + ($.isUndefined(text) ? '' : text) + '<br/>';
        }

        if (!$.isUndefined(Guyu) && ((Guyu.tracingEnabled()) || (!$.isUndefined(Guyu.PageState) && !$.isUndefined(Guyu.PageState.developerMachine) && Guyu.PageState.developerMachine === true))) {
            errorMessage = '<p>Ajax Detailed Exception:</p><br/>' + errorMessage;

            errorMessage += '<p>';
            appendMessage('DateTime', new Date());
            appendMessage('UserAgent', window.navigator.userAgent);
            appendMessage('UserLanguage', window.navigator.userLanguage);
            appendMessage('SystemLanguage', window.navigator.systemLanguage);
            appendMessage('CookieEnabled', window.navigator.cookieEnabled);
            errorMessage += '</p>';

            if (XMLHttpRequest && !exception) {
                errorMessage += '<p>';
                appendMessage("XMLHttpRequest.Status", XMLHttpRequest.status);
                appendMessage("XMLHttpRequest.StatusText", XMLHttpRequest.statusText);
                appendMessage("XMLHttpRequest.ReadyState", XMLHttpRequest.readyState);
                appendMessage("XMLHttpRequest.ResponseText", (XMLHttpRequest.responseText || 'ResponseText is null'));
                errorMessage += '</p>';
            }
            errorMessage += '<p>';
            appendMessage("jQuery.textStatus", textStatus);
            appendMessage("jQuery.errorThrown", errorThrown);
            appendMessage("jQuery.errorThrown.number", (typeof errorThrown === 'undefined' ? '' : (errorThrown.number || 'No number')));
            appendMessage("jQuery.url", url);
            errorMessage += '</p>';

            if (data) {
                errorMessage += '<br/>Data:<ul>';
                var parts = typeof data === 'string' ? data.split('&') : $.param(data).split('&');
                for (var x = 0; x < parts.length; x++) {
                    errorMessage += '<li>' + parts[x] + '</li>';
                }
                errorMessage += '</ul>';
            }

            errorMessage += '<br/>Cookies:<ul>';
            $.each(Guyu.Cookies.get(), function (i, cookie) {
                errorMessage += '<li>' + cookie.name + ': ' + cookie.value + '</li>';
            });
            errorMessage += '</ul>';

            if (!$.isUndefined(XMLHttpRequest) && XMLHttpRequest.responseText) {
                errorMessage += '<br/>XMLHttpRequest.responseText:<br/><textarea class="error">';
                var pos = XMLHttpRequest.responseText.search(/Error Type/i);
                if (pos > -1) {
                    errorMessage += XMLHttpRequest.responseText.substr(pos);
                } else {
                    errorMessage += XMLHttpRequest.responseText;
                }
                errorMessage += '</textarea>';
            }
        }

        context.showPageError(errorMessage, { append: true });
    };

    $.fn.required = function () {
        return this.each(function (i) {
            var context = $(this);

            //If the Required indicator has already been appended don't append it again.
            if (context.find('.required_indicator').length !== 0) {
                return true;
            }

            if (context.is('input')) {
                return false;
            }

            context.append('<span class="required_indicator information" title="Required">*</span>');
        });
    };

    $.fn.removeRequired = function () {
        return this.each(function (i) {
            var context = $(this);
            $('.required_indicator', context).remove();
        });
    };

    /*
     * This turns a table into a GridList, mainly used on the Lightboxes
     * High lights the alternative rows, adds rowselected for clicks if radio/checkboxes exist
     * for .grid_list div tables following the .row .cell structure
    */
    $.fn.gridList = function (options) {
        return this.each(function (i) {
            var context = $(this),
                rows = $('.row:not(.rowheader)', context).removeClass('rowalternate'),
                opts = $.extend({}, $.fn.gridList.defaults, options);

            rows.filter(':visible:even').addClass('rowalternate');

            context.find('.row input:checkbox, .row input:radio').click(function (event) {
                var input = $(this);
                var row = input.closest('.row');
                if (row.length === 0) {
                    return;
                }

                if (input.is(':radio')) {
                    rows.removeClass('rowselected');
                    row.addClass('rowselected');
                    $('input:radio', context).removeAttr('checked');
                    input.attr('checked', 'checked');
                } else {
                    // checkbox
                    if (row.hasClass('rowselected')) {
                        row.removeClass('rowselected');
                        input.removeAttr('checked');
                    } else {
                        row.addClass('rowselected');
                        input.attr('checked', 'checked');
                    }
                }
            });

            $('#selectall', context).click(function (event) {
                $('input:checkbox:not(:checked)', context).attr('checked', 'checked');
                rows.addClass('rowselected');
            });

            $('#deselectall', context).click(function (event) {
                $('input:checkbox:checked', context).removeAttr('checked');
                rows.removeClass('rowselected');
            });

            if (rows.length === 1 && $('input:radio, input:checkbox', context).length === 1) {
                $('input:radio, input:checkbox', context).attr('checked', 'checked');
                rows.addClass('rowselected');
            }

        });
    };
    $.fn.gridList.defaults = {
    };


    /*
     * Get the layout style for an single element (border/padding/margin)
    */
    $.fn.layout = function () {
        var getValue = function (s) { s = s.replace('px', ''); return parseInt((isNaN(s) ? 0 : s)); };

        if (this[0]) {
            return {
                width: this.width(),
                height: this.height(),
                position: this.position(),
                border: {
                    top: getValue(this.css('border-top-width')),
                    left: getValue(this.css('border-left-width')),
                    right: getValue(this.css('border-right-width')),
                    bottom: getValue(this.css('border-bottom-width'))
                },
                margin: {
                    top: getValue(this.css('margin-top')),
                    left: getValue(this.css('margin-left')),
                    right: getValue(this.css('margin-right')),
                    bottom: getValue(this.css('margin-bottom'))
                },
                padding: {
                    top: getValue(this.css('padding-top')),
                    left: getValue(this.css('padding-left')),
                    right: getValue(this.css('padding-right')),
                    bottom: getValue(this.css('padding-bottom'))
                },
                totalHeight: function (includeMargin) {
                    var total = this.height + this.border.top + this.border.bottom + this.padding.top + this.padding.bottom;
                    if (!$.isUndefined(includeMargin) && includeMargin === true) {
                        total += this.margin.top + this.margin.bottom;
                    }
                    return total;
                },
                totalWidth: function (includeMargin) {
                    var total = this.width + this.border.left + this.border.right + this.padding.left + this.padding.right;
                    if (!$.isUndefined(includeMargin) && includeMargin === true) {
                        total += this.margin.left + this.margin.right;
                    }
                    return total;
                },
                toString: function () {
                    return 'padding.left: ' + this.padding.left
                        + '\npadding.right: ' + this.padding.right
                        + '\npadding.top: ' + this.padding.top
                        + '\npadding.bottom: ' + this.padding.bottom
                        + '\nmargin.left: ' + this.margin.left
                        + '\nmargin.right: ' + this.margin.right
                        + '\nmargin.top: ' + this.margin.top
                        + '\nmargin.bottom: ' + this.margin.bottom
                        + '\nborder.left: ' + this.border.left
                        + '\nborder.right: ' + this.border.right
                        + '\nborder.top: ' + this.border.top
                        + '\nborder.bottom: ' + this.border.bottom
                        + '\nwidth: ' + this.width
                        + '\nheight: ' + this.height
                        + '\ntotalHeight: ' + this.totalHeight()
                        + '\ntotalHeight with Margin: ' + this.totalHeight(true)
                        + '\ntotalWidth: ' + this.totalWidth()
                        + '\ntotalWidth with Margin: ' + this.totalWidth(true);
                }

            };
        }

        return undefined;
    };

    /*
     * Moreactions Flyout menus, select the div which contains the flyout contents that you want to assign
     *
    */
    $.fn.moreActions = function (trigger, options) {
        if ($.isUndefined(this.each)) {
            return;
        }

        //helper function to calculate flyout position
        function calculateFlyoutPosition(clickContext, flyoutContext, leftAlign) {
            var left, top;
            var pos = clickContext.position();
            var clickContextLayout = clickContext.layout();
            var contextLayout = flyoutContext.layout();

            top = pos.top + clickContext.height() + clickContextLayout.padding.top + clickContextLayout.margin.bottom + clickContextLayout.margin.top + clickContextLayout.border.bottom + clickContextLayout.border.top;

            if (leftAlign) {
                left = pos.left + clickContextLayout.padding.left;
            } else {
                left = (pos.left - flyoutContext.width() - contextLayout.padding.left - contextLayout.border.left) + clickContext.width() + clickContextLayout.margin.right + clickContextLayout.padding.right + clickContextLayout.border.right + 3;
            }

            return { "left": left, "top": top };
        }

        return this.each(function (i) {
            var context = $(this);
            var triggerContext = trigger;
            if ($.isUndefined(triggerContext.each)) {
                triggerContext = $((trigger.substr(0, 1) === '#' ? '' : '#') + trigger);
            }
            var opts = $.extend({}, $.fn.moreActions.defaults, options);

            context.data('moreactions_trigger', triggerContext)
                .data('moreactions_options', opts)
                .addClass(opts.isApplyFilter ? 'moreactions_applyfilter_content' : 'moreactions_content')
                .hide();

            // keep a store of moreactions
            $.fn.moreActions.cache.push({ trigger: triggerContext, options: context });

            triggerContext.addClass('link')
                .data('moreactions_menu', context)
                .attr('title', 'Click here to see more options')
                .click(function (event) {
                    var clickContext = $(this);
                    clickContext.data('title', context.attr('title') || '').attr('title', 'Click here to hide options');

                    if (context.is(':visible')) {
                        $.fn.moreActions.hide(event);
                        return;
                    }

                    // close all open moreactions
                    $.each($.fn.moreActions.cache, function (index, moreaction) {
                        if (moreaction.options.is(':visible') && moreaction.options.data('moreactions_options').oneOnly === true) {
                            moreaction.trigger.click();
                        }
                    });

                    var pos = clickContext.position();
                    var contextLayout = context.layout();

                    if (opts.setWidth) {
                        context.width((clickContext.width() - contextLayout.padding.left - contextLayout.padding.right - contextLayout.border.left - contextLayout.border.right));
                    }

                    var contextLayoutNewPosistion = calculateFlyoutPosition(clickContext, context, opts.align === 'left');

                    context.css({ 'left': contextLayoutNewPosistion.left + 'px', 'top': contextLayoutNewPosistion.top + 'px' }).slideDown(Guyu.slideDuration, function () {
                        // scroll menu into view if off bottom of page
                        var windowHeight = $(window).height(),
                            scrollBottom = windowHeight + $(document).scrollTop(),
                            popupHeight = $(this).height();

                        if ((context.offset().top + popupHeight) >= scrollBottom) {
                            var scrollTop = (parseInt(pos.top, 10) + popupHeight + clickContext.height() + 10) - windowHeight;
                            window.scrollTo(parseInt(pos.left, 10), scrollTop < 0 ? 0 : scrollTop);
                        }
                    });

                    event.stopPropagation();
                    event.preventDefault();
                    $(document.body).bind("click.moreactions", $.fn.moreActions.hide);
                    context.bind("click.moreactions", $.fn.moreActions.hide);
                });
        });
    };
    $.fn.moreActions.cache = [];
    $.fn.moreActions.hide = function (event) {
        var context = $(this);

        // validate context
        if (!$.isUndefined(context.data('moreactions_menu'))) { // event fired by trigger
        } else if (!$.isUndefined(context.data('moreactions_trigger'))) { // event fired by/within menu
            if ($(event.target).is(':not(input:image, span.link)')) {
                event.stopPropagation();
                return;
            }
        } else { // fired by something else (body, input)
        }

        $('.moreactions_content:visible, .moreactions_applyfilter_content:visible')
            .slideUp(Guyu.slideDuration, function () {
                $(this).data('moreactions_trigger').attr('title', 'Click here to show options');
            })
            .unbind("click.moreactions")
            .attr('title', '');
        $(document.body).unbind("click.moreactions");
    };
    $.fn.moreActions.defaults = {
        className: 'moreactions_content',
        setWidth: true,
        ignoreInputClicks: true,
        isApplyFilter: false,
        align: 'right',
        oneOnly: true // set to false if you want the moreaction to stay open while another is open
    };
    $.fn.moreActions.createGroupHeader = function (description) {
        return $(document.createElement('div'))
            .addClass('moreactions_group')
            .append($(document.createElement('div')).addClass('moreactions_group_header label').html(description));
    };
    $.fn.moreActions.createGroupFooter = function () {
        return '<div class="moreactions_groupfooter"></div>';
    };
    $.fn.moreActions.createGroupItem = function (description, moreAction, tooltip, hidden) {
        if ($.isUndefined(hidden)) hidden = false;

        var div = $(document.createElement('div')).addClass('moreactions_group_item').attr('id', moreAction).toggle(!hidden),
            span = $(document.createElement('span')).addClass('link').data('moreAction', moreAction).html(description);

        if (!$.isUndefined(tooltip)) {
            span.attr('title', tooltip);
        }
        div.append(span);
        return div;
    };
    $.fn.moreActions.createGroupItemLink = function (description, url, tooltip) {
        var div = $(document.createElement('div')).addClass('moreactions_group_item'),
            link = $(document.createElement('a'))
                .addClass('link')
                .attr({ href: Guyu.rootUrl(url), target: '_blank' })
                .html(description)
                .appendTo(div);
        if (tooltip) {
            link.attr('title', tooltip);
        }
        return div;
    };
    $.fn.moreActions.createSmallTrigger = function (id, title) {
        return $(document.createElement('img')).attr({ id: id, title: title, alt: '', src: baseImageUrl() + 'button_moreactions_small' + Guyu.browser.imageExtension() });
    };
    $.fn.moreActions.createSmallTriggerButton = function (id, name, title, cssClass, actionWidth, actionHeight) {
        var button = $(document.createElement('button')).attr({ id: id, title: title, onclick: 'return false;' }).addClass('btn').addClass('btn-default');
        if (cssClass) {
            button.addClass(cssClass);
        }
        if (actionWidth) {
            button.attr('action-width', actionWidth);
        }
        if (actionHeight) {
            button.attr('action-height', actionHeight);
        }
        button.html(name + ' <span class="caret"></span>');
        return button;
    };

    $.fn.setCursorPosition = function (pos, endPos) {

        var start = pos || 0;
        if (isNaN(start)) {
            start = 0;
        }
        var end = endPos || pos;
        if (isNaN(end) || end < start) {
            end = start;
        }

        return this.each(function () {
            if (this.setSelectionRange) {
                this.focus();
                try { this.setSelectionRange(start, end); }
                catch (e) { } //Firefox bombs when this is unattached to DOM or not shown
            } else if (this.createTextRange) {
                try {
                    this.focus();
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', start);
                    range.moveEnd('character', end);
                    range.select();
                }
                catch (e) { } // IE6&7 are bombing on .focus()
            }
        });
    };

    /*  Creates a Tree Expand/Collapse menu for the Panel View layout Left contents
        options { 
            storageKey: string, (when value set will store current selection in browser session storage as {storageKey}.panelLeftTree)
            selected : function () {} (triggered when item is clicked),
            expand : 'off' (default, all will be collapsed) | 'single' (will expand if only single group) | 'on' (will expand first grouping)
        } 
        
        Expected html to be laid out in;
        <h3>Heading</h3>
        <ul>
            <li data-src="{url}">Item</li>
        </ul>

        useage : $('#id').panelLeftTree({ 
            storageKey: 'somepage',
            selected: function () { } 
        })
    */

    $.fn.panelLeftTree = function (options) {

        var settings = $.extend({ storageKey: undefined, selected: $.noop, expand: 'off' }, options),
            $expand = $('<span/>').addClass(Guyu.browser.spriteCssClass()).addClass('tree_expand button_expand_enabled'),
            storageEnabled = settings.storageKey && window.Modernizr && window.Modernizr.sessionstorage && Modernizr.json,
            lastSelection;

        if (storageEnabled) {
            settings.storageKey = settings.storageKey + window.location.href + '.panelLeftTree';
            lastSelection = $.parseJSON(window.sessionStorage.getItem(settings.storageKey));
        }

        return this.each(function () {

            var $this = $(this),
                panelSelected = $('#panel_selected');

            function setSelectedPointer() {

                panelSelected.hide();

                // dont show when all collapsed
                if ($('.tree_group_content:visible').length === 0) {
                    return;
                }

                var $li = $this.find('ul li.rowselected:visible:first');

                if ($li.length === 0) {
                    return;
                }

                var panelLeft = $('#panel_left'),
                    offset = (panelLeft.outerWidth() - $li.outerWidth()) / 2;

                panelSelected.show().parent().show().position({
                    of: $li,
                    my: 'left top',
                    at: 'right top',
                    offset: offset.toString() + ' 2'
                });
            }

            var headings = $this.hide().addClass('panel_left_tree').children('h3');

            headings.each(function () {

                var $h3 = $(this).addClass('strong link tree_group'),
                    $expander = $expand.clone(),
                    header = $('<span class="tree_header"/>').text($h3.text());

                $h3.empty().append($expander).append(header);

                var $ul = $h3.next('ul').addClass('tree_group_content');

                $ul.children().addClass('small').each(function () {

                    var $li = $(this).addClass('link').click(function () {

                        $('#page_error').removePageError();
                        $this.children('ul').children('.rowselected').removeClass('rowselected');
                        $li.addClass('rowselected');

                        setSelectedPointer();

                        if (storageEnabled) {
                            window.sessionStorage.setItem(settings.storageKey, window.JSON.stringify({
                                group: $h3.text(),
                                item: $li.data().src
                            }));
                        }

                        settings.selected.call(this);
                    });

                    $('<span class="small linkcolour"/>').text($li.text()).appendTo($li.empty());

                    if (lastSelection && !lastSelection.$expander && $h3.text() === lastSelection.group && $li.data().src === lastSelection.item) {
                        lastSelection.$expander = $expander;
                        lastSelection.$ul = $ul;
                        lastSelection.$li = $li;
                    }

                });

                $h3.click(function () {
                    $expander.toggleClass('button_expand_enabled button_collapse_enabled');
                    $ul.slideToggle(Guyu.slideDuration, setSelectedPointer);
                });

            });

            $this.show();

            if (lastSelection && lastSelection.$expander) {
                lastSelection.$expander.toggleClass('button_expand_enabled button_collapse_enabled');
                lastSelection.$ul.show();
                lastSelection.$li.click();
            } else if (settings.expand === 'single' && headings.length === 1) {

                headings.first().click();

            }

        });



    };

    $.fn.loadingImage = function (options) {

        var settings = $.extend({ message: '' }, options);

        return this.each(function () {
            Guyu.loadingImage.clone().append(settings.message).appendTo($(this));
        });

    };

    $(document).ready(function () {
        $('div.required').required();

        Guyu.Glossary.apply();

        // error handler and view model errors
        var errorMessage = '',
            viewModelErrors = $.extend({}, { viewModelErrors: [] }, window.pageOptions).viewModelErrors,
            pageErrors = $.extend({}, { pageErrors: [] }, window.pageOptions).pageErrors;
        try {
            if (!$.isUndefined(pageOptions) && !$.isUndefined(pageOptions.errorMessage)) {
                errorMessage = pageOptions.errorMessage;
            }
        } catch (e) { }

        if (errorMessage || viewModelErrors.length > 0 || pageErrors.length > 0) {
            var element = $('#page_error');
            if (element.length === 0) {
                element = $('#content');
                if (element.length === 0) {
                    element = $(document.createElement('div'));
                    $(document.body).append(element);
                }
            }

            if (errorMessage) {
                element.showPageError(errorMessage, { append: true });
            }

            $.each(pageErrors, function () {
                element.showPageError(this, { append: true });
            });

            if (viewModelErrors.length > 0) {
                element.showPageError('Validation errors', { append: true });

                $.each(viewModelErrors, function () {
                    var ctrl = $('input[name="' + this.Name + '"]:first, select[name="' + this.Name + '"]:first, textbox[name="' + this.Name + '"]:first');
                    if (ctrl.length === 0 || (ctrl.is(':hidden:not(:Guyuautocompleternotinitialised):not(:Guyuautocompleter)'))) {
                        element.showPageError(this.Error, { append: true });
                    } else {
                        if (ctrl.is(':Guyuautocompleternotinitialised')) {
                            ctrl.closest('.Guyuautocompleter_notinitialised').data('error', this.Error); /* let the autocompleter initialise display the error */
                        } else if (ctrl.is(':Guyuautocompleter')) {
                            ctrl.closest('.Guyuautocompleter').Guyuautcompleter('addError', this.Error);
                        } else {
                            ctrl.addError(this.Error);
                        }
                    }
                });
            }
        }

        $('#optimised').click(function () {
            Guyu.LightBox.showPage('/so-tools.asp', { showOk: true, width: 600, height: 450 });
        });

        // resize iframe 
        if (Guyu.browser.isMobileDevice() && !$.isUndefined(window.parent) && !$.isUndefined(window.parent.Guyu) && window.parent.Guyu.LightBox.isVisible()) {
            window.parent.Guyu.LightBox.setMobileHeight();
        }

    });

    // to work reliably, window load needs to be outside document.ready
    // withing ready() the event was not firing in IE within iframes
    // remove google toolbar background colour fillers

    var loaded = function () {
        // do a quick remove, so if google is quick we remove it before it actually shows
        /*        
                var inputs = $('.data_entry').find('input, select').not('.Guyu_colorpicker').css('background-color','');
                // do a timedout remove as well to catch googel reappying
                window.setTimeout(function () {
                    inputs.css('background-color','');   
                }, 1000);
        
        */

        // callback event for lightbox after show
        if (window.location.href.indexOf('lightbox=yes') > -1
            && window.parent
            && window.parent.Guyu
            && window.parent.Guyu.LightBox) {
            window.parent.Guyu.LightBox.afterShow();
            if (window.parent
                && window.parent.Guyu
                && window.parent.Guyu.LightBox) {
                window.parent.Guyu.LightBox.loaded = true;
            }
        }
    }

    if (!$('html').is('.sol-vnext.lightbox')) {
        $(window).load(loaded);
    }

})(jQuery);

/*Global Variables*/
if (typeof Guyu.Globals === "undefined") {
    Guyu.Globals = {};
}
jQuery.extend(Guyu.Globals, {
    timeAny: '(any)',

    timesJSON:
    function (options) {
        var opts = $.extend({ includeAny: true }, $.fn.times.defaults, options);
        var times = [];

        if (opts.includeAny === true) {
            times.push({ Time: Guyu.Globals.timeAny, IsAny: true });
        }
        for (var count = 0; count < 24; count++) {
            times.push({ Time: Guyu.formatTime(count + ':00'), IsAny: false });
            times.push({ Time: Guyu.formatTime(count + ':30'), IsAny: false });
        }
        return times;
    },

    monthsJSON: {
        'MonthsRs': [{ 'index': 1, 'display': 'January' }, { 'index': 2, 'display': 'February' }, { 'index': 3, 'display': 'March' }, { 'index': 4, 'display': 'April' },
        { 'index': 5, 'display': 'May' }, { 'index': 6, 'display': 'June' }, { 'index': 7, 'display': 'July' }, { 'index': 8, 'display': 'August' },
        { 'index': 9, 'display': 'September' }, { 'index': 10, 'display': 'October' }, { 'index': 11, 'display': 'November' }, { 'index': 12, 'display': 'December' }]
    },

    objectType: {
        booking: 'oBooking',
        bookingClone: 'oBookingClone',
        customBooking: 'oCustomBooking',
        quickBooking: 'oQB',
        reporting: 'oReporting',
        userProfile: 'oUserProfile',
        databaseAdministration: 'oDatabaseAdministration',
        siteBuild: 'siteBuild'
    },

    bookingType: {
        travelAgency: 'Travel Agency',
        quickBooking: 'Web QB',
        customBooking: 'Custom Booking',
        travelAgencyTakeover: 'TA Takeover',
        noBooking: 'No Booking',
        consultant: 'Consultant Version',
        groupBooking: 'Group Booking',
        groupBookingTa: 'Group Booking Takeover'
    },

    quickBookingEngine: {
        quickBookingWizard: 'Quick Booking Wizard',
        rapidBooking: 'Rapid Booking'
    },

    crs: {
        galileo: 1,
        sabre: 2,
        amadeus: 3,
        abacus: 4,
        wbsamadeus: 5,
        getName: function (crsId) {
            return ["Galileo", "Sabre", "Amadeus", "Abacus", "WbsAmadeus"][crsId - 1];
        }
    },

    siProviders: {
        sabre: 'Sabre',
        theHotelNetwork: 'TheHotelNetwork',
        lido: 'Lido',
        expedia: 'Expedia',
        quickbeds: 'Quickbeds',
        wotif: 'Wotif',
        expediaCom: 'ExpediaCom',
        bookingCom: 'BookingCom',
        aot: 'AOT',
        virginBlue: 'VirginBlue',
        virginAustralia: 'VirginAustralia',
        jetStar: 'Jetstar',
        rex: 'Rex',
        hotelHub: 'HotelHub',
        isApiProvider: function (providerName) {
            return providerName && providerName !== 'Offline' && providerName !== 'Online' && providerName !== this.sabre;
        },
        isGdsProvider: function (providerName) {
            return !providerName || providerName === this.sabre || providerName === 'Online';
        },
        newGenerationProviders: function () {
            return [this.aot, this.theHotelNetwork, this.lido, this.expedia, this.wotif, this.expediaCom, this.quickbeds, this.bookingCom, this.hotelHub];
        },
        isNewGenerationProvider: function (providerName) {
            return $.inArray(providerName, this.newGenerationProviders()) > -1;
        }
    },

    isBookingTypeModifiable: function () {
        return !$.isUndefined(Guyu.PageState.bookingType)
            && (Guyu.PageState.bookingType === Guyu.Globals.bookingType.quickBooking
                || Guyu.PageState.bookingType === Guyu.Globals.bookingType.groupBooking);
    },

    isHotelModifiable: function (hotel) {
        return hotel.ProviderName === 'Online'
            || (hotel.ProviderName === 'Offline'
                && Guyu.PageState.mainObjectType === Guyu.Globals.objectType.quickBooking)
            || Guyu.Globals.siProviders.isApiProvider(hotel.ProviderName);
    },

    objectTypeDescription: function (objectType) {
        switch (objectType) {
            case Guyu.Globals.objectType.quickBooking:
                return 'booking';
            case Guyu.Globals.objectType.userProfile:
                return 'profile';
            case Guyu.Globals.objectType.customBooking:
                return 'custom booking';
            default:
                return 'UNKNOWN';
        }
    },

    cityValueOptions: [
        new Guyu.DropDowns.DisplayOption('CD_sCity_Desc', null, null),
        new Guyu.DropDowns.DisplayOption('CD_sCity', ' (', ')')
    ],

    constants: {
        updateResults: {
            lastSeatFailed: { value: 20, text: 'At least one Flight, Car, or Hotel Room cannot be booked, see below for reason.' },
            passportExpired: { value: 21, text: 'At least one passport entered has expired or will expire within six months of travel.' },
            tooManyPassports: { value: 22, text: 'Only one passport may be entered for each traveller on this trip.' },
            conflictMileage: { value: 23, text: 'Your Guyu Profile contains more than one Frequent Flyer program that can be used for this booking. To select your preferred program for this booking click the ‘No’ button.' },
            pnrDidNotEnd: { value: 24, text: 'Unable to end the Booking.' },
            pnrNotCreated: { value: 25, text: 'Unable to create the Booking.' },
            bookingNotCreated: { value: 26, text: 'Unable to create the Booking.' },
            pnrFoundDoesntMatch: { value: 27, text: 'The Booking reference does not match.' },
            submitInProgress: { value: 28, text: 'This booking has already been submitted.' },
            storedProcedureFailed: { value: 29, text: 'Copying to a Booking failed.' },
            removalOfPreferences: { value: 30, text: 'Failed to remove existing Preferences.' },
            removalOfSegments: { value: 31, text: 'Failed to remove existing segments.' },
            noConsultantSelected: { value: 32, text: 'No Consultant has been selected.' },
            noTicketerSelected: { value: 33, text: 'No Ticketer has been selected.' },
            noAuthoriserSelected: { value: 34, text: 'No Authoriser has been selected.' },
            nameOnCardDifferent: { value: 35, text: 'The Payment details for this booking are incorrect.' },
            noFareAvailable: { value: 36, text: 'There was a problem booking the selected fare - please contact your Travel Management Company.' },
            seatSellFailed: { value: 37, text: 'There has been a problem Submitting the Booking.' },
            checkFlightConnectionTimes: { value: 38, text: 'One of the flights selected is within the minimum recommended connecting time.<br/>Please refer to the sector information below.<br/>Click Finish to override this warning and continue with the booking.' },
            checkFlightOrdering: { value: 39, text: 'The flight continuity is not correct.' },
            updatePnrWithBookingId: { value: 40, text: 'Unable to Update the PNR with the Booking Number.' },
            conflictMeal: { value: 41, text: 'A Meal conflict has been detected.' },
            siError: { value: 42, text: 'Unable to complete the Booking.' },
            siPaymentError: { value: 422, text: 'Your payment has been rejected by the supplier.' },
            deadlockTimeout: { value: 43, text: 'The booking failed to submit – please try again.' },
            pnrNotUpdated: { value: 44, text: 'The PNR could not be updated.' },
            frequentFlyerInvalid: { value: 45, text: 'One of the frequent flyer numbers is incorrect.' },
            cardHolderNameInvalid: { value: 46, text: 'Booking failed due to invalid name on credit card.<br/>Click \'Finish\' to use the travellers names as the credit card name on card.' },
            destinationCodeInvalid: { value: 47, text: 'No Destination has been selected, please press \'Ctrl\' + \'F5\' to refresh then click \'Finish\'.' },
            toleranceAmount: { value: 1050, text: 'There has been a difference in the fare quoted to what can be booked.' },
            creditCardRequired: { value: 51, text: 'You are required to have a credit card for this booking, please add one through \'Additional Details\'.' },
            toleranceRate: { value: 1056, text: 'There has been a increase in the rate quoted to what can be booked.' },
            cannotCancelLand: { value: 57, text: 'Unable to cancel segment because a voucher has already been issued.<br/>Please contact your Travel Management Company for assistance.' },
            noPassenger: { value: 103, text: 'No passenger was uploaded to PNR.<br/>Please contact your Travel Management Company for assistance.' },
            internalError: { value: 105, text: 'The booking failed to submit – please try again.' },
            InvalidOrderNumber: { value: 115, text: 'Invalid Order Number.' },
            MissingRequiredCustomFields: { value: 116, text: 'Invalid Custom Fields. Please refresh this page.' },
            specialDetailsInvalid: { value: 1058, text: 'The special instructions can not be sent.' },
            roomOnRequestOnly: { value: 1060, text: 'The requested room is not available.' },
            roomSoldOut: { value: 1061, text: 'The requested room is not available.' },
            siSessionInactive: { value: 58, text: 'Provider Session Inactive.' },
            NoFopinPnr: { value: 59, text: 'We are unable to complete your booking due to a problem with the payment details.  Please contact your Travel Management Company.' },
            InvalidAidaCredentialsMessage: { value: 10062, text: 'Invalid AIDA card credentials. Please contact your Travel Management Company.' },
            HotelNeedDeposit: { value: 10063, text: 'The hotel need you to pay deposit to finish the booking and you will be charged immediately.' },
            DeleteItineraryFailed: { value: 5001, text: 'We are unable to cancel the itinerary due to an error.<br/>Please contact your Travel Management Company for assistance.' },
            BookFailedWithPartsucceed: { value: 61, text: 'A problem has occurred while completing your booking. Do not cancel as payment may have been processed.<br/> Place the booking on hold and contact your Travel Management Company.' }
        },

        displayMessage: function (constantClassName, constantId, additionalMessage, options) {
            if ($.isUndefined(additionalMessage)) {
                additionalMessage = '';
            }
            var constants = Guyu.Globals.constants[constantClassName],
                constantId = parseInt(constantId, 10);

            for (var name in constants) {
                var constant = constants[name];
                if (!constant || constant.value !== constantId) {
                    continue;
                }

                var error = $('<div></div>')
                    .append('<div class="float_left">' + constant.text + '</div>');

                $('#page_error').showPageError(error, options);

                if (additionalMessage.length > 0) {
                    $(document.createElement('img'))
                        .attr('src', '/SOLV2/Images/transparent.gif')
                        .addClass(Guyu.browser.spriteCssClass())
                        .addClass('information icon_help')
                        .appendTo(error)
                        .toolTip(additionalMessage, { width: 600, heading: 'Additional Information' });
                }

                error.append(Guyu.clearFloat);

                return;
            }

            $('#page_error').showPageError(additionalMessage, options);
        },

        changeDate: {
            departing: { value: 0, text: 'Changing the Departing Flight.' },
            returning: { value: 1, text: 'Changing the Returning Flight.' },
            moveTrip: { value: 2, text: 'Changing both Departing and Returning Flights.' }
        },

        policyType: {
            quickTrip: { value: 0, text: 'Air, Car and Hotel.' },
            hotel: { value: 1, text: 'Hotel Only' },
            car: { value: 2, text: 'Car Only' },
            air: { value: 3, text: 'Air Only' },
            land: { value: 4, text: 'Land Only' }
        },
        defaultTripMadeUpOf: {
            airOnly: { value: 0, text: 'Air Only' },
            airAndCar: { value: 1, text: 'Air and Car' },
            airCarHotel: { value: 2, text: 'Air,Car,Hotel' },
            airAndHotel: { value: 3, text: 'Air and Hotel' }
        },

        segmentType: {
            air: { value: 0, text: 'Air' },
            car: { value: 2, text: 'Car' },
            hotel: { value: 1, text: 'Hotel' }
        },

        car: {
            rateTypes: {
                daily: { value: 'D', text: 'Daily' },
                weekly: { value: 'W', text: 'Weekly' },
                monthly: { value: 'M', text: 'Monthly' },
                yearly: { value: 'Y', text: 'Yearly' },
                prepaid: { value: 'P', text: 'Prepaid' },
                weekendE: { value: 'E', text: 'Weekend' },
                weekendK: { value: 'K', text: 'Weekend' }
            },

            getRateType: function (rateTypeCode) {
                for (var value in Guyu.Globals.constants.car.rateTypes) {
                    if (Guyu.Globals.constants.car.rateTypes[value].value.toLowerCase() === rateTypeCode.toLowerCase()) {
                        return Guyu.Globals.constants.car.rateTypes[value];
                    }
                }
                return { value: 'Unknown', text: rateTypeCode };
            }

        },

        airBreakPolicyReasons: {
            defaultBooking: 0,
            booking: 1,
            sector: 2
        }
    }
});
/*End Global Variabled*/

jQuery.extend(Guyu, {
    WaitWindow: {

        context: {
            airAvailability: 'AirAvailability',
            carAvailability: 'CarAvailability',
            hotelAvailability: 'HotelAvailability',
            cloneBooking: 'CloneBooking',
            site: 'Site',
            groupBooking: 'GroupBooking',
            configurationReport: 'ConfigurationReport'
        },

        isVisible: function () {
            if (!Guyu.LightBox.isVisible() || Guyu.LightBox.currentShowMode !== Guyu.LightBox.showMode.page) {
                return false;
            }

            return (/\/web\/wait/i).test(Guyu.LightBox.currentFrame().location.pathname);
        },

        show: function (title, message, context, lightBoxOptions, options) {
            return new Guyu.Promise(function (resolve, reject) {
                var params = [
                    { name: 'title', value: title },
                    { name: 'message', value: message },
                    { name: 'context', value: context }];

                var opts = $.extend({}, {
                    params: params,
                    width: 452,
                    height: 390,
                    showButtons: false,
                    showLoading: false,
                    afterShow: function () {
                        if (lightBoxOptions && lightBoxOptions.afterShow) {
                            lightBoxOptions.afterShow.apply(this, arguments);
                        }
                        resolve();
                    }
                }, lightBoxOptions);

                Guyu.WaitWindow.options = $.extend({}, { start: true }, options);

                var url = $('html').hasClass('featureflag-hotelui') ? '/Web/Wait' : 'wait.asp';
                Guyu.LightBox.showPage(url, opts);

            });
        },

        hide: function () {
            Guyu.WaitWindow.options = {};

            if (!$.isUndefined(Guyu.LightBox.currentFrame()) && !$.isUndefined(Guyu.LightBox.currentFrame().stopProgressbar)) {
                Guyu.LightBox.currentFrame().stopProgressbar();
            };
            Guyu.LightBox.hide();
        },

        stop: function () {
            if (Guyu.WaitWindow.isVisible()) {
                Guyu.LightBox.currentFrame().stopProgressbar();
            }
        },

        reset: function () {
            if (Guyu.WaitWindow.isVisible()) {
                Guyu.LightBox.currentFrame().resetProgressbar();
            }
        },

        update: function (options) {
            if (Guyu.WaitWindow.isVisible()) {
                Guyu.LightBox.currentFrame().updateProgressbar(options);
            }
        }
    }
});


jQuery.extend(Guyu, {
    PolicyDetailsWindow: {
        show: function (stage, policyName, comment, reason, information, disabledReason, segmentType) {
            var url = '/crsdetail.asp?stage=' + stage + '&dettype=PolicyDetail&policyName=' + escape(policyName) + '&reason=' + escape(reason.formatAsHtml()) + '&information=' + escape(information.formatAsHtml());
            Guyu.LightBox.showPage(url, {
                showClose: true,
                afterShow: function () {
                    this.currentFrame().afterShow(comment.formatAsHtml(), [], disabledReason, segmentType);
                }
            });
        }
    }
});

jQuery.extend(Guyu, {
    CrsDetailsWindow: {

        displayTypes: {
            Air: 'AIR',
            Car: 'CAR',
            Hotel: 'HOTEL',
            HotelRate: 'HOTELRATE',
            Fare: 'FARE',
            AirTicket: 'AIRTICKET',
            HotelCancellationPolicy: 'HOTELCANCELATION',
            HotelCancelaltionPolicy: 'HOTELCANCELATION'/*ToDo: Retire when safe*/,
            CarRules: 'CARRULES',
            BookingCancellationPolicy: 'BOOKINGCANCELLATION'
        },

        show: function (parameters, lightBoxOptions) {

            /* disable buttons until form has loaded details from external source */
            var buttons = [];
            for (var name in lightBoxOptions) {
                if (name.startsWith('show')) {
                    lightBoxOptions[name] = false;
                    buttons.push('button' + name.substr(4));
                }
            }

            var opts = $.extend({
                width: 400,
                enableAfterShow: false,
                afterShow: function () {
                    this.currentFrame().afterShow('', buttons);
                }
            }, lightBoxOptions);

            var params = $.extend({
                stage: 0,
                displayType: '',
                bookingId: -1,
                segmentId: -1,
                isSectorFare: true,
                acceptFareRules: false,
                airSegmentId: -1,
                segmentNumber: -1,
                breakPolicy: false,
                providerName: '',
                specialRequest: false,
                rateCode: '',
                rateCategory: '',
                showRateCode: true
            }, parameters);

            var url = '/crsdetail.asp?stage=' + params.stage + '&dettype=' + params.displayType + '&bookid=' + params.bookingId + '&qbid=' + params.quickBookingId + '&segid=' + params.segmentId + '&sectorfare=' + params.isSectorFare + '&acceptfarerules=' + params.acceptFareRules + '&airsegmentid=' + params.airSegmentId + '&segnumber=' + params.segmentNumber + '&breakpolicy=' + params.breakPolicy + '&providerName=' + params.providerName + '&specialRequest=' + params.specialRequest + '&rateCode=' + params.rateCode + '&rateCategory=' + params.rateCategory + '&showRateCode=' + params.showRateCode;
            Guyu.LightBox.showPage(url, opts);
        }
    }
});

/*Function written by a Third Party to validate Credit Card numbers*/
function checkCreditCard(cardnumber, cardname) {
    // Array to hold the permitted card characteristics
    var cards = [];

    cards[0] = {
        name: 'Visa',
        code: 'VI',
        length: '13,16',
        prefixes: '4',
        checkdigit: true
    };
    cards[1] = {
        name: 'MasterCard',
        code: 'CA',
        length: '16',
        prefixes: '51,52,53,54,55,22,23,24,25,26,27',
        checkdigit: true
    };
    cards[2] = {
        name: 'DinersClub',
        code: 'DC',
        length: '14,16',
        prefixes: '300,301,302,303,304,305,36,38,55',
        checkdigit: true
    };
    cards[3] = {
        name: 'CarteBlanche',
        code: 'N/A',
        length: '14',
        prefixes: '300,301,302,303,304,305,36,38',
        checkdigit: true
    };
    cards[4] = {
        name: 'AmEx',
        code: 'AX',
        length: '15',
        prefixes: '34,37',
        checkdigit: true
    };
    cards[5] = {
        name: 'Discover',
        code: 'N/A',
        length: '16',
        prefixes: '6011,650',
        checkdigit: true
    };
    cards[6] = {
        name: 'JCB',
        code: 'JC',
        length: '15,16',
        prefixes: '3,1800,2131',
        checkdigit: true
    };
    cards[7] = {
        name: 'enRoute',
        code: 'N/A',
        length: '15',
        prefixes: '2014,2149',
        checkdigit: true
    };
    cards[8] = {
        name: 'Solo',
        code: 'N/A',
        length: '16,18,19',
        prefixes: '6334, 6767',
        checkdigit: true
    };
    cards[9] = {
        name: 'Switch',
        code: 'N/A',
        length: '16,18,19',
        prefixes: '4903,4905,4911,4936,564182,633110,6333,6759',
        checkdigit: true
    };
    cards[10] = {
        name: 'Maestro',
        code: 'N/A',
        length: '16,18',
        prefixes: '5020,6',
        checkdigit: true
    };
    cards[11] = {
        name: 'VisaElectron',
        code: 'N/A',
        length: '16',
        prefixes: '417500,4917,4913',
        checkdigit: true
    };

    // Establish card type
    var cardType = -1;
    for (var i = 0; i < cards.length; i++) {

        // See if it is this card (ignoring the case of the string)
        if (cardname.toLowerCase() === cards[i].name.toLowerCase() || cardname.toLowerCase() === cards[i].code.toLowerCase()) {
            cardType = i;
            break;
        }
    }

    // If card type not found
    if (cardType === -1) {
        return true;
    }

    // Ensure that the user has provided a credit card number
    if (cardnumber.length === 0) {
        return false;
    }

    // Now remove any spaces from the credit card number
    cardnumber = cardnumber.replace(/\s/g, '');

    // Check that the number is numeric
    var cardNo = cardnumber;
    var cardexp = /^[0-9]{13,19}$/;
    if (!cardexp.exec(cardNo)) {
        return false;
    }

    // Now check the modulus 10 check digit - if required
    if (cards[cardType].checkdigit) {
        var checksum = 0;                                  // running checksum total
        var mychar = '';                                   // next char to process
        var j = 1;                                         // takes value of 1 or 2

        // Process each digit one by one starting at the right
        var calc;
        for (i = cardNo.length - 1; i >= 0; i--) {

            // Extract the next digit and multiply by 1 or 2 on alternative digits.
            calc = Number(cardNo.charAt(i)) * j;

            // If the result is in two digits add 1 to the checksum total
            if (calc > 9) {
                checksum = checksum + 1;
                calc = calc - 10;
            }

            // Add the units element to the checksum total
            checksum = checksum + calc;

            // Switch the value of j
            if (j == 1) {
                j = 2;
            } else {
                j = 1;
            };
        }

        // All done - if checksum is divisible by 10, it is a valid modulus 10.
        // If not, report an error.
        if (checksum % 10 !== 0) {
            return false;
        }
    }

    // The following are the card-specific checks we undertake.
    var LengthValid = false;
    var PrefixValid = false;
    var undefined;

    // We use these for holding the valid lengths and prefixes of a card type
    var prefix = new Array();
    var lengths = new Array();

    // Load an array with the valid prefixes for this card
    prefix = cards[cardType].prefixes.split(',');

    // Now see if any of them match what we have in the card number
    for (i = 0; i < prefix.length; i++) {
        var exp = new RegExp('^' + prefix[i]);
        if (exp.test(cardNo)) PrefixValid = true;
    }

    // If it isn't a valid prefix there's no point at looking at the length
    if (!PrefixValid) {
        return false;
    }

    // See if the length is valid for this card
    lengths = cards[cardType].length.split(',');
    for (j = 0; j < lengths.length; j++) {
        if (cardNo.length === parseInt(lengths[j], 10)) LengthValid = true;
    }

    // See if all is OK by seeing if the length was valid. We only check the 
    // length if all else was hunky dory.
    if (!LengthValid) {
        return false;
    };

    // The credit card is in the required format.
    return true;
}
/*Function above written by a Third Party to validate Credit Card numbers*/


/*
 * Extensions to the Javascript string class
 *
*/
jQuery.extend(String.prototype, {

    // e.g converts '#c4778a' to {r: 196, g: 119, b: 138}
    convertHexColorToRgb: function () {
        var rgb = {
            r: 0,
            g: 0,
            b: 0
        };

        var color = this.replace('#', '');
        if (color.length !== 6) {
            return rgb;
        }

        rgb.r = parseInt(color.substr(0, 2), 16);
        rgb.g = parseInt(color.substr(2, 2), 16);
        rgb.b = parseInt(color.substr(4, 2), 16);

        return rgb;
    },

    convertToFloat: function () {
        var number = (this + '').replace(/\$|,/gi, '');
        if (number.length === 0 || isNaN(number)) {
            return 0.00;
        }

        return parseFloat(number);
    },

    convertToInt: function () {
        var number = (this + '').replace(/\$|,/gi, '');
        if (number.length === 0 || isNaN(number)) {
            return 0;
        }

        return parseInt(number, 10);
    },

    /* format a number with commas,
     * pass in decimal places as first argument, optional will not format decimal places
     * pass in leading zeros as second argument, optional will not add leading zeros if omitted
     * pass in ommit comma as third argument
     */
    formatAsNumber: function () {
        var decimalPlaces = arguments.length === 0 ? -1 : arguments[0],
            leadingZeros = arguments[1],
            excludeComma = arguments[2];

        // private helper function to padd zeros
        function paddZeros(zerosToAdd) {
            var format = '';
            for (var i = 0; i < zerosToAdd; i++) {
                format += '0';
            }
            return format;
        };

        // helper function to format the decimal places
        function formatDecimalPlaces(value) {
            if (decimalPlaces === -1) {
                return value.length === 0 ? '' : '.' + value;
            } else if (decimalPlaces === 0) {
                return '';
            }

            // no more decimal places than required
            if (value.length === 0) {
                return '.' + paddZeros(decimalPlaces);
            }

            // more decimal places than required
            if (value.length > decimalPlaces) {
                var fixedPrecision = parseFloat('0.' + value).toFixed(decimalPlaces);
                return fixedPrecision.toString().substring(1);
            }

            return '.' + value + paddZeros(decimalPlaces - value.length);
        };

        function addLeadingZeros(value) {
            if ($.isUndefined(leadingZeros) || value.length >= leadingZeros) {
                return value;
            }
            return paddZeros(leadingZeros - value.length) + value;
        };

        var s = (this + '');
        // remove blanks   
        if (s.length) {
            s = s.replace(/ /g, '');
        }

        var x = s.split('.');
        var x1 = addLeadingZeros(x[0]);
        var x2Raw = x.length > 1 ? x[1] : '';
        var x2 = formatDecimalPlaces(x2Raw);

        if (parseInt(x2Raw.substring(decimalPlaces - 1, decimalPlaces), 10) > 5 && parseInt(x2.substring(1), 10) === 0) {
            x1++;
        }

        var rgx = /(\d+)(\d{3})/;
        if (!excludeComma) {
            while (rgx.test(x1)) {
                x1 = x1.toString().replace(rgx, '$1' + ',' + '$2');
            }
        }
        return x1 + x2;
    },

    formatAsCurrency: function () {
        var value = this.formatAsNumber.apply(this, arguments),
            currency = '',
            options = window.pageOptions || {};

        if (!value.length) {
            return '';
        }

        switch (options.currency || '') {
            case 'INR':
                currency = '<span class="WebRupee currency">Rs.</span>';
                break;
            case 'AED':
                currency = '<span class="WebAed currency">AED</span>';
                break;
            default:
                currency = '$';
        }

        return isNaN(value.replace(/,/g, '')) ? value : currency + value;
    },

    formatAsHtml: function () {
        return this.replace(/\n/g, '<br/>').replace(/\|\|/g, '<br/>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    },

    formatAsTime: function () {
        if (this.length === 0) {
            return '';
        }

        var defaultTime = Date.today().clearTime().toString(Guyu.timeFormat);
        var time = defaultTime;

        if (this.length > 2) {
            if (this.substr(1, 1) === '.' || this.substr(2, 1) === '.') {
                time = this.replace(/\./, ':');  // dont replace globally because only want to replace first occurence
            } else {
                time = this;
            }

            if (time.indexOf(':') === -1) {
                if (time.length === 4) {
                    time = time.substr(0, 2) + ':' + time.substr(2, 2);
                } else if (time.length === 3) {
                    time = time.substr(0, 1) + ':' + time.substr(1, 2);
                } else {
                    time = defaultTime;
                }
            } else {
                var parts = time.split(':');
                if (isNaN(parts[0]) || parts[1].length < 2 || isNaN(parts[1].substr(0, 2))) {
                    time = defaultTime;
                }
            }
        }
        return Date.parse(time).toString(Guyu.timeFormat);
    },

    formatAsFlyingTime: function (abbreviated) {
        var parts = this.split(':'),
            hours = abbreviated ? 'h ' : ' hour(s) and ',
            minutes = abbreviated ? 'm' : ' minute(s)';
        return parseInt(parts[0], 10) + hours + parseInt(parts[1], 10) + minutes;
    },

    blank: function () {
        return /^\s*$/.test(this);
    },

    padRight: function (length, char) {
        if (this.length > length) {
            return this;
        }

        var val = this;
        while (val.length < length) {
            val += char;
        }
        return val;
    },

    padLeft: function (length, char) {
        if (this.length > length) {
            return this;
        }

        var val = this;
        while (val.length < length) {
            val = char + val;
        }
        return val;
    },

    reformatCurrency: function () {
        var value = this;
        var currency = '';

        if ($.isUndefined(pageOptions.currency)) {
            pageOptions.currency = '';
        }

        switch (pageOptions.currency) {
            case 'INR':
                currency = '<span class="WebRupee">Rs.</span>';
                break;
            case 'AED':
                currency = '<span class="WebAed">AED</span>';
                break;
            default:
                return String(value);
        }

        return value.replace(/\x24/g, currency);
    },

    isNumeric: function () {
        var value = (this || '').replace(/,/g, '');
        return value.length > 0 && !isNaN(value);
    },

    removeDangerousCharForMvc: function () {
        return this.replace(/<|>/gim, ' ');
    }

});

jQuery.extend(Guyu, {

    /* Show the TravellerSearch screen 
     * 
     *  options (optional)
     *      surname         : (string) pass a preselected surname to run automatically, leave blank to allow user to enter criteria
     *      successCallback : (function (array of passengerId)) to run when user has selected one to many travellers and clicked Ok
     *      oneMode         : boolean - true, will show travellers as radio, false will show as checkbox
     *      disabledTravellers : array of passengerCodes which cant be selected (Already selected)
    */
    TravellerSearch: {
        travellers: [], // currently selected travellers
        options: undefined, // current options

        reset: function () {
            this.travellers = [];
            this.options = undefined;
        },

        save: function () {
            if (this.options && this.options.successCallback && $.isFunction(this.options.successCallback)) {
                this.options.successCallback.call(this, this.travellers);
            }

            this.reset();
        },

        show: function (options) {
            var self = this;

            self.reset();
            self.options = jQuery.extend({}, Guyu.TravellerSearch.defaults, options);

            Guyu.LightBox.showPage('/Web/TravellerSearch', {
                width: 900,
                height: Guyu.User.consultantVersion ? 480 : 415,
                params: [{ name: 'surname', value: self.options.surname },
                { name: 'oneMode', value: self.options.oneMode },
                { name: 'roleName', value: self.options.roleName },
                { name: 'passengerCount', value: self.options.passengerCount },
                { name: 'maxPassengerCount', value: self.options.maxPassengerCount },
                { name: 'consultantVersion', value: Guyu.User.consultantVersion },
                { name: 'showEnabledOnly', value: self.options.showEnabledOnly },
                { name: 'forBooking', value: self.options.forBooking },
                { name: 'ignoreList', value: self.options.ignoreList },
                { name: 'profileUserId', value: self.options.profileUserId }],
                showOk: true,
                showCancel: true,
                beforeHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return true;
                    }
                    if (buttonPressed === 'CreateTraveller') {
                        self.options.createTraveller.click();
                        return false;
                    }
                    if (!this.currentFrame().searchComplete_BeforeHide()) {
                        return false;
                    }

                    if (!$.isFunction(self.options.successCallback)) {
                        return true;
                    }

                    self.save();

                    return true;
                },
                customButtons: self.options.customButtons,
                orderButtons: self.options.orderButtons,
                afterShow: function () {
                    this.currentFrame().pageOptions.costCentreId = self.options.costCentreId;
                    this.currentFrame().disabledPassengerIds = self.options.disabledPassengerIds;
                }
            });
        },
        defaults: { surname: '', successCallback: null, oneMode: false, customButtons: [], orderButtons: [], createTraveller: $('#btn_create'), passengerCount: 0, roleName: '', maxPassengerCount: 0, disabledPassengerIds: [], bookingType: 0, showEnabledOnly: true, ignoreList: '', profileUserId: 0, forBooking: false }
    },

    TravellerCreate: {
        show: function (options) {
            var opts = jQuery.extend({}, Guyu.TravellerCreate.defaults, options);

            Guyu.LightBox.showPage('/so-qb-create-traveller.asp', {
                width: 450,
                height: 375,
                showOk: false,
                orderButtons: [Guyu.LightBox.createEventButton("Cancel", "btn-default", Guyu.LightBox.buttonType.Cancel),
                Guyu.LightBox.createEventButton("Confirm", "btn-success", Guyu.LightBox.buttonType.Add),
                Guyu.LightBox.createEventButton("Enable", "btn-default hidden enableButton", Guyu.LightBox.buttonType.Enable).hide(),
                Guyu.LightBox.createEventButton("Search", "btn-default hidden searchButton", Guyu.LightBox.buttonType.Search).hide()],
                beforeHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return true;
                    }
                    if (buttonPressed === Guyu.LightBox.buttonType.Search) {
                        opts.showTravellerSearchCallback.call(this, ($(this.currentFrame().document.body).find('#surname').val()));
                        return false;
                    }
                    return this.currentFrame().createTraveller_BeforeHide(buttonPressed);
                },
                afterHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return;
                    }
                    if (buttonPressed === Guyu.LightBox.buttonType.Save) {
                        return this.currentFrame().createTraveller_BeforeHide(buttonPressed);
                    }
                    opts.travellerCreatedCallback.call(this, this.currentFrame().getTraveller());
                },
                afterShow: function () {
                    this.currentFrame().pageOptions.costCentreId = opts.costCentreId;
                }
            });
        },
        defaults: { travellerCreatedCallback: function (traveller) { }, showTravellerSearchCallback: function (surname) { } }

    },

    /* Used to show user input message box to capture Date Of Births */
    TravellerSecureFlight: {

        /*
         * Show the Date Of Birth capture message box
         *    travellers: array of traveller objects
         *    updateTraveller: function which gets called for each traveller to update, (this) relates to the input box
         *    afterHideCallback: function that gets called after the message box is closed
         */
        show: function (travellers, updateTraveller, afterHideCallback) {

            var travellerDateOfBirths = $(document.createElement('div')).append('<p>The proposed itinerary for this booking requires the Date of Birth for each Traveller.</p>');
            var innerDiv = $(document.createElement('div')).addClass('data_entry').attr({ id: 'traveller_dateofbirths' });
            travellerDateOfBirths.append(innerDiv);

            $.each(travellers, function (travellerIndex, traveller) {
                var row = $(document.createElement('div')).addClass('row');
                innerDiv.append(row);

                row.append($(document.createElement('div')).addClass('cell label').html(traveller.PA_sPassenger_Name));//The server side set null to DateTime.MinValue which is '0001-01-01T00:00:00', so we need to have this check
                row.append($(document.createElement('div')).addClass('cell field').append(traveller.PA_dtDate_Birth !== null && traveller.PA_dtDate_Birth.toString().length > 0 && traveller.PA_dtDate_Birth.toString() !== '0001-01-01T00:00:00' ? ($.isFunction(traveller.PA_dtDate_Birth.getDate) ? traveller.PA_dtDate_Birth.toString(Guyu.dateFormat) : Date.parse(traveller.PA_dtDate_Birth).toString(Guyu.dateFormat)) : $(document.createElement('input')).attr({ type: 'text' }).addClass('select_date required').data('traveller', traveller)));
                row.append(Guyu.clearFloat);
            });
            travellerDateOfBirths.find('input:text').GuyuPastDatePicker();

            Guyu.LightBox.showMessageBox('Date of Birth', travellerDateOfBirths, {
                showOk: true, showCancel: true, width: 400, beforeHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return true;
                    }
                    var inputs = travellerDateOfBirths.find('input:text').removeError();
                    var invalids = inputs.filter(':blank').addError('');
                    if (invalids.length > 0) {
                        return false;
                    }

                    return true;
                }, afterHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return;
                    }

                    // singal traveller to update with the input box as the 'this' context
                    travellerDateOfBirths.find('input:text').each(updateTraveller);

                    afterHideCallback();
                }
            });


        }
    },

    /* Show the UserSearch screen 
     * 
     *  options (optional)
     *      surname         : (string) pass a preselected surname to run automatically, leave blank to allow user to enter criteria
     *      successCallback : (function (array of selected users)) to run when user has selected one to many travellers and clicked Ok
     *      oneMode         : boolean - true, will show travellers as radio, false will show as checkbox
     *      role            : string, (type of user to search for)
     *
     *      NOTE : In future may need to pass in the RoleName 
    */
    UserSearch: {
        show: function (options) {
            var opts = jQuery.extend({}, Guyu.UserSearch.defaults, options);

            Guyu.LightBox.showPage('/so-user-search.asp', {
                width: 590,
                height: 385,
                params: [{ name: 'surname', value: opts.surname },
                { name: 'oneMode', value: opts.oneMode },
                { name: 'roleName', value: opts.roleName },
                { name: 'level', value: opts.level },
                { name: 'multiTier', value: opts.multiTier }],
                showOk: true,
                showCancel: true,
                beforeHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) return true;
                    if (!this.currentFrame().searchComplete_BeforeHide()) return false;

                    if (!$.isFunction(opts.successCallback)) return true;

                    opts.successCallback.call(this, this.currentFrame().getSelectedItems());
                    return true;
                }
            });
        },
        defaults: { surname: '', successCallback: null, oneMode: false, roleName: 'User', level: '', multiTier: false }
    },

    /*
     * This loads the Order Number Search window
     */
    OrderNumberSearch: {
        show: function (optionTypeCode, options) {
            var opts = jQuery.extend({}, Guyu.OrderNumberSearch.defaults, options);
            if (!opts.costCentreId.toString()) {
                opts.costCentreId = 0;
            }

            Guyu.LightBox.showPage(
                '/so-order-number-search.asp',
                {
                    width: 850,
                    height: 400,
                    showOk: true,
                    showCancel: true,
                    params: [{ name: 'OptionTypeCode', value: optionTypeCode },
                    { name: 'oneMode', value: opts.oneMode },
                    { name: 'costCentreId', value: opts.costCentreId }],
                    beforeHide: function (buttonPressed) {
                        if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                            return true;
                        }
                        return this.currentFrame().returnSearchCode_BeforeHide();
                    },
                    afterHide: function (buttonPressed) {
                        if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                            return;
                        }

                        opts.orderSelectedCallback.call(this, this.currentFrame().getSelectedOrderNumber());
                    }
                });

        },
        defaults: { oneMode: true, costCentreId: 0, orderSelectedCallback: function (ordernumber) { } }
    },

    /*
     * This loads the Cost Centre Search window
     *  options (optional)
     *      successcallBack : (function (array of selected cost centres)) to run when user has selected one to many travellers and clicked Ok
     *      oneMode         : boolean - true, will show travellers as radio, false will show as checkbox
     *
     */

    CostCentreSearch: {
        show: function (options) {
            var opts = jQuery.extend({}, Guyu.CostCentreSearch.defaults, options);

            Guyu.LightBox.showPage('/web/admin/corporatesearch', {
                params: [
                    { name: 'bookingId', value: opts.bookingId },
                    { name: 'existingPassengerIds', value: opts.existingPassengerIds }
                ],
                width: 760,
                height: 570,
                showOk: true,
                showCancel: true,
                beforeHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return true;
                    }
                    if (!this.currentFrame().searchComplete_BeforeHide()) {
                        return false;
                    }
                    if (!$.isFunction(opts.successCallback)) {
                        return true;
                    }

                    opts.successCallback.call(this, this.currentFrame().getSelectedItems());
                    return true;
                }
            });
        },
        defaults: { successCallback: null, existingPassengerIds: '', bookingId: -1 }
    },
    land: {
        deleteItem: function (landId, confirmationNo, UpdateOnly, callback) {
            $.postJSON('/Web/Land/DeleteCarOrHotel',
                {
                    segmentId: landId,
                    confirmationNumber: confirmationNo,
                    updateOnly: UpdateOnly
                },
                function (json) {
                    $('#page_error').removePageError();
                    if (json.Exception.length !== 0) {
                        $('#page_error').showPageError(json.Exception, { json: json });
                    } else {
                        if (!$.isUndefined(callback)) {
                            callback.call(this, json);
                        }
                    }
                }
            );
        },
        create: function (landType, itineraryItem, callback, landId, bookingId) {
            $.postJSON('/SOLV2/AJAX/so-qb-land-functions.asp',
                {
                    'FunctionToRun': 'CreateLand',
                    'AirSegmentId': itineraryItem === undefined ? '' : itineraryItem.ID,
                    'BookingId': bookingId > 0 ? bookingId : 0,
                    'LandType': landType,
                    'LandId': $.isUndefined(landId) ? 0 : landId,
                    'IBIBooking': !$.isUndefined(Guyu.Cookies.getItem('ibiBooking'))
                },
                function (json) {
                    if (json.Exception.length !== 0) {
                        $('#page_error').showPageError(json.Exception, { json: json });
                        Guyu.WaitWindow.hide();
                    } else {
                        if ($.isFunction(callback)) {
                            callback.apply(this, arguments);
                        }
                    }
                });
        },

        /* options = {landType, itineraryItem, callback } */
        changeDates: function (options) {
            var startDate = Date.parse(options.landType === 'Hotel' ? options.itineraryItem.CheckInDate + ' ' + options.itineraryItem.CheckInTime : options.itineraryItem.PickUpDate + ' ' + options.itineraryItem.PickUpTime),
                endDate = Date.parse(options.landType === 'Hotel' ? options.itineraryItem.CheckOutDate + ' ' + options.itineraryItem.CheckOutTime : options.itineraryItem.DropOffDate + ' ' + options.itineraryItem.DropOffTime),
                start = $('<input/>')
                    .attr({ id: 'itinerary_land_changedates_start', type: 'text' })
                    .addClass('required'),
                startTime = $('<select/>')
                    .attr({ id: 'itinerary_land_changedates_starttime' })
                    .addClass('required search_time'),
                end = $('<input/>')
                    .attr({ id: 'itinerary_land_changedates_end', type: 'text' })
                    .addClass('required'),
                endTime = $('<select/>')
                    .attr({ id: 'itinerary_land_changedates_endtime' })
                    .addClass('required search_time'),
                content = $('<div/>')
                    .attr({ id: 'itinerary_land_changedates' })
                    .addClass('data_entry')
                    .append(
                    $('<div id="itinerary_land_page_error" class="page_error"/>')
                        .addClass('strong')
                    )
                    .append(
                    $('<div/>')
                        .addClass('strong')
                        .text('Current')
                    )
                    .append(
                    $('<div/>')
                        .addClass('row')
                        .append(
                        $('<div/>')
                            .addClass('cell label')
                            .text(options.landType === 'Hotel' ? 'Hotel' : 'Car Company')
                        )
                        .append(
                        $('<div/>')
                            .addClass('cell field')
                            .append(options.itineraryItem.SupplierName)
                        )
                        .append(Guyu.clearFloat)
                    )
                    .append(
                    $('<div/>')
                        .addClass('row')
                        .append(
                        $('<div id="itinerary_land_current_start_label"/>')
                            .addClass('cell label')
                            .text(options.landType === 'Hotel' ? 'Check-in' : 'Pick-up')
                        )
                        .append(
                        $('<div/>')
                            .addClass('cell field')
                            .append(startDate.toString(Guyu.dateTimeFormat()))
                        )
                        .append(Guyu.clearFloat)
                    )
                    .append(
                    $('<div/>')
                        .addClass('row')
                        .append(
                        $('<div id="itinerary_land_current_end_label"/>')
                            .addClass('cell label')
                            .text(options.landType === 'Hotel' ? 'Check-out' : 'Drop-off')
                        )
                        .append(
                        $('<div/>')
                            .addClass('cell field')
                            .append(endDate.toString(Guyu.dateTimeFormat()))
                        )
                        .append(Guyu.clearFloat)
                    )
                    .append(
                    $('<div/>')
                        .addClass('strong')
                        .text('Change to')
                    )
                    .append(
                    $('<div/>')
                        .addClass('row')
                        .append(
                        $('<div/>')
                            .addClass('cell label required')
                            .text(options.landType === 'Hotel' ? 'Check-in' : 'Pick-up')
                            .required()
                        )
                        .append(
                        $('<div/>')
                            .addClass('cell field')
                            .append(start)
                            .append(startTime)
                        )
                        .append(Guyu.clearFloat)
                    )
                    .append(
                    $('<div/>')
                        .addClass('row')
                        .append(
                        $('<div/>')
                            .addClass('cell label required')
                            .text(options.landType === 'Hotel' ? 'Check-out' : 'Drop-off')
                            .required()
                        )
                        .append(
                        $('<div/>')
                            .addClass('cell field')
                            .append(end)
                            .append(endTime)
                        )
                        .append(Guyu.clearFloat)
                    );

            if (options.itineraryItem.Status === 'Confirmed' && Guyu.Globals.siProviders.isApiProvider(options.itineraryItem.ProviderName)) {
                if (options.itineraryItem.ProviderName !== 'AOT' && options.itineraryItem.ProviderName !== 'BookingCom' && options.itineraryItem.ProviderName !== 'Lido') {
                    content.prepend($('<p/>').addClass('warning').text('Changing dates for this ' + options.landType + ' will be processed offline by ' + options.itineraryItem.ProviderPresentationName + ' and the ' + options.landType + ' booking will be changed to On Request'));
                }
            }

            Guyu.DropDowns.setAjaxRsOptions(startTime.get(0), 'Time', 'Time', Guyu.Globals.timesJSON({ includeAny: false }), function () {
                startTime.val(Guyu.formatTime(startDate));
            });
            Guyu.DropDowns.setAjaxRsOptions(endTime.get(0), 'Time', 'Time', Guyu.Globals.timesJSON({ includeAny: false }), function () {
                endTime.val(Guyu.formatTime(endDate));
            });

            Guyu.LightBox.showMessageBox('Change ' + options.landType + ' Dates', content, {
                width: 450,
                showOk: true,
                showCancel: true,
                beforeHide: function (buttonPressed) {
                    if (buttonPressed === Guyu.LightBox.buttonType.Cancel) {
                        return true;
                    }

                    $('#itinerary_land_page_error').removePageError();

                    if (Guyu.validateRequireds({ context: content }).length > 0) {
                        return false;
                    }

                    /* This required for IE, it seems to lose the values when accessed from within the light box */
                    var newStartDate = start.val(),
                        newEndDate = end.val(),
                        newStartTime = startTime.val(),
                        newEndTime = endTime.val(),
                        startDateTimeString = newStartDate + ' ' + newStartTime,
                        startDateTime = Date.parse(startDateTimeString),
                        endDateTime = Date.parse(newEndDate + ' ' + newEndTime);

                    if (endDateTime <= startDateTime) {
                        endTime.addError('');
                        end.addError('');
                        $('#itinerary_land_page_error').showPageError($('#itinerary_land_current_start_label').text() + ' is the or before ' + $('#itinerary_land_current_end_label').text(), { scroll: false });
                        return false;
                    }

                    // validate fulfillment times
                    var beforeHidePromise = new Guyu.Promise(function (resolveBeforeHide, rejectBeforeHide) {
                        var formattedStartDateTimeString = startDateTime.toString("yyyy-MM-dd HH:mm");
                        Guyu.validateLandDateLeadTime(options.landType, options.itineraryItem.ID, formattedStartDateTimeString)
                            .then(function () {
                                resolveBeforeHide(false);
                                Guyu.LightBox.showProcessingMessageBox('Processing ' + options.landType.toLowerCase() + ' date changes...', {
                                    afterShow: function () {
                                        var data = {
                                            landId: options.itineraryItem.ID,
                                            startDate: newStartDate,
                                            startTime: newStartTime,
                                            endDate: newEndDate,
                                            endTime: newEndTime
                                        };

                                        $.postJSON('/Web/Land/ChangeLandDates', data, function (json) {

                                            Guyu.LightBox.hide();

                                            if (json.Exception.length !== 0) {
                                                $('#page_error').showPageError(json.Exception, { json: json });
                                                return;
                                            }

                                            $('#itinerary_message').showInformation(options.landType + ': ' + options.itineraryItem.SupplierName + ' dates have been successfully changed');
                                            Guyu.Itinerary.load();

                                        });

                                    }
                                });
                            })
                            .fail(function (response) {
                                if (response && response.Reason) {
                                    startTime.addError('');
                                    start.addError('');
                                    $('#itinerary_land_page_error').showPageError(response.Reason, { scroll: false });
                                    rejectBeforeHide();
                                } else {
                                    resolveBeforeHide(true);
                                }
                            });
                    });

                    return beforeHidePromise;
                },
                afterShow: function () {
                    var allowedMaxDaye = 362;
                    if (options.landType === "Hotel" && options.itineraryItem && options.itineraryItem.isAPIProvider) {
                        allowedMaxDaye = pageOptions.allowedMaxDaysForApiHotel || 362;
                    }
                    start.GuyuGdsDatePicker({
                        beforeShow: $.fn.GuyuGdsDatePicker.setMinMaxFromOtherCalendar,
                        onClose: function () { },
                        otherCalendarId: end.attr('id'),
                        setMax: true,
                        setMin: false,
                        maxDays: allowedMaxDaye
                    });

                    end.GuyuGdsDatePicker({
                        beforeShow: $.fn.GuyuGdsDatePicker.setMinMaxFromOtherCalendar,
                        onClose: function () { },
                        otherCalendarId: start.attr('id'),
                        setMax: false,
                        setMin: true,
                        maxDays: allowedMaxDaye
                    });

                    start.datepicker('setDate', startDate);
                    end.datepicker('setDate', endDate);
                }
            });
        }
    },

    air: {
        deleteItem: function (type, segmentNumber, callback) {
            $.postJSON('/SOLV2/AJAX/common.asp',
                {
                    'FunctionToRun': 'DeleteAirSegment',
                    'Type': type,
                    'SegmentNumber': segmentNumber
                },
                function (json) {
                    $('#page_error').removePageError();
                    if (json.Exception.length !== 0) {
                        $('#page_error').showPageError(json.Exception, { json: json });
                        return;
                    }
                    if (!$.isUndefined(callback)) {
                        callback.call(this);
                    }
                }
            );
        }
    },


    ImageViewer: {
        /*  options.data = {
                heading: '', // page header
                intro: '', // page intro blurb
                keepDisabledAfterLoad : true OR false // default: false
                images: [ // arrray of images to display
                    {
                        
                    }
                ]
            }
        */
        show: function (options) {
            return new Guyu.Promise(function (resolve) {
                Guyu.LightBox.showPage('/so-imageviewer.asp', {
                    showClose: true,
                    width: 875,
                    height: 445,
                    enableAfterShow: false,
                    afterShow: function () {
                        Guyu.LightBox.currentFrame().paint(options.data);
                        resolve();
                    }
                });
            });
        },
        refresh: function (options) {
            Guyu.LightBox.currentFrame().refresh(options.data);
        },
        enable: function () {
            Guyu.LightBox.enable();
        },
        hide: function () {
            Guyu.LightBox.hide();
        }
    },

    FeedBack: {
        show: function (principalId, principalName, costCentreId, typeOfLand) {
            Guyu.LightBox.showPage('/so-feedback.asp', {
                showClose: true,
                width: 500,
                params: [{ name: 'principalId', value: principalId },
                { name: 'principalName', value: principalName },
                { name: 'costCentreId', value: costCentreId },
                { name: 'typeOfLand', value: typeOfLand }]
            });
        },
        add: function (principalId, costCentreId, description, userRating, landId, callback) {
            $.postJSON('/SOLV2/AJAX/so-feedback.asp',
                {
                    'FunctionToRun': 'Add',
                    'principalId': principalId,
                    'costCentreId': costCentreId,
                    'description': description,
                    'userRating': userRating,
                    'landId': landId
                },
                callback
            );
        }
    },

    DatabaseImage: {
        load: function (dataId, imageType) {
            return '/SOLV2/AJAX/displayimage.ashx?dataid=' + dataId + '&imagetype=' + imageType;
        },
        type: {
            agency: 0,
            corporate: 1
        }
    },

    showPageError: function (message, options) {
        $('#page_error').showPageError(message, options);
    },

    removePageError: function () {
        $('#page_error').removePageError();
    }
});

function getRegExDisplayValue(regEx) {
    switch (regEx) {
        case ('[a-zA-Z ]*'): return 'Alpha with spaces';
        case ('[a-zA-Z]*'): return 'Alpha with no spaces';
        case ('[0-9 ]*'): return 'Numeric with spaces';
        case ('[0-9]*'): return 'Numeric with no spaces';
        case ('[^0-9]*'): return 'Alpha with symbols and spaces';
        case ('[^0-9\\s]*'): return 'Alpha with symbols and no spaces';
        case ('[^a-zA-Z]*'): return 'Numeric with symbols and spaces';
        case ('[^a-zA-Z\\s]*'): return 'Numeric with symbols and no spaces';
        case ('[a-zA-Z0-9 ]*'): return 'Alpha/Numeric with spaces';
        case ('[a-zA-Z0-9]*'): return 'Alpha/Numeric with no spaces';
        case ('[\\w\\W\\D\\S\\s]*'): return 'Alpha/Numeric/Symbols with spaces';
        case ('[^\\s]*'): return 'Alpha/Numeric/Symbols with no spaces';
        case ('^[+]{1}[1-9]{1}[0-9]{0,3}[(][1-9]{1}[0-9]{0,5}[)][0-9]{2,10}$'): return 'International phone format +99(99)9999999';
        default: return 'Format validation error, customised format';
    }
}

var optionalRequiredFields;

//Used to set any required fields that the TMC may want as required but are not require by default.
function setOptionalRequiredFields(corporateAccountCode) {
    optionalRequiredFields = undefined;

    if ((window.pageOptions || {}).OptionalRequiredFields === false) {
        return;
    }

    Guyu.fetch('/Web/OptionalRequiredField/List', {
        body: {
            pageName: (window.pageOptions && window.pageOptions.optionalRequiredFieldPageName) ? window.pageOptions.optionalRequiredFieldPageName : location.pathname,
            corporateAccountCode: corporateAccountCode
        }
    }).then(function (json) {
        function isAdminUser() {
            return Guyu !== null
                && Guyu.User !== null
                && Guyu.User !== undefined
                && Guyu.User.fieldManagement !== null
                && Guyu.User.fieldManagement !== undefined
                && Guyu.User.fieldManagement;
        }

        function canOverrideReadOnlyFieldManagement() {
            return Guyu !== null
                && Guyu.User !== null
                && Guyu.User !== undefined
                && Guyu.User.fieldManagementReadOnly !== null
                && Guyu.User.fieldManagementReadOnly !== undefined
                && Guyu.User.fieldManagementReadOnly;
        }

        optionalRequiredFields = json.Items;
        $('.optionalRequiredFieldsMaxLength').attr('maxlength', '999').removeClass('optionalRequiredFieldsMaxLength');
        $('.optionalRequiredFields').removeClass('required optionalRequiredFields').removeRequired().show();
        //Hid its hidden for drop-down list if it is Guyuautocompleter
        $('.Guyuautocompleter').prev().hide();

        var adminUser = isAdminUser();
        var overrideReadOnlyFieldManagement = canOverrideReadOnlyFieldManagement();

        $(optionalRequiredFields).each(function () {
            if (this.OR_bReadonly) {
                if (adminUser || overrideReadOnlyFieldManagement) {
                    $(this.OR_sField_Lookup).addClass('optionalRequiredFields, optionalRequiredReadonlyAdmin');
                } else {
                    $(this.OR_sField_Lookup).filter(':not(div)').addClass('optionalRequiredFields').prop('disabled', true);
                    $(this.OR_sField_Lookup).filter('div').addClass('optionalRequiredFields, disabled');
                    $(this.OR_sField_Lookup).filter('div.Guyuautocompleter').Guyuautocompleter('disable');
                    $(this.OR_sField_Lookup).siblings().filter('div.Guyuautocompleter').Guyuautocompleter('disable');
                }
            }
            if (this.OR_nMaximum_Characters > 0) {
                $(this.OR_sField_Lookup).addClass('optionalRequiredFieldsMaxLength').attr({ 'maxlength': this.OR_nMaximum_Characters });
            }
            if (this.OR_sPlaceholder && this.OR_sPlaceholder.length > 0) {
                $(this.OR_sField_Lookup).attr('placeholder', this.OR_sPlaceholder);
            }
            if (this.OR_sField_Label && this.OR_sField_Label.length > 0) {
                $(this.OR_sField_Lookup).closest('.row').find('.label').text(this.OR_sField_Label);
            }
            if (this.OR_bGuyu_Required) {
                return true;
            }

            if (this.OR_bRequired) {
                $(this.OR_sField_Lookup).closest('.row').find('.label').addClass('required optionalRequiredFields').required();
                $(this.OR_sField_Lookup).addClass('required optionalRequiredFields');
            }
            if (this.OR_bHidden) {
                if (adminUser) {
                    $(this.OR_sField_Lookup).addClass('optionalRequiredFields, optionalRequiredHiddenAdmin');
                } else {
                    $(this.OR_sField_Lookup).closest('.row').addClass('optionalRequiredFields').hide();
                }
            }
        });
        try {
            $('input[placeholder]').placeholder();
        } catch (e) { }
    });
}

// move to Guyu.browser
function supportPlaceholder() {
    if ("placeholder" in document.createElement("input"))
        return true;
    else
        return false;
}

function validateOptionalRequiredFields() {
    if (optionalRequiredFields === undefined) {
        return [];
    }

    var invalidFields = [];

    $(optionalRequiredFields).each(function () {
        var $lookup = $(this.OR_sField_Lookup),
            val = $lookup.val() || '';

        if (val.length > 0) {
            $lookup.removeError();
            if (!supportPlaceholder() && val == this.OR_sPlaceholder) {
                $(this.OR_sField_Lookup).val("");
                return true;
            }
            if ((val && this.OR_nMinimum_Characters > 0) && (val.length < this.OR_nMinimum_Characters)) {
                $lookup.addError('Minimum of ' + this.OR_nMinimum_Characters + ' characters required.', false);
                invalidFields.push($lookup);
                return true;
            }

            if (this.OR_sRegular_Expression && (val.match(this.OR_sRegular_Expression) === null || val.match(this.OR_sRegular_Expression) != val)) {
                var errorMessage = getRegExDisplayValue(this.OR_sRegular_Expression);
                if (this.OR_sCustom_Message !== null) {
                    errorMessage = this.OR_sCustom_Message.length > 0 ? this.OR_sCustom_Message : (errorMessage.length === 0 ? 'Invalid.' : errorMessage);
                } else {
                    errorMessage = (errorMessage.length === 0 ? 'Invalid.' : errorMessage);
                }
                $lookup.addError(errorMessage, false);
                invalidFields.push($lookup);
                return true;
            }
        }
    });

    return invalidFields;
}

function validEmailAddress(emailAddress) {

    var regExpression;
    regExpression = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,20})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i;
    return emailAddress.match(regExpression) != null;
}

function validMobileNumber(mobileNumberField) {

    var mobileNumber = mobileNumberField.val();
    if (mobileNumber === null || $.isUndefined(mobileNumber)) return false;

    // strip spaces & brackets first
    mobileNumber = mobileNumber.replace(/[\x20\x28\x29]/g, '');

    // NZ 02 yyy xxxx, 02 yyyy xxxx, 02 yyyyy xxxx (Intl: +642 yyy xxxx...)
    if (mobileNumber.match(/^(0|\+64|64)2\d{7,9}$/) != null) return true;
    // AU 04 yyy xxxxx (Intl: +614 yyy xxxxx)
    if (mobileNumber.match(/^(0|\+61|61)4\d{8}$/) != null) return true;
    // SG 8xxx xxxx, 9xxx xxxx (Intl: +65 8xxx xxxx...)
    if (mobileNumber.match(/^(?:\+65|65)?[89]\d{7}$/) != null) return true;
    // IN 7yyy xxxxxx, 8yyy xxxxxx, 9yyy xxxxxx (Intl: +91 7yyy xxxxxx...)
    if (mobileNumber.match(/^(?:\+91|91)?[789]\d{9}$/) != null) return true;

    return false;
}

function checkQbActive(messageTitle, callBack) {
    if (Guyu.PageState.quickBookingId) {

        var deferred = $.Deferred();

        Guyu.LightBox.showMessageBox(messageTitle, 'You currently have a \'Quick Booking\' active, would you like to cancel this?', {
            showYes: true,
            showNo: true,
            width: 350,
            afterHide: function (buttonPressed) {
                if (buttonPressed === Guyu.LightBox.buttonType.Yes) {
                    deleteQuickBooking(true).then(function () {
                        if ($.isFunction(callBack)) {
                            callBack.call();
                        }
                        deferred.resolve();
                    }).fail(function () {
                        deferred.reject();
                    });
                } else {
                    var currentQbPage = Guyu.Cookies.getItem('soQBWhere');
                    if (currentQbPage === undefined) {
                        Guyu.jumpPage('/Web/Booking/' + Guyu.PageState.quickBookingId + '/Criteria');
                    } else {
                        Guyu.jumpPage(decodeURIComponent(currentQbPage.value));
                    }
                    deferred.reject();
                }
            }
        });

        return deferred.promise();
    } else {
        if ($.isFunction(callBack)) {
            callBack.call();
        }

        return Guyu.Promise.resolve();
    }
}

// this is the callback from onscriptload for bing maps api v7.0 as it cant handle namespace callbacks
function bingMapsOnScriptLoad() {
    Guyu.mapping.bing.loadMap();
}

function formatBaggageAllowance(baggageAllowance) {
    if ($.isUndefined(baggageAllowance) || baggageAllowance === '0' || baggageAllowance === '') {
        return "No baggage";
    }

    var baggageValue;

    if (baggageAllowance.substr(baggageAllowance.length - 1, 1).toUpperCase() === 'P' ||
        baggageAllowance.substr(baggageAllowance.length - 2, 2).toUpperCase() === 'PC' ||
        baggageAllowance.substr(baggageAllowance.length - 3, 3).toUpperCase() === 'PCS') {

        baggageValue = baggageAllowance.toUpperCase().replace('PCS', '');
        baggageValue = baggageValue.toUpperCase().replace('PC', '');
        baggageValue = baggageValue.toUpperCase().replace('P', '');
        if (baggageValue === '1') {
            return '1 piece';
        }
        if (!isNaN(baggageValue)) {
            return baggageValue + ' pieces';
        }
    }

    if (baggageAllowance.substr(baggageAllowance.length - 1, 1).toUpperCase() === 'K' ||
        baggageAllowance.substr(baggageAllowance.length - 2, 2).toUpperCase() === 'KG') {

        baggageValue = baggageAllowance.toUpperCase().replace('KG', '');
        baggageValue = baggageValue.toUpperCase().replace('K', '');

        if (!isNaN(baggageValue)) {
            return baggageValue + 'Kg';
        }
    }

    if (!isNaN(baggageAllowance)) {
        return baggageAllowance + 'Kg';
    }

    return baggageAllowance;
}

function fulfillmentHoursMessageYesNo(source) {
    var deferred = $.Deferred();

    /* Phase 1 - hard-coded to MS India */
    var warningMessage;

    if (pageOptions !== undefined && pageOptions.fulfillmentHoursMessage !== undefined && pageOptions.fulfillmentHoursMessage !== '') {
        switch (source) {
            case 1:
                warningMessage = 'As it is outside American Express business hours, your booking will be placed on hold until the next business day.  Continue with booking?';
                break;
            case 2:
                warningMessage = 'As it is outside American Express business hours, this booking request will not be actioned until the next business day.  Continue with booking request?';
                break;
            default:
                warningMessage = pageOptions.fulfillmentHoursMessage;
        }

        Guyu.LightBox.showMessageBox('Operational Fulfillment Hours', warningMessage, {
            messageBoxType: 'warning',
            width: 400,
            showYes: true,
            showNo: true,
            afterHide: function (buttonPressed) {
                if (buttonPressed === Guyu.LightBox.buttonType.Yes) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }

                return true; // always close message box
            }
        });

    } else {
        deferred.resolve();
    }

    return deferred.promise();

}

function fulfillmentHoursMessageOk(source, callback) {
    /* Phase 1 - hard-coded to MS India */
    var warningMessage;

    if (pageOptions !== undefined && pageOptions.fulfillmentHoursMessage !== undefined && pageOptions.fulfillmentHoursMessage !== '') {
        switch (source) {
            case 1:
                warningMessage = 'As it is outside American Express business hours, this booking will be placed on hold.  On the next business day you will need to take this booking off hold and complete the booking process.';
                break;
            case 2:
                warningMessage = 'As it is outside American Express business hours, this action is not permitted. Please try again during American Express business hours.';
                break;
            case 3:
                warningMessage = 'As it is outside American Express business hours, this booking request will not be actioned until the next business day.';
                break;
            default:
                warningMessage = pageOptions.fulfillmentHoursMessage;
        }

        Guyu.LightBox.showMessageBox('Operational Fulfillment Hours', warningMessage, {
            messageBoxType: 'alert',
            width: 400,
            showOk: true,
            beforeHide: function (buttonPressed) {
                if ($.isFunction(callback)) {
                    callback();
                }
                else if (callback !== '') {
                    Guyu.jumpPage(callback);
                }
                return true;
            }
        });
        return true;
    }
    return false;
}

$.ajaxSetup({ timeout: 300000, cache: false });
if (Guyu.browser.msie6() || Guyu.browser.msie7() || Guyu.browser.msie8()) {
    $.ajaxSetup({ headers: { Connection: 'Close' } });
}

(function ($) {
    var rvToken;

    $.ajaxPrefilter(function (options, originalOptions) {

        // only add the RequestVerificationToken for POST's
        if (!originalOptions.type || originalOptions.type.toLowerCase() !== 'post' || options.type.toLowerCase() !== 'post') {
            return;
        }

        if (!rvToken) {
            var hidden = $('#requestUID input[name="__RequestVerificationToken"]');

            if (hidden.length === 0 && window !== window.parent) {
                hidden = $('input[name="__RequestVerificationToken"]', window.parent.document);
            }

            if (hidden.length === 0) {
                hidden = $('input[name="__AspRequestVerificationToken"]');
            }

            if (hidden.length === 0 && window !== window.parent) {
                hidden = $('input[name="__AspRequestVerificationToken"]', window.parent.document);
            }

            rvToken = {
                token: (hidden.val() || ''),
                key: hidden.length === 0 ? '' : hidden.attr('name')
            };
        }

        // only add the RequestVerificationToken if it is available and we don't already have one
        if (rvToken.token && originalOptions.data && !originalOptions.data[rvToken.key]) {
            originalOptions.data[rvToken.key] = rvToken.token;
            options.data = $.param(originalOptions.data);
        }
    });
})(window.jQuery);

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return $.trim(this);
    };
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        if (typeof searchString === 'undefined') {
            return false;
        }
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEq = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEq) === 0) {
            return c.substring(nameEq.length, c.length);
        }
    }
    return null;
}

function deleteCookie(name) {
    createCookie(name, "", -1);
}

function submitActivity(message, start, end, headers) {
    var aspRequestVerificationToken = $('input[name="__AspRequestVerificationToken"]').val() || '';

    $.postJSON('/Web/Instrumentation/RecordActivity', {
        Message: message,
        StartTime: start,
        EndTime: end,
        __AspRequestVerificationToken: aspRequestVerificationToken
    }, null, null, null, headers);
}

function createRequestHeaders() {
    var activityId = Guyu.PageState.activityId || createGuid();
    trace('ActivityId: ' + activityId);
    return { "X-Guyu-ActivityId": activityId };
}

function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
}

function trace(message) {
    if (window.console && Guyu.tracingEnabled()) {
        console.log(message);
    }
}

function baseImageUrl() {
    return (Guyu === undefined || Guyu.User === undefined || Guyu.User.baseImageUrl === undefined) ? '/SOLV2/Images/' : Guyu.User.baseImageUrl;
}

function getRandomAdvertName() {
    var availableAds = window.parent.pageOptions.banners.toLowerCase().replace(/ /g, '').split(',');
    availableAds = availableAds.filter(function (e) { return e; });
    var hiddenAds = readCookie("Guyu.advert.home.hide.DoNotExpire");
    if (hiddenAds !== null) {
        hiddenAds = hiddenAds.split(',');
        $.each(hiddenAds, function (i, ad) {
            ad = ad.toLowerCase().trim();
            var index = availableAds.indexOf(ad);
            if (index != -1) {
                availableAds.splice(index, 1);
            }
        });
    }

    if (availableAds.length < 1) {
        Guyu.trace("no adverts configured, check configuration");
        return null;
    }
    var randomInt = Math.floor(Math.random() * (availableAds.length));
    var ad = availableAds[randomInt].trim();
    return ad;
}

function getAdvertsJSON() {
    var $def = $.Deferred();
    var advertsJsonUrl = "//Guyuimages.blob.core.windows.net/promotions/adverts.json?" + Guyu.createUniqueUrlTimestamp();

    if (Guyu.browser.msie7() || Guyu.browser.msie8() || Guyu.browser.msie9()) {
        var xdr = new XDomainRequest();
        xdr.open("GET", advertsJsonUrl);
        xdr.send();
        xdr.onload = function () {
            var result = $.parseJSON(xdr.responseText);
            $def.resolve(result);
        };
        xdr.onerror = function () {
            var failMessage = "unable to retrieve adverts.json error";
            Guyu.trace(failMessage);
            $def.reject(failMessage);
        };
    } else {
        $.getJSON(advertsJsonUrl, function (result) {
            $def.resolve(result);
        }).fail(function (response, errorText, errorMsg) {
            var failMessage = 'unable to retrieve adverts.json errorMsg: ' + errorMsg;
            Guyu.trace(failMessage);
            $def.reject(failMessage);
        });
    }

    return $def.promise();
}

function findAdvertByName(advertsJSON, advertName) {
    advertName = advertName || '';

    var advert = $.grep(advertsJSON, function (val, idx) { return val.Name.toLowerCase() === advertName.toLowerCase(); })[0];
    if (advert) {
        return advert;
    }
    Guyu.trace("advert not found for advertName: " + advertName);
    return null;
}

function getAvailableTags(settingName, parameterId) {    //for tag-it
    var $def = $.Deferred();

    switch (settingName) {
        case "Settings.GlobalBanners":
        case "Settings.AgencyBanners":
        case "Banners":
            return getAdvertsJSON().then(function (response) {
                var availableAdvertTags = $.map(response, function (banner, key) {
                    return banner.Name;
                });
                return availableAdvertTags.sort();
            });

        default:
            if (!settingName) {
                $def.reject();
            } else {
                return getTagsFromController(settingName, parameterId);
            }

    }
    return $def.promise();
}

function getTagsFromController(settingName, parameterId) {
    return Guyu.fetch('/Web/Admin/ProductSetting/Tags', {
        body: {
            productSettingName: settingName,
            id: parameterId
        }
    })
        .then(function (json) {
            return json.Items;
        }).fail(function () {
            return null;
        });
}

function imgError(image) {
    image.onerror = "";
    image.src = IMAGE_TRANSPARENT_DATA_URI;
    return true;
}

String.prototype.plural = function (cnt, zeroOption) {
    /*
     ------------------------------------!!-IMPORTANT-!!-------------------------------------------
    |                                                                                              |
    |      WHEN CHANGING THIS FUNCTION PLEASE RUN UNIT TETSTS ../SOLV2/JS/UnitTests/solv2.aspx     |
    |                                                                                              |
     ----------------------------------------------------------------------------------------------

    * multiple cases can be specified by using a | e.g. [PLURAL_CASE|SINGULAR_CASE]
    * when only one case exists e.g. [PLURAL_CASE] it will be handled as a plural case and will be omitted from the string for the singular case
    * the item count can be included in the plural string by using {0}
    * if the item count is not supplied or is less than 0 it will be omitted from the string alltogether
    * will convert a string numeric cnt to a number.
    * a zero option can also be supplied, the zeroOption string will returned when the count is 0 (zero), this overides the entire plural string

    Sample usage: 
	var sampleString = 'There [are|is] [{0}|only one] Traveller[s] in the array';
	
	sampleString.plural(1);
    Returns: 'There is only one Traveller in the array'

    sampleString.plural(3);
    Returns: 'There are 3 Travellers in the array'

    sampleString.plural(0, 'There are no Travellers in the array');
    Returns: 'There are no Travellers in the array'
*/
    var str = this;
    var hasCount, usePlural, pluralTagMatches, pluralTagMatch, splitMatches, plural, singular, i;

    if (typeof cnt === "string" && $.isNumeric(cnt)) {
        cnt = parseFloat(cnt);
    }

    hasCount = (cnt || 0) > -1;
    usePlural = cnt !== 1;
    pluralTagMatches = str.match(/\[([\s\S]*?)\]/g);

    if (pluralTagMatches) {
        for (i = 0; i < pluralTagMatches.length; i++) {
            pluralTagMatch = pluralTagMatches[i];
            splitMatches = pluralTagMatch.replace(/(\[|\])/g, '').split('|');
            plural = splitMatches[0];
            singular = splitMatches[1] || '';

            str = str.replace(pluralTagMatch, usePlural ? plural : singular);
        }
    }

    if ((cnt || 0) === 0 && zeroOption) {
        return zeroOption;
    }

    return str.replace(/\{0\}\s*/gi, !hasCount ? '' : (cnt || '0') + ' ').replace(/\s{2}/, ' ');
};

function getDebtorCode() {
    if (window.pageOptions && window.pageOptions.overrideDebtorCode && window.pageOptions.overrideDebtorCode.length > 0) {
        return window.pageOptions.overrideDebtorCode;
    }

    return (Guyu.User === undefined || Guyu.User.adminCostCentreCode === undefined) ? '' : Guyu.User.adminCostCentreCode;
}

function quickBookingExists(forceReload) {
    if (!Guyu.PageState.quickBookingId) {
        if (forceReload) {
            if (Guyu.PageState.modifying) {
                Guyu.jumpPage('/Web/Booking/Detail/' + pageOptions.bookingId);
            } else {
                createQuickBooking().then(function (quickBookingId) {
                    Guyu.jumpPage('/Web/Booking/' + quickBookingId + '/Criteria');
                });
            }
        }
        return false;
    }
    return true;
}

/// options { bookingId?: }  bookingId is the post-submit bookingId
function createQuickBooking(options) {
    var opts = $.extend({ bookingId: 0, clone: false }, options);

    return Guyu.fetch('/Web/Booking/CreateQuickBooking', {
        body: {
            bookingId: opts.bookingId,
            clone: opts.clone
        }
    })
        .then(function (json) {
            var quickBookingId = json.ObjectResponse;
            Guyu.PageState.quickBookingId = quickBookingId;
            return quickBookingId;
        }).fail(function () {
            Guyu.WaitWindow.hide();
        });
}

function deleteQuickBooking(deleteBooking) {
    return Guyu.fetch('/Web/QuickBooking/Delete', {
        body: {
            deleteBooking: deleteBooking
        }
    }).then(function (json) {
        Guyu.PageState.quickBookingId = 0;
        return json.ObjectResponse;
    });
}

String.prototype.format = String.prototype.f = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

/**
 * Collection of Promise related features
 */
(function (Guyu, $) {
    'use strict';

    var $document = $(document);

    var FETCH_DEFAULTS = {
        method: 'post',
        body: {},
        displayError: true,
        prefetchCache: {}
    };

    /**
    * Based off of the Fetch API https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
    */
    function fetch(url, options, headers) {
        var opts = $.extend(true, {}, FETCH_DEFAULTS, options);
        if (options && options.prefetchCache && options.prefetchCache.cache) { // this is required as $.extend destroy Object reference to custom cahce required by the delete below
            opts.prefetchCache.cache = options.prefetchCache.cache;
        } else {
            opts.prefetchCache.cache = Guyu.prefetchCache;
        }

        if (opts.method !== 'post') {
            alert('Fetch method is not implemented for: ' + opts.method);
            return reject();
        }

        // check the prefetch cache
        var oneOffCacheResponse = getResponseFromPrefetchCache(opts.prefetchCache);
        if (oneOffCacheResponse) {
            return resolve(oneOffCacheResponse);
        }

        var deferred = $.Deferred();
        var eventData = { url: url, data: opts };
        $document.trigger('ajaxStart.Guyu', [eventData]);

        $.postJSON(url, opts.body, undefined, opts.context || this, undefined, headers).then(function (json) {
            eventData.response = json;

            if (json && json.Exception) {
                if (opts.displayError) {
                    $('#page_error').showPageError(json.Exception, { json: json });
                }
                eventData.success = false;
                deferred.reject(json);
            } else {
                eventData.success = true;
                deferred.resolve(json);
            }

        }).fail(function () {
            eventData.success = false;
            eventData.errorResponse = Array.prototype.slice.call(arguments);

            deferred.reject.apply(deferred, arguments);
        }).always(function () {
            $document.trigger('ajaxEnd.Guyu', [eventData]);
        });

        return deferred.promise();
    }

    Guyu.fetch = fetch;

    function getResponseFromPrefetchCache(options) {
        if (!options.key || !options.cache) {
            return undefined;
        }

        var cachedItem = options.cache[options.key];
        delete options.cache[options.key];
        return cachedItem;
    }

    /*
     * window.Promise pollyfils using jQuery.Deferred
     */
    function reject() {
        var deferred = $.Deferred();
        deferred.reject.apply(deferred, arguments);
        return deferred.promise();
    }

    function resolve() {
        var deferred = $.Deferred();
        deferred.resolve.apply(deferred, arguments);
        return deferred.promise();
    }

    function all() {
        if (arguments.length === 1 && $.isArray(arguments[0])) {
            return $.when.apply(window, arguments[0]);
        } else {
            return $.when.apply(window, arguments);
        }
    }

    function isPromise(obj) {
        return ($.isPlainObject(obj) && $.isFunction(obj.then));
    }

    var JQueryEs6Promise = (function () {

        function JQueryEs6Promise(fn) {
            var $def = $.Deferred();

            var resolveFn = function () {
                $def.resolve.apply($def, arguments);
            };
            var rejectFn = function () {
                $def.reject.apply($def, arguments);
            };
            setTimeout(function () {
                fn(resolveFn, rejectFn);
            }, 4);

            return $def.promise();
        }

        JQueryEs6Promise.reject = reject;
        JQueryEs6Promise.resolve = resolve;
        JQueryEs6Promise.all = all;
        JQueryEs6Promise.isPromise = isPromise;
        return JQueryEs6Promise;
    })();

    Guyu.Promise = JQueryEs6Promise;

    //Enable Tracing Shortcut - Crtl+Alt+T
    $(window).keydown(function (e) {
        var letterT = 84;
        if (e.keyCode === letterT && e.altKey && e.ctrlKey) {
            Guyu.enableTracing(!Guyu.tracingEnabled());
        }
    });

})(Guyu, window.jQuery);

Guyu.ready(Guyu.setReadonly);

// support AMD
if (typeof define === 'function' && define.amd) {
    define('Guyu', ['jquery', 'date', 'time', 'jquery-tooltip'], function () {
        return Guyu;
    });
}
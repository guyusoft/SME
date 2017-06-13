if (typeof Guyu === "undefined") {
    Guyu = {};
}

/**
 * Collection of Promise related features
 */
(function ($) {
    jQuery.extend(Guyu,
        {
            tracingEnabled: function () {
                var cookie = Guyu.Cookies.getItem('soTracing');
                return (cookie && cookie.value === 'true') || false;
            },

            enableTracing: function (enable) {
                if (enable) {
                    Guyu.Cookies.set(new Guyu.Cookie('soTracing', 'true'));
                } else {
                    Guyu.Cookies.reset('soTracing');
                }
            }

        })
})(jQuery);

(function (Guyu, $) {
    'use strict';

    var $document = $(document);

    var FETCH_DEFAULTS = {
        method: 'post',
        body: {},
        displayError: true,
        prefetchCache: {}
    };

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

        var extraData = {};

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

        if ($.isArray(options)) {
            opts = options;
            opts.push({ name: 'windowLocation', value: extraData.windowLocation });
        } else {
            opts = $.extend(extraData, options);
        }

        return $.ajax({
            type: 'POST',
            url: url,
            data: opts,
            headers: headers,
            success: function (json) {
                if (!$.isUndefined(successcallback) && successcallback !== null) {
                    successcallback.call(this, json);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest !== null && XMLHttpRequest !== undefined && (XMLHttpRequest.readyState === 0 || XMLHttpRequest.Status)) return;

                if ($.isFunction(errorcallback)) {
                    errorcallback.call(this, XMLHttpRequest, textStatus, errorThrown, url, opts);
                }
            },
            dataType: 'json',
            context: context
        });
    };

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

})(Guyu, jQuery);
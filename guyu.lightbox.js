if (typeof Guyu === "undefined") {
    Guyu = {};
}


/* create jQuery plugin for display grids as paging */
(function ($) {
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

})(jQuery);

(function ($) {
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
})(jQuery);

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
                this.loading = $(document.createElement('div')).attr('id', 'lightbox_loading').attr('style', 'height: 20px; background-color:white;padding-left: 10px;').append('<span class=\'small label\'>' + this.defaultLoadingMessage + '</span>');
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
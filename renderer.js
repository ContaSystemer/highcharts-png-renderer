/**
 * @see README.md
 */

(function() {
    'use strict';

    var webpage = require('webpage');

    function Renderer(options) {
        this.init(options);
    };

    Renderer.prototype.init = function(options) {
        this.options = options;
        this.id      = Date.now() + (Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1));
        this.page    = webpage.create();

        this.allowUnsafe = false;

        this.setOnRenderCallback(function() {});

        this.page.onCallback = this.onPhantomCallback.bind(this);

        this.page.onConsoleMessage = function(msg, lineNum, sourceId) {
            console.log('CONSOLE: ' + (typeof msg == 'string' ? msg : JSON.stringify(msg)));
        };
    };

    Renderer.prototype.setConfig = function(config) {
        this.config = config;
    };

    Renderer.prototype.setResponse = function(res) {
        this.response = res;
    };

    Renderer.prototype.loadPage = function() {
        this.page.open('about:blank', this.onPageReady.bind(this));
    };

    Renderer.prototype.setOnRenderCallback = function(cb) {
        this.onRenderCompleteCallback = cb;
    };

    Renderer.prototype.allowUnsafeEvaluation = function(mod) {
        this.allowUnsafe = !!mod;
    };

    Renderer.prototype.onRenderComplete = function() {
        this.onRenderCompleteCallback(this.response, atob(this.page.renderBase64('png'));

        this.page.close();
    };

    Renderer.prototype.onPhantomCallback = function(msg) {
        if (msg.id != this.id) {
            return;
        }

        if (!this[msg.callback]) {
            return;
        }

        this[msg.callback](msg);
    };

    Renderer.prototype.onPageReady = function() {
        this.config.scripts.forEach(function(script) {
            this.page.injectJs(script);
        }, this);

        this.page.injectJs('charter.js');

        this.page.zoomFactor = this.config.scale || 1;

        var createChart = function(options, allowUnsafe, id, cb) {
            if (allowUnsafe && typeof options === 'string') {
                options = (function(js) {
                    /* jshint evil: true */
                    eval('var data = ' + js + ';');
                    /* jshint evil: false */
                    return data;
                })(options);
            }

            var charter = new Charter();
            charter.setId(id);
            charter.setOptions(options);

            var info = charter.render();
        };

        this.page.evaluate(
            createChart,
            this.options,
            this.allowUnsafeEvaluation,
            this.id
        );
    };

    Renderer.prototype.render = function() {
        this.loadPage();
    };

    module.exports = Renderer;

})();
/**
 * @see README.md
 */

(function() {
    'use strict';

    var webpage = require('webpage');

    function Renderer(options) {
        this.init(options);
    }

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

        this.page.onError = function(msg, trace) {
            var msgStack = ['ERROR: ' + msg];

            if (trace && trace.length) {
                msgStack.push('TRACE:');
                trace.forEach(function(t) {
                    msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
                });
            }

            console.error(msgStack.join('\n'));
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
        var data = window.atob(this.page.renderBase64('png'));

        this.onRenderCompleteCallback(this.response, data);

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
            if (this.page.injectJs(script) !== true) {
                console.error(script  + ' was not injected');
            }
        }, this);

        this.page.zoomFactor = this.options.exporting.scale || 1;

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

        this.page.evaluate(createChart, this.options, this.allowUnsafeEvaluation, this.id);
    };

    Renderer.prototype.render = function() {
        this.loadPage();
    };

    module.exports = Renderer;
})();
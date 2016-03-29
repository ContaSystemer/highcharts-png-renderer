/**
 * @see README.md
 */

(function() {
    'use strict';

    var RenderServer = require('./render-server'),
        config       = require('./config.json'),
        server       = new RenderServer(config);

    console.log('Listening on port ' + config.port);

    if (config.allowUnsafeEvaluation) {
        console.log('WARNING: Unsafe evaluation is turned ON!');
    }
})();
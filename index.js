/**
 * This module sends all console error logs to the
 * terminal running browser sync
 * 
 * in bs-.config.js, set 
 * module.exports = {
 *   ...
 *   "plugins": ["browser-sync-logger"],
 *   ...
 * }
 **/
var browserSync = require('browser-sync');
var logger = require('eazy-logger');

/**
 * Browser-sync plugins implement a plugin() function
 * and optionally a hooks attribute that provide data
 * or callbacks that are called by hooks
 **/
module.exports.plugin = function (server, client, bs) {

    var loggerError = logger.Logger({prefix:'[{red:ERROR}] '});
    var loggerInfo = logger.Logger({prefix:'[{green:LOG}] '});

    function handleError(argsObject) {
        /* logs to _our_ terminal */
        var argsArray = Object.keys(argsObject).map(key => argsObject[key]);
        if (argsArray[0] instanceof Object) {
            /* eazylogger treats braces in the first argument
            ** as console coloring directive. 
            ** We insert a string to avoid breaking eazy-logger
            */
            argsArray.unshift('');
        }
        loggerError.error.apply(loggerError, argsArray);
    }

    function handleLog(argsObject) {
        var argsArray = Object.keys(argsObject).map(key => argsObject[key]);
            argsArray.unshift('');
        }
        loggerInfo.info.apply(loggerInfo, argsArray);
    }

    function handleConnect(client) {
        client.on("console:error", handleError);
        client.on("console:log", handleLog);
    }

    client.io.sockets.on("connect", handleConnect);

}

module.exports.hooks = {
    "client:js": [
        "(function(console) {",
        "/* send error logs to terminal */",
        "var oldError = console.error;  ",
        "console.error = function () { ",
        "  ___browserSync___.socket.emit('console:error', arguments); ",
        //"  console.log.apply(console, arguments);",
        "  oldError.apply(console, arguments); ",
        "};",
        "var oldLog = console.log;  ",
        "console.log = function () { ",
        "  ___browserSync___.socket.emit('console:error', arguments); ",
        "  oldLog.apply(console, arguments); ",
        "};",
        "})(console);"
    ].join("\n")
}


"use strict";
var io = require('socket.io');
var global_event_handler_1 = require('global-event-handler');
var global_event_handler_2 = require('global-event-handler');
exports.globalEventHandler = global_event_handler_2.globalEventHandler;
exports.globalEventLissener = global_event_handler_2.globalEventLissener;
exports.globalEventHandlerClient = global_event_handler_2.globalEventHandlerClient;
exports.globalEvent = global_event_handler_2.globalEvent;
var server = (function () {
    function server(app, globalEventHandlerOptions) {
        this.globalEventHandlerOptions = globalEventHandlerOptions;
        this.globalEventHandler = new global_event_handler_1.globalEventHandler(this.globalEventHandlerOptions);
        this.publicFunctions = {};
        this.observables = {};
        var vm = this;
        vm.io = io(app);
        vm.io.on('connection', function (socket) {
            var _rIds = [];
            socket.on('publicFunction.subscribe', function (data) {
                if (vm.publicFunctions[data.name]) {
                    var newPubFunc = new vm.publicFunctions[data.name](socket.client.request.user, data.data, vm.globalEventHandler);
                    newPubFunc._rId = data.rId;
                    vm.observables[data.rId] = newPubFunc.observable.subscribe(vm.subscribeFx(socket, data.rId, data.name), vm.errorFx(socket, data.rId, data.name), vm.completeFx(socket, data.rId, data.name, vm));
                    _rIds.push(data.rId);
                }
            });
            socket.on('publicFunction.dissolve', function (data) {
                if (vm.observables[data.rId]) {
                    var _o = vm.observables[data.rId];
                    _o.unsubscribe();
                    delete vm.observables[data.rId];
                    _rIds.splice(_rIds.indexOf(data.rId), 1);
                }
            });
            socket.on('disconnect', function () {
                _rIds.forEach(function (_rId) {
                    if (vm.observables[_rId]) {
                        var _o = vm.observables[_rId];
                        _o.unsubscribe();
                        delete vm.observables[_rId];
                    }
                });
            });
        });
    }
    server.prototype.addPublicFunction = function (name, _func) {
        this.publicFunctions[name] = _func;
    };
    server.prototype.subscribeFx = function (socket, rId, name) {
        return function (_o) {
            var d = {
                rId: rId,
                name: name,
                data: _o
            };
            socket.emit("publicFunction.next", d);
        };
    };
    server.prototype.errorFx = function (socket, rId, name) {
        return function (_o) {
            var d = {
                rId: rId,
                name: name,
                data: _o
            };
            socket.emit("publicFunction.error", d);
        };
    };
    server.prototype.completeFx = function (socket, rId, name, _vm) {
        return function () {
            var d = {
                rId: rId,
                name: name,
                data: ""
            };
            socket.emit("publicFunction.complete", d);
            if (_vm.observables[rId]) {
                var _o = _vm.observables[rId];
                _o.unsubscribe();
                delete _vm.observables[rId];
            }
        };
    };
    return server;
}());
exports.server = server;
var publicFunction = (function () {
    function publicFunction(user, data, globalEventHandler) {
    }
    return publicFunction;
}());
exports.publicFunction = publicFunction;
;
//# sourceMappingURL=index.js.map
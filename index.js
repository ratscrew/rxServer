System.register(['socket.io', 'global-event-handler'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var io, global_event_handler_1;
    var server, publicFunction;
    return {
        setters:[
            function (io_1) {
                io = io_1;
            },
            function (global_event_handler_1_1) {
                global_event_handler_1 = global_event_handler_1_1;
                exports_1({
                    "globalEventHandler": global_event_handler_1_1["globalEventHandler"],
                    "globalEventLissener": global_event_handler_1_1["globalEventLissener"],
                    "globalEventHandlerClient": global_event_handler_1_1["globalEventHandlerClient"],
                    "globalEvent": global_event_handler_1_1["globalEvent"]
                });
            }],
        execute: function() {
            server = (function () {
                function server(app) {
                    this.globalEventHandler = new global_event_handler_1.globalEventHandler();
                    this.publicFunctions = {};
                    this.observables = {};
                    var vm = this;
                    vm.io = io(app);
                    vm.io.on('connection', function (socket) {
                        socket.emit('news', { hello: 'world' });
                        socket.on('my other event', function (data) {
                            console.log(data);
                        });
                        socket.on('publicFunction.subscribe', function (data) {
                            console.log(data);
                            if (vm.publicFunctions[data.name]) {
                                console.log(data.name);
                                vm.observables[data.rId] = (new vm.publicFunctions[data.name](socket.request.user, data.data, vm.globalEventHandler)).observable.subscribe(vm.subscribeFx(socket, data.rId, data.name), vm.errorFx(socket, data.rId, data.name), vm.completeFx(socket, data.rId, data.name, vm));
                            }
                        });
                        socket.on('publicFunction.dissolve', function (data) {
                            console.log(data);
                            if (vm.observables[data.rId]) {
                                var _o = vm.observables[data.rId];
                                _o.unsubscribe();
                                delete vm.observables[data.rId];
                            }
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
            exports_1("server", server);
            publicFunction = (function () {
                function publicFunction(user, data, globalEventHandler) {
                }
                return publicFunction;
            }());
            exports_1("publicFunction", publicFunction);
            ;
        }
    }
});
//# sourceMappingURL=index.js.map
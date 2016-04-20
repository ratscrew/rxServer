System.register(['rxjs/rx'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var rx;
    var serverRx;
    return {
        setters:[
            function (rx_1) {
                rx = rx_1;
            }],
        execute: function() {
            //@Injectable()
            serverRx = (function () {
                function serverRx(url) {
                    var _this = this;
                    if (url === void 0) { url = 'http://localhost:3000'; }
                    this.url = url;
                    this._subjects = {};
                    this.publicFunction = function (name, data) {
                        var vm = _this;
                        var rId = Math.random().toString() + performance.now().toString();
                        var _o = rx.Observable.create((function (_rId, _name, _vm) {
                            return function (_s) {
                                _vm._subjects[_rId] = _s;
                                _vm._socket.emit('publicFunction.subscribe', { rId: _rId, name: _name, data: data });
                                return (function (__rId, __s, __vm) {
                                    return function () {
                                        if (__s === __vm._subjects[__rId]) {
                                            delete __vm._subjects[__rId];
                                            __vm._socket.emit('publicFunction.dissolve', { rId: __rId });
                                        }
                                    };
                                })(_rId, _s, _vm);
                            };
                        })(rId, name, vm));
                        return _o;
                    };
                    var vm = this;
                    vm._socket = io.connect(this.url);
                    vm._socket.on('publicFunction.next', function (data) {
                        if (vm._subjects[data.rId])
                            vm._subjects[data.rId].next(data.data);
                    });
                    vm._socket.on('publicFunction.complete', function (data) {
                        if (vm._subjects[data.rId])
                            vm._subjects[data.rId].complete();
                    });
                    vm._socket.on('publicFunction.error', function (data) {
                        if (vm._subjects[data.rId])
                            vm._subjects[data.rId].error(data.data);
                    });
                }
                return serverRx;
            }());
            exports_1("serverRx", serverRx);
        }
    }
});
//# sourceMappingURL=rxServer.js.map
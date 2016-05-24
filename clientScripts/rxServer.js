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
                    this._livePubFuncs = {};
                    this.publicFunction = function (name, data, ___rId) {
                        var vm = _this;
                        var rId = ___rId || Math.random().toString() + performance.now().toString();
                        var _o = rx.Observable.create((function (_rId, _name, _vm, _data, isReconnect) {
                            return function (_s) {
                                if (!isReconnect)
                                    _vm._subjects[_rId] = _s;
                                if (_vm._socket && _vm._socket.emit)
                                    _vm._socket.emit('publicFunction.subscribe', { rId: _rId, name: _name, data: _data });
                                _vm._livePubFuncs[rId] = { rId: _rId, name: _name, data: _data };
                                return (function (__rId, __s, __vm) {
                                    return function () {
                                        if (__s === __vm._subjects[__rId]) {
                                            delete __vm._subjects[__rId];
                                            delete __vm._livePubFuncs[__rId];
                                            if (__vm._socket && _vm._socket.emit)
                                                __vm._socket.emit('publicFunction.dissolve', { rId: __rId });
                                        }
                                    };
                                })(_rId, _s, _vm);
                            };
                        })(rId, name, vm, data, (___rId ? true : false)));
                        return _o;
                    };
                }
                serverRx.prototype.connect = function () {
                    var me = this;
                    if (me._socket && me._socket.disconnect) {
                        me._socket.disconnect();
                        io.connect(null, { 'force new connection': true, forceNew: true });
                    }
                    me._socket = io.connect(me.url);
                    me._socket.on('publicFunction.next', function (data) {
                        if (me._subjects[data.rId])
                            me._subjects[data.rId].next(data.data);
                    });
                    me._socket.on('publicFunction.complete', function (data) {
                        if (me._subjects[data.rId]) {
                            me._subjects[data.rId].complete();
                            delete me._subjects[data.rId];
                            delete me._livePubFuncs[data.rId];
                        }
                    });
                    me._socket.on('publicFunction.error', function (data) {
                        if (me._subjects[data.rId])
                            me._subjects[data.rId].error(data.data);
                    });
                    me._socket.on('connect', function () {
                        for (var i in me._livePubFuncs) {
                            me.publicFunction(me._livePubFuncs[i].name, me._livePubFuncs[i].data, me._livePubFuncs[i].rId).subscribe();
                        }
                    });
                };
                return serverRx;
            }());
            exports_1("serverRx", serverRx);
            ;
        }
    }
});
//# sourceMappingURL=rxServer.js.map
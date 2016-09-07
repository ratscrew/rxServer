import * as rx from 'rxjs/Rx'
//import {IPubFuncData} from './../index';
//import {Injectable} from 'angular2/core';
declare var io:any;

//@Injectable()
export class serverRx {
    private _subjects:{[id:string]: rx.Subject<any>} = {};
    private _socket;
    private _livePubFuncs:{[id:string]:{name:string,data:any,rId:string}} = {};
    constructor(public url = 'http://localhost:3000') {
    }
    
    connect(){
        let me = this;
        if(me._socket && me._socket.disconnect){
            me._socket.disconnect();
            io.connect(null,{'force new connection':true, forceNew: true});
        } 
        me._socket = io.connect(me.url);
        
        me._socket.on('publicFunction.next',(data:IPubFuncData)=>{
            if(me._subjects[data.rId]) me._subjects[data.rId].next(data.data);
        });

        me._socket.on('publicFunction.complete',(data:IPubFuncData)=>{
            if(me._subjects[data.rId]){
                me._subjects[data.rId].complete();    
                delete me._subjects[data.rId];
                delete me._livePubFuncs[data.rId];
            } 
        });

        me._socket.on('publicFunction.error',(data:IPubFuncData)=>{
            if(me._subjects[data.rId]) me._subjects[data.rId].error(data.data);
        });
        
        me._socket.on('connect',()=>{
            for(var i in me._livePubFuncs){
                me.publicFunction(me._livePubFuncs[i].name,me._livePubFuncs[i].data,me._livePubFuncs[i].rId).subscribe()
            }
        })
        
        me._socket.on('reconnect',()=>{
            for(var i in me._livePubFuncs){
                me.publicFunction(me._livePubFuncs[i].name,me._livePubFuncs[i].data,me._livePubFuncs[i].rId).subscribe()
            }
        })
    }

    publicFunction = (name:string,data?,___rId?)=>{
        let vm = this;
        let rId:string = ___rId || Math.random().toString() + performance.now().toString();
        let _o:rx.Observable<any> = rx.Observable.create(((_rId,_name,_vm, _data,isReconnect)=>{return(_s:rx.Subject<any>)=>{
            if(!isReconnect)  _vm._subjects[_rId] = _s;
            if(_vm._socket && _vm._socket.emit) _vm._socket.emit('publicFunction.subscribe',{rId:_rId,name:_name,data:_data});
            _vm._livePubFuncs[rId] = {rId:_rId,name:_name,data:_data};
            return ((__rId, __s, __vm)=>{
                return ()=> {
                    if (__s === __vm._subjects[__rId]) {
                        delete __vm._subjects[__rId];
                        delete __vm._livePubFuncs[__rId];
                        if(__vm._socket && _vm._socket.emit) __vm._socket.emit('publicFunction.dissolve', {rId: __rId})
                    }
                }
            })(_rId,_s, _vm)
        }})(rId,name,vm,data,(___rId?true:false)));
        
        
        return _o;

    }
}

export interface IPubFuncData{
    name:string,
    rId:string,
    data:any
};
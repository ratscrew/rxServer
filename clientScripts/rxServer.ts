import * as rx from 'rxjs/rx'
//import {IPubFuncData} from './../index';
//import {Injectable} from 'angular2/core';
declare var io:any;

//@Injectable()
export class serverRx {
    private _subjects:{[id:string]: rx.Subject<any>} = {};
    private _socket;
    constructor(public url = 'http://localhost:3000') {
        let vm = this;
        vm._socket = io.connect(this.url);
        
        vm._socket.on('publicFunction.next',(data:IPubFuncData)=>{
            if(vm._subjects[data.rId]) vm._subjects[data.rId].next(data.data);
        });

        vm._socket.on('publicFunction.complete',(data:IPubFuncData)=>{
            if(vm._subjects[data.rId]) vm._subjects[data.rId].complete();
        });

        vm._socket.on('publicFunction.error',(data:IPubFuncData)=>{
            if(vm._subjects[data.rId]) vm._subjects[data.rId].error(data.data);
        });

    }

    publicFunction = (name:string,data?)=>{
        let vm = this;
        let rId:string = Math.random().toString() + performance.now().toString();
        let _o:rx.Observable<any> = rx.Observable.create(((_rId,_name,_vm)=>{return(_s:rx.Subject<any>)=>{
            _vm._subjects[_rId] = _s;
            //_s.next({rId:_rId});
            _vm._socket.emit('publicFunction.subscribe',{rId:_rId,name:_name,data:data})
            return ((__rId, __s, __vm)=>{
                return ()=> {
                    if (__s === __vm._subjects[__rId]) {
                        delete __vm._subjects[__rId];
                        __vm._socket.emit('publicFunction.dissolve', {rId: __rId})
                    }
                }
            })(_rId,_s, _vm)
        }})(rId,name,vm))

        return _o;

    }
}

export interface IPubFuncData{
    name:string,
    rId:string,
    data:any
};
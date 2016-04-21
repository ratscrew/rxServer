import * as rx from 'rxjs/rx'
//import {IPubFuncData} from './../index';
//import {Injectable} from 'angular2/core';
declare var io:any;

//@Injectable()
export class serverRx {
    private _subjects:{[id:string]: rx.Subject<any>} = {};
    private _socket;
    private _livePubFuncs:{[id:string]:{name:string,data:any,rId:string}} = {};
    constructor(public url = 'http://localhost:3000') {
        let vm = this;
        vm._socket = io.connect(this.url);
        
        vm._socket.on('publicFunction.next',(data:IPubFuncData)=>{
            if(vm._subjects[data.rId]) vm._subjects[data.rId].next(data.data);
        });

        vm._socket.on('publicFunction.complete',(data:IPubFuncData)=>{
            if(vm._subjects[data.rId]){
                vm._subjects[data.rId].complete();    
                delete vm._subjects[data.rId];
                delete vm._livePubFuncs[data.rId];
            } 
        });

        vm._socket.on('publicFunction.error',(data:IPubFuncData)=>{
            if(vm._subjects[data.rId]) vm._subjects[data.rId].error(data.data);
        });
        
        vm._socket.on('connect',()=>{
            for(var i in vm._livePubFuncs){
                vm.publicFunction(vm._livePubFuncs[i].name,vm._livePubFuncs[i].data,vm._livePubFuncs[i].rId).subscribe()
            }
        })

    }

    publicFunction = (name:string,data?,___rId?)=>{
        let vm = this;
        let rId:string = ___rId || Math.random().toString() + performance.now().toString();
        let _o:rx.Observable<any> = rx.Observable.create(((_rId,_name,_vm, _data,isReconnect)=>{return(_s:rx.Subject<any>)=>{
            if(!isReconnect)  _vm._subjects[_rId] = _s;
            _vm._socket.emit('publicFunction.subscribe',{rId:_rId,name:_name,data:_data});
            _vm._livePubFuncs[rId] = {rId:_rId,name:_name,data:_data};
            return ((__rId, __s, __vm)=>{
                return ()=> {
                    if (__s === __vm._subjects[__rId]) {
                        delete __vm._subjects[__rId];
                        delete __vm._livePubFuncs[__rId];
                        __vm._socket.emit('publicFunction.dissolve', {rId: __rId})
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
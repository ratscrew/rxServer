import * as io from 'socket.io';
import * as rx from 'rxjs';
import * as express from 'express';
import {globalEventHandler} from 'global-event-handler'

export {globalEventHandler, globalEventLissener,globalEventHandlerClient,globalEvent} from 'global-event-handler';

export class server {
    io:SocketIO.Server;
    globalEventHandler:globalEventHandler = new globalEventHandler();
    private publicFunctions:{[id:string]:any} = {};
    private observables:{[id:string]:rx.Subscriber<any> } = {};

    constructor(app:express.Application){
        let vm = this;
        vm.io = io(app); 
        
        vm.io.on('connection', function (socket) {
            socket.emit('news', { hello: 'world' });
            socket.on('my other event', function (data) {
                console.log(data);
            });
            
            
            socket.on('publicFunction.subscribe', function (data:IPubFuncData) {
                console.log(data);
                if(vm.publicFunctions[data.name]) {
                    console.log(data.name);
                    vm.observables[data.rId] = (new vm.publicFunctions[data.name](socket.request.user,data.data,vm.globalEventHandler)).observable.subscribe(vm.subscribeFx(socket,data.rId,data.name),vm.errorFx(socket,data.rId,data.name),vm.completeFx(socket,data.rId,data.name,vm));
                } 
            });

            socket.on('publicFunction.dissolve',(data:IPubFuncData)=>{
                console.log(data);
                if(vm.observables[data.rId]) {
                   let _o = vm.observables[data.rId];
                    _o.unsubscribe()

                    delete vm.observables[data.rId];
                }
            })
        });  
    }

    addPublicFunction(name:string, _func:any){
        this.publicFunctions[name] = _func;
    }
    
    private subscribeFx(socket:SocketIO.Socket,rId:string,name:string){
        return (_o)=>{
            let d:IPubFuncData = {
                rId:rId,
                name:name,
                data:_o
            };
            socket.emit("publicFunction.next",d);
        }
    }
    private errorFx(socket:SocketIO.Socket,rId:string,name:string){
        return (_o)=>{
            let d:IPubFuncData = {
                rId:rId,
                name:name,
                data:_o
            };
            socket.emit("publicFunction.error",d);
        }
    }
    
    private completeFx(socket:SocketIO.Socket,rId:string,name:string,_vm){
        return ()=>{
            let d:IPubFuncData = {
                rId:rId,
                name:name,
                data:""
            };
            socket.emit("publicFunction.complete",d);
            if(_vm.observables[rId]) {
                let _o = _vm.observables[rId];
                _o.unsubscribe()
                delete _vm.observables[rId];
            }
        }
    }
    
}


export class publicFunction {
    observable:rx.Observable<any>;
    constructor(user:Object, data:any , globalEventHandler:globalEventHandler) {
        
    }

}

export interface IPubFuncData{
    name:string,
    rId:string,
    data:any
};











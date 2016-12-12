import * as io from 'socket.io';
import * as rx from 'rxjs/Rx';
import * as express from 'express';
import {globalEventHandler, globalEventHandlerOptions} from 'global-event-handler'

export {globalEventHandler, globalEventLissener,globalEventHandlerClient,globalEvent,globalEventHandlerOptions} from 'global-event-handler';

export class server {
    io:SocketIO.Server;
    globalEventHandler:globalEventHandler = new globalEventHandler(this.globalEventHandlerOptions);
    private publicFunctions:{[id:string]:any} = {};
    private observables:{[id:string]:rx.Subscriber<any> } = {};

    constructor(app:express.Application, private globalEventHandlerOptions?:globalEventHandlerOptions ){
        let vm = this;
        vm.io = io(app); 
        
        vm.io.on('connection', (socket) => {
            let _rIds:string[] = [];

            socket.on('publicFunction.subscribe', function (data:IPubFuncData) {
                if(vm.publicFunctions[data.name]) {
                    let newPubFunc = new vm.publicFunctions[data.name](socket.client.request.user,data.data,vm.globalEventHandler);
                    newPubFunc._rId = data.rId;
                    vm.observables[data.rId] = newPubFunc.observable.subscribe(vm.subscribeFx(socket,data.rId,data.name),vm.errorFx(socket,data.rId,data.name),vm.completeFx(socket,data.rId,data.name,vm));
                    _rIds.push(data.rId);
                } 
            });

            socket.on('publicFunction.dissolve',(data:IPubFuncData)=>{
                if(vm.observables[data.rId]) {
                   let _o = vm.observables[data.rId];
                    _o.unsubscribe()

                    delete vm.observables[data.rId];
                    _rIds.splice(_rIds.indexOf(data.rId),1)
                }
            })
            
            socket.on('disconnect',()=>{
                _rIds.forEach((_rId)=>{
                    if(vm.observables[_rId]) {
                    let _o = vm.observables[_rId];
                        _o.unsubscribe()

                        delete vm.observables[_rId];
                    }
                })
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
    _rId:string;
    observable:rx.Observable<any>;
    constructor(user:Object, data:any , globalEventHandler:globalEventHandler) {
        
    }

}

export interface IPubFuncData{
    name:string,
    rId:string,
    data:any
};











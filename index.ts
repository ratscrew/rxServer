import * as io from 'socket.io';
import {Observable,Subject} from 'rxjs';
import * as express from 'express'

export class server {
    io:SocketIO.Server;
    constructor(app:express.Application){
        this.io = io(app);   
    }
}


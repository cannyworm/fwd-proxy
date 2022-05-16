/**
 * - Handle when fwd is disconnected
 */
import * as net from 'net'
import { MySocket, MySocketClass, NetAddress } from './types'


class Server extends MySocketClass {

    // this socket server instanct
    server : net.Server

    // forward to socket
    fwd? : MySocket

    // clients
    clients : MySocket[]

    server_address : NetAddress

    constructor( server_address : NetAddress ) {
        super()

        if (net.isIP(server_address.host) === 0)
            throw new TypeError("invalid ip")

        this.server_address = server_address
        
        this.server = net.createServer( this.OnClientConnect ) 
        this.clients = []
    }

    Listen = ( callback? : ( adr : NetAddress ) => void ) => {
        this.server.listen( this.server_address.port , this.server_address.host , () : void => {
            if (callback)
                callback( this.server_address )
        })
    }

    SocketSend = ( sk : MySocket , data : Buffer ) => {

        if ( !this.fwd )
            return

        this.fwd.socket?.write(
            Buffer.concat(
                [
                    this.IdBuffer( sk ),
                    data
                ]
            )
        )
    }

  


    OnClientConnect = async (socket : net.Socket) => {

        let sk = {
            id : this.clients.length,
            socket : socket
        }

        if( this.fwd )
            this.clients.push(sk)

        socket.on('data' , buf => {
            this.OnClientData( sk , buf )
        })

        socket.on('end' , () => this.OnClientEnd(sk))

        if ( this.fwd && this.fwd.socket ) {
            // tell fwd that we need new socket with this id            
            console.debug(`=> trying to register socket id ${sk.id}`)
            this.SocketSend(this.fwd , this.IdBuffer(sk) )
        }
        console.log(`${socket.remoteAddress}:${socket.remotePort} is connected`)
    }

    OnClientData = async ( socket : MySocket , data : Buffer ) => {

        if ( this.fwd == null) {

            if ( data.readInt16LE() === 0x1337) {

                this.fwd = socket
                this.clients.push(socket)

                console.log(`found fwd socket [${this.fwd.id}]`)
            }

            return
        }

        if ( socket === this.fwd )
            return await this.OnFwdData( data )

        // forward data with socket id 
        this.SocketSend( socket , data )
    }


    OnClientEnd = async ( socket :  MySocket ) => {
        socket.socket = undefined

        // remove old fwd when it disconnected
        if ( socket === this.fwd )
            this.fwd = undefined
    }


    OnFwdData = async ( data : Buffer ) => {

        // this will crash and burn
        let id = data.readInt16LE()
        let content = data.subarray(2)

        console.log({
            id,
            content : content.toString()
        })

        this.clients[id]?.socket?.write( content.toString() )

    }

}

export {
    Server
}
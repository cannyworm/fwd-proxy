
/**
 * - Properly parse http header 
 * - Better auth / initiate protocol
 * - Proper pacakge protocol 
 * - Handle when server crash
 */

import * as net from 'net'
import { Stream , Readable } from 'stream'
import { MySocket, MySocketClass, NetAddress } from './types'


class Client extends MySocketClass {

    // out proxy server
    server : net.Socket

    // for simulate difference socket on server
    actors : Array<MySocket> = new Array(0xFFFF)

    actual_server : NetAddress

    constructor( actual_server : NetAddress , proxy_server : NetAddress) {

        super()

        this.actual_server = actual_server
        this.server = new net.Socket()
        this.server.on('data', this.OnServerData)
        this.server.connect( proxy_server.port , proxy_server.host , () => {
            console.log('connected to proxy server')
        })

    }

    Connect = ( ) => {
        this.server.write( this.IdBuffer(0x1337) )
    }

    ModifyHttpRequest = ( data : string ) => {
        const headers = data.split('\r\n')

        // super lazy hacky way

        const new_headers = headers.map( head => {
            if ( head.startsWith("Host:") )
                return `Host: ${this.actual_server.host}`
            return head
        })


        return new_headers.join('\r\n')

        // let content_break = headers.indexOf('')
        // const content = headers.splice( content_break + 1).join('\r\n')
        // console.log({
        //     content_break,
        //     headers,
        //     content
        // })
    }
    OnServerData = async ( buf : Buffer ) => {

        let stream =  new Readable()  
        stream._read = () => {}
        stream.push( buf )

        let id = this.BuffToId( stream.read(2) ) 
        let content = stream.read()

        console.log(
        {
            id,
            content
        })

        // internal socket
        if ( id === 0 ) {
            // create new socket to actual server
            let sk_id = this.BuffToId( content ) 
            
            let sk = {
                id : sk_id
            } as MySocket

            console.log(`<= trying to create actor with id ${sk.id}`)

            sk.socket = new net.Socket()

            sk.socket.connect( this.actual_server.port , this.actual_server.host , () => {
                console.log(`socket id ${sk.id} connectedto ${this.actual_server.host}:${this.actual_server.port}`) 
            })

            sk.socket.on('data', buffer => {

                this.server.write( 
                     Buffer.concat([
                        this.IdBuffer(sk),
                        buffer
                     ])
                 )

            })

            sk.socket.on('end', () => this.actors[sk.id].socket = undefined )

            this.actors[sk.id] = sk

        } else {

            let actor = this.actors[id]

            if (!actor) {
                console.log(`<= try to send data to non exist socket [${id}]`)
                return
            }

            if (!actor.socket) {
                console.log(`<= try to send data to closed socket [${id}]`)
                return
            }

            let modified_content = this.ModifyHttpRequest( content.toString() )

            actor.socket.write( modified_content )
        }
    }

}



export {
    Client
}
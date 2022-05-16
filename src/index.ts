import * as net from 'net'
import * as process from 'process'
import { Client } from './Client'
import { Server } from './Server'

/*
    GOAL 
    - forward data from server to connected socket
    
*/

async function main() {
    const address = {
        host : '127.0.0.1',
        port : 8080
    }
    const is_server = process.argv.indexOf("--server") !== -1
    const http_server = process.argv.indexOf("--http-server") !== -1

    if ( is_server ) {
        const server = new Server({
            ...address
        }) 
        server.Listen( ( adr ) => console.log(`start server on ${adr.host}:${adr.port}`) )
    }
    else {
        const client = new Client(
        {
            host : 'info.cern.ch',
            port : 80
        },
        {
            ...address
        })
        client.Connect()
    }

    return 0
}


main().then( console.log ).catch( console.error ) 

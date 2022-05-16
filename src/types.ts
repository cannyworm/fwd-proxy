
import * as net from 'net'

interface MySocket {
    id : number
    // socket will be undefined when closed / ended
    socket? : net.Socket
}

type NetAddress = {
    host : string, 
    port : number
}

type NetPackage = {
    // uint8 id 
    id : number 
    // content
    content : Buffer 
}

class MySocketClass {

    public IdBuffer = ( id_or_sk : number | MySocket ) => {
        let id_buffer = Buffer.alloc(2)
        if ( typeof id_or_sk === 'object')
            id_buffer.writeInt16LE( id_or_sk.id )
        else
            id_buffer.writeInt16LE(id_or_sk)
        return id_buffer
    }


    public BuffToId = ( buf : Buffer | number[] ) : number => {
        return ( buf instanceof Buffer ) ? buf.readInt16LE() : buf[0] + buf[1] << 8 ;
    }
    

}


export {
    MySocket,
    NetPackage,
    NetAddress,
    MySocketClass
}


export const PKG_SIG = 0x1337


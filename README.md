# fwd-proxy
proxy server written in typescript \
I have to develop some application which require to recive data via webhook. \
Which mean I have to develop my code on server , forward port and use my public IP or use service like ngrok. \
And then I though of an idea what if we forward request from our **server** to my local **client** with some kind of protocol. \
and that is the origin of this project

# How it's work
- There are mainly 3 component
    - user
        - create request to proxy server
    - proxy server
        - recive and send request to client
    - fwd client
        - process request and response to server
    


[ user ] -> [ proxy server ] -> [ fwd client ] \
\
[ user ] <- [ proxy server ] <- [ fwd client ]

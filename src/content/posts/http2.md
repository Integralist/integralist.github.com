---
title: "HTTP/2"
date: 2015-10-20T13:00:00+01:00
categories:
  - "code"
  - "guide"
tags:
  - "HTTP"
  - "HTTP2"
  - "network"
  - "performance"
  - "golang"
  - "go"
  - "nginx"
draft: false
---

- [Introduction](#1)
- [Persistent Connections](#2)
- [Multiplexing](#3)
- [Compression](#4)
- [Prioritization](#5)
- [SSL/TLS](#6)
- [Server Push](#7)
- [Implementations](#8)
  - [Nginx](#9)
  - [Go](#10)
- [References](#11)

<div id="1"></div>
## Introduction

This is a super quick post for demonstrating how to utilise the new HTTP/2 protocol. If you're unfamiliar with it, then let me spend a brief few moments discussing some of the highlights:

- [Single, persistent connection](#2)
- [Multiplexing](#3)
- [Header compression](#4)
- [Prioritization](#5)
- [Encryption](#6)
- [Server Push](#7)

If none of these features make sense, then allow me to clarify further...

<div id="2"></div>
## Persistent Connections

When using HTTP/1.x each resource your web page specified would need its own connection. If you had three images on a page then that would be three separate connections.

With HTTP/2 the situation is improved by utilising a single connection which supports the concept of a 'stream'. A stream is effectively a two way channel, so information flows up and down it; and a single connection will be able to manage as many streams as necessary.

This removes the need for previous 'performance' techniques such as:

- domain sharding: a way to side step the problem of browsers only being able to parallelize a limited number of connections to the same domain
- image spriting: combining multiple images into one to reduce multiple connections to the server
- concatenating css/js: combining multiples stylesheets or javascript files into a single file to reduce multiple connections to the server

This also means that the browser is able to more precisely cache resources as there is no need to have to bundle all your static assets together. This also avoids the user downloading assets for a page that they will never visit.

<div id="3"></div>
## Multiplexing

This simply means that multiple resources can be loaded in parallel over a single connection. Just to be clear: this is a very good performance boost and facilitates the ability to transfer lots of resources in a much more efficient manner than HTTP/1.x 

<div id="4"></div>
## Compression

Header information will no longer be sent over the wire in plaintext format. It'll now be compressed, making it smaller and the responses subsequently quicker to receive (although admittedly this is only a marginal gain).

This also means we should be less concerned about having to serve static assets from a cookie-less domain, which was a problem because the size of the static resources would all become larger due to cookie data being associated with them.

<div id="5"></div>
## Prioritization

Because all connections are multiplexed into a single connection, we need a way to prioritize certain requests over others in order to ensure the fastest possible overall response. HTTP/2 supports the concept of 'weighting' each 'stream' (see "Persistent Connections" above for details of what a stream is).

I wont dive into the specifics of how this has been designed, suffice to say, if you want the gory details then I recommend you read the specification document here: [http2.github.io/http2-spec](http://http2.github.io/http2-spec/#rfc.section.5.3.2)

<div id="6"></div>
## SSL/TLS

The above highlights also suggest a reduction in the overall time cost associated with the SSL/TLS 'handshake' process. Here's why:

- A single connection will minimize SSL handshaking back and forth between the client/server
- Multiplexing allows requests to be handled asynchronously
- Compressing the HTTP headers will make the connection smaller (and subsequently faster)
- Prioritized connections means allowing relevant requests to be handled in an appropriate order

<div id="7"></div>
## Server Push

In HTTP/2 the server now has the ability to send additional information along with the initial HTTP request made by the client. Now it's important to realise that the concept of 'server push' isn't the same thing as [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

Server-Sent Events allows the server to push updates to the client and as long as the client is listening for the relevant event, the client will be able to receive the pushed notification.

Server Push isn't the same thing and was designed to solve a different use case. With HTTP/2 the server is able to send the client additional resources, even though the client hadn't explicitly requested them. 

A typical example given is when the client requests a HTTP page and that page has some static resources like CSS and JavaScript. In HTTP/1.x the client would request a web page, and then start parsing it only to discover the page includes CSS and JavaScript resources. The client would then have to make additional requests for those static resources.

But with HTTP/2 the server can save the client from making multiple requests by sending all the other static resources in parallel for the client's initial request for the main page/document.

<div id="8"></div>
## Implementations

Im not sure exactly how many implementations are available for the HTTP/2 specification out in the wild, but there are two that we'll look at here in this article: [nginx](https://www.nginx.com/) and [Go](https://golang.org/). 

If you're interested in other implementations then you can find a list of alternative options here: [github.com/http2/http2-spec/wiki/Implementations](https://github.com/http2/http2-spec/wiki/Implementations).

<div id="9"></div>
### Nginx

The latest release of nginx (both its open-source and paid for models) has good support for HTTP/2, but (for the moment at least) it doesn't support Server Push. I'm going to presume that you're already familiar with nginx and how it works, so I won't bother explaining things a basic nginx user would already know.

Below is a snippet from a `nginx.conf` file that has enabled HTTP/2 support:

```
http {
  server {
    listen *:443 ssl http2;
    server_name integralist.co.uk;

    ssl_certificate         /etc/nginx/certs/server.crt;
    ssl_certificate_key     /etc/nginx/certs/server.key;
    ssl_trusted_certificate /etc/nginx/certs/ca.crt;
  }
}
```

As you can see, the `listen` directive specifies `http2`. In essence this is all you would need to enable HTTP/2 using nginx. The reason we're restricting nginx to listening on port `443` and enabling `ssl` (+ specifying SSL certificates) is because the majority of web browsers require TLS in order to support HTTP/2, and also nginx's implementation relies upon TLS (see below for details).

> Note: currently Opera and Safari 9 supports HTTP/2 without TLS

Nginx is a reverse proxy and so because the client doesn't have direct access to the back-end services/applications, nginx is able to translate HTTP/2 into HTTP/1.x which also allows those services to not have to be rearchitected. 

When a client communicates with nginx it'll typically pass a list of protocols it supports along with the request. Nginx will attempt to identify the `h2` protocol within that list, which indicates HTTP/2 support (specifically nginx implements the [Application Layer Protocol Negotiation](https://tools.ietf.org/html/rfc7301) extension for TLS). If HTTP/2 isn't supported then nginx falls back to HTTP/1.x instead.

<div id="10"></div>
### Go

If you're not using a load balancer or a reverse proxy (such as nginx), then you might still be able to implement HTTP/2 support via your application server. One such example is with the Go programming language.

Below is an example application which demonstrates how to enable HTTP/2 support. Because we're not utilising a reverse proxy we don't have SSL termination handled automatically for us, and so our application will need to handle the TLS handshake process:

```
package main

import (
  "fmt"
  "html"
  "log"
  "net/http"

  "golang.org/x/net/http2"
)

func main() {
  var server http.Server

  http2.VerboseLogs = true
  server.Addr = ":8080"

  http2.ConfigureServer(&server, nil)

  http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "URL: %q\n", html.EscapeString(r.URL.Path))
    ShowRequestInfoHandler(w, r)
  })

  log.Fatal(server.ListenAndServeTLS("localhost.cert", "localhost.key"))
}
func ShowRequestInfoHandler(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "text/plain")

  fmt.Fprintf(w, "Method: %s\n", r.Method)
  fmt.Fprintf(w, "Protocol: %s\n", r.Proto)
  fmt.Fprintf(w, "Host: %s\n", r.Host)
  fmt.Fprintf(w, "RemoteAddr: %s\n", r.RemoteAddr)
  fmt.Fprintf(w, "RequestURI: %q\n", r.RequestURI)
  fmt.Fprintf(w, "URL: %#v\n", r.URL)
  fmt.Fprintf(w, "Body.ContentLength: %d (-1 means unknown)\n", r.ContentLength)
  fmt.Fprintf(w, "Close: %v (relevant for HTTP/1 only)\n", r.Close)
  fmt.Fprintf(w, "TLS: %#v\n", r.TLS)
  fmt.Fprintf(w, "\nHeaders:\n")

  r.Header.Write(w)
}
```

> Note: the above code has been slightly modified from an example originally conceived by [Kim Ilyong](https://plus.google.com/111824860449692850794/posts)

If you stick the above code into a file called `http2.go`, run the program and visit `https://localhost:8080/` in your browser (using one that supports HTTP/2 obviously), then you should see the following output (or something similar):

```
URL: "/"
Method: GET
Protocol: HTTP/2.0
Host: localhost:8080
RemoteAddr: [::1]:63555
RequestURI: "/"
URL: &url.URL{Scheme:"", Opaque:"", User:(*url.Userinfo)(nil), Host:"", Path:"/", RawPath:"", RawQuery:"", Fragment:""}
Body.ContentLength: 0 (-1 means unknown)
Close: false (relevant for HTTP/1 only)
TLS: &tls.ConnectionState{Version:0x303, HandshakeComplete:true, DidResume:false, CipherSuite:0xc02f, NegotiatedProtocol:"h2", NegotiatedProtocolIsMutual:true, ServerName:"localhost", PeerCertificates:[]*x509.Certificate(nil), VerifiedChains:[][]*x509.Certificate(nil), SignedCertificateTimestamps:[][]uint8(nil), OCSPResponse:[]uint8(nil), TLSUnique:[]uint8{0xf6, 0xb, 0xf8, 0x95, 0x6f, 0x73, 0x4f, 0x26, 0x8f, 0x72, 0x26, 0xab}}

Headers:
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Encoding: gzip, deflate, sdch
Accept-Language: en-US,en;q=0.8
Cache-Control: max-age=0
Cookie: _chartbeat2=CAgQSrCqRzJnCmxa4b.1434983427317.1434983759085.1
Dnt: 1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36
```

You'll notice the `Protocol: HTTP/2.0` which indicates we're handling HTTP/2 now. If you're using the Chrome web browser you can also download an extension called "HTTP/2 and SPDY indicator" which will display a blue lightning bolt on any site that is serving content via the HTTP/2 protocol.

<div id="11"></div>
## References

- [HTTP/2 FAQ](https://http2.github.io/faq/)
- [HTTP/2 Implementations](https://github.com/http2/http2-spec/wiki/Implementations)
- [Go HTTP/2 Demo Page](https://http2.golang.org/)
- [Go HTTP/2 Example Code](https://github.com/bradfitz/http2/tree/master/h2demo)

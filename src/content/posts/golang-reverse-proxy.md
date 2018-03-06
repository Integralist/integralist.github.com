---
title: "Golang Reverse Proxy"
date: 2018-03-03T17:08:13Z
categories:
  - "code"
  - "guide"
tags:
  - "go"
  - "golang"
  - "proxy"
draft: false
---

- [Introduction](#1)
- [Example Python Origin Code](#2)
- [Example Golang Proxy Code](#3)
- [Demonstration](#4)
- [Explanation](#5)
- [Conclusion](#6)

<div id="1"></div>
## Introduction

I was struggling to find a good (or just simple) reverse proxy solution written in [Go](https://golang.org/), so I decided to take what I had learnt from a work colleague of mine and put together a simple example for others to build upon if they needed a quick reference point.

In this example I have an origin server written in Python (for no other reason than to have a clearer distinction between the proxy and the origin) and which supports the endpoints `/`, `/foo` and `/bar/*` (where the wildcard glob means we support multiple variants of that, such as `/bar/baz`).

Each origin handler will print the http request headers, followed by sending a response body that correlates to the handler name (so for example, the `FooHandler` class will respond with `FOO!`, while the `BarHandler` class will response with `BAR!`).

<div id="2"></div>
## Example Python Origin Code

Here is our Python code using the [Tornado](http://www.tornadoweb.org/) web framework.

```
import tornado.ioloop
import tornado.web


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        print("MAIN HEADERS:\n\n", self.request.headers)
        self.write("MAIN!")


class FooHandler(tornado.web.RequestHandler):
    def get(self):
        print("FOO HEADERS:\n\n", self.request.headers)
        self.write("FOO!")


class BarHandler(tornado.web.RequestHandler):
    def get(self):
        print("BAR HEADERS:\n\n", self.request.headers)
        self.write("BAR!")


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/foo", FooHandler),
        (r"/bar.*", BarHandler),
    ])


if __name__ == "__main__":
    app = make_app()
    app.listen(9000)
    tornado.ioloop.IOLoop.current().start()
```

<div id="3"></div>
## Example Golang Proxy Code

There are two versions of the code, a simple version and a more advanced version that aims to handle more specific use cases.

The simple version uses just the Go standard library, where as the advanced version uses the standard library as well as a few a few external packages such as [httprouter](https://github.com/julienschmidt/httprouter) and [logrus](https://github.com/Sirupsen/logrus) for routing and logging respectively.

One difference between them that's worth mentioning is that in the simple version we use the `httputil.ReverseProxy` http handler directly, where as in the advanced version we use `httputil.NewSingleHostReverseProxy` to construct this for us. The advanced version also tries to normalise the paths by stripping trailing slashes and joining them up with the base path (if there was one, although ironically I don't define one in the advanced example).

### Simple

```
package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func main() {
	origin, _ := url.Parse("http://localhost:9000/")

	director := func(req *http.Request) {
		req.Header.Add("X-Forwarded-Host", req.Host)
		req.Header.Add("X-Origin-Host", origin.Host)
		req.URL.Scheme = "http"
		req.URL.Host = origin.Host
	}

	proxy := &httputil.ReverseProxy{Director: director}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		proxy.ServeHTTP(w, r)
	})

	log.Fatal(http.ListenAndServe(":9001", nil))
}
```

### Advanced

```
package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/Sirupsen/logrus"
	"github.com/julienschmidt/httprouter"
)

func singleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}

func main() {
	logrus.SetFormatter(&logrus.TextFormatter{})
	logrus.SetOutput(os.Stdout)
	logrus.SetLevel(logrus.InfoLevel)
	logger := logrus.WithFields(logrus.Fields{
		"service": "go-reverse-proxy",
	})

	router := httprouter.New()
	origin, _ := url.Parse("http://localhost:9000/")
	path := "/*catchall"

	reverseProxy := httputil.NewSingleHostReverseProxy(origin)

	reverseProxy.Director = func(req *http.Request) {
		req.Header.Add("X-Forwarded-Host", req.Host)
		req.Header.Add("X-Origin-Host", origin.Host)
		req.URL.Scheme = origin.Scheme
		req.URL.Host = origin.Host

		wildcardIndex := strings.IndexAny(path, "*")
		proxyPath := singleJoiningSlash(origin.Path, req.URL.Path[wildcardIndex:])
		if strings.HasSuffix(proxyPath, "/") && len(proxyPath) > 1 {
			proxyPath = proxyPath[:len(proxyPath)-1]
		}
		req.URL.Path = proxyPath
	}

	router.Handle("GET", path, func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		reverseProxy.ServeHTTP(w, r)
	})

	logger.Fatal(http.ListenAndServe(":9001", router))
}
```

<div id="4"></div>
## Demonstration

In order to run this example you should follow these instructions:

1. run the tornado application (e.g. `python tornado-origin.py`)
2. run the go application (e.g. `go run main.go`)
3. make http requests (shown below)

```
curl -v http://localhost:9001/
curl -v http://localhost:9001/foo
curl -v http://localhost:9001/foo/
curl -v http://localhost:9001/bar/baz
```

You should see output from the Python server that looks something like this:

```
FOO HEADERS:

Host: localhost:9001
User-Agent: curl/7.54.0
Accept: */*
X-Forwarded-Host: localhost:9001
X-Origin-Host: localhost:9000
```

<div id="5"></div>
## Explanation

OK, so let's step through the `main` function to see what's going on.

First we set up our basic logging configuration:

```
logrus.SetFormatter(&logrus.TextFormatter{})
logrus.SetOutput(os.Stdout)
logrus.SetLevel(logrus.InfoLevel)
logger := logrus.WithFields(logrus.Fields{
  "service": "go-reverse-proxy",
})
```

Next we create a new httprouter instance, we define the origin host (`http://localhost:9000/`) and the 'pattern' we want httprouter to look out for (`/*catchall`, which is a special syntax that represents a catchall wildcard/glob):

```
router := httprouter.New()
origin, _ := url.Parse("http://localhost:9000/")
path := "/*catchall"
```

Next we create a new reverse proxy instance, passing it the origin host (`http://localhost:9000/`):

```
reverseProxy := httputil.NewSingleHostReverseProxy(origin)
```

Followed by configuring the 'director' for the reverse proxy. The director is simply a function that modifies the received incoming request, while the response from the origin is copied back to the original client. 

In this example, we attach a few common proxy related headers to the incoming request and then modify its Scheme/Host to reflect the origin we wish to proxy it onto.

Next, we change the request path to the origin. What we do is ensure the path we request from the origin is whatever the base origin path is + the requested path (i.e. not just directing the request to the root/entrypoint of the origin).

In our example, our origin's path is just `/` where as the client will be requesting things like `/foo` and `/bar/baz`, so these would be appended to the origin's defined `/`. But we also make sure that when joining the origin's path with the incoming request path, that we avoid double slashes in the middle. 

Lastly, we ensure that any trailing slash is removed as well:

```
reverseProxy.Director = func(req *http.Request) {
  req.Header.Add("X-Forwarded-Host", req.Host)
  req.Header.Add("X-Origin-Host", origin.Host)
  req.URL.Scheme = origin.Scheme
  req.URL.Host = origin.Host

  wildcardIndex := strings.IndexAny(path, "*")
  proxyPath := singleJoiningSlash(origin.Path, req.URL.Path[wildcardIndex:])
  if strings.HasSuffix(proxyPath, "/") && len(proxyPath) > 1 {
    proxyPath = proxyPath[:len(proxyPath)-1]
  }
  req.URL.Path = proxyPath
}
```

Finally, we setup the handler for the `/*catchall` httprouter path. In this case we don't do anything other than call the reverse proxy's `ServeHTTP` method and pass it the original `ResponseWriter` and http `Request`. We then kick start the httprouter using `ListenAndServe`:

```
router.Handle("GET", path, func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
  reverseProxy.ServeHTTP(w, r)
})

logger.Fatal(http.ListenAndServe(":9001", router))
```

<div id="6"></div>
## Conclusion

That's all there is to it.

You could also wrap the function passed to `router.Handle` in a middleware function so that you're able to do extra processing. A common example of this is to authenticate the incoming request _before_ it is proxied to the origin (meaning you can reject the request if necessary).

---
title: "Fastly Varnish"
date: 2017-11-02T13:00:00+01:00
categories:
  - "code"
  - "development"
  - "guide"
  - "performance"
tags:
  - "cdn"
  - "fastly"
  - "varnish"
  - "vcl"
draft: false
---

- [Introduction](#1)
- [Varnish Default VCL](#2)
- [Fastly Custom VCL](#3)
- [Fastly Request Flow Diagram](#4)
- [Hit for Pass](#5)
- [Serving Stale](#6)
- [Conclusion](#7)

<div id="1"></div>
## Introduction

[Varnish](https://varnish-cache.org/) is an open-source HTTP accelerator.  
More concretely it is a web application that acts like a [HTTP reverse-proxy](https://en.wikipedia.org/wiki/Reverse_proxy). 

You place Varnish in front of your application servers (those that are serving HTTP content) and it will cache that content for you. If you want more information on what Varnish cache can do for you, then I recommend reading through their [introduction article](https://varnish-cache.org/intro/index.html) (and watching the video linked there as well).

[Fastly](https://www.fastly.com/) is many things, but for most people they are a CDN provider who utilise a highly customised version of Varnish. This post is about Varnish and explaining a couple of specific features (such as hit-for-pass and serving stale) and how they work in relation to Fastly's implementation of Varnish.

This is not a "VCL 101". If you need help understanding anything mentioned in this post, then I recommend reading:

- [Varnish Book](http://book.varnish-software.com/4.0/)
- [Varnish Blog](https://info.varnish-software.com/blog)
- [Fastly Blog](https://www.fastly.com/blog)

> Fastly has a couple of _excellent_ articles on utilising the `Vary` HTTP header (highly recommended reading).

The reason for this post is because when dealing with Varnish and VCL it gets very confusing having to jump between official documentation for VCL and Fastly's specific implementation of it. Even more so because the version of Varnish Fastly are using is now quite old and yet they've also implemented some features from more recent Varnish versions. Meaning you end up getting in a muddle about what should and should not be the expected behaviour (especially around the general request flow cycle).

<div id="2"></div>
## Varnish Default VCL

When using the open-source version of Varnish, you'll typically implement your own custom VCL logic (e.g. add code to `vcl_recv` or any of the other common VCL subroutines). But it's important to be aware that if you don't `return` an action (e.g. `return(pass)`, or trigger any of the other available Varnish 'states'), then Varnish will continue to execute its own built-in VCL logic (i.e. its built-in logic is _appended_ to your custom VCL).

You can view the 'default' (or 'builtin') logic for each version of Varnish via GitHub:

- [Varnish v2.1](https://github.com/varnishcache/varnish-cache/blob/2.1/bin/varnishd/default.vcl) (the version used by Fastly)
- [Varnish v3.0](https://github.com/varnishcache/varnish-cache/blob/3.0/bin/varnishd/default.vcl)
- [Varnish v4.0](https://github.com/varnishcache/varnish-cache/blob/4.0/bin/varnishd/builtin.vcl)
- [Varnish v5.0](https://github.com/varnishcache/varnish-cache/blob/5.0/bin/varnishd/builtin.vcl)

> Note: after v3 Varnish renamed the file from `default.vcl` to `builtin.vcl`.

But things are slightly different with Fastly's Varnish implementation (which is based off Varnish open-source version 2.1.5).

Specifically:

- no `return(pipe)` in `vcl_recv`, they do `pass` there
- some modifications to the `synthetic` in `vcl_error`

<div id="3"></div>
## Fastly Custom VCL

On top of the built-in VCL the open-source version of Varnish uses, Fastly also includes its own 'custom' VCL logic alongside your own additions.

You can see Fastly's VCL boilerplate, and learn more about their custom VCL implementation [here](https://docs.fastly.com/guides/vcl/mixing-and-matching-fastly-vcl-with-custom-vcl).

You can also view their generated custom VCL here in this isolated gist (for reference purposes):

- [Fastly's Custom VCL](https://gist.github.com/Integralist/56cf991ae97551583d5a2f0d69f37788)

<div id="4"></div>
## Fastly Request Flow Diagram

Below is a diagram of Fastly's VCL request flow (including its WAF and Clustering logic)...

<a href="../../images/fastly-request-flow.png">
    <img src="../../images/fastly-request-flow.png">
</a>

This is very useful for confirming how your VCL logic is expected to behave.

<div id="5"></div>
## Hit for Pass

You may notice in Varnish's built-in `vcl_fetch` the following logic:

```vcl
sub vcl_fetch {
    if (!beresp.cacheable) {
        return (pass);
    }
    if (beresp.http.Set-Cookie) {
        return (pass);
    }
    return (deliver);
}
```

Now typically when you `return(pass)` you do that in `vcl_recv` to indicate to Varnish you do not want to lookup the content in the cache and to skip ahead to fetching the content from the origin. But when you `return(pass)` from `vcl_fetch` it causes a slightly different behaviour. Effectively we're telling Varnish we don't want to cache the content we've received from the origin.

> In the case of the VCL logic above, we're not caching this content because we can see there is a cookie set (indicating possibly unique user content).

You'll probably also notice in some organisation's own custom `vcl_fetch` the following additional logic:

```vcl
if (beresp.http.Cache-Control ~ "private") {
  return(pass);
}
```

This content isn't cached simply because the backend has indicated (via the `Cache-Control` header) that the content is `private` and so should not be cached.

But you'll find that even though you've executed a `return(pass)` operation, Varnish will _still_ create an object and cache it.

The object it creates is called a "hit-for-pass" (if you look back at the Fastly request flow diagram above you'll see it referenced) and it is given a ttl of 120s (i.e. it'll be cached for 120 seconds).

> Note: the ttl can be changed using vcl but it should be kept small

The reason Varnish creates an object and caches it is because if it _didn't_, when `return(pass)` is executed and the content subsequently is not cached, then if another request is made for that same resource, we would find "request collapsing" causes a performance issue for users.

Request collapsing is where Varnish blocks requests for what looks to be the same uncached resource. It does this in order to prevent overloading your origin. So for example, if there are ten requests for an uncached resource, it'll allow one request through to origin and block the other nine until the origin has responded and the content has been cached. The nine requests would then get the content from the cache. 

But in the case of uncachable content (e.g. content that uses cookies typically will contain content that is unique to the user requesting the resource) users are blocked waiting for an existing request for that resource to complete, only to find that as the resource is uncacheable the request needs to be made again (this cycle would repeat for each user requesting this unique/uncacheable resource).

As you can imagine, this is very bad because the requests for this uncachable content has resulted in sequential processing. 

So when we "pass" inside of `vcl_fetch` Varnish prevents this bad sequential processing. It does this by creating a "hit-for-pass" object which has a short ttl of 120s, and so for the next 120s any requests for this same resource will _not_ result in request collapsing (i.e. user requests to origin will not be blocked waiting for an already "in-flight" origin request to complete). Meaning, _all_ requests will be sent straight through to the origin.

In order for this processing to work, we need `vcl_hit` to check for a "hit-for-pass" object. If we check Varnish's built-in logic we can see:

```vcl
sub vcl_hit {
    if (!obj.cacheable) {
        return (pass);
    }
    return (deliver);
}
```

What this does is it checks whether the object we found in the cache has the attribute `cacheable` set to 'false', and if it does we'll not deliver that cached object to the user but instead skip ahead to fetching the resource again from origin.

By default this `cacheable` attribute is set to 'true', but when Varnish executes `return(pass)` from inside of `vcl_fetch` it caches the "hit-for-pass" object with the `cacheable` attribute set to 'false'.

The reason the ttl for a "hit-for-pass" object is supposed to be short is because, for that period of time, your origin is susceptible to multiple requests. So you don't want your origin to become overloaded by lots of traffic for uncacheable content.

> See [this Varnish blog post](https://info.varnish-software.com/blog/hit-for-pass-varnish-cache) for the full details.

<div id="6"></div>
## Serving Stale

If we get a 5xx error from our origins we don't cache them.

But instead of serving that 5xx to the user (or even a custom 500 error page), we'll attempt to locate a 'stale' version of the content and serve that to the user instead (i.e. 'stale' in this case means a resource that was requested and cached previously, but the object was marked as being something that could be served stale if its 'stale ttl' has yet to expire).

The reason we do this is because serving old (i.e. stale) content is better than serving an error.

In order to serve stale we need to add some conditional checks into our VCL logic.

You'll typically notice in both `vcl_fetch` and `vcl_deliver` there are checks for a 5xx status code in the response we got back from origin, and subsequently a further check for `stale.exists` if we found a match for a 5xx status code. It looks something like the following:

```vcl
if (<object>.status >= 500 && <object>.status < 600) {
  if (stale.exists) {
    # ...
  }
}
```

> Where `<object>` is either `beresp` (`vcl_fetch`) or `resp` (`vcl_deliver`). 

When looking at the value for `stale.exists`, if it returns 'true', it is telling us that there is an object in the cache whose ttl has expired but as far as Varnish is concerned is still valid for serving as stale content. The way Varnish knows whether to keep a stale object around so it can be used for serving as stale content depends on the following settings:

```vcl
set beresp.stale_while_revalidate = <N>s;
set beresp.stale_if_error = <N>s;
```

> Where `<N>` is the amount of time in seconds you want to keep the object for after its ttl has expired.

- `stale_while_revalidate`: when cache ttl expires, we'll serve stale for 60s while we acquire fresh content
- `stale_if_error`: if we have an error, we'll serve stale for 1hr while we acquire fresh content

> You can find more details on Fastly's implementation [here](https://docs.fastly.com/guides/performance-tuning/serving-stale-content) as well as a blog post announcing this feature [here](https://www.fastly.com/blog/stale-while-revalidate-stale-if-error-available-today/).

### Different actions for different states

So if we find a stale object, we need to deliver it to the user. But the action you take (as far as Fastly's implementation of Varnish is concerned) depends on which state Varnish currently is in (`vcl_fetch` or `vcl_deliver`). 

When you're in `vcl_fetch` you'll `return(deliver_stale)` and in `vcl_deliver` you'll `return(restart)`.

#### Why the difference?

The reason for this difference is to do with Fastly's Varnish implementation and how they handle 'clustering'.

According to Fastly you'll typically find, due to the way their 'clustering' works, that `vcl_fetch` and `vcl_deliver` generally run on _different_ servers (although that's not always the case, as we'll soon see) and so different servers will have different caches.

> "What we refer to as 'clustering' is when two servers within the same POP communicate with each other for cache optimization purposes" -- Fastly

#### The happy path (stale found in `vcl_fetch`)

If a stale object is found in `vcl_fetch`, then `deliver_stale` will send the found stale content to `vcl_deliver` with a status of 200. This means when `vcl_deliver` checks the status code it'll not see a 5xx and so it'll just deliver that stale content to the user.

#### The longer path (stale found in `vcl_deliver`)

Imagine `vcl_fetch` is running on server `A` and `vcl_deliver` is running on server `B` (due to Fastly's 'clustering' infrastructure) and you looked for a stale object in `vcl_fetch`. The stale object might not exist there and so you would end up passing whatever the origin's 5xx response was onto `vcl_deliver` running on server `B`. 

Now in `vcl_deliver` we check `stale.exists` and it might tell us that an object _was_ found, remember: this is a different server with a different cache. 

In this scenario we have a 5xx object that we're about to deliver to the client, but on this particular server (`B`) we've since discovered there is actually a stale object we can serve to the user instead. So how do we now give the user this stale object and not the 5xx content that came from origin?

In order to do that, we need to restart the request cycle. When we `return(restart)` in `vcl_deliver` it forces Fastly's version of Varnish to break its clustering behaviour and to now route the request completely through whatever server `vcl_deliver` is currently running on (in this example it'll ensure the entire request flow will go through server `B` - which we know has a stale object available).

This means we end up processing the request again, but this time when we make a request to origin and get a 5xx back, we will (in `vcl_fetch`) end up finding the stale object (remember: our earlier restart has forced clustering behaviour to be broken so we're routing through the same server `B`). Now we find `stale.exists` has matched in `vcl_fetch` we will `return(deliver_stale)` (which we failed to do previously due to the stale object not existing on server `A`) and this means the stale content with a status of 200 is passed to `vcl_deliver` and that will subsequently deliver the stale object to the client.

#### The unhappy path (stale not found anywhere)

In this scenario we don't find a stale object in either `vcl_fetch` or `vcl_deliver` and so we end up serving the 5xx content that we got from origin to the client. Although in the case of BuzzFeed we will attempt to restart the request and through the use of a new header (`set req.http.X-Serve-500-Page = "true"`) this will indicate to `vcl_recv` that we want to short-circuit the request cycle and serve our custom "Uh-oh" error page instead.

<div id="7"></div>
## Conclusion

So there we have it, a quick run down of how some important aspects of Varnish and VCL work (and specifically for Fastly's implementation).

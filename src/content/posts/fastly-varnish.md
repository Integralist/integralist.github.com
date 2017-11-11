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
- [State Variables](#4.1)
- [Persisting State](#4.2)
- [Hit for Pass](#5)
- [Serving Stale](#6)
- [Conclusion](#7)

<div id="1"></div>
## Introduction

[Varnish](https://varnish-cache.org/) is an open-source HTTP accelerator.  
More concretely it is a web application that acts like a [HTTP reverse-proxy](https://en.wikipedia.org/wiki/Reverse_proxy). 

You place Varnish in front of your application servers (those that are serving HTTP content) and it will cache that content for you. If you want more information on what Varnish cache can do for you, then I recommend reading through their [introduction article](https://varnish-cache.org/intro/index.html) (and watching the video linked there as well).

[Fastly](https://www.fastly.com/) is many things, but for most people they are a CDN provider who utilise a highly customised version of Varnish. This post is about Varnish and explaining a couple of specific features (such as hit-for-pass and serving stale) and how they work in relation to Fastly's implementation of Varnish.

One stumbling block for Varnish is the fact that it only accelerates HTTP, not HTTPS. In order to handle HTTPS you would need a TLS/SSL termination process sitting in front of Varnish to convert HTTPS to HTTP. Alternatively you could use a termination process (such as nginx) _behind_ Varnish to fetch the content from your origins over HTTPS and to return it as HTTP for Varnish to then process and cache.

> Note: Fastly helps both with the HTTPS problem, and also with scaling Varnish in general.

### Varnish Basics

Varnish is a 'state machine' and it switches between these states via calls to a `return` function (where you tell the `return` function which state to move to). The various states are:

- `recv`: request is received and can be inspected/modified.
- `hash`: generate a hash key from host/path and lookup key in cache.
- `hit`: hash key was found in the cache.
- `miss`: hash key was not found in the cache.
- `pass`: content should be fetched from origin, regardless of if it exists in cache or not, and response will not be cached.
- `pipe`: content should be fetched from origin, and no other VCL will be executed.
- `fetch`: content has been fetched, we can now inspect/modify it before delivering it to the user.
- `deliver`: content has been cached (or not, if we had used `return(pass)`) and ready to be delivered to the user.

For each state there is a corresponding subroutine that is executed. It has the form `vcl_<state>`, and so there is a `vcl_recv`, `recv_hash`, `recv_hit` etc.

So in `vcl_recv` to change state to "pass" you would execute `return(pass)`. If you were in `vcl_fetch` and wanted to move to `vcl_deliver`, then you would execute `return(deliver)`.

> Note: `vcl_hash` is the only exception because it's not a _state_ per se, so you don't execute `return(hash)` but `return(lookup)` as this helps distinguish that we're performing an action and not a state change (i.e. we're going to _lookup_ in the cache).

The reason for this post is because when dealing with Varnish and VCL it gets very confusing having to jump between official documentation for VCL and Fastly's specific implementation of it. Even more so because the version of Varnish Fastly are using is now quite old and yet they've also implemented some features from more recent Varnish versions. Meaning you end up getting in a muddle about what should and should not be the expected behaviour (especially around the general request flow cycle).

Ultimately this is not a "VCL 101". If you need help understanding anything mentioned in this post, then I recommend reading:

- [Varnish Book](http://book.varnish-software.com/4.0/)
- [Varnish Blog](https://info.varnish-software.com/blog)
- [Fastly Blog](https://www.fastly.com/blog)

> Fastly has a couple of _excellent_ articles on utilising the `Vary` HTTP header (highly recommended reading).

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

There are various request flow diagrams for Varnish ([example](http://book.varnish-software.com/4.0/_images/simplified_fsm.svg)) and generally they separate the request flow into two sections: request and backend. 

So handling the request, looking up the hash key in the cache, getting a hit or miss, or opening a pipe to the origin are all considered part of the "request" section. Where as fetching of the content is considered part of the "backend" section.

The purpose of the distinction is because Varnish likes to handle backend fetches _asynchronously_. This means Varnish can serve stale data while a new version of the cached object is being fetched. This means less request queuing when the backend is slow.

But the issue with these diagrams is that they're not all the same. Changes between Varnish versions and also the difference in Fastly's implementation make identifying the right request flow tricky.

Below is a diagram of Fastly's VCL request flow (including its WAF and Clustering logic). This is a great reference for confirming how your VCL logic is expected to behave.

<a href="../../images/fastly-request-flow.png">
    <img src="../../images/fastly-request-flow.png">
</a>

<div id="4.1"></div>
## State Variables

Each Varnish 'state' has a set of built-in variables you can use.

Below is a list of available variables and which states they're available to:

> Based on Varnish 3.0 (which is the only explicit documentation I could find on this), although you can see in various request flow diagrams for different Varnish versions the variables listed next to each state. But [this](http://book.varnish-software.com/3.0/VCL_functions.html#variable-availability-in-vcl) was the first explicit list I found.

Here's a quick key for the various states:

- *R*: recv
- *F*: fetch
- *P*: pass
- *M*: miss
- *H*: hit
- *E*: error
- *D*: deliver
- *I*: pipe
- *#*: hash

||R|F|P|M|H|E|D|I|#|
|:---|---|---|---|---|---|---|---|---|---|
|`req.*`|R/W|R/W|R/W|R/W|R/W|R/W|R/W|R/W|R/W|
|`bereq.*`||R/W|R/W|R/W||||R/W||
|`obj.hits`|||||R||R|||
|`obj.ttl`|||||R/W|R/W||||
|`obj.grace`|||||R/W|||||
|`obj.*`|||||R|R/W||||
|`beresp.*`||R/W||||||||
|`resp.*`||||||R/W|R/W|||

> For the values assigned to each variable:  
> `R/W` is "Read and Write",  
> and `R` is "Read"  
> and `W` is "Write"

When you're dealing with `vcl_recv` you pretty much only ever interact with the `req` object. You generally will want to manipulate the incoming request _before_ doing anything else.

> Note: the only other reason for setting data on the `req` object is when you want to keep track of things (because, as we can see from the above table matrix, the `req` object is available to R/W from _all_ available states).

Once a lookup in the cache is complete (i.e. `vcl_hash`) we'll end up in either `vcl_miss` or `vcl_hit`. If you end up in `vcl_hit`, then generally you'll look at and work with the `obj` object (this `obj` is what is pulled from the cache - so you'll check properties such as `obj.cacheable` for dealing with things like 'hit-for-pass'). 

If you were to end up at `vcl_miss` instead, then you'll probably want to manipulate the `bereq` object and not the `req` object because manipulating the `req` object doesn't affect the request that will shortly be made to the origin. If you decide at this last moment you want to send an additional header to the origin, then you would set that header on the `bereq` and that would mean the request to origin would include that header.

Once a request is made, the content is copied into the `beresp` variable and made available within the `vcl_fetch` state. You would likely want to modify this object in order to change its ttl or cache headers because this is the last chance you have to do that before the content is stored in the cache.

Finally, the `beresp` object is copied into `resp` and that is what's made available within the `vcl_deliver` state. This is the last chance you have for manipulating the response that the client will receive. Changes you make to this object doesn't affect what was stored in the cache (because that time, `vcl_fetch`, has already passed).

<div id="4.2"></div>
## Persisting State

Now that we know there are state variables available, and we understand generally when and why we would use them, let's now consider the problem of clustering (in the realm of Fastly's Varnish implementation) and how that plays an important part in understanding these behaviours. Because, if you don't understand Fastly's design you'll end up in a situation where data you're setting on these variables are being lost and you won't know why.

So let me give you a _real_ example: creating a HTTP header `X-VCL-Route` breadcrumb trail of the various states a request moves through (this is good for debugging, when you want to be sure your VCL logic is taking you down the correct path and through the expected state changes). 

To make this easier to understand I've created a diagram...

<a href="../../images/varnish-request-flow.png">
    <img src="../../images/varnish-request-flow.png">
</a>

In this diagram we can see the various states available to Varnish, but also we can see that the states are separated by an "edge" and "cluster" section.

> Note: this graph is a little misleading in that `vcl_error` should appear in both the "edge" sections, as well as the "cluster" section. We'll come back to this later on and explain why that is.

Now the directional lines drawn on the diagram represent the request flow you might see in a typical Varnish implementation (definitely in my case at any rate). 

Let's consider one of the example routes given: we can see a request comes into `vcl_recv` and from there it could trigger a `return(pass)` and so it would result in the request skipping the cache and going straight to `vcl_pass`, where it will then fetch the content from origin and subsequently end up in `vcl_fetch`. From there the content fetched from origin is stored in the cache and the cached content delivered to the client via `vcl_deliver`. 

That's one example route that could be taken. As you can see there are many more shown on the diagram, and many more I've not included.

But what's important to understand is that Fastly's infrastructure means that `vcl_recv`, `vcl_hash` and `vcl_deliver` are all executed on an edge node (the node nearest the client). Where as the other states are executed on a "cluster" node (or cache node).

We can see in [Fastly's documentation](https://docs.fastly.com/guides/performance-tuning/request-collapsing), certain VCL subroutines run on the edge and some on the shield (i.e. what we're calling "cluster"):

- Edge: 
  - `vcl_recv`, `vcl_hash` †, `vcl_deliver`, `vcl_log`, `vcl_error`  
- Shield (cluster): 
  - `vcl_miss`, `vcl_hit`, `vcl_pass`, `vcl_fetch`, `vcl_error`

> † not documented, but Fastly support suggested it would execute at the edge.

OK, so two more _really_ important things to be aware of at this point:

1. Data added to the `req` object _cannot_ persist across boundaries (except for when initially moving from the edge to the cluster).
2. Data added to the `req` object _can_ persist a restart, but _not_ when they are added from the cluster environment.

For number 1. that means: `req` data you set in `vcl_recv` and `vcl_hash` will be available in states like `vcl_pass` and `vcl_miss`.

For number 2. that means: if you were in `vcl_deliver` and you set a value on `req` and then triggered a restart, the value would be available in `vcl_recv`. Yet, if you were in `vcl_miss` for example and you set `req.http.X-Foo` and let's say in `vcl_fetch` you look at the response from the origin and see the origin sent you back a 5xx status, you might decide you want to restart the request and try again. But if you were expecting `X-Foo` to be set on the `req` object when the code in `vcl_recv` was re-executed, you'd be wrong. That's because the header was set on the `req` object while it was in a state that is executed on a cluster node; and so the `req` data set there doesn't persist a restart.

> If you're starting to think: "this makes things tricky", you'd be right :-)

Let's now revisit our requirement, which was to create a breadcrumb trail using a HTTP header (this is where all this context becomes important).

The first thing we have to do (in `vcl_recv`) is:

```
if (req.restarts == 0) {
  set req.http.X-VCL-Route = "VCL_RECV";
} else {
  set req.http.X-VCL-Route = req.http.X-VCL-Route ",VCL_RECV";
}
```

> Note: we check `req.restarts` to make sure we don't include a leading `,` unnecessarily.

So we know from the "[State Variables](#4.1)" section earlier, that the `req` object is available for reading and writing.

Varnish pretty much always calls `vcl_hash` at the end of `vcl_recv` so we add the following into `vcl_hash`:

```
set req.http.X-VCL-Route = req.http.X-VCL-Route ",VCL_HASH(host: " req.http.host ", url: " req.url ")";
```

You can see we're not setting the value anew on the header, but am _appending_ to the header.

> The idea of appending to the header, again makes things tricky (as we'll see) when we come to trying to persist data across not only the cluster but the caching of an object as well.

With the above 'note' fresh in your mind, let's look at `vcl_miss` and what we do there (remember `vcl_miss` is executing on a cluster node so anything we set on `req` won't persist a restart):

```
set req.http.X-PreFetch-Miss = ",VCL_MISS(" bereq.http.host bereq.url ")";
```

So we still set a value on the `req` object, but we don't append to `X-VCL-Route`, we instead create a new header `X-PreFetch-Miss`.

> The eagle eyed amongst you may notice we took the value we assigned to the new header from `bereq`. I do this for semantic reasons rather than any real _need_. When we move to `vcl_miss` the `req` object is copied to `bereq`. So to make the distinction that `req` (once outside of `vcl_recv`) is only useful for tracking information, I use `bereq` as the value source. But I could have just used `req.http.host` and `req.url` as the value assigned to the header.

Similarly in `vcl_pass` (that also executes on a cluster node), we create a new header again and don't append to `X-VCL-Route`:

```
set req.http.X-PreFetch-Pass = ",VCL_PASS";
```

Now at this point in the request cycle we know that `vcl_pass` and `vcl_miss` are both going to make a request to origin for content and subsequently end up in `vcl_fetch`. But as we'll see in a moment, in `vcl_fetch` we don't assign data to the `req` object this time, instead we assign to `beresp`:

```
set beresp.http.X-VCL-Route = req.http.X-VCL-Route;
set beresp.http.X-PreFetch-Pass = req.http.X-PreFetch-Pass;
set beresp.http.X-PreFetch-Miss = req.http.X-PreFetch-Miss;
set beresp.http.X-PostFetch = ",VCL_FETCH(status: " beresp.status ", url: " req.url ")";
```

So there are a few things happening here:

- We take the `X-VCL-Route` and we assign it to a header of the same name, but on the `beresp` object.
- We take the `X-PreFetch-Pass` and `X-PreFetch-Miss` headers and also assign those to the `beresp` object.
- Finally we create a new header `X-PostFetch` and give it a fresh value that indicates we're in the fetch state.

Why do we do this?

Firstly, when we move from `vcl_pass` or `vcl_miss` to `vcl_fetch` the content we fetched from origin is assigned to the object `beresp`. When we leave `vcl_fetch` the object `beresp` will be stored in the cache. So any header we set on that object will exist when we pull the object from the cache at a later time (e.g. when we lookup content in the cache and we move to `vcl_hit` that subroutine will have access to an `obj` object, which is the `beresp` object pulled from the cache).

Also when we leave `vcl_fetch` and move to `vcl_deliver`, the `beresp` object is copied into a new object (available in `vcl_deliver`) called `resp`. You'll find when `vcl_hit` moves to `vcl_deliver` the `obj` object which was pulled from the cache is also copied over to `resp` in `vcl_deliver`.

Now the reason why we set data onto `beresp` in `vcl_fetch` is because we're ultimately about to cross the boundary of a cluster node (`vcl_fetch`) to an edge node (`vcl_deliver`) and so if we were to continue setting data onto `req` (like we did in `vcl_pass` and `vcl_miss`), then that data would be lost by the time we changed state from `vcl_fetch` to `vcl_deliver`.

The reason we set separate headers for the `vcl_pass`, `vcl_miss` and `vcl_fetch` states is because we wanted to ensure the `beresp` object stored in the cache had a clean request history at the point in time when it was cached. Otherwise we would have issues later on when pulling the object from the cache and trying to append values in `vcl_deliver` (we could end up with large chunks of the breadcrumb trail duplicated).

So for this reason, we separate the baseline routing (i.e. `vcl_recv` and `vcl_hash`) from all the other states (e.g. `vcl_pass`, `vcl_miss`, `vcl_fetch`) and then when we arrive at `vcl_deliver` we grab the baseline `X-VCL-Route` header and append to it the values from `X-PreFetch-Pass`, `X-PreFetch-Miss` and `X-PostFetch` only once we identify (via other inputs - which we'll see shortly) the actual route taken.

Let's look at `vcl_deliver` and see what it is we do there to collate everything together:

```
if (resp.http.X-VCL-Route) {
  set req.http.X-VCL-Route = resp.http.X-VCL-Route;
}

if (fastly_info.state ~ "^HITPASS") {
  set req.http.X-VCL-Route = req.http.X-VCL-Route ",VCL_HIT(object: uncacheable, return: pass)";
}
elseif (fastly_info.state ~ "^HIT") {
  set req.http.X-VCL-Route = req.http.X-VCL-Route ",VCL_HIT(" req.http.host req.url ")";
}
else {
  if (resp.http.X-PreFetch-Pass) {
    set req.http.X-VCL-Route = req.http.X-VCL-Route resp.http.X-PreFetch-Pass;
  }

  if (resp.http.X-PreFetch-Miss) {
    set req.http.X-VCL-Route = req.http.X-VCL-Route resp.http.X-PreFetch-Miss;
  }

  if (resp.http.X-PostFetch) {
    set req.http.X-VCL-Route = req.http.X-VCL-Route resp.http.X-PostFetch;
  }
}

set req.http.X-VCL-Route = req.http.X-VCL-Route ",VCL_DELIVER";
```

So we start by checking if there is a `X-VCL-Route` header available on the incoming object, and if so we overwrite the existing `req.http.X-VCL-Route` header with that `resp` object's value. This is important because we could have arrived at `vcl_deliver` from the edge node (or never even left the edge node) depending on specific scenarios such as going from `vcl_recv` straight to `vcl_error`.

This point about `vcl_error` is _very_ important, we'll skip that discussion for moment and come back to it.

Next in `vcl_deliver`, once we have reset the `X-VCL-Route` header on the `req` object, we look at `fastly_info.state` which is Fastly's own internal system for tracking the current state of Varnish. We first look to see if we've had a 'hit-for-pass' (see the [next section](#5) for details on that), and if so we append the relevant information to the header. Next we check we had a hit from an earlier cache lookup, again, if we have then we append the relevant information.

> If you want more information on `fastly_info.state` see [this community comment](https://community.fastly.com/t/useful-variables-to-log/303/3).

After that we check if the `X-PreFetch-Pass`, `X-PreFetch-Miss` or `X-PostFetch` headers exist, and if so we append the relevant details to the `X-VCL-Route` header. Finally leaving us with appending the _current_ state (i.e. we're in `vcl_deliver`) to the header.

Right, OK so now let's go back and revisit `vcl_error`...

The `vcl_error` subroutine is a tricky one because it exists in _both_ the edge and the cluster environments. 

Meaning if you execute `error 401` from `vcl_recv`, then `vcl_error` will execute in the context of the edge node; whereas if you executed an `error` from a cluster environment like `vcl_fetch`, then `vcl_error` would execute in the context of the cluster node.

Meaning, how you transition information between `vcl_error` and `vcl_deliver` could depend on whether you're on a edge or cluster node.

To help explain this I'm going to give another _real_ example, where I wanted to lookup some content in our cache and if it didn't exist I wanted to restart the request and use a different origin server to serve the content.

To do this I expected the route to go from `vcl_recv`, to `vcl_hash` and the lookup to fail so we would end up in `vcl_miss`. Now from `vcl_miss` I could have triggered a restart, but anything I set on the `req` object at that point (such as any breadcrumb data appended to `X-VCL-Route`) would have been lost as we transitioned from the cluster back to the edge (where `vcl_recv` is).

I needed a way to persist the "miss" breadcrumb, so instead of returning a restart from `vcl_miss` I would trigger a custom error such as `error 901` and inside of `vcl_error` I have the following logic:

```
set obj.http.X-VCL-Route = req.http.X-VCL-Route;

if (fastly_info.state ~ "^MISS") {
  set obj.http.X-VCL-Route = obj.http.X-VCL-Route ",VCL_MISS(" req.http.host req.url ")";
}

set obj.http.X-VCL-Route = obj.http.X-VCL-Route ",VCL_ERROR";

if (obj.status == 901) {
  set obj.http.X-VCL-Route = obj.http.X-VCL-Route ",VCL_ERROR(status: 908, return: deliver)";

  return(deliver);
}
```

When we trigger an error an object is created for us. On that object I set our `X-VCL-Route` and assign it whatever was inside `req.http.X-VCL-Route` at that time †

> † which would include `vcl_recv`, `vcl_hash` and `vcl_miss`. Remember the `req` object _does_ persist across the edge/cluster boundaries, but _only_ when going from `vcl_recv`. After that, anything set on `req` is lost when crossing boundaries.

Now we could have arrived at `vcl_error` from `vcl_recv` (e.g. if in our `vcl_recv` we had logic for checking Basic Authentication and none was found on the incoming request we could decide from `vcl_recv` to execute `error 401`) or we could have arrived at `vcl_error` from `vcl_miss` (as per our earlier example). So we need to check the internal Fastly state to identify this, hence checking `fastly_info.state ~ "^MISS"`.

After that we append to the `obj` object's `X-VCL-Route` header our current state (i.e. so we know we came into `vcl_error`). Finally we look at the status on the `obj` object and see it's a 901 custom status code and so so we append that information so we know what happened.

But you'll notice we don't restart the request from `vcl_error`, because if we did come from `vcl_miss` the data in `obj` would be lost because ultimately it was set in a cluster environment (as `vcl_error` would be running in a cluster environment when coming from `vcl_miss`).

Instead we `return(deliver)`, because all that data assigned to `obj` is guaranteed to be copied into `resp` for us to reference when transitioning to `vcl_deliver` at the edge.

Once we're at `vcl_deliver` we continue to set breadcrumb tracking onto `req.http.X-VCL-Route` as we know that will persist a restart from the edge.

Phew! Well that was easy wasn't it...

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

> Note: the ttl can be changed using vcl but it should be kept small. Varnish implements a type known as a 'duration' and takes many forms: ms (milliseconds), s (seconds), m (minutes), h (hours), d (days), w (weeks), y (years). For example, `beresp.ttl = 1h`.

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

In this scenario we don't find a stale object in either `vcl_fetch` or `vcl_deliver` and so we end up serving the 5xx content that we got from origin to the client. Although you may want to attempt to restart the request and use a custom header (e.g. `set req.http.X-Serve-500-Page = "true"`) in order to indicate to `vcl_recv` that you want to short-circuit the request cycle and serve a custom error page instead.

<div id="7"></div>
## Conclusion

So there we have it, a quick run down of how some important aspects of Varnish and VCL work (and specifically for Fastly's implementation).

One thing I want to mention is that I am personally a HUGE fan of Fastly and the tools they provide. They are an amazing company and their software has helped BuzzFeed (and many other large organisations) to scale massively with ease.

I would also highly recommend watching this talk by Rogier Mulhuijzen (Senior Varnish Engineer - who currently works for Fastly) on "Advanced VCL": [vimeo.com/226067901](https://vimeo.com/226067901). It goes into great detail about some complex aspects of VCL and Varnish and really does a great job of elucidating them.

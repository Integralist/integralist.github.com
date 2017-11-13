---
title: "Load Testing Guidelines"
date: 2017-11-13T13:00:00+01:00
categories:
  - "development"
  - "guide"
tags:
  - "load-testing"
  - "performance"
draft: false
---

- [Introduction](#1)
- [Use real datasets](#2)
- [Identify collateral damage](#3)
- [Stub services if necessary](#4)
- [Distribute your traffic](#5)
- [Automate for reproducible runs](#6)
- [Consider disabling authentication](#7)
- [Don't immediately scale dependencies](#8)
- [Send traffic from different geographical regions](#9)
- [Decide if your tool should support reusing connections](#10)
- [Start testing a single instance, before moving onto clusters](#11)
- [Verify load using multiple strategies](#12)
- [Reset your environment between test runs](#13)
- [Document the results](#14)
- [Tools](#15)

<div id="1"></div>
## Introduction

This post should serve as a guideline for running load tests.

It is designed to be a concise list of notes and tips. 

For a list of load testing tools, including their reviews and benchmark results, I refer you to the "[Tools](#15)" section at the end.

<div id="2"></div>
## Use real datasets

Parse your access logs for real user requests, then replay those requests within your load test. Also be mindful of different time periods for more accurate distribution of transactions. Look for realistic worst case situations (there may be more than one).

<div id="3"></div>
## Identify collateral damage

What users or upstreams will be affected by this additional load?

Are there any vulnerable dependencies that should be: notified of the load test or protected from it? † ([see next section](#4))

> † not all services are completely isolated. Consider what happens when your services is using an external API service. If the API is doing its job right it should start rate limiting you (or denies you access for exceeding your thresholds). But that still doesn't necessarily mean you have to be a bad web citizen and start hammering their service (on a side note: you should probably be considering caching).

<div id="4"></div>
## Stub services if necessary

Rather than hit a real upstream, try creating a mock version. The benefit of doing this is that you can your mock service to allow for controlling the latency and/or throughput restraints (thus mimicking different failure scenarios and seeing how your service behaves under different conditions).

<div id="5"></div>
## Distribute your traffic

When your service response is fairly big, it’s easy to hit a network capacity limit, so if you’re seeing that your service doesn’t scale with addition of new instances, this may be the root cause. To help avoid this, use [distributed testing](https://github.com/tsenart/vegeta#usage-distributed-attacks) (here's an example [wrapper](https://gist.github.com/Integralist/e4b4e53dd09745b645e10e89fc133f63) to simplify the process).

<div id="6"></div>
## Automate for reproducible runs

Write simple scripts that let you coordinate a fresh load test run. Such as configuring mock services and defining specific strategies (e.g. running a '[soak](https://en.wikipedia.org/wiki/Soak_testing)' test vs. a shorter duration load test that mimicks a slow ramp-up in traffic pattern vs a load test that mimicks a 'thundering herd' approach).

<div id="7"></div>
## Consider disabling authentication

It can be hard to include auth tokens/keys in load testing tools, and as such it is often easier to use a network secured backend and a custom code branch that either allows for auth bypass or has no authentication.

> Note: although being able to load test with authentication is important as it could highlight important problem points in your architecture design.

<div id="8"></div>
## Don't immediately scale dependencies

If you have a dependency such as redis (or another type of data store), then leave it configured to the size it currently is. If you have a stage environment, it can be tempting to configure that stage resource to be identical to your production environment. But it would be better to first verify if that resource is even a problem point by analysing the results of an initial load test with all resources configured normally for that environment.

Once you've run your load test, if you find you're having no issues, then sure you _could_ consider increasing/scaling up the resource in question. But ultimately if it wasn't a problem before, then it is unlikely to be an issue once it has even more compute/memory/network/etc.

<div id="9"></div>
## Send traffic from different geographical regions

It can be beneficial to set-up load testing instances in multiple [regions and availability zones](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html). This is ideal for a highly dynamic application expected to be globally utilized, as it means you can accurately simulate traffic with different latency expectations. Although, if you have a simple/static application, maybe the use of [CDN edge caching](https://www.fastly.com/) is enough to mitigate concern.

<div id="10"></div>
## Decide if your tool should support reusing connections

A tool such as [Siege](https://github.com/JoeDog/siege) doesn’t support reusing existing http connections. This can be interesting as far as identifying how your system behaves under those conditions. But reusing existing connections is mostly preferred so that throughput can be properly verified. Tools such as [Vegeta](https://github.com/tsenart/vegeta) and [Wrk](https://github.com/wg/wrk) support connection reuse and have better performance/features.

<div id="11"></div>
## Start testing a single instance, before moving onto clusters

We should ideally identify the threshold of a single instance before moving onto testing a cluster of instances. This is so that we can make appropriate tweaks to our application(s) based on the initial load testing results and should then help improve the initial cluster results as well.

<div id="12"></div>
## Verify load using multiple strategies

There are multiple types of load testing strategies: constant, ramp-up, soak test (and more). Research and identify which is the most appropriate for your service under test. It may be that you’ll want to execute multiple strategies.

<div id="13"></div>
## Reset your environment between test runs

Ensure your system is back to 'normal' (that means different things to different services) before starting another load test. Otherwise your test results will be skewed by the system being in a 'hot' state and could also mean putting your upstream services under [DoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) like scenarios.

<div id="14"></div>
## Document the results

It is beneficial for all (i.e. your team and others) to be able to review the load test results. Ensure each test is documented in a consistent, known and obvious location. For example, store them in a `/docs/load-tests` folder inside your service code base and include any key fixes (e.g. changes made that resolved a problem in your service performance).

<div id="15"></div>
## Tools

There are various load/stress testing tools available. 

The following, for me, are the top three open-source choices:

- [Siege](https://www.joedog.org/siege-home/)
- [Vegeta](https://github.com/tsenart/vegeta)
- [Wrk](https://github.com/wg/wrk)

For a review of these tools (and many more open-source options), please read:

- [Load Testing Tools Review](http://blog.loadimpact.com/open-source-load-testing-tool-review)
- [Load Testing Tools Benchmarks](http://blog.loadimpact.com/open-source-load-testing-tool-benchmarks)

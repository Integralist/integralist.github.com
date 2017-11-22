---
title: "Practical Monitoring"
date: 2017-11-22T13:00:00+01:00
categories:
  - "development"
  - "guide"
tags:
  - "instrumentation"
  - "monitoring"
  - "observability"
draft: false
---

- [Introduction](#1)
- [Does it work?](#2)
- [What metrics should we focus on?](#3)
- [Frequency and Aggregation](#4)
- [Data Collection Methods](#5)
- [Frontend Monitoring](#6)
- [Logging or Metrics?](#7)
- [What else to check for?](#8)
- [Conclusion](#9)

<div id="1"></div>
## Introduction

I've just finished reading [Practical Monitoring](http://shop.oreilly.com/product/0636920050773.do) "Effective Strategies for the Real World" by Mike Julian. It's a great book and highly recommended.

I'd like to share my thoughts on monitoring, based on both my past experience on the subject and also some interesting details found in Practical Monitoring. 

If you're new to monitoring then just be aware that this post isn't necessarily the "correct" way to do things. It's merely a combination of Mike Julian's experience, and my own, mangled together into a somewhat coherent reference post. With that in mind, take what bits interest you and feel free to leave the rest.

> Note: for a brief differentiation between terminology, see my earlier post: [Observability, Monitoring, Instrumentation](http://www.integralist.co.uk/posts/observability-monitoring-instrumentation/).

<div id="2"></div>
## Does it work?

While reading Practical Monitoring, the first thing I took note of was the following line...

> What does it mean for our service to be considered "working"?

I found this interesting because I've also been thinking about the same thing recently. I've found myself in situations where alarms (for systems I don't necessarily own) are firing and I'm trying to understand what the alarm really _means_. In most cases the alarm is firing on something not entirely useful and which doesn't 'clearly' indicate the problem. 

For example, if the alarm is firing because of high-level reasons like "the response status code wasn't a 200 OK" or "the request latency was under N seconds", then these things (although useful and are alarms we should include in our monitoring) don't actually help you to understand _what_ went wrong (i.e. the cause); they just indicate a symptom. That can be a cause for concern because at 3am on a Sunday morning you need to know what happened so you can quickly resolve the issue. Not now have to spend time debugging the issue.

I've not found the answer to this problem yet, although I believe providing more contextual information in the alarm should help. But I'm at least more aware of this as a problem area and is something I'm now pro-actively thinking about improving in our own systems.

<div id="3"></div>
## What metrics should we focus on?

A lot of the time you'll find alarms are configured to monitor OS level metrics like CPU or memory consumption. These are great for diagnostics and performance analysis, as they help to highlight the underlying system behaviour. But you should probably not be using these stats for alarming as their values can have relative meaning in different situations (I'll come back to this).

We should probably focus instead our monitorings on the outer layer of the overall system architecture: what does the end user experience? How can we identify if the problems we're seeing are bubbling up to the user and causing _real_ detrimental effects on our business and the trust associated with our product. 

Instead of looking at the memory usage and seeing it has raised beyond some arbitrarily selected threshold value that you've picked simply based off past usage, instead, try monitoring 5xx status code errors and slow latency times. These not only tell you something is wrong, but also that the problem is affecting your users (and that is the most critical of errors and is something you should wake up and fix _immediately_). 

> Note: although, as mentioned earlier - this still doesn't tell us _what_ went wrong. That's a problem that requires extra contextual information.

Also consider using percentage based monitoring rather than static thresholds. For example, a static threshold might look like "Free disk space is &lt; 10%" (which in itself is relative to the system, because 10% of 1 terabyte isn't the same thing as 10% of 1 gigabyte), whereas a more useful percentage monitor would look like "Disk usage has _grown_ by 50%" (that indicates much more than the static threshold).

A key comment made in the book was...

> Go as deep and wide with your instrumentation as you want, but always be asking yourself, "How will these metrics show me the user impact?"

Once you have those items covered, you can start moving further inwards to other layers beyond that. The deeper you go, the more specific your alarms become, and the less useful they become at identifying trends and patterns.

Importantly, static thresholds have a habit of raising false alarms (spikes in data that cross our thresholds). This happens so frequently, and is such a problem that some tools offer "flapping detection" to help prevent these _deviations_.

Ultimately, monitoring doesn't fix anything. If you find yourself spending more and more time on investigating alarms, you should really start investing time towards _fixing_ the things raised by these service alarms and thus making the service much more resilient in future.

> Note: after each critical alarm fired, you should schedule time in your next team/sprint planning session to discuss steps to mitigate the issue in future (there is a whole area of discussion known as "[post-mortem](https://en.wikipedia.org/wiki/Postmortem_documentation)").

<div id="4"></div>
## Frequency and Aggregation

The more data you have, the more things you can do with that data. So it's suggested that you should be collecting metrics at 60 seconds intervals (more frequent, if you have a high-traffic service).

When dealing with a TSDB ([Time Series Database](https://en.wikipedia.org/wiki/Time_series_database)) you'll find that, after a period of time, it will start to aggregate multiple datapoints into a single datapoint. This is also known as its "roll up" method.

> Note: TSDB's are made up of key/value pairs. The key is the timestamp and the value is the metric value at that point in time.

<div id="5"></div>
## Data Collection Methods

There are fundamentally two methods for data collection:

1. Push: _send_ metrics to an analysis tool.
2. Pull: configure a health check endpoint, that a centralised tool pulls data from.

> Note: when defining a health endpoint, you should consider A.) locking access behind an [ACL](https://en.wikipedia.org/wiki/Access_control_list) and B.) then adding more contextual information to allow humans (not just machines) to better understand the state of the system. Such as, are we able to connect to the Database? Just be mindful of the overhead these health endpoints can subsequently cause on your system dependencies.

You'll find with a lot of analysis tools ([Datadog](https://www.datadoghq.com/) being an example), that there are various metric 'types' you can collect data as. Two common ones are:

1. Counter: ever increasing value
2. Gauge: point-in-time value

A counter can be reset to zero, but otherwise its value simply increases. This is useful for things like "number of visitors". Where as a gauge allows your analysis tool to take these multiple datapoints and to plot them out onto a graph.

> Note: depending on your analysis tool, it might store a counter as a data type that can then be mapped to a graph.

<div id="6"></div>
## Frontend Monitoring

There are two main approaches to frontend monitoring: 

1. Real User Monitoring (RUM).
2. Synthetic. 

The difference between them has to do with the type of traffic that is triggering the data collection. For example, with RUM the requests being processed are from _real_ users, whereas with 'synthetic' the requests are fake (i.e. generated by your own software) and this then causes data to be collected for analysis (allowing you to identify the availability and performance of your system).

<div id="7"></div>
## Logging or Metrics?

In the beginning I thought logs were inexpensive and could be collected en masse no problem. I was wrong about that. Logging is expensive (in the real-world cost sense) and so you should be prudent with what you log. 

Now being prudent with logs isn't only beneficial for the practical storage/analysis costs, but it can also help with the 'noise to signal' ratio (where too many logs makes it difficult to sift through).

My approach nowadays is to have logs only indicate errors (utilise [log levels](http://www.integralist.co.uk/posts/logging-101/) to help you). That way if I see something in the logs, it means there are problems remaining to be fixed. If I see nothing in my logs (except some application bootup information), then I know all is well.

> Note: that approach might not work for everyone, but I've found it to be useful.

Practical Monitoring recommends identifying the types of questions you would ask about your service when something does go wrong. Those questions you typically ask should drive the decision on what information you should log.

With all that said, what about collecting data as metrics instead of being recorded as a log? When does it make sense to use one over the other?

In order to help individual teams identify whether they should collect data as a metric or as a log, Practical Monitoring recommends asking the following questions:

1. is it easier for your team to think about metrics or logs?
2. is it more effective for the thing in question to be a log entry or metric?

For number 1. I've found most teams prefer metrics as there's more things we can do with that data once stored into our data analysis tools (such as [Datadog](https://www.datadoghq.com/)). For number 2. what constitutes "effective" will be team specific. For myself it's a mixture of real-world costs and ease of consumption.

So typically I'll collect an error or exception as a log _and_ as a metric. The metric allows me to monitor a rise in that particular error (as I'm not sitting around staring at dashboards of log files all day) and so when an alarm does fire I'll be able to jump over to the logs and get the additional context I need.

> Note: again, that approach might not sit or work well for you and your team. [YMMV](https://dictionary.cambridge.org/dictionary/english/ymmv).

For mostly everything else I'll collect the data as a metric so I can create useful dashboards of information. Any other logs I record will have their visibility controlled by log levels and typically are 'enabled' while running the application locally in 'development' mode (or similarly when run on a stage environment).

<div id="8"></div>
## What else to check for?

Just to quickly finish up, here are some other 'grab bag' of notes I made whilst reading Practical Monitoring.

When dealing with memory consumption issues, you should keep an eye out for the "OOMKiller". In most Linux systems when the amount of memory used by a process exceeds its threshold, then it will be killed. What determines if a container should be killed is a process that runs directly on the host referred to as the [OOMKiller](https://en.wikipedia.org/wiki/Out_of_memory#Out_of_memory_management).

So you should look out for instances of the OOMKiller in your syslog by grepping (or using whatever filtering tools are available with your log aggregation system) for the phrase "killed process". You should also look at setting an alert in your log management system for any occurrences. 

For services that receive requests from clients (such as web servers or API endpoints), you should definitely monitor "requests per second" (RPS) as these are clear indicators of the performance and available throughput of your service.

If your system utilises message queues (such as [NSQ](http://nsq.io/)), then two key items to monitor are:

1. Queue length: total number of messages waiting to be processed.
2. Consumption rate: rate of messages being consumed by subscribers.

You want to be sure your queue length doesn't become too long and that the consumption rate stays consistent (and high), because it otherwise means there's an issue with the upstream services (e.g. they're unable to pull and process messages quickly enough).

> Note: I'll have a post written soon about 'best practices' for building queue based systems.

When dealing with a caching layer, the key items to monitor are:

1. Number of evicted items
2. Hit/Miss Ratio

For example, if you notice a lot of evicted items, then it could be an indicator that your cache is too small. Whereas if you notice a higher number of MISS than HIT being reported, then this is indicating a possible problem with your caching algorithm or cache protection in general (you need to review what constitutes a cache hit and why downstream content might not being cached - are they sending back the wrong response headers or have they been configured incorrectly).

Finally, remember to add appropriate context to monitors/alarms. When the person on-call has no idea of what your service does, it can be very useful to include useful contextual information to help them understand what has gone wrong as well as where they can go next to debug the issue and know how to resolve it.

<div id="9"></div>
## Conclusion

So there you have it, a quick run down of some important monitoring learnings. If you've struggled to follow along with this post, then I strongly recommend you go buy [Practical Monitoring](http://shop.oreilly.com/product/0636920050773.do) as it was a very enjoyable read.

Another interesting/useful resource was [this post](https://www.datadoghq.com/blog/timeseries-metric-graphs-101/) by Datadog on the various types of graphs they support, and when it's most appropriate to use them.

---
title: "Logging 101"
date: 2017-11-12T13:00:00+01:00
categories:
  - "101"
  - "development"
  - "guide"
tags:
  - "logging"
  - "logs"
draft: false
---

- [Logs?](#1)
- [Levels](#2)
- [Quality](#3)

<div id="1"></div>
## Logs?

Applications should record information/events to make debugging and understand what the program is doing easier.

Typically this information is recorded into a [log file](https://en.wikipedia.org/wiki/Log_file).

But in some cases it is preferred to send this information to [stdout](https://en.wikipedia.org/wiki/Standard_streams). 

It then becomes the responsibility of the operating system/environment to determine where and how logs are stored. 

To quote [12factor](https://12factor.net/logs):

> A (service) never concerns itself with routing or storage of its output stream. It should not attempt to write to or manage log files. Instead, each running process writes its event stream, unbuffered, to stdout.

Applications should be conscious of the volume and [quality](#3) of the logs they emit. Logging isn't free, and high volume logs aren't necessarily more useful than fewer, thoughtful, log messages. Include important context with your log messages to be able to better understand the state of the system at that time.

You may discover that some log information is better off not logged but recorded as time series metrics so they can be provided and analysed by tools such as [Datadog](https://www.datadoghq.com/). The benefit of doing this is that you can more easily measure those metrics (and gain more insights) _over time_.

It can also, depending on the tools you use to analyse your log data (e.g. external log analysis system, such as [Papertrail](https://papertrailapp.com/)), be better to log data in a more structured format in order to provide better contextual information and to make filtering logs easier.

<div id="2"></div>
## Levels

Here are common log levels and their application...

### Fatal

<p class="ll-fatal">Wake me up at 4am on a Sunday.</p>

### Error

<p class="ll-error">Apologize to the user and raise a ticket.</p>

### Warn

<p class="ll-warn">Make a note in case it happens again.</p>

### Info

<p class="ll-info">Everything's fine, just checking in.</p>

### Debug

<p class="ll-debug">Fill my hard-drive with stack traces.</p>

<div id="3"></div>
## Quality

There are many "logging best practice" articles, below is a short bullet list pulled from [Splunk](http://dev.splunk.com/view/logging/SP-CAAAFCK).

I recommend reading through [their article](http://dev.splunk.com/view/logging/SP-CAAAFCK) for the full details.

- Use clear key-value pairs
- Create events that humans can read
- Use timestamps for every event
- Use unique identifiers
- Log in text format 
  - e.g. log an image’s attributes, but not the binary data itself
- Use developer-friendly formats
  - e.g. json
- Log more than just debugging events
- Use categories/levels
  - e.g. info, warn, error, debug
- Identify the source
- Keep multi-line events to a minimum

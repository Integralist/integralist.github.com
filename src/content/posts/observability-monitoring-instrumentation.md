---
title: "Observability Monitoring Instrumentation"
date: 2017-11-15T13:00:00+01:00
categories:
  - "development"
  - "guide"
tags:
  - "observability"
  - "monitoring"
  - "instrumentation"
draft: false
---

In software engineering, there is a lot of confusion caused by the discussion around what exactly is meant by the word "observability" and how it relates to other words, such as "monitoring" and "instrumentation".

We're going to take a quick look at the definitions of these words and see if we can understand them without having to read through a 10,000 word essay on the finer details of the topic. This _isn't_ that blog post. I'm being purposefully short.

> **Observability** is a measure of how well internal states of a system can be inferred from knowledge of its external outputs -- [Wikipedia](https://en.wikipedia.org/wiki/Observability)

In that context, "observability" is the word you use when talking about how well your systems are doing in a broad overarching sense. 

Beneath the umbrella term "observability" are the words "monitoring" and "instrumentation".

> **Monitoring** is the translation of IT metrics into business meaning -- [Wikipedia](https://en.wikipedia.org/wiki/Application_performance_management)

In that context, "monitoring" is the word you use when talking about tools for _viewing_ data that has been recorded by your systems (whether that be time series data, or logging etc). These monitoring tools are supposed to help you identify both the "what" and the "why" something has gone wrong.

> **Instrumentation** refers to an ability to monitor or measure the level of a product's performance, to diagnose errors and to write trace information -- [Wikipedia](https://en.wikipedia.org/wiki/Instrumentation_(computer_programming))

In that context, "instrumentation" is the word you use when talking about _how_ you're recording data to be viewed and monitored.

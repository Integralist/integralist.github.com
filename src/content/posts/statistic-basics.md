---
title: "Statistics and Graphs: The Basics"
date: 2017-12-19T09:32:54Z
categories:
  - "code"
  - "guide"
tags:
  - "graphs"
  - "monitoring"
  - "performance"
  - "statistics"
  - "stats"
draft: false
---

- [Introduction](#1)
- [Information vs Data](#2)
- [Watch out for misleading data](#3)
- [Frequency](#4)
- [Pie Chart](#5)
- [Bar Chart](#6)
  - [Stacked](#6.1)
  - [Split](#6.2)
- [Histograms](#7)
  - [Differences?](#7.1)
  - [Calculating dimensions](#7.2)
  - [Frequency Density?](#7.3)
- [Line Graphs](#8)

<div id="1"></div>
## Introduction

I started learning about statistics because I found myself doing a lot of operational monitoring (i.e. making systems more observable, instrumenting individual services, and monitoring that data via custom built dashboards).

Although, for the most part, everything worked as expected and I generally understood the data I was seeing visualised, I wanted to be sure I wasn't missing any important information (or worse, mis-representing the data).

This began my journey into learning about statistics (as a complete beginner). I picked up a book on the subject and started taking notes. This blog post is the result of what I have learnt so far, and its motivation is to explain some of the basic concepts behind utilising statistics to represent data. This post is aimed at beginners, as I myself am very much a beginner in this space. 

So let's begin by defining what 'statistics' means...

> **Statistics** is a branch of mathematics dealing with the collection, analysis, interpretation, presentation, and organization of data -- [Wikipedia](https://en.wikipedia.org/wiki/Statistics)

<div id="2"></div>
## Information vs Data

If you're like me, you may well have confused the words "data" and "information" as being the same thing. But there are actually important differences that should be understood:

- **Data**: is the _raw_ facts/figures.
- **Information**: data that has extra context/meaning applied.

For example, raw data might look like:

```
[3, 5, 7]
```

Where as _information_ would be the taking of that raw data and giving it extra context. So, in this example, those three data points could represent the age of three children.

> Note: data is either "numerical" (dealing with numbers), "quantitative" (describing quantities) or "categorical" (data is split into categories that describe qualities or characteristics - also referred to as "qualitative").

<div id="3"></div>
## Watch out for misleading data

The following example is very contrived and silly, but it does illustrate the point about being aware of how data can be manipulated to represent what you want it to.

Here are two graphs, both have the same datapoints, but the first graph is misleading the viewer, while the second graph is more accurate. Take a look and see why that might be?

<canvas id="misleadingProfitsLine"></canvas>

<canvas id="profitsLine"></canvas>

At a quick glance (or if you just didn't know any better), you would see the first graph and think the company has some incredible profit growth. But the second graph doesn't look as impressive? 

This is because the first graph is zoomed in from the starting point `2.0` where as the first graph is zoomed out at the correct level so you can see the data in a more accurate and representative form.

> See also my comment below about the pie chart. It's a mis-representation, not of the data but of the truth. Some charts mis-represent data (like shown above), where others set a specific 'scene' (either accidentally or on purpose) by the mere ommission of data.

<div id="4"></div>
## Frequency

When dealing with statistical data, the first thing you typically learn about is data "frequency". Let's start with a definition...

> In statistics the frequency (or absolute frequency) of an event is the number of times the event occurred in an experiment or study. -- [Wikipedia](https://en.wikipedia.org/wiki/Frequency_(statistics))

The frequency of a piece of data can be visualised in many ways depending on the chart you wish to use. Some charts are better suited for representing certain types of data than others, so let's take a look at some different chart types to see how they work.

<div id="5"></div>
## Pie Chart

A graph, such as a pie chart, will split your data up into distinct 'groups' and then it'll calculate the relative percentage of each group to ensure the total adds up to 100%. 

Below is an example pie graph that uses the data `[150,200,50]`, which could represent (just for example) usage of certain programming languages within an organisation. The pie chart is generated based off the percentage representation of the underlying data.

> For example:  
> Start by finding the total (sum all the data)  
> Then calculate 1% of the total  
> Finally, calculate each group's percentage
>
> **Total**: 150+200+50 = 400  
> **1 Percent**: 400/100 = 4
>
> **Python** group = 50%  
> <small>i.e. `(400/100) * 50 = 200`</small>
>
> **Go** group = 37.5%  
> <small>i.e. `(400/100) * 37.5 = 150`</small>
>
> **Bash** group = 12.5%  
> <small>i.e. `(400/100) * 12.5 = 50`</small>
> 
> **50%** + **37.5%** + **12.5%** = 100%

<canvas id="simplePie"></canvas>

This type of graph is useful for understanding 'at a glance' the relative difference between groups of data, but becomes less useful when the data is close together as each 'slice' becomes effectively the same size.

As with all charts, there are problems with how you _interpret_ the graph.

Pie charts display the information in relative percentages, but if they don't show (or include somewhere near the graph) the _frequency_ for each group within the pie chart, then the graph can become misleading. This is because without the frequency you can't identify or confirm the _consistency_ of the data reported (e.g. lack of user engagement within any particular group).

In our example (when hovering or clicking on the chart) you'll see that we display the _frequency_ data and not the relative percentage (e.g. we show the value as 200 and not 50%). This is fine, because the most important part of this graph is the data's frequency, and besides, the pie chart itself is visually representing the frequency data in percentages (so although you don't see `Go: 37.5%`, it doesn't matter, as you can visually gauge the relative percentage easily enough). 

If we didn't include the data frequency we can't tell if we have an equal number of responses from users. This may or may not indicate whether it's fair to compare user satisfaction in this way (as it might not be truly representative).

So you have to be careful with data to make sure it's as inclusive as possible or that you're explicit about what you're focusing on or how the data might be lacking.

For the problem of data groups that are close together as a percentage, you might find a more suitable option would be the bar chart...

<div id="6"></div>
## Bar Chart

If you wanted to see the 'programming language' data in a format that is more suitable for subtle differences, then one option would be a bar chart. 

When dealing with a horizontal bar chart (directly below), the frequency groups are placed along the y axis, while with a vertical bar chart (example below that) they're placed along the x axis.

<canvas id="simpleBar"></canvas>

<canvas id="simpleBarVert"></canvas>

One thing to notice about a bar chart is that the _width_ of the bar is the same (doesn't matter if it's a horizontal or vertical variation). It's the _length_ of each bar that's important. 

The length represents the frequency of the group's data. This can trip people up, as they might mistake a bar chart for a 'histogram', where the width of the bar _does_ change in relation to the frequency (we'll come back to histograms later).

<div id="6.1"></div>
### Stacked

Now imagine you wanted to visualise data that represented how much people liked or disliked specific programming languages (this is different to the previous data which was the general usage of programming languages). 

To represent this multifaceted data you could use a specific type of bar chart known as a 'stacked' bar chart (see below). This type of graph is useful because it represents both the frequency _and_ the relative percentage of the various data types.

> Note: stacked bar charts are also known as 'segmented'.

<canvas id="stackedBar"></canvas>

It's less likely for this chart to be mis-represented because the _length_ of each bar is based on the data frequency. 

You can see for the groups "Go" and "Bash" we've had a consistent number of reports (300 in total), and so when the values are visualised as a percentage the length of the bars are the same. 

Where as the "Python" group has less data frequency compared to the other groups (only 250 in total, where the other groups were 300), and so although it correctly represents that data as a percentage (60% were "like" vs 40% "dislike") it's still not as representative as a whole in comparison to the other data groups we have. Ideally each group would have consistent frequencies.

<div id="6.2"></div>
### Split

Another type of bar chart is called 'split-category' and is useful for _comparing frequencies_ (unlike the stacked/segmented bar chart which compares frequency but represents them visually in percentages).

<canvas id="splitBar"></canvas>

<div id="7"></div>
## Histograms

I've yet to find a charting library that let's me create an actual histogram in the strict definition (most libraries seem to call standard bar charts 'histograms'?), which makes it hard for me to visually demonstrate them, unless I hand draw a chart (which is what I've had to resort to below). 

<div id="7.1"></div>
### Differences?

Based on what I've read, there are some key differences between histograms and standard bar charts. These are:

1. The 'area' (width _and_ height) of each bar is proportional to its frequency.
2. There should be no gaps between each bar.

The reason for histogram bar sizes being proportional (unlike a traditional bar chart †) is because histograms are usually best suited to dealing with **_grouped numerical data_**.

> † remember: with a traditional bar chart, each bar width is the same and only the bar 'length' is relevant (as it's determined by the frequency).

<div id="7.2"></div>
### Calculating dimensions

When constructing a histogram, you'll place the groups on the x axis and make the width of each bar the same as the range it covers; while placing the frequencies for each group on the y axis and make the length of the bar match the frequency value for that group.

Doing this is fine, as long as the groups have a consistent range (i.e. they all have the same interval size, like: `0-5,5-10,10-15` and whose range/interval distance are all five). 

But in some datasets a single group can cover a much wider range than the other groups. For example, consider a dataset for gaming hours played by a group of 17 users:

```
Hours, Frequency
0-1,   5
1-20,  2
20-22, 10
```

Here 'hours' is the grouped numerical data. As explained above, we would put the frequency on the y axis and the grouped data along the x axis (see below for an example graph).

<img src="../../images/disproportionate_historgram.png">

> Note: we can see our first bar "0-1" spreads only one interval and "20-22" spreads only two intervals, where as the middle bar "1-20" spreads over nineteen intervals!

The problem with the above graph is that the height of the middle bar is wrong as we've set it to be as high as the frequency value itself (and the third bar is incorrect too!), which normally would be fine if the interval range were the same across all groups, but in this case it isn't the correct approach due to each group covering a different range from each other.

In using this data, the `1-20` group's _area_ could mistakenly look disproportionately large (the `20-22` group also has a different range so that would be a problem as well). 

So to solve the problem of disproportionate sizes (when dealing with multi-range groups), we have to make sure that _both_ the width and height (or 'area') of the group is proportional. 

To fix the bar area size problem we need a different calculation for determining the 'height' of each bar (also known as the frequency density):

```
frequency / range = frequency density
```

For example, the range for `1-20` is 19 and its frequency is 2:

```
2 / 19 = 0.10
```

Meaning the height of the bar (its frequency density) for `1-20` should be set to `0.10` and not to the frequency value itself (which was `2`). 

You would then apply this calculation to the height of each group/bar (see below). You'll see we also needed to change the height of the `20-22` group based on this new area calculation (`10 / 2 = 5`).

<img src="../../images/disproportionate_historgram_area_fixed.png">

> Note: I appreciate the difference between the original height of 2 vs 0.10 (and 10 vs 5), using this contrived example, isn't exactly ground breakingly different, but that's the general idea behind calculating histogram areas for groups that have inconsistent ranges.

The overall area (or shape) for each bar represents the actual frequency, and can be calculated like so:

```
frequency = range × frequency density
```

Example: the group `20-22` had a range of 2 and a frequency density of 5. 

If we were to look at the graph by itself, which only shows the proportional area relative to the other groups (i.e. it only shows the frequency density and the range) we could reverse engineer/calculate the actual _frequency value_ with the abstract calculation above (`2 * 5 = 10`).

<div id="7.3"></div>
### Frequency Density?

As alluded to earlier, the height of each bar indicates the frequency density, which itself is best explained via an analogy: 

Imagine you have a tall glass and you pour a set amount of liquid into it that fills the glass to approximately 3/4. If you now pour that liquid into a much wider glass, the liquid amount hasn't changed but the height has changed. It'll be at a lower level as the liquid has spread out more across the available glass space. 

The frequency density is _related_ to frequency but is focused more around its 'concentration'.

If we wanted to calculate the _total frequency_ for the entire dataset then we would use the following calculation: `group range x group frequency density` for each group (which gives us the frequency for each group) and then we sum each of the frequencies together.

> Note: this is as far as I got with histograms, as I felt I had learnt enough to be dangerous in a conversation. There may well be nuances, pros/cons and other aspects to histograms I've not fully understood. I'd welcome anyone who knows more to educate me on this :-)

<div id="8"></div>
## Line Graphs

We've already seen a couple of example line graphs at the start of this post. These types of graphs are best for identifying trends in your data and are most useful when applied across numerical data (such as time, which again helps with overarching trending patterns).

> Note: compare this to bar charts, which are generally better for comparing values or categories.

There are various types of line graphs, one is known as an "accumulative frequency graph" which we can demonstrate using the earlier grouped dataset of hours played online. If we were to take the hours data, we could graph a specific subset view of that data.

For example, we can visualise the number of people who played for a specific number of hours. So we could say: "how many users were playing online for up to five hours?".

The way we do this is by adding up all the previous groups frequencies, which determines the upper limit for each group. So for example, using our previous data:

```
Hours, Frequency
0-1,   5
1-20,  2
20-22, 10
```

We can calculate the cumulative frequency like so:

```
0-1:   upper limit = 1  (total/cumulative frequency: 5)
1-20:  upper limit = 20 (total/cumulative frequency: 5+2=7)
20-22: upper limit = 22 (total/cumulative frequency: 5+2+10=17)
```

Resulting in the following cumulative frequencies:

```
0-1:   5
1-20:  7
20-22: 17
```

We can now plot these onto a line graph by placing the cumulative frequencies onto the y axis and the groups across the x axis. Then mark onto the graph the upper limits against the relevant cumulative frequency and finally join up the dots:

<canvas id="simpleLine"></canvas>

> In the above example graph, if we asked "how many people were playing for up to 21 hours?" the answer would be approximately 11 people.

<script src="../../js/Chart.bundle.min.js"></script>
<script>
var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function alpharize(rgb) {
  // Usage: alpharize(chartColors.red)
  var result = /\((\d{2,3}), (\d{2,3}), (\d{2,3})/i.exec(rgb);
  var colors = {}
  if (result) {
    colors['r'] = parseInt(result[1], 16);
    colors['g'] = parseInt(result[2], 16);
    colors['b'] = parseInt(result[3], 16);
    return 'rgba(' + colors['r'] + ', ' + colors['g'] + ', ' + colors['b'] + ', 0.5)';
  };
  
  return 'rgba(201, 203, 207, 0.5)'; // grey
}

var ctxLine = document.getElementById("misleadingProfitsLine").getContext("2d");
var myLineChart = new Chart(ctxLine, {
  "type":"line",
  "data":{
    "labels":["January","February","March","April","May","June"],
    "datasets":[{
        "label":"Misleading Company Profits",
        "data":[2,2.1,2.2,2.1,2.3,2.4],
        "fill":false,
        "borderColor": chartColors.red,
        "lineTension":0.1
    }]
  },
  "options":{responsive: true}
});

var ctxLine = document.getElementById("profitsLine").getContext("2d");
var myLineChart = new Chart(ctxLine, {
  "type":"line",
  "data":{
    "labels":["January","February","March","April","May","June"],
    "datasets":[{
        "label":"Accurate Company Profits",
        "data":[2,2.1,2.2,2.1,2.3,2.4],
        "fill":false,
        "borderColor": chartColors.blue,
    }, {label: "",data: [0]}]
  },
  "options":{responsive: true}
});

var ctxLine = document.getElementById("simplePie").getContext("2d");
var myLineChart = new Chart(ctxLine, {
  "type":"pie",
  "data":{
    "labels":["Go", "Python", "Bash"],
    "datasets":[{
        "label":"Workload by Programming Language",
        "data":[150,200,50],
        "backgroundColor": [chartColors.red, chartColors.yellow, chartColors.green],
    }]
  },
  "options":{responsive: true}
});

var ctxBar = document.getElementById("simpleBar").getContext("2d");
var myBarChart = new Chart(ctxBar, {
    type: "horizontalBar",
    data: {
        labels: ["Go", "Python", "Bash"],
        datasets: [{
            label: "Programming Languages",
            backgroundColor: chartColors.red,
            borderColor: chartColors.red,
            borderWidth: 1,
            data: [150,200,50]
        }]
    },
    options: {
      elements: {
          rectangle: {
              borderWidth: 2,
          }
      },
      responsive: true,
      title: {
          display: true,
          text: ""
      }
    }
});

var ctxBar = document.getElementById("simpleBarVert").getContext("2d");
var myBarChart = new Chart(ctxBar, {
    type: "bar",
    data: {
        labels: ["Go", "Python", "Bash"],
        datasets: [{
            label: "Programming Languages",
            backgroundColor: chartColors.red,
            borderColor: chartColors.red,
            borderWidth: 1,
            data: [150,200,50]
        }]
    },
    options: {
      elements: {
          rectangle: {
              borderWidth: 2,
          }
      },
      responsive: true,
      title: {
          display: true,
          text: ""
      }
    }
});

var ctxBar = document.getElementById("stackedBar").getContext("2d");
var myBarChart = new Chart(ctxBar, {
    type: "horizontalBar",
    data: {
        labels: ["Go", "Python", "Bash"],
        datasets: [{
            label: "Like",
            backgroundColor: chartColors.green,
            borderColor: chartColors.green,
            borderWidth: 1,
            data: [290,150,50]
        },{
            label: "Dislike",
            backgroundColor: chartColors.red,
            borderColor: chartColors.red,
            borderWidth: 1,
            data: [10,100,250]
        }]
    },
    options: {
      elements: {
          rectangle: {
              borderWidth: 2,
          }
      },
      responsive: true,
      title: {
          display: true,
          text: ""
      },
      scales: {
        xAxes: [{
            stacked: true
        }],
        yAxes: [{
            stacked: true
        }]
      }
    }
});

var ctxBar = document.getElementById("splitBar").getContext("2d");
var myBarChart = new Chart(ctxBar, {
    type: "bar",
    data: {
        labels: ["Go", "Python", "Bash"],
        datasets: [{
            label: "Like",
            stack: "Stack 1",
            backgroundColor: chartColors.green,
            borderColor: chartColors.green,
            borderWidth: 1,
            data: [290,150,50]
        },{
            label: "Dislike",
            stack: "Stack 2",
            backgroundColor: chartColors.red,
            borderColor: chartColors.red,
            borderWidth: 1,
            data: [10,100,250]
        }]
    },
    options: {
      elements: {
          rectangle: {
              borderWidth: 2,
          }
      },
      responsive: true,
      title: {
          display: true,
          text: ""
      }
    }
});

var ctxLine = document.getElementById("simpleLine").getContext("2d");
var myLineChart = new Chart(ctxLine, {
  "type":"line",
  "data":{
  "labels":["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", 
            "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
            "21", "22"],
    "datasets":[{
        "label":"Cumulative Frequencies of Hours Played",
        "data":[null,5,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,7,null,17],
        "fill":false,
        "borderColor": chartColors.red,
        "lineTension":0.1
    }]
  },
  "options":{
    spanGaps: true,
    responsive: true,
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: "Hours"
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: "Cumulative Frequencies"
        }
      }]
    }
  }
});
</script>

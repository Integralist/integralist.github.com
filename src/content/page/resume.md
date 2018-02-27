---
title: Resume
description: Staff Software Engineer @BuzzFeed
comments: false
menu: main
weight: -170
---

- [Hello!](#hello)
- [Connect](#connect)
- [History](#history)
- [Key Achievements](#key-achievements)
- [Tools, Languages and Tech](#tools-languages-and-tech)
- [Talks](#talks)
- [Published](#published)
- [Popular articles](#popular-articles)
- [Open-Source](#open-source)
- [Summary](#summary)

<img src="../images/profile.jpg">

## Hello!

Hello, my name is Mark and I work @[BuzzFeed](https://www.buzzfeed.com/) as a Staff Software Engineer (formerly Principal Engineer @[BBCNews](http://www.bbc.co.uk/news)).

I'm also a published author with Apress and LeanPub:

### Apress

- [Pro Vim](http://www.apress.com/9781484202517)
- [Tmux Taster](http://www.apress.com/gb/book/9781484207765)
- [Quick Clojure: Effective Functional Programming](http://www.apress.com/9781484229514)

### LeanPub

- [Python for Programmers](https://leanpub.com/pythonforprogrammers)
- [Programming in Clojure](https://leanpub.com/programming-clojure/)

## Connect

You can find me online at the following locations:

- [integralist.co.uk](http://www.integralist.co.uk/)
- [github.com/integralist](https://github.com/integralist)
- [twitter.com/integralist](http://www.twitter.com/integralist)
- [keybase.io/integralist](https://keybase.io/integralist)
- [linkedin.com/mark-mcdonnell](https://www.linkedin.com/in/mark-mcdonnell-08800565)

## History

### BuzzFeed (June 2016 - present)

The journey has just begun...

### BBC (Jan 2013 - June 2016)

I joined [BBC News](http://www.bbc.co.uk/news) as a client-side/mobile specialist within their Core News team. Within the year I had moved into a senior engineering role. The (then) Technical Lead for the BBC News Frameworks team requested I join them in order to help the organisation transition from its current platform over to one built upon the AWS platform.

I started in the Frameworks team building and designing back-end architecture for different microservices hosted upon the AWS platform, and we developed these services primarily using JRuby. In October 2014, I was offered the role of Technical Lead. 

Near the end of 2015 I decided to change roles to Principal Software Engineer, as my previous role required more of my time to be spent in meetings and handling line manager duties, where as I wanted to focus my time more on helping my team solve technical problems.

### Storm Creative (Feb 2001 - Dec 2012)

I started working at the agency [Storm Creative](http://www.stormcreative.co.uk/) straight out of college. I was always focused on learning and improving my skill set - both technical and soft skills - the latter helped me communicate better with both clients and other stakeholders/colleagues. 

I progressed upwards through the organisation, moving from initially being a client-side web developer (this included doing animations utilising ActionScript 3.0) to becoming a server-side developer (ASP.NET, PHP and Ruby), then onto becoming a Technical Lead across all projects and finally becoming the Digital Media Manager responsible for my own team of four engineers and overseeing all aspects of our projects.

## Key Achievements

### 2018

- Designed and implemented a Python package that acts as a Tornado web handler decorator for acquiring/caching/revalidating an asymmetrical public key (provided by an authentication server we built in Go). This key is then used once we have acquired a signed JWT object so we may verify the integrity is intact. It's purpose was to make engineers time assigning authentication to their services much simpler and less time consuming, and provide a consistent experience across the platform.
- Selected to be part of a new infrastructure team tasked with designing a new 'authentication and authorization' service layer(s).
- Promoted to Staff Software Engineer in January.

### 2017

- Created basic [README validator](https://gist.github.com/Integralist/03279be86a356119b1f820da6ebb8740#file-2-python-3-4-compatible-version-for-rig-vm-mono-repo-result-csv-options-py) as part of our Better Docs initiative and in preparation for our Doc Day event.
- Took lead on documenting and improving the state of our monitoring by way of implementing best practices ([see my article for details](/posts/monitoring-best-practices/)) as well as improving the quality (and consistency) of our operational runbooks ([see an example template](https://docs.google.com/document/d/1eaT9KMam5zq7lT-5OVz9T91RJQUx-qx2q6WnKSvxC_U/edit?usp=sharing)).
- Core member of the BuzzFeed "Better-Docs" Working Group. We aim to improve documentation and its discoverability for BuzzFeed Tech. We primarily intend to do this through the standardization of doc formats, the creation and maintenance of doc tooling, and continuing education of ourselves and the BF Tech community about documentation.
- Tech Lead for the Site Infra 'Resilience' team. This includes designing a disaster recovery strategy by the name of "Plan Z" with handling of multiple failure scenarios and failovers across many service providers.
- For the 2017 Hack Week I built an operations Slackbot tool in Go called OpsBot. It would dynamically create standardized incident channels and would automatically invite relevant users to the incident channel (using an emoji 'message reaction' convention). It also allowed searching for runbooks via the Google Drive API. Future updates will include creating a post-mortem Google Doc and inviting all users inside the incident channel to view the newly created doc.
- Implemented nginx solution (with integration tests) to round-robin requests for static assets between multiple cloud providers, as well as to ensure in the face of an outage that we failover appropriately to one of the other functioning providers for complete static asset resiliency and robustness.
- Technical Lead and architect for a new dynamic video player service to enable an asynchronous editor workflow along with a flexible architecture for providing the most appropriate video for our users.
- Consolidated two separate cli tools into one [go-fastly-cli](https://github.com/integralist/go-fastly-cli): General purpose CLI tool for interacting with the Fastly CDN service via its REST API
- Redesigned one of our Python packages, which initially was a facade providing a multi-tiered cache abstraction around a single HTTP client. Requirements determined that the consumer should provide one of a list of accepted HTTP clients and so I utilised an adapter pattern internally in order to provide a unified interface for the provided HTTP client dependency. 
- Built a [Python Auto Generated API Documentation](https://gist.github.com/Integralist/e1743503f18904e3af99dac27134de91) tool that builds upon Git pre-commit hooks and utilises Make and Bash
- Throughout the year I've found the need to build different tools to help me do my job more efficiently: [Ero: Local/Remote CLI Diffing Tool written in Go](https://github.com/Integralist/ero), [Lataa: Fastly VCL uploader/activation CLI tool written in Go](https://github.com/Integralist/lataa), [Carbon: CLI HTTP Headers Filtering Tool written in Go](https://github.com/Integralist/carbon) which was superseded by a [Bash equivalent](https://github.com/Integralist/Bash-Headers) as well as a [Vim plugin for MyPy: a Python static type checker](https://github.com/Integralist/vim-mypy)
- Worked on the CDN layer's VCL logic and spent time investigating and building abstractions to make working with VCL easier (such as a logging abstraction along with a quick on/off toggle)
- Presented an engineering workshop on the Site Router service (see last year) to all engineers within BuzzFeed
- Lead the development across a mostly US based team and rollout of new critical service responsible for serving the responsive BuzzFeed home page

### 2016

- Migrated Fastly's version of varnish/vcl 2.x to standard 4.1 (working with one of the Site Reliability Engineers) for use as a backup CDN in case of extreme failure scenarios that required us to switch providers quickly and who do not have the features that Fastly provides as part of their modified version of Varnish
- As part of a mono repo that stores multiple sub-services (each with their own team/squad) I designed and implemented a generic Pull Request template file to be used across the organisation for that repository. It stemmed from this blog post I wrote "[GitHub Pull Request Formatting](/posts/github-pull-request-formatting/)" back before GitHub provided an automated feature (although based on specific feedback it didn't end up _exactly_ the same as described there)
- Co-ordinated use of gpg-agent inside our infrastructure teams VM tooling
- Built a microservice using a Python scheduler for automatically executing integration/smokes tests periodically to ensure there are no regressions with the new BuzzFeed nginx router and its core behaviours (deployed via AWS's ECS 'Container Service')
- Worked with the lead engineer on a safe and measured (monitoring handled by Datadog) global rollout of our new routing service by utilising an incremental regional deployment process (controlled by Varnish and GeoIP lookups) and working closely with the relevant QA teams
- Architect and author of a fundamental new routing service (Site Router), responsible for taking logic out from the Fastly CDN/Varnish configuration and proxying specific requests onto upstream services via nginx - helping to decouple services from the CDN layer. I also designed a YAML based config driven API on top of nginx and helped translate and update the relevant CDN/Varnish logic.
- Developed multiple reusable Python scripts, such as a timing decorator that posted runtime metrics to StatsD/Datadog
- Helped porting over old Perl based monolithic web app into separate [BFF](http://samnewman.io/patterns/architectural/bff/) microservices built with Python and deployed via AWS ECS
- Encouraged and implemented use of additional Python linters to catch common issues within BuzzFeed services and APIs
- Started working for BuzzFeed as a Senior Software Engineer, to become part of and build up the core UK team
- Defined "[The Perfect Developer Qualities](https://gist.github.com/Integralist/3f8089345a1236b374a7a5b8a13591a1)" and refined the values based on open community discussions
- Released two new open-source projects: 
	- [go-elasticache](https://github.com/Integralist/go-elasticache) and [go-findroot](https://github.com/Integralist/go-findroot)
- Strong focus on DevOps: writing [shell](https://github.com/Integralist/Shell-Scripts) [scripts](https://gist.github.com/search?utf8=✓&q=user%3Aintegralist+bash&ref=searchresults) whilst in charge of creating and configuring multiple AWS accounts for development/production environments 
- Tasked with load testing, analysing, identifying and fixing performance and scaling issues within the BBC's "Mozart" platform
- I built a simple, yet performant, open-source URL monitoring system in Bash called [Bash Watchtower](/posts/bash-watchtower/)
- Tasked with leading the [BBC News coding and architecture 'best practices' working group](https://github.com/bbc/news-coding-best-practices)
- Co-author/architect of the BBC's "Mozart" platform
  - Page composition microservice platform
  - AWS microservices built with Ruby and Go

### 2015

- Published guest article "[Building Software with Make](http://www.smashingmagazine.com/2015/10/building-web-applications-with-make/)" for popular online resource [Smashing Magazine](http://www.smashingmagazine.com/)
- Represented BBC at the AWS re:Invent week-long technical conference in Las Vegas
- Co-author/architect for a [Go](http://golang.org/) based cli tool called "Apollo", which abstracted away cert based access to an internal REST API and allowed teams to more easily deploy services to the AWS platform
- Released open-source program (written in [Go](http://golang.org/)) called "[go-requester](https://github.com/Integralist/go-requester)", which is a HTTP service that accepts a collection of "components", fans-out requests & returns aggregated content
- Published the book "[Programming in Clojure](https://leanpub.com/programming-clojure/)"
- Worked closely with multiple members of my team (over the course of the year) with the goal of getting them ready for their next round of promotions
- Developed event archiving service using Go and AWS Lambda
- BBC News Frameworks team won the "Connecting the News" category at BBC Hack Day 
- BBC Newsbeat v2 was released (this was the first fully AWS product from BBC News)
- Co-author/architect for a BBC AWS-based monitoring solution
- Published guest article "[Designing for Simplicity](http://davidwalsh.name/designing-simplicity)" for popular Mozilla engineer David Walsh
- Tech Lead for the General Elections (Feb - May 2015)
- Released open-source [Clojure version](https://github.com/Integralist/spurious-clojure-aws-sdk-helper) of the [Spurious Ruby AWS SDK Helper](https://github.com/spurious-io/ruby-awssdk-helper) to enable Clojure developers to utilise fake AWS resources locally
- Rebuilt and migrated BBC's Market Data to AWS using the BBC's open-source Alephant framework, of which I was a co-author (Nov 2014 - Feb 2015)

### 2014

- Jello (internal synchronisation service between Trello and Jira)
- Won "Most innovative use of Technology" BBC News Award (Docker CI)
- Won "Best Public Relations of the Year" BBC News Award (Pro Vim)
- Became Technical Lead for the BBC News Frameworks team (October 2014)
- Senior developer part of the BBC's Scottish Referendum offering (June - September 2014)
- Senior developer part of the BBC's Vote 2014 Elections  offering (Jan - May 2014)
- Co-author/architect for the open-source [Alephant framework](https://github.com/BBC-News/alephant)
- Co-author/architect of a cloud based distributed load test tool (built around JMeter)
- Arranged public BBC presentation with [Sandi Metz](http://www.sandimetz.com/) "Object-Oriented Design"

### 2013

- Won "Developer of the Year" BBC News Award
- Led the development of the BBC News responsive navigation redesign
- Mozilla invited me to present at the W3C Responsive Images meet-up in Paris
  - [Presentation Slides](https://speakerdeck.com/integralist/bbc-news-responsive-images)
- Member of the [BBC's GEL Responsive Working Group](http://www.bbc.co.uk/gel)
- Integrated new BBC UX framework
- Published BBC News blog post regarding [Imager.js](http://responsivenews.co.uk/post/58244240772/imagerjs)
- Rewrote and open-sourced the BBC News [responsive image technique](https://github.com/BBC-News/Imager.js/)
- Developed open-source [PhantomJS CLI](https://github.com/Integralist/Squirrel) tool for automating the generation of Application Cache manifests
- Developed open-source [Sass image extension](https://github.com/Integralist/Sass-Base64-Extension) in Ruby
- Introduced and led the use of [GruntJS](http://gruntjs.com/) across all teams within BBC News

## Tools, Languages and Tech

I don't profess mastery, but I'm adept with most of the below, and I have an aptitude towards learning what I need to get the job done right:

- AWS CloudFormation
- CSS
- Clojure
- [Design Patterns](https://github.com/Integralist/Ruby-Design-Patterns)
- Docker
- [Functional Programming](/posts/functional-recursive-javascript-programming/)
- Git
- Go
- HTML
- JRuby/MRI Ruby
- JavaScript (client-side)
- Jenkins
- Jira
- Make
- [Meta Programming](https://gist.github.com/Integralist/a29212a8eb10bc8154b7)
- Node
- PHP
- Python
- [Refactoring](/posts/refactoring-techniques/)
- Regular Expressions
- Sass
- [Shell Scripting](/posts/basic-shell-scripting/)
- Terraform
- Tmux
- Trello
- Vagrant
- Varnish
- VCL
- Vim

## Talks

- [Site Router](https://www.youtube.com/watch?v=md4de3RyN-8):  
80 minute presentation on BuzzFeed HTTP routing service abstraction.  

- [BBC Talks: Slides](https://slides.com/markmcdonnell/)

- [Imager.js Presentation](https://speakerdeck.com/integralist/bbc-news-responsive-images):  
Talk I gave at the Mozilla offices in Paris (which included speakers from: Google, Apple, Microsoft, Adobe, Opera, W3C and Akamai).

## Published

I'm a print published and self-published author; I'm also a tech reviewer and am a published author for many popular online organisations (you'll find many technical articles on my own website as well):

### Apress

- [Pro Vim](http://www.apress.com/9781484202517) (Nov 2014)
- [Tmux Taster](http://www.apress.com/gb/book/9781484207765) (Nov 2014)
- [Quick Clojure: Effective Functional Programming](http://www.apress.com/9781484229514) (August 2017)

### Packt

- Tech Reviewer [Grunt Cookbook](https://www.packtpub.com/web-development/grunt-cookbook) (May 2014)
- Tech Reviewer "Troubleshooting Docker" (May 2015)

### LeanPub

- [Programming in Clojure](https://leanpub.com/programming-clojure/) (Jul 2015)
- [Python for Programmers](https://leanpub.com/pythonforprogrammers) (Jun 2016)

### NET Magazine

- [8 ways to improve your grunt set-up](http://www.creativebloq.com/tutorial/8-ways-improve-your-grunt-set-111413407) (Nov 2014) ([PDF](https://dl.dropboxusercontent.com/u/3687270/NetMag%20-%20Grunt.pdf))
- [DalekJS vs CasperJS](https://dl.dropboxusercontent.com/u/3687270/NetMag%20-%20Dalek%20vs%20Casper.pdf) (Nov 2013)

### Smashing Magazine

- [My author page](http://coding.smashingmagazine.com/author/mark-mcdonnell/)
- [Building Software with Make](http://www.smashingmagazine.com/2015/10/building-web-applications-with-make/)
- [How To Build A CLI Tool With Node.js And PhantomJS](http://coding.smashingmagazine.com/2014/02/12/build-cli-tool-nodejs-phantomjs/)
- [How To Build A Ruby Gem With Bundler, TDD, Travis CI & Coveralls, Oh My!](https://www.smashingmagazine.com/2014/04/how-to-build-a-ruby-gem-with-bundler-test-driven-development-travis-ci-and-coveralls-oh-my/)

### NetTuts

- [My author page](http://tutsplus.com/authors/mark-macdonnell)
- [Testing Your Ruby Code With Guard, RSpec & Pry (Part 1 - Ruby/Guard/RSpec)](http://code.tutsplus.com/tutorials/testing-your-ruby-code-with-guard-rspec-pry--cms-19974)
- [Testing Your Ruby Code With Guard, RSpec & Pry (Part 2 - RSpec/Pry/Travis-CI)](http://code.tutsplus.com/tutorials/testing-your-ruby-code-with-guard-rspec-pry-part-2--cms-20290)

### BuzzFeed Tech

- I wrote a three part series on BuzzFeed's core HTTP routing service (built upon NGINX+) called "Scalable Request Handling: An Odyssey":
  - [Part 1](https://tech.buzzfeed.com/scalable-request-handling-an-odyssey-part-1-d91a295af4d8)
  - [Part 2](https://tech.buzzfeed.com/scalable-request-handling-an-odyssey-part-2-ad2433b2f6ed)
  - [Part 3](https://tech.buzzfeed.com/scalable-request-handling-an-odyssey-part-3-c29aac9c39a)

## Popular articles

The following links are to some of my more 'popular' articles. My main focus when writing is to take a complicated or confusing topic and attempt to distil it, in order for the subject to be more easily understood.

- [Hashing, Encryption and Encoding](/posts/hashing-and-encryption/) (2018)
- [Computers 101: terminals, kernels and shells](/posts/terminal-shell/) (2018)
- [Statistics and Graphs: The Basics](/posts/statistic-basics/) (2017)
- [Observability and Monitoring Best Practices](/posts/monitoring-best-practices/) (2017)
- [Logging 101](/posts/logging-101/) (2017)
- [Fastly Varnish](/posts/fastly-varnish/) (2017)
- [Profiling Go](/posts/profiling-go/) (2017)
- [Profiling Python](/posts/profiling-python/) (2017)
- [Bits Explained (inc. base numbers, ips, cidrs and more)](/posts/bits-and-bytes/) (2016)
- [Terminal Debugging Utilities](/posts/terminal-debugging-utilities/) (2016)
- [Big O for Beginners](/posts/big-o-for-beginners/) (2016)
- [Git Merge Strategies](/posts/git-merge-strategies/) (2016)
- [HTTP/2](/posts/http2/) (2015)
- [Client Cert Authentication](/posts/client-cert-authentication/) (2015)
- [DNS 101](/posts/dns-101/) (2015)
- [Security basics with GPG, OpenSSH, OpenSSL and Keybase](/posts/security-basics/) (2015)
- [Setting up nginx with Docker](/posts/setting-up-nginx-with-docker/) (2015)
- [Building Software with Make](/posts/building-systems-with-make/) (2015)
- [Thread Safe Concurrency](/posts/thread-safe-concurrency/) (2014)
- [GitHub Workflow](/posts/github-workflow/) (2014)
- [Understanding recursion in functional JavaScript programming](/posts/functional-recursive-javascript-programming/) (2014)
- [Refactoring Techniques](/posts/refactoring-techniques/) (2013)
- [MVCP: Model, View, Controller, Presenter](/posts/mvcp/) (2013)
- [Basic Shell Scripting](/posts/basic-shell-scripting/) (2013)
- [Object-Oriented Design (OOD)](/posts/object-oriented-design/) (2013)
- [Git Tips](/posts/git-tips/) (2012)
- [JavaScript 101](/posts/javascript-101/) (2012)

## Open-Source

- [BBC Alephant](https://github.com/BBC-News/alephant):  
The Alephant framework is a collection of isolated Ruby gems, which interconnect to offer powerful message passing functionality built up around the "Broker" pattern.  

- [BBC Imager.js](https://github.com/BBC-News/Imager.js):  
Responsive images while we wait for srcset to finish cooking  

- [Bash Headers](https://github.com/Integralist/Bash-Headers):  
CLI tool, written in Bash script, for sorting and filtering HTTP Response Headers  

- [DOMReady](https://github.com/Integralist/DOMready):  
Cross browser 'DOM ready' function  

- [Go ElastiCache](https://github.com/Integralist/go-elasticache):  
Thin abstraction over the Memcache client package [gomemcache](https://github.com/bradfitz/gomemcache) allowing it to support AWS ElastiCache cluster nodes  

- [Go Fastly CLI](https://github.com/Integralist/go-fastly-cli):  
CLI tool, built in Go, for interacting with the Fastly API  

- [Go Find Root](https://github.com/Integralist/go-findroot):  
Locate the root directory of a project using Git via the command line  

- [Go Requester](https://github.com/Integralist/Go-Requester):  
HTTP service that accepts a collection of "components", fans-out requests and returns aggregated content  

- [Grunt Boilerplate](https://github.com/Integralist/Grunt-Boilerplate):  
Original Grunt Boilerplate  

- [Image Slider](https://github.com/Integralist/HTML5-Image-Slider-Game):  
HTML5 Canvas Game  

- [MVCP](https://github.com/Integralist/MVCP):  
MVC + 'Presenter' pattern in Ruby  

- [Sinderella](https://github.com/Integralist/Sinderella):  
Ruby gem for transforming data object for specified time frame  

- [Spurious Clojure AWS SDK Helper](https://github.com/Integralist/spurious-clojure-aws-sdk-helper):  
Helper for configuring the AWS SDK to use [Spurious](https://github.com/spurious-io/spurious)  

- [Squirrel](https://github.com/Integralist/Squirrel):  
PhantomJS script to automate Application Cache manifest file generation  

- [Stark](https://github.com/Integralist/Stark):  
Node Build Script for serving HTML components

## Summary

I ideally want to get across two fundamental things about me:

1. I'm very passionate about programming and the openness of the web
2. I love getting the chance to learn and experience new things

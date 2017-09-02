---
title: "MVCP: Model, View, Controller, Presenter"
date: 2013-10-22T13:00:00+01:00
categories:
  - "code"
  - "guide"
tags:
  - "mvc"
  - "patterns"
  - "ruby"
draft: false
---

- [Introduction](#1)
	- Model
	- View
	- Controller
- [Mixed definitions](#2)
	- God Controller
	- Problems
	- Skinny Controller
- [Presenters?](#3)
	- What problem are Presenters trying to solve?
	- How do they work?
- [Code Example](#4)
	- Controller
	- View
	- Presenter
- [Conclusion](#5)

<div id="1"></div>
## Introduction

Model, View, Controller (MVC). This is a pretty standard architectural pattern and has been in use when developing software since the early 1970's.

The basic principle of the pattern is to separate the different areas of logic from your application into distinct compartments.

### Model

The model holds your business data. Typically this will be data that is pulled in from a database or external data service of some kind.

### View

The view is your user interface. This is what the client will interact with when using your application.

### Controller

The controller is the boss. He sits at the top and delegates responsibilities to either the view or the model.

<div id="2"></div>
## Mixed definitions

There seems to be a dispute in the dev community regarding how the responsibilities should be divided.

Some feel a 'fat controller' principle is best (where by the controller tells the model not only *when* but *where* and *how* it should get its data).

My understanding of the pattern is that it was designed so that the Controller stays 'skinny'. It may be the boss, but like most good bosses it doesn't try and stay in control. It knows the best team member for the job at hand and delegates accordingly.

This is also good code design because the Controller doesn't have too much *context* (i.e. it doesn't know everything, which means it'll be easier to maintain and scale).

### God Controller

There are a few ways we can implement an MVC pattern, one is known as the 'God Controller'. 

This is where a single Controller exists and it oversees everything no matter what was requested by the client. 

For example, the single Controller would be passed the request from the client (usually handled by a custom routing application, and most frameworks will provide their own).

The Controller would determine what type of request was made (if the request was for a 'contact' page then it'll make a request for the Contact model, or if the request was for the 'about' page then it'll make a request for the About model).

Once it knows the type of request it'll proceed to get the relevant model data and assign it to some View variables and render the required View.

### Problems

Now there are two problems with this implementation:

1. maintainability
2. scalability

As mentioned before, this comes down to bad code design. The 'God Controller' knows too much and tries to do too much. Once you start getting above a few different types of requests you'll start to understand what a mess the code can become by having multiple branches for different routing scenarios.

I work as an engineer for the BBC News team in London and we had suffered from this exact set-up (hence the lessons the team has learnt and improved upon are the reason why I'm able to write this post for you now).

### Skinny Controller

There is another approach we can take which is known as the 'skinny controller' approach.

The way it works is that a request will come into the application and will get passed to a page specific Controller.

The page specific Controller will call the relevant Model and will assign the returned data to a few View variables.

The Controller will then render a View and pass through the variables into the View for it to use.

As you can see, this isn't that different from the 'God Controller' with the exception that the Routing part of the application now will have extra logic which determines which specific Controller should be loaded. This is a better situation to be in because you're making your code base both more maintainable and scalable.

Note: as I mentioned in the previous section, BBC News had a sort of 'God Controller' issue and our first step to resolving the problem was to take a similar approach as described above (i.e. to start creating page specific Controllers). That was a good first step. 

The next step from here was to separate out our logic even further by implementing Presenters, and it was our tech lead at BBC News ([John Cleveley](http://twitter.com/jcleveley)) who made that decision which resulted in a much more efficient, maintainable and scalable code base.

<div id="3"></div>
## Presenters

### What problem are Presenters trying to solve? 

Let's imagine we've gone for the 'Skinny Controller' approach. There are still some inherent issues… 

First of all, our Controller can still have too much context and be handling more information than it should. 

But also, and more importantly, you may find there is still a lot of duplication of code across your Controllers.

The reasoning for this is that if you consider the structure of a web page/application you'll notice that it is typically made up of unique 'features'. For example, if you're displaying your tweets on a page then that's a unique feature.

Each feature must be able to stand on its own. We normally describe these features as being 'components'. Each component can be loaded whenever and wherever needed. Having a component based architecture allows your code base to become more modular and reusable.

For example the navigation menu on a page could be considered a 'component'. Also, the navigation menu component is likely going to need to appear on every single page of the application.

So, if you're splitting up your logic into page specific Controllers then it's possible that you're still repeating code across the Controllers to handle the loading of re-occurring components such as the navigation (e.g. pulling its data from a navigation Model and setting View variables etc).

Now there are ways that this code repetition can be avoided, and one such way is to use the concept of Presenters.

### How do they work?

Presenters (like everything in software engineering) can be implemented in many different ways. 

For example, at BBC News we initially were manually creating new Presenter instances within our page Controllers. But the team here are quite clever chaps (especially [Robert Kenny](http://twitter.com/kenturamon) and [Simon Thulbourn](http://twitter.com/sthulb)) and they realised that this process could be greatly improved by using configuration files instead (specifically [YAML](http://yaml.org/)). As we have multiple teams working on the BBC News code base and in multiple languages, using configuration files is a much easier and maintainable solution.

I'm not going to go into the configuration set-up we use at BBC News. Instead I'll focus on the basic principles of how Presenters work, which is quite simply a case of moving the logic (getting component specific Model data and assigning it to to component specific variables) into separate files called Presenters which you can instantiate within your controller.

<div id="4"></div>
## Code Example

### Controller

Here is a basic example in Ruby…

```
require 'app/presenters/a'
require 'app/presenters/b'

class AboutController < ApplicationController
  get '/' do
    @a = Presenters::A.new
    @b = Presenters::B.new

    title 'About'
    erb :about
  end
end
```

…in this example we have an 'About' page which is made up of two components `a` and `b`. As you can see we `require` the presenters which handle those two components and within our Controller we instantiate the Presenters.

Notice that's all we do. Each Presenter encapsulates the logic needed to prepare the data to be passed to the `:about` view template.

### View

Before I show you the Presenter code itself, I'll show you the View template file… 

```
<h1><%= @title %></h1>

<% if @a.run %>
  <%= partial :"components/a", { :title => @a.title, :summary => @a.summary, :data => @a.data } %>
<% end %>

<% if @b.run %>
  <%= partial :"components/b", { :name => @b.name, :age => @b.age } %>
<% end %>
```

…as you can see we have very minimal logic in place. If anything I have too much logic in the View as I initially was re-using the same View template over and over and so I wanted to protect again errors appearing when loading a template which referenced a component I wasn't loading, but I've since changed how my application was working but left the conditional checks in as an example of how code can evolve over time.

 We literally just check to see if the component has been initialised (in this case we created a `run` property we set to `true` when the component's Presenter is first initialised).

We then render the View for the component and pass through the variables that were set-up from within the Presenter.

Now I can also open up my `:home` View file and add in the `a` component there as well just as easily. It would be even easier if I didn't have to manually add the `a` component to the `:home` View file but that's where running from configuration files like we do at BBC News would come in handy (but that would have been too complicated an implementation for the sake of such a basic example as required for this post).

### Presenter

Now let's take a look at one of our Presenters, in this case the Presenter for our `b` component… 

```
require 'app/presenters/base'
require 'app/models/b'

class Presenters::B < Presenters::Base
  attr_reader :run, :name, :age

  def initialize
    @run = true

    model = B.new('Mark', '99')
    prepare_view_data({ :name => model.name, :age => model.age })
  end
end
```

…as you can see we load a specific Model for this component and then generate our View data by passing the Model information through to a `prepare_view_data` method (see below for the implementation details).

The `Base` Presenter which our component Presenters inherit from is very straight forward as you can see from the following example… 

```
module Presenters
  class Base
    attr_accessor :model

    def prepare_view_data hash
      hash.each do |name, value|
        instance_variable_set("@#{name}", value)
      end
    end
  end
end
```

…it's just a module namespace with a base class that has a single method `prepare_view_data` which dynamically generates instance variables based on the data we passed through from the inheriting Presenter class and which then are usable within the View.

<div id="5"></div>
## Conclusion

That's all there is to it as far as understanding the Presenter pattern. It's a nice clean solution for componentising your different page features and keeping your code more easily maintainable.

I've created a repo on GitHub called [MVCP](https://github.com/Integralist/MVCP) which is written in [Ruby](https://www.ruby-lang.org/) and uses the [Sinatra](http://www.sinatrarb.com/) web framework. Note: I had some help from my colleague [Simon](http://twitter.com/sthulb) in cleaning up and refactoring some of the code (it may only have been minor changes but as with all good refactorings it made a massive difference to the quality of the code, so thanks to him for helping out).

If you have any questions then feel free to contact me either here on [twitter](http://twitter.com/integralist) and let me know your thoughts.

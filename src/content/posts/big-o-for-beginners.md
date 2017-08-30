---
title: "Big O for Beginners"
date: 2016-06-28T13:00:00+01:00
categories:
  - "guide"
  - "algorithms"
tags:
  - "bigo"
draft: false
---

- [Introduction](#1)
- [Understanding Big O](#2)
  - [Logarithms](#3) 
  - [Logarithm Example](#4) 
  - [Factorials](#5) 
- [Back to Big O](#6)
- [Simple Search](#7)
- [Binary Search](#8)
- [The Travelling Salesperson](#9)
- [Calculating Operation Speed](#10) 
- [Arrays vs Linked Lists](#11) 
- [Selection Sort](#12) 
- [Quick Sort](#13) 
- [Conclusion](#14) 
- [References](#15) 

<div id="1"></div>
## Introduction

When you first start learning algorithms (Binary Search, Quick Sort, Breadth-first Search etc), you'll quickly realise that in order to take advantage of these algorithms, you need to know how fast they are. 

Otherwise, when presented with a programming problem in which you want to select an algorithm to use to solve that problem, how will you know which algorithm is more efficient?

One way to know how fast an algorithm is, would be to use the [Big O](https://en.wikipedia.org/wiki/The_Big_O) notation. 

<div id="2"></div>
## Understanding Big O

Big O doesn't tell you how fast in time (e.g. seconds) an algorithm is. Instead it informs you of the number of _operations_, and how those operations will grow over time.

Although we'll see how to calculate the speed of operations later on in this post, the primary benefit is to see 'at a glance' the growth of operations as your data becomes larger.

> So the O in "Big O" means "Operation"

This means in order for you to really understand Big O you're going to need to know some maths. Now, this is OK. I'm genuinely terrible at maths, but you'll see as we go along that it's not as complicated as you might think.

Effectively there are two math concepts we need to know:

1. Logarithms
2. Factorials

You don't even need to know that much about them. Only the bare minimum is required. So let's make a start with Logarithms and then move onto Factorials afterwards. Once we understand those two concepts we can go back to Big O and start tying together some examples.

<div id="3"></div>
### Logarithms

As I said, in order to understand Big O, you'll need to understand how [Logarithms](https://en.wikipedia.org/wiki/Logarithm) work.

I'm terrible at Math, but luckily the awesome book "[Grokking Algorithms: An Illustrated Guide](https://www.manning.com/books/grokking-algorithms)" (which I highly recommend) helped me at least understand the basics of Logarithms; enough so that I could then go on to understand Big O.

In essence the Logarithm notation looks something like:

```
Log n (х)
```

> Note: I had used a nice `𝑛` icon instead of `n` but on my phone I noticed it wasn't showing :-/ so I had to change it to something that wasn't a symbol.

...where the `n` is what's called the "base" and `х` is the number you're aiming for. But really what we're interested in is the _result_ of this calculation.

<div id="4"></div>
### Logarithm Example

Imagine we have the following Logarthim:

```
Log5(100)
```

What this is effectively asking is:

"how many times do I need to multiple 5 by itself in order to reach the number 100?"

Let's find out:

```
5*5*5 = 125
```

Looks like the result of our Logarithm would've been `3`, because there were three `5`'s used in order to get to a number that was equal or greater than `100`. 

In this case the calculation wasn't exactly equal. By that I mean we went _past_ `100` and ended up at `125`. But that's the essence of how to understand what a Logarithm is asking and how to calculate the result. 

So we can see the calculation looks like this:

```
Log5(100) = 3
```

The `3` is effectively the worst case number of steps involved when calculating that particular item. 

The number `100` in this case represents the number of items we have to execute our algorithm against. So if you were using an algorithm (such as a Binary Search; demonstrated later on below) and it was running over a collection of items, then the length of the items (in the above example Logarithm) would be `100`.

We'll see how this is useful in measuring an algorithm's _speed_ in a later section of this post. But for now let's go and understand Factorials...

<div id="5"></div>
### Factorials

Factorials are one of those things that can come in handy for a number of reasons. But generally they're really useful for identifying 'variations'.

Imagine you have three letters:

- `A`
- `B`
- `C`

How many variations of these letters can you produce? So we have `A, B, C` as one variation. `A, C, B` would be another variation and then maybe `B, A, C` would be another etc. But how do you calculate how many variations there are?

The solution is the factorial: `n!` (where `n` is the number of items you have).

So in our example we had three items, so that would be written as `3!` factorial.

Which really means:

```
3*2*1 = 6
```

So that's six variations you have for three items.

But what if you have 10 items?

```
10*9*8*7*6*5*4*3*2*1 = 3,628,800
```

You can see that with a small number of items, the number of operations is massive. This is the total oposite of Logarithms which we looked at earlier (remember its growth of operations stayed consistently good when the collection grew). 

Although Factorials serve a useful purpose (the example given in the book "Grokking Algorithms" is one called 'The Travelling Salesperson' - which is a problem that required calculating the quickest route the saleperson can take in order to visit n number of cities) they are probably the worst performing algorithm.

So if you see `n!` you should be wary.

<div id="6"></div>
## Back to Big O

So now we understand how Logarithms and Factorials work we can come back to the Big O notation and understand that it's really a simple visual wrapper around these different mathematical calculations.

```
O(х)
```

In the above snippet, `х` is a calculation. 

If we were considering Logarithms, then it would look like the following:

```
O(Log n (х))
```

If we were considering Factorials, then it would look like the following:

```
O(n!)
```

It's important noting that you'll never see a specific calculation like `O(Log5(100))` or `O(3!)` in Big O. It'll always be an abstract version like `O(Log n (х))` or `O(n!)` because Big O notation is a way of _talking_ to other people and having a 'common language'.

For example:

"Hey Bob, I don't think we should use the Simple Search algorithm because it's `O(n)`. We'd be much better off using a Binary Search, as that's `O(Log n (х))`".

See how this gives us a common language. It's similar to Design Patterns. Patterns can be implemented in a variety of different ways and yet we have common language for easily identifying code that follows a certain pattern (or when we think a particular pattern might be a good solution to a design problem, we have a common language for explaining the solution to someone else without needing to actually implement it first).

Now my mention of 'Simple Search' and 'Binary Search' might not mean much to you, as you might not know how these algorithms work. So let's look at these two algorithms next and then after that you'll hopefully understand why Big O helps us understand the performance of these algorithms.

<div id="7"></div>
## Simple Search

Simple Search is probably the simplest algorithm you'll ever learn. You'll see why in just a moment... 

Imagine you have a collection of twelve items (and these items are numbers), which are sorted/in order. You are required to locate a particular item within that collection.

Here is the collection:

```
[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20, 21]
```

The Simple Search approach is to loop over the collection one item at a time and check whether the current item matches the item you're looking for.

So if the number you were looking for was `19`, then that means you'll first check `1`, nope that's not it. You'll then check `3`, nope that's not it either... and keep going until you reach the number you're looking for.

So what does this algorithm look like in Big O?

```
O(n)
```

### What does Big O tell us?

Big O is telling us that this algorithm performs in 'linear' time. This means the number of operations increase linearly with the number of items in the collection. So in the above example, the worst case number of operations will be 12. But if the collection length was 100 items, then the worst case number of operations would be 100.

So in effect, the bigger the collection, the more _expensive_ this algorithm becomes. With a very small collection it's fast because of its simplicity, but beyond a small collection it's a poor performing choice of algorithm. This is what Big O is telling us here.

<div id="8"></div>
## Binary Search

Consider the same example as before, a collection of 12 items. The Binary Search algorithm is quite straight forward: you set the start and end indexes (usually zero for 'start', and the length of the collection for the 'end'). 

Now you locate the middle of the collection and check if the value you're looking for either matches or is too low/high. If it matches, then hey great you've just reduced the number of operations by a large amount compared to the Simple Search.

If the middle item (our 'guess') is lower than the actual item we're looking for, then you reassign the value of 'start' to be the middle index (the 'end' stays set to the length of the collection). You've now reduced the sliding window of items by half.

Alternatively if the middle item was larger than the item we're looking for, then you reassign the value 'end' to be the middle index (the 'start' stays set to zero). You've again reduced the sliding window of items by half.

From here we 'rinse/repeat' until the next 'middle of the collection' selection is the item we're looking for.

This is a much more efficient search algorithm compared to Simple Search. 

Let's see what this looks like in Big O notation...

```
O(Log n (х))
```

### What does Big O tell us?

Big O is telling us that this algorithm works in 'log time', which means the performance improves as the size of the collection increases! You can tell this 'at a glance' with Big O syntax (especially as you now know how Logarithms work). This algorithm will perform well across a wide range of collection sizes.

Big O in effect tells us how the operations _grow_. 

So for this particular algorithm example, the worst case number of operations is `4`. Take a look at our earlier explanation of Logarithms if you're unsure why that is, but in a non-abstract sense this would look like: `O(Log2(12))`. We're dividing our collection in two (`Log2`) for each operation (`(12)`).

This is probably one of the best Big O's you'll come across as effectively the performance (and by that I mean the growth of the operations) stays consistently good as the size of the collection increases.

So if you have a collection of 1000 items, then that would result in (worst case) `10` operations required to locate the item you're looking for:

```
2*2*2*2*2*2*2*2*2*2 = 1024
```

How about a collection of a million items? That would be result in (worst case) `20` (yes 20!) operations to find the item you were looking for amongst one million items. That's incredible.

<div id="9"></div>
## The Travelling Salesperson

Not much to say here that we haven't already mentioned earlier when talking about Factorials. This problem is about calculating the number of different routes someone can take in order to ensure they reach all the specified number of cities, and then working out which route was quickest.

In Big O notation this looks like:

```
O(n!)
```

### What does Big O tell us?

Big O is telling us this algorithm results in 'factorial time', and this is one of the worst performing algorithms known to mankind. Apparently it baffles the maths community, in that there isn't actually a better algorithm to solve this problem.

So as we saw earlier, if there were ten cities to visit and we need to identify the quickest route to visit all ten cities, it would take us approximately `3,628,800` operations to just calculate all the variations, before we could identify which one was quickest.

<div id="10"></div>
## Calculating Operation Speed

In order to calculate the speed of an algorithm, we need to know the worst case number of operations. This is what Big O in effect gives us (whether it be linear time, log time or factorial time). So how do we calculate the speed based on the number of operations?

First we need to know how many operations can be executed within one second.

The answer to that question is ten operations:

```
1 second / 0.1 = 10 operations
```

> Note: your computer can handle more than 10 operations a second, but as we've said before, Big O is about worst case scenarios and so although not realistic; this number does give us a nice base line to work from

We can then calculate the _time_ associated with a number of operations.

Imagine we have the following Big O:

```
O(Log n (х))
```


If this was a collection of 16 items, then the non-abstract version would look something like:

```
O(Log2(16))
```

We know from our earlier discussions that this would result in a worst case result of `4` operations to find the item we're searching for.

> Remember: `2x2x2x2 = 16`  
> That's `4` times we multipled `2` by itself to reach `16`

We also now know that a single operation takes `0.1` of a second.  

So with this in mind we can calculate the speed of `O(Log2(16))` as being: `0.4` seconds 

```
0.1 * 4 operations = 0.4
```

If we were using the Simple Search algorithm (which is `O(n)`) on a collection of 16 items, then we know that this would take `1.6` seconds to complete:

```
0.1 * 16 operations = 1.6
```

<div id="11"></div>
## Arrays vs Linked Lists

Let's consider what Big O looks like for the Array and Linked List data structures.

An Array supports 'index access', meaning you can jump straight to an Array index. Where as with Linked Lists you have to traverse the entire list in order to locate a specific item.

> Note: another difference comes in memory management. Arrays require n number of memory 'slots' to be next to each other, where as Linked List memory can be sparse and spread out due to how it implements its internal chaining of nodes. This is why Arrays are typically considered to be 'fixed size' and not easily expanded, because expansion of the Array's size could potentially require an expensive movement of the Array to a new location in memory in order to faciliate a new index and yet still have memory slots side-by-side

This suggests that Array lookups are `O(1)`, known as 'constant time' because the lookup growth stays the same no matter the length of the collection (i.e. it's constant).

Linked List lookups on the other hand are `O(n)`, which we already know is 'linear time' (remember this is how the Simple Search algorithm performed).

But what about new data insertions? Well, with an Array you insert new items at the end of the Array, and because of its index access it would indicate `O(1)`. But if you're inserting an item into the middle of the Array, then this changes to `O(n)` because of the internal implementation of Arrays in memory, it means you need to re-order all the following items, which is expensive (hence the side-effect of inserting into the middle is really more like linear time).

Linked List insertions are generally `O(1)` if inserting at the beginning or end of the list, but more like `O(n) + O(1)` if inserting into the middle of the list because you have to traverse the list first and then insert your new item.

<div id="12"></div>
## Selection Sort

The 'selection sort' algorithm sorts an unordered list by looping over the list `n` number of times, and for each loop it identifies either the smallest or largest element (which - smallest/largest - depends on how you're hoping to sort your list: do you want ascending or descending order). But ultimately you'll end up constructing a _new_ 'ordered' list.

Specifically you loop a number of times to match the collection length. Then you loop the collection looking for smallest/largest item. Then you mutate the collection so it's smaller by one.

This ends up being `O(n₂)` (n to the power of 2, or `O(n * n)`).

> Note: although you're looping over the collection multiple times, you are in fact looping over a slightly smaller collection each time. But it's _still_ considered `O(n)` for each time you loop over the collection because regardless of how many items are in there you treat it as abstract

So if your collection is 10 items long, then it would calculate as follows:

```
10 * 10 (i.e. n₂ meaning: 10 to the power of 2) = 100 operations
0.1 * 100 = 10 seconds
```

<div id="13"></div>
## Quick Sort

The 'quick sort' algorithm achieves the same result as 'selection sort', but is much faster. This particular algorithm sorts an unordered list using recusion instead. 

Specifically it uses the D&C (Divide and Conquer) approach to problem solving.

The process is as follows:

* You pick a 'pivot' (a random array index)
* Loop the array storing items less than the pivot
* Loop the array storing items greater than the pivot
* Assuming the 'less' and 'greater' collections are already sorted
* You can now return 'less' + pivot + 'greater'

In reality you'll use recursion to then sort both the 'less' and 'greater' arrays using the same algorithm.

This ends up being `O(n₂)` in the worst case, but can be `O(n Log₂ n)` in the better case.

The explanation for this, is that the quicksort function takes in a single collection and loops over it. In the process it then splits the collection into three chunks (less, pivot and greater) and it recursively calls itself (i.e. quicksort calls quicksort) on the 'less' and 'greater' chunks, subsequently looping over those collections as well.

Big O notation helps us to understand the hidden complexity of the algorithm. If you see something like `O(n₂)`, then you know that there are nested loops or some kind of recursion happening in order to cause that.

Now it's worth being aware that Quick Sort's performance is dependent on the pivot you choose. Take a look at some of the example implementations of the quick sort algorithm in the reference list below ["Gist: Algorithms in Python"](#15). 

There you'll see we have three implementations: one where we pick the first index every time as the pivot, one where we pick the middle index every time and one where we pick an index at random. 

Picking an index at random will give you the best chance of high performance. If you, for example, always pick the first index then you'll have a situation where you're potentially sorting items unnecessarily.

So in the best case scenario, if your collection is 10 items long, then it would calculate as follows:

```
10 * 4 (Log₂10 == 2*2*2*2) = 40 operations
0.1 * 40 = 4 seconds
```

But in the worst case scenario, if your collection was 10 items long, then it could calculate as follows:

```
10 * 10 = 100 operations
0.1 * 100 = 10 seconds
```

<div id="14"></div>
## Conclusion

This has been a very basic introduction to the concept of Big O. Hopefully you've found it useful and have a greater appreciation for what Big O offers in the way of understanding the performance of particular algorithms (although we've only really looked at a very small selection).

We've seen the following Big O types:

- `O(Log n (x))`: log time
- `O(n!)`: factorial time
- `O(n)`: linear time
- `O(1)`: constant time
- `O(n * n)` (also known as `O(n₂)`): selection sort example
- `O(n Log n (x))`: quick sort example

There are many more algorithms and calculations for Big O, and as I learn them I'll be sure to update this blog post accordingly. If in the mean time you notice any mistakes, then please feel free to let me know.

<div id="15"></div>
## References

- [Gist: Algorithms in Python](https://gist.github.com/Integralist/9763bded76e7d826535a3caeafc3bdff)
- [Beginners Guide to Big O](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/)

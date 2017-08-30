---
title: "Syscalls and C"
date: 2016-11-18T13:00:00+01:00
categories:
  - "code"
  - "guide"
tags:
  - "syscall"
  - "C"
draft: false
---

# Syscalls and C

This post is aimed at explaining the difference between a system call (provided by the Linux kernal) and a wrapper function that has a similar name within one of the C standard libraries.

I have no formal Computer Science (CS) background, I started programming in 1999 and only from 2016 am I starting to learn the C programming language in order to help give me a deeper knowledge of how *nix systems work and other core CS concepts. 

> See my previous post called '[Bits and Bytes)](/posts/bits-and-bytes-explained/)' to see where these learnings are taking me.

## What's the issue?

It can be confusing sometimes knowing where to look for documentation when dealing with C †

> † that is if you're not a systems engineer, and have no CS degree, nor learnt C

As an example, you might learn about the `strace` command and start investigating what your Ruby application is up to. In doing so you'll see lots of calls to different functions and you might decide you want to look up the documentation for those functions.

This could be where your first problem arises. You might think "Ruby is written in C, so I'll look at the C documentation" and then come up with nothing. 

## So what's going on?

The key is to remember that the Linux operating system (which your code is very likely running on) is itself written in C. But Linux provides its own set of functions written in C that aren't part of the C language.

So you might see a function used and wonder why it's not showing up within the C language documentation. That's because it's not part of the C language. The Linux engineers would've created the function within Linux so you need to look at the Linux documentation to find out what it does.

> e.g https://linux.die.net/man/ 

Some of these Linux provided functions are known as 'system calls'. If you visit [the above link](https://linux.die.net/man/) you'll see there in 'section 2' a list of all system calls.

An alternative (searchable) list of syscalls can be found here: https://filippo.io/linux-syscall-table/

## Wrapper functions?

Now what makes this a little more confusing is that the system calls aren't usually directly accessible. So 'section 2' of the Linux documentation may list all the 'system call' documentation, but 'section 3' lists all library functions including what are referred to as 'thin wrapper' functions for the system calls. 

For example, Linux uses a separate library that provides a `fork` function which is a wrapper around the actual system call `fork` equivalent provided by Linux itself. The wrapper function is then also something other applications written in C can utilise.

This is noted here https://linux.die.net/man/2/intro in the documentation:

> A system call is an entry point into the Linux kernel. Usually, system calls are not invoked directly: instead, most system calls have corresponding C library wrapper functions which perform the steps required in order to invoke the system call. Thus, making a system call look the same as invoking a normal library function.

So what do these thin wrapper functions do? Well the docs tell us...

> Often the glibc wrapper function is quite thin, doing little work other than copying arguments to the right registers before invoking the system call, and then setting errno appropriately after the system call has returned. Note: system calls indicate a failure by returning a negative error number to the caller; when this happens, the wrapper function negates the returned error number (to make it positive), copies it to errno, and returns -1 to the caller of the wrapper. Sometimes, however, the wrapper function does some extra work _before_ invoking the system call. For example, nowadays there are two related system calls, `truncate` and `truncate64`, and the glibc `truncate()` wrapper function checks which of those system calls are provided by the kernel and determines which should be employed.

Using `fork` as an example:

- Here is the system call docs: https://linux.die.net/man/2/fork
- Here is the wrapper docs: https://linux.die.net/man/3/fork

But where do some of the wrapper equivalents come from? Well, one such provider is glibc; which is [GNU's standard C library](https://en.wikipedia.org/wiki/GNU_C_Library). Which states:

> The C language provides no built-in facilities for performing such common operations as input/output, memory management, string manipulation, and the like. Instead, these facilities are defined in a standard library, which you compile and link with your programs. The GNU C Library, described in this document, defines all of the library functions that are specified by the ISO C standard, as well as additional features specific to POSIX and other derivatives of the Unix operating system, and extensions specific to GNU systems.

[Here's a link also to the standard C library](https://en.wikipedia.org/wiki/C_standard_library) libc if you're interested.

## Direct system call?

What if one of the additional C libraries (libc, glibc etc) don't provide a wrapper?

Well in these situations you can make a direct system call!

See https://linux.die.net/man/2/syscall which states:

> `syscall()` is a small library function that invokes the system call whose assembly language interface has the specified number with the specified arguments. Employing `syscall()` is useful, for example, when invoking a system call that has no wrapper function in the C library.

---
title: "Concepts From the C Programming Language"
date: 2016-11-28T13:00:00+01:00
categories:
  - "code"
  - "guide"
tags:
  - "C"
draft: false
---

- [Introduction](#1)
- [Compilation](#2)
    - [Compilers](#2.1)
    - [C11 safe functions](#2.2)
- [Hello World](#3)
- [Constants vs Directives](#4)
- [Quotations](#5)
- [Char Type](#6)
- [Null Terminator](#7)
- [Pointers](#8)
- [Arrays](#9)
- [Enumerators](#10)
- [Memory Allocation with different Types](#11)
- [Reallocating Memory](#12)
- [Function Prototypes](#13)
- [Conclusion](#14)

<div id="1"></div>
## Introduction

I decided recently to read a book on the C programming language. The idea was to learn some more low-level concepts that other higher-level languages were abstracting away from me.

This write up is the result of some of those learnings. This is not a "how do you write C code". This is a grouping of topics and concepts that I found interesting and thought might be useful to other developers with similar interests.

Some of the stuff covered will be obvious, but I appreciate some concepts won't be obvious for all readers, so this write up will end up crossing back and forth between different 'levels' of understanding and experience. 

In other words: your mileage may vary...

<div id="2"></div>
## Compilation

When writing a program in a language like [C](https://en.wikipedia.org/wiki/C_(programming_language)), you'll find that by itself it is not executable (i.e. you can't run a C file directly). You need to convert the C source code into [machine code](https://en.wikipedia.org/wiki/Machine_code) (i.e. something the computer's CPU can understand).

Machine code is as low-level as you can get when interacting with a computer. So the C language is considered a 'higher-level' abstraction to save us from having to write machine code ourselves. 

A language like [Python](https://www.python.org/) is an even 'higher-level' abstraction, to save us from having to write C

> Note: the Python language is actually written in C  
> Although there are other Python interpreters implemented in different languages

In order to convert C code into machine code, we need a compiler.

> Strictly speaking you also need a [linker](https://en.wikipedia.org/wiki/Linker_(computing)) which takes multiple compiled objects and places them into a single executable file. Generally speaking, when we say "compile a C file", we're really combining two separate steps (compiling and linking) into the single generic term "compile"

<div id="2.1"></div>
### Compilers

To compile C source code into an executable you need a compiler, of which there are many options. The two most popular being LLVM's `clang` and GNU's `gcc`. You might also find on your computer a `cc` command, but typically this is aliased to an existing compiler.

The Mac OS doesn't provide a compiler by default. But if you install X-Code you'll get the LLVM's suite of compilers. Below we see that we get quite a few alias' and all of them point to the same embeded LLVM compiler:

```
$ gcc --version
Configured with: --prefix=/Applications/Xcode.app/Contents/Developer/usr --with-gxx-include-dir=/usr/include/c++/4.2.1
Apple LLVM version 8.0.0 (clang-800.0.38)
Target: x86_64-apple-darwin15.6.0
Thread model: posix
InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin
                                                                   
$ llvm-gcc --version
Apple LLVM version 8.0.0 (clang-800.0.38)
Target: x86_64-apple-darwin15.6.0
Thread model: posix
InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin
                                                                   
$ clang --version
Apple LLVM version 8.0.0 (clang-800.0.38)
Target: x86_64-apple-darwin15.6.0
Thread model: posix
InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin
                                                                   
$ cc --version
Apple LLVM version 8.0.0 (clang-800.0.38)
Target: x86_64-apple-darwin15.6.0
Thread model: posix
InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin
```

The first two alias' `gcc` and `llvm-gcc` are a little bit confusing and also a bit misleading, as they're not GNU's version. They're still the LLVM's compiler but with some modifications. In the first instance (`gcc`) the compiler is configured to use some additional libraries that are provided by c++.

> You can tell this by the flag `--with-gxx-include-dir`

It's worth noting that with a standard/simple C source code file, all these alias' work to compile the source code into an executable. But some compilers allow you to utilise additional extensions not provided by the standard C language (so you need to be careful your code doesn't try to utilise something that's not available at compilation time).

LLVM's licensing is BSD, meaning Apple can embed it within their own software that is not GPL-licensed. Typically LLVM's compiler is faster than GNU's, but in some cases it might not support all the same targets as GNU's.

> For more comparison details see [http://clang.llvm.org/comparison.html](http://clang.llvm.org/comparison.html)

<div id="2.2"></div>
### C11 safe functions?

You'll likely be told that some functions provided within C aren't safe (usually around string manipulation). For example, some string functions allow for overflow of data because they don't check that the underlying array data structure is able to contain the strings being manipulated.

C11 compatible compilers will provide an additional set of string functions that are _considered_ safe (although this is a contentious area of discussion as some C programmers believe that these functions are just as unsafe and if anything the claims are misleading! [See this comment on Stack Overflow which goes into more detail](http://stackoverflow.com/questions/40829032/how-to-install-c11-compiler-on-mac-os-with-optional-string-functions-included/40839702#40839702)).

> Note: I've also discovered that none of the compilers I have on my OS support these functions, and I've since discovered one of the few environments to support these functions is the Windows platform

Below is an example C file that demonstrates how to check if your compiler supports these additional safe functions:

```
#include <stdio.h>

int main(void)
{
  #if defined __STDC_LIB_EXT1__
    printf("Optional functions are defined.\n");
  #else
    printf("Optional functions are not defined.\n");
  #endif
  
  return 0;
}
```

If your compiler supports these optional (safe) string functions, then to _enable_ them you'll need to add a `define` directive that modifies the subsequent header file. But you also need to add this directive _before_ you include the preprocessor directive that imports the `string.h` header:

```
#define __STDC_WANT_LIB_EXT1__ 1
#include <string.h>
```

If you don't set `__STDC_WANT_LIB_EXT1__` to `1`, then the header `string.h` will utilise the old (unsafe) string functions.

<div id="3"></div>
## Hello World

Below is a simple 'hello world' C example:

```
#include <stdio.h>   // pre-processor directive to include code file at compile time
#define NAME "World" // pre-processor directive to substitute any reference to NAME _before_ compilation

// returns an int type and takes in no arguments (void)
int main(void) {
  printf("hello %s", NAME); 
  return 0;          // zero indicates no problems (i.e. EXIT CODE)
}
```

It's important to note that the directives `#include` and `#define` are 'processed' at the start of the compilation process. This is at the request of the compiler. 

So it'll be one of the compiler's first steps to pull in the preprocessor and have it ensure the file is setup ready for the rest of the compilation.

You would compile this file like so:

```
cc hello-world.c -o hw
```

Now you have a macOS compatible executable:

```
./hw # prints the message "Hello World"
```

> To cross-compile for another OS (e.g. Linux) then use Docker or a VM  
> Other modern languages like [Go](https://golang.org/) or [Rust](https://www.rust-lang.org/) allow you to cross-compiler without a VM

<div id="4"></div>
## Constants vs Directives

We saw in the above 'Hello World' example the use of the directive `#define` which allowed us to use a single identifier (`NAME` in this case) throughout our program. The benefit is that we can change the value once and have it updated everywhere.

But do not get this confused with a variable. It is not. This is just a sequence of characters that are blindly replaced at the pre-processing stage. The value assigned to `NAME` will be replaced inside your program regardless of whether it's valid code or not. Meaning it could cause an ambiguous compiler error.

On the other hand you can define a proper constant like so:

```
#include <stdio.h>

int main(void) {
  const char NAME[] = "World";
  printf("Hello %s", NAME);
  return 0;
}
```

What this gives you is a variable that has an actual type assigned to it (`char`). Meaning the compiler will help you identify an incorrect value if necessary, much more easily than using the `#define` directive.

<div id="5"></div>
## Quotations

In C single quotes denote a `char` type and double quotes denote a string.

So if you had the following code:

```
char foo = 'a';
printf("foo: %s\n", foo);
```

It would error with:

```
format specifies type 'char *' but the argument has type 'char'
```

To get it to work you need to provide the memory address location of `foo` using the address-of operator (`&`):

```
char foo = 'a';
printf("foo: %s\n", &foo);
```

We'll come back to the `&` operator (and understand what `*` means) later, when we discuss [pointers](#8).

<div id="6"></div>
## Char Type

When creating a variable, and assigning a string to it, the value assigned is really a pointer to a location in memory. The `char` type is used when storing characters such as `'a'`, but it also allows storing of strings such as `"abc"`. 

When assigning a string, the pointer is to an _array_ where each element of the array is a character of the provided string. For example the string `"abc"` would be stored in an array that looked something like: 

```
["a", "b", "c"]
```

> Note: see section '[Null Terminator](#7)' to clarify above code

This happens even if the string you provide is just one character. Although, depending on your program's design, it could be argued that you should not have assigned a single character string, but instead used single quotes to represent a single `char`. 

When assigning a character (e.g. `a`) to a variable of type `char` it takes on dual duty. Meaning the char type variable can represent the specific character `a` but really it stores the ASCII integer code that defines that character. 

> Take a look at an [ASCII table](http://www.asciitable.com/) to identify the code associated with a particular character

This means we could also directly assign the integer `97` instead of the character `a` to the char type variable. But also, and more interestingly, because of these characteristics we can perform arithmetic on the variable:

```
#include <stdio.h>

int main(void) {
  // print character and its associated ascii code integer
  char foo = 'a';
  printf("foo: %c (%d)\n", foo, foo); // a (97)

  // now modify the variable by adding to it
  foo = foo + 2;

  // we can see the character/integer reflects the change
  printf("foo: %c (%d)\n", foo, foo); // c (99)
  return 0;
}
```

<div id="7"></div>
## Null Terminator

Consider the following code:

```
char my_string[4] = "abc";
```

The reason we specify a length of 4 and not 3 (as you would expect with a string that is three characters in length), is because the underlying array that `my_string` is being pointed towards looks like this:

```
["a", "b", "c", "\0"] // yes it does actually have four elements
```

The last element is known as the null terminator. When this data is stored in memory, we can start at the location in memory (the _address_) where the first element is stored and then step through memory until we reach the null terminator; where we'll then find the end of the string.

> Note: you can set your variable to be the actual length of the content (e.g. `char my_string[1] = "a";`) but in some instances this can cause strange overlaps of data and strictly speaking isn't valid code either

<div id="8"></div>
## Pointers

When declaring a variable, the computer sets aside some memory for the variable. 

Next, the variable name is linked to the location in memory that was set aside for it. 

Lastly, the value you want to assign to the variable is placed into the relevant location of memory.

Let's consider the following code:

```
#include <stdio.h>

int main(void) {
  int foo = 1;
  printf("foo: %d\n", foo);

  int *bar;
  int bar_val = 1;
  printf("bar_val: %d\n", bar_val);
  bar = &bar_val;
  printf("bar: %p\n", bar);
  int bar_get_val = *bar;
  printf("bar_get_val: %d\n", bar_get_val);

  return 0;
}
```

So we see that we create a `foo` variable and assign `1` to it. We then print that integer in the typical way.

Next, we make a slightly more convoluted version, but this time we're utilising a pointer in order to help us understand what they are and how to use them.

Here are each of the steps broken down:

- `int *bar;`: we declare a pointer variable † called `bar` of type `int` but we don't initialize it with a value
- `int bar_val = 1;`: we both declare _and_ initialize the variable `bar_val` as type `int`
- `bar = &bar_val;`: we initialize the pointer variable `bar` with the memory address of `bar_val`
- `int bar_get_val = *bar;`: we dereference the address (i.e. follow the pointer) assigned to `bar` which leads us to the _value_ stored in that memory slot

> † meaning we will be assigning an address to this pointer  
> and the content at that memory address location will also be of type `int`

The output of this program is:

```
foo: 1
bar_val: 1
bar: 0x7fff59a1769c
bar_get_val: 1
```

OK, so there are some things that we need to clarify and that's the `*` and `&` operators.

- `*`: value-at-address operator (used when declaring a pointer _and_ when dereferencing a pointer)
- `&`: address-of operator (used to reference the memory address of a variable)

The first thing we should be aware of is that we're not able to print a declared variable that has no value initialized for it. So imagine the following code:

```
int *bar;
printf("bar: %d\n", bar);
```

This would cause the following compiler error:

```
format specifies type 'int' but the argument has type 'int *'
```

Which makes sense, as we've declared the variable as the type `*bar`. So we can start by fixing that issue and correctly specifying the second argument to `printf` as `*bar`:

```
int *bar;
printf("bar: %d\n", *bar);
```

> Note: `printf` will now try to use `*` to dereference the value from the variable `bar`

Unfortunately this code still causes an error. This time:

```
variable 'bar' is uninitialized when used here
```

Which again makes sense. Nothing more to say about that portion of the code, I just wanted to make it clear what happens when you try to print an uninitialized variable (and also what happens when that variable is a pointer type).

So continuing through the program, the next line of interest is:

```
bar = &bar_val;
```

This gives us the actual location in memory for the variable `bar_val` (i.e. `0x7fff59a1769c`). So the value assigned to `bar` isn't `1`, but the address of `1` in memory.

Finally, we declare and initialize the variable `bar_get_val` with the actual value of `1`, and we do that by using `*` to deference the variable `bar` which contains a memory address:

```
int bar_get_val = *bar;
```

What that means, is `bar` holds a _memory address_, which isn't a concrete value, it's an indirection to somewhere else. Hence we would say `bar` _points_ to the actual value's location and explains why we use the 'value-at-address' operator `*` to deference the value.

The following code shows how to print the location in memory of a variable even if it wasn't declared as a pointer, simply by using the address-at operator `&` which itself indicates a pointer to another location:

```
char foo = 'a';
printf("address of foo: %p\n", &foo);
```

> Note: the `&` isn't tied to `*` in any way.  
> Its purpose is just to return the memory address for a given variable

Remember, a memory address isn't the value itself but a reference to where the value can be found. One analogy I've seen is of your home address on an envelope: the envelope isn't your home, nor is the address written on the envelope. The envelope just indicates where your home can be found.

One last thing to consider/remember is that C doesn't have a String type. It stores strings in an array data structure. An array will automatically return the address location of its first element to the variable it is assigned to.

This is why you may have seen a `char` pointer being assigned a variable _without_ the need to use the `&` operator to get the memory address of that variable (because the variable, in this case an array, already provides a memory address).

The following example shows this:

```
char message[6] = "hello"; // array data structure used and memory location for message[0] returned
char *messagePtr = message; // no need to use &message now
printf("my pointer: %p\n", messagePtr);
printf("my message: %s\n", message);
```

> Note: compare C pointers and Go pointers here [https://dave.cheney.net/2014/03/17/pointers-in-go](https://dave.cheney.net/2014/03/17/pointers-in-go)

In C there are two ways to define a pointer: 

1. `char* foo` 
2. `char *foo` 

Both of which are equivalent. 

Although the first seems like the clearer option (as someone new to C would read it: "define a variable called `foo` of type 'character pointer'") compared to the second option (which could lead them to think the variable name was `*foo` not `foo`). For me the second option is preferred because otherwise the following code becomes a bit ambiguious:

```
char* foo, bar;
```

You might (incorrectly) think this would create two variables, both of type 'character pointer', but really only `foo` is the pointer and `bar` is a normal `char` type.

Where as using the second format (`char *foo`), this code becomes much clearer:

```
char *foo, bar;
```

Lastly, if you want to create a `const` that happens to be a pointer, then the syntax is as follows:

```
int count = 43;
int *const pcount = &count;
```

We prefix the `const` keyword with the value-at operator `*` and not the variable name.

<div id="9"></div>
## Arrays

Consider the following code (which is broken by the way):

```
#include <stdio.h>

int main(void) {
  char my_string = "abc";
  printf("my_string: %s", my_string);

  return 0;
}
```

This code has the following compiler error:

```
incompatible pointer to integer conversion initializing 'char' with an expression of type 'char [4]'
```

What this error tells us is that the variable `my_string` has a type of `char [4]`, meaning it is actually an array (hence the `[4]` syntax) and so we should have declared the variable like so:

```
char my_string[4] = "abc";
```

We saw earlier why this is required, when talking about [null terminators](#7). But just to recap, it's because a string should be stored within an array data structure. So we need to declare it as such.

We also learned earlier (using the above example) why the length of the array is 4 and not 3 (which you may initially have expected which a string of three characters), again to recap: this is because of the extra element added to the array for you "\0" (the null terminator).

So, the reason I'm talking about arrays is because in the original code above (the one before declaring the variable correctly) there were actually two errors linked together. The second part of the error was:

```
format specifies type 'char *' but the argument has type 'char'
```

What this error tells us is that `printf` was expecting a pointer but all it got was something of a `char` type. 

When declaring the variable as an array, we fix both errors.

But both these errors has led some people to incorrectly assume that an array is a pointer, when it is not.

Let's recap why this works. 

When assigning a string, the compiler expects the contents to be stored within an array. Each element within the array is an address to the value given to it in memory. 

So in our example above (i.e. the string `"abc"`), `"a"` is stored in memory and the address of that memory is placed in `my_string[0]`. Next `"b"` is stored in memory and the address of that memory is placed in `my_string[1]` and so on.

A pointer in contrast is a single location in memory, where as an array hold lots of memory addresses.

Because of this, an array variable automatically points to the first element within the array.

This is why if you try to `printf` a string, the compiler will complain if you don't provide a pointer. Because it expects a string to have been stored within an array (which our earlier example didn't). But when storing a string inside an array, the variable that is passed to `printf` would _already_ be a pointer, due to it automatically referencing the first array element as its value.

> Interestingly, an array's type is made up of the element type + the overall array dimension. So `int foo[3]` is a different type to `int bar[4]`. Even though the value type `int` is the same, the array dimension (size/length) is different. 

If you want to know how many bytes an array will occupy, then you calculate it based upon the number of elements multiplied by the size of each element.

Lastly, you can define and initialize a string _without_ specifying an array dimension (i.e. no size):

```
char foobar[] = "No dimension provided!";
```

What this does is leave the decision of how much memory to allocate to the compiler. But you can only do this when you initialize the variable with a value. Although you couldn't do `char foobar[];` as there is no value for the compiler to utilise to know how much memory to allocate.

<div id="10"></div>
## Enumerators

Enumerators allow you to define new variable types. They automatically assign numerical values to each of the identifiers within the enumerator (although you do also have control over the specific values as well). 

This concept is best explained by way of example:

```
#include <stdio.h>

int main(void) {
  enum weekend {Saturday, Sunday};     // 0, 1
  enum weekend today = Sunday;         // 1
  enum weekend saturday = Saturday;    // 0
  enum weekend yesterday = today - 1;  // 0 now yesterday is Saturday
  printf("today %d\n", today);
  printf("saturday %d\n", saturday);
  printf("yesterday %d\n", yesterday);
  return 0;
}
```

You can see that we define a `weekend` type and each element in that set is assigned an automatic numerical value (`0` and `1`).

Next we create a new variable `today` of type `weekend` and assign it the value `Sunday`, which means it is effectively assigned the value `1`.

You'll also notice this is why we're able to do simple arithmetic with the `today` variable (e.g. `today - 1` to get `0`).

If you wish to provide your own values you can:

```
enum bool {
  true = 1,
  false = 2
};

enum bool on = true;
enum bool off = false;

printf("on: %d\n", on);   // 1
printf("off: %d\n", off); // 2
```

<div id="11"></div>
## Memory Allocation with different Types

> See [here](http://www.integralist.co.uk/posts/bits.html) if you need a refresher on understanding RAM, bits, binary and stuff like that

### Array

Consider the following code:

```
int foo[3] = {1,2,3};
printf("foo variable points to = %p\n", foo);

int i = 0;
do {
  printf("foo[%u] = %p\n", i, (void *)(&foo[i]));
  i++;
} while(i < 3);

printf("sizeof(foo) = %lu\n", sizeof(foo));
```

So in this piece of code we create an array and assign it to `foo` (where the first element's memory address will ultimately be referenced). 

Next we print out what the `foo` variable points to, which for me outputs:

```
foo variable points to = 0x7fff525fd6ac
```

Then we loop over the `foo` array and print out each element's address, which for me outputs:

```
foo[0] = 0x7fff525fd6ac
foo[1] = 0x7fff525fd6b0
foo[2] = 0x7fff525fd6b4
```

Notice that the `foo` variable and the first element of the `foo` array are the same value: `0x7fff525fd6ac`, which is the address of the memory location for the value `1` assigned to `foo[0]`. 

So this demonstrates clearly that when a variable is assigned an array, then it will actually point to the memory address of that array's first element.

If we look at `(void *)(&foo[i])`, shown in the above example code, we find this interesting setup where by we're casting the address to `void`. Well you don't need to do that unless you're passing a variable that is itself a pointer variable to another variable.

For example, `int foo = 1; int *pFoo = foo`. Here you would cast to `void` to prevent a possible warning from the compiler when using `%p` within a `printf` statement. 

This is because `printf` and `%p` will expect the value to be a pointer type, but in cases where you have a pointer variable assigned an `int` variable, then the type of `&pFoo` would actually be a 'pointer to pointer to int'. It just highlights the importance of paying attention to the variables you're defining and what they're pointing to.

Finally we print the size of the `foo` variable, which outputs:

```
sizeof(foo) = 12
```

You might wonder  where the value `12` comes from? Well, this goes back to how data is stored in memory (i.e. a block of memory is 1 byte; so 8 bits). We defined the type of the array to be `int` and (depending on the compiler) that will be either two bytes, four bytes or eight bytes. 

For most 32 bit systems the size of `int` would be four bytes. You can always use `sizeof(int)` to check:

```
printf("sizeof(int): %ld\n", sizeof(int)); // 4
```

So looking back at our example, we have three array elements, and if each element takes up four bytes then it makes sense the size of the array would be `12` (i.e. `4 + 4 + 4 = 12`).

To calculate the number of items within the array itself, rather than the number of bytes, you can use:

```
size_t element_count = sizeof foo/sizeof foo[0];
printf("element_count: %zu\n", element_count); // 3
```

> Note: `%z` is for `size_t` and the `u` prevents an `invalid conversion specifier` error.

### Signed vs Unsigned

In C you can define an integer to be either `signed` or `unsigned`. The former means the number can be both negative and positive as well as zero. Where as the latter is always positive.

> Note: typically, if a number is negative, you'll prefix it with `-`. If the number is positive, then it is just the number. For example, `-1` and `1`. This is a little more convoluted in binary though (resulting in concepts such as 'ones complement' and 'twos complement' - Google it if you want to know more though).

You don't need to explicitly provide the `signed` keyword (e.g. `signed int <var_name>`), it's just implied.

The latter (`unsigned`) is an integer that can only be positive. So if you need to store an integer and you know the value will always be zero or positive, then you can define it as being unsigned and the compiler can make appropriate optimisations based on that understanding.

So although the underlying memory allocation is the same for signed or unsigned, the actual values represented are slightly different, in that unsigned allows for storing values that are twice the size of signed, because half of signed's values have to account for negatives.

<div id="12"></div>
## Reallocating Memory

With strings you typically define them as follows (i.e. the underlying data structure is an array):

```
char names[20] = "hello";
```

But this can result in wasted reserved memory. Also, when reading input from stdin (e.g. user input) the amount of characters entered could exceed the specified reserved memory allocation.

Below is an example, given as a [Stack Overflow](http://stackoverflow.com/questions/8164000/how-to-dynamically-allocate-memory-space-for-a-string-and-get-that-string-from-u) response, that reads each character from stdin and reallocates the memory space if required (it's advised that you ensure reallocation of memory is done as a multiple; such as double the size):

```
char *getln()
{
    char *line = NULL, *tmp = NULL;
    size_t size = 0, index = 0;
    int ch = EOF;

    while (ch) {
        ch = getc(stdin);

        /* Check if we need to stop. */
        if (ch == EOF || ch == '\n')
            ch = 0;

        /* Check if we need to expand. */
        if (size <= index) {
            size += CHUNK;
            tmp = realloc(line, size);
            if (!tmp) {
                free(line);
                line = NULL;
                break;
            }
            line = tmp;
        }

        /* Actually store the thing. */
        line[index++] = ch;
    }

    return line;
}
```

There is a very good blog post that covers the steps in detail here: [https://brennan.io/2015/01/16/write-a-shell-in-c/](https://brennan.io/2015/01/16/write-a-shell-in-c/). It's effectively the same implementation (in principle), except for the use of `getchar` vs `getc` (the former can only read from stdin, where as `getc` can read from any input stream).

```
#define LSH_RL_BUFSIZE 1024
char *lsh_read_line(void)
{
  int bufsize = LSH_RL_BUFSIZE;
  int position = 0;
  char *buffer = malloc(sizeof(char) * bufsize);
  int c;

  if (!buffer) {
    fprintf(stderr, "lsh: allocation error\n");
    exit(EXIT_FAILURE);
  }

  while (1) {
    // Read a character
    c = getchar();

    // If we hit EOF, replace it with a null character and return.
    if (c == EOF || c == '\n') {
      buffer[position] = '\0';
      return buffer;
    } else {
      buffer[position] = c;
    }
    position++;

    // If we have exceeded the buffer, reallocate.
    if (position >= bufsize) {
      bufsize += LSH_RL_BUFSIZE;
      buffer = realloc(buffer, bufsize);
      if (!buffer) {
        fprintf(stderr, "lsh: allocation error\n");
        exit(EXIT_FAILURE);
      }
    }
  }
}
```

> Notice `c` variable is declared as an `int` and not a `char`, the author of the blog post makes mention of this as being because `EOF` is an `int` type

The author then goes on to explain that in more recent releases, there is a much shorter version that can be implemented thanks to the `getline` function:

```
char *lsh_read_line(void)
{
  char *line = NULL;
  ssize_t bufsize = 0; // have getline allocate a buffer for us
  getline(&line, &bufsize, stdin);
  return line;
}
```

<div id="13"></div>
## Function Prototypes

A compiler will error if you try to call a function before it has been defined. This can be mitigated by utilising function prototypes that let you define the signature of the function up front and defer the definition until a later point in time (sort of like defining an interface type):

```
// Function prototypes
int Foo(double data_values[], size_t count);
int Bar(double *x, size_t n);

int main(void) {
  int f = Foo(...signature...);
  int b = Bar(...signature...)
}

// Definitions for Foo() and Bar()
```

<div id="14"></div>
## Conclusion

So that covers most of what I found interesting about C over the last few days. I'm not planning on writing any C code in the future (why bother when I can get pretty compariable performance + great tooling etc etc with a language like [Go](https://golang.org)).

But regardless, this was a fun little exercise in learning something new. Hope you learnt something too. As always, feel free to [ping me on twitter](https://twitter.com/integralist) if you feel I've missed something.

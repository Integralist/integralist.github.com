---
title: "Bits and Bytes"
date: 2016-11-16T13:00:00+01:00
categories:
  - "code"
  - "guide"
tags:
  - "bits"
  - "bytes"
  - "ram"
  - "cidr"
draft: false
---

- [Introduction](#1)
- [Bit](#2)
- [Byte](#3)
- [RAM](#4)
- [Bit and RAM Visualisation](#5)
- [Bits and Numbers](#6)
- [IPs](#7)
- [Base Numbers](#8)
  - [Convert Base-10 into Base-2/8](#8.1)
  - [Convert Base-10 into Base-16](#8.2)
  - [Convert Any Base to Base-10](#8.3)
- [CIDR](#9)
- [Conclusion](#10)

<div id="1"></div>
## Introduction

So this is a bit of a random journey through some different computer based subjects. Things that I felt I should try to better understand. Some of it will be very basic, but hopefully it'll be useful to those who are new to tech, and are interested in learning these things (or old dogs like me who should know better).

<div id="2"></div>
## Bit

The word _bit_ is short for _binary digit_.

A bit is either a `1` (true) or a `0` (false).

Computers only understand the binary format (i.e. base-2)

> We discuss 'base' numbers [below](#8)

<div id="3"></div>
## Byte

A grouping of eight _bits_ is called a _byte_.

> Read the next section to realise why I mention this tidbit of information

<div id="4"></div>
## RAM

The word _ram_ is an acronym for _random access memory_.

It's non-persistent memory.

Meaning it is lost when your machine is restarted, and persists only for the lifetime of the program using it.

RAM consists of bits, but each _segment_ of memory is actually a grouping of eight bits (which we already know is called a _byte_).

So in short we would say RAM is made up of bytes.

Bytes are uniquely numbered to allow easy lookup of their contents.

A byte's unique number is also referred to as its _address_.

<div id="5"></div>
## Bit and RAM Visualisation

<a href="../../images/bits-visualised.png">
    <img src="../../images/bits-visualised.png">
</a>

We can see that each bit has an associated value which is calculated using the power of base-2 (we'll cover [base numbers](#8) shortly).

So:

- 2<sup>0</sup> = 1
- 2<sup>1</sup> = 2
- 2<sup>2</sup> = 4 (i.e. `2 * 2`)
- 2<sup>3</sup> = 8 (i.e. `2 * 2 * 2`)
- 2<sup>4</sup> = 16 (i.e. `2 * 2 * 2 * 2`)
- 2<sup>5</sup> = 32 (i.e. `2 * 2 * 2 * 2 * 2`)
- 2<sup>6</sup> = 64 (i.e. `2 * 2 * 2 * 2 * 2 * 2`)
- 2<sup>7</sup> = 128 (i.e. `2 * 2 * 2 * 2 * 2 * 2 * 2`)

With this information we can identify the value assigned by adding up the numbers associated with the ones and zeros. 

So in the image we can see four of the bits are given `1` (on) and the rest are `0` (off), meaning if we add up all the associated values of the bits that are 'on' we get `99`.

<div id="6"></div>
## Bits and Numbers

1 kilobyte (or 1KB) is 1,024 bytes.

1,024 bytes is 8192 bits (`8192/8` or `8*1024`, whichever you prefer)

The following explanation is taken from "Beginning C" by Apress Publishing...

> You might be wondering why we don’t work with simpler, more rounded numbers, such as a thousand, or a million, or a billion. The reason is this: there are 1,024 numbers from 0 to 1,023, and 1,023 happens to be 10 bits that are all 1 in binary: 11 1111 1111, which is a very convenient binary value. So while 1,000 is a very convenient decimal value, it’s actually rather inconvenient in a binary machine—it’s 11 1110 1000, which is not exactly neat and tidy. The kilobyte (1,024 bytes) is therefore defined in a manner that’s convenient for your computer, rather than for you.

So if we add up `512+256+128+64+32+16+8+4+2+1` (notice this takes the existing 8 bit calculation from the above image and continues it for another two bits) we get `1023`.

<div id="7"></div>
## IPs

Here is an example IPv4 IP:

```
216.27.61.137
```

IPv4 IPs are expressed in decimal format. 

> Note: IPv6 IPs are eight 4-character hexadecimal numbers,  
> which represent 16 bits each (for a total of 128 bits)  
> e.g. `2001:0db8:0a0b:12f0:0000:0000:0000:0001`

To translate the above IP into binary form (for the sake of a computer to process it), we could use the above visualisation image to help us. The end result of which would look like this:

```
11011000.00011011.00111101.10001001
```

Which breaks down into:

- `11011000`: 128 + 64 + 16 + 8 = 216
- `00011011`: 16 + 8 + 2 + 1 = 27
- `00111101`: 32 + 16 + 8 + 4 + 1 = 61
- `10001001`: 128 + 8 + 1 = 137

This explains why each of the four numbers within the decimal formatted version (i.e. `216.27.61.137`) are called octets, as they represent eight bits (or a 'byte' as we learned earlier) when viewed in binary form.

This also explains why IPv4 IPs are considered 32-bit numbers, because if you add each of the bits together (i.e. the number of total bits, not the value assigned to each bit) you'll find there are a total of 32 bits that make up the IP.

Each bit can have two different states (1 or zero), meaning the total number of potential combinations per octet can be either 28 or 256. Meaning each octet can contain a potential value between zero and 255. Meaning if we were to combine the four octets, we could potentially have 4,294,967,296 variations.

We can see the decimal represenation of an IPv4 IP is made up of four base-10 numbers (216, 27, 61, 137). Where each of those four numbers represent the binary equivalent (216=11011000, 27=00011011, 61=00111101, 137=10001001), which is a base-2 representation of a byte (or octet).

> If you're unsure of what base numbers are and how they work, then read on...

<div id="8"></div>
## Base Numbers

It's worth quickly covering what base numbers are as they help us understand the other different protocols we use on a regular basis, such as binary and things like IPs.

Any number can be represented in multiple ways using a different base numbering system.

There are many numbering systems, but the typical ones we're used to are:

- Base 10 (Decimal)
- Base 2 (Binary)
- Base 8 (Octal)
- Base 16 (Hexadecimal)

The standard number system we (as humans) are most familiar with is called base-10 and it consists of the following numbers: 

```
0,1,2,3,4,5,6,7,8,9
```

> Notice there are ten numbers, hence it is called the base-10 system

If we were to look at a number like `66`, then this would tell us the number is made up of 6 tens and six units.

These numbers (0-9) represent 'whole numbers', while in the base-10 system we can also use a decimal point to represent decimal fractions of a number (e.g. `1.2`). 

Below is an image, credit to Jenny Eather, that helps us visualise this model:

<a href="../../images/base-10-system.png">
    <img src="../../images/base-10-system.png">
</a>

The 'base number' is the number of numbers within the system. So base-10 has 10 numbers (0,1,2,3,4,5,6,7,8,9) where as binary is base-2 because it uses two numbers only (0, 1).

If you want to know the unit each number in a system represents (we'll use base-10 as the example, thanks to the following visualisation credited to Jenny Eather), then you calculate this using the power of the base number.

<a href="../../images/base-10.png">
    <img src="../../images/base-10.png">
</a>

So, as per the above visualisation, we can see:

- 10<sup>3</sup>: `10*10*10`: 1000 (thousands)
- 10<sup>2</sup>: `10*10`: 100 (hundreds)
- 10<sup>1</sup>: `10`: 10 (tens)
- 10<sup>0</sup>: `1`: 1 (unit)

So in practical terms, if you have a number like `75` and want to represent it as base-10:

- 5 (10<sup>0</sup>: 5 units)
- 7 (10<sup>1</sup>: 7 tens)

Similarly, if we had a number like `675` and want to represent it as base-10:

- 5 (10<sup>0</sup>: 5 units)
- 7 (10<sup>1</sup>: 7 tens)
- 6 (10<sup>2</sup>: 6 hundreds)

You can indicate what base you wish to represent a number like so:

n<sub>b</sub>

Where `n` is the number and `b` is the base you wish to state it is in.

For example:

75<sub>10</sub>

This is the number `75` and we're stating the base it represents is `10`. 

This is useful when you've converted a number like `75` into a different base (let's say base-8, which would be `113`) and you want to give that number in the proper context to someone else. You could write it as 113<sub>8</sub>.

<div id="8.1"></div>
### Convert Base-10 into Base-2/8

> Note: the steps are the same for converting to base-2 and base-8

Now let's consider how to convert the number `75` into another base, like base-8. To do so, follow these steps

1. divide the number (75) by the desired base (8) (take note of the remainder: 3)
2. take the result (9) and do the same (i.e. divide by the base and take note of the remainder)
3. keep doing this until the result of dividing the previous answer by the base is zero
4. now write out the remainders bottom to top, and that's the number in base-8

In long form this looks like this:

- 75 (number) / 8 (base) = 9 (rounded) with a remainder of 3
- 9 (previous answer) / 8 (base) = 1 (rounded) with a remainder of 1
- 1 (previous answer) / 8 (base) = 0 (rounded) with a remainder of 1

Meaning 75 evaluated in base-8 would be `113` (all the remainders concatenated together, 'bottom up')

<div id="8.2"></div>
### Convert Base-10 into Base-16

The algorithm for converting from base-10 into base-2 and base-8 works basically the same for converting into base-16. But there is one caveat whereby a remainder can be in the double digits, and apparently (for reasons I don't completely understand) we don't want that, and so the number system was designed to replace the six instances where this can occur (the remainders being: 10, 11, 12, 13, 14, 15) with a alpha-numeric equivalent:

- 10-A
- 11-B
- 12-C
- 13-D
- 14-E
- 15-F

So if we want to convert 110<sub>10</sub> into a hexadecimal, the outcome of the algorithm would be:

- 110 (number) / 16 (base) = 6 (rounded) with a remainder of 14
- 6 (previous answer) / 16 (base) = 0 (rounded) with a remainder of 6

We know that we need to replace `14` (a double digit remainder) with the letter `E` (see above mapping).

Meaning 110 evaluated in base-16 would be `6E`

Let's try it again, but with the number 411<sub>10</sub>:

- 411 (number) / 16 (base) = 25 (rounded) with a remainder of 11
- 25 (previous answer) / 16 (base) = 1 (rounded) with a remainder of 9
- 1 (previous answer) / 16 (base) = 0 (rounded) with a remainder of 1

We know that we need to replace `11` with the letter `B`.

Meaning 411 evaluated in base-16 would be `19B`

<div id="8.3"></div>
### Convert Any Base to Base-10

What if you want to convert a base-8 number (let's say `113`, why not) into base-10? The algorithm is to multiple the individual numbers by their associated power of the base and then add the numbers together.

So here are the base-8 powers:

- 3: 8<sup>0</sup>
- 1: 8<sup>1</sup>
- 1: 8<sup>2</sup>

And here is the algorithm:

- 3 x 8<sup>0</sup> = 3
- 1 x 8<sup>1</sup> = 8 (i.e. `1*8`)
- 1 x 8<sup>2</sup> = 64 (i.e. `1*(8 * 8)`)
- 3 + 8 + 64 = 75

If you're dealing with base-16, then again it's the same but the difference is you're translating the letter back into the corresponding number.

Let's convert `19B` from base-16 back into base-10:

- B x 16<sup>0</sup> (11 x 16<sup>0</sup>) = 11
- 9 x 16<sup>1</sup> = 144
- 1 x 16<sup>2</sup> = 256
- 11 + 144 + 256 = 411

Let's try one more conversion between base-16 to base-10. The number is `1A4`:

- 4 x 16<sup>0</sup> = 4
- A x 16<sup>1</sup> (10 x 16<sup>1</sup>) = 160
- 1 x 16<sup>2</sup> = 256
- 4 + 160 + 256 = 420

<div id="9"></div>
## CIDR

A CIDR is a range of IP addresses. We can use our understanding of bits, bytes and octets to understand the format of a CIDR.

A CIDR typically resembles something like:

```
10.0.0.0/n
```

Where `n` is given the value 8, 16, 24, or 32 and these represent each of the 8-bit blocks that make up the IP.

If we want an IP range between `10.0.0.0` and `10.255.255.255`, we'd specify the CIDR as `10.0.0.0/8`.

What `8` states is that the last 8 bits of the 32-bit number is accounted for (this being the `10` we've specified in our example). Meaning the rest of the 8-bit segments can be added up to their max of 255 (meaning the last IP in this CIDR range would be `10.255.255.255`).

Similarly if we want an IP range between `10.0.0.0` and `10.0.255.255`, we'd specify the CIDR as `10.0.0.0/16`.

Again, `16` states that the next 8-bits segment of the 32-bit number is now accounted for (this being the `0` we've specified in our example `10.0`). Meaning the rest of the 8-bit segments can be added up to their max of 255 (meaning the last IP in this CIDR range would be `10.0.255.255`).

And so on...

So `10.0.0.0/24` gives us an ip range of `10.0.0.0` to `10.0.0.255` (256 IPs). 

Where as `10.0.0.0/32` gives us an ip range of 1 ip (`10.0.0.0` to `10.0.0.0`).

> Note: you can use a tool such as [http://www.ipaddressguide.com/cidr](http://www.ipaddressguide.com/cidr) to help you generate CIDRs

We can use the earlier [byte visualisation](#visualisation) table matrix to help us manually calculate a CIDR range.

I've reproduced it below with a HTML table:

> Note: you'll likely need to scroll to the right to see the start of the 32-bit

<table border="1" id="table10" bordercolor="#000080" style="text-align: center; font-family: Verdana; font-size: 8pt; color: #000000">
    <tbody>
    <tr>
        <th width="15%">IP</th>

        <td colspan="8">10</td>

        <td colspan="8">0</td>

        <td colspan="8">0</td>

        <td colspan="8">1</td>
      </tr>
      <tr>
        <th>8 Bit Blocks</th>

        <td colspan="8">8 bits [24-31]</td>

        <td colspan="8">8 bits [16-23]</td>

        <td colspan="8">8 bits [08-15]</td>

        <td colspan="8">8 bits [00-07]</td>
      </tr>

      <tr>
        <th>32 Bit #</th>

        <td>31</td>

        <td>30</td>

        <td>29</td>

        <td>28</td>

        <td>27</td>

        <td>26</td>

        <td>25</td>

        <td>24</td>

        <td>23</td>

        <td>22</td>

        <td>21</td>

        <td>20</td>

        <td>19</td>

        <td>18</td>

        <td>17</td>

        <td>16</td>

        <td>15</td>

        <td>14</td>

        <td>13</td>

        <td>12</td>

        <td>11</td>

        <td>10</td>

        <td>09</td>

        <td>08</td>

        <td>07</td>

        <td>06</td>

        <td>05</td>

        <td>04</td>

        <td>03</td>

        <td>02</td>

        <td>01</td>

        <td>00</td>
      </tr>

      <tr>
        <th>Decimal</th>

        <td>128</td>

        <td>64</td>

        <td>32</td>

        <td>16</td>

        <td>8</td>

        <td>4</td>

        <td>2</td>

        <td>1</td>

        <td>128</td>

        <td>64</td>

        <td>32</td>

        <td>16</td>

        <td>8</td>

        <td>4</td>

        <td>2</td>

        <td>1</td>

        <td>128</td>

        <td>64</td>

        <td>32</td>

        <td>16</td>

        <td>8</td>

        <td>4</td>

        <td>2</td>

        <td>1</td>

        <td>128</td>

        <td>64</td>

        <td>32</td>

        <td>16</td>

        <td>8</td>

        <td>4</td>

        <td>2</td>

        <td>1</td>
      </tr>

      <tr>
        <th>Binary</th>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td><font color="#DC143C">1</font></td>

        <td>0</td>

        <td><font color="#DC143C">1</font></td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td>0</td>

        <td><font color="#DC143C">1</font></td>
      </tr>
    </tbody>
  </table>

<div id="10"></div>
## Conclusion

There you go. A whirlwind ride through different basic computer tech topics. As always, if I've gotten anything wrong then just let me know on twitter.


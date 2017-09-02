---
title: "Terminal Password Manager"
date: 2016-10-19T13:00:00+01:00
categories:
  - "code"
  - "guide"
  - "security"
tags:
  - "shell"
  - "terminal"
  - "passwords"
draft: false
---

- [Introduction](#1)
- [Installation](#2)
- [Example Usage](#3)
- [Exporting Data](#4)
- [Synchronisation](#5)
- [Mobile and GUI Applications](#6)
- [MultiFactor Authentication](#7)
- [Conclusion](#8)

<div id="1"></div>
## Introduction

I'm guessing that you have an app like [1Password](https://1password.com/) or [KeePassX](https://www.keepassx.org/) to manage your passwords and other login credentials and you're now looking for a cheaper alternative, and also one that doesn't rely on a GUI (although as you'll see that's still possible).

If so, then "[Pass](https://www.passwordstore.org/)" might be something of interest to you as it offers you the ability to securely store information via the command line interface (e.g. terminal shell) and is a free solution to that particular problem. 

But you need to be aware that it's not as feature rich as far as something like 1Password is concerned.

For example, 1Password has browser extensions and native apps that allow you to automatically pull your password from 1Password directly into the relevant login fields of the service you're visiting.

Pass is much simpler than that.

On the plus side, Pass is based on standardised unix technology. Specifically [GPG](https://www.gnupg.org/), which can give you confidence in the security mechanisms being utilised.

> Note: if you need a refresher on encryption and GPG, then I'll refer you to an [earlier blog post of mine](http://www.integralist.co.uk/posts/security-basics/) that covers the basics on this topic

<div id="2"></div>
## Installation

Installation on macOS is easy with [Homebrew](http://brew.sh/), and let's face it, if you're using macOS then Homebrew has become a de facto standard:

```
brew install pass
```

Once you've installed Pass you'll probably want to install the shell auto-complete script as well. This requires you sourcing it into your shell profile. 

For me on Bash this looks like this:

```
echo "source /usr/local/etc/bash_completion.d/password-store" >> ~/.bashrc
```

> Note: other distros available on the [Pass website](https://www.passwordstore.org/#download)

At this point you need to initialize Pass:

```
pass init "AB123C4D"
```

Just swap `AB123C4D` for your own GPG id. You can find that information by executing the following GPG command to list out all your available keys:

```
gpg --list-keys
```

You should see something like the following output:

```
pub   1234A/AB123C4D
```

Your GPG id is the bit after the forward slash: `AB123C4D`

<div id="3"></div>
## Example Usage

So here's the super quick run down on how to use Pass:

- `pass`: displays the structure of your information
- `pass generate Foo/bar 20`: insert new record & auto-generate password
- `pass insert Foo/bar`: insert new record & manually enter password
- `pass insert Foo/bar -m`: insert new record & manually enter multiline data
- `pass Foo/bar`: display first line of data in stdout †
- `pass -c Foo/bar`: copy first line of data into clipboard
- `pass rm Foo/bar`: remove the file `bar` ∆

> ∆ to remove the whole directory: `pass rm -rf Foo`  
> Once the last file in a directory is removed, so is the directory

So if you executed the second command (`generate`) and _then_ executed the first command (`pass`) you would see something like the following:

```
Password Store
└── Foo
    └── bar.gpg
```

So we can see we've created an arbitrary data structure of `Foo` as the top level directory, and inside of that a encrypted file called `bar.gpg`.

Where we've specified † is an important point to be aware of, because you're free to create any 'structure' you like. So the suggestion from Pass is to create a single file that contains the following information (just as a guide):

```
Yw|ZSNH!}z"6{ym9pI
URL: *.amazon.com/*
Username: AmazonianChicken@example.com
Secret Question 1: What is your childhood best friend's most bizarre superhero fantasy? Oh god, Amazon, it's too awful to say...
Phone Support PIN #: 84719
```

Notice the first line is just the password, which means you can easily copy it to your clipboard using the `-c` flag (e.g. `pass -c Foo/bar`). All the remaining information is considered secondary meta data.

Other types of data structuring you could do is to store data in sub-directories, which would make it easier for copying into your clipboard. For example:

```
Foo/app1/password
Foo/app1/secret-question
```

Alternatively, you could store the password in one file, and have just a single additional metadata file like so:

```
Foo/app2
Foo/app2.meta
```

So `app2` is the file containing the password, and `app2.meta` is the file that contains all the other related information such as secret question/answer key pairs and contact numbers/emails etc.

But to be honest, that last style seems a bit pointless as having a `.meta` file is still a manual process for copying out data (unless your metadata consists of one additional secret question password, which could be on the first line of that file for easy copying, and then all other data is contact numbers and things like that).

<div id="4"></div>
## Exporting Data

If you want to automate the migration of data out of a GUI based app such as 1Password, then the Pass community [has you covered](https://www.passwordstore.org/#migration).

<div id="5"></div>
## Synchronisation

I wanted to be able to backup my encrypted password store, in case my laptop melted one day. So the simplest solution was to move the directory `~/.password-store` into a cloud provider space for synchronisation and then symlinking the directory into my home directory:

```
ln -s ~/YourCloudOrg/.password-store/ ~/.password-store
```

Yes this means that your encrypted data is now only as secure as the passphrase around your GPG private key. But I'm fairly confident in both my encryption key and the passphrase around it and so this is an acceptable compromise to make.

Security and Convenience, these two always dance around each other.

<div id="6"></div>
## Mobile and GUI Applications

I've no need for a desktop/laptop GUI, as that's what the terminal shell is for and I'm happy using that. But if you check the introduction text on the Pass website, you'll find details on some different community built GUIs that are available.

There are also mobile applications, which I've yet to try out because they seem like quite a bit of faff to set-up; and this is the biggest downside to Pass so far and it doesn't work with synchronisation via a cloud provider.

Instead the Android app expects you to configure your Pass store to be a git repository (something I've not covered here). But then that requires you to push the store into a public/private git repo.

Now there's no reason why I couldn't do this beause I've already conceded that security aspect when I exposed the files by syncing them to a cloud provider (a little less visible than a public git repo for some people), but again, if you're confident in your key encryption and its passphrase then this might work fine for you.

<div id="7"></div>
## MultiFactor Authentication

The purpose of multifactor authentication (also known as 2FA: two factor authentication) is to add additional security to the process of accessing a service. 

For example, typically you'll log into a service using a username and password. But if your laptop becomes compromised and you've saved your login credentials for a particular service then without 2FA you've now given up access to that service and the data it holds.

For some services, such as provided by Google, you can enable 2FA. What this means is that you associate with that service (let's use Google as the example) another device. 

Most of the time the device is a mobile phone, as that is one of the few devices that are usually safely held by the true owner of the Google account being accessed.

With 2FA you'll be provided a token. You then store this token in a 2FA application (Google has its own "Authenticator" Android app for example). Now every time you go to log into your Google account from a new machine, you'll be asked to consult the 2FA application (which will give you a random/unique key back). You'll then be expected to provide Google the 2FA key along with your username and password.

We can do a similar thing using Pass. But instead of a mobile device as the associated device to the Google account, you can associate your laptop running  Pass and a desktop equivalent 2FA application (remember, it doesn't have to be your main laptop, it could be another laptop or computer obviously).

Now this would normally be a bit of a concern for some people. The idea being that 2FA is supposed to help when your 'device' is compromised. Hence people associate their mobile as the device for handling 2FA, as it's less likely to get lost or damaged.

If you have your laptop, which has access to the service, also being the associated 2FA token provider kinda defeats the point.

But because we're using GPG and Pass, in effect (similar to my comments about sync'ing my Pass store onto a cloud provider), if you're confident your generated GPG key and its passphrase are solid then you should be less concerned because your key will be near impossible to crack via automation and so if your laptop is compromised it won't matter as the 2FA application won't be able to pull the Google token from Pass in order to generate a unique key to access Google (along with your username and password).

One way of achieving this was shared with me by [Jake Champion](https://twitter.com/jakedchampion):

```
brew install oath-toolkit
```

This will provide you with a `oath` command, which will be used as your 2FA application. The way it works is that when setting up 2FA on your Google account, you'll take the provided token and store it in Pass.

Now every time you need to access your account, you can execute the following command and extract the Google token from Pass. Which will generate the key needed to be provided to Google when logging in using your username/password:

```
oathtool --base32 --totp $(pass 2FA/Amazon)
```

The above snippet assumes you stored your Google token like so:

```
pass insert 2FA/Amazon <your_google_token>
```

That's all there is to it.

> Note: see [this gist](https://gist.github.com/NapoleonWils0n/4005467) for more details on the Google 2FA setup process

<div id="8"></div>
## Conclusion

Compared to the pricing of something like 1Password:

- $3 per month (forever)
- $64 (single licence, not all devices either and not all features)

Then considering I spend the majority of my time working from a terminal shell. It would seem that Pass is a good starting point.

But ultimately I think I'm going to have to explore the git hosted option (with a private repository) for the mobile app setup, just so that I can ensure a little less visibility into my data information structure.

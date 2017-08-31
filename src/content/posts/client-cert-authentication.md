---
title: "Client Cert Authentication"
date: 2015-10-03T13:00:00+01:00
categories:
  - "guide"
  - "process"
  - "security"
tags:
  - "bash"
  - "certificates"
  - "curl"
  - "docker"
  - "https"
  - "keys"
  - "nginx"
  - "openssl"
  - "ssl"
draft: false
---

- [Introduction](#1)
- [Directory Structure](#2)
- [Configuration](#3)
- [Building](#4)
- [Running](#5)
- [Verifying](#6)
- [Revocation](#7)
- [References](#8)
- [Conclusion](#9)

<div id="1"></div>
## Introduction

The purpose of this post is to demonstrate how to configure nginx to use client certificates for authenticated access to your back-end service (in this example: a Ruby/Sinatra application).

> Note: the focus of this post isn't about Ruby/Sinatra so don't worry if your back-end service is built with another programming language

I won't be going into the details of how most of it was set-up, as the majority of this was already documented in a previous blog post here: [Setting up nginx with Docker](http://www.integralist.co.uk/posts/docker-nginx.html) so I recommend reading through that first if you're new to Docker and nginx.

I will be showing most of the files, but I'll assume you're familiar with nginx and Docker. The changes involved for setting up client authentication is actually very minimal, and in reality the majority of the work is in the creation of a CA, CRL and signing certificates.

If you need a refresher on TLS/SSL then please read: [Security basics with GPG, OpenSSH and OpenSSL](http://www.integralist.co.uk/posts/security-basics.html) which covers the SSL handshake process and a lot more.

So let's get started...

<div id="2"></div>
## Directory Structure

First things first, we're going to need the following set of files and folders:

```
.
├── docker-app
│   ├── Dockerfile
│   ├── Gemfile
│   ├── Gemfile.lock
│   ├── app.rb
├── docker-nginx
│   ├── Dockerfile
│   ├── certs
│   │   ├── ca.crt
│   │   ├── ca.key
│   │   ├── client.crt
│   │   ├── client.csr
│   │   ├── client.key
│   │   ├── server.crt
│   │   ├── server.csr
│   │   ├── server.key
│   └── nginx.conf
└── html
    ├── index.html
    └── test.html
```

You can get most of this structure from the following GitHub repository: [Integralist/Docker-Examples/Nginx-ClientCertAccess](https://github.com/Integralist/Docker-Examples/tree/master/Nginx-ClientCertAccess).

I say "most" because the `docker-nginx/certs` folder no longer exists in the repo. This is OK because I'll demonstrate how to generate these files in the following sub sections of this article.

The reason the `docker-nginx/certs` folder no longer exists is due to the last portion of this article where by we switch to another format for generating certificates and self-signing (specifically the "[Revocation/CRL Management](#7)" section).

<div id="3"></div>
## Configuration

As far as configuration is concerned, the main part comes down to the `nginx.conf` file:

```
user nobody nogroup;
worker_processes auto;

events {
  worker_connections 512;
}

http {
  upstream app {
    server app:4567;
  }

  server {
    listen *:443;
    ssl on;
    server_name ""; 

    ssl_certificate        /etc/nginx/certs/server.crt;
    ssl_certificate_key    /etc/nginx/certs/server.key;
    ssl_client_certificate /etc/nginx/certs/ca.crt;
    ssl_verify_client      on;

    root /usr/share/nginx/html;

    location /app/ {
      proxy_pass http://app/;
      proxy_set_header X-ClientCert-DN $ssl_client_s_dn;
    }
  }
}
```

As we can see we're telling nginx to listen to any interface on port `443` (TLS connections) only. We then enable SSL and specify a few different `ssl_` settings that direct nginx to certain locations where it can find the server's own certificate and private key, as well as the CA certificate that was used to sign both the server certificate as well as the user/client certificate we'll be using shortly to connect to this service.

You'll probably also notice `ssl_verify_client` has been turned `on`. This could be made 'optional' so that some connections are allowed to public endpoints. But in my case I want everything to be protected by client certs.

Finally, when we proxy traffic onto our back-end service, we also create a new custom HTTP header to be proxied on as well; which I've named: `X-ClientCert-DN`. The value assigned to this custom header uses the nginx `$ssl_client_s_dn` variable, which extracts the `Common Name` section of the client's certificate.

Interestingly, the Ruby server receives the HTTP request with the custom header transformed into `HTTP_X_CLIENTCERT_DN`. Just something to be aware of if you decide to switch from Ruby to another programming language, such as [Go](https://golang.org/) (as your mileage may vary).

### Generating the certificates and keys

So the first thing we want to do is to create the CA key/certificate, which will be used for signing both the server and the client certificate requests:

```
openssl genrsa -des3 -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt
```

For the `ca.crt` generation I pretty much entered `.` (which means 'no value') for all details. The only exception was the `Common Name` field which I entered 'TheCA' (so I could recognise it as the 'ca', just in case I needed to inspect the certificate)

> Note: all of these commands I ran inside of the `docker-nginx/certs` folder to make it easier later on to mount them as a volume into my Docker containers

Next we'll create the server key along with a CSR (Certificate Signing Request) which the CA will use to generate the server's certificate:

```
openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr
```

For the CSR I pretty much entered `.` (which means 'no value') for all details. The only exception was the `Common Name` field which I entered 'TheServer' (so I recognise it as the 'server', just in case I needed to inspect the certificate).

> Note: I don't specify `-des3` in the command as I don't want to generate a passphrase for the private key. If I have to restart my server I don't want the automation to be affected by requiring me to manually enter the passphrase

Now we'll self-sign the server's CSR and generate its own certificate (in case it's not clear: self-signing isn't something you want to do unless you know you are going to ask your users to trust your certificate and ignore big warnings about an unknown CA signing the server's cert):

```
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
```

OK, almost there. We now need to create a private key and CSR for our client (i.e. this will be the user trying to access the service):

```
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr
```

You'll notice I've made the encryption length `2048` instead of `4096`. I did this as a speed/perf compromise, as higher length encryption keys can be slower to use with the TLS handshake process (just one of the many security compromises that need to be considered).

For the CSR I pretty much entered `.` (which means 'no value') for all details. The only exceptions were the `Common Name` field which I entered 'Mark McDonnell' (so I recognise it as the 'client') and the `Email Address` field, which I entered something like `mark@integralist.com` (as I want to parse out that email in my Ruby application)

> Note: again I don't specify `-des3` in the command, as I don't want to generate a passphrase for the private key

Finally, I sign the client CSR using the CA certificate:

```
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
```

That's it, that's all the different certificates set-up and ready to be used. Let's move onto building our Docker set-up and running some containers...

<div id="4"></div>
## Building

This section's nice and short because I provide the `Dockerfile` for both the Ruby and nginx applications (just make sure you `cd ../` back up into the project's root directory before executing the following commands):

```
docker build -t my-ruby-app ./docker-app
docker build -t my-nginx ./docker-nginx
```

<div id="5"></div>
## Running

This section is also nice and short. First let's run the Ruby application:

```
docker run --name ruby-app -p 4567:4567 -d my-ruby-app
```

Now let's run the nginx container:

```
docker run --name nginx-container \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  -v $(pwd)/docker-nginx/certs/server.crt:/etc/nginx/certs/server.crt \
  -v $(pwd)/docker-nginx/certs/server.key:/etc/nginx/certs/server.key \
  -v $(pwd)/docker-nginx/certs/ca.crt:/etc/nginx/certs/ca.crt \
  -v $(pwd)/docker-nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  --link ruby-app:app \
  -P -d my-nginx
```

OK so the nginx `docker run` command was a little bit more involved, but really all it's doing is mounting volumes from the host machine (my Mac) into the Docker container. The most important items to be aware of are the certs we're mounting into the container as well as the `nginx.conf` file.

You'll also notice I'm linking the running Ruby container to the nginx container. This is important because it allows nginx to utilise the Ruby container as a back-end service.

<div id="6"></div>
## Verifying

Now the containers are built and running, we should verify that the services themselves are doing what they should be. But before we do that, it's worth me mentioning now that when I reference `<ip>` and `<nginx_port>` below, you'll need to swap these references for actual values. 

To get the value for `<ip>` I'm using the following:

```
$(docker-machine ip dev)
```

This gives me the ip address of my running docker VM. If you're running on Linux then localhost `127.0.0.1` would suffice. But as you can see, I'm running things on a Mac and so I'm using `docker-machine` with a VM named `dev`. Your mileage will ultimately vary.

To get the value of `<nginx_port>` I'm using the following to access the dynamically allocated port number:

```
$(docker port nginx-container 443 | awk -F ':' '{ print $2 }')
```

Where `nginx-container` is the name I gave to my container when executing the `docker run` command earlier.

So let's demonstrate some different application routes that should all **FAIL** (for reasons I'll explain as we go along):

```
curl http://<ip>:<nginx_port>/
```

So in the above example, we should see the following error, as the HTTP protocol was used instead of HTTPS (remember that nginx was setup to only listen on 443, not 80):

```
<html>
<head><title>400 The plain HTTP request was sent to HTTPS port</title></head>
<body bgcolor="white">
<center><h1>400 Bad Request</h1></center>
<center>The plain HTTP request was sent to HTTPS port</center>
<hr><center>nginx/1.4.6 (Ubuntu)</center>
</body>
</html>
```

Now let's try and switch to HTTPS:

```
curl https://<ip>:<nginx_port>/
```

The above attempt should also error, as the server's cert isn't trusted (i.e. it's self-signed). To fix this we can use the `--insecure` flag:

```
curl --insecure https://<ip>:<nginx_port>/
```

The above attempt should now fail because no client certificate was provided for purpose of authentication with nginx. Great. So now we're verified all the failing paths, let's consider `curl` commands that should return us some actual working content.

But before we do that, a slight intermission...

---

### Mac OS X Curl

In the below section I'll be demonstrating some `curl` calls that actually *work*. Now you might still find they don't work for you, but not for the reasons you'd expect. 

The problem depends on what operating system you're playing along with. For example, if you see the following error...

```
curl: (58) SSL: Can't load the certificate "/path/to/docker-nginx/certs/client.crt" and its private key: OSStatus -25299
```

...then fear not, it's just that the `curl` command provided by Mac OS X is a bit rubbish. The solution is to use Docker to run a different version of `curl` like so:

```
docker run -it speg03/curl <...>
```

We'll use this Docker container like so:

```
docker run \
  -it \
  -v $(pwd)/docker-nginx/certs/client.key:/var/cert/client.key \
  -v $(pwd)/docker-nginx/certs/client.crt:/var/cert/client.crt \
  speg03/curl --insecure \
              --key /var/cert/client.key \
              --cert /var/cert/client.crt \
              https://$(docker-machine ip dev):$(docker port nginx-container 443 | awk -F ':' '{ print $2 }')/app/cert
```

Yeah it's bit long-winded, but you can alias bits or stick it into a bash function if you prefer. Effectively we're mounting our generated certificates into the container and then specifying them as `--key` and `--cert` when trying to access a specific application endpoint.

For the following `curl` commands just remember to use the Dockerised version of `curl` if you're finding your native Mac OS X `curl` isn't working for you.

---

Now in the following section I define some local variables for the purpose of making the overall `curl` commands shorter. But all of these `curl` requests should work fine (as the client cert/key have been provided as flags):

```
client_key=$(pwd)/docker-nginx/certs/client.key
client_crt=$(pwd)/docker-nginx/certs/client.crt

curl --insecure --key $client_key --cert $client_crt https://<ip>:<nginx_port>/
curl --insecure --key $client_key --cert $client_crt https://<ip>:<nginx_port>/test.html
curl --insecure --key $client_key --cert $client_crt https://<ip>:<nginx_port>/app/
curl --insecure --key $client_key --cert $client_crt https://<ip>:<nginx_port>/app/foo
```

> Note: we use `--insecure` to trust the self-signed certificate, we could install the CA into our OS certificate store but I've not done that as this is just an example set-up and so I'm using `--insecure` as a quick win

Finally, let's test the client cert is being proxied through the HTTP request to the Ruby app:

```
curl --insecure --key $client_key --cert $client_crt https://<ip>:<nginx_port>/app/cert
```

You should see something like the following output by the Ruby application:

```
/CN=Mark McDonnell/emailAddress=mark@integralist.com
```

Now at this point you can parse your client certificate's CommonName (CN) however you like. In my application I just print it back out to the user, but in a real-world application you might want to use the details to present some nice personalised welcome message like "Hello Mark!" or whatever.

Either way, you can only access the Ruby application if you provide a cert/key that was signed by the self-signed CA that is specified in the nginx configuration.

If you were to try and provide a different cert/key (one that wasn't signed by the self-signed CA), then you'll see the following error response:

```
<html>
<head><title>400 The SSL certificate error</title></head>
<body bgcolor="white">
<center><h1>400 Bad Request</h1></center>
<center>The SSL certificate error</center>
<hr><center>nginx/1.4.6 (Ubuntu)</center>
</body>
</html>
```

Which is great. That is exactly what we want to see: denying access to our service unless properly authorised.

<div id="7"></div>
## Revocation

Now before we close, we should consider what happens when we want to prevent a user from accessing our content after we have issued them a certificate. In order to do this we need to provide a CRL (Certificate Revocation List) to nginx. The purpose of the CRL is to identify which certificates issued by the CA have since been revoked and should no longer allow access to the service.

The modification we need to make to nginx is simple:

```
ssl_certificate        /etc/nginx/certs/server.crt;
ssl_certificate_key    /etc/nginx/certs/server.key;
ssl_client_certificate /etc/nginx/certs/ca.crt;
ssl_verify_client      on;
ssl_crl                /etc/nginx/certs/crl.pem;
```

Notice where we defined all the other `ssl_` configuration, we have now added `ssl_crl` at the bottom and pointed it to a `crl.pem` file that contains the list of revoked certificates.

> Note: use `service nginx reload` to cause nginx to pick up any changes to the `crl.pem`

### CRL Management

At this point in time we have a working set-up. I'm now going to change things by no longer using the `docker-nginx/certs` folder we've been using so far. I'm going to start from scratch in that respect, in order to demonstrate how CRL (Certificate Revocation Lists) work and how to create a set-up that allows you to manage a CRL.

So let's begin by removing the `docker-nginx/certs` folder and creating a new directory within `docker-nginx` called `CertificateManagement`. Once you've created that folder `cd` into it (as all the following commands will need to be run from within that directory - unless I say otherwise).

### Openssl.cnf

We need to create an `openssl.cnf` file, which will allow us to automate a lot of the generic set-up that you would otherwise have to manually specify yourself via the command-line (`touch openssl.cnf` should do the trick). The contents of this file will be as follows:

```
#
# OpenSSL configuration file.
#

# Establish working directory.
dir            = .

[ ca ]
default_ca     = CA_default

[ CA_default ]
serial           = $dir/serial
database         = $dir/certindex.txt
new_certs_dir    = $dir/certs
certificate      = $dir/ca.crt
private_key      = $dir/private/ca.key
default_days     = 365
default_md       = md5
default_crl_days = 30
preserve         = no
email_in_dn      = yes
nameopt          = default_ca
certopt          = default_ca
policy           = policy_match
crl_dir          = $dir/revoked
crlnumber        = $crl_dir/crlnumber
crl_extensions   = crl_ext
x509_extensions  = usr_cert
copy_extensions  = copy

[ policy_match ]
countryName            = match    # Must be the same as the CA
stateOrProvinceName    = optional # not required
organizationName       = optional # not required
organizationalUnitName = optional # not required
commonName             = supplied # must be there, whatever it is
emailAddress           = supplied # must be there, whatever it is

[ crl_ext ]
authorityKeyIdentifier = keyid:always,issuer:always

[ usr_cert ]
basicConstraints       = CA:FALSE
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid, issuer
crlDistributionPoints  = URI:http://www.yourdomain.com/ca/crl.pem # this should be updated to be unique to the CA

[ req ]
default_bits       = 2048    # Size of keys
default_keyfile    = key.pem # name of generated keys
default_md         = md5     # message digest algorithm
string_mask        = nombstr # permitted characters
distinguished_name = req_distinguished_name
req_extensions     = v3_req

[ req_distinguished_name ]
# Variable name				Prompt string
#-------------------------	  ----------------------------------
0.organizationName     = Organization Name (company)
organizationalUnitName = Organizational Unit Name (department, division)
emailAddress           = Email Address
emailAddress_max       = 40
localityName           = Locality Name (city, district)
stateOrProvinceName    = State or Province Name (full name)
countryName            = Country Name (2 letter code)
countryName_min        = 2
countryName_max        = 2
commonName             = Common Name (hostname, IP, or your name)
commonName_max         = 64

# Default values for the above, for consistency and less typing.
# Variable name				Value
#------------------------	  ------------------------------
0.organizationName_default  = My Company
localityName_default        = My Town
stateOrProvinceName_default = State or Providence
countryName_default         = US

[ v3_ca ]
basicConstraints            = CA:TRUE
subjectKeyIdentifier        = hash
authorityKeyIdentifier      = keyid:always,issuer:always

[ v3_req ]
basicConstraints            = CA:FALSE
subjectKeyIdentifier        = hash
```

> Note: for an excellent walk-through of the `openssl.conf` and what it all means, then I highly recommend reading [phildev.net/ssl/opensslconf](https://www.phildev.net/ssl/opensslconf.html)

From here we now want to create some other directories referenced by `openssl.cnf`:

```
mkdir certs private revoked
```

We need to create a few files which are also referenced by `openssl.cnf`:

```
echo '100001' > serial
touch certindex.txt
```

Now we should find we have the following tree structure (inside of `docker-nginx/CertificateManagement`):

```
.
├── certindex.txt
├── certs
├── openssl.cnf
├── private
├── revoked
└── serial
```

### Generating a new CA

We'll be recreating a CA certificate that's valid for a year (along with its private key). The `ca.crt` file that will be generated is what can be provided to users for importing into their web browsers so that the CA becomes a trusted entity.

Let's now create the CA:

```
openssl req -new -x509 -days 365 -out ca.crt -keyout private/ca.key
```

Most of the details I was asked for I left blank, with the exception of:

- `PEM pass phrase` which I set to `pass`
- `Country Name` which I set to `GB`
- `Organization Name` which I set to `Integralist Ltd`
- `Common Name` which I set to `Integralist`
- `Email Address` which I set to `ca@integralist.com`
  
At this point our directory tree should look like the following:

```
.
├── ca.crt          # newly created
├── certindex.txt
├── certs
├── openssl.cnf
├── private
│   └── ca.key      # newly created
├── revoked
└── serial
```

### Server CSR

We'll now recreate our server CSR (Certificate Signing Request) and private key:

```
openssl req -new -nodes -out server.csr -keyout private/server.key -config ./openssl.cnf
```

Most of the details I was asked for I left blank, with the exception of:

- `Email Address` which I set to `server@integralist.com`
- `Country Name` which I set to `GB`
- `Common Name` which I set to `TheServer`

At this point our directory tree should look like the following:

```
.
├── ca.crt
├── certindex.txt
├── certs
├── openssl.cnf
├── private
│   ├── ca.key
│   └── server.key # newly created
├── revoked
├── serial
└── server.csr     # newly created
```

### Server Cert

We'll now sign our server's CSR like so:

```
openssl ca -out server.crt -config ./openssl.cnf -infiles server.csr
```

You'll be prompted to enter the pass phrase for the CA and then it'll display information about the new server certificate and if you're happy for it to be generated:

```
Using configuration from ./openssl.cnf
Enter pass phrase for ./private/ca.key:
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
emailAddress          :IA5STRING:'server@integralist.com'
countryName           :PRINTABLE:'GB'
commonName            :PRINTABLE:'TheServer'
Certificate is to be certified until Oct  2 14:14:23 2016 GMT (365 days)

Sign the certificate? [y/n]: y
```

After this it'll ask if you want to commit the changes:

```
1 out of 1 certificate requests certified, commit? [y/n] y
Write out database with 1 new entries
Data Base Updated
```

If you look at the `serial` file you'll notice its value is now `100002` (we created it with the initial value of `100001`) and that there is now a `serial.old` which contains the previous value.

If you look at the `certindex.txt` you'll see a new record has been added (it wont be identical, but it'll look something like the following):

```
V 161002141423Z   100001  unknown /C=GB/CN=TheServer/emailAddress=server@integralist.com
```

Notice the number `100001`. This is the serial number (and name) of the certificate that's been generated for the server and is used for the purpose of revoking the certificate at a later date (e.g. if the private key becomes compromised).

At this point our directory tree should look like the following:

```
.
├── ca.crt
├── certindex.txt      # updated
├── certindex.txt.attr # newly created
├── certindex.txt.old  # newly created
├── certs
│   └── 100001.pem     # newly created
├── openssl.cnf
├── private
│   ├── ca.key
│   └── server.key
├── revoked
├── serial             # updated
├── serial.old         # newly created
├── server.crt         # newly created
└── server.csr
```

### Client Cert

Same as before with the server, we'll want to recreate the client CSR and private key:

```
openssl req -new -nodes -out client.csr -keyout private/client.key -days 365 -config ./openssl.cnf
```

Most of the details I was asked for I left blank, with the exception of:

- `Email Address` which I set to `client@integralist.com`
- `Country Name` which I set to `GB`
- `Common Name` which I set to `TheClient`

At this point our directory tree should look like the following:

```
.
├── ca.crt
├── certindex.txt
├── certindex.txt.attr
├── certindex.txt.old
├── certs
│   └── 100001.pem
├── client.csr         # newly created
├── instructions.md
├── openssl.cnf
├── private
│   ├── ca.key
│   ├── client.key     # newly created
│   └── server.key
├── revoked
├── serial
├── serial.old
├── server.crt
└── server.csr
```

Typically you'll get a request from a company employee or customer that needs access to your service(s) and so that's when you'll issue them a client certificate.

From here we can self-sign the certificate (just like we did with the server CSR):

```
openssl ca -out client.crt -days 365 -config ./openssl.cnf -infiles client.csr
```

The exact same process is required as before when signing the server certificate, so all the same files are updated (e.g. `serial` and `certindex.txt`) and similar new files are created:

```
.
├── ca.crt
├── certindex.txt
├── certindex.txt.attr
├── certindex.txt.attr.old
├── certindex.txt.old
├── certs
│   ├── 100001.pem
│   └── 100002.pem         # newly created
├── client.crt             # newly created
├── client.csr
├── instructions.md
├── openssl.cnf
├── private
│   ├── ca.key
│   ├── client.key
│   └── server.key
├── revoked
├── serial
├── serial.old
├── server.crt
└── server.csr
```

## CRL (Certificate Revocation List)

At this point we need to look at how to generate a revocation list, as that list will be provided to nginx so it can cross-reference the incoming certificate against it. 

The first thing we need to do is to add an initial number to a `crlnumber` file into our `revoked` directory we created at the beginning of this section on CRL management:

```
echo 01 > ./revoked/crlnumber
```

This file is used by the CRL in a way similar to how the CA uses the `serial` file. By that I mean, every time you revoke a certificate you'll need to generate a new CRL (using the below command). Every new CRL you create will include the current `crlnumber` (which we'll see in a moment, after we create a CRL and then inspect it).

Once we have the `crlnumber` file created (and an initial value added) we can then run the following command to generate our first CRL:

```
openssl ca -gencrl -out revoked/crl.pem -config ./openssl.cnf
```

If you want to inspect the CRL file to see what's inside, then run the following command:

```
openssl crl -text -noout -in revoked/crl.pem
```

> Note: the `-noout` simply prevents the x509 CRL hash from being printed as well (which is what you would have seen if you had just run `cat revoked/crl.pem`)

The command will output something that looks like:

```
Certificate Revocation List (CRL):
        Version 2 (0x1)
        Signature Algorithm: md5WithRSAEncryption
        Issuer: /C=GB/O=IntegralistLtd/CN=Integralist/emailAddress=ca@integralist.com
        Last Update: Oct  3 14:45:53 2015 GMT
        Next Update: Nov  2 14:45:53 2015 GMT
        CRL extensions:
            X509v3 Authority Key Identifier: 
                keyid:43:3A:75:41:E1:AE:46:F0:5F:AC:F4:24:6A:3A:DB:D1:31:7E:27:6B
                DirName:/C=GB/O=IntegralistLtd/CN=Integralist/emailAddress=ca@integralist.com
                serial:E0:86:88:E8:CA:0C:7F:29

            X509v3 CRL Number: 
                1
No Revoked Certificates.
    Signature Algorithm: md5WithRSAEncryption
        28:1d:b0:f3:fb:69:f0:1a:36:83:2d:38:50:72:c6:11:39:4f:
        6d:e9:da:0a:ec:63:a9:b1:63:55:ff:79:48:4f:9e:6a:ec:c3:
        2e:01:88:ea:aa:8d:76:12:ac:f9:0b:77:d3:aa:dd:c4:22:bd:
        fe:77:5d:a2:2b:3b:e9:22:b5:32:2e:26:74:1c:6c:94:78:84:
        08:54:44:52:87:f2:51:68:98:e7:7c:42:cd:44:f6:6b:4c:28:
        b0:d5:11:4a:49:4d:4f:83:09:f3:6b:2d:69:a3:95:d5:55:e0:
        dc:4c:fd:53:5c:78:5e:a6:48:ac:7d:66:c8:20:6b:ba:c7:19:
        37:ba
```

> Note: you can tell how many versions of the CRL have been generated by looking at the value assigned to `X509v3 CRL Number`

The CRL itself has been configured (by the `openssl.conf`) to expire after 30 days. So even if you don't revoke any certificates in that time, you'll still want to regenerate the CRL. Meaning there needs to be a certain level of automation involved (which is outside the scope of this article).

### Re-running our containers

OK, we've now regenerated our CA, server and client certificates and we've also looked at creating a CRL; so we'll want to stop the currently running nginx container (using a combination of `docker ps` to find the container id, along with `docker stop <cid>` and `docker rm <cid>`). 

Let's first jump back up to our project root directory (`cd ../../`) and restart the nginx container, but this time using the new certificates (this will also mean our updated `nginx.conf` file will be pulled in).

So the new `docker run` command we'll be using is a bit of a monster! Lots of mounted volumes...

```
docker run \
  --name nginx-container \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  -v $(pwd)/docker-nginx/CertificateManagement/server.crt:/etc/nginx/certs/server.crt \
  -v $(pwd)/docker-nginx/CertificateManagement/private/server.key:/etc/nginx/certs/server.key \
  -v $(pwd)/docker-nginx/CertificateManagement/ca.crt:/etc/nginx/certs/ca.crt \
  -v $(pwd)/docker-nginx/CertificateManagement/revoked/crl.pem:/etc/nginx/certs/crl.pem \
  -v $(pwd)/docker-nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  --link ruby-app:app -P -d my-nginx
```

We can now verify that nginx is working as expected; and by that I mean: our client (when using the provided client certificate) can access the Ruby service:

```
docker run \
  -it \
  -v $(pwd)/docker-nginx/CertificateManagement/private/client.key:/var/cert/client.key \
  -v $(pwd)/docker-nginx/CertificateManagement/client.crt:/var/cert/client.crt \
  speg03/curl --insecure \
              --key /var/cert/client.key \
              --cert /var/cert/client.crt \
              https://$(docker-machine ip dev):$(docker port nginx-container 443 | awk -F ':' '{ print $2 }')/app/cert
```

This gives us the output as expected:

```
/C=GB/CN=TheClient/emailAddress=client@integralist.com
```

### Revoking Certificates

Here we are at our final stage. We've verified that the client certificates are working using the new format. We've created a CRL and so far the client cert has been allowed through nginx.

What we'll do now is revoke that certificate and then re-run our nginx container to see if it has picked up the new CRL and subsequently recognises that the client cert is no longer valid (and so refuse access to the Ruby service).

In order to revoke the client certificate, I first need to look it up in the `certindex.txt` file. The contents of that file resembles something like:

```
V 161002113732Z 100001 unknown /C=GB/CN=TheServer/emailAddress=server@integralist.com
V 161002113931Z 100002 unknown /C=GB/CN=TheClient/emailAddress=client@integralist.com
```

I can now easily say to myself "ok, so I know its the 'client' who needs their cert revoked; that looks to be cert 100002", and from there I would execute the following command (make sure you `cd` into the `docker-nginx/CertificateManagement/` directory before running the next command):

```
openssl ca -revoke certs/100002.pem -config ./openssl.cnf
```

This will output the following response:

```
Using configuration from ./openssl.cnf
Enter pass phrase for ./private/ca.key:
Revoking Certificate 100002.
Data Base Updated
```

Now if we look at the `certindex.txt` file again we'll see that `100002` has been revoked:

```
V 161002113732Z               100001 unknown /C=GB/CN=TheServer/emailAddress=server@integralist.com
R 161002113931Z 151003114104Z 100002 unknown /C=GB/CN=TheClient/emailAddress=client@integralist.com
```

You'll notice the `R` for "revoked" has been applied. The additional reference number `151003114104Z` is the revocation timestamp and you can see the full format [here](http://pki-tutorial.readthedocs.io/en/latest/cadb.html).

> Note: as you can see, to revoke a certificate means you need to keep copies of all certificates that have been generated

So now the client cert has been revoked, let's generate a new CRL and then apply that to the nginx container. 

```
ca -gencrl -out revoked/crl.pem -config ./openssl.cnf
```

Now verify the version number inside the `crl.pem`:

```
openssl crl -text -noout -in revoked/crl.pem
```

You should now see `X509v3 CRL Number` has a value of `2`.

Let's now stop the running nginx container, and re-run it so it can pick up the new CRL (use same commands as before, but remember to move up to the project root - `cd ../../` - before you do so).

Now when you try to access the `/app/cert` endpoint you'll find that you cannot:

```
<html>
<head><title>400 The SSL certificate error</title></head>
<body bgcolor="white">
<center><h1>400 Bad Request</h1></center>
<center>The SSL certificate error</center>
<hr><center>nginx/1.4.6 (Ubuntu)</center>
</body>
</html>
```

Job done.

<div id="8"></div>
## References

- [nginx http ssl module](http://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [mad-hacking.net/ssl-tls](http://www.mad-hacking.net/documentation/linux/security/ssl-tls/creating-ca.xml)
- [Openssl.conf Walkthru](https://www.phildev.net/ssl/opensslconf.html)

<div id="9"></div>
## Conclusion

There are many side effects and issues we've not covered, such as: how to handle multiple CRLs (generated from different CA's). This is a problem where by nginx's `ssl_crl` setting only allows you to point to a single CRL "file" (rather than a directory of CRLs). To work around this issue you would need to concatenate all your CRLs together into a single file (which is a bit of a pain).

There is also the question of automation. This is a process that is fraught with user error and mistakes and so ideally you'd want to automate as much of the CRL and certificate generating process as possible. I'll leave this as an exercise for the reader.

In closing: hopefully you've found the information in this article useful and it has helped you to understand some of the more complicated processes for handling certificate authentication.


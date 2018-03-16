---
title: "Hitchikers Guide to Go"
date: 2016-12-02T13:00:00+01:00
categories:
  - "code"
  - "guides"
tags:
  - "go"
draft: false
---

- [Introduction](#1)
- [Private Repo Access](#2)
- [Build and Compilation](#3)
- [Dependency Information](#4)
- [Dependency Management](#5)
- [Documentation](#6)
- [Testing](#7)
- [Logging](#8)
- [Godo](#9)
- [Import Race Conditions](#10)
- [New vs Make](#11)
- [Custom Types](#12)
- [Function Types](#13)
- [Enumerator IOTA](#14)
- [Struct: Var vs Type](#15)
- [Embedded Structs](#16)
- [Reference vs Value](#17)
- [See all methods on `<Type>`](#18)
- [Convert Struct into JSON](#19)
- [Pretty Printing JSON String](#20)
- [Convert Struct into YAML](#21)
- [Sorting Structs](#22)
- [Read Users Input](#23)
- [HTTP Middleware](#24)
- [Sessions](#25)
- [HTTPS TLS Request](#26)
- [HTTP GET Web Page](#27)
- [Custom HTTP Request Methods](#28)
- [Pointers](#29)
- [Type Assertion](#30)
- [Line Counting](#31)
- [Reading File in Chunks](#32)
- [Time](#33)
- [Starting and Stopping things with Channels](#34)
- [Channel Pipelines](#35)
- [Templating](#36)
- [Error handling](#37)
- [Socket Programming](#38)
- [Comparing Maps](#39)
- [Zip File Contents](#40)
- [Shell Commands](#41)
- [New Instance Idiom](#42)
- [JSON Connection Draining](#43)
- [Writing your own Marshal/Unmarshal functions](#44)

<div id="1"></div>
## Introduction

A few years ago when I was learning the [Go programming language](https://golang.org/) I created a gist and updated it on a regular basis as a sort of cheat sheet. I stumbled across this gist recently and decided I'd try and port it over to some form of semi-coherent blog post.

> Note: the code will not be updated in any way so [YMMV](http://dictionary.cambridge.org/dictionary/english/ymmv)

What this isn't, is a walk-through of how to write Go code. I'd suggest trying the official [Go Tour](https://tour.golang.org/welcome/1) which is really good and covers a lot of ground. Instead I'm going to provide lots of example code in the vein of a resource like [Go by Example](https://gobyexample.com/).

What this _is_, is a barren wasteland of old code. Passers by are forewarned to tread carefully.

> Note: there's also not much in the way of code explanation, to the extent that some of the testing examples are long and very context specific - you've been warned

Most of this Go code is old, so you may find some packages or information possibly out of date (as in not the latest awesome thing) or maybe not that great quality either.

Take this as what it is, a sharing exercise. Take what you need and leave the rest. I wont be offended.

<div id="2"></div>
## Private Repo Access

`go get` uses HTTPS so to be able to pull dependencies from a private repository, you'll need to force it to use SSH so it can access your keys and authorise the connection:

```
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

You can also restrict this to a single specific organisation if you prefer:

```
git config --global url."git@github.com:foo/".insteadOf "https://github.com/foo/"`
```

So when you want a private dependency like: `git@github.com:foo/private.git`:

```
go get github.com/foo/private
```

<div id="3"></div>
## Build and Compilation

As of Go 1.5 you can use:

```
GOOS=darwin GOARCH=386 go build foo.go
```

Here's a quick reference of the values you can specify:

```
$GOOS     $GOARCH
darwin    386      -- 32 bit MacOSX
darwin    amd64    -- 64 bit MacOSX
freebsd   386
freebsd   amd64
linux     386      -- 32 bit Linux
linux     amd64    -- 64 bit Linux
linux     arm      -- RISC Linux
netbsd    386
netbsd    amd64
openbsd   386
openbsd   amd64
plan9     386
windows   386      -- 32 bit Windows
windows   amd64    -- 64 bit Windows
```

You can get a full list with:

```
go tool dist list
```

### Gox

Gox is an alternative build tool.

One time only commands for purpose of download/setup:

- `go get github.com/mitchellh/gox`
- `gox -build-toolchain` (only necessary for Go `1.4.x` and lower)

Compilation example:

```
gox -osarch="linux/amd64" -osarch="darwin/amd64" -osarch="windows/amd64" -output="foobar.{{.OS}}"
```

This will generate three files:

1. `foobar.darwin`
2. `foobar.linux`
3. `foobar.windows.exe`

### Other information

Use the `-a` flag when running `go build`.

In short, if you dont' use `go build -a -v .` then Go won't know if any packages are missing (you can find the gory details [here](https://medium.com/@felixge/why-you-should-use-go-build-a-or-gb-c469157d5c1b#.jf5orcwrj))

<div id="4"></div>
## Dependency Information

To see a list of dependencies for a given Go package you can utilise the `go list` command:

```
go list -json strconv 
```

Which returns:

```
{
  "Dir": "/usr/local/Cellar/go/1.5.2/libexec/src/strconv",
  "ImportPath": "strconv",
  "Name": "strconv",
  "Doc": "Package strconv implements conversions to and from string representations of basic data types.",
  "Target": "/usr/local/Cellar/go/1.5.2/libexec/pkg/darwin_amd64/strconv.a",
  "Goroot": true,
  "Standard": true,
  "Root": "/usr/local/Cellar/go/1.5.2/libexec",
  "GoFiles": [
    "atob.go",
    "atof.go",
    "atoi.go",
    "decimal.go",
    "doc.go",
    "extfloat.go",
    "ftoa.go",
    "isprint.go",
    "itoa.go",
    "quote.go"
  ],
  "IgnoredGoFiles": [
    "makeisprint.go"
  ],
  "Imports": [
    "errors",
    "math",
    "unicode/utf8"
  ],
  "Deps": [
    "errors",
    "math",
    "runtime",
    "unicode/utf8",
    "unsafe"
  ],
  "TestGoFiles": [
    "internal_test.go"
  ],
  "XTestGoFiles": [
    "atob_test.go",
    "atof_test.go",
    "atoi_test.go",
    "decimal_test.go",
    "example_test.go",
    "fp_test.go",
    "ftoa_test.go",
    "itoa_test.go",
    "quote_test.go",
    "strconv_test.go"
  ],
  "XTestImports": [
    "bufio",
    "bytes",
    "errors",
    "fmt",
    "log",
    "math",
    "math/rand",
    "os",
    "reflect",
    "runtime",
    "strconv",
    "strings",
    "testing",
    "time",
    "unicode"
  ]
}
```

If you don't specify the `-json` flag then the default behaviour is to filter out the `ImportPath` field from the above JSON output. For example:

```
go list strconv
```

Will return just the import path `strconv`.

> Documentation: `go help list | less`

You can also utilise Go's templating functionality on the returned JSON object by adding the `-f` flag:

```
go list -f '{{join .Deps " "}}' strconv
```

Which filters out the `Deps` field, joins up all items it contains using whitespace and subsequently returns:

```
errors math runtime unicode/utf8 unsafe
```

You can do more complex things such as:

```
go list -f '{{.ImportPath}} -> {{join .Imports " "}}' compress/...
```

Which will return something like:

```
compress/bzip2 -> bufio io sort
compress/flate -> bufio fmt io math sort strconv
compress/gzip -> bufio compress/flate errors fmt hash hash/crc32 io time
compress/lzw -> bufio errors fmt io
compress/zlib -> bufio compress/flate errors fmt hash hash/adler32 io
```

<div id="5"></div>
## Dependency Management

> Update (August 2017): there is an official tool now called [dep](https://github.com/golang/dep).

There are many dependency management tools, these are the few that I've tried (in this order): godeps, gb, glide. Let's review each of them to see how they work:

### Godeps

When running `go get <dependency>` locally, Go will stick the dependency in the folder defined by your `$GOPATH` variable. So when you build your code into a binary using `go build <script>` it'll bake the dependencies into the binary (i.e. the binary is statically linked).

But if someone pulls down your repo and tries to do a build from your code, then they'll need to have a network connection to pull down the dependencies as their `$GOPATH` might not have those dependencies yet (unless the user manually executes `go get` for each dependency required). Also the dependencies they subsequently pull down could be a more recent (and untested version) of each dependency.

So to make this situation better we can use [Godep](https://github.com/tools/godep) to stick all your dependencies within a `Godeps` folder inside your project directory. You can then use `godep save -r ./...` to automatically update all your references to point to that local folder. 

> Note: you might need to remove the `Godeps` folder and run `go get` if you get strange conflicts. The `./...` means to target all `.go` files

This way users who clone your repo don't need an internet connection to pull the dependencies, as they already have them. But also they'll have the correct versions of the dependencies. This acts like a `Gemfile.lock` as you would typically find in the Ruby world.

### Gb

```
go get -u github.com/constabulary/gb/...
gb vendor fetch <pkg>
gb build all
```

You'll need the following structure:

```
├── src
│   ├── foo
│   │   └── main.go
└── vendor
    ├── manifest
    └── src
```

The `vendor` directory is auto-generated by the `gb vendor fetch <pkg>` command.

### Glide

This is now my preferred dependency management tool, as it works just like existing tools in other languages (e.g. Ruby's Bundler or Node's NPM) and so consistency is a plus.

It also provides the ability (like gb) to not commit dependencies but have specific versions vendored when running a simple command.

```
go get github.com/Masterminds/glide
export GO15VENDOREXPERIMENT=1       # or use 1.6
glide init                          # generates glide.yaml
glide install                       # installs from lock file (creates it if not found)
glide update                        # updates dependencies and updates lock file
glide list                          # shows vendored deps
go test $(glide novendor)           # test only your package (not vendored packages)
```

> Note: to add a new dependency `glide get <pkg_name>`

<div id="6"></div>
## Documentation

`Godoc` is the original implementation for viewing documentation. Previous to `Godoc` there was `go doc`, but that was removed and then added *back* with totally different functionality.

The syntax structure for `go doc` is as follows:

```
go doc <pkg>
go doc <sym>[.<method>]
go doc [<pkg>].<sym>[.<method>]
```

Here are some examples of using `go doc`:

```
go doc json # same as go doc encoding/json
go doc json.Number
go doc json.Number.Float64
```

Here is the same thing but using `godoc` (where the syntax structure is `godoc <pkg> <symbol>`):

```
godoc encoding/json # unlike "go doc json", "godoc json" doesn't work as it's not a fully qualified path
godoc encoding/json Number
godoc -src builtin make | less
```

> Unlike with `go doc`, `godoc` doesn't allow filtering by `<method>`  
> It only goes as far as `<pkg> <symbol>`  
> 
> You can use `<pkg> <symbol> <method>`  
> and the method will be included in the results  
> but you'll need to search for the method manually  
> `godoc -src net/http Request ParseForm | less`  
> here is a similar result using `go doc`    
> `go doc http.Request.ParseForm | less`

The purpose of `go doc` was to provide a simplistic cli documentation viewer, where as `Godoc` has many more features available.

The `go doc` command also works not only with Go's own library's but your own custom packages as well.

There are some differences in what is returned though between `godoc` and `go doc` (mainly the latter is more succinct/compact so you can find the functions/types you're after and then you can expand into those once you've found them; `godoc` is harder to sift through on the command line)...

### `godoc encoding/json Encoder`

```
type Encoder struct {
    // contains filtered or unexported fields
}
    An Encoder writes JSON objects to an output stream.

func NewEncoder(w io.Writer) *Encoder
    NewEncoder returns a new encoder that writes to w.

func (enc *Encoder) Encode(v interface{}) error
    Encode writes the JSON encoding of v to the stream, followed by a
    newline character.

    See the documentation for Marshal for details about the conversion of Go
    values to JSON.
```

### `go doc encoding/json Encoder`

```
type Encoder struct {
        // Has unexported fields.
}

    An Encoder writes JSON objects to an output stream.

func NewEncoder(w io.Writer) *Encoder
func (enc *Encoder) Encode(v interface{}) error
```

> Notice the functions don't have their documentation notes printed with `go doc`

One other thing `godoc` has over `go doc` is the ability to view the source code using the `-src` flag:

```
godoc -src builtin make | less
```

The `godoc` tool also has a full browser documentation suite available and allows you to generate HTML documentation for your project...

### Full Browser Documentation

Start a local documentation server and allow indexing (which takes a few minutes; you have to just keep trying the search until it's done)

```
godoc -http ':6060' -index
```

You can then open a new terminal pane and search via cli if you prefer (rather than open up a browser to http://localhost:6060/)

```
godoc -q tls | less
```

You can also have the playground available if you need it in the browser, but it does require an internet connection to compile:

```
godoc -http ':6060' -play
```

<div id="7"></div>
## Testing

> Note: see also [examples here](https://gist.github.com/Integralist/cf76668bc46d75058ab5f566d96ce74a)

Test files are placed in the same directory as the file/package being tested. The convention is to use the same file name but suffix it with `_test`. So `foo.go` would have another file next to it called `foo_test.go`.

Run the tests: `go test -v ./...`

You can also run a specific test like so: `go test -v command/foo_test.go`

> Note: remember that your test file should have the same package name as your code being tested. This means the test file will have access to all the public functions and variables of that package (and so subsequently it'll have access to the code being tested)

Here is a simple test example:

```
package foo

import "testing"

func TestBasics(t *testing.T) {
  expect := "abc"
  actual := "def"

  if actual != expect {
    t.Errorf("expected %s, actual %s", expect, actual)
  }
}
```

The output from running this test will be:

```
=== RUN   TestBasics
--- FAIL: TestBasics (0.00s)
        foo_test.go:10: expected abc, actual def
FAIL
exit status 1
FAIL    command-line-arguments  0.004s
```

The following example program demonstrates how to mock an io function so that we're not reliant on reading from disk in our test suite.

Here's the program:

```
package main

import (
  "fmt"
  "io/ioutil"
)

type fooIO func(string) ([]byte, error)

func getContents(fio fooIO, path string) (string, error) {
  f, err := fio(path)
  if err != nil {
    return "", err
  }
  return string(f), nil
}

func main() {
  contents, err := getContents(ioutil.ReadFile, "example.txt")
  if err != nil {
    fmt.Println(err)
  }
  fmt.Println(contents)
}
```

Here's the test:

```
package main

import "testing"

var expectation = "pretend to read from disk"

func fakeReadFileSuccess(path string) ([]byte, error) {
  return []byte(expectation), nil
}

func TestIO(t *testing.T) {
  contents, _ := getContents(fakeReadFileSuccess, "dont-exist.txt")

  if contents != expectation {
    t.Errorf("Expected '%s' but got '%s'", expectation, contents)
  }
}
```

You could also probably use an interface there, but we've gone with a `func` type.

Here's another program that does something similar where we mock a function that expects a particular interface:

```
package main

import "fmt"

type FooIO interface {
  Read() string
}

type Foo struct{}

func (f *Foo) Read() string {
  return "We READ something from disk"
}

func Stuff(f FooIO) string {
  return f.Read()
}

func main() {
  foo := &Foo{}
  contents := Stuff(foo)
  fmt.Println(contents)
}
```

Here's our test:

```
package main

import (
  "testing"

  "github.com/stretchr/testify/assert"
)

type FakeFoo struct{}

func (s *FakeFoo) Read() string {
  return "We 'pretend' to READ something from disk"
}

func TestSomething(t *testing.T) {
  assert := assert.New(t)

  foo := &FakeFoo{}
  contents := Stuff(foo)

  assert.Equal(contents, "We 'pretend' to READ something from disk")
}
```

### More Test Examples

Faking HTTP and WebServers can be a bit tricky:

```
package requester

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io/ioutil"
  "net/http"
  "net/http/httptest"
  "os"
  "strconv"
  "testing"
  "time"

  "github.com/bbc/mozart-requester/src/aggregator"
  "github.com/julienschmidt/httprouter"
)

func TestSuccessResponse(t *testing.T) {
  upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintln(w, `{"head":[ "foo" ],"bodyInline":"bar","bodyLast":[ "baz" ]}`)
  }))
  defer upstream.Close()

  router := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    Process(w, r, httprouter.Params{})
  }))
  defer router.Close()

  var config = []byte(fmt.Sprintf(`{
    "components":[
      {"id":"foo","endpoint":"%s","must_succeed":true},
      {"id":"bar","endpoint":"%s","must_succeed":true}
    ]
  }`, upstream.URL, upstream.URL))

  req, err := http.NewRequest("POST", router.URL, bytes.NewBuffer(config))

  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil {
    panic(err)
  }

  defer resp.Body.Close()
  body, _ := ioutil.ReadAll(resp.Body)

  var result aggregator.Result
  json.Unmarshal(body, &result)

  expectedStatus := "success"
  if result.Summary != expectedStatus {
    t.Errorf("The response:\n '%s'\ndidn't match the expectation:\n '%s'", result.Summary, expectedStatus)
  }

  expectedLength := 2
  if len(result.Components) != expectedLength {
    t.Errorf("The response:\n '%d'\ndidn't match the expectation:\n '%d'", len(result.Components), expectedLength)
  }
}

func TestFailureResponse(t *testing.T) {
  healthyUpstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintln(w, `{"head":[ "foo" ],"bodyInline":"bar","bodyLast":[ "baz" ]}`)
  }))
  defer healthyUpstream.Close()

  failingUpstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintln(w, "404 page not found")
  }))
  defer failingUpstream.Close()

  router := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    Process(w, r, httprouter.Params{})
  }))
  defer router.Close()

  var config = []byte(fmt.Sprintf(`{
    "components":[
      {"id":"foo","endpoint":"%s","must_succeed":true},
      {"id":"bar","endpoint":"%s","must_succeed":true}
    ]
  }`, healthyUpstream.URL, failingUpstream.URL))

  req, err := http.NewRequest("POST", router.URL, bytes.NewBuffer(config))

  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil {
    panic(err)
  }

  defer resp.Body.Close()
  body, _ := ioutil.ReadAll(resp.Body)

  var result aggregator.Result
  json.Unmarshal(body, &result)

  expectedSummary := "failure"
  if result.Summary != expectedSummary {
    t.Errorf("The response:\n '%s'\ndidn't match the expectation:\n '%s'", result.Summary, expectedSummary)
  }

  expectedLength := 2
  if len(result.Components) != expectedLength {
    t.Errorf("The response length:\n '%d'\ndidn't match the expectation:\n '%d'", len(result.Components), expectedLength)
  }

  expectedStatus := []int{}
  for _, value := range result.Components {
    if value.Status == 404 {
      expectedStatus = append(expectedStatus, value.Status)
    }
  }
  if len(expectedStatus) < 1 || len(expectedStatus) > 1 {
    t.Errorf("The response length:\n '%d'\ndidn't match the expectation:\n '%d'", len(expectedStatus), 1)
  }
}

func TestSlowResponse(t *testing.T) {
  healthyUpstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintln(w, `{"head":[ "foo" ],"bodyInline":"bar","bodyLast":[ "baz" ]}`)
  }))
  defer healthyUpstream.Close()

  slowUpstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    timeout, err := strconv.Atoi(os.Getenv("COMPONENT_TIMEOUT"))
    if err != nil {
      t.Errorf("COMPONENT_TIMEOUT: %s", err.Error())
    }
    time.Sleep(time.Duration(timeout) * time.Millisecond)
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintln(w, `{"head":[ "foo" ],"bodyInline":"bar","bodyLast":[ "baz" ]}`)
  }))
  defer slowUpstream.Close()

  router := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    Process(w, r, httprouter.Params{})
  }))
  defer router.Close()

  var config = []byte(fmt.Sprintf(`{
    "components":[
      {"id":"foo","endpoint":"%s","must_succeed":true},
      {"id":"bar","endpoint":"%s","must_succeed":true}
    ]
  }`, healthyUpstream.URL, slowUpstream.URL))

  req, err := http.NewRequest("POST", router.URL, bytes.NewBuffer(config))

  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil {
    panic(err)
  }

  defer resp.Body.Close()
  body, _ := ioutil.ReadAll(resp.Body)

  var result aggregator.Result
  json.Unmarshal(body, &result)

  expectedStatus := 408
  for _, value := range result.Components {
    if value.ID == "bar" && value.Status != expectedStatus {
      t.Errorf("The response:\n '%d'\ndidn't match the expectation:\n '%d'", value.Status, expectedStatus)
    }
  }

  expectedSummary := "failure"
  if result.Summary != expectedSummary {
    t.Errorf("The response:\n '%s'\ndidn't match the expectation:\n '%s'", result.Summary, expectedSummary)
  }
}
```

I typically run my tests using Make, but it ultimately looks like this: 

```
pushd src && APP_ENV=test COMPONENT_TIMEOUT=100 go test -v $(glide novendor) && popd
```

Here's another example of a test needing to fake things:

```
package retriever

import (
  "bytes"
  "io/ioutil"
  "net/http"
  "strings"
  "testing"

  "github.com/PuerkitoBio/goquery"
)

const href = "http://bar.com/"
const url = "http://foo.com/"

var body string

func fakeNewDocument(url string) (*goquery.Document, error) {
  body = strings.Replace(body, "{}", href, 1)

  resp := &http.Response{
    Status:        "200 OK",
    StatusCode:    200,
    Proto:         "HTTP/1.0",
    ProtoMajor:    1,
    ProtoMinor:    0,
    Body:          ioutil.NopCloser(bytes.NewBufferString(body)),
    ContentLength: int64(len(body)),
    Request:       &http.Request{},
  }

  return goquery.NewDocumentFromResponse(resp)
}

func TestRetrieveReturnValue(t *testing.T) {
  // {} interpolated with constant's value
  body = `
    <html>
      <body>
        <div class="productInfo">
          <a href="{}">Bar</a>
        </div>
      </body>
    <html>
  `
  coll, _ := Retrieve(url, fakeNewDocument)

  if response := coll[0]; response != href {
    t.Errorf("The response:\n '%s'\ndidn't match the expectation:\n '%s'", response, href)
  }
}

func TestRetrieveMissingAttributeReturnsEmptySlice(t *testing.T) {
  // href attribute is missing from anchor element
  body = `
    <html>
      <body>
        <div class="productInfo">
          <a>Bar</a>
        </div>
      </body>
    <html>
  `
  coll, _ := Retrieve(url, fakeNewDocument)

  if response := coll; len(response) > 0 {
    t.Errorf("The response:\n '%s'\ndidn't match the expectation:\n '%s'", response, "[http://bar.com/]")
  }
}
```

And...

```
package scraper

import "testing"

func TestScrapeResults(t *testing.T) {
  getItem = func(url string) {
    defer wg.Done()

    ch <- Item{
      "FooTitle",
      "FooSize",
      "10.00",
      "FooDescription",
    }
  }

  urls := []string{
    "http://foo.com/",
    "http://bar.com/",
    "http://baz.com/",
  }

  result := Scrape(urls)
  first := result.Items[0]

  var suite = []struct {
    response string
    expected string
  }{
    {first.Title, "FooTitle"},
    {first.Size, "FooSize"},
    {first.UnitPrice, "10.00"},
    {first.Description, "FooDescription"},
    {result.Total, "30.00"},
  }

  for _, v := range suite {
    if v.response != v.expected {
      err(v.response, v.expected, t)
    }
  }
}

func err(response, expected string, t *testing.T) {
  t.Errorf("The response:\n '%s'\ndidn't match the expectation:\n '%s'", response, expected)
}
```

<div id="8"></div>
## Logging

Using the standard Logger:

```
info := log.New(os.Stdout, "STUFF: ", log.Ldate|log.Ltime|log.Lshortfile)
info.Println("Starting up!!!")

f, e := os.Create("test.log")
if e != nil {
  log.Fatal("Failed to create log file")
}

logfile := log.New(f, "STUFF: ", log.Ldate|log.Ltime|log.Lshortfile)
logfile.Println("Starting up!!!")
```

Using Logrus:

```
package main

import (
  "os"

  log "github.com/Sirupsen/logrus"
)

func main() {
  // Standard stdout ASCII logging
  log.WithFields(log.Fields{
    "animal": "walrus",
  }).Info("A walrus appears")

  // JSON style structured logging
  log.SetFormatter(&log.JSONFormatter{})
  f, e := os.Create("logs")
  if e != nil {
    log.Fatal("Failed to create log file")
  }
  log.SetOutput(f)
  log.WithFields(log.Fields{
    "animal": "walrus",
    "size":   10,
  }).Info("A group of walrus emerges from the ocean")
  /*
      {
        "animal": "walrus",
        "level": "info",
        "msg": "A group of walrus emerges from the ocean",
        "size": 10,
        "time": "2015-12-22T13:58:46Z"
      }
  */
}
```

<div id="9"></div>
## Godo

Godo is a build tool in a similar vein to rake or gulp. 

The following example is taken from my own project [go-requester](https://github.com/Integralist/Go-Requester):

```
package main

import (
  "fmt"
  "os"

  do "gopkg.in/godo.v2"
)

func tasks(p *do.Project) {
  if pwd, err := os.Getwd(); err == nil {
    do.Env = fmt.Sprintf("GOPATH=%s/vendor::$GOPATH", pwd)
  }

  p.Task("server", nil, func(c *do.Context) {
    c.Start("main.go ./config/page.yaml", do.M{"$in": "./"})
  }).Src("**/*.go")
}

func main() {
  do.Godo(tasks)
}
```

<div id="10"></div>
## Import Race Conditions

When you import a package within a Go script, only the public functions and variables are exposed for the caller to utilise. So if you need a package to execute some bootstrapping code at the point of it being _loaded_, then you'll need to stick it inside of an `init` function.

> Note: you can have multiple `init` functions inside a package 
> e.g. one per file within the package namespace

But be careful using `init` as it can result in a race condition. 

I've hit an issue where I had something like:

- `main.go`
- `foo.go` (imported by `main.go`)
- `bar.go` (imported by `foo.go`)

Each one of these packages had its own `init` function and ultimately the `bar.go`'s `init` function was being run first, followed by the `foo.go`'s `init` function and finally followed by the `main.go`'s `init` function.

The reason this was an issue was because `main.go` was loading some environment variables needed by `bar.go` but those variables weren't available by the time the `bar.go` was running as that happened _before_ `main.go`'s `init` function had executed.

The solution was to rename all the `init` functions to `Init` and explicitly call them to bootstrap the package when needed (i.e. they didn't automatically bootstrap themselves and so we avoided that race condition).

<div id="11"></div>
## New vs Make

- `func new(Type) *Type`: allocate memory for custom-user type
- `func make(Type, size IntegerType) Type`: allocate memory for builtin types (Slice, Map, Chan)

```
package main

import "fmt"

func main() {
  foo := make(map[string]string)
  fmt.Println(foo) // map[]
  foo["k1"] = "bar"
  fmt.Println(foo) // map[k1:bar]
  fmt.Println(foo["k1"]) // bar
  
  type bar [5]int
  b := new(bar)
  fmt.Println(b) // &[0 0 0 0 0]
  b[0] = 1
  fmt.Println(b) // &[1 0 0 0 0]
}
```

<div id="12"></div>
## Custom Types

```
package main

import (
  "bytes"
  "fmt"
)

type path []byte // our custom Type

// method attached to our custom Type
func (p *path) TruncateAtFinalSlash() {
  i := bytes.LastIndex(*p, []byte("/"))

  if i >= 0 {
    *p = (*p)[0:i]
  }
}

func main() {
  pathName := path("/usr/bin/tso") // Conversion from string to path.

  pathName.TruncateAtFinalSlash()

  fmt.Printf("%s\n", pathName)
}
```

Alternative example:

```
package main

import "fmt"

type foo [5]int

func main() {
  f := new(foo)
  fmt.Println(f) // &[0 0 0 0 0]
  f[0] = 1
  fmt.Println(f) // &[1 0 0 0 0]
  f.Bar()
  fmt.Println(f) // &[1 2 0 0 0]

  // We can coerce custom types like we can with built-in types
  b := foo([5]int{9, 9, 9})
  fmt.Println(b) // [9 9 9 0 0]
  
  // Check the types
  fmt.Printf("%T\n", b)               // main.foo
  fmt.Printf("%T\n", [5]int{9, 9, 9}) // [5]int
}

func (f *foo) Bar() {
  f[1] = 2
}
```

<div id="13"></div>
## Function Types

```
package main

import "fmt"

type Foo func(int, string)

func (f Foo) Bar(s string) {
  fmt.Printf("s: %s\n", s)
}

func FooIt(x int, y string) {
  fmt.Printf("x: %d - y: %s\n", x, y)
}

// We HAVE to define the incoming type of "fn"
// Which in this case is a Foo type
func TestIt(fn Foo) {
  fn(99, "problems")
}

// We could do this without defining a func type
// But as you can see, this is a bit ugly
// Plus if we need this function passed around a lot
// then it means a lot of duplicated effort 
// typing the signature over and over
func TestItManually(fn func(int, string)) {
  fn(100, "problems")
}

func main() {
  // Here we're just demonstrating passing around the FooIt function
  // It demonstrates first-class function support in Go
  // But also that we can ensure the function passed around has the expected signature
  TestIt(FooIt)
  TestItManually(FooIt)
  
  x := Foo(FooIt) // Convert our function into a Foo type
  x(0, "hai")     // Now we can execute it as we would FooIt itself
  
  FooIt(1, "bye")
  
  // Notice the types are different
  // FooIt is just a function with a signature (no known type associated with it)
  // Where as "x" is of known type "Foo"
  fmt.Printf("%T\n", FooIt) // func(int, string)
  fmt.Printf("%T\n", x)     // main.Foo
  
  // But we'll see that the function "x" 
  // which was converted into a Foo type
  // now has access to a Bar method
  // Although FooIt has a matching signature, it's not a Foo type
  // and so it doesn't have a Bar method available
  x.Bar("we have a Bar method")
  
  // We can't even execute:
  // FooIt.Bar("we don't have a Bar method")
  // Because the compiler will stop us
}
```

<div id="14"></div>
## Enumerator IOTA

Within a constant declaration, the predeclared identifier `iota` represents successive untyped integer constants. It is reset to 0 whenever the reserved word `const` appears in the source.

```
package main

import "fmt"

const (
  foo = iota // 0
  bar
  _ // skip this value
  baz
)

const (
  beep = iota // 0 (reset)
  boop
)

func main() {
  fmt.Println(foo, bar, baz) // 0 1 3
  fmt.Println(beep, boop)    // 0 1
}
```

<div id="15"></div>
## Struct: Var vs Type

A variable of Struct type doesn't need to be instantiated like a type struct:

```
package main

import "fmt"

var data struct {
  A string
  B string
}

type data2 struct {
  A string
  B string
}

func main() {
  data.A = "Hai"
  data.B = "Bai"
  
  fmt.Printf(
    "%#v, %+v, %+v", 
    data.A, 
    data.B, 
    data2{A: "abc", B: "def"}
  )
  // "Hai", Bai, {A:abc B:def}
}
```

<div id="16"></div>
## Embedded Structs

The first example demonstrates a 'named' field utilising an embedded Struct:

```
package main

import "fmt"

type Point struct {
  X, Y int
}

type Circle struct {
  Center Point // named embeded field
  Radius int
}

type Wheel struct {
  Circle Circle // named embeded field
  Spokes int
}

func main() {
  var w Wheel
  w.Circle.Center.X = 8
  w.Circle.Center.Y = 8
  w.Circle.Radius = 5
  w.Spokes = 20

  fmt.Printf("%+v", w)
}
```

Which prints:

```
{Circle:{Center:{X:8 Y:8} Radius:5} Spokes:20}
```

The second example demonstrates an 'anonymous' field instead:

```
package main

import "fmt"

type Point struct {
  X, Y int
}

type Circle struct {
  Point
  Radius int
}

type Wheel struct {
  Circle
  Spokes int
}

func main() {
  var w Wheel
  w.X = 8       // w.Circle.Point.X
  w.Y = 8       // w.Circle.Point.Y
  w.Radius = 5  // w.Circle.Radius
  w.Spokes = 20

  fmt.Printf("%+v", w)
}
```

Which prints:

```
{Circle:{Point:{X:8 Y:8} Radius:5} Spokes:20}
```

> Note: anonymous fields don't work shorthand literal Struct

The following example demonstrates how methods of a composited object can be accessed from the consuming object:

```
package main

import "fmt"

type Point struct {
  X, Y int
}

func (p Point) foo() {
  fmt.Printf("foo: %+v\n", p)
}

type Circle struct {
  Point
  Radius int
}

type Wheel struct {
  Circle
  Spokes int
}

func main() {
  var w Wheel
  w.X = 8      // w.Circle.Point.X
  w.Y = 8      // w.Circle.Point.Y
  w.foo()      // w.Circle.Point.foo()
  w.Radius = 5 // w.Circle.Radius
  w.Spokes = 20

  fmt.Printf("%+v", w)
}
```

Which prints:

```
foo: {X:8 Y:8}
{Circle:{Point:{X:8 Y:8} Radius:5} Spokes:20}
```

Here is a more practical example that demonstrates how embedded functionality can make code more expressive:

```
package main

import (
  "fmt"
  "sync"
)

// Anonymous struct
var cache = struct {
  sync.Mutex
  mapping map[string]string
}{
  mapping: make(map[string]string), // initial zero value for map
}

func setValue() {
  cache.Lock()
  cache.mapping["foo"] = "bar"
  cache.Unlock()
}

func main() {
  setValue()

  cache.Lock()
  v := cache.mapping["foo"]
  cache.Unlock()

  fmt.Printf("v: %s", v)
}
```

<div id="17"></div>
## Reference vs Value

Map data structures are passed by reference, rather than a copied value

```
package main

import "fmt"

func main() {
  m := make(map[string]int)
  fmt.Println("main before, m = ", m)
  foo(m)
  fmt.Println("main after, m = ", m)
}

func foo(m map[string]int) {
  fmt.Println("foo before, m = ", m)
  m["hai"] = 123
  fmt.Println("foo after, m = ", m)
}
```

In fact, anything with `make` is a reference, as well as any explicit interface

<div id="18"></div>
## See all methods on `<Type>`

```
errType := reflect.TypeOf(err)
for i := 0; i < errType.NumMethod(); i++ {
  method := errType.Method(i)
  fmt.Println(method.Name)
}
```

<div id="19"></div>
## Convert Struct into JSON

```
package main

import (
  "encoding/json"
  "fmt"
  "os"
  "time"
)

func main() {
  type Message struct {
    Sequence  int    `json:"sequence"`
    Title     string `json:"title"`
    Timestamp time.Time   `json:"timestamp"`
  }
  msg := Message{1, "Foobar", time.Now()}
  b, err := json.Marshal(msg)
  if err != nil {
    fmt.Println("error:", err)
  }
  os.Stdout.Write(b)
}
```

<div id="20"></div>
## Pretty Printing JSON String

```
package main

import (
  "encoding/json"
  "fmt"
  "os"
)

func main() {
  type ColorGroup struct {
    ID     int
    Name   string
    Colors []string
  }
  group := ColorGroup{
    ID:     1,
    Name:   "Reds",
    Colors: []string{"Crimson", "Red", "Ruby", "Maroon"},
  }
  b, err := json.MarshalIndent(group, "", "    ")
  if err != nil {
    fmt.Println("error:", err)
  }
  os.Stdout.Write(b)
}
```

<div id="21"></div>
## Convert Struct into YAML

```
package main

import (
  "fmt"

  "gopkg.in/yaml.v2"
)

type ComponentYaml struct {
  Id  string `yaml:"id"`
  Url string `yaml:"url"`
}

type ComponentsYamlList struct {
  Components []ComponentYaml `yaml:"components"`
}

func main() {
  var y ComponentsYamlList

  yaml.Unmarshal([]byte("components:\n  - id: google\n    url: http://google.com\n  - id: integralist\n    url: http://integralist.co.uk"), &y)

  fmt.Println(y)
}
```

### Unknown YAML Structure

```
package main

import (
  "encoding/json"
  "fmt"
  "os"

  "gopkg.in/yaml.v2"
)

var yml = []byte(`
- key: foo
  value: bar
  secret: false
- key: beep
  value: boop
  secret: true
`)

type Data struct {
  Items []map[string]interface{}
}

func main() {
  y := []map[string]interface{}{}

  if err := yaml.Unmarshal(yml, &y); err == nil {
    fmt.Printf("%#v\n", y)
  } else {
    fmt.Println(err.Error())
  }

  myYaml := Data{Items: y}

  json.NewEncoder(os.Stdout).Encode(myYaml.Items)
}
```

<div id="22"></div>
## Sorting Structs

```
package main

import (
  "fmt"
  "sort"
)

type vals []Value

type Value struct {
  Key string
  Value string
  Secure bool
}

// Satisfy the Sort interface
func (v vals) Len() int      { return len(v) }
func (v vals) Swap(i, j int) { v[i], v[j] = v[j], v[i] }
func (v vals) Less(i, j int) bool { 
  return v[i].Key < v[j].Key 
}

func main() {
  orig := vals{
    {"CK", "BV", false},
    {"DK", "AV", true},
    {"AK", "CV", false},
    {"BK", "DV", true},
  }
  
  fmt.Printf("%+v\n\n", orig)
  sort.Sort(orig)
  fmt.Printf("%+v\n\n", orig)
}
```

Here is a similar version that sorts by name and age:

```
package main

import (
  "fmt"
  "sort"
)

type person struct {
  Name string
  Age  int
}

type byName []person

func (p byName) Len() int {
  return len(p)
}
func (p byName) Less(i, j int) bool {
  return p[i].Name < p[j].Name
}
func (p byName) Swap(i, j int) {
  p[i], p[j] = p[j], p[i]
}

type byAge []person

func (p byAge) Len() int {
  return len(p)
}
func (p byAge) Less(i, j int) bool {
  return p[i].Age < p[j].Age
}
func (p byAge) Swap(i, j int) {
  p[i], p[j] = p[j], p[i]
}

func main() {
  kids := []person{
    {"Jill", 9},
    {"Jack", 10},
  }

  sort.Sort(byName(kids))
  fmt.Println(kids)

  sort.Sort(byAge(kids))
  fmt.Println(kids)
}
```

Which results in:

```
[{Jack 10} {Jill 9}]
[{Jill 9} {Jack 10}]
```

<div id="23"></div>
## Read Users Input

```
reader := bufio.NewReader(os.Stdin)
fmt.Print("Enter text: ")
text, _ := reader.ReadString('\n')
fmt.Println(text)
```

<div id="24"></div>
## HTTP Middleware

This code was modified from [@matryer](https://medium.com/@matryer/writing-middleware-in-golang-and-how-go-makes-it-so-much-fun-4375c1246e81):

```
package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
)

type data struct {
  Greeting string
  Punct    string
  Who      string
}

func (s data) ServeHTTP(w http.ResponseWriter, r *http.Request) {
  fmt.Fprint(w, s.Greeting, s.Punct, s.Who)
}

type adapter func(http.Handler) http.Handler

func adapt(h http.Handler, adapters ...adapter) http.Handler {
  // Ideally you'd do this in reverse
  // to ensure the order of the middleware
  // matches their specified order
  for _, adapter := range adapters {
    h = adapter(h)
  }
  return h
}

func notify(logger *log.Logger) adapter {
  return func(h http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      logger.Println("before")
      defer logger.Println("after")
      h.ServeHTTP(w, r)
    })
  }
}

func doSomething() adapter {
  return func(h http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      fmt.Println("before")
      defer fmt.Println("after")
      h.ServeHTTP(w, r)
    })
  }
}

func main() {
  http.Handle("/hello", &data{"Hello", " ", "Gophers!"})

  logger := log.New(os.Stdout, "server: ", log.Lshortfile)

  http.Handle("/hello-with-middleware", adapt(
    &data{"Hello", " ", "Gophers!"},
    notify(logger), // runs second
    doSomething(), // runs first
  ))

  http.ListenAndServe("localhost:4000", nil)
}
```

This code will run a web server with two valid endpoints:

1. `/hello`
2. `/hello-with-middleware`

The client sees the same output but the latter endpoint produces the following stdout output:

```
before
server: middleware.go:35: before
server: middleware.go:38: after
after
```

<div id="25"></div>
## Sessions

```
package main

import (
  "fmt"
  "net/http"
  "time"
)

const cookiePrefix = "integralist-example-cookie-"

func main() {
  http.HandleFunc("/", login)
  http.HandleFunc("/admin", admin)
  http.HandleFunc("/logout", logout)
  http.ListenAndServe("localhost:4000", nil)
}

func login(w http.ResponseWriter, r *http.Request) {
  if r.Method == "GET" {
    fmt.Fprintf(w, `
<html>
  <body>
    <form method="POST">
      Username: <input type="text" name="username">
      <br />
      Password: <input type="password" name="password">
      <br />
      <input type="submit" value="Login">
  </body>
</html>
`)
  }

  if r.Method == "POST" {
    username := r.FormValue("username")
    password := r.FormValue("password")

    if username == "admin" && password == "password" {
      http.SetCookie(w, &http.Cookie{
        Name:  cookiePrefix + "user",
        Value: username,
      })
      http.Redirect(w, r, "/admin", 302)
    } else {
      fmt.Fprintf(w, `
<html>
  <body>
    Login details were incorrect. Sorry, <a href="/">try again</a>
  </body>
</html>
`)
    }
  }
}

func logout(w http.ResponseWriter, r *http.Request) {
  http.SetCookie(w, &http.Cookie{
    Name:    cookiePrefix + "user",
    Value:   "",
    Expires: time.Now(),
  })

  http.Redirect(w, r, "/", 302)
}

func admin(w http.ResponseWriter, r *http.Request) {
  cookie, err := r.Cookie(cookiePrefix + "user")
  if err != nil {
    http.Redirect(w, r, "/", 401) // Unauthorized
    return
  }

  fmt.Fprintf(w, `
<html>
  <body>
    Logged into admin area as: %s<br><br>
    <a href="/logout">Logout</a>
  </body>
</html>
`, cookie.Value)
}
```

<div id="26"></div>
## HTTPS TLS Request

```
package requester

import (
  "crypto/tls"
  "crypto/x509"
  "flag"
  "io/ioutil"
  "log"
  "net/http"
)

var (
  certFile = flag.String("cert", "/etc/pki/tls/certs/client.crt", "A PEM eoncoded certificate file.")
  keyFile  = flag.String("key", "/etc/pki/tls/private/client.key", "A PEM encoded private key file.")
  caFile   = flag.String("CA", "/etc/ca/cloud-ca.pem", "A PEM eoncoded CA's certificate file.")
)

func SecureClient() *http.Client {
  // Load client cert
  cert, err := tls.LoadX509KeyPair(*certFile, *keyFile)
  if err != nil {
    log.Fatal(err)
  }

  // Load CA cert
  caCert, err := ioutil.ReadFile(*caFile)
  if err != nil {
    log.Fatal(err)
  }
  caCertPool := x509.NewCertPool()
  caCertPool.AppendCertsFromPEM(caCert)

  // Setup HTTPS client
  tlsConfig := &tls.Config{
    Certificates:       []tls.Certificate{cert},
    RootCAs:            caCertPool,
    InsecureSkipVerify: true,
  }
  tlsConfig.BuildNameToCertificate()
  transport := &http.Transport{TLSClientConfig: tlsConfig}
  client := &http.Client{Transport: transport}

  return client
}
```

And to use it...

```
client := requester.SecureClient()

// GET
resp, err := client.Get(someEndpoint)

// POST
req, err := http.NewRequest("POST", someEndpoint, bytes.NewBuffer(jsonStr))
req.Header.Set("Content-Type", "application/json")
resp, err := client.Do(req)
```

<div id="27"></div>
## HTTP GET Web Page

```
package main

import (
  "fmt"
  "io/ioutil"
  "net/http"
  "os"
)

func main() {
  response, err := http.Get("http://www.integralist.co.uk/")
  if err != nil {
    fmt.Println(err.Error())
    os.Exit(1)
  }

  defer response.Body.Close()

  contents, err := ioutil.ReadAll(response.Body)
  if err != nil {
    fmt.Println(err.Error())
    os.Exit(1)
  }

  fmt.Println(string(contents))
}
```

<div id="28"></div>
## Custom HTTP Request Methods

Go doesn't provide abstractions for all the various HTTP request types, so for things like `PUT` you have to implement it yourself. The following is an example that creates a secure (TLS/HTTPS) `PUT` abstraction...

```
func SecurePut(url, contentType string, configFile io.Reader) (*http.Response, error) {
  client := &http.Client{Transport: configureTLS()}
  req, err := http.NewRequest("PUT", url, configFile)
  if err != nil {
    return nil, err
  }
  req.Header.Add("Content-Type", contentType)
  resp, err := client.Do(req)

  return resp, err
}

func configureTLS() *http.Transport {
  certFilePath := "path/to/cert"
  keyFilePath := "path/to/privateKey"
  caPath := "path/to/ca"

  // Load client cert
  cert, err := tls.LoadX509KeyPair(certFilePath, keyFilePath)
  if err != nil {
    msg := fmt.Sprintf("Error loading developer cert, path: \"%s\"", certFilePath)
    output.Error(msg)
  }

  // Load CA cert
  caCert, err := ioutil.ReadFile(caPath)
  if err != nil {
    msg := fmt.Sprintf("Error loading CA cert, path: \"%s\"", caPath)
    output.Error(msg)
  }
  caCertPool := x509.NewCertPool()
  caCertPool.AppendCertsFromPEM(caCert)

  // Setup HTTPS client
  tlsConfig := &tls.Config{
    Certificates:       []tls.Certificate{cert},
    RootCAs:            caCertPool,
    InsecureSkipVerify: true,
  }
  tlsConfig.BuildNameToCertificate()

  return &http.Transport{TLSClientConfig: tlsConfig}
}
```

<div id="29"></div>
## Pointers

```
package main

import "fmt"

// Point stores co-ordinates
type Point struct {
  x int
  y int
}

// If receiver (Point) isn't set to a pointer (*Point) 
// then the struct's field value won't be updated outside the method
func (p *Point) scaleBy(factor int) {
  fmt.Printf("scaleBy (before modification): %+v\n", p)

  // Don't need to derefence (*) struct fields
  // Compiler will perform an implicit &p for you
  // You only need to dereference in standard functions when a argument pointer is required (see below Array Pointer example)
  p.x *= factor
  p.y *= factor

  fmt.Printf("scaleBy (after modification): %+v\n", p)
}

func main() {
  // Doesn't matter if we do or don't get the address space (&) for foo/bar's Point
  foo := &Point{1, 2}
  bar := &Point{6, 8}

  fmt.Printf("Main foo.x: %+v\n", foo.x)
  fmt.Printf("Main bar.x: %+v\n", bar.x)

  foo.scaleBy(5)
  bar.scaleBy(5)

  fmt.Printf("Main foo.x: %+v\n", foo.x)
  fmt.Printf("Main foo.y: %+v\n", foo.y)

  fmt.Printf("Main bar.x: %+v\n", bar.x)
  fmt.Printf("Main bar.y: %+v\n", bar.y)
}
```

> Note: compiler can only apply implicit dereference for variables and struct fields. This wouldn't work `Point{1, 2}.scaleBy(5)`

Results in the following output:

```
Main foo.x: 1
Main bar.x: 6
scaleBy (before modification): &{x:1 y:2}
scaleBy (after modification): &{x:5 y:10}
scaleBy (before modification): &{x:6 y:8}
scaleBy (after modification): &{x:30 y:40}
Main foo.x: 5
Main foo.y: 10
Main bar.x: 30
Main bar.y: 40
```

### Array Pointer

Deference an Array pointer so you can mutate the original Array values:

```
package main

import "fmt"

func main() {  
    x := [3]int{1,2,3}

    func(arr *[3]int) {
        (*arr)[0] = 7
        fmt.Println(arr) //prints &[7 2 3]
    }(&x)

    fmt.Println(x) //prints [7 2 3]
}
```

Alternatively you can utilise a Slice instead of an Array, as the slice 'header' already has a 'pointer' to an underlying Array:

```
package main

import "fmt"

func main() {  
    x := []int{1,2,3}

    func(arr []int) {
        arr[0] = 7
        fmt.Println(arr) //prints [7 2 3]
    }(x)

    fmt.Println(x) //prints [7 2 3]
}
```

### Mutating Values

```
package main

import "fmt"

type Compose string

func (c *Compose) Details() string {
  *c = "beep boop"
  return fmt.Sprintf("Here are your details: %v", *c)
}

func main() {
  var c Compose
  c = "hai"
  fmt.Printf("c: %+v\n", c) // c
  fmt.Println(c.Details())
  fmt.Printf("c: %+v\n", c) // beep boop
}
```

<div id="30"></div>
## Type Assertion

```
if e, ok := err.(net.Error); ok && e.Timeout() {
  //
}

type argError struct {
    arg  int
    prob string
}

func (e *argError) Error() string {
    return fmt.Sprintf("%d - %s", e.arg, e.prob)
}

if ae, ok := e.(*argError); ok {
  //
}
```

<div id="31"></div>
## Line Counting

Demonstrates how to use `bufio` package to scan a file and read it line by line, and then how to increment a map integer value using the shortcut `map[key]++`. Finally, demonstrates nested maps and ranging over them:

```
package main

import (
  "bufio"
  "fmt"
  "os"
)

func main() {
  counts := make(map[string]map[string]int)
  files := os.Args[1:]
  if len(files) == 0 {
    countLines(os.Stdin, "n/a", counts)
  } else {
    for _, arg := range files {
      f, err := os.Open(arg)
      if err != nil {
        fmt.Fprintf(os.Stderr, "dup2: %v\n", err)
        continue
      }
      countLines(f, arg, counts)
      f.Close()
    }
  }
  for key, nestedMap := range counts {
    fmt.Printf("Text: %s\n", key)
    for filename, count := range nestedMap {
      fmt.Printf("\tFile: %s\n\tCount: %d\n", filename, count)
    }
    fmt.Println("")
  }
}

func countLines(f *os.File, filename string, counts map[string]map[string]int) {
  input := bufio.NewScanner(f)
  for input.Scan() {
    if val, ok := counts[input.Text()]; ok {
      val[filename]++
    } else {
      inner := make(map[string]int)
      inner[filename]++
      counts[input.Text()] = inner
    }
  }
}
```

<div id="32"></div>
## Reading File in Chunks

```
package main

import (
  "fmt"
  "log"
  "os"
)

func main() {
  // Create file (truncates file if it already exists)
  file, err := os.Create("created.txt")
  if err != nil {
    log.Fatal(err)
  }

  // Populate byte slice with some content
  b := make([]byte, 0)
  for i := 0; i < 5; i++ {
    b = append(b, '!')
    b = append(b, '\n')
    // notice single quotes for Rune rather than double quote for String
  }
  for i := 0; i < 5; i++ {
    b = append(b, '?')
    b = append(b, '\n')
    // notice single quotes for Rune rather than double quote for String
  }
  for i := 0; i < 5; i++ {
    b = append(b, '%')
    b = append(b, '\n')
    // notice single quotes for Rune rather than double quote for String
  }

  // Write file contents
  bytesWritten, err := file.Write(b)
  if err != nil {
    log.Fatal(err)
  }
  fmt.Printf("Bytes written: %+v\n", bytesWritten)

  // Although getting the bytes written was useful for us
  // in this example, you might need to get total bytes
  // which can be done by copying file contents into dev/null
    // io.Copy(ioutil.Discard, resp.Body)

  // Get current offset
  // 1st arg is how much to seek forward/backwards by
  // 2nd arg is relative to different settings
  // 		0 == relative to start of file
  // 		1 == current offset
  // 		2 == relative to end of file
  currentOffset, err := file.Seek(0, 1)
  if err != nil {
    log.Fatal(err)
  }
  fmt.Printf("Current offset: %d\n", currentOffset)
  file.Seek(-currentOffset, 1) // Return to start of file for next Read

  // Read buffered view of file
  data := make([]byte, 10, bytesWritten) // create slice with underlying Array capacity set to total file bytes size
  eof := false
  for !eof {
    count, err := file.Read(data)
    if err != nil {
      eof = true
    }
    fmt.Printf("read %d bytes: %q\n", count, data[:count])
  }
}
```

<div id="33"></div>
## Time

```
now := time.Now()
fmt.Println(now)
expiration := now.Add(time.Hour * 24 * 30)
fmt.Println("Thirty days from now will be : ", expiration)
```

Here we measure time:

```
package main

import (
  "fmt"
  "time"
)

// Sleep requires a Duration
// time has set of constants we can use (lowest is 1 Duration)
// Second constant is an abstraction over the other constants
func main() {
  start := time.Now()
  time.Sleep(time.Duration(5) * time.Second) // sleep 5 seconds
  secs := time.Since(start).Seconds()

  fmt.Printf("Time spent: %f seconds", secs)
}
```

Here is a basic example that pauses execution of a channel until the timer has expired (you would use this over a `timer.Sleep` because you can cancel a timer before it has expired):

```
package main

import (
  "fmt"
  "time"
)

func main() {
  timer := time.NewTimer(time.Second * 2)

  <-timer.C // pauses for two seconds

  fmt.Println("Timer expired")
}
```

Example of cancelling the timer:

```
package main

import (
  "fmt"
  "time"
)

func main() {
  timer := time.NewTimer(time.Second * 2)

  // Expensive process run in a separate thread
  go func() {
    <-timer.C
    fmt.Println("Timer expired")
  }()

  stop := timer.Stop() // cancel the timer
  fmt.Println(stop)    // true
}
```

We can do a similar thing with Timers but in a different way:

```
package main

import (
  "fmt"
  "time"
)

func main() {
  ticker := time.NewTicker(time.Millisecond * 500)

  // Repetitive process
  go func() {
    // Range over the channel rather than pull from it
    for t := range ticker.C {
      fmt.Println("Tick:", t)
    }
  }()

  // Stop ticker after three ticks/intervals
  time.Sleep(time.Millisecond * 1500)
  ticker.Stop()
}
```

We can combine all these items together with a `select` statement like so:

```
package main

import "time"
import "fmt"

func main() {
  timeChan := time.NewTimer(time.Second).C
  tickChan := time.NewTicker(time.Millisecond * 400).C

  // Used to signify we're done with this program
  doneChan := make(chan bool)

  // Sleep for two seconds, then notify the channel we're done
  go func() {
    time.Sleep(time.Second * 2)
    doneChan <- true
  }()

  for {
    select {
    case <-timeChan:
      fmt.Println("Timer expired")
    case <-tickChan:
      fmt.Println("Ticker ticked")
    case <-doneChan:
      fmt.Println("Done")
      return
    }
  }
}
```

The output of this program would be something like:

```
Ticker ticked
Ticker ticked
Timer expired
Ticker ticked
Ticker ticked
Done
```

<div id="34"></div>
## Starting and Stopping things with Channels

I would imagine that for most cases you'll want to use a `time.NewTimer` as seen in previous examples if you want to stop a goroutine that's processing a long running program. The following example is more for stopping a goroutine that's running code at a set interval (although using `time.NewTicker` would probably be more appropriate):

```
package main

import (
  "fmt"
  "time"
)

func main() {
  quit := make(chan bool)

  // Run a piece of code at a set interval
  go func() {
    for {
      select {
      case <-quit:
        return
      default:
        fmt.Println("Not ready to stop this goroutine")
        time.Sleep(time.Millisecond * 100)
      }
    }
  }()

  // Do other stuff for two seconds
  time.Sleep(time.Second * 2)

  // Quit goroutine
  quit <- true

  fmt.Println("Goroutine was stopped")
}
```

Starting a goroutine:

```
package main

import (
  "fmt"
  "time"
)

func main() {
  // Use a struct type channel as it clarifies your intent
  // Which is this channel is used for 'signalling'
  start := make(chan struct{})

  for i := 0; i < 10000; i++ {
    go func() {
      <-start // wait for the start channel to be closed
      fmt.Println("do stuff")
    }()
  }

  // at this point, all goroutines are ready to go
  // we just need to tell them to start by
  // closing the start channel
  close(start)

  fmt.Println("Let's pause briefly to give goroutines time to execute")

  time.Sleep(time.Millisecond * 10)
}
```

Stopping a goroutine:

```
package main

import (
  "fmt"
  "time"
)

func main() {
  // Use a struct type channel as it clarifies your intent
  // Which is this channel is used for 'signalling'
  done := make(chan struct{})

  // Long running process put onto a thread
  go func() {
    fmt.Println("Inside thread doing expensive processing")
    time.Sleep(time.Second * 5)
    close(done)
  }()

  fmt.Println("Do other things")

  // Wait for long running process to finish
  <-done

  fmt.Println("Do more things")
}
```

<div id="35"></div>
## Channel Pipelines

The principle of a pipeline, is to take data from one function and pass it into another function, that receiving function will process the received data and then that result is returned and subsequently passed onto another function... rinse and repeat for however long your pipeline needs to be.

In the below example (copied from [here](https://blog.gopheracademy.com/advent-2015/automi-stream-processing-over-go-channels/)) demonstrates how a set of functions accept a channel and return a channel and so channels is the 'data' that is passed around the pipeline functions:

```
package main

import "fmt"
import "sync"

func ingest() <-chan []string {
  out := make(chan []string)
  go func() {
    out <- []string{"aaaa", "bbb"}
    out <- []string{"cccccc", "dddddd"}
    out <- []string{"e", "fffff", "g"}
    close(out)
  }()
  return out
}

func process(concurrency int, in <-chan []string) <-chan int {
  var wg sync.WaitGroup
  wg.Add(concurrency)

  out := make(chan int)

  work := func() {
    for data := range in {
      for _, word := range data {
        out <- len(word)
      }
    }
    wg.Done()

  }

  go func() {
    for i := 0; i < concurrency; i++ {
      go work()
    }

  }()

  go func() {
    wg.Wait()
    close(out)
  }()
  return out
}

func store(in <-chan int) <-chan struct{} {
  done := make(chan struct{})
  go func() {
    defer close(done)
    for data := range in {
      fmt.Println(data)
    }
  }()
  return done
}

func main() {
  // stage 1 ingest data from source
  in := ingest()

  // stage 2 - process data
  reduced := process(4, in)

  // stage 3 - store
  <-store(reduced)
}
```

<div id="36"></div>
## Templating

Here is a basic program that uses a Struct for its data source:

```
package main

import (
  "log"
  "os"
  "text/template"
)

type dataSource struct {
  Baz int
}

func (ds dataSource) Foo() string {
  return "I am foo"
}

func (ds dataSource) Bar() string {
  return "I am bar"
}

const templ = `
  Foo: {{.Foo}}
  Piping: {{.Bar | printf "Bar: %s"}}
  Function: {{.Baz | qux}}
`

func qux(baz int) int {
  return baz * 2
}

// template.Must handles parsing errors better
var setupTemplate = template.Must(
  template.New("whatever").
    Funcs(template.FuncMap{"qux": qux}).
    Parse(templ),
)

func main() {
  ds := dataSource{5}

  if err := setupTemplate.Execute(os.Stdout, ds); err != nil {
    log.Fatal(err)
  }
}
```

> Note: `printf` is a built-in function for templating and is functionally equivalent to `fmt.Sprintf`

Program output:

```
Foo: I am foo
Piping: Bar: I am bar
Function: 10
```

Here is a HTML templating version:

```
package main

import (
  "html/template"
  "log"
  "os"
)

var data struct {
  A string        // untrusted plain text
  B template.HTML // trusted HTML
}

const templ = `<p>A: {{.A}}</p><p>B: {{.B}}</p>`

func main() {
  t := template.Must(template.New("escape").Parse(templ))

  data.A = "<b>Hello</b>"
  data.B = "<b>Hello</b>"

  if err := t.Execute(os.Stdout, data); err != nil {
    log.Fatal(err)
  }
}
```

The output would be:

```
<p>A: &lt;b&gt;Hello&lt;/b&gt;</p>
<p>B: <b>Hello</b></p>
```

<div id="37"></div>
## Error handling

The following code outputs: 

```
This is our custom error with some more context prefixed: oh noes!
```

Here's the code:

```
package main

import (
  "errors"
  "fmt"
)

type errWithContext struct {
  err error
  msg string
}

func (e errWithContext) Error() string {
  return e.msg + ": " + e.err.Error()
}

func triggerError() (bool, error) {
  return false, errors.New("oh noes!")
}

func main() {
  var e *errWithContext

  _, err := triggerError()
  if err != nil {
    e = &errWithContext{
      err,
      "This is our custom error with some more context prefixed",
    }
  }

  fmt.Print(e.Error())
}
```

<div id="38"></div>
## Socket Programming

There are two main types of sockets:

1. STREAM sockets (e.g. TCP)
2. DATAGRAM sockets (e.g. UDP)

> Note: a "unix domain socket" is actually a physical file  
> it's useful for local (same host) data communication

The principle steps behind a socket is:

- Create the socket
- Bind the socket to an address (e.g. `127.0.0.1:80`)
- Listen for socket connections
- Accept the socket connection

There are two main packages in our below example: `server.go` and `client.go`. 

Run both of them in separate terminals (e.g. `go run ...`)

Then for the `client.go` type your message followed by a new line, for example:

```
Hello World
Message from server: HELLO WORLD
```

Whilst in the `server.go` terminal you should see:

```
Starting TCP server...
Message Received: Hello World
```

The code for this program is as follows:

server.go

```
package main

import (
  "bufio"
  "fmt"
  "net"
  "strings"
)

func main() {
  fmt.Println("Starting TCP server...")

  // Listen on all network interfaces (e.g. 0.0.0.0)
  // Documentation: godoc net Listener | less
  listener, _ := net.Listen("tcp", ":8081")

  // Accept connection on the port we specified (see above)
  connection, _ := listener.Accept()

  // Handle incoming connections forever
  for {
    // Listen for message to process ending in newline (\n)
    // Note: single quotes needed for type byte (double quotes is a string)
    message, _ := bufio.NewReader(connection).ReadString('\n')

    // Output message received
    fmt.Println("Message Received:", string(message))

    // Do something with the message (e.g. uppercase it)
    newmessage := strings.ToUpper(message)

    // Send new string back to client
    connection.Write([]byte(newmessage + "\n"))
  }
}
```

client.go

```
package main

import (
  "bufio"
  "fmt"
  "net"
  "os"
)

func main() {
  // Open socket connection to a locally runnning TCP server
  connection, _ := net.Dial("tcp", "127.0.0.1:8081")

  // Handle incoming responses
  for {
    // Read the input
    reader := bufio.NewReader(os.Stdin)

    // Message to be sent
    // Note: single quotes needed for type byte (double quotes is a string)
    // Documentation: godoc bufio ReadString | less
    // ReadString reads until the first occurrence of the delimiter \n in the input
    text, _ := reader.ReadString('\n')

    // Send message to open Socket
    fmt.Fprintf(connection, text+"\n")

    // Listen for response
    // Note: single quotes needed for type byte (double quotes is a string)
    message, _ := bufio.NewReader(connection).ReadString('\n')

    fmt.Println("Message from server: " + message)
  }
}
```

<div id="39"></div>
## Comparing Maps

This code demonstrates how to be careful about false positives!

```
package main

import "fmt"

func equal(x, y map[string]int) bool {
  if len(x) != len(y) {
    // fail fast
    return false
  }

  for k, xv := range x {
    // Verify "missing" key and "present but zero" key value
    if yv, ok := y[k]; !ok || yv != xv {
      return false
    }
    
    /*
    // The following condition would incorrectly return "true" for the below example comparison!
    // This is because the empty value for an int type is a zero, while the actual value of x's key is zero
    if xv != y[k] {
      return false
    }
    */
  }

  return true
}

func main() {
  fmt.Println(
    equal(map[string]int{"A": 0}, map[string]int{"B": 42}),
  )
}
```

<div id="40"></div>
## Zip File Contents

```
package main

import (
  "compress/zlib"
  "io"
  "log"
  "os"
)

func main() {
  var err error

  // This defends against an error preventing `defer` from being called
  // As log.Fatal otherwise calls `os.Exit`
  defer func() {
    if err != nil {
      log.Fatalln("\nDeferred log: \n", err)
    }
  }()

  src, err := os.Create("source.txt")
  if err != nil {
    return
  }
  src.WriteString("source content")
  src.Close()

  dest, err := os.Create("new.txt")
  if err != nil {
    return
  }

  openSrc, err := os.Open("source.txt")
  if err != nil {
    return
  }

  zdest := zlib.NewWriter(dest)
  if _, err := io.Copy(zdest, openSrc); err != nil {
    return
  }

  // Close these explicitly
  zdest.Close()
  dest.Close()

  n, err := os.Open("new.txt")
  if err != nil {
    return
  }

  r, err := zlib.NewReader(n)
  if err != nil {
    return
  }
  defer r.Close()
  io.Copy(os.Stdout, r)

  err = os.Remove("source.txt")
  if err != nil {
    return
  }

  err = os.Remove("new.txt")
  if err != nil {
    return
  }
}
```

<div id="41"></div>
## Shell Commands

Here is a simple example that writes the output of a command to a file:

```
package main

import (
  "os"
  "os/exec"
)

func main() {
  cmd := exec.Command("ls")

  outfile, err := os.Create("./out.txt")
  if err != nil {
    panic(err)
  }
  defer outfile.Close()

  cmd.Stdout = outfile
  cmd.Stderr = outfile

  err = cmd.Start()
  if err != nil {
    panic(err)
  }

  cmd.Wait()
}
```

Here is an older example that printed the results of a command:

```
var (
  cmdOut []byte
  err    error
)
cmdName := "spurious"
cmdArgs := []string{"ports", "--json"}
if cmdOut, err = exec.Command(cmdName, cmdArgs...).Output(); err != nil {
  fmt.Fprintln(os.Stderr, "There was an error running 'spurious ports --json' command: ", err)
  os.Exit(1)
}
fmt.Println(string(cmdOut))
```

<div id="42"></div>
## New Instance Idiom

```
package main

import "fmt"

type Sqs struct {
  foo string
}

func (s *Sqs) create() {
  fmt.Println("I'll create stuff")
}

func NewSqs() *Sqs {
  return &Sqs{"bop"}
}

func main() {
  s := NewSqs()
  fmt.Println(s.foo)
  s.create()
}
```

<div id="43"></div>
## JSON Connection Draining

When using `json.NewDecoder`:

```
func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        var u User
        if r.Body == nil {
            http.Error(w, "Please send a request body", 400)
            return
        }
        err := json.NewDecoder(r.Body).Decode(&u)
        if err != nil {
            http.Error(w, err.Error(), 400)
            return
        }
        fmt.Println(u.Id)
    })
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

...it doesn't read the response Body completely. So when closing the response you might get an error as a stray `\n` could be present later on. You'll need to drain the response instead:

```
defer func() {
  io.CopyN(ioutil.Discard, r.Body, 512)
  r.Body.Close()
}()
```

> Note: [https://github.com/google/go-github/pull/317](https://github.com/google/go-github/pull/317)

<div id="44"></div>
## Writing your own Marshal/Unmarshal functions

```
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
)

func main() {
	a := make(Stuff)
	a[1] = "asdf"
	a[-1] = "qwer"
	fmt.Println("Initial:     ", a)

	stuff, _ := json.Marshal(a)
	fmt.Println("Serialized:  ", string(stuff))

	b := make(Stuff)
	_ = json.Unmarshal(stuff, &b)
	fmt.Println("Deserialized:", b)
}

type Stuff map[int]string

// MarshalJSON works the same as the underlying json.Marshal would
func (this Stuff) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString("{")
	length := len(this)
	count := 0
	for key, value := range this {
		jsonValue, err := json.Marshal(value)
		if err != nil {
			return nil, err
		}
		buffer.WriteString(fmt.Sprintf("\"%d\":%s", key, string(jsonValue)))
		count++
		if count < length {
			buffer.WriteString(",")
		}
	}
	buffer.WriteString("}")
	return buffer.Bytes(), nil

  // for example you could totally change the behaviour...
  /*
	buffer := bytes.NewBufferString("{")
	buffer.WriteString("}")
	return buffer.Bytes(), nil
	*/
}

// UnmarshalJSON works the same as the underlying json.Unmarshal would
func (this Stuff) UnmarshalJSON(b []byte) error {
	var stuff map[string]string
	err := json.Unmarshal(b, &stuff)
	if err != nil {
		return err
	}
	for key, value := range stuff {
		numericKey, err := strconv.Atoi(key)
		if err != nil {
			return err
		}
		this[numericKey] = value
	}
	return nil
}
```

This means you can also leverage custom type checking:

See: [leveraging interfaces in golang](http://blog.tamizhvendan.in/blog/2017/06/24/leveraging-interfaces-in-golang-part-1/)

# Classic WWF

The `classicwwf.com` website is statically generated using [Go][1] and
hosted by GitHub.

- [integralist.github.io][2]
- [classicwwf.com][3]

Running the target `make build` will:

- Loop over all top-level directories (skipping `cmd`, `assets` etc).
- Convert every `.md` into a `index.html`.
- The date in the Markdown filename is used as the publish date.

> \[!NOTE\]
> The folder name will become the URL slug.

## Non-article pages

Most pages on the website are "article" pages writing about some topic.

Some are general pages and so they won't have a date prefixed to the filename.
In these cases we render the page as HTML and when linking to the page in the
side nav we'll group them under a section called "Pages".

## Writing Markdown

When writing Markdown, some linters such as alex, and markdownlint will complain
about various things.

For Alex, you can disable specific warnings using:

```plain
<!--alex ignore foo bar baz-->
```

For Markdownlint, you can disable specific warnings using:

```plain
<!-- markdownlint-disable -->
SOMETHING HERE TO IGNORE
<!-- markdownlint-enable -->
```

## Images

To generate an animated gif from a video clip:

```shell
ffmpeg -i input.mp4 -ss 02:37:40 -to 02:40:00 -vf "fps=15,scale=480:-1:flags=lanczos" assets/images/output.gif
```

If you need to reduce the size of a gif then reduce the dimensions by half:

```shell
ffmpeg -i input.gif -vf "scale=iw/2:ih/2" output.gif
```

> \[!TIP\]
> `scale=250:-1` will scale the width to 250 and auto-scale the height.

<!---->

> \[!WARNING\]
> Storage of gifs with GitHub/Git requires [https://git-lfs.com/](https://git-lfs.com/)

<!---->

> \[!IMPORTANT\]
> The gifs were taking up too much space so I've uploaded them to giphy instead.

To convert a screenshot from a png to optimized jpg:

```shell
magick input.png -quality 70 assets/images/output.jpg
```

## DNS

```shell
$ dig www.classicwwf.com

; <<>> DiG 9.10.6 <<>> www.classicwwf.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 17961
;; flags: qr rd ra; QUERY: 1, ANSWER: 5, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.classicwwf.com.		IN	A

;; ANSWER SECTION:
www.classicwwf.com.	14400	IN	CNAME	classicwwf.com.
classicwwf.com.		14400	IN	A	185.199.111.153
classicwwf.com.		14400	IN	A	185.199.110.153
classicwwf.com.		14400	IN	A	185.199.108.153
classicwwf.com.		14400	IN	A	185.199.109.153

;; Query time: 63 msec
;; SERVER: 1.0.0.1#53(1.0.0.1)
;; WHEN: Wed Dec 18 13:05:05 GMT 2024
;; MSG SIZE  rcvd: 125
```

[1]: https://go.dev/
[2]: https://integralist.github.io/
[3]: https://classicwwf.com/

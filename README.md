# integralist.co.uk

The `integralist.co.uk` website is statically generated using [Go][1] and
hosted by [Netlify][2].

Running the target `make build` will:

- Loop over all top-level directories (skipping `cmd`, `assets` etc).
- Convert every `.md` into a `index.html`.
- Pushes the date for every `.md` (extracted from the filename) into a queue.
- A separate process pulls from the queue and builds a HTML list.

> \[!NOTE\]
> The folder name will become the URL slug.

## Non-article pages

Most pages on the website are "article" pages writing about some topic.

Some are general pages (e.g. "resume") and so they won't have a date prefixed to
the filename. In these cases we render the page as HTML and when linking to the
page in the side nav we'll group them under a section called "Pages".

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

## DNS

- Hostname: www
- Type: CNAME
- Value: dreamy-wing-b0b998.netlify.com.

______________________________________________________________________

- Hostname: @
- Type: A
- Value: 104.198.14.52

______________________________________________________________________

- Hostname: www
- Type: A
- Value: 104.198.14.52

______________________________________________________________________

```shell
$ dig www.integralist.co.uk

;; ANSWER SECTION:
www.integralist.co.uk.  14399   IN      CNAME   dreamy-wing-b0b998.netlify.com.
dreamy-wing-b0b998.netlify.com. 19 IN   A       54.229.14.125

$ dig integralist.co.uk

;; ANSWER SECTION:
integralist.co.uk.      14224   IN      A       104.198.14.52

$ dig A integralist.co.uk @ns.123-reg.co.uk. +short
104.198.14.52

$ dig A integralist.co.uk @8.8.8.8 +short
104.198.14.52
```

[1]: https://go.dev/
[2]: https://www.netlify.com/

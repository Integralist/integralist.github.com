package main

import (
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"slices"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

var (
	skipDirs                   = []string{".git", "assets", "cmd"}
	initOnce                   sync.Once
	contentSubPage             []byte
	contentWatchAlongNote      []byte
	needleWatchAlongNoteInsert = []byte("{WATCH_ALONG_NOTE}")
	needleMainInsert           = []byte("{INSERT_MAIN}")
	needleNavInsert            = []byte("{INSERT_NAV}")
	errInit                    error
)

func main() {
	pages := []string{}

	err := filepath.WalkDir(".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", path, err)
			return err
		}
		if d.IsDir() && slices.Contains(skipDirs, d.Name()) {
			fmt.Printf("skipping: %+v\n", d.Name())
			return filepath.SkipDir
		}
		if filepath.Ext(d.Name()) == ".md" && d.Name() != "README.md" {
			pages = append(pages, path)
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	sideNavContent := renderSideNav(pages, "../../")

	for _, page := range pages {
		renderPosts(page, sideNavContent)
	}

	renderHome(pages)
}

// initTemplates initializes the template content and ensures it runs only once.
func initTemplates() {
	initOnce.Do(func() {
		f, err := os.Open("assets/templates/page.tpl")
		if err != nil {
			errInit = fmt.Errorf("failed to open page template: %w", err)
			return
		}
		defer f.Close()

		contentSubPage, err = io.ReadAll(f)
		if err != nil {
			errInit = fmt.Errorf("failed to read page template: %w", err)
		}

		n, err := os.Open("assets/templates/note.tpl")
		if err != nil {
			errInit = fmt.Errorf("failed to open page template: %w", err)
			return
		}
		defer n.Close()

		contentWatchAlongNote, err = io.ReadAll(n)
		if err != nil {
			errInit = fmt.Errorf("failed to read 'watch along note' template: %w", err)
		}
	})
}

func renderPosts(page, sideNavContent string) {
	// Initialize templates if not already done
	initTemplates()
	if errInit != nil {
		panic(errInit)
	}

	f, err := os.Open(page)
	if err != nil {
		fmt.Printf("failed to open page '%s': %s\n", page, err)
		return
	}

	md, err := io.ReadAll(f)
	if err != nil {
		fmt.Printf("failed to read file '%s': %s\n", page, err)
		_ = f.Close()
		return
	}
	_ = f.Close()

	h := mdToHTML(md)
	h = bytes.Replace(h, needleWatchAlongNoteInsert, contentWatchAlongNote, 1)
	content := bytes.Replace(contentSubPage, needleMainInsert, h, 1)

	segs := strings.Split(page, "/")
	dir := segs[0] + "/" + segs[1]

	content = bytes.Replace(content, needleNavInsert, []byte(sideNavContent), 1)

	dst := filepath.Join(dir, "index.html")
	err = writeFile(dst, content)
	if err != nil {
		fmt.Printf("failed to write file '%s': %s\n", dst, err)
		return
	}

	fmt.Printf("rendered: %s -> %s\n", page, dst)
}

func renderSideNav(pages []string, root string) string { // nolint:revive // function-length
	caser := cases.Title(language.BritishEnglish)

	tplNavGroupLinks := `
	<li>
	  <span class="opener">{YEAR}</span>
	  <ul>
		{YEAR_LINKS}
	  </ul>
	</li>
	`
	tplNavSingleLink := `
	<li><a href="{LINK}">{TITLE}</a></li>
	`

	type post struct {
		date    string // expects ISO 8601 format, e.g., "2024-12-15"
		year    string
		content string
	}

	links := make([]post, 0, len(pages))

	for _, path := range pages {
		segs := strings.Split(path, "/")
		dir := segs[0] + "/" + segs[1]
		date := strings.Split(segs[2], ".")[0]
		year := strings.Split(date, "-")[0]
		title := strings.ReplaceAll(caser.String(segs[1]), "-", " ")
		link := filepath.Join(root, dir, "index.html")
		contentNav := strings.Replace(tplNavSingleLink, "{TITLE}", title, 1)
		contentNav = strings.Replace(contentNav, "{LINK}", link, 1)
		links = append(links, post{date: date, year: year, content: contentNav})
	}

	sort.Slice(links, func(i, j int) bool {
		// Parse dates for comparison
		date1, _ := time.Parse("2006-01-02", links[i].date)
		date2, _ := time.Parse("2006-01-02", links[j].date)
		return date2.Before(date1) // Descending order
	})

	// key is the year
	// value is each link for that year
	years := make(map[string][]string)

	for _, link := range links {
		yearLinks, ok := years[link.year]
		if !ok {
			// Create the year and add its first link
			years[link.year] = []string{link.content}
		} else {
			// Update the year so it has another new link
			yearLinks = append(yearLinks, link.content)
			years[link.year] = yearLinks
		}
	}

	// Map keys have non-deterministic ordering.
	// So we order them manually.
	keys := make([]string, 0)
	for k := range years {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool {
		return keys[i] > keys[j] // descending order (e.g. []string{"index", "2024", "2023"})
	})
	var yearLinks string
	for _, k := range keys {
		section := k
		if k == "index" {
			section = "Pages"
		}
		container := strings.Replace(tplNavGroupLinks, "{YEAR}", section, 1)
		yearLinks += strings.Replace(container, "{YEAR_LINKS}", strings.Join(years[k], ""), 1)
	}

	return yearLinks
}

func renderHome(pages []string) { // nolint:revive // function-length
	sideNavContent := renderSideNav(pages, "")
	caser := cases.Title(language.BritishEnglish)

	tplIndex := "assets/templates/index.tpl"

	fi, err := os.Open(tplIndex)
	if err != nil {
		err = fmt.Errorf("failed to open index template: %w", err)
		panic(err)
	}

	contentIndex, err := io.ReadAll(fi)
	if err != nil {
		err = fmt.Errorf("failed to read index template: %w", err)
		panic(err)
	}

	dst := "index.html"
	tplMain := `
	<article>
	<h3>{TITLE}</h3>
	<p class="pubdate">{DATE}</p>
	<ul class="actions">
	<li><a href="{LINK}" class="button">Read</a></li>
	</ul>
	</article>
	`

	type post struct {
		date    string // expects ISO 8601 format, e.g., "2024-12-15"
		year    string
		content string
	}

	var ( // nolint:prealloc
		bufMain bytes.Buffer
		posts   []post
	)

	for _, path := range pages {
		segs := strings.Split(path, "/")
		dir := segs[0] + "/" + segs[1]
		date := strings.Split(segs[2], ".")[0]
		year := strings.Split(date, "-")[0]
		title := strings.ReplaceAll(caser.String(segs[1]), "-", " ")
		link := filepath.Join(dir, dst)
		contentMain := strings.Replace(tplMain, "{TITLE}", title, 1)
		contentMain = strings.Replace(contentMain, "{LINK}", link, 1)
		contentMain = strings.Replace(contentMain, "{DATE}", date, 1)
		if year != "index" {
			// Avoid adding generic pages to the home page list of pages in the
			// main section (generic pages are fine to add to side nav `links`)
			posts = append(posts, post{date: date, year: year, content: contentMain})
		}
	}

	sort.Slice(posts, func(i, j int) bool {
		// Parse dates for comparison
		date1, _ := time.Parse("2006-01-02", posts[i].date)
		date2, _ := time.Parse("2006-01-02", posts[j].date)
		return date2.Before(date1) // Descending order
	})

	for _, post := range posts {
		_, _ = bufMain.WriteString(post.content)
	}

	contentIndex = bytes.Replace(contentIndex, needleMainInsert, bufMain.Bytes(), 1)
	contentIndex = bytes.Replace(contentIndex, needleNavInsert, []byte(sideNavContent), 1)

	err = writeFile("index.html", contentIndex)
	if err != nil {
		fmt.Printf("failed to write index file: %s\n", err)
		return
	}

	fmt.Printf("rendered: %s -> %s\n", tplIndex, dst)
}

func writeFile(filename string, content []byte) error {
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	_, err = file.Write(content)
	if err != nil {
		return fmt.Errorf("failed to write content to file: %w", err)
	}

	return nil
}

func mdToHTML(md []byte) []byte {
	// Create markdown parser with extensions
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	p := parser.NewWithExtensions(extensions)
	doc := p.Parse(md)

	// Create HTML renderer with extensions
	htmlFlags := html.CommonFlags | html.HrefTargetBlank | html.TOC | html.LazyLoadImages
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)

	return markdown.Render(doc, renderer)
}

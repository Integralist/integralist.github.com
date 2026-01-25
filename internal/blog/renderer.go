package blog

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"sort"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

var (
	needleWatchAlongNoteInsert = []byte("{WATCH_ALONG_NOTE}")
	skipDirs                   = []string{".git", "assets", "cmd", "internal"}
)

type Renderer struct {
	tplPage *template.Template
	tplHome *template.Template
	// tplNote content is still used for manual replacement inside markdown content
	// because markdown processing happens before template execution.
	contentWatchAlongNote []byte
}

type PageData struct {
	Main template.HTML
	Nav  template.HTML
}

func NewRenderer() (*Renderer, error) {
	r := &Renderer{}

	// Parse page.tpl
	tplPage, err := template.ParseFiles("assets/templates/page.tpl")
	if err != nil {
		return nil, fmt.Errorf("failed to parse page template: %w", err)
	}
	r.tplPage = tplPage

	// Parse index.tpl
	tplHome, err := template.ParseFiles("assets/templates/index.tpl")
	if err != nil {
		return nil, fmt.Errorf("failed to parse index template: %w", err)
	}
	r.tplHome = tplHome

	// Read note.tpl for manual insertion into markdown
	n, err := os.Open("assets/templates/note.tpl")
	if err != nil {
		return nil, fmt.Errorf("failed to open note template: %w", err)
	}
	defer n.Close()

	r.contentWatchAlongNote, err = io.ReadAll(n)
	if err != nil {
		return nil, fmt.Errorf("failed to read 'watch along note' template: %w", err)
	}

	return r, nil
}

func (r *Renderer) Generate(root string) error {
	var posts []Post

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", path, err)
			return err
		}
		if d.IsDir() && slices.Contains(skipDirs, d.Name()) {
			return filepath.SkipDir
		}
		if filepath.Ext(d.Name()) == ".md" && d.Name() != "README.md" && d.Name() != "CLAUDE.md" {
			p, err := NewPost(path)
			if err == nil {
				posts = append(posts, p)
			}
		}
		return nil
	})
	if err != nil {
		return err
	}

	sideNavContent := r.renderSideNav(posts, "../../")

	for _, p := range posts {
		r.renderPost(p, sideNavContent)
	}

	r.renderHome(posts)
	return nil
}

func (r *Renderer) renderPost(p Post, sideNavContent string) {
	f, err := os.Open(p.Path)
	if err != nil {
		fmt.Printf("failed to open page '%s': %s\n", p.Path, err)
		return
	}
	defer f.Close()

	mdContent, err := io.ReadAll(f)
	if err != nil {
		fmt.Printf("failed to read file '%s': %s\n", p.Path, err)
		return
	}

	h := mdToHTML(mdContent)
	h = bytes.Replace(h, needleWatchAlongNoteInsert, r.contentWatchAlongNote, 1)

	data := PageData{
		Main: template.HTML(h),
		Nav:  template.HTML(sideNavContent),
	}

	var buf bytes.Buffer
	if err := r.tplPage.Execute(&buf, data); err != nil {
		fmt.Printf("failed to execute page template for '%s': %v\n", p.Path, err)
		return
	}

	err = writeFile(p.Link, buf.Bytes())
	if err != nil {
		fmt.Printf("failed to write file '%s': %s\n", p.Link, err)
		return
	}

	fmt.Printf("rendered: %s -> %s\n", p.Path, p.Link)
}

func (r *Renderer) renderSideNav(posts []Post, root string) string {
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

	// Create a copy to sort for navigation
	navPosts := make([]Post, len(posts))
	copy(navPosts, posts)

	sort.Slice(navPosts, func(i, j int) bool {
		if navPosts[i].Year != navPosts[j].Year {
			return navPosts[i].Year < navPosts[j].Year // Ascending order for years
		}

		getPriority := func(t string) int {
			tLower := strings.ToLower(t)
			if strings.Contains(tLower, "royal rumble") {
				return 1
			}
			if strings.Contains(tLower, "wrestlemania") {
				return 2
			}
			if strings.Contains(tLower, "summerslam") {
				return 3
			}
			if strings.Contains(tLower, "survivor series") {
				return 4
			}
			return 5
		}

		p1 := getPriority(navPosts[i].Title)
		p2 := getPriority(navPosts[j].Title)

		if p1 != p2 {
			return p1 < p2
		}

		return navPosts[i].Title < navPosts[j].Title
	})

	years := make(map[string][]string)

	for _, p := range navPosts {
		link := filepath.Join(root, p.Link)
		contentNav := strings.Replace(tplNavSingleLink, "{TITLE}", p.Title, 1)
		contentNav = strings.Replace(contentNav, "{LINK}", link, 1)

		yearLinks, ok := years[p.Year]
		if !ok {
			years[p.Year] = []string{contentNav}
		} else {
			years[p.Year] = append(yearLinks, contentNav)
		}
	}

	keys := make([]string, 0)
	for k := range years {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool {
		return keys[i] < keys[j] // ascending order
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

func (r *Renderer) renderHome(posts []Post) {
	sideNavContent := r.renderSideNav(posts, "")

	tplMain := `
	<article>
	<h3>{TITLE}</h3>
	<p class="pubdate">{DATE}</p>
	<ul class="actions">
	<li><a href="{LINK}" class="button">Read</a></li>
	</ul>
	</article>
	`

	var bufMain bytes.Buffer

	// Create a copy to sort for home page (Date Descending)
	homePosts := make([]Post, 0, len(posts))
	for _, p := range posts {
		if p.Year != "index" {
			homePosts = append(homePosts, p)
		}
	}

	sort.Slice(homePosts, func(i, j int) bool {
		return homePosts[j].Date.Before(homePosts[i].Date) // Descending order
	})

	for _, p := range homePosts {
		contentMain := strings.Replace(tplMain, "{TITLE}", p.Title, 1)
		contentMain = strings.Replace(contentMain, "{LINK}", p.Link, 1)
		contentMain = strings.Replace(contentMain, "{DATE}", p.Date.Format("2006-01-02"), 1)
		_, _ = bufMain.WriteString(contentMain)
	}

	data := PageData{
		Main: template.HTML(bufMain.String()),
		Nav:  template.HTML(sideNavContent),
	}

	var bufIndex bytes.Buffer
	if err := r.tplHome.Execute(&bufIndex, data); err != nil {
		fmt.Printf("failed to execute index template: %v\n", err)
		return
	}

	err := writeFile("index.html", bufIndex.Bytes())
	if err != nil {
		fmt.Printf("failed to write index file: %s\n", err)
		return
	}

	fmt.Printf("rendered: index.tpl -> index.html\n")
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
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	p := parser.NewWithExtensions(extensions)
	doc := p.Parse(md)

	htmlFlags := html.CommonFlags | html.HrefTargetBlank | html.TOC | html.LazyLoadImages
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)

	return markdown.Render(doc, renderer)
}

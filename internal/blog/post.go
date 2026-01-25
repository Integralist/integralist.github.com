package blog

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

var caser = cases.Title(language.BritishEnglish)

type Post struct {
	Path  string
	Title string
	Date  time.Time
	Year  string
	Link  string // Relative link from project root, e.g., "posts/royal-rumble-1988/index.html"
}

func NewPost(path string) (Post, error) {
	segs := strings.Split(path, "/")
	if len(segs) < 3 {
		return Post{}, fmt.Errorf("invalid path structure: %s", path)
	}
	dir := segs[0] + "/" + segs[1]
	dateStr := strings.Split(segs[2], ".")[0]

	// Handle non-date filenames (e.g., pages/about/index.md -> about/index)
	var date time.Time
	var year string
	// Existing logic splits dateStr to get year.
	if strings.Contains(dateStr, "-") {
		var err error
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			// If parse fails, date is zero time.
			// Maybe log it? For now, we proceed as existing logic did (sort of).
			// Existing logic actually ignored errors but expected ISO format for sorting.
		}
		year = strings.Split(dateStr, "-")[0]
	} else {
		// e.g. "index"
		year = dateStr
	}

	title := strings.ReplaceAll(caser.String(segs[1]), "-", " ")
	link := filepath.Join(dir, "index.html")

	return Post{
		Path:  path,
		Title: title,
		Date:  date,
		Year:  year,
		Link:  link,
	}, nil
}

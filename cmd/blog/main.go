package main

import (
	"log"

	"github.com/integralist/integralist.github.com/internal/blog"
)

func main() {
	renderer, err := blog.NewRenderer()
	if err != nil {
		log.Fatalf("failed to initialize renderer: %v", err)
	}

	if err := renderer.Generate("."); err != nil {
		log.Fatalf("failed to generate blog: %v", err)
	}
}
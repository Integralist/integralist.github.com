package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func main() {
	// Set the root directory (current directory)
	rootDir := "."

	// Process all `.tpl.html` files in the current directory recursively
	err := processTemplateFiles(rootDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("All template files processed successfully.")
}

// Function to read a file and replace `#include` directives
func processIncludes(filePath string) (string, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read file %s: %v", filePath, err)
	}

	// Convert content to a string
	htmlContent := string(content)

	// Regular expression to match the `#include` directive
	includeRegex := regexp.MustCompile(`<!--\s*#include\s+(\S+)\s*-->`)

	// Find all matches of the `#include` directive
	matches := includeRegex.FindAllStringSubmatch(htmlContent, -1)

	for _, match := range matches {
		if len(match) > 1 {
			includeFile := match[1]

			// Resolve the included file's path relative to the current file
			includePath := filepath.Join(filepath.Dir(filePath), includeFile)

			// Read the included file
			includedContent, err := processIncludes(includePath) // Recursive processing
			if err != nil {
				return "", fmt.Errorf("failed to process include file %s: %v", includePath, err)
			}

			// Replace the `#include` directive with the included content
			htmlContent = strings.Replace(htmlContent, match[0], includedContent, 1)
		}
	}

	return htmlContent, nil
}

// Function to process all `.tpl.html` files in the directory recursively
func processTemplateFiles(rootDir string) error {
	// Walk through the directory recursively
	return filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip the `includes` directory
		if info.IsDir() && strings.Contains(path, "includes") {
			return filepath.SkipDir
		}

		// Process only `.tpl.html` files
		if strings.HasSuffix(info.Name(), ".tpl.html") {
			fmt.Printf("Processing template file: %s\n", path)

			// Process includes in the template file
			finalContent, err := processIncludes(path)
			if err != nil {
				return fmt.Errorf("error processing template file %s: %v", path, err)
			}

			// Generate the new file name by removing the `.tpl` part
			newFileName := strings.Replace(path, ".tpl.html", ".html", 1)

			// Write the final content to the new file
			err = os.WriteFile(newFileName, []byte(finalContent), 0o644)
			if err != nil {
				return fmt.Errorf("failed to write file %s: %v", newFileName, err)
			}

			fmt.Printf("Generated file: %s\n", newFileName)
		}
		return nil
	})
}

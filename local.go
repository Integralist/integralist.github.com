package main

import (
	"log"
	"net/http"
)

func main() {
	// Set the directory to serve files from.
	// "." represents the current directory.
	http.Handle("/", http.FileServer(http.Dir(".")))

	// Define the port to listen on
	port := "8080"
	log.Printf("Starting server on http://localhost:%s\n", port)

	// Start the server
	// #nosec G114 not production code
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

SERVER_CMD = go run local.go
WATCH_CMD = fswatch -o -e ".*" -i "\\.html$$" -i "\\.tpl$$" -i "\\.css$$" -r ./images . | xargs -n1 -I{} sh -c 'kill $$SERVER_PID; $(SERVER_CMD) & SERVER_PID=$$!; sleep 1; open http://localhost:8080'

# Default target
.PHONY: all
all: run

# Run the server, start watching for file changes, and open the browser
.PHONY: run
run:
	@echo "Starting server..."
	$(SERVER_CMD) & SERVER_PID=$$!
	@sleep 1
	@open http://localhost:8080
	@echo "Watching for changes..."
	$(WATCH_CMD)

.PHONY: clean test

SERVER_CMD = go run local.go
WATCH_CMD = fswatch -o -e ".*" -i "\\.html$$" -i "\\.tpl.html$$" -i "\\.css$$" -r ./images . | xargs -n1 -I{} sh -c 'kill $$SERVER_PID; $(SERVER_CMD) & SERVER_PID=$$!; sleep 2; open http://localhost:8080'

# Default target
.PHONY: all
all: run

# Run the server, start watching for file changes, and open the browser
.PHONY: run
run:
	@$(MAKE) build
	@echo "Starting server..."
	$(SERVER_CMD) & SERVER_PID=$$!
	@sleep 1
	@open http://localhost:8080
	# @echo "Watching for changes..."
	# $(WATCH_CMD)

.PHONY: build
build:
	go run build.go

.PHONY: clean test

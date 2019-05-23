RESET_TARGET := upstream/master
override PKGS := $(shell go list ./... | grep -v /vendor/)
override BRANCH := $(shell sh -c "git branch | sed -n 's|* \(.*\)|\1|p'")
override STAGED_GO_FILES := $(shell git diff --name-only --cached | grep -E ".*.go")

.PHONY: squash format fmt dep test docker/test

# Self-documenting help table that prints targets and same line comments with ## prefix
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# Error definition if $(COMMIT) not provided
ifeq ($(COMMIT),)
squash:
	@echo "COMMIT=<COMMIT> not provided. Exiting..."
	@exit 1
else
# Assuming PR is ready, everything added as intended, no conflicts
squash: docker/test format ## Runs dockerized test, formats, and squashes commits. Override RESET_TARGET='upstream/master' if necessary
	git reset --soft $(RESET_TARGET)
	git commit -m "$(COMMIT)"
	git log -n 2
endif

format: ## Runs `go fmt` on non-vendor go packages
	go fmt $(PKGS)
	@echo "Adding back all files that have been formatted"
	@echo $(STAGED_GO_FILES) | xargs -I {} git add {}

fmt: format ## Alias for `make format`

dep: ## Runs `dep ensure -v`
	dep ensure -v

test: ## Runs `go test -count=1 -race -v ./pkg/...`
	go test -count=1 -race -v ./pkg/...

docker/test: ## Runs test dockerfiles
	docker build -f Dockerfile_race_test .
	docker build -f Dockerfile_test .
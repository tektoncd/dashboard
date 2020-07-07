
FROM golang as goBuilder

ARG GOARCH=amd64

USER root
WORKDIR /work
COPY . .
RUN GO111MODULE=on CGO_ENABLED=0 GOOS=linux GOARCH=$GOARCH go build ./cmd/build-maker

FROM alpine

WORKDIR /work
COPY --from=goBuilder /work/build-maker .

ENTRYPOINT ["./build-maker"]

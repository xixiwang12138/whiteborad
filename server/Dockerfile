FROM golang:1.19.1-bullseye

WORKDIR /usr/local/go/src/project

COPY . .


RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.cn,direct

RUN go mod download

# CGO_ENABLED禁用cgo 然后指定OS等，并go build
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o borad main.go


EXPOSE 10300 10400
CMD ["./borad"]
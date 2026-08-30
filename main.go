package main

import (
	"embed"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

type LocalFileLoader struct{}

func (h *LocalFileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	path := req.URL.Path
	if strings.HasPrefix(path, "/") {
		path = path[1:]
	}
	
	if strings.HasPrefix(path, "stream/") {
		filePath := strings.TrimPrefix(path, "stream/")
		filePath, _ = url.PathUnescape(filePath)

		file, err := os.Open(filePath)
		if err != nil {
			res.WriteHeader(http.StatusNotFound)
			return
		}
		defer file.Close()

		stat, err := file.Stat()
		if err != nil {
			res.WriteHeader(http.StatusInternalServerError)
			return
		}

		http.ServeContent(res, req, stat.Name(), stat.ModTime(), file)
		return
	}
	
	res.WriteHeader(http.StatusNotFound)
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "EZFF",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: &LocalFileLoader{},
		},
		BackgroundColour: &options.RGBA{R: 15, G: 17, B: 21, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop:     true,
			DisableWebViewDrop: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

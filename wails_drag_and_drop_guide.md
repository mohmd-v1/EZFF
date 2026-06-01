# Wails Drag & Drop File Support

## Overview

Wails provides built-in support for drag-and-drop file handling on desktop platforms such as Windows, Linux, and macOS.

This feature allows users to drag files from the operating system directly into the application window.

Main features:

- Enable file drag-and-drop support
- Receive dropped file paths
- Create custom drop zones
- Highlight active drop targets
- Listen globally or on specific elements
- Disable native WebView file opening behavior
- Remove listeners when no longer needed

---

# Requirements

- Wails v2
- Frontend framework (React, Vue, Svelte, Vanilla JS, etc.)
- Go backend

Official documentation:

- https://wails.io/docs/reference/options/#drag-and-drop
- https://wails.io/docs/reference/options/#enablefiledrop
- https://wails.io/docs/reference/runtime/draganddrop/#onfiledrop
- https://wails.io/docs/reference/runtime/draganddrop/#onfiledropoff

---

# Backend Configuration (Go)

File drag-and-drop must be enabled inside `options.App`.

Example:

```go
package main

import (
    "github.com/wailsapp/wails/v2"
    "github.com/wailsapp/wails/v2/pkg/options"
)

func main() {

    err := wails.Run(&options.App{
        Title:  "My App",
        Width:  1000,
        Height: 700,

        DragAndDrop: &options.DragAndDrop{
            EnableFileDrop:     true,
            DisableWebViewDrop: true,
        },
    })

    if err != nil {
        println("Error:", err.Error())
    }
}
```

---

# DragAndDrop Options

## EnableFileDrop

```go
EnableFileDrop: true
```

Enables drag-and-drop file support.

Without this option, file dropping will not work.

---

## DisableWebViewDrop

```go
DisableWebViewDrop: true
```

Recommended on Windows.

Prevents the embedded WebView from trying to open dropped files internally.

Without this option:
- the WebView may navigate to the dropped file
- images/videos may open directly
- drag-and-drop events may not reach your app

Recommended value:

```go
DisableWebViewDrop: true
```

---

# Frontend Runtime API

Import runtime functions:

```js
import { OnFileDrop, OnFileDropOff } from "../wailsjs/runtime/runtime";
```

---

# Listening for File Drops

Basic example:

```js
OnFileDrop((x, y, paths) => {

    console.log("Mouse Position:", x, y);

    console.log("Dropped Files:");
    console.log(paths);

}, false);
```

Parameters:

| Parameter | Description |
|---|---|
| x | Mouse X position |
| y | Mouse Y position |
| paths | Array of full file paths |

Example output:

```js
[
  "C:\\Users\\User\\Videos\\video.mp4",
  "C:\\Users\\User\\Pictures\\image.png"
]
```

---

# Global Window Drop

```js
OnFileDrop(callback, false);
```

When the second argument is `false`, drops are accepted anywhere in the window.

---

# Drop Target Mode

```js
OnFileDrop(callback, true);
```

When the second argument is `true`, Wails enables drop target mode.

In this mode:
- only elements marked as drop targets will accept drops
- active targets receive a CSS class automatically

---

# Creating Drop Zones

HTML:

```html
<div id="dropzone">
    Drop files here
</div>
```

CSS:

```css
#dropzone {
    width: 400px;
    height: 200px;
    border: 2px dashed #888;

    --wails-drop-target: drop;
}
```

Important CSS variable:

```css
--wails-drop-target: drop;
```

This tells Wails that the element is a valid drop target.

---

# Active Drop Styling

While dragging files over a valid target, Wails automatically adds:

```css
.wails-drop-target-active
```

Example styling:

```css
.wails-drop-target-active {
    border-color: lime;
    background: rgba(0,255,0,0.1);
}
```

Useful for:
- hover effects
- visual feedback
- animations
- highlighting upload areas

---

# Removing File Drop Listeners

To remove listeners:

```js
OnFileDropOff();
```

Useful when:
- changing pages
- destroying components
- cleaning up event listeners

---

# Full Example

## Backend

```go
package main

import (
    "github.com/wailsapp/wails/v2"
    "github.com/wailsapp/wails/v2/pkg/options"
)

func main() {

    err := wails.Run(&options.App{
        Title: "DragDrop Demo",

        DragAndDrop: &options.DragAndDrop{
            EnableFileDrop: true,
            DisableWebViewDrop: true,
        },
    })

    if err != nil {
        println(err.Error())
    }
}
```

---

## Frontend

### HTML

```html
<div id="dropzone">
    Drag files here
</div>
```

### CSS

```css
#dropzone {
    width: 400px;
    height: 200px;

    border: 3px dashed gray;

    display: flex;
    align-items: center;
    justify-content: center;

    --wails-drop-target: drop;
}

.wails-drop-target-active {
    border-color: #00ff00;
}
```

### JavaScript

```js
import { OnFileDrop } from "../wailsjs/runtime/runtime";

OnFileDrop((x, y, paths) => {

    alert(paths.join("\n"));

}, true);
```

---

# Windows-Specific Notes

## Administrator Permission Issue

On Windows, drag-and-drop may fail if:

- the Wails app runs as Administrator
- but Windows Explorer runs normally

Windows blocks drag-and-drop between processes with different privilege levels.

Solutions:

### Option 1 (Recommended)

Run the Wails app normally (without Administrator).

### Option 2

Run Explorer as Administrator too.

---

# Handling Multiple Files

`paths` is always an array.

Example:

```js
OnFileDrop((x, y, paths) => {

    paths.forEach(path => {
        console.log(path);
    });

}, true);
```

---

# Filtering File Types

Example:

```js
OnFileDrop((x, y, paths) => {

    const videos = paths.filter(path =>
        path.endsWith(".mp4") ||
        path.endsWith(".mkv")
    );

    console.log(videos);

}, true);
```

---

# Detecting Folders

Example:

```js
OnFileDrop((x, y, paths) => {

    console.log(paths);

}, true);
```

Use backend filesystem checks to determine whether each path is:
- a file
- a folder

---

# Sending Paths to Go Backend

Example frontend:

```js
import { ProcessFiles } from "../wailsjs/go/main/App";

OnFileDrop((x, y, paths) => {

    ProcessFiles(paths);

}, true);
```

Example backend:

```go
func (a *App) ProcessFiles(paths []string) {

    for _, path := range paths {
        println(path)
    }
}
```

---

# Recommended Settings

Recommended configuration for most applications:

```go
DragAndDrop: &options.DragAndDrop{
    EnableFileDrop:     true,
    DisableWebViewDrop: true,
}
```

Recommended frontend listener:

```js
OnFileDrop(callback, true);
```

Recommended drop zone CSS:

```css
--wails-drop-target: drop;
```

---

# Common Use Cases

- Video editors
- Media players
- File upload tools
- Download managers
- Image viewers
- yt-dlp GUI applications
- Torrent managers
- Subtitle tools
- Playlist editors

---

# Common Problems

## Files open inside the app instead of triggering events

Cause:
- `DisableWebViewDrop` is false

Fix:

```go
DisableWebViewDrop: true
```

---

## Drag-and-drop works everywhere

Cause:
- using:

```js
OnFileDrop(callback, false)
```

Fix:
- use `true`
- define custom drop targets

---

## Drop zone does not activate

Cause:
- missing CSS variable

Fix:

```css
--wails-drop-target: drop;
```

---

# Official Documentation

Wails Documentation:

- https://wails.io/docs/reference/options/#drag-and-drop
- https://wails.io/docs/reference/options/#enablefiledrop
- https://wails.io/docs/reference/runtime/draganddrop/#onfiledrop
- https://wails.io/docs/reference/runtime/draganddrop/#onfiledropoff

---

# Summary

To enable drag-and-drop in Wails:

1. Enable `EnableFileDrop`
2. Recommended: set `DisableWebViewDrop`
3. Use `OnFileDrop()`
4. Create drop targets with:
   ```css
   --wails-drop-target: drop;
   ```
5. Optionally style:
   ```css
   .wails-drop-target-active
   ```

This provides a modern native drag-and-drop experience for desktop applications built with Wails.

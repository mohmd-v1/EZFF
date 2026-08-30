package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx            context.Context
	outputMode     string
	fixedOutputDir string
	activeCmd      *exec.Cmd
	cmdMu          sync.Mutex
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved so we can call Wails runtime methods.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.loadSettings()
}

// SelectFile opens a native system file selector for media files
func (a *App) SelectFile() (string, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Media/Subtitle File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "All Supported Formats (*.mp4, *.mkv, *.mp3, *.srt, *.ass, *.vtt, ...)",
				Pattern:     "*.mp4;*.mkv;*.avi;*.mov;*.mp3;*.wav;*.flac;*.m4a;*.webm;*.opus;*.ogg;*.srt;*.ass;*.vtt;*.ssa",
			},
			{
				DisplayName: "Subtitle Files (*.srt, *.ass, *.vtt, *.ssa)",
				Pattern:     "*.srt;*.ass;*.vtt;*.ssa",
			},
			{
				DisplayName: "Media Files (*.mp4, *.mkv, *.avi, *.mov, *.mp3, *.wav, *.flac)",
				Pattern:     "*.mp4;*.mkv;*.avi;*.mov;*.mp3;*.wav;*.flac;*.m4a;*.webm;*.opus;*.ogg",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return "", err
	}
	return filePath, nil
}

// SelectMultipleFiles opens a native system file selector for selecting multiple media files
func (a *App) SelectMultipleFiles() ([]string, error) {
	filePaths, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Multiple Media Files",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "All Supported Formats (*.mp4, *.mkv, *.mp3, *.srt, *.ass, *.vtt, ...)",
				Pattern:     "*.mp4;*.mkv;*.avi;*.mov;*.mp3;*.wav;*.flac;*.m4a;*.webm;*.opus;*.ogg;*.srt;*.ass;*.vtt;*.ssa",
			},
			{
				DisplayName: "Media Files (*.mp4, *.mkv, *.avi, *.mov, *.mp3, *.wav, *.flac)",
				Pattern:     "*.mp4;*.mkv;*.avi;*.mov;*.mp3;*.wav;*.flac;*.m4a;*.webm;*.opus;*.ogg",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return nil, err
	}
	return filePaths, nil
}

// GetMediaInfo runs ffprobe to retrieve JSON metadata for a media file without flashing command prompts
func (a *App) GetMediaInfo(filePath string) (string, error) {
	// Execute ffprobe with hidden window setting to prevent terminal flashing on Windows
	cmd := exec.Command("ffprobe",
		"-v", "quiet",
		"-print_format", "json",
		"-show_format",
		"-show_streams",
		filePath,
	)

	// Hide cmd popup on Windows
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	var stdout strings.Builder
	var stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("failed to run ffprobe: %v (details: %s)", err, stderr.String())
	}

	return stdout.String(), nil
}

// runCommandWithProgress executes an FFmpeg command and reports progress in real-time
func (a *App) runCommandWithProgress(name string, args []string, totalDuration float64) error {
	cmd := exec.Command(name, args...)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	// Register active command safely
	a.cmdMu.Lock()
	a.activeCmd = cmd
	a.cmdMu.Unlock()

	defer func() {
		a.cmdMu.Lock()
		if a.activeCmd == cmd {
			a.activeCmd = nil
		}
		a.cmdMu.Unlock()
	}()

	// Scanner with custom carriage return split function to read updates in real-time
	scanner := bufio.NewScanner(stderrPipe)
	scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
		if atEOF && len(data) == 0 {
			return 0, nil, nil
		}
		for i := 0; i < len(data); i++ {
			if data[i] == '\r' || data[i] == '\n' {
				return i + 1, data[0:i], nil
			}
		}
		if atEOF {
			return len(data), data, nil
		}
		return 0, nil, nil
	})

	var stderrOutput strings.Builder
	for scanner.Scan() {
		line := scanner.Text()
		stderrOutput.WriteString(line + "\n")

		// Parse time= to calculate progress percentage
		if idx := strings.Index(line, "time="); idx != -1 {
			timePart := line[idx+5:]
			if spaceIdx := strings.Index(timePart, " "); spaceIdx != -1 {
				timePart = timePart[:spaceIdx]
			}
			currentSeconds := parseDuration(timePart)
			if totalDuration > 0 {
				percentage := (currentSeconds / totalDuration) * 100
				if percentage > 100 {
					percentage = 100
				}
				if percentage < 0 {
					percentage = 0
				}
				// Emit real-time progress to frontend
				runtime.EventsEmit(a.ctx, "progress", percentage)
			}
		}
	}

	err = cmd.Wait()
	if err != nil {
		return fmt.Errorf("%v (logs: %s)", err, stderrOutput.String())
	}

	// Emit final 100% progress
	runtime.EventsEmit(a.ctx, "progress", 100.0)
	return nil
}

// CancelActiveCommand terminates the currently running FFmpeg command
func (a *App) CancelActiveCommand() error {
	a.cmdMu.Lock()
	defer a.cmdMu.Unlock()

	if a.activeCmd == nil {
		return fmt.Errorf("no active command is currently running")
	}

	if a.activeCmd.Process != nil {
		// Use native Process.Kill()
		err := a.activeCmd.Process.Kill()
		if err != nil {
			// Fallback to taskkill on Windows to ensure process tree is killed
			_ = exec.Command("taskkill", "/F", "/T", "/PID", strconv.Itoa(a.activeCmd.Process.Pid)).Run()
			return err
		}
	}

	a.activeCmd = nil
	return nil
}

// Helper to parse time= string (HH:MM:SS.xx) to seconds
func parseDuration(timeStr string) float64 {
	timeStr = strings.TrimSpace(timeStr)
	parts := strings.Split(timeStr, ":")
	if len(parts) < 3 {
		if s, err := strconv.ParseFloat(timeStr, 64); err == nil {
			return s
		}
		return 0
	}
	hours, _ := strconv.ParseFloat(parts[0], 64)
	minutes, _ := strconv.ParseFloat(parts[1], 64)
	seconds, _ := strconv.ParseFloat(parts[2], 64)
	return hours*3600 + minutes*60 + seconds
}

// ExtractStream prompts the user to save a file and runs FFmpeg to extract a specific stream with progress monitoring
func (a *App) ExtractStream(inputPath string, streamIndex int, streamType string, extension string, totalDuration float64) (string, error) {
	// Prepare default file name: inputName_streamX.ext
	baseName := filepath.Base(inputPath)
	ext := filepath.Ext(inputPath)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)
	defaultFilename := fmt.Sprintf("%s_stream%d.%s", nameWithoutExt, streamIndex, extension)

	// Set dialog filters
	var filterPattern string
	var filterName string
	switch streamType {
	case "video":
		filterPattern = "*." + extension
		filterName = fmt.Sprintf("Video File (*.%s)", extension)
	case "audio":
		filterPattern = "*." + extension
		filterName = fmt.Sprintf("Audio File (*.%s)", extension)
	case "subtitle":
		filterPattern = "*." + extension
		filterName = fmt.Sprintf("Subtitle File (*.%s)", extension)
	case "image":
		filterPattern = "*." + extension
		filterName = fmt.Sprintf("Image File (*.%s)", extension)
	default:
		filterPattern = "*." + extension
		filterName = fmt.Sprintf("Output File (*.%s)", extension)
	}
	outputPath, err := a.getOutputPath("Save Extracted Stream", defaultFilename, filterName, filterPattern, inputPath)
	if err != nil {
		return "", err
	}
	if outputPath == "" {
		return "", fmt.Errorf("extraction cancelled by user")
	}

	// Try extracting with instant stream copy (-c copy)
	args := []string{"-y", "-i", inputPath, "-map", fmt.Sprintf("0:%d", streamIndex), "-c", "copy", outputPath}
	err = a.runCommandWithProgress("ffmpeg", args, totalDuration)
	if err != nil {
		return "", fmt.Errorf("Lossless stream extraction failed due to container/codec incompatibility!\n\nThis usually happens when the selected output format doesn't support the raw codec of this stream (e.g. trying to put FLAC/PCM or subtitle codecs into an MP4 container losslessly).\n\nDetails: %v", err)
	}

	return outputPath, nil
}

// RemuxFile prompts the user to save and converts/remuxes the whole file to a new container with progress monitoring
func (a *App) RemuxFile(inputPath string, extension string, totalDuration float64) (string, error) {
	// Prepare default name
	baseName := filepath.Base(inputPath)
	ext := filepath.Ext(inputPath)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)
	defaultFilename := fmt.Sprintf("%s_converted.%s", nameWithoutExt, extension)

	outputPath, err := a.getOutputPath("Save Converted File", defaultFilename, fmt.Sprintf("Media File (*.%s)", extension), "*."+extension, inputPath)
	if err != nil {
		return "", err
	}
	if outputPath == "" {
		return "", fmt.Errorf("conversion cancelled by user")
	}

	// Try with stream copy (-c copy)
	args := []string{"-y", "-i", inputPath, "-c", "copy", outputPath}
	err = a.runCommandWithProgress("ffmpeg", args, totalDuration)
	if err != nil {
		return "", fmt.Errorf("Lossless remuxing failed due to codec/container incompatibility!\n\nThis container format doesn't support one or more of the codecs in the source file without re-encoding.\n\nTip: Matroska (.mkv) is the most flexible container and supports almost any codec losslessly, while MP4 is more restricted.\n\nDetails: %v", err)
	}

	return outputPath, nil
}

// InjectStream maps all streams from a base file and injects the streams from another file losslessly
func (a *App) InjectStream(basePath string, injectPath string, totalDuration float64) (string, error) {
	// Prepare default output filename
	baseName := filepath.Base(basePath)
	ext := filepath.Ext(basePath)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)
	defaultFilename := fmt.Sprintf("%s_injected%s", nameWithoutExt, ext)

	outputPath, err := a.getOutputPath("Save Injected Media File", defaultFilename, fmt.Sprintf("Media File (*%s)", ext), "*"+ext, basePath)
	if err != nil {
		return "", err
	}
	if outputPath == "" {
		return "", fmt.Errorf("injection cancelled by user")
	}

	injectExt := strings.ToLower(filepath.Ext(injectPath))
	outExt := strings.ToLower(filepath.Ext(outputPath))

	var args []string
	isSubtitle := injectExt == ".srt" || injectExt == ".ass" || injectExt == ".ssa" || injectExt == ".vtt"

	if isSubtitle {
		if outExt == ".mp4" || outExt == ".m4v" {
			// MP4 requires mov_text for subtitle codec
			args = []string{"-y", "-i", basePath, "-i", injectPath, "-map", "0", "-map", "1", "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text", outputPath}
		} else {
			// MKV and others support direct copy
			args = []string{"-y", "-i", basePath, "-i", injectPath, "-map", "0", "-map", "1", "-c", "copy", outputPath}
		}
	} else {
		// Regular audio/video injection
		args = []string{"-y", "-i", basePath, "-i", injectPath, "-map", "0", "-map", "1", "-c", "copy", outputPath}
	}

	err = a.runCommandWithProgress("ffmpeg", args, totalDuration)
	if err != nil {
		return "", fmt.Errorf("Lossless stream injection failed due to codec/container incompatibility!\n\nThis container format doesn't support combining these codecs losslessly.\n\nTips:\n- MP4 does not support raw SRT/ASS subtitles losslessly without converting them to 'mov_text' (which we attempt, but may fail if the stream formats conflict).\n- MKV supports almost all subtitles and audio tracks losslessly.\n\nDetails: %v", err)
	}

	return outputPath, nil
}

// ConcatFiles concatenates multiple media files losslessly using FFmpeg concat filter list
func (a *App) ConcatFiles(inputPaths []string, totalDuration float64) (string, error) {
	if len(inputPaths) == 0 {
		return "", fmt.Errorf("no input files provided")
	}

	// Create list.txt file in the directory of the first input file
	firstPath := inputPaths[0]
	firstDir := filepath.Dir(firstPath)
	ext := filepath.Ext(firstPath)
	baseName := filepath.Base(firstPath)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)
	defaultFilename := fmt.Sprintf("%s_merged%s", nameWithoutExt, ext)

	outputPath, err := a.getOutputPath("Save Merged Media File", defaultFilename, fmt.Sprintf("Merged File (*%s)", ext), "*"+ext, firstPath)
	if err != nil {
		return "", err
	}
	if outputPath == "" {
		return "", fmt.Errorf("merging cancelled by user")
	}

	// Create temporary list file
	listFilePath := filepath.Join(firstDir, "easy_ffmpeg_concat_list.txt")
	listFile, err := os.Create(listFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to create temporary concat list file: %v", err)
	}

	// Write entries to list file (paths must use single forward slashes on Windows for FFmpeg compatibility)
	for _, path := range inputPaths {
		normalizedPath := filepath.ToSlash(path)
		// Escape single quotes for FFmpeg's concat syntax
		escapedPath := strings.ReplaceAll(normalizedPath, "'", "'\\''")
		_, err := listFile.WriteString(fmt.Sprintf("file '%s'\n", escapedPath))
		if err != nil {
			listFile.Close()
			os.Remove(listFilePath)
			return "", fmt.Errorf("failed writing entry to list file: %v", err)
		}
	}
	listFile.Close()

	// Run ffmpeg: ffmpeg -y -f concat -safe 0 -i listFilePath -c copy outputPath
	args := []string{"-y", "-f", "concat", "-safe", "0", "-i", listFilePath, "-c", "copy", outputPath}
	err = a.runCommandWithProgress("ffmpeg", args, totalDuration)
	
	// Clean up list file
	os.Remove(listFilePath)

	if err != nil {
		return "", fmt.Errorf("merging failed: %v", err)
	}

	return outputPath, nil
}

// TranscodeFile handles professional video/audio encoding with CBR, VBR, and CRF rate control options
func (a *App) TranscodeFile(
	inputPath string,
	vCodec string,
	vRateMode string,
	vBitrate string,
	vMaxBitrate string,
	vCrf int,
	resolution string,
	fps string,
	aspectRatio string,
	vPreset string,
	aCodec string,
	aRateMode string,
	aBitrate string,
	aVbrQuality string,
	audioChannels string,
	targetFormat string,
	staticImagePath string,
	startTime string,
	endTime string,
	seekMode string,
	avoidNegativeTs bool,
	cropFilter string,
	outputPathOverride string,
	totalDuration float64,
) (string, error) {
	// Prepare default name
	baseName := filepath.Base(inputPath)
	ext := filepath.Ext(inputPath)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)

	// Determine output container format extension
	targetExt := strings.ToLower(strings.TrimSpace(targetFormat))
	if targetExt == "original" || targetExt == "" {
		targetExt = strings.TrimPrefix(strings.ToLower(ext), ".")
		if targetExt == "" {
			targetExt = "mp4"
		}
	}

	defaultFilename := fmt.Sprintf("%s_encoded.%s", nameWithoutExt, targetExt)

	var outputPath string
	var err error
	if outputPathOverride != "" {
		outputPath = outputPathOverride
	} else {
		outputPath, err = a.getOutputPath("Save Customized Encode", defaultFilename, fmt.Sprintf("Media File (*.%s)", targetExt), "*."+targetExt, inputPath)
		if err != nil {
			return "", err
		}
		if outputPath == "" {
			return "", fmt.Errorf("encoding cancelled by user")
		}
	}

	// Build FFmpeg command
	var args []string
	args = append(args, "-y")
	
	if avoidNegativeTs && startTime != "" && endTime != "" {
		args = append(args, "-avoid_negative_ts", "make_zero")
	}

	if staticImagePath != "" {
		if fps != "original" && fps != "" {
			args = append(args, "-framerate", fps)
		} else {
			args = append(args, "-framerate", "1")
		}
		
		if startTime != "" && endTime != "" && seekMode == "fast" {
			args = append(args, "-ss", startTime, "-to", endTime)
		}
		
		args = append(args, "-loop", "1", "-i", staticImagePath)
		
		if startTime != "" && endTime != "" && seekMode != "fast" {
			args = append(args, "-ss", startTime, "-to", endTime)
		}
		args = append(args, "-i", inputPath)
		args = append(args, "-map", "0:v:0", "-map", "1:a:0")
	} else {
		if startTime != "" && endTime != "" {
			if seekMode == "fast" {
				args = append(args, "-ss", startTime, "-to", endTime, "-i", inputPath)
			} else {
				args = append(args, "-i", inputPath, "-ss", startTime, "-to", endTime)
			}
		} else {
			args = append(args, "-i", inputPath)
		}
	}

	// --- Video Configuration ---
	vCodecFinal := vCodec
	if staticImagePath != "" && (vCodec == "copy" || vCodec == "none") {
		vCodecFinal = "libx264"
	}

	if vCodecFinal == "copy" {
		args = append(args, "-c:v", "copy")
	} else if vCodecFinal == "none" {
		args = append(args, "-vn")
	} else {
		args = append(args, "-c:v", vCodecFinal)

		// Video filters (Resolution, Frame Rate & Crop)
		var videoFilters []string
		if cropFilter != "" {
			videoFilters = append(videoFilters, cropFilter)
		}
		if resolution != "original" && resolution != "" {
			videoFilters = append(videoFilters, "scale="+resolution)
		}
		if fps != "original" && fps != "" {
			videoFilters = append(videoFilters, "fps="+fps)
		}

		if len(videoFilters) > 0 {
			args = append(args, "-vf", strings.Join(videoFilters, ","))
		}

		// Aspect Ratio
		if aspectRatio != "original" && aspectRatio != "" {
			args = append(args, "-aspect", aspectRatio)
		}

		// Preset
		if vPreset != "none" && vPreset != "" {
			args = append(args, "-preset", vPreset)
		}

		// Rate Control Modes
		switch vRateMode {
		case "cbr":
			args = append(args, "-b:v", vBitrate)
			args = append(args, "-minrate", vBitrate)
			args = append(args, "-maxrate", vBitrate)
			bufSize := doubleBitrateStr(vBitrate)
			args = append(args, "-bufsize", bufSize)
		case "vbr":
			args = append(args, "-b:v", vBitrate)
			if vMaxBitrate != "" {
				args = append(args, "-maxrate", vMaxBitrate)
				bufSize := doubleBitrateStr(vMaxBitrate)
				args = append(args, "-bufsize", bufSize)
			}
		case "crf":
			args = append(args, "-crf", strconv.Itoa(vCrf))
		}

		// yuv420p is highly compatible for static image input videos
		if staticImagePath != "" {
			args = append(args, "-pix_fmt", "yuv420p")
		}
	}

	// --- Audio Configuration ---
	if aCodec == "copy" {
		args = append(args, "-c:a", "copy")
	} else if aCodec == "none" {
		args = append(args, "-an")
	} else {
		args = append(args, "-c:a", aCodec)

		// Audio Channels
		if audioChannels != "original" && audioChannels != "" {
			args = append(args, "-ac", audioChannels)
		}

		// Rate Control Modes
		if aRateMode == "cbr" {
			args = append(args, "-b:a", aBitrate)
		} else if aRateMode == "vbr" {
			if aCodec == "libopus" {
				args = append(args, "-b:a", aBitrate)
				args = append(args, "-vbr", "on")
			} else if aCodec == "aac" {
				// Map 0-9 slider values to AAC's native 2.0 - 0.1 quality range
				qualityMap := map[string]string{
					"0": "2.0", "1": "1.8", "2": "1.5", "3": "1.2", "4": "1.0",
					"5": "0.8", "6": "0.6", "7": "0.4", "8": "0.2", "9": "0.1",
				}
				qVal, ok := qualityMap[aVbrQuality]
				if !ok {
					qVal = "1.0"
				}
				args = append(args, "-q:a", qVal)
			} else {
				// For libmp3lame, 0-9 maps directly to VBR scale
				args = append(args, "-q:a", aVbrQuality)
			}
		}
	}

	if staticImagePath != "" {
		args = append(args, "-shortest")
	}

	// Append output path to arguments
	args = append(args, outputPath)

	// Execute FFmpeg transcode with real-time progress events
	err = a.runCommandWithProgress("ffmpeg", args, totalDuration)
	if err != nil {
		return "", fmt.Errorf("encoding failed: %v", err)
	}

	return outputPath, nil
}

// RunCustomCommand parses and runs a custom edited FFmpeg command string with progress reporting
func (a *App) RunCustomCommand(commandStr string, totalDuration float64) error {
	cmdName, args, err := a.parseCommandString(commandStr)
	if err != nil {
		return err
	}
	return a.runCommandWithProgress(cmdName, args, totalDuration)
}

// parseCommandString breaks a command line string into a list of arguments, respecting double quotes
func (a *App) parseCommandString(cmdStr string) (string, []string, error) {
	cmdStr = strings.TrimSpace(cmdStr)
	if strings.HasPrefix(strings.ToLower(cmdStr), "ffmpeg ") {
		cmdStr = cmdStr[7:]
	} else if strings.HasPrefix(strings.ToLower(cmdStr), "ffmpeg.exe ") {
		cmdStr = cmdStr[11:]
	}
	
	var args []string
	var current strings.Builder
	inQuotes := false
	
	for i := 0; i < len(cmdStr); i++ {
		r := cmdStr[i]
		if r == '"' {
			inQuotes = !inQuotes
		} else if r == ' ' && !inQuotes {
			if current.Len() > 0 {
				args = append(args, current.String())
				current.Reset()
			}
		} else {
			current.WriteByte(r)
		}
	}
	if current.Len() > 0 {
		args = append(args, current.String())
	}
	
	return "ffmpeg", args, nil
}

// doubleBitrateStr doubles the bitrate value helper for bufsize settings
func doubleBitrateStr(bitrateStr string) string {
	bitrateStr = strings.TrimSpace(strings.ToLower(bitrateStr))
	if strings.HasSuffix(bitrateStr, "m") {
		numStr := strings.TrimSuffix(bitrateStr, "m")
		if val, err := strconv.ParseFloat(numStr, 64); err == nil {
			return fmt.Sprintf("%.0fm", val*2)
		}
	} else if strings.HasSuffix(bitrateStr, "k") {
		numStr := strings.TrimSuffix(bitrateStr, "k")
		if val, err := strconv.ParseFloat(numStr, 64); err == nil {
			return fmt.Sprintf("%.0fk", val*2)
		}
	}
	return "12M"
}

// GetVideoThumbnail extracts a thumbnail from a video/audio file and returns it as a Base64-encoded Data URI
func (a *App) GetVideoThumbnail(videoPath string) (string, error) {
	ext := strings.ToLower(filepath.Ext(videoPath))
	isAudio := ext == ".mp3" || ext == ".m4a" || ext == ".flac" || ext == ".wav" || ext == ".ogg" || ext == ".opus"

	var args []string
	if isAudio {
		// Audio files with embedded cover art: do not seek, extract cover art directly!
		args = []string{"-y", "-i", videoPath, "-vframes", "1", "-f", "image2", "-c:v", "png", "pipe:1"}
	} else {
		// Standard video: try 1s mark first to avoid a potential black frame
		args = []string{"-y", "-ss", "00:00:01", "-i", videoPath, "-vframes", "1", "-f", "image2", "-c:v", "png", "pipe:1"}
	}

	cmd := exec.Command("ffmpeg", args...)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	
	var out bytes.Buffer
	cmd.Stdout = &out
	
	err := cmd.Run()
	if err != nil && !isAudio {
		// Fallback to 0s mark for video if 1s mark fails (e.g., very short video clip)
		args = []string{"-y", "-ss", "00:00:00", "-i", videoPath, "-vframes", "1", "-f", "image2", "-c:v", "png", "pipe:1"}
		cmd = exec.Command("ffmpeg", args...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		out.Reset()
		cmd.Stdout = &out
		err = cmd.Run()
	}
	
	if err != nil {
		return "", fmt.Errorf("failed to extract thumbnail: %v", err)
	}
	
	base64Str := base64.StdEncoding.EncodeToString(out.Bytes())
	return "data:image/png;base64," + base64Str, nil
}

// EZFFSettings defines output settings structure for persistence
type EZFFSettings struct {
	OutputMode     string `json:"outputMode"`
	FixedOutputDir string `json:"fixedOutputDir"`
}

func (a *App) getSettingsPath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ".ezff_settings.json"
	}
	return filepath.Join(home, ".ezff_settings.json")
}

func (a *App) loadSettings() {
	path := a.getSettingsPath()
	data, err := ioutil.ReadFile(path)
	if err == nil {
		var s EZFFSettings
		if err := json.Unmarshal(data, &s); err == nil {
			a.outputMode = s.OutputMode
			a.fixedOutputDir = s.FixedOutputDir
			return
		}
	}
	// Defaults if not existing
	a.outputMode = "ask"
	a.fixedOutputDir = ""
}

func (a *App) saveSettings() {
	path := a.getSettingsPath()
	s := EZFFSettings{
		OutputMode:     a.outputMode,
		FixedOutputDir: a.fixedOutputDir,
	}
	data, err := json.MarshalIndent(s, "", "  ")
	if err == nil {
		_ = ioutil.WriteFile(path, data, 0644)
	}
}

// SelectFolder opens a native system folder selector
func (a *App) SelectFolder() (string, error) {
	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Output Directory",
	})
	if err != nil {
		return "", err
	}
	return dir, nil
}

// GetOutputSettings retrieves the active output configuration
func (a *App) GetOutputSettings() (map[string]string, error) {
	return map[string]string{
		"outputMode":     a.outputMode,
		"fixedOutputDir": a.fixedOutputDir,
	}, nil
}

// SetOutputSettings saves and persists the output configuration
func (a *App) SetOutputSettings(mode string, customDir string) error {
	a.outputMode = mode
	a.fixedOutputDir = customDir
	a.saveSettings()
	return nil
}

// getOutputPath determines the target output path based on settings, or displays a dialog if needed
func (a *App) getOutputPath(title string, defaultFilename string, filterName string, filterPattern string, originalInputPath string) (string, error) {
	mode := a.outputMode
	if mode == "" {
		mode = "ask"
	}

	// 1. Same Directory as Original
	if mode == "same" && originalInputPath != "" {
		dir := filepath.Dir(originalInputPath)
		return filepath.Join(dir, defaultFilename), nil
	}

	// 2. Custom Fixed Directory
	if mode == "fixed" && a.fixedOutputDir != "" {
		if _, err := os.Stat(a.fixedOutputDir); err == nil {
			return filepath.Join(a.fixedOutputDir, defaultFilename), nil
		}
	}

	// 3. Fallback / Ask Every Time
	dir := ""
	if originalInputPath != "" {
		dir = filepath.Dir(originalInputPath)
	}
	outputPath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:            title,
		DefaultDirectory: dir,
		DefaultFilename:  defaultFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: filterName,
				Pattern:     filterPattern,
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return "", err
	}
	if outputPath == "" {
		return "", fmt.Errorf("operation cancelled by user")
	}
	return outputPath, nil
}

// CheckFFmpeg runs ffmpeg -version and returns the first line containing the version.
// If it fails, it returns an empty string.
func (a *App) CheckFFmpeg() string {
	cmd := exec.Command("ffmpeg", "-version")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	out, err := cmd.CombinedOutput()
	if err != nil {
		return ""
	}
	lines := strings.Split(string(out), "\n")
	if len(lines) > 0 {
		return strings.TrimSpace(lines[0])
	}
	return ""
}

// InstallFFmpegWindows runs the winget command to install FFmpeg on Windows via a visible terminal.
func (a *App) InstallFFmpegWindows() error {
	cmd := exec.Command("cmd", "/c", "winget install \"FFmpeg (Essentials Build)\" --accept-package-agreements --accept-source-agreements")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}

// SelectImageFile opens a native system file selector for images only
func (a *App) SelectImageFile() (string, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Background Image",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Image Files (*.jpg, *.jpeg, *.png, *.webp)",
				Pattern:     "*.jpg;*.jpeg;*.png;*.webp",
			},
		},
	})
	if err != nil {
		return "", err
	}
	return filePath, nil
}




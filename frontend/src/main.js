import './style.css';
import './app.css';

import { OnFileDrop, EventsOn } from '../wailsjs/runtime/runtime';
import { CheckFFmpeg, InstallFFmpegWindows, GetMediaInfo, SelectFile, SelectMultipleFiles, SelectImageFile, ExtractStream, RemuxFile, InjectStream, ConcatFiles, TranscodeFile, RunCustomCommand, GetVideoThumbnail, GetOutputSettings, SetOutputSettings, SelectFolder, CancelActiveCommand } from '../wailsjs/go/main/App';

// Cache DOM elements
const welcomePanel = document.getElementById('welcomePanel');
const loaderPanel = document.getElementById('loaderPanel');
const loaderText = document.getElementById('loaderText');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBarFill = document.getElementById('progressBarFill');
const progressBarText = document.getElementById('progressBarText');
const dashboardPanel = document.getElementById('dashboardPanel');
const concatPanel = document.getElementById('concatPanel');
const dropzone = document.getElementById('dropzone');
const browseBtn = document.getElementById('browseBtn');
const backBtn = document.getElementById('backBtn');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const toast = document.getElementById('toast');
const cancelProcessBtn = document.getElementById('cancelProcessBtn');

// Error Modal Elements
const errorModal = document.getElementById('errorModal');
const errorModalTitle = document.getElementById('errorModalTitle');
const errorModalMessage = document.getElementById('errorModalMessage');
const closeErrorModalBtn = document.getElementById('closeErrorModalBtn');
const closeErrorModalBtnSecondary = document.getElementById('closeErrorModalBtnSecondary');

// Video Thumbnail Elements
const videoThumbnailContainer = document.getElementById('videoThumbnailContainer');
const videoThumbnailImg = document.getElementById('videoThumbnailImg');

// Navigation Tabs Elements
const navAnalyzerBtn = document.getElementById('navAnalyzerBtn');
const navConcatBtn = document.getElementById('navConcatBtn');
const navEncoderBtn = document.getElementById('navEncoderBtn');

// Encoder Panel Elements
const encoderPanel = document.getElementById('encoderPanel');
const encSourceFileName = document.getElementById('encSourceFileName');
const encSourceDuration = document.getElementById('encSourceDuration');
const encSourceSize = document.getElementById('encSourceSize');
const encSourceCodec = document.getElementById('encSourceCodec');

const encVCodec = document.getElementById('encVCodec');
const modeCrfBtn = document.getElementById('modeCrfBtn');
const modeCbrBtn = document.getElementById('modeCbrBtn');
const modeVbrBtn = document.getElementById('modeVbrBtn');

const cardVRateCrf = document.getElementById('cardVRateCrf');
const crfSlider = document.getElementById('crfSlider');
const crfValueLabel = document.getElementById('crfValueLabel');
const crfDescription = document.getElementById('crfDescription');

const cardVRateCbr = document.getElementById('cardVRateCbr');
const cbrBitrateInput = document.getElementById('cbrBitrateInput');
const cbrBitrateSlider = document.getElementById('cbrBitrateSlider');

const cardVRateVbr = document.getElementById('cardVRateVbr');
const vbrAvgInput = document.getElementById('vbrAvgInput');
const vbrAvgSlider = document.getElementById('vbrAvgSlider');
const vbrMaxInput = document.getElementById('vbrMaxInput');
const vbrMaxSlider = document.getElementById('vbrMaxSlider');

const encACodec = document.getElementById('encACodec');
const audioModeCbrBtn = document.getElementById('audioModeCbrBtn');
const audioModeVbrBtn = document.getElementById('audioModeVbrBtn');

const cardARateCbr = document.getElementById('cardARateCbr');
const audioCbrSelect = document.getElementById('audioCbrSelect');

const cardARateVbr = document.getElementById('cardARateVbr');
const audioVbrSlider = document.getElementById('audioVbrSlider');
const audioVbrLabel = document.getElementById('audioVbrLabel');
const audioVbrDescription = document.getElementById('audioVbrDescription');

// Advanced Video Geometry and Container / Channels
const encResolution = document.getElementById('encResolution');
const encResolutionCustomContainer = document.getElementById('encResolutionCustomContainer');
const encResolutionCustom = document.getElementById('encResolutionCustom');
const encFps = document.getElementById('encFps');
const encFpsCustomContainer = document.getElementById('encFpsCustomContainer');
const encFpsCustom = document.getElementById('encFpsCustom');
const encAspectRatio = document.getElementById('encAspectRatio');
const encTargetFormat = document.getElementById('encTargetFormat');
const encAudioChannels = document.getElementById('encAudioChannels');

const startTranscodeBtn = document.getElementById('startTranscodeBtn');
const globalShowCmdBtn = document.getElementById('globalShowCmdBtn');

// Command Modal Elements
const cmdModal = document.getElementById('cmdModal');
const cmdPreText = document.getElementById('cmdPreText');
const closeCmdModalBtn = document.getElementById('closeCmdModalBtn');
const closeCmdModalBtnSecondary = document.getElementById('closeCmdModalBtnSecondary');
const copyCmdBtn = document.getElementById('copyCmdBtn');
const copyCmdBtnText = document.getElementById('copyCmdBtnText');
const runCustomCmdBtn = document.getElementById('runCustomCmdBtn');

// Cut Modal Elements
const cutModal = document.getElementById('cutModal');
const openCutModalBtn = document.getElementById('openCutModalBtn');
const closeCutModalBtn = document.getElementById('closeCutModalBtn');
const closeCutModalBtnSecondary = document.getElementById('closeCutModalBtnSecondary');
const executeCutBtn = document.getElementById('executeCutBtn');
const cutCmdPreviewBtn = document.getElementById('cutCmdPreviewBtn');

// Stream Injector elements
const selectInjectFileBtn = document.getElementById('selectInjectFileBtn');
const injectFileLabel = document.getElementById('injectFileLabel');
const injectBtn = document.getElementById('injectBtn');

// Concat elements
const addConcatFileBtn = document.getElementById('addConcatFileBtn');
const clearConcatListBtn = document.getElementById('clearConcatListBtn');
const concatFileList = document.getElementById('concatFileList');
const concatQueueCount = document.getElementById('concatQueueCount');
const concatStatusBox = document.getElementById('concatStatusBox');
const startConcatBtn = document.getElementById('startConcatBtn');
const compatibilityDetailsBoard = document.getElementById('compatibilityDetailsBoard');

// Dashboard elements
const fileNameLabel = document.getElementById('fileNameLabel');
const filePathLabel = document.getElementById('filePathLabel');
const cardFormat = document.getElementById('cardFormat');
const cardDuration = document.getElementById('cardDuration');
const cardSize = document.getElementById('cardSize');
const cardBitrate = document.getElementById('cardBitrate');
const cardStreams = document.getElementById('cardStreams');
const streamsList = document.getElementById('streamsList');
const metadataTagsList = document.getElementById('metadataTagsList');
const rawJsonCode = document.getElementById('rawJsonCode');

// Cinematic Poster & Action Hub elements
const cinematicThumbnailImg = document.getElementById('cinematicThumbnailImg');
const cinematicPlaceholder = document.getElementById('cinematicPlaceholder');
const cinematicBadge = document.getElementById('cinematicBadge');
const cinematicDurationBadge = document.getElementById('cinematicDurationBadge');
const cinematicTitle = document.getElementById('cinematicTitle');
const cinematicSubtitle = document.getElementById('cinematicSubtitle');

const tabRemuxBtn = document.getElementById('tabRemuxBtn');
const tabInjectBtn = document.getElementById('tabInjectBtn');
const actionTabRemux = document.getElementById('actionTabRemux');
const actionTabInject = document.getElementById('actionTabInject');
// Active state variables
let currentRawJson = null;
let currentFilePath = null;
let currentDuration = 0;
let currentInjectFilePath = null;
let concatFileListQueue = [];

// Batch mode state variables
window.isBatchModeActive = false;
window.batchQueue = [];
window.batchOutputDir = "";

// Initialize app
async function init() {
    setupEventListeners();
    setupDragAndDrop();
    setupEncoderListeners();

    // Register real-time progress update listener from Go backend
    EventsOn("progress", (percent) => {
        const progressVal = Math.round(percent);
        progressBarFill.style.width = `${progressVal}%`;
        progressBarText.innerText = `${progressVal}%`;
        
        if (window.isBatchModeActive && window.batchQueue.length > 0) {
            const activeItem = window.batchQueue.find(item => item.status === 'processing');
            if (activeItem) {
                activeItem.percent = progressVal;
                renderBatchQueue();
            }
        }
    });

    // Check FFmpeg Installation
    try {
        const ffmpegVersion = await CheckFFmpeg();
        if (!ffmpegVersion) {
            // Show missing modal
            const missingModal = document.getElementById('ffmpegMissingModal');
            if (missingModal) {
                missingModal.style.display = 'flex';
                setTimeout(() => missingModal.style.opacity = '1', 10);
                
                // Bind buttons
                const copyBtn = document.getElementById('copyWingetBtn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText('winget install "FFmpeg (Essentials Build)"');
                        showToast("Winget command copied to clipboard!");
                    });
                }
                
                const installBtn = document.getElementById('installFFmpegBtn');
                if (installBtn) {
                    installBtn.addEventListener('click', async () => {
                        try {
                            await InstallFFmpegWindows();
                            showToast("Installing FFmpeg via Winget... Terminal should appear.");
                        } catch (e) {
                            showError("Installation Failed", "Could not start winget. Try copying the command and running it manually in Command Prompt as Administrator.");
                        }
                    });
                }
            }
        } else {
            // Show version in settings
            const vText = document.getElementById('ffmpegVersionText');
            if (vText) vText.innerText = ffmpegVersion;
        }
    } catch (e) {
        console.error("FFmpeg check failed:", e);
    }
}

// Event handlers
function setupEventListeners() {
    // Action Hub Tab Switchers
    if (tabRemuxBtn && tabInjectBtn) {
        tabRemuxBtn.addEventListener('click', () => {
            tabRemuxBtn.classList.add('active');
            tabInjectBtn.classList.remove('active');
            actionTabRemux.style.display = 'block';
            actionTabInject.style.display = 'none';
        });

        tabInjectBtn.addEventListener('click', () => {
            tabInjectBtn.classList.add('active');
            tabRemuxBtn.classList.remove('active');
            actionTabInject.style.display = 'block';
            actionTabRemux.style.display = 'none';
        });
    }

    // Cancel active process
    if (cancelProcessBtn) {
        cancelProcessBtn.addEventListener('click', async () => {
            try {
                showLoader("Cancelling process...", false);
                await CancelActiveCommand();
                showToast("Process cancelled successfully.");
                if (currentFilePath) {
                    showPanel(dashboardPanel);
                } else {
                    showPanel(welcomePanel);
                }
            } catch (err) {
                showError("Cancel Error", err);
                if (currentFilePath) {
                    showPanel(dashboardPanel);
                } else {
                    showPanel(welcomePanel);
                }
            }
        });
    }

    // Error Modal Dismiss hooks
    if (closeErrorModalBtn && closeErrorModalBtnSecondary) {
        const dismissError = () => {
            errorModal.style.opacity = '0';
            setTimeout(() => {
                errorModal.style.display = 'none';
            }, 200);
        };
        closeErrorModalBtn.addEventListener('click', dismissError);
        closeErrorModalBtnSecondary.addEventListener('click', dismissError);
    }

    // Browse local file system
    browseBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent triggering dropzone click
        try {
            const filePath = await SelectFile();
            if (filePath) {
                analyzeFile(filePath);
            }
        } catch (err) {
            showError("File Selection Failed", err);
        }
    });

    // Dropzone click opens browse dialog too
    dropzone.addEventListener('click', async () => {
        try {
            const filePath = await SelectFile();
            if (filePath) {
                analyzeFile(filePath);
            }
        } catch (err) {
            showError("File Selection Failed", err);
        }
    });

    // Sidebar / Header tabs navigation
    navAnalyzerBtn.addEventListener('click', () => {
        navAnalyzerBtn.classList.add('active');
        navConcatBtn.classList.remove('active');
        navEncoderBtn.classList.remove('active');
        if (currentFilePath) {
            showPanel(dashboardPanel);
        } else {
            showPanel(welcomePanel);
        }
    });

    navEncoderBtn.addEventListener('click', () => {
        navEncoderBtn.classList.add('active');
        navAnalyzerBtn.classList.remove('active');
        navConcatBtn.classList.remove('active');
        showPanel(encoderPanel);
        updateEncoderSourceInfo();
    });

    // Advanced Encoder background image listeners
    const browseEncStaticImageBtn = document.getElementById('browseEncStaticImageBtn');
    const clearEncStaticImageBtn = document.getElementById('clearEncStaticImageBtn');
    const encStaticImagePath = document.getElementById('encStaticImagePath');

    if (browseEncStaticImageBtn && clearEncStaticImageBtn && encStaticImagePath) {
        browseEncStaticImageBtn.addEventListener('click', async () => {
            try {
                const imgPath = await SelectImageFile();
                if (imgPath) {
                    encStaticImagePath.value = imgPath;
                    clearEncStaticImageBtn.style.display = 'inline-block';
                }
            } catch (err) {
                showError("Image Selection Failed", err);
            }
        });

        clearEncStaticImageBtn.addEventListener('click', () => {
            encStaticImagePath.value = '';
            clearEncStaticImageBtn.style.display = 'none';
        });
    }

    navConcatBtn.addEventListener('click', () => {
        navConcatBtn.classList.add('active');
        navAnalyzerBtn.classList.remove('active');
        navEncoderBtn.classList.remove('active');
        showPanel(concatPanel);
        renderConcatQueue();
    });

    // Stream Injector events
    selectInjectFileBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const filePath = await SelectFile();
            if (filePath) {
                currentInjectFilePath = filePath;
                injectFileLabel.innerText = getFileName(filePath);
                injectFileLabel.style.color = 'var(--text-bright)';
                injectBtn.disabled = false;
            }
        } catch (err) {
            showError("File Selection Failed", err);
        }
    });

    injectBtn.addEventListener('click', async () => {
        if (!currentFilePath || !currentInjectFilePath) return;
        showLoader(`Injecting stream from ${getFileName(currentInjectFilePath)}...`, true);
        try {
            const outputPath = await InjectStream(currentFilePath, currentInjectFilePath, currentDuration);
            showPanel(dashboardPanel);
            showToast(`Stream injected successfully!\nSaved to:\n${outputPath}`);
            
            // Reset injector state
            currentInjectFilePath = null;
            injectFileLabel.innerText = "Choose track...";
            injectFileLabel.style.color = 'var(--text-muted)';
            injectBtn.disabled = true;
        } catch (err) {
            showPanel(dashboardPanel);
            if (err && err.includes("cancelled")) return;
            showError("Injection Error", err);
        }
    });

    // Smart Concatenator events
    addConcatFileBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const filePath = await SelectFile();
            if (filePath) {
                addFileToConcatQueue(filePath);
            }
        } catch (err) {
            showError("File Selection Failed", err);
        }
    });

    clearConcatListBtn.addEventListener('click', () => {
        concatFileListQueue = [];
        renderConcatQueue();
    });

    startConcatBtn.addEventListener('click', async () => {
        if (concatFileListQueue.length < 2) return;
        
        let sumDuration = 0;
        const paths = concatFileListQueue.map(item => {
            sumDuration += item.duration;
            return item.path;
        });

        showLoader(`Merging ${concatFileListQueue.length} files losslessly...`, true);
        try {
            const outputPath = await ConcatFiles(paths, sumDuration);
            showPanel(concatPanel);
            showToast(`Files concatenated successfully!\nSaved to:\n${outputPath}`);
        } catch (err) {
            showPanel(concatPanel);
            if (err && err.includes("cancelled")) return;
            showError("Concatenation Error", err);
        }
    });

    // Back to dropzone
    backBtn.addEventListener('click', () => {
        showPanel(welcomePanel);
    });

    // Remux / Convert Entire File
    const remuxBtn = document.getElementById('remuxBtn');
    const remuxFormatSelect = document.getElementById('remuxFormatSelect');
    remuxBtn.addEventListener('click', async () => {
        if (!currentFilePath) return;
        let targetExt = remuxFormatSelect.value;
        if (targetExt === 'custom') targetExt = document.getElementById('remuxFormatCustom').value.trim() || 'mp4';
        
        showLoader(`Converting/Remuxing entire file to .${targetExt}...`, true);
        try {
            const outputPath = await RemuxFile(currentFilePath, targetExt, currentDuration);
            showPanel(dashboardPanel);
            showToast(`Conversion complete!\nSaved to:\n${outputPath}`);
        } catch (err) {
            showPanel(dashboardPanel);
            // If they cancelled, just ignore it
            if (err && err.includes("cancelled")) return;
            showError("Conversion Error", err);
        }
    });

    // Lossless Repair Entire File (-c copy)
    const repairBtn = document.getElementById('repairBtn');
    repairBtn.addEventListener('click', async () => {
        if (!currentFilePath) return;
        const targetExt = currentFilePath.split('.').pop().toLowerCase();
        showLoader(`Running lossless repair (-c copy) on ${getFileName(currentFilePath)}...`, true);
        try {
            const outputPath = await RemuxFile(currentFilePath, targetExt, currentDuration);
            showPanel(dashboardPanel);
            showToast(`Lossless repair complete!\nSaved to:\n${outputPath}`);
        } catch (err) {
            showPanel(dashboardPanel);
            if (err && err.includes("cancelled")) return;
            showError("Repair Error", err);
        }
    });

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from other buttons & panels
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            // Activate current
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Copy JSON to clipboard
    copyJsonBtn.addEventListener('click', () => {
        if (!currentRawJson) return;
        navigator.clipboard.writeText(JSON.stringify(currentRawJson, null, 2))
            .then(() => {
                showToast("JSON copied to clipboard!");
            })
            .catch(err => {
                console.error("Could not copy JSON:", err);
            });
    });
}

// Enable file drop listener
function setupDragAndDrop() {
    const injectorZone = document.getElementById('streamInjectorDropzone');
    const cinematicCard = document.querySelector('.cinematic-preview-card');

    // 1. Setup HTML5 visual feedback on Stream Injector dropzone
    if (injectorZone) {
        injectorZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            injectorZone.classList.add('injector-drag-active');
        });
        injectorZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            injectorZone.classList.add('injector-drag-active');
        });
        injectorZone.addEventListener('dragleave', () => {
            injectorZone.classList.remove('injector-drag-active');
        });
        injectorZone.addEventListener('drop', () => {
            injectorZone.classList.remove('injector-drag-active');
        });
    }

    // 2. Setup HTML5 visual feedback on Cinematic Preview Card
    if (cinematicCard) {
        cinematicCard.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (dashboardPanel.style.display !== 'none') {
                cinematicCard.classList.add('cinematic-drag-active');
            }
        });
        cinematicCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (dashboardPanel.style.display !== 'none') {
                cinematicCard.classList.add('cinematic-drag-active');
            }
        });
        cinematicCard.addEventListener('dragleave', () => {
            cinematicCard.classList.remove('cinematic-drag-active');
        });
        cinematicCard.addEventListener('drop', () => {
            cinematicCard.classList.remove('cinematic-drag-active');
        });
    }

    OnFileDrop((x, y, paths) => {
        // Reset drag active classes immediately
        if (injectorZone) {
            injectorZone.classList.remove('injector-drag-active');
        }
        if (cinematicCard) {
            cinematicCard.classList.remove('cinematic-drag-active');
        }

        if (paths && paths.length > 0) {
            if (navConcatBtn.classList.contains('active') || concatPanel.style.display !== 'none') {
                // Drag & Drop directly adds multiple files to the Concat Queue!
                paths.forEach(p => addFileToConcatQueue(p));
            } else if (dashboardPanel.style.display !== 'none') {
                // We are in Analyzer tab! Let's check which specific target the file was dropped on
                const element = document.elementFromPoint(x, y);
                const isDroppedInInjector = injectorZone && (injectorZone === element || injectorZone.contains(element));
                const isDroppedInCinematic = cinematicCard && (cinematicCard === element || cinematicCard.contains(element));
                
                if (isDroppedInInjector) {
                    // Drop subtitle/audio specifically inside the injector zone
                    selectInjectedFile(paths[0]);
                } else if (isDroppedInCinematic) {
                    // Drop a new media file specifically on the Cinematic Card to analyze it
                    analyzeFile(paths[0]);
                }
                // If dropped anywhere else on the dashboard, we do nothing to prevent accidental overrides!
            } else if (encoderPanel.style.display !== 'none' && window.isBatchModeActive) {
                paths.forEach(p => addFileToBatchQueue(p));
            } else {
                // Welcome screen: drag & drop anywhere analyzes the file
                analyzeFile(paths[0]);
            }
        }
    }, true);
}

// Select track for injecting
function selectInjectedFile(filePath) {
    currentInjectFilePath = filePath;
    injectFileLabel.innerText = getFileName(filePath);
    injectFileLabel.style.color = 'var(--text-bright)';
    injectBtn.disabled = false;
    showToast(`Selected track: ${getFileName(filePath)}`);
}

// Run ffprobe and show results
async function analyzeFile(filePath) {
    showLoader(`Analyzing media file: ${getFileName(filePath)}...`, false);

    // Hide thumbnail by default and clear previous source to avoid flickering
    if (videoThumbnailContainer) videoThumbnailContainer.style.display = 'none';
    if (videoThumbnailImg) videoThumbnailImg.src = '';
    if (cinematicThumbnailImg) {
        cinematicThumbnailImg.src = '';
        cinematicThumbnailImg.style.display = 'none';
    }
    if (cinematicPlaceholder) cinematicPlaceholder.style.display = 'flex';

    try {
        const jsonStr = await GetMediaInfo(filePath);
        const data = JSON.parse(jsonStr);
        currentRawJson = data;
        currentFilePath = filePath;
        currentDuration = data.format && data.format.duration ? parseFloat(data.format.duration) : 0;

        populateDashboard(filePath, data);
        if (window.updateAdvancedEncoderUI) window.updateAdvancedEncoderUI(data);
        showPanel(dashboardPanel);

        // Asynchronously fetch thumbnail for all files to support embedded cover art in MP3, FLAC, etc.
        if (videoThumbnailContainer && videoThumbnailImg) {
            GetVideoThumbnail(filePath).then(base64Uri => {
                if (base64Uri && currentFilePath === filePath) {
                    videoThumbnailImg.src = base64Uri;
                    videoThumbnailContainer.style.display = 'block';
                    
                    if (cinematicThumbnailImg) {
                        cinematicThumbnailImg.src = base64Uri;
                        cinematicThumbnailImg.style.display = 'block';
                    }
                    if (cinematicPlaceholder) cinematicPlaceholder.style.display = 'none';
                }
            }).catch(err => {
                // Ignore errors: means this file simply doesn't contain a thumbnail or cover art
                console.log("No thumbnail/cover art found for this file.");
            });
        }
    } catch (err) {
        showError("Analysis Error", err);
        showPanel(welcomePanel);
    }
}

window.updateAdvancedEncoderUI = function(data) {
    if (!data) return;
    
    let hasAudio = false;
    let hasVideo = false;
    
    if (data.streams) {
        data.streams.forEach(stream => {
            if (stream.codec_type === 'audio') hasAudio = true;
            if (stream.codec_type === 'video' && stream.codec_name !== 'mjpeg' && stream.codec_name !== 'png') hasVideo = true;
        });
    }

    const checkVideoState = () => {
        const hasStaticImg = document.getElementById('encStaticImagePath') && document.getElementById('encStaticImagePath').value.trim() !== "";
        const videoActive = hasVideo || hasStaticImg;
        
        const videoCol = document.getElementById('advancedCutVideoBtn')?.parentElement?.parentElement;
        if (videoCol) {
            if (!videoActive) {
                videoCol.style.opacity = "0.5";
                videoCol.style.pointerEvents = "none";
                const vCodec = document.getElementById('encVCodec');
                if(vCodec) {
                    vCodec.value = "none";
                    vCodec.dispatchEvent(new Event('change'));
                }
            } else {
                videoCol.style.opacity = "1";
                videoCol.style.pointerEvents = "auto";
                const vCodec = document.getElementById('encVCodec');
                if(vCodec && vCodec.value === "none" && hasStaticImg) {
                    vCodec.value = "libx264";
                    vCodec.dispatchEvent(new Event('change'));
                }
            }
        }
    };

    const audioCol = document.getElementById('advancedCutAudioBtn')?.parentElement?.parentElement;
    if (audioCol) {
        if (!hasAudio) {
            audioCol.style.opacity = "0.5";
            audioCol.style.pointerEvents = "none";
            const aCodec = document.getElementById('encACodec');
            if(aCodec) {
                aCodec.value = "none";
                aCodec.dispatchEvent(new Event('change'));
            }
        } else {
            audioCol.style.opacity = "1";
            audioCol.style.pointerEvents = "auto";
        }
    }
    
    checkVideoState();
    
    const imgPath = document.getElementById('encStaticImagePath');
    if (imgPath && !imgPath.hasAttribute('data-ui-listener')) {
        imgPath.setAttribute('data-ui-listener', 'true');
        // We need to poll or watch for changes since value can be set via JS from Go
        setInterval(checkVideoState, 1000);
    }
};

function showPanel(panel) {
    welcomePanel.style.display = 'none';
    loaderPanel.style.display = 'none';
    dashboardPanel.style.display = 'none';
    concatPanel.style.display = 'none';
    if (encoderPanel) encoderPanel.style.display = 'none';
    
    // Use flex for welcome, loader and encoder, block for dashboard/concat
    if (panel === welcomePanel || panel === loaderPanel) {
        panel.style.display = 'flex';
        if (globalShowCmdBtn) globalShowCmdBtn.style.display = 'none';
    } else if (panel === encoderPanel) {
        panel.style.display = 'flex';
        if (globalShowCmdBtn) globalShowCmdBtn.style.display = 'flex';
    } else {
        panel.style.display = 'block';
        if (globalShowCmdBtn) globalShowCmdBtn.style.display = 'flex';
    }
}

// Add file to Smart Concat queue with metadata loading
async function addFileToConcatQueue(filePath) {
    showToast(`Loading: ${getFileName(filePath)}...`);
    try {
        const jsonStr = await GetMediaInfo(filePath);
        const data = JSON.parse(jsonStr);
        
        if (!data.streams || data.streams.length === 0) {
            showError("Incompatible File", "No active streams found in this file.");
            return;
        }

        concatFileListQueue.push({
            path: filePath,
            metadata: data,
            name: getFileName(filePath),
            duration: data.format && data.format.duration ? parseFloat(data.format.duration) : 0
        });

        renderConcatQueue();
    } catch (err) {
        showError("Metadata Load Failed", err);
    }
}

// Render Concat Queue UI & run validation tests
function renderConcatQueue() {
    concatQueueCount.innerText = concatFileListQueue.length;
    concatFileList.innerHTML = '';

    if (concatFileListQueue.length === 0) {
        concatFileList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 3rem 0; font-size: 0.95rem;">
                No files added. Use "Add File" or drag & drop files here.
            </div>
        `;
        validateConcatQueue();
        return;
    }

    concatFileListQueue.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'concat-item';
        
        const videoStream = file.metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = file.metadata.streams.find(s => s.codec_type === 'audio');
        
        let metaDetails = `Duration: ${formatSeconds(file.duration)}`;
        if (videoStream) metaDetails += ` | Video: ${videoStream.codec_name}`;
        if (audioStream) metaDetails += ` | Audio: ${audioStream.codec_name}`;

        item.innerHTML = `
            <div class="drag-handle" style="cursor: grab; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding-right: 0.5rem; user-select: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity: 0.4;">
                    <circle cx="9" cy="5" r="1.5"></circle>
                    <circle cx="9" cy="12" r="1.5"></circle>
                    <circle cx="9" cy="19" r="1.5"></circle>
                    <circle cx="15" cy="5" r="1.5"></circle>
                    <circle cx="15" cy="12" r="1.5"></circle>
                    <circle cx="15" cy="19" r="1.5"></circle>
                </svg>
            </div>
            <div style="background: rgba(89, 209, 79, 0.15); color: var(--color-primary); font-size: 0.8rem; font-weight: 700; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 0.75rem; flex-shrink: 0; font-family: monospace;">
                ${index + 1}
            </div>
            <div class="concat-item-info" style="flex: 1; overflow: hidden;">
                <div class="concat-item-name" style="font-weight: 600; color: var(--text-bright); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</div>
                <div class="concat-item-meta">${metaDetails}</div>
            </div>
            <button class="concat-item-remove" onclick="window.removeFromConcatQueue(${index})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        concatFileList.appendChild(item);
    });

    // Add HTML5 drag-and-drop sorting to queue items
    const items = concatFileList.querySelectorAll('.concat-item');
    let draggedItemIndex = null;

    items.forEach((item, idx) => {
        item.setAttribute('draggable', 'true');

        item.addEventListener('dragstart', (e) => {
            draggedItemIndex = idx;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            const targetIdx = idx;
            if (draggedItemIndex !== null && draggedItemIndex !== targetIdx) {
                // Rearrange array items
                const movedItem = concatFileListQueue.splice(draggedItemIndex, 1)[0];
                concatFileListQueue.splice(targetIdx, 0, movedItem);
                
                showToast(`Moved to #${targetIdx + 1}: ${movedItem.name}`);
                renderConcatQueue();
            }
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItemIndex = null;
        });
    });

    validateConcatQueue();
}

// Global removal handler
window.removeFromConcatQueue = function(index) {
    concatFileListQueue.splice(index, 1);
    renderConcatQueue();
};

// Validate Concat Queue
function validateConcatQueue() {
    if (concatFileListQueue.length < 2) {
        updateConcatStatus("waiting", "Add at least 2 files to check compatibility.");
        compatibilityDetailsBoard.innerHTML = "Select files to run auto-verification tests...";
        startConcatBtn.disabled = true;
        return;
    }

    const first = concatFileListQueue[0];
    let allOk = true;
    let reportHtml = `<div style="display: flex; flex-direction: column; gap: 0.75rem;">`;

    reportHtml += `<div><strong>Base Template File:</strong> <span style="color: var(--color-primary);">${first.name}</span></div>`;
    reportHtml += `<div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">All subsequent files must match this template's parameters:</div>`;
    
    const baseVideo = first.metadata.streams.find(s => s.codec_type === 'video');
    const baseAudio = first.metadata.streams.find(s => s.codec_type === 'audio');
    
    reportHtml += `<div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 1rem;">`;
    reportHtml += `<div>• Streams Count: ${first.metadata.streams.length}</div>`;
    if (baseVideo) reportHtml += `<div>• Video Codec: ${baseVideo.codec_name} | Time Base (tbn): ${baseVideo.time_base || 'N/A'}</div>`;
    if (baseAudio) reportHtml += `<div>• Audio Codec: ${baseAudio.codec_name} | Time Base (tbn): ${baseAudio.time_base || 'N/A'}</div>`;
    reportHtml += `</div>`;

    reportHtml += `<div style="font-weight: 600; color: var(--text-bright); margin-top: 0.5rem; margin-bottom: 0.5rem;">Validation Queue Results:</div>`;

    for (let idx = 0; idx < concatFileListQueue.length; idx++) {
        const file = concatFileListQueue[idx];
        let fileErrors = [];

        if (idx === 0) {
            reportHtml += `<div style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-success); margin-bottom: 0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-success);"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>File [1] (Base Template) - OK</span>
            </div>`;
            continue;
        }

        // Check Stream Count
        if (file.metadata.streams.length !== first.metadata.streams.length) {
            fileErrors.push(`Stream Count Mismatch: Has ${file.metadata.streams.length}, template has ${first.metadata.streams.length}`);
        }

        // Check stream order & types & codecs & tbn
        const minStreams = Math.min(file.metadata.streams.length, first.metadata.streams.length);
        for (let i = 0; i < minStreams; i++) {
            const sFile = file.metadata.streams[i];
            const sFirst = first.metadata.streams[i];

            if (sFile.codec_type !== sFirst.codec_type) {
                fileErrors.push(`Stream #${i} Type Mismatch: Is ${sFile.codec_type}, template has ${sFirst.codec_type}`);
            } else {
                if (sFile.codec_name !== sFirst.codec_name) {
                    fileErrors.push(`Stream #${i} (${sFile.codec_type}) Codec Mismatch: Is ${sFile.codec_name}, template has ${sFirst.codec_name}`);
                }
                if (sFile.time_base !== sFirst.time_base) {
                    fileErrors.push(`Stream #${i} (${sFile.codec_type}) Time Base (tbn) Mismatch: Is ${sFile.time_base}, template has ${sFirst.time_base}`);
                }
            }
        }

        if (fileErrors.length > 0) {
            allOk = false;
            reportHtml += `<div style="background: rgba(255, 92, 92, 0.05); border: 1px solid rgba(255, 92, 92, 0.15); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; text-align: left;">
                <div style="font-weight: 700; color: var(--color-danger); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    File [${idx + 1}] Incompatible: ${file.name}
                </div>
                <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: #FF8A8A; display: flex; flex-direction: column; gap: 0.2rem; list-style: square;">
                    ${fileErrors.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>`;
        } else {
            reportHtml += `<div style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-success); margin-bottom: 0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-success);"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>File [${idx + 1}] ${file.name} - OK (Compatible)</span>
            </div>`;
        }
    }

    reportHtml += `</div>`;
    compatibilityDetailsBoard.innerHTML = reportHtml;

    if (allOk) {
        updateConcatStatus("success", "All files are compatible and ready to concatenate losslessly!");
        startConcatBtn.disabled = false;
    } else {
        updateConcatStatus("error", "One or more files have codec or stream property mismatches.");
        startConcatBtn.disabled = true;
    }
}

function updateConcatStatus(type, message) {
    let icon = '';
    let color = '';
    let border = '';
    let bg = '';

    if (type === 'waiting') {
        icon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 0.75rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        color = 'var(--text-muted)';
        border = '1px dashed var(--border-color)';
        bg = 'rgba(255,255,255,0.02)';
    } else if (type === 'success') {
        icon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-success); margin-bottom: 0.75rem; filter: drop-shadow(0 0 8px var(--color-success));"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        color = 'var(--color-success)';
        border = '1px solid rgba(89, 209, 79, 0.2)';
        bg = 'rgba(89, 209, 79, 0.05)';
    } else if (type === 'error') {
        icon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-danger); margin-bottom: 0.75rem; filter: drop-shadow(0 0 8px var(--color-danger));"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        color = 'var(--color-danger)';
        border = '1px solid rgba(255, 92, 92, 0.2)';
        bg = 'rgba(255, 92, 92, 0.05)';
    }

    concatStatusBox.style.background = bg;
    concatStatusBox.style.borderColor = border;
    concatStatusBox.innerHTML = `
        ${icon}
        <span style="font-size: 0.9rem; font-weight: 600; color: ${color};">${message}</span>
    `;
}

// Loader UI
function showLoader(text, showProgressBar = false) {
    loaderText.innerText = text;
    if (showProgressBar) {
        progressBarContainer.style.display = 'block';
        progressBarFill.style.width = '0%';
        progressBarText.innerText = '0%';
        if (cancelProcessBtn) cancelProcessBtn.style.display = 'inline-block';
    } else {
        progressBarContainer.style.display = 'none';
        if (cancelProcessBtn) cancelProcessBtn.style.display = 'none';
    }
    showPanel(loaderPanel);
}

function showToast(message) {
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function showError(title, message) {
    if (errorModal && errorModalTitle && errorModalMessage) {
        errorModalTitle.innerText = title;
        errorModalMessage.innerText = message;
        errorModal.style.display = 'flex';
        // Trigger reflow to apply transition
        errorModal.offsetHeight;
        errorModal.style.opacity = '1';
    } else {
        alert(`❌ ${title}\n\n${message}`);
    }
}

// Get recommended container options based on codec compatibility
function getRecommendedContainers(codecName, codecType) {
    const name = codecName ? codecName.toLowerCase() : '';
    
    if (codecType === 'video') {
        switch (name) {
            case 'h264':
            case 'avc':
                return [
                    { value: 'mp4', label: 'MP4 (.mp4) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv) - Highly Compatible' },
                    { value: 'mov', label: 'MOV (.mov)' },
                    { value: 'avi', label: 'AVI (.avi)' }
                ];
            case 'hevc':
            case 'h265':
                return [
                    { value: 'mp4', label: 'MP4 (.mp4) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv) - Best for MKV features' },
                    { value: 'mov', label: 'MOV (.mov)' }
                ];
            case 'vp9':
            case 'av1':
                return [
                    { value: 'webm', label: 'WEBM (.webm) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv) - Highly Compatible' },
                    { value: 'mp4', label: 'MP4 (.mp4)' }
                ];
            case 'vp8':
                return [
                    { value: 'webm', label: 'WEBM (.webm) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            case 'mpeg4':
                return [
                    { value: 'avi', label: 'AVI (.avi) - Recommended' },
                    { value: 'mp4', label: 'MP4 (.mp4)' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            case 'theora':
                return [
                    { value: 'ogg', label: 'OGG (.ogg) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            default:
                return [
                    { value: 'mp4', label: 'MP4 (.mp4)' },
                    { value: 'mkv', label: 'MKV (.mkv)' },
                    { value: 'mov', label: 'MOV (.mov)' },
                    { value: 'avi', label: 'AVI (.avi)' },
                    { value: 'webm', label: 'WEBM (.webm)' }
                ];
        }
    } else if (codecType === 'audio') {
        switch (name) {
            case 'aac':
                return [
                    { value: 'm4a', label: 'M4A (.m4a) - Native Copy (Recommended)' },
                    { value: 'aac', label: 'AAC (.aac) - Raw AAC ADTS' },
                    { value: 'mp4', label: 'MP4 (.mp4)' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            case 'mp3':
                return [
                    { value: 'mp3', label: 'MP3 (.mp3) - Native Copy (Recommended)' },
                    { value: 'mkv', label: 'MKV (.mkv)' },
                    { value: 'avi', label: 'AVI (.avi)' },
                    { value: 'mp4', label: 'MP4 (.mp4)' }
                ];
            case 'opus':
                return [
                    { value: 'opus', label: 'Opus (.opus) - Recommended' },
                    { value: 'ogg', label: 'OGG (.ogg) - Highly Compatible' },
                    { value: 'webm', label: 'WEBM (.webm)' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            case 'vorbis':
                return [
                    { value: 'ogg', label: 'OGG (.ogg) - Native Copy (Recommended)' },
                    { value: 'webm', label: 'WEBM (.webm)' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            case 'flac':
                return [
                    { value: 'flac', label: 'FLAC (.flac) - Lossless Native Copy' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            case 'pcm_s16le':
            case 'pcm_s24le':
            case 'pcm_s32le':
            case 'pcm_alaw':
            case 'pcm_mulaw':
                return [
                    { value: 'wav', label: 'WAV (.wav) - Raw Lossless PCM (Recommended)' },
                    { value: 'flac', label: 'FLAC (.flac)' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            default:
                return [
                    { value: 'mp3', label: 'MP3 (.mp3)' },
                    { value: 'm4a', label: 'M4A (.m4a)' },
                    { value: 'wav', label: 'WAV (.wav)' },
                    { value: 'flac', label: 'FLAC (.flac)' },
                    { value: 'aac', label: 'AAC (.aac)' },
                    { value: 'ogg', label: 'OGG (.ogg)' },
                    { value: 'opus', label: 'Opus (.opus)' }
                ];
        }
    } else if (codecType === 'subtitle') {
        switch (name) {
            case 'subrip':
            case 'srt':
                return [
                    { value: 'srt', label: 'SRT (.srt) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv) - Embedded Subtitle' }
                ];
            case 'ass':
            case 'ssa':
                return [
                    { value: 'ass', label: 'ASS (.ass) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv) - Embedded Subtitle' }
                ];
            case 'webvtt':
            case 'vtt':
                return [
                    { value: 'vtt', label: 'VTT (.vtt) - Recommended' },
                    { value: 'mkv', label: 'MKV (.mkv)' }
                ];
            default:
                return [
                    { value: 'srt', label: 'SRT (.srt)' },
                    { value: 'ass', label: 'ASS (.ass)' },
                    { value: 'vtt', label: 'VTT (.vtt)' }
                ];
        }
    } else if (codecType === 'image') {
        switch (name) {
            case 'mjpeg':
            case 'jpeg':
                return [
                    { value: 'jpg', label: 'JPEG Image (.jpg) - Recommended' },
                    { value: 'png', label: 'PNG Image (.png)' },
                    { value: 'webp', label: 'WebP Image (.webp)' }
                ];
            case 'png':
                return [
                    { value: 'png', label: 'PNG Image (.png) - Recommended' },
                    { value: 'jpg', label: 'JPEG Image (.jpg)' },
                    { value: 'webp', label: 'WebP Image (.webp)' }
                ];
            case 'webp':
                return [
                    { value: 'webp', label: 'WebP Image (.webp) - Recommended' },
                    { value: 'png', label: 'PNG Image (.png)' },
                    { value: 'jpg', label: 'JPEG Image (.jpg)' }
                ];
            default:
                return [
                    { value: 'png', label: 'PNG Image (.png)' },
                    { value: 'jpg', label: 'JPEG Image (.jpg)' },
                    { value: 'webp', label: 'WebP Image (.webp)' },
                    { value: 'bmp', label: 'BMP Image (.bmp)' }
                ];
        }
    }
    return [];
}

// Data Population
function populateDashboard(filePath, data) {
    // 1. Title bar & Cinematic Poster titles
    const name = getFileName(filePath);
    fileNameLabel.innerText = name;
    filePathLabel.innerText = filePath;

    if (cinematicTitle) cinematicTitle.innerText = name;
    if (cinematicSubtitle) cinematicSubtitle.innerText = filePath;

    // 2. Format Card values
    const format = data.format || {};
    const formatName = format.format_name ? format.format_name.split(',')[0].toUpperCase() : 'UNKNOWN';
    const durationText = format.duration ? formatSeconds(parseFloat(format.duration)) : '--:--:--';

    cardFormat.innerText = formatName;
    cardDuration.innerText = durationText;
    cardSize.innerText = format.size ? formatBytes(parseInt(format.size)) : '--';
    cardBitrate.innerText = format.bit_rate ? formatBitrate(parseInt(format.bit_rate)) : '--';
    
    if (cinematicBadge) cinematicBadge.innerText = formatName;
    if (cinematicDurationBadge) cinematicDurationBadge.innerText = durationText;

    const totalStreams = data.streams ? data.streams.length : 0;
    cardStreams.innerText = totalStreams;

    // 3. Smart Entire File Remux Configuration
    const hasVideo = data.streams && data.streams.some(s => s.codec_type === 'video');
    const firstVideoStream = data.streams && data.streams.find(s => s.codec_type === 'video');
    const firstAudioStream = data.streams && data.streams.find(s => s.codec_type === 'audio');

    const remuxTitleSpan = document.querySelector('.remux-title span');
    const remuxFormatSelect = document.getElementById('remuxFormatSelect');

    if (remuxFormatSelect) {
        remuxFormatSelect.innerHTML = '';
        if (hasVideo) {
            if (remuxTitleSpan) remuxTitleSpan.innerText = 'Lossless Remux (Video)';
            
            const videoOpts = [
                { value: 'mp4', label: 'MP4 (.mp4)' },
                { value: 'mkv', label: 'MKV (.mkv)' },
                { value: 'mov', label: 'MOV (.mov)' },
                { value: 'webm', label: 'WEBM (.webm)' },
                { value: 'avi', label: 'AVI (.avi)' }
            ];
            
            const videoCodec = firstVideoStream.codec_name ? firstVideoStream.codec_name.toLowerCase() : '';
            let defaultVal = 'mp4';
            if (videoCodec === 'vp9' || videoCodec === 'av1' || videoCodec === 'vp8') {
                defaultVal = 'webm';
            }
            
            videoOpts.forEach(opt => {
                const selected = opt.value === defaultVal ? 'selected' : '';
                remuxFormatSelect.innerHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
            });
            remuxFormatSelect.innerHTML += `<option value="custom" style="color: var(--color-primary); font-weight: bold;">Custom format...</option>`;
        } else if (firstAudioStream) {
            if (remuxTitleSpan) remuxTitleSpan.innerText = 'Lossless Remux (Audio)';
            
            const audioOpts = [
                { value: 'mp3', label: 'MP3 (.mp3)' },
                { value: 'm4a', label: 'M4A (.m4a)' },
                { value: 'wav', label: 'WAV (.wav)' },
                { value: 'flac', label: 'FLAC (.flac)' },
                { value: 'aac', label: 'AAC (.aac)' },
                { value: 'ogg', label: 'OGG (.ogg)' },
                { value: 'opus', label: 'Opus (.opus)' }
            ];
            
            const audioCodec = firstAudioStream.codec_name ? firstAudioStream.codec_name.toLowerCase() : '';
            let defaultVal = 'mp3';
            if (audioCodec === 'aac') {
                defaultVal = 'm4a';
            } else if (audioCodec === 'flac') {
                defaultVal = 'flac';
            } else if (audioCodec.includes('pcm')) {
                defaultVal = 'wav';
            } else if (audioCodec === 'opus') {
                defaultVal = 'opus';
            } else if (audioCodec === 'vorbis') {
                defaultVal = 'ogg';
            }
            
            audioOpts.forEach(opt => {
                const selected = opt.value === defaultVal ? 'selected' : '';
                remuxFormatSelect.innerHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
            });
            remuxFormatSelect.innerHTML += `<option value="custom" style="color: var(--color-primary); font-weight: bold;">Custom format...</option>`;
        }
    }

    // 4. Streams tab
    streamsList.innerHTML = '';
    if (data.streams && data.streams.length > 0) {
        data.streams.forEach((stream, index) => {
            const card = createStreamCard(stream, index);
            streamsList.appendChild(card);
        });
    } else {
        streamsList.innerHTML = `<div class="stream-card" style="padding: 2rem; text-align: center; color: var(--text-muted);">No streams detected.</div>`;
    }

    // 5. Metadata tags list
    metadataTagsList.innerHTML = '';
    const tags = format.tags || {};
    const tagKeys = Object.keys(tags);
    if (tagKeys.length > 0) {
        let tagsHtml = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;
        tagsHtml += `<thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-bright);">
                <th style="padding: 0.75rem; font-weight: 600;">Tag Name</th>
                <th style="padding: 0.75rem; font-weight: 600;">Value</th>
            </tr>
        </thead><tbody>`;
        
        tagKeys.forEach(key => {
            tagsHtml += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                <td style="padding: 0.75rem; color: var(--color-primary); font-weight: 500; width: 30%;">${key}</td>
                <td style="padding: 0.75rem; color: var(--text-main); word-break: break-all;">${tags[key]}</td>
            </tr>`;
        });
        tagsHtml += `</tbody></table>`;
        metadataTagsList.innerHTML = tagsHtml;
    } else {
        metadataTagsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">No metadata tags available for this file.</div>`;
    }

    // 6. Raw JSON tab
    rawJsonCode.innerText = JSON.stringify(data, null, 2);
}

// Global stream extraction handler linked to buttons
window.extractStream = async function(streamIndex, streamType) {
    if (!currentFilePath) return;
    const selectEl = document.getElementById(`extract-select-${streamIndex}`);
    if (!selectEl) return;
    let targetExt = selectEl.value;
    if (targetExt === 'custom') {
        const customEl = document.getElementById(`extract-custom-${streamIndex}`);
        if (customEl) targetExt = customEl.value.trim() || 'bin';
    }

    showLoader(`Extracting stream #${streamIndex} to .${targetExt}...`, true);
    try {
        const outputPath = await ExtractStream(currentFilePath, streamIndex, streamType, targetExt, currentDuration);
        showPanel(dashboardPanel);
        showToast(`Stream extracted successfully!\nSaved to:\n${outputPath}`);
    } catch (err) {
        showPanel(dashboardPanel);
        if (err && err.includes("cancelled")) return;
        showError("Extraction Error", err);
    }
};

// Dynamic elements creation
function createStreamCard(stream, index) {
    const card = document.createElement('div');
    card.className = 'stream-card';

    const isAttachedPic = stream.disposition && (stream.disposition.attached_pic === 1 || stream.disposition.attached_pic === "1");
    const isImageCodec = stream.codec_name && ['mjpeg', 'png', 'webp', 'bmp', 'tiff', 'gif', 'jpeg'].includes(stream.codec_name.toLowerCase());
    
    const isImage = stream.codec_type === 'video' && (isAttachedPic || isImageCodec);
    const isVideo = stream.codec_type === 'video' && !isImage;
    const isAudio = stream.codec_type === 'audio';
    const isSubtitle = stream.codec_type === 'subtitle';
    
    let typeClass = 'subtitle';
    let typeLabel = 'Subtitle';
    if (isVideo) {
        typeClass = 'video';
        typeLabel = 'Video';
    } else if (isImage) {
        typeClass = 'image';
        typeLabel = 'Cover Art / Image';
    } else if (isAudio) {
        typeClass = 'audio';
        typeLabel = 'Audio';
    }

    // Stream Header
    let headerHtml = `
        <div class="stream-header">
            <span class="stream-badge ${typeClass}">${typeLabel}</span>
            <span class="stream-index">Stream #${index}</span>
        </div>
    `;

    // Stream Details
    let detailsHtml = `<div class="stream-details-grid">`;
    
    // Common properties
    detailsHtml += createDetailItem("Codec", stream.codec_name ? stream.codec_name.toUpperCase() : "Unknown");
    if (stream.codec_long_name) {
        detailsHtml += createDetailItem("Codec Full Name", stream.codec_long_name);
    }

    if (isVideo) {
        // Video details
        const resolution = (stream.width && stream.height) ? `${stream.width} × ${stream.height}` : null;
        if (resolution) detailsHtml += createDetailItem("Resolution", resolution);
        
        if (stream.profile) detailsHtml += createDetailItem("Profile", stream.profile);
        
        // Calculate FPS
        let fps = stream.r_frame_rate;
        if (fps && fps.includes('/')) {
            const parts = fps.split('/');
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (den !== 0) {
                fps = (num / den).toFixed(2);
            }
        }
        if (fps) detailsHtml += createDetailItem("Frame Rate (FPS)", `${fps} fps`);
        
        if (stream.pix_fmt) detailsHtml += createDetailItem("Pixel Format", stream.pix_fmt);
        if (stream.color_space) detailsHtml += createDetailItem("Color Space", stream.color_space);
        if (stream.color_range) detailsHtml += createDetailItem("Color Range", stream.color_range);
        if (stream.bit_rate) detailsHtml += createDetailItem("Stream Bitrate", formatBitrate(parseInt(stream.bit_rate)));
    } else if (isImage) {
        // Image details
        const resolution = (stream.width && stream.height) ? `${stream.width} × ${stream.height}` : null;
        if (resolution) detailsHtml += createDetailItem("Resolution", resolution);
        if (stream.pix_fmt) detailsHtml += createDetailItem("Pixel Format", stream.pix_fmt);
    } else if (isAudio) {
        // Audio details
        if (stream.channel_layout) {
            detailsHtml += createDetailItem("Channels Layout", stream.channel_layout);
        } else if (stream.channels) {
            detailsHtml += createDetailItem("Channels", `${stream.channels} ch`);
        }
        
        if (stream.sample_rate) {
            const rateKHz = (parseInt(stream.sample_rate) / 1000).toFixed(1);
            detailsHtml += createDetailItem("Sample Rate", `${rateKHz} kHz (${stream.sample_rate} Hz)`);
        }
        if (stream.bit_rate) {
            detailsHtml += createDetailItem("Stream Bitrate", formatBitrate(parseInt(stream.bit_rate)));
        }
        
        const lang = stream.tags ? (stream.tags.language || stream.tags.Language) : null;
        if (lang) detailsHtml += createDetailItem("Language", lang.toUpperCase());
    } else if (isSubtitle) {
        // Subtitle details
        const lang = stream.tags ? (stream.tags.language || stream.tags.Language) : null;
        if (lang) detailsHtml += createDetailItem("Language", lang.toUpperCase());
        
        const title = stream.tags ? stream.tags.title : null;
        if (title) detailsHtml += createDetailItem("Title", title);
    }

    detailsHtml += `</div>`;

    // Actions Footer
    let actionsHtml = '';
    if (isVideo || isImage || isAudio || isSubtitle) {
        const streamType = isImage ? 'image' : stream.codec_type;
        const recommendations = getRecommendedContainers(stream.codec_name, streamType);
        let optionsHtml = '';
        recommendations.forEach(opt => {
            optionsHtml += `<option value="${opt.value}">${opt.label}</option>`;
        });
        optionsHtml += `<option value="custom" style="color: var(--color-primary); font-weight: bold;">Custom format...</option>`;

        actionsHtml = `
            <div class="stream-actions" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="stream-actions-label" style="margin-right: auto;">Extract Stream to:</span>
                <select class="custom-select" id="extract-select-${index}" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; border-radius: 8px;" onchange="document.getElementById('extract-custom-${index}').style.display = this.value === 'custom' ? 'block' : 'none';">
                    ${optionsHtml}
                </select>
                <input type="text" id="extract-custom-${index}" placeholder="e.g. ts" class="custom-select" style="display: none; padding: 0.35rem; width: 60px; font-size: 0.8rem; border-radius: 8px; font-family: monospace;">
                <div style="display: flex; gap: 0.3rem;">
                    <button class="browse-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-radius: 8px;" onclick="window.extractStream(${index}, '${streamType}')">
                        Extract
                    </button>
                    <button class="btn-back" style="padding: 0.4rem; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); cursor: pointer; color: var(--text-muted); margin-bottom: 0;" onclick="window.previewExtractCmd(${index}, '${streamType}')" data-tooltip="View FFmpeg Command for Extraction">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                    </button>
                </div>
            </div>
        `;
    }

    card.innerHTML = headerHtml + detailsHtml + actionsHtml;
    return card;
}

function createDetailItem(label, value) {
    return `
        <div class="detail-item">
            <span class="detail-label">${label}</span>
            <span class="detail-value">${value}</span>
        </div>
    `;
}

// Formatting utilities
function getFileName(path) {
    if (!path) return '';
    const winParts = path.split('\\');
    const unixParts = winParts[winParts.length - 1].split('/');
    return unixParts[unixParts.length - 1];
}

function formatSeconds(secs) {
    if (isNaN(secs)) return '00:00:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs - (hours * 3600)) / 60);
    const seconds = Math.floor(secs - (hours * 3600) - (minutes * 60));

    const hStr = hours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');
    
    return `${hStr}:${mStr}:${sStr}`;
}

// File size formatter
function formatBytes(bytes) {
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatBitrate(bitrateBps) {
    if (isNaN(bitrateBps) || bitrateBps === 0) return '--';
    if (bitrateBps >= 1000000) {
        return (bitrateBps / 1000000).toFixed(2) + ' Mbps';
    }
    return (bitrateBps / 1000).toFixed(0) + ' Kbps';
}

function updateEncoderSourceInfo() {
    if (!currentRawJson || !currentFilePath) return;
    const format = currentRawJson.format || {};
    const streams = currentRawJson.streams || [];
    const videoStream = streams.find(s => s.codec_type === 'video');
    const audioStream = streams.find(s => s.codec_type === 'audio');
    
    encSourceFileName.innerText = getFileName(currentFilePath);
    encSourceDuration.innerText = format.duration ? formatSeconds(parseFloat(format.duration)) : '00:00:00';
    encSourceSize.innerText = format.size ? formatBytes(parseInt(format.size)) : '--';
    
    let codecName = '--';
    if (videoStream) {
        codecName = videoStream.codec_name ? videoStream.codec_name.toUpperCase() : 'UNKNOWN';
    } else if (audioStream) {
        codecName = audioStream.codec_name ? audioStream.codec_name.toUpperCase() : 'UNKNOWN';
    }
    encSourceCodec.innerText = codecName;
}

function setupEncoderListeners() {
    // 1. Video Rate Mode tab buttons switcher
    modeCrfBtn.addEventListener('click', () => {
        modeCrfBtn.classList.add('active');
        modeCbrBtn.classList.remove('active');
        modeVbrBtn.classList.remove('active');
        
        cardVRateCrf.style.display = 'flex';
        cardVRateCbr.style.display = 'none';
        cardVRateVbr.style.display = 'none';
    });

    modeCbrBtn.addEventListener('click', () => {
        modeCbrBtn.classList.add('active');
        modeCrfBtn.classList.remove('active');
        modeVbrBtn.classList.remove('active');
        
        cardVRateCrf.style.display = 'none';
        cardVRateCbr.style.display = 'flex';
        cardVRateVbr.style.display = 'none';
    });

    modeVbrBtn.addEventListener('click', () => {
        modeVbrBtn.classList.add('active');
        modeCrfBtn.classList.remove('active');
        modeCbrBtn.classList.remove('active');
        
        cardVRateCrf.style.display = 'none';
        cardVRateCbr.style.display = 'none';
        cardVRateVbr.style.display = 'flex';
    });

    // Custom Resolution / FPS inputs & smart automatic Aspect Ratio calculator
    encResolution.addEventListener('change', () => {
        if (encResolution.value === 'custom') {
            encResolutionCustomContainer.style.display = 'flex';
            encResolutionCustom.focus();
            calculateAndSyncAspectRatio(encResolutionCustom.value);
        } else {
            encResolutionCustomContainer.style.display = 'none';
            calculateAndSyncAspectRatio(encResolution.value);
        }
    });

    encResolutionCustom.addEventListener('input', () => {
        calculateAndSyncAspectRatio(encResolutionCustom.value);
    });

    encFps.addEventListener('change', () => {
        if (encFps.value === 'custom') {
            encFpsCustomContainer.style.display = 'flex';
            encFpsCustom.focus();
        } else {
            encFpsCustomContainer.style.display = 'none';
        }
    });

    // 2. CRF Slider and Description synchronizer
    crfSlider.addEventListener('input', () => {
        const val = crfSlider.value;
        crfValueLabel.innerText = val;
        
        let desc = "";
        if (val == 0) {
            desc = "Target Quality: Completely Lossless (Extremely large file sizes!)";
        } else if (val >= 1 && val <= 17) {
            desc = "Target Quality: Visually Lossless (High quality pro-grade master)";
        } else if (val >= 18 && val <= 23) {
            desc = "Target Quality: Standard High Quality (Excellent sweet-spot / Recommended)";
        } else if (val >= 24 && val <= 28) {
            desc = "Target Quality: Good Quality (Medium sizes, great for streaming)";
        } else if (val >= 29 && val <= 35) {
            desc = "Target Quality: Medium-Low Quality (Optimized for small storage/transfers)";
        } else {
            desc = "Target Quality: Highly Compressed (Low quality / tiny web size)";
        }
        crfDescription.innerText = desc;
    });

    // 3. CBR Bitrate synchronizer
    cbrBitrateSlider.addEventListener('input', () => {
        cbrBitrateInput.value = cbrBitrateSlider.value;
    });
    cbrBitrateInput.addEventListener('input', () => {
        let val = parseInt(cbrBitrateInput.value);
        if (isNaN(val)) val = 3000;
        if (val < 200) val = 200;
        if (val > 30000) val = 30000;
        cbrBitrateSlider.value = val;
    });

    // 4. VBR Bitrate synchronizers
    vbrAvgSlider.addEventListener('input', () => {
        vbrAvgInput.value = vbrAvgSlider.value;
    });
    vbrAvgInput.addEventListener('input', () => {
        let val = parseInt(vbrAvgInput.value);
        if (isNaN(val)) val = 2500;
        if (val < 200) val = 200;
        if (val > 30000) val = 30000;
        vbrAvgSlider.value = val;
    });

    vbrMaxSlider.addEventListener('input', () => {
        vbrMaxInput.value = vbrMaxSlider.value;
    });
    vbrMaxInput.addEventListener('input', () => {
        let val = parseInt(vbrMaxInput.value);
        if (isNaN(val)) val = 5000;
        if (val < 400) val = 400;
        if (val > 50000) val = 50000;
        vbrMaxSlider.value = val;
    });

    // Custom Input Handlers
    encVCodec.addEventListener('change', () => {
        document.getElementById('encVCodecCustomContainer').style.display = encVCodec.value === 'custom' ? 'flex' : 'none';
    });
    encACodec.addEventListener('change', () => {
        document.getElementById('encACodecCustomContainer').style.display = encACodec.value === 'custom' ? 'flex' : 'none';
    });
    audioCbrSelect.addEventListener('change', () => {
        document.getElementById('audioCbrCustomContainer').style.display = audioCbrSelect.value === 'custom' ? 'flex' : 'none';
    });
    encTargetFormat.addEventListener('change', () => {
        document.getElementById('encFormatCustomContainer').style.display = encTargetFormat.value === 'custom' ? 'flex' : 'none';
    });

    const analyzerRemuxSelect = document.getElementById('remuxFormatSelect');
    if (analyzerRemuxSelect) {
        analyzerRemuxSelect.addEventListener('change', () => {
            const container = document.getElementById('remuxFormatCustomContainer');
            if (container) {
                container.style.display = analyzerRemuxSelect.value === 'custom' ? 'flex' : 'none';
            }
        });
    }

    // 5. Video Codec Visibility controller
    encVCodec.addEventListener('change', () => {
        const val = encVCodec.value;
        if (val === 'copy' || val === 'none') {
            document.getElementById('encVRateModeContainer').style.display = 'none';
            cardVRateCrf.style.display = 'none';
            cardVRateCbr.style.display = 'none';
            cardVRateVbr.style.display = 'none';
        } else {
            document.getElementById('encVRateModeContainer').style.display = 'flex';
            // Show the active one
            if (modeCrfBtn.classList.contains('active')) cardVRateCrf.style.display = 'flex';
            if (modeCbrBtn.classList.contains('active')) cardVRateCbr.style.display = 'flex';
            if (modeVbrBtn.classList.contains('active')) cardVRateVbr.style.display = 'flex';
        }
    });

    // 6. Audio Rate Mode tab buttons switcher
    audioModeCbrBtn.addEventListener('click', () => {
        audioModeCbrBtn.classList.add('active');
        audioModeVbrBtn.classList.remove('active');
        cardARateCbr.style.display = 'flex';
        cardARateVbr.style.display = 'none';
    });

    audioModeVbrBtn.addEventListener('click', () => {
        audioModeVbrBtn.classList.add('active');
        audioModeCbrBtn.classList.remove('active');
        cardARateCbr.style.display = 'none';
        cardARateVbr.style.display = 'flex';
    });

    // 7. Audio VBR Quality Slider synchronizer
    audioVbrSlider.addEventListener('input', () => {
        const val = audioVbrSlider.value;
        audioVbrLabel.innerText = val;
        
        let desc = "";
        if (val == 0 || val == 1) {
            desc = "Approximate VBR Bitrate: ~220-285 Kbps (Outstanding audiophile quality)";
        } else if (val == 2 || val == 3) {
            desc = "Approximate VBR Bitrate: ~170-210 Kbps (Highly recommended for music)";
        } else if (val == 4 || val == 5) {
            desc = "Approximate VBR Bitrate: ~130-160 Kbps (Standard high quality / Sweet spot)";
        } else if (val == 6 || val == 7) {
            desc = "Approximate VBR Bitrate: ~100-120 Kbps (Medium efficiency, great for speech)";
        } else {
            desc = "Approximate VBR Bitrate: ~70-90 Kbps (Very low size / low bandwidth)";
        }
        audioVbrDescription.innerText = desc;
    });

    // 8. Audio Codec Visibility controller
    encACodec.addEventListener('change', () => {
        const val = encACodec.value;
        if (val === 'copy' || val === 'none' || val === 'flac' || val === 'pcm_s16le') {
            document.getElementById('encARateModeContainer').style.display = 'none';
            cardARateCbr.style.display = 'none';
            cardARateVbr.style.display = 'none';
        } else {
            document.getElementById('encARateModeContainer').style.display = 'flex';
            if (audioModeCbrBtn.classList.contains('active')) cardARateCbr.style.display = 'flex';
            if (audioModeVbrBtn.classList.contains('active')) cardARateVbr.style.display = 'flex';
        }
    });

    // 8.5. Target Format Change Listener (Smart Container Switcher)
    encTargetFormat.addEventListener('change', () => {
        const format = encTargetFormat.value;
        const audioContainers = ['mp3', 'm4a', 'opus', 'flac', 'wav', 'ogg'];
        
        if (audioContainers.includes(format)) {
            // Audio-only container selected!
            // 1. Force Video Codec to "none" (delete video stream)
            encVCodec.value = 'none';
            // Dispatch a change event on encVCodec to update UI (hide video options)
            encVCodec.dispatchEvent(new Event('change'));
            // Disable video codec dropdown
            encVCodec.disabled = true;
            
            // 2. Set default matching audio codec
            switch (format) {
                case 'mp3':
                    encACodec.value = 'libmp3lame';
                    break;
                case 'm4a':
                    encACodec.value = 'aac';
                    break;
                case 'opus':
                    encACodec.value = 'libopus';
                    break;
                case 'flac':
                    encACodec.value = 'flac';
                    break;
                case 'wav':
                    encACodec.value = 'pcm_s16le';
                    break;
                case 'ogg':
                    encACodec.value = 'libvorbis';
                    break;
            }
            // Trigger change event on encACodec to update audio options UI
            encACodec.dispatchEvent(new Event('change'));
            
            showToast(`Switched to audio-only container (.${format}). Video settings disabled.`);
        } else {
            // Video container selected!
            // Re-enable Video Codec dropdown
            encVCodec.disabled = false;
            
            // Restore video codec to standard H.264 if it was automatically set to none
            if (encVCodec.value === 'none') {
                encVCodec.value = 'libx264';
                encVCodec.dispatchEvent(new Event('change'));
            }
        }
    });

    // Batch Mode Event Listeners & Setup
    const encoderModeSingleBtn = document.getElementById('encoderModeSingleBtn');
    const encoderModeBatchBtn = document.getElementById('encoderModeBatchBtn');
    const encoderSourceSingleCard = document.getElementById('encoderSourceSingleCard');
    const encoderSourceBatchCard = document.getElementById('encoderSourceBatchCard');
    
    const addBatchFilesBtn = document.getElementById('addBatchFilesBtn');
    const setBatchOutputDirBtn = document.getElementById('setBatchOutputDirBtn');
    const clearBatchQueueBtn = document.getElementById('clearBatchQueueBtn');
    const batchOutputDirDisplay = document.getElementById('batchOutputDirDisplay');

    if (encoderModeSingleBtn && encoderModeBatchBtn) {
        encoderModeSingleBtn.addEventListener('click', () => {
            encoderModeSingleBtn.classList.add('active');
            encoderModeBatchBtn.classList.remove('active');
            encoderSourceSingleCard.style.display = 'block';
            encoderSourceBatchCard.style.display = 'none';
            window.isBatchModeActive = false;
            startTranscodeBtn.innerText = "Transcode";
        });

        encoderModeBatchBtn.addEventListener('click', async () => {
            encoderModeBatchBtn.classList.add('active');
            encoderModeSingleBtn.classList.remove('active');
            encoderSourceSingleCard.style.display = 'none';
            encoderSourceBatchCard.style.display = 'flex';
            window.isBatchModeActive = true;
            startTranscodeBtn.innerText = "Start Batch Process";
            renderBatchQueue();
            
            // Sync initial batch output folder from global settings
            try {
                const settings = await GetOutputSettings();
                const outputMode = settings.outputMode || "ask";
                
                if (outputMode === "fixed" && settings.fixedOutputDir) {
                    window.batchOutputDir = settings.fixedOutputDir;
                    batchOutputDirDisplay.innerText = `Output Folder: ${settings.fixedOutputDir}`;
                    batchOutputDirDisplay.style.display = 'block';
                } else if (outputMode === "same") {
                    window.batchOutputDir = "SAME_AS_ORIGINAL";
                    batchOutputDirDisplay.innerText = `Output Folder: Same as Original File`;
                    batchOutputDirDisplay.style.display = 'block';
                } else {
                    window.batchOutputDir = "";
                    batchOutputDirDisplay.style.display = 'none';
                }
            } catch (err) {
                console.warn("Could not fetch output settings:", err);
            }
        });
    }

    if (addBatchFilesBtn) {
        addBatchFilesBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const paths = await SelectMultipleFiles();
                if (paths && paths.length > 0) {
                    paths.forEach(p => addFileToBatchQueue(p));
                }
            } catch (err) {
                showError("File Selection Failed", err);
            }
        });
    }

    if (setBatchOutputDirBtn) {
        setBatchOutputDirBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const dir = await SelectFolder();
                if (dir) {
                    window.batchOutputDir = dir;
                    batchOutputDirDisplay.innerText = `Output Folder: ${dir}`;
                    batchOutputDirDisplay.style.display = 'block';
                }
            } catch (err) {
                showError("Folder Selection Failed", err);
            }
        });
    }

    if (clearBatchQueueBtn) {
        clearBatchQueueBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.batchQueue = [];
            renderBatchQueue();
        });
    }

    window.addFileToBatchQueue = async function(filePath) {
        if (window.batchQueue.some(item => item.filePath === filePath)) {
            showToast("File is already in the queue!");
            return;
        }
        
        const item = {
            filePath: filePath,
            fileName: getFileName(filePath),
            duration: 0,
            durationStr: '--:--:--',
            status: 'queued',
            percent: 0
        };
        window.batchQueue.push(item);
        renderBatchQueue();
        
        try {
            const jsonStr = await GetMediaInfo(filePath);
            const data = JSON.parse(jsonStr);
            const dur = data.format && data.format.duration ? parseFloat(data.format.duration) : 0;
            item.duration = dur;
            item.durationStr = dur ? formatSeconds(dur) : '00:00:00';
            renderBatchQueue();
        } catch (e) {
            console.error("Failed to parse media info for " + filePath, e);
        }
    };

    window.renderBatchQueue = function() {
        const listContainer = document.getElementById('batchQueueList');
        const countDisplay = document.getElementById('batchQueueCount');
        if (!listContainer) return;
        
        countDisplay.innerText = `${window.batchQueue.length} files in queue`;
        
        if (window.batchQueue.length === 0) {
            listContainer.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                        Queue is empty. Click "Add Files" or drag & drop files here.
                    </td>
                </tr>
            `;
            return;
        }
        
        listContainer.innerHTML = window.batchQueue.map((item, index) => {
            let statusBadge = '';
            if (item.status === 'queued') {
                statusBadge = `<span style="color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem;">Queued</span>`;
            } else if (item.status === 'processing') {
                statusBadge = `<span style="color: var(--color-primary); background: rgba(89, 209, 79, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Encoding (${item.percent}%)</span>`;
            } else if (item.status === 'done') {
                statusBadge = `<span style="color: #3db843; background: rgba(61, 184, 67, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Completed</span>`;
            } else if (item.status === 'failed') {
                statusBadge = `<span style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Failed</span>`;
            }
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <td style="padding: 0.6rem 0.8rem; font-family: monospace; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.filePath}">
                        ${item.fileName}
                    </td>
                    <td style="padding: 0.6rem 0.8rem;">${item.durationStr}</td>
                    <td style="padding: 0.6rem 0.8rem;">${statusBadge}</td>
                    <td style="padding: 0.6rem 0.8rem; text-align: center;">
                        <button onclick="window.removeBatchItem(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; margin: auto;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.removeBatchItem = function(index) {
        window.batchQueue.splice(index, 1);
        renderBatchQueue();
    };

    // 9. Start Transcode trigger
    startTranscodeBtn.addEventListener('click', async () => {
        if (window.isBatchModeActive) {
            if (window.batchQueue.length === 0) {
                showToast("Please add files to the batch queue first!");
                return;
            }
            if (!window.batchOutputDir) {
                try {
                    const dir = await SelectFolder();
                    if (!dir) {
                        showToast("Output folder selection cancelled.");
                        return;
                    }
                    window.batchOutputDir = dir;
                    batchOutputDirDisplay.innerText = `Output Folder: ${dir}`;
                    batchOutputDirDisplay.style.display = 'block';
                } catch (e) {
                    showError("Folder Selection Failed", e);
                    return;
                }
            }
        } else {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
        }

        let vCodecVal = encVCodec.value;
        if (vCodecVal === 'custom') vCodecVal = document.getElementById('encVCodecCustom').value.trim() || 'libx264';
        
        let aCodecVal = encACodec.value;
        if (aCodecVal === 'custom') aCodecVal = document.getElementById('encACodecCustom').value.trim() || 'aac';
        
        let vRateModeVal = "crf";
        if (modeCbrBtn.classList.contains('active')) vRateModeVal = "cbr";
        if (modeVbrBtn.classList.contains('active')) vRateModeVal = "vbr";
        
        let vBitrateVal = "";
        let vMaxBitrateVal = "";
        if (vRateModeVal === "cbr") {
            vBitrateVal = cbrBitrateInput.value + "k";
        } else if (vRateModeVal === "vbr") {
            vBitrateVal = vbrAvgInput.value + "k";
            vMaxBitrateVal = vbrMaxInput.value + "k";
        }
        
        const vCrfVal = parseInt(crfSlider.value);
        
        let resVal = encResolution.value;
        if (resVal === 'custom') {
            resVal = encResolutionCustom.value.trim().toLowerCase().replace('x', ':').replace('*', ':');
            if (!resVal) resVal = 'original';
        }
        
        let fpsVal = encFps.value;
        if (fpsVal === 'custom') {
            fpsVal = encFpsCustom.value.trim();
            if (!fpsVal) fpsVal = 'original';
        }
        
        const aspectVal = encAspectRatio.value;
        
        let aRateModeVal = "cbr";
        if (audioModeVbrBtn.classList.contains('active')) aRateModeVal = "vbr";
        
        let aBitrateVal = audioCbrSelect.value;
        if (aBitrateVal === 'custom') aBitrateVal = document.getElementById('audioCbrCustom').value.trim() || '192k';
        if (!aBitrateVal.endsWith('k') && !aBitrateVal.endsWith('K') && !aBitrateVal.endsWith('M') && !aBitrateVal.endsWith('m')) {
            if (!isNaN(parseInt(aBitrateVal))) aBitrateVal += 'k';
        }
        
        const aVbrVal = audioVbrSlider.value;
        const channelsVal = encAudioChannels.value;
        
        let targetFormatVal = encTargetFormat.value;
        if (targetFormatVal === 'custom') targetFormatVal = document.getElementById('encTargetFormatCustom').value.trim() || 'mp4';

        const staticImgVal = document.getElementById('encStaticImagePath').value.trim();
        const vPresetVal = document.getElementById('encPreset').value;

        if (window.isBatchModeActive) {
            let successCount = 0;
            let failCount = 0;
            
            for (let i = 0; i < window.batchQueue.length; i++) {
                const item = window.batchQueue[i];
                item.status = 'processing';
                item.percent = 0;
                renderBatchQueue();
                
                showLoader(`[${i + 1}/${window.batchQueue.length}] Encoding: ${item.fileName}...`, true);
                
                currentDuration = item.duration;
                
                const baseName = item.fileName;
                const dotIdx = baseName.lastIndexOf('.');
                const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
                const targetExt = targetFormatVal === 'original' || targetFormatVal === '' ? baseName.split('.').pop() : targetFormatVal;
                
                let outPath = "";
                if (window.batchOutputDir === "SAME_AS_ORIGINAL") {
                    const dir = item.filePath.substring(0, item.filePath.lastIndexOf('\\') + 1 || item.filePath.lastIndexOf('/') + 1);
                    outPath = dir + nameWithoutExt + "_encoded." + targetExt;
                } else {
                    outPath = window.batchOutputDir + "\\" + nameWithoutExt + "_encoded." + targetExt;
                }
                
                try {
                    progressBarFill.style.width = `0%`;
                    progressBarText.innerText = `0%`;
                    
                    await TranscodeFile(
                        item.filePath,
                        vCodecVal,
                        vRateModeVal,
                        vBitrateVal,
                        vMaxBitrateVal,
                        vCrfVal,
                        resVal,
                        fpsVal,
                        aspectVal,
                        vPresetVal,
                        aCodecVal,
                        aRateModeVal,
                        aBitrateVal,
                        aVbrVal,
                        channelsVal,
                        targetFormatVal,
                        staticImgVal,
                        window.advancedCutStartTime || "",
                        window.advancedCutEndTime || "",
                        window.advancedCutSeekMode || "fast",
                        window.advancedCutAvoidNegative !== undefined ? window.advancedCutAvoidNegative : true,
                        window.advancedCropFilter || "",
                        outPath,
                        item.duration
                    );
                    item.status = 'done';
                    item.percent = 100;
                    successCount++;
                } catch (err) {
                    console.error("Transcode failed for " + item.filePath, err);
                    item.status = 'failed';
                    failCount++;
                }
                renderBatchQueue();
            }
            
            showPanel(encoderPanel);
            showToast(`Batch processing completed!\nSuccess: ${successCount} files\nFailed: ${failCount} files`);
        } else {
            showLoader(`Encoding custom transcoded file...`, true);
            try {
                const outputPath = await TranscodeFile(
                    currentFilePath,
                    vCodecVal,
                    vRateModeVal,
                    vBitrateVal,
                    vMaxBitrateVal,
                    vCrfVal,
                    resVal,
                    fpsVal,
                    aspectVal,
                    vPresetVal,
                    aCodecVal,
                    aRateModeVal,
                    aBitrateVal,
                    aVbrVal,
                    channelsVal,
                    targetFormatVal,
                    staticImgVal,
                    window.advancedCutStartTime || "",
                    window.advancedCutEndTime || "",
                    window.advancedCutSeekMode || "fast",
                    window.advancedCutAvoidNegative !== undefined ? window.advancedCutAvoidNegative : true,
                    window.advancedCropFilter || "",
                    "",
                    currentDuration
                );
                showPanel(encoderPanel);
                showToast(`Encoding completed successfully!\nSaved to:\n${outputPath}`);
            } catch (err) {
                showPanel(encoderPanel);
                alert("Error in TranscodeFile: " + (err.message || err.toString()));
                if (err && typeof err === 'string' && err.includes("cancelled")) return;
                showError("Encoding Error", err);
            }
        }
    });

    // 9.5. Command Preview events
    globalShowCmdBtn.addEventListener('click', () => {
        let cmd = "";

        // Check which panel is currently visible
        if (dashboardPanel.style.display !== 'none') {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            
            const format = document.getElementById('remuxFormatSelect').value;
            const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('\\') + 1 || currentFilePath.lastIndexOf('/') + 1);
            const baseName = currentFilePath.split('\\').pop().split('/').pop();
            const dotIdx = baseName.lastIndexOf('.');
            const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
            
            const remuxOut = `${dir}${nameWithoutExt}_remux.${format}`;
            const repairOut = `${dir}${nameWithoutExt}_fixed.${format}`;
            const injectOut = `${dir}${nameWithoutExt}_injected.${format}`;
            
            const injectPath = injectFilePath || "path_to_external_stream";

            cmd = `# option 1: Remux / Convert Container
ffmpeg -y -i "${currentFilePath}" -c copy "${remuxOut}"

# option 2: Lossless Stream Repair (Fix indexing)
ffmpeg -y -err_detect ignore_err -i "${currentFilePath}" -c copy "${repairOut}"

# option 3: Inject External Stream (Lossless Copy)
ffmpeg -y -i "${currentFilePath}" -i "${injectPath}" -map 0 -map 1 -c copy "${injectOut}"`;

        } else if (concatPanel.style.display !== 'none') {
            if (concatFileListQueue.length === 0) {
                cmd = `# Lossless Concat / Merge Protocol (No files queued)
# Add files to the Concat queue to see the active merged command!
ffmpeg -y -f concat -safe 0 -i "concat_list.txt" -c copy "output_merged.mp4"`;
            } else {
                const ext = concatFileListQueue[0].name.split('.').pop();
                const dir = concatFileListQueue[0].path.substring(0, concatFileListQueue[0].path.lastIndexOf('\\') + 1 || concatFileListQueue[0].path.lastIndexOf('/') + 1);
                cmd = `# Lossless Concat / Merge Protocol (${concatFileListQueue.length} files)
ffmpeg -y -f concat -safe 0 -i "concat_list.txt" -c copy "${dir}merged_output.${ext}"`;
            }
        } else if (encoderPanel.style.display !== 'none') {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            cmd = generateFFmpegCommand();
        } else {
            showToast("No active operation to preview!");
            return;
        }

        cmdPreText.value = cmd;
        
        // Show Modal with Fade-In animation
        cmdModal.style.display = 'flex';
        setTimeout(() => {
            cmdModal.style.opacity = '1';
        }, 10);
    });

    const closeModal = () => {
        cmdModal.style.opacity = '0';
        setTimeout(() => {
            cmdModal.style.display = 'none';
            // Restore Copy button text
            copyCmdBtnText.innerText = "Copy Command";
        }, 200);
    };

    closeCmdModalBtn.addEventListener('click', closeModal);
    closeCmdModalBtnSecondary.addEventListener('click', closeModal);

    // Helpers to show popup command
    function showFFmpegCommandPopup(cmdText) {
        if (cmdModal && cmdPreText) {
            cmdPreText.value = cmdText;
            cmdModal.style.display = 'flex';
            setTimeout(() => {
                cmdModal.style.opacity = '1';
            }, 10);
        }
    }

    // Remux Command Preview
    const remuxCmdPreviewBtn = document.getElementById('remuxCmdPreviewBtn');
    if (remuxCmdPreviewBtn) {
        remuxCmdPreviewBtn.addEventListener('click', () => {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            let format = document.getElementById('remuxFormatSelect').value;
            if (format === 'custom') format = document.getElementById('remuxFormatCustom').value.trim() || 'mp4';
            const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('\\') + 1 || currentFilePath.lastIndexOf('/') + 1);
            const baseName = currentFilePath.split('\\').pop().split('/').pop();
            const dotIdx = baseName.lastIndexOf('.');
            const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
            const remuxOut = `${dir}${nameWithoutExt}_remux.${format}`;

            const cmd = `# Lossless Remux / Convert Container
ffmpeg -y -i "${currentFilePath}" -c copy "${remuxOut}"`;
            showFFmpegCommandPopup(cmd);
        });
    }

    // Repair Command Preview
    const repairCmdPreviewBtn = document.getElementById('repairCmdPreviewBtn');
    if (repairCmdPreviewBtn) {
        repairCmdPreviewBtn.addEventListener('click', () => {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            const format = currentFilePath.split('.').pop();
            const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('\\') + 1 || currentFilePath.lastIndexOf('/') + 1);
            const baseName = currentFilePath.split('\\').pop().split('/').pop();
            const dotIdx = baseName.lastIndexOf('.');
            const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
            const repairOut = `${dir}${nameWithoutExt}_fixed.${format}`;

            const cmd = `# Lossless Stream Repair (Fix indexing)
ffmpeg -y -err_detect ignore_err -i "${currentFilePath}" -c copy "${repairOut}"`;
            showFFmpegCommandPopup(cmd);
        });
    }

    // Inject Command Preview
    const injectCmdPreviewBtn = document.getElementById('injectCmdPreviewBtn');
    if (injectCmdPreviewBtn) {
        injectCmdPreviewBtn.addEventListener('click', () => {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            const injectPath = currentInjectFilePath || "path_to_external_stream";
            const outExt = currentFilePath.split('.').pop();
            const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('\\') + 1 || currentFilePath.lastIndexOf('/') + 1);
            const baseName = currentFilePath.split('\\').pop().split('/').pop();
            const dotIdx = baseName.lastIndexOf('.');
            const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
            const injectOut = `${dir}${nameWithoutExt}_injected.${outExt}`;

            const injectExt = injectPath.split('.').pop().toLowerCase();
            const isSubtitle = ['srt', 'ass', 'ssa', 'vtt'].includes(injectExt);

            let injectArgs = "";
            if (isSubtitle) {
                if (outExt.toLowerCase() === "mp4" || outExt.toLowerCase() === "m4v") {
                    injectArgs = `-c:v copy -c:a copy -c:s mov_text`;
                } else {
                    injectArgs = `-c copy`;
                }
            } else {
                injectArgs = `-c copy`;
            }

            const cmd = `# Lossless Stream Injector (Inject external track)
ffmpeg -y -i "${currentFilePath}" -i "${injectPath}" -map 0 -map 1 ${injectArgs} "${injectOut}"`;
            showFFmpegCommandPopup(cmd);
        });
    }

    // Window global preview extract helper
    window.previewExtractCmd = function(streamIndex, streamType) {
        if (!currentFilePath) {
            showToast("Please drag & drop or select a file first!");
            return;
        }
        const selectEl = document.getElementById(`extract-select-${streamIndex}`);
        let targetExt = selectEl ? selectEl.value : 'ext';
        if (targetExt === 'custom') {
            const customEl = document.getElementById(`extract-custom-${streamIndex}`);
            if (customEl) targetExt = customEl.value.trim() || 'bin';
        }
        
        const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('\\') + 1 || currentFilePath.lastIndexOf('/') + 1);
        const baseName = currentFilePath.split('\\').pop().split('/').pop();
        const dotIdx = baseName.lastIndexOf('.');
        const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
        const outputPath = `${dir}${nameWithoutExt}_stream${streamIndex}.${targetExt}`;

        const cmd = `# Lossless Stream Extraction (Extract stream #${streamIndex} to .${targetExt})
ffmpeg -y -i "${currentFilePath}" -map 0:${streamIndex} -c copy "${outputPath}"`;

        showFFmpegCommandPopup(cmd);
    };

    // Cut Modal Events & Helpers
    window.isAdvancedCut = false;
    window.advancedCutStartTime = "";
    window.advancedCutEndTime = "";
    window.advancedCutSeekMode = "fast";
    window.advancedCutAvoidNegative = true;

    if (openCutModalBtn) {
        openCutModalBtn.addEventListener('click', () => {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            window.isAdvancedCut = false;
            document.getElementById('executeCutBtn').innerText = "Start Trimming";
            cutModal.style.display = 'flex';
            setTimeout(() => { cutModal.style.opacity = '1'; }, 10);
        });
    }

    const openAdvancedCutModal = () => {
        if (!currentFilePath) {
            showToast("Please drag & drop or select a file first!");
            return;
        }
        window.isAdvancedCut = true;
        document.getElementById('executeCutBtn').innerText = "Save Trim Settings";
        cutModal.style.display = 'flex';
        setTimeout(() => { cutModal.style.opacity = '1'; }, 10);
    };

    const advancedCutVideoBtn = document.getElementById('advancedCutVideoBtn');
    if (advancedCutVideoBtn) advancedCutVideoBtn.addEventListener('click', openAdvancedCutModal);
    
    const advancedCutAudioBtn = document.getElementById('advancedCutAudioBtn');
    if (advancedCutAudioBtn) advancedCutAudioBtn.addEventListener('click', openAdvancedCutModal);

    const closeCutModal = () => {
        cutModal.style.opacity = '0';
        setTimeout(() => { cutModal.style.display = 'none'; }, 200);
    };

    if (closeCutModalBtn) closeCutModalBtn.addEventListener('click', closeCutModal);
    if (closeCutModalBtnSecondary) closeCutModalBtnSecondary.addEventListener('click', closeCutModal);

    window.adjustTime = function(type, unit, amount) {
        const inputId = `${type}${unit.toUpperCase()}`; // startH, endM, etc.
        const input = document.getElementById(inputId);
        if (!input) return;
        
        let val = parseInt(input.value) || 0;
        val += amount;
        
        let max = unit === 'h' ? 99 : 59;
        if (val < 0) val = max;
        if (val > max) val = 0;
        
        input.value = val.toString().padStart(2, '0');
    };

    window.formatTimeInput = function(input, max) {
        let val = parseInt(input.value) || 0;
        if (val < 0) val = 0;
        if (val > max) val = max;
        input.value = val.toString().padStart(2, '0');
    };

    const getCutDetails = () => {
        const startH = document.getElementById('startH').value;
        const startM = document.getElementById('startM').value;
        const startS = document.getElementById('startS').value;
        
        const endH = document.getElementById('endH').value;
        const endM = document.getElementById('endM').value;
        const endS = document.getElementById('endS').value;

        const startTime = `${startH}:${startM}:${startS}`;
        const endTime = `${endH}:${endM}:${endS}`;
        
        const seekMode = document.querySelector('input[name="seekMode"]:checked').value;
        const avoidNegative = document.getElementById('avoidNegativeTs').checked;

        let format = document.getElementById('remuxFormatSelect').value;
        if (format === 'custom') format = document.getElementById('remuxFormatCustom').value.trim() || 'mp4';
        
        const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('\\') + 1 || currentFilePath.lastIndexOf('/') + 1);
        const baseName = currentFilePath.split('\\').pop().split('/').pop();
        const dotIdx = baseName.lastIndexOf('.');
        const nameWithoutExt = dotIdx !== -1 ? baseName.substring(0, dotIdx) : baseName;
        const output = `${dir}${nameWithoutExt}_trimmed.${format}`;

        let args = [];
        let cmdTextArgs = [];
        
        args.push("-y");
        cmdTextArgs.push("-y");
        
        if (avoidNegative) {
            args.push("-avoid_negative_ts", "make_zero");
            cmdTextArgs.push("-avoid_negative_ts", "make_zero");
        }

        if (seekMode === "fast") {
            args.push("-ss", startTime, "-to", endTime, "-i", currentFilePath);
            cmdTextArgs.push("-ss", startTime, "-to", endTime, "-i", `"${currentFilePath}"`);
        } else {
            args.push("-i", currentFilePath, "-ss", startTime, "-to", endTime);
            cmdTextArgs.push("-i", `"${currentFilePath}"`, "-ss", startTime, "-to", endTime);
        }
        
        args.push("-c", "copy", output);
        cmdTextArgs.push("-c", "copy", `"${output}"`);

        return {
            argsArray: args,
            cmdText: `ffmpeg ${cmdTextArgs.join(" ")}`,
            outputPath: output
        };
    };

    if (cutCmdPreviewBtn) {
        cutCmdPreviewBtn.addEventListener('click', () => {
            if (!currentFilePath) {
                showToast("Please select a file first!");
                return;
            }
            const details = getCutDetails();
            const cmd = `# Lossless Video Trim/Cut\n${details.cmdText}`;
            showFFmpegCommandPopup(cmd);
        });
    }

    if (executeCutBtn) {
        executeCutBtn.addEventListener('click', async () => {
            if (!currentFilePath) return;
            
            if (window.isAdvancedCut) {
                const startH = document.getElementById('startH').value;
                const startM = document.getElementById('startM').value;
                const startS = document.getElementById('startS').value;
                
                const endH = document.getElementById('endH').value;
                const endM = document.getElementById('endM').value;
                const endS = document.getElementById('endS').value;

                window.advancedCutStartTime = `${startH}:${startM}:${startS}`;
                window.advancedCutEndTime = `${endH}:${endM}:${endS}`;
                window.advancedCutSeekMode = document.querySelector('input[name="seekMode"]:checked').value;
                window.advancedCutAvoidNegative = document.getElementById('avoidNegativeTs').checked;
                
                closeCutModal();
                showToast("Trim settings saved for transcoding!");
                return;
            }

            closeCutModal();
            const details = getCutDetails();
            
            let format = document.getElementById('remuxFormatSelect').value;
            if (format === 'custom') format = document.getElementById('remuxFormatCustom').value.trim() || 'mp4';
            
            showLoader(`Trimming video to .${format}...`, true);
            try {
                await RunCustomCommand(details.cmdText, currentDuration);
                showPanel(dashboardPanel);
                showToast(`Video trimmed successfully!\nSaved to:\n${details.outputPath}`);
            } catch (err) {
                showPanel(dashboardPanel);
                if (err && err.includes("cancelled")) return;
                showError("Trim Error", err);
            }
        });
    }

    // Crop Modal Logic
    const cropModal = document.getElementById('cropModal');
    const openCropModalBtn = document.getElementById('openCropModalBtn');
    const closeCropModalBtn = document.getElementById('closeCropModalBtn');
    const closeCropModalBtnSecondary = document.getElementById('closeCropModalBtnSecondary');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cropVideo = document.getElementById('cropVideo');
    const cropBox = document.getElementById('cropBox');
    const cropContainer = document.getElementById('cropContainer');

    window.advancedCropFilter = "";

    const closeCropModal = () => {
        cropModal.style.opacity = '0';
        setTimeout(() => {
            cropModal.style.display = 'none';
            if (cropVideo) cropVideo.src = "";
        }, 200);
    };

    if (closeCropModalBtn) closeCropModalBtn.addEventListener('click', closeCropModal);
    if (closeCropModalBtnSecondary) closeCropModalBtnSecondary.addEventListener('click', closeCropModal);

    if (openCropModalBtn) {
        openCropModalBtn.addEventListener('click', () => {
            if (!currentFilePath) {
                showToast("Please drag & drop or select a file first!");
                return;
            }
            cropVideo.src = "/stream/" + currentFilePath.split('\\').map(encodeURIComponent).join('/');
            cropVideo.onloadedmetadata = () => {
                if (cropContainer && cropVideo.videoWidth && cropVideo.videoHeight) {
                    cropContainer.style.aspectRatio = `${cropVideo.videoWidth} / ${cropVideo.videoHeight}`;
                }
            };
            cropModal.style.display = 'flex';
            setTimeout(() => { cropModal.style.opacity = '1'; }, 10);
            
            cropBox.style.left = '10%';
            cropBox.style.top = '10%';
            cropBox.style.width = '50%';
            cropBox.style.height = '50%';
        });
    }

    let isDraggingCrop = false;
    let isResizingCrop = false;
    let resizeHandle = '';
    let cropDragStartX = 0;
    let cropDragStartY = 0;
    let cropBoxStartLeft = 0;
    let cropBoxStartTop = 0;
    let cropBoxStartWidth = 0;
    let cropBoxStartHeight = 0;

    if (cropBox) {
        cropBox.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('crop-handle')) {
                isResizingCrop = true;
                resizeHandle = e.target.className.replace('crop-handle', '').trim();
            } else {
                isDraggingCrop = true;
            }
            
            cropDragStartX = e.clientX;
            cropDragStartY = e.clientY;
            cropBoxStartLeft = cropBox.offsetLeft;
            cropBoxStartTop = cropBox.offsetTop;
            cropBoxStartWidth = cropBox.offsetWidth;
            cropBoxStartHeight = cropBox.offsetHeight;
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingCrop && !isResizingCrop) return;
        
        let dx = e.clientX - cropDragStartX;
        let dy = e.clientY - cropDragStartY;
        let containerRect = cropContainer.getBoundingClientRect();
        
        if (isDraggingCrop) {
            let newLeft = cropBoxStartLeft + dx;
            let newTop = cropBoxStartTop + dy;
            
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            
            if (newLeft + cropBox.offsetWidth > containerRect.width) {
                newLeft = containerRect.width - cropBox.offsetWidth;
            }
            if (newTop + cropBox.offsetHeight > containerRect.height) {
                newTop = containerRect.height - cropBox.offsetHeight;
            }
            
            cropBox.style.left = newLeft + 'px';
            cropBox.style.top = newTop + 'px';
        } else if (isResizingCrop) {
            let newLeft = cropBoxStartLeft;
            let newTop = cropBoxStartTop;
            let newWidth = cropBoxStartWidth;
            let newHeight = cropBoxStartHeight;
            
            if (resizeHandle.includes('e')) newWidth += dx;
            if (resizeHandle.includes('w')) {
                newWidth -= dx;
                newLeft += dx;
            }
            if (resizeHandle.includes('s')) newHeight += dy;
            if (resizeHandle.includes('n')) {
                newHeight -= dy;
                newTop += dy;
            }
            
            // Min size
            if (newWidth < 40) {
                if (resizeHandle.includes('w')) newLeft -= (40 - newWidth);
                newWidth = 40;
            }
            if (newHeight < 40) {
                if (resizeHandle.includes('n')) newTop -= (40 - newHeight);
                newHeight = 40;
            }
            
            // Boundaries
            if (newLeft < 0) {
                newWidth += newLeft;
                newLeft = 0;
            }
            if (newTop < 0) {
                newHeight += newTop;
                newTop = 0;
            }
            if (newLeft + newWidth > containerRect.width) {
                newWidth = containerRect.width - newLeft;
            }
            if (newTop + newHeight > containerRect.height) {
                newHeight = containerRect.height - newTop;
            }
            
            cropBox.style.left = newLeft + 'px';
            cropBox.style.top = newTop + 'px';
            cropBox.style.width = newWidth + 'px';
            cropBox.style.height = newHeight + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingCrop = false;
        isResizingCrop = false;
        resizeHandle = '';
    });

    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', () => {
            if (!cropVideo.videoWidth) {
                showToast("Video not fully loaded yet. Please wait.");
                return;
            }
            const vidRect = cropVideo.getBoundingClientRect();
            const boxRect = cropBox.getBoundingClientRect();
            
            const renderW = vidRect.width;
            const renderH = vidRect.height;
            const origW = cropVideo.videoWidth;
            const origH = cropVideo.videoHeight;
            
            const scaleX = origW / renderW;
            const scaleY = origH / renderH;
            
            const boxLeft = boxRect.left - vidRect.left;
            const boxTop = boxRect.top - vidRect.top;
            
            let cropX = Math.round(boxLeft * scaleX);
            let cropY = Math.round(boxTop * scaleY);
            let cropW = Math.round(boxRect.width * scaleX);
            let cropH = Math.round(boxRect.height * scaleY);
            
            if (cropX < 0) cropX = 0;
            if (cropY < 0) cropY = 0;
            if (cropX + cropW > origW) cropW = origW - cropX;
            if (cropY + cropH > origH) cropH = origH - cropY;
            
            window.advancedCropFilter = `crop=${cropW}:${cropH}:${cropX}:${cropY}`;
            closeCropModal();
            showToast("Crop settings saved for transcoding! (" + cropW + "x" + cropH + ")");
        });
    }

    // Global Settings Modal Cache
    const settingsModal = document.getElementById('settingsModal');
    const globalSettingsBtn = document.getElementById('globalSettingsBtn');
    const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    const closeSettingsModalBtnSecondary = document.getElementById('closeSettingsModalBtnSecondary');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const browseOutputDirBtn = document.getElementById('browseOutputDirBtn');
    const customDirPathInput = document.getElementById('customDirPathInput');
    const fixedDirSection = document.getElementById('fixedDirSection');

    // Radios
    const modeSame = document.getElementById('modeSame');
    const modeFixed = document.getElementById('modeFixed');
    const modeAsk = document.getElementById('modeAsk');

    // Initial Load Settings from backend Go persistence
    const initSettings = async () => {
        try {
            const settings = await GetOutputSettings();
            if (settings) {
                const mode = settings.outputMode || "ask";
                const dir = settings.fixedOutputDir || "";
                
                customDirPathInput.value = dir;
                
                if (mode === "same") {
                    modeSame.checked = true;
                    fixedDirSection.style.display = 'none';
                } else if (mode === "fixed") {
                    modeFixed.checked = true;
                    fixedDirSection.style.display = 'flex';
                } else {
                    modeAsk.checked = true;
                    fixedDirSection.style.display = 'none';
                }
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
        }
    };
    initSettings(); // Run on startup!

    // Toggle custom path selector based on radio choice
    const handleRadioChange = () => {
        if (modeFixed.checked) {
            fixedDirSection.style.display = 'flex';
        } else {
            fixedDirSection.style.display = 'none';
        }
    };

    modeSame.addEventListener('change', handleRadioChange);
    modeFixed.addEventListener('change', handleRadioChange);
    modeAsk.addEventListener('change', handleRadioChange);

    // Open settings modal
    globalSettingsBtn.addEventListener('click', async () => {
        await initSettings(); // reload persisted settings to ensure sync
        settingsModal.style.display = 'flex';
        setTimeout(() => {
            settingsModal.style.opacity = '1';
        }, 10);
    });

    // Close settings modal helper
    const closeSettingsModal = () => {
        settingsModal.style.opacity = '0';
        setTimeout(() => {
            settingsModal.style.display = 'none';
        }, 200);
    };

    closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    closeSettingsModalBtnSecondary.addEventListener('click', closeSettingsModal);

    // Browse Custom Directory
    browseOutputDirBtn.addEventListener('click', async () => {
        try {
            const selectedDir = await SelectFolder();
            if (selectedDir) {
                customDirPathInput.value = selectedDir;
            }
        } catch (err) {
            showToast("Failed to select folder");
        }
    });

    // Save Settings
    saveSettingsBtn.addEventListener('click', async () => {
        let mode = "ask";
        if (modeSame.checked) mode = "same";
        if (modeFixed.checked) mode = "fixed";

        const customDir = customDirPathInput.value.trim();

        if (mode === "fixed" && !customDir) {
            showToast("Please choose a folder or switch options!");
            return;
        }

        try {
            await SetOutputSettings(mode, customDir);
            showToast("Settings saved successfully!");
            closeSettingsModal();
        } catch (err) {
            showToast("Failed to save settings: " + err);
        }
    });

    copyCmdBtn.addEventListener('click', () => {
        const cmd = cmdPreText.value;
        navigator.clipboard.writeText(cmd)
            .then(() => {
                copyCmdBtnText.innerText = "Copied!";
                showToast("FFmpeg command copied to clipboard!");
            })
            .catch(err => {
                console.error("Failed to copy command:", err);
            });
    });

    runCustomCmdBtn.addEventListener('click', async () => {
        const cmd = cmdPreText.value.trim();
        if (!cmd) return;

        closeModal();
        showLoader(`Executing custom FFmpeg command...`, true);

        try {
            await RunCustomCommand(cmd, currentDuration);
            showPanel(encoderPanel);
            showToast(`Custom command executed successfully!`);
        } catch (err) {
            showPanel(encoderPanel);
            if (err && err.includes("cancelled")) return;
            showError("Custom Command Execution Error", err);
        }
    });
}

function generateFFmpegCommand() {
    if (!currentFilePath) return "Please select a file first.";

    let vCodecVal = encVCodec.value;
    if (vCodecVal === 'custom') vCodecVal = document.getElementById('encVCodecCustom').value.trim() || 'libx264';
    
    let aCodecVal = encACodec.value;
    if (aCodecVal === 'custom') aCodecVal = document.getElementById('encACodecCustom').value.trim() || 'aac';
    
    let vRateModeVal = "crf";
    if (modeCbrBtn.classList.contains('active')) vRateModeVal = "cbr";
    if (modeVbrBtn.classList.contains('active')) vRateModeVal = "vbr";
    
    let vBitrateVal = "";
    let vMaxBitrateVal = "";
    if (vRateModeVal === "cbr") {
        vBitrateVal = cbrBitrateInput.value + "k";
    } else if (vRateModeVal === "vbr") {
        vBitrateVal = vbrAvgInput.value + "k";
        vMaxBitrateVal = vbrMaxInput.value + "k";
    }
    
    const vCrfVal = parseInt(crfSlider.value);
    
    let resVal = encResolution.value;
    if (resVal === 'custom') {
        resVal = encResolutionCustom.value.trim().toLowerCase().replace('x', ':').replace('*', ':');
        if (!resVal) resVal = 'original';
    }
    
    let fpsVal = encFps.value;
    if (fpsVal === 'custom') {
        fpsVal = encFpsCustom.value.trim();
        if (!fpsVal) fpsVal = 'original';
    }
    
    const aspectVal = encAspectRatio.value;
    
    let aRateModeVal = "cbr";
    if (audioModeVbrBtn.classList.contains('active')) aRateModeVal = "vbr";
    
    let aBitrateVal = audioCbrSelect.value;
    if (aBitrateVal === 'custom') aBitrateVal = document.getElementById('audioCbrCustom').value.trim() || '192k';
    if (!aBitrateVal.endsWith('k') && !aBitrateVal.endsWith('K') && !aBitrateVal.endsWith('M') && !aBitrateVal.endsWith('m')) {
        if (!isNaN(parseInt(aBitrateVal))) aBitrateVal += 'k';
    }
    
    const aVbrVal = audioVbrSlider.value;
    
    const channelsVal = encAudioChannels.value;
    
    let targetFormatVal = encTargetFormat.value;
    if (targetFormatVal === 'custom') targetFormatVal = document.getElementById('encTargetFormatCustom').value.trim() || 'mp4';

    const staticImgVal = document.getElementById('encStaticImagePath').value.trim();
    const vPresetVal = document.getElementById('encPreset').value;

    // Build the string representation
    const args = ["ffmpeg", "-y"];
    
    if (window.advancedCutAvoidNegative && window.advancedCutStartTime && window.advancedCutEndTime) {
        args.push("-avoid_negative_ts", "make_zero");
    }

    if (staticImgVal) {
        if (fpsVal !== "original" && fpsVal !== "") {
            args.push("-framerate", fpsVal);
        } else {
            args.push("-framerate", "1");
        }
        
        if (window.advancedCutStartTime && window.advancedCutEndTime) {
            if (window.advancedCutSeekMode === "fast") {
                args.push("-ss", window.advancedCutStartTime, "-to", window.advancedCutEndTime);
            }
        }
        
        args.push("-loop", "1", "-i", `"${staticImgVal}"`);
        
        if (window.advancedCutStartTime && window.advancedCutEndTime && window.advancedCutSeekMode !== "fast") {
            args.push("-ss", window.advancedCutStartTime, "-to", window.advancedCutEndTime);
        }
        args.push("-i", `"${currentFilePath}"`);
        args.push("-map", "0:v:0", "-map", "1:a:0");
    } else {
        if (window.advancedCutStartTime && window.advancedCutEndTime) {
            if (window.advancedCutSeekMode === "fast") {
                args.push("-ss", window.advancedCutStartTime, "-to", window.advancedCutEndTime);
                args.push("-i", `"${currentFilePath}"`);
            } else {
                args.push("-i", `"${currentFilePath}"`);
                args.push("-ss", window.advancedCutStartTime, "-to", window.advancedCutEndTime);
            }
        } else {
            args.push("-i", `"${currentFilePath}"`);
        }
    }

    // --- Video Configuration ---
    let vCodecValFinal = vCodecVal;
    if (staticImgVal && (vCodecVal === "copy" || vCodecVal === "none")) {
        vCodecValFinal = "libx264";
    }

    if (vCodecValFinal === "copy") {
        args.push("-c:v", "copy");
    } else if (vCodecValFinal === "none") {
        args.push("-vn");
    } else {
        args.push("-c:v", vCodecValFinal);

        // Video filters
        const videoFilters = [];
        if (window.advancedCropFilter) {
            videoFilters.push(window.advancedCropFilter);
        }
        if (resVal !== "original" && resVal !== "") {
            videoFilters.push(`scale=${resVal}`);
        }
        if (fpsVal !== "original" && fpsVal !== "") {
            videoFilters.push(`fps=${fpsVal}`);
        }
        if (videoFilters.length > 0) {
            args.push("-vf", `"${videoFilters.join(',')}"`);
        }

        // Aspect Ratio
        if (aspectVal !== "original" && aspectVal !== "") {
            args.push("-aspect", aspectVal);
        }

        // Preset
        if (vPresetVal !== "none" && vPresetVal !== "") {
            args.push("-preset", vPresetVal);
        }

        // Rate Control Modes
        if (vRateModeVal === "cbr") {
            args.push("-b:v", vBitrateVal);
            args.push("-minrate", vBitrateVal);
            args.push("-maxrate", vBitrateVal);
            const doubleBuf = (parseInt(cbrBitrateInput.value) * 2) + "k";
            args.push("-bufsize", doubleBuf);
        } else if (vRateModeVal === "vbr") {
            args.push("-b:v", vBitrateVal);
            if (vMaxBitrateVal !== "") {
                args.push("-maxrate", vMaxBitrateVal);
                const doubleBuf = (parseInt(vbrMaxInput.value) * 2) + "k";
                args.push("-bufsize", doubleBuf);
            }
        } else if (vRateModeVal === "crf") {
            args.push("-crf", vCrfVal);
        }

        if (staticImgVal) {
            args.push("-pix_fmt", "yuv420p");
        }
    }

    // --- Audio Configuration ---
    if (aCodecVal === "copy") {
        args.push("-c:a", "copy");
    } else if (aCodecVal === "none") {
        args.push("-an");
    } else {
        args.push("-c:a", aCodecVal);

        // Audio Channels
        if (channelsVal !== "original" && channelsVal !== "") {
            args.push("-ac", channelsVal);
        }

        // Rate Control Modes
        if (aRateModeVal === "cbr") {
            args.push("-b:a", aBitrateVal);
        } else if (aRateModeVal === "vbr") {
            if (aCodecVal === "libopus") {
                args.push("-b:a", aBitrateVal);
                args.push("-vbr", "on");
            } else if (aCodecVal === "aac") {
                const qualityMap = {
                    "0": "2.0", "1": "1.8", "2": "1.5", "3": "1.2", "4": "1.0",
                    "5": "0.8", "6": "0.6", "7": "0.4", "8": "0.2", "9": "0.1",
                };
                const qVal = qualityMap[aVbrVal] || "1.0";
                args.push("-q:a", qVal);
            } else {
                args.push("-q:a", aVbrVal);
            }
        }
    }

    if (staticImgVal) {
        args.push("-shortest");
    }

    // Output Path placeholder
    let targetExt = targetFormatVal.toLowerCase();
    if (targetExt === "original" || targetExt === "") {
        const dotParts = currentFilePath.split('.');
        targetExt = dotParts[dotParts.length - 1].toLowerCase();
    }
    const cleanPath = currentFilePath.substring(0, currentFilePath.lastIndexOf('.')) || currentFilePath;
    const placeholderOutput = `"${cleanPath}_encoded.${targetExt}"`;
    args.push(placeholderOutput);

    return args.join(' ');
}

function calculateAndSyncAspectRatio(resStr) {
    if (!resStr || resStr === "original") return;
    
    // Normalize format to look like "width:height"
    const clean = resStr.toLowerCase().replace('x', ':').replace('*', ':').trim();
    const parts = clean.split(':');
    if (parts.length !== 2) return;
    
    const w = parseInt(parts[0]);
    const h = parseInt(parts[1]);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
    
    // Greatest Common Divisor calculator
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(w, h);
    const ratioW = w / divisor;
    const ratioH = h / divisor;
    
    const ratioStr = `${ratioW}:${ratioH}`;
    
    // Find matching option in the aspect ratio select box
    let hasMatch = false;
    for (let i = 0; i < encAspectRatio.options.length; i++) {
        const opt = encAspectRatio.options[i];
        if (opt.value === ratioStr) {
            encAspectRatio.value = ratioStr;
            hasMatch = true;
            break;
        }
    }
    
    // If no preset option matches this aspect ratio, create a dynamic option for it
    if (!hasMatch) {
        // First check if a dynamic option already exists, if so delete it or update it
        let dynamicOpt = document.getElementById('encAspectRatioDynamicOption');
        if (!dynamicOpt) {
            dynamicOpt = document.createElement('option');
            dynamicOpt.id = 'encAspectRatioDynamicOption';
            encAspectRatio.appendChild(dynamicOpt);
        }
        dynamicOpt.value = ratioStr;
        dynamicOpt.innerText = `Custom Ratio: ${ratioStr}`;
        encAspectRatio.value = ratioStr;
    }
}

// Run initializer
init();

let ytPlayer = null;
let ytReady = false;
let audioRef = null;
let audioListener = null;
let currentAudioState = null;
let userAuthorizedAudio = false;
let isAudioMaster = false;
let localVolumeModified = false;

window.onYouTubeIframeAPIReady = function() {
    ytReady = true;
    if (userAuthorizedAudio || isAudioMaster) {
        initYTPlayer();
    }
};

// Check if API is already loaded (just in case)
if (typeof YT !== 'undefined' && YT && YT.Player) {
    ytReady = true;
} else {
    // Dynamically load the YouTube Iframe API to ensure the callback fires
    (function() {
        if (document.getElementById('youtube-iframe-api')) return;
        var tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            document.head.appendChild(tag);
        }
    })();
}

function initYTPlayer() {
    if (!ytReady || ytPlayer) return;
    
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    if (currentAudioState) {
        applyAudioState(currentAudioState);
    }
}

function onPlayerStateChange(event) {
    // Keep looping if ended
    if (event.data === YT.PlayerState.ENDED && currentAudioState && currentAudioState.state === 'PLAYING') {
        ytPlayer.seekTo(currentAudioState.startTime || 0);
        ytPlayer.playVideo();
    }
}

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// =====================================
// MASTER CONTROLS
// =====================================
window.startMasterAudio = function() {
    const tableId = typeof getActiveTableId === 'function' ? getActiveTableId() : null;
    if (!window.dandoraDatabase || !tableId) return;
    const url = document.getElementById('audio-url-input').value;
    const vid = extractVideoId(url);
    if (!vid) return alert("Link do YouTube inválido.");
    
    const startSecs = parseInt(document.getElementById('audio-start-input').value) || 0;
    const vol = parseInt(document.getElementById('master-volume-input').value) || 50;

    window.dandoraDatabase.ref(`dandora_audio_${tableId}`).set({
        videoId: vid,
        state: 'PLAYING',
        startTime: startSecs,
        updatedAt: window.firebase.database.ServerValue.TIMESTAMP,
        masterVolume: vol
    });
};

window.pauseMasterAudio = function() {
    const tableId = typeof getActiveTableId === 'function' ? getActiveTableId() : null;
    if (!window.dandoraDatabase || !tableId || !currentAudioState) return;
    
    let currentPos = currentAudioState.startTime;
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        currentPos = ytPlayer.getCurrentTime();
    }
    
    window.dandoraDatabase.ref(`dandora_audio_${tableId}`).update({
        state: 'PAUSED',
        startTime: currentPos,
        updatedAt: window.firebase.database.ServerValue.TIMESTAMP
    });
};

window.resumeMasterAudio = function() {
    const tableId = typeof getActiveTableId === 'function' ? getActiveTableId() : null;
    if (!window.dandoraDatabase || !tableId || !currentAudioState) return;
    
    window.dandoraDatabase.ref(`dandora_audio_${tableId}`).update({
        state: 'PLAYING',
        updatedAt: window.firebase.database.ServerValue.TIMESTAMP
    });
};

window.stopMasterAudio = function() {
    const tableId = typeof getActiveTableId === 'function' ? getActiveTableId() : null;
    if (!window.dandoraDatabase || !tableId) return;
    
    window.dandoraDatabase.ref(`dandora_audio_${tableId}`).update({
        state: 'STOPPED',
        updatedAt: window.firebase.database.ServerValue.TIMESTAMP
    });
};

window.setMasterVolume = function(vol) {
    const tableId = typeof getActiveTableId === 'function' ? getActiveTableId() : null;
    if (!window.dandoraDatabase || !tableId) return;
    
    window.dandoraDatabase.ref(`dandora_audio_${tableId}`).update({
        masterVolume: parseInt(vol)
    });
};

// =====================================
// SYNC AND PLAYER LOGIC
// =====================================
window.initAudioForTable = function(tableId) {
    if (!window.dandoraDatabase) return;
    
    const mode = sessionStorage.getItem('currentMode');
    isAudioMaster = mode === 'master';
    
    // Master doesn't need to explicitly click "Ouvir Audio" to initialize API
    if (isAudioMaster && !ytPlayer && ytReady) {
        initYTPlayer();
    }
    
    if (audioRef && audioListener) {
        audioRef.off('value', audioListener);
    }
    
    audioRef = window.dandoraDatabase.ref(`dandora_audio_${tableId}`);
    audioListener = audioRef.on('value', (snapshot) => {
        const data = snapshot.val();
        currentAudioState = data;
        
        const widget = document.getElementById('player-audio-widget');
        if (!widget) return;

        if (!data || data.state === 'STOPPED') {
            widget.classList.add('hidden');
            if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
                ytPlayer.stopVideo();
            }
            return;
        }

        // Show widget when audio is active
        widget.classList.remove('hidden');
        
        if (data.state === 'PLAYING' || data.state === 'PAUSED') {
            if (!userAuthorizedAudio && !isAudioMaster) {
                document.getElementById('player-audio-status').textContent = "Áudio aguardando permissão...";
                document.getElementById('player-audio-status').style.color = "var(--text-muted)";
                document.getElementById('player-audio-auth-btn').style.display = 'block';
                return; 
            }
            applyAudioState(data);
        }
    });
};

function applyAudioState(data) {
    if (!ytPlayer || typeof ytPlayer.loadVideoById !== 'function') return;

    document.getElementById('player-audio-auth-btn').style.display = 'none';
    
    const statusText = document.getElementById('player-audio-status');
    const currentVideoId = ytPlayer.getVideoData ? ytPlayer.getVideoData().video_id : null;
    
    if (data.state === 'PLAYING') {
        statusText.textContent = "Tocando Trilha...";
        statusText.style.color = "#2ecc71";
        
        // Calculate offset based on network time difference
        const now = Date.now();
        // Fallback: If server offset is negative or weird, just use elapsed local time
        let elapsed = (now - data.updatedAt) / 1000;
        if (elapsed < 0) elapsed = 0; // Fix clock skew
        const targetTime = data.startTime + elapsed;
        
        if (currentVideoId !== data.videoId) {
            ytPlayer.loadVideoById(data.videoId, targetTime);
        } else {
            const currentTime = ytPlayer.getCurrentTime() || 0;
            if (Math.abs(currentTime - targetTime) > 3) {
                ytPlayer.seekTo(targetTime, true);
            }
            if (ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                ytPlayer.playVideo();
            }
        }
    } else if (data.state === 'PAUSED') {
        statusText.textContent = "Pausado";
        statusText.style.color = "var(--gold-dim)";
        
        if (currentVideoId !== data.videoId) {
            ytPlayer.cueVideoById(data.videoId, data.startTime);
        } else {
            ytPlayer.pauseVideo();
            ytPlayer.seekTo(data.startTime, true);
        }
    }
    
    // Apply volume if user hasn't overridden it
    if (!localVolumeModified && data.masterVolume !== undefined) {
        document.getElementById('player-volume-input').value = data.masterVolume;
        ytPlayer.setVolume(data.masterVolume);
    }
}

window.authorizePlayerAudio = function() {
    userAuthorizedAudio = true;
    document.getElementById('player-audio-auth-btn').style.display = 'none';
    
    if (!ytReady) {
        // If API script didn't load yet, try forcing it or waiting
        return;
    }
    if (!ytPlayer) {
        initYTPlayer();
    } else if (currentAudioState) {
        applyAudioState(currentAudioState);
    }
};

window.changeLocalVolume = function(val) {
    localVolumeModified = true;
    if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(val);
    }
};

// Interceptadores (Monkey Patching)
setTimeout(() => {
    if (typeof window.openTableManager === 'function') {
        const originalOpenTableManager = window.openTableManager;
        window.openTableManager = function(tid) {
            originalOpenTableManager(tid);
            window.initAudioForTable(tid);
        };
    }

    if (typeof window.openPlayerTable === 'function') {
        const originalOpenPlayerTable = window.openPlayerTable;
        window.openPlayerTable = function(tid) {
            originalOpenPlayerTable(tid);
            const actualMasterId = (typeof getActiveTableId === 'function') ? getActiveTableId() : tid;
            window.initAudioForTable(actualMasterId);
        };
    }
}, 1000);

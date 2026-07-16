let ytPlayer = null;
let ytReady = false;
let audioRef = null;
let audioListener = null;

// YouTube Iframe API ready callback
function onYouTubeIframeAPIReady() {
    ytReady = true;
}

function initYTPlayer(videoId, autoPlay = false) {
    if (!ytReady) return;
    
    if (ytPlayer) {
        ytPlayer.destroy();
    }
    
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
            'autoplay': autoPlay ? 1 : 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'loop': 1,
            'playlist': videoId // required for looping single video
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    const vol = document.getElementById('audio-volume').value;
    event.target.setVolume(vol);
    if (event.target.getPlayerState() !== YT.PlayerState.PLAYING) {
       event.target.playVideo();
    }
}

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function toggleAudioWidget() {
    const widget = document.getElementById('audio-widget');
    widget.classList.toggle('hidden');
    
    // Mostra os controles de mestre se for mestre
    const isMaster = sessionStorage.getItem('currentMode') === 'master';
    const masterControls = document.getElementById('audio-master-controls');
    if (masterControls) {
        masterControls.style.display = isMaster ? 'block' : 'none';
    }
}

// Master functions
function syncPlayAudio() {
    if (!firebase || !currentTableId) return;
    const url = document.getElementById('audio-url-input').value;
    const vid = extractVideoId(url);
    if (!vid) {
        alert("Link do YouTube inválido.");
        return;
    }
    
    firebase.database().ref(`dandora_audio_${currentTableId}`).set({
        videoId: vid,
        playing: true,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

function syncStopAudio() {
    if (!firebase || !currentTableId) return;
    firebase.database().ref(`dandora_audio_${currentTableId}`).set({
        playing: false,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// Listener global da mesa (chamado no app2.js / chat.js ou onde a mesa iniciar)
function initAudioForTable(tableId) {
    if (!firebase || !firebase.database) return;
    
    if (audioRef && audioListener) {
        audioRef.off('value', audioListener);
    }
    
    audioRef = firebase.database().ref(`dandora_audio_${tableId}`);
    
    audioListener = audioRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        if (data.playing && data.videoId) {
            // Se o player já existe e é o mesmo vídeo
            if (ytPlayer && ytPlayer.getVideoData && ytPlayer.getVideoData().video_id === data.videoId) {
                if (ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                    ytPlayer.playVideo();
                }
            } else {
                // Tentar carregar a API se ainda nÃ£o rolou
                if(!ytReady) {
                    setTimeout(() => initYTPlayer(data.videoId, true), 2000);
                } else {
                    initYTPlayer(data.videoId, true);
                }
            }
            document.getElementById('audio-fab').classList.remove('hidden');
            document.getElementById('audio-fab').style.animation = 'pulseGlow 2s infinite alternate';
        } else {
            if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
                ytPlayer.stopVideo();
            }
            document.getElementById('audio-fab').style.animation = 'none';
        }
    });
}

function changeLocalVolume(val) {
    if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(val);
    }
}

// Adicionamos a inicializaçÃ£o do áudio no abridor de mesa
const originalOpenTableManager = window.openTableManager;
if (originalOpenTableManager) {
    window.openTableManager = function(tid) {
        originalOpenTableManager(tid);
        initAudioForTable(tid);
        document.getElementById('audio-fab').classList.remove('hidden');
    }
}

const originalOpenPlayerTable = window.openPlayerTable;
if (originalOpenPlayerTable) {
    window.openPlayerTable = function(tid) {
        originalOpenPlayerTable(tid);
        const actualMasterId = getActiveTableId() || tid;
        initAudioForTable(actualMasterId);
        document.getElementById('audio-fab').classList.remove('hidden');
    }
}

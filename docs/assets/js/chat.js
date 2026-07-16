let currentChatTableId = null;
let chatRef = null;
let chatListener = null;
let unreadChatCount = 0;
let isChatOpen = false;
let allChatMessages = [];
let chatPlayers = new Set();

function toggleGlobalChat() {
    const container = document.getElementById('dandora-chat-container');
    const fabBadge = document.getElementById('chat-fab-badge');
    const headerBadge = document.getElementById('chat-unread-badge');
    
    if (container.classList.contains('closed')) {
        container.classList.remove('closed');
        isChatOpen = true;
        unreadChatCount = 0;
        if(fabBadge) fabBadge.style.display = 'none';
        if(headerBadge) headerBadge.style.display = 'none';
        scrollToBottom();
    } else {
        container.classList.add('closed');
        isChatOpen = false;
    }
}

function initChatForTable(tableId) {
    if (!firebase || !firebase.database) {
        console.warn("Firebase não inicializado para o Chat.");
        return;
    }
    if (currentChatTableId === tableId) return;
    
    if (chatRef && chatListener) {
        chatRef.off('child_added', chatListener);
    }
    
    currentChatTableId = tableId;
    allChatMessages = [];
    chatPlayers.clear();
    
    const fab = document.getElementById('chat-fab');
    if (fab) fab.classList.remove('hidden');
    
    document.getElementById('chat-messages').innerHTML = ''; 
    unreadChatCount = 0;
    
    // Reset Filters
    const playerSelect = document.getElementById('chat-filter-player');
    if (playerSelect) playerSelect.innerHTML = '<option value="all">Todos os Jogadores</option>';
    
    chatRef = firebase.database().ref(`dandora_chat_${tableId}`);
    chatListener = chatRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        allChatMessages.push(msg);
        
        // Add player to filter dropdown
        if (msg.senderEmail && !chatPlayers.has(msg.senderEmail)) {
            chatPlayers.add(msg.senderEmail);
            if (playerSelect) {
                const opt = document.createElement('option');
                opt.value = msg.senderEmail;
                opt.textContent = msg.senderName;
                playerSelect.appendChild(opt);
            }
            const whisperSelect = document.getElementById('chat-whisper-target');
            if (whisperSelect && msg.senderEmail !== window.currentUser?.email) {
                const optW = document.createElement('option');
                optW.value = msg.senderEmail;
                optW.textContent = `Sussurrar: ${msg.senderName}`;
                whisperSelect.appendChild(optW);
            }
        }
        
        renderAllChatMessages();
        
        if (!isChatOpen) {
            unreadChatCount++;
            const fabBadge = document.getElementById('chat-fab-badge');
            const headerBadge = document.getElementById('chat-unread-badge');
            if (fabBadge) {
                fabBadge.textContent = unreadChatCount;
                fabBadge.style.display = 'block';
            }
            if (headerBadge) {
                headerBadge.textContent = unreadChatCount;
                headerBadge.style.display = 'block';
            }
        }
    });
}

function stopChat() {
    if (chatRef && chatListener) {
        chatRef.off('child_added', chatListener);
    }
    currentChatTableId = null;
    allChatMessages = [];
    chatPlayers.clear();
    const fab = document.getElementById('chat-fab');
    if (fab) fab.classList.add('hidden');
    document.getElementById('dandora-chat-container').classList.add('closed');
    isChatOpen = false;
}

window.filterChatMessages = function() {
    renderAllChatMessages();
};

function renderAllChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const searchInput = document.getElementById('chat-search');
    const playerSelect = document.getElementById('chat-filter-player');
    const typeSelect = document.getElementById('chat-filter-type');
    
    const searchStr = searchInput ? searchInput.value.toLowerCase() : '';
    const filterPlayer = playerSelect ? playerSelect.value : 'all';
    const filterType = typeSelect ? typeSelect.value : 'all';
    
    const wasScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 10;
    
    container.innerHTML = '';
    
    // Filtra as mensagens
    let filtered = allChatMessages.filter(msg => {
        // --- FILTRO DE WHISPERS ---
        if (msg.targetEmail && msg.targetEmail !== 'all') {
            const isMaster = sessionStorage.getItem('currentMode') === 'master';
            const isSender = (window.currentUser && msg.senderEmail === window.currentUser.email);
            const isTarget = (window.currentUser && msg.targetEmail === window.currentUser.email);
            const targetIsMaster = (msg.targetEmail === 'master');
            
            if (!isSender && !isTarget) {
                if (!(targetIsMaster && isMaster)) {
                    return false; // Esconder a mensagem completamente se não for para mim, nem sou o remetente, nem sou o mestre (se foi pro mestre)
                }
            }
        }
        
        // --- FILTROS DE DROPDOWN ---
        if (filterPlayer !== 'all' && msg.senderEmail !== filterPlayer) return false;
        
        if (filterType !== 'all') {
            if (filterType === 'text' && msg.type !== 'text' && msg.type !== 'image') return false;
            if (filterType === 'roll' && msg.type !== 'roll') return false;
            if (filterType === 'skill' && msg.type !== 'skill' && msg.type !== 'skill_share') return false;
            if (filterType === 'system' && msg.type !== 'system') return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="chat-placeholder">Nenhuma mensagem ainda.</div>';
        return;
    }
    
    let renderedCount = 0;
    
    filtered.forEach(msg => {
        if (searchStr) {
            let contentStr = '';
            if (msg.type === 'text' || msg.type === 'system') contentStr = msg.content;
            else if (msg.type === 'roll' || msg.type === 'skill' || msg.type === 'skill_share') {
                contentStr = msg.content; // It's a JSON string, searching raw JSON is fine enough for simple text match
            }
            if (!contentStr.toLowerCase().includes(searchStr)) return;
        }
        
        renderedCount++;
        
        const div = document.createElement('div');
        div.className = 'chat-message';
        
        const isMe = currentUser && msg.senderEmail === currentUser.email;
        if (isMe && msg.type !== 'system') div.classList.add('mine');
        
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let contentHtml = '';
        
        if (msg.type === 'image') {
            contentHtml = `<img src="${msg.content}" class="chat-img" onclick="window.open('${msg.content}', '_blank')">`;
        } else if (msg.type === 'roll') {
            let rollData = {};
            try { 
                rollData = JSON.parse(msg.content); 
                if (typeof rollData !== 'object' || rollData === null) {
                    rollData = { title: 'Rolagem', detail: msg.content, result: '?' };
                }
            } catch(e) { 
                rollData = { title: 'Rolagem', detail: msg.content, result: '?' }; 
            }
            
            let critBadge = '';
            let glowClass = '';
            let finalColor = 'var(--text-light)';
            
            // Suporte legado ou novo
            let isCritSuccess = rollData.isCritSuccess || false;
            let isCritFail = rollData.isCritFail || false;
            
            if (rollData && typeof rollData === 'object' && !('isCritSuccess' in rollData) && rollData.naturalRoll) {
                if (rollData.naturalRoll === 20) isCritSuccess = true;
                if (rollData.naturalRoll === 1) isCritFail = true;
            }
            
            if (isCritSuccess) {
                critBadge = '<span style="background:#3498db; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:10px;">✨ Acerto Crítico!</span>';
                glowClass = 'crit-success-glow';
                finalColor = '#3498db';
            } else if (isCritFail) {
                critBadge = '<span style="background:#e74c3c; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:10px;">💥 Falha Crítica!</span>';
                glowClass = 'crit-fail-glow';
                finalColor = '#e74c3c';
            }

            let extraDetails = '';
            if (rollData.formula) {
                extraDetails += `<div class="chat-roll-formula">${rollData.formula}</div>`;
            }
            if (rollData.diceStr) {
                extraDetails += `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">Dados: [${rollData.diceStr}]</div>`;
            }

            const isMaster = sessionStorage.getItem('currentMode') === 'master';
            const isSender = (window.currentUser && msg.senderEmail === window.currentUser.email);
            
            if (rollData.isSecret && !isMaster && !isSender) {
                contentHtml = `
                    <div class="chat-roll-card" style="border-color: #6a0dad; background: rgba(106, 13, 173, 0.1);">
                        <div class="chat-roll-title"><i class="fa-solid fa-user-secret"></i> Rolagem Secreta</div>
                        <div class="chat-roll-detail">O mestre está observando os dados rolarem nas sombras...</div>
                    </div>
                `;
            } else {
                let extraSecretBadge = rollData.isSecret ? '<span style="color: #6a0dad; font-size:0.8rem; border:1px solid #6a0dad; padding:2px 5px; border-radius:4px; margin-left:10px;"><i class="fa-solid fa-user-secret"></i> Secreta</span>' : '';
                contentHtml = `
                    <div class="chat-roll-card ${glowClass}">
                        <div class="chat-roll-title">${rollData.title} ${critBadge} ${extraSecretBadge}</div>
                        <div class="chat-roll-detail">${rollData.detail}</div>
                        ${extraDetails}
                        <div class="chat-roll-final" style="color: ${finalColor};">${rollData.result}</div>
                    </div>
                `;
            }
        } else if (msg.type === 'skill' || msg.type === 'skill_share') {
            let skillData = {};
            try { 
                skillData = JSON.parse(msg.content); 
                if (typeof skillData !== 'object' || skillData === null) {
                    skillData = { name: 'Habilidade', desc: msg.content };
                }
            } catch(e) { 
                skillData = { name: 'Habilidade', desc: msg.content }; 
            }
            
            let tagsHtml = '';
            if (skillData.cost) tagsHtml += `<span class="skill-tag"><i class="fa-solid fa-droplet"></i> Custo: ${skillData.cost}</span>`;
            if (skillData.range) tagsHtml += `<span class="skill-tag"><i class="fa-solid fa-arrows-alt-h"></i> Alcance: ${skillData.range}</span>`;
            if (skillData.duration) tagsHtml += `<span class="skill-tag"><i class="fa-regular fa-clock"></i> Duração: ${skillData.duration}</span>`;
            if (skillData.castTime) tagsHtml += `<span class="skill-tag"><i class="fa-solid fa-stopwatch"></i> Tempo: ${skillData.castTime}</span>`;
            
            contentHtml = `
                <div class="chat-skill-card">
                    <div class="chat-skill-title"><i class="fa-solid fa-bolt"></i> ${skillData.name}</div>
                    ${tagsHtml ? `<div class="chat-skill-meta">${tagsHtml}</div>` : ''}
                    <div class="chat-skill-desc">${skillData.desc}</div>
                </div>
            `;
        } else if (msg.type === 'system') {
            contentHtml = `<div class="chat-system-card"><i class="fa-solid fa-info-circle"></i> ${msg.content}</div>`;
        } else {
            // text
            contentHtml = `<div class="chat-text">${msg.content}</div>`;
        }
        
        let whisperBadge = '';
        if (msg.targetEmail && msg.targetEmail !== 'all') {
            whisperBadge = '<span style="color:#6a0dad; font-size:0.8rem; margin-left: 8px;"><i class="fa-solid fa-user-secret"></i> (Sussurro)</span>';
        }

        if (msg.type === 'system') {
            div.innerHTML = contentHtml; // System messages don't have standard headers
        } else {
            div.innerHTML = `
                <div class="chat-meta">
                    <span class="chat-sender">${msg.senderName} ${whisperBadge}</span>
                    <span class="chat-time">${timeStr}</span>
                </div>
                ${contentHtml}
            `;
        }
        
        container.appendChild(div);
    });
    
    if (renderedCount === 0) {
        container.innerHTML = '<div class="chat-placeholder">Nenhuma mensagem corresponde aos filtros.</div>';
    }
    
    // Auto-scroll logic
    if (isChatOpen && wasScrolledToBottom) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
}

window.sendChatMessage = function() {
    const input = document.getElementById('chat-input');
    const whisperTarget = document.getElementById('chat-whisper-target');
    const text = input.value.trim();
    if (!text) return;
    
    if (!currentChatTableId || !firebase) {
        alert('Não conectado ao chat da mesa.');
        return;
    }
    
    input.disabled = true;
    
    const msg = {
        senderEmail: currentUser.email,
        senderName: currentUser.name,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: 'text',
        content: text
    };
    
    if (whisperTarget && whisperTarget.value !== 'all') {
        msg.targetEmail = whisperTarget.value;
    }
    
    chatRef.push(msg).then(() => {
        input.value = '';
        input.disabled = false;
        input.focus();
    }).catch(err => {
        console.error("Erro ao enviar mensagem:", err);
        input.disabled = false;
        alert("Erro ao enviar mensagem.");
    });
};

window.handleChatKeyPress = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
};

// Compress and send image
function handleChatImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !currentChatTableId || !currentUser) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX = 800;
            
            if (width > height) {
                if (width > MAX) {
                    height *= MAX / width;
                    width = MAX;
                }
            } else {
                if (height > MAX) {
                    width *= MAX / height;
                    height = MAX;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            
            const msg = {
                senderName: getMode() === 'master' ? `${currentUser.name} (Mestre)` : currentUser.name,
                senderEmail: currentUser.email,
                timestamp: Date.now(),
                type: 'image',
                content: dataUrl
            };
            
            chatRef.push(msg);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

// Escuta mensagens do iframe (Ficha site)
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'DANDORA_CHAT_MSG' && currentChatTableId && currentUser) {
        const payload = e.data.payload;
        
        const msg = {
            senderName: currentUser.name,
            senderEmail: currentUser.email,
            timestamp: Date.now(),
            type: payload.type,
            content: payload.content
        };
        
        chatRef.push(msg);
    }
});

// Escuta atualizações do Firebase Sync para reconectar o chat se o ID da mesa tiver sido atualizado
window.addEventListener('dandoraDataSync', () => {
    let tid = null;
    if (typeof getActiveTableId === 'function') {
        tid = getActiveTableId();
    } else {
        tid = typeof currentTableId !== 'undefined' ? currentTableId : null;
    }
    
    if (tid && tid !== currentChatTableId) {
        if (typeof initChatForTable === 'function') {
            initChatForTable(tid);
        }
    }
});

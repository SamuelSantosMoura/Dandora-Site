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
    
    if (allChatMessages.length === 0) {
        container.innerHTML = '<div class="chat-placeholder">Nenhuma mensagem ainda.</div>';
        return;
    }
    
    let renderedCount = 0;
    
    allChatMessages.forEach(msg => {
        // Filter logic
        if (filterPlayer !== 'all' && msg.senderEmail !== filterPlayer) return;
        
        let typeMatch = true;
        if (filterType === 'text') typeMatch = (msg.type === 'text' || msg.type === 'image');
        else if (filterType === 'roll') typeMatch = (msg.type === 'roll');
        else if (filterType === 'skill') typeMatch = (msg.type === 'skill' || msg.type === 'skill_share');
        else if (filterType === 'system') typeMatch = (msg.type === 'system');
        
        if (!typeMatch) return;
        
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
            let rollData;
            try { rollData = JSON.parse(msg.content); } catch(e) { rollData = { title: 'Rolagem', detail: msg.content, result: '?' }; }
            
            let critBadge = '';
            let glowClass = '';
            let finalColor = 'var(--text-light)';
            
            // Suporte legado ou novo
            let isCritSuccess = rollData.isCritSuccess || false;
            let isCritFail = rollData.isCritFail || false;
            
            if (!rollData.hasOwnProperty('isCritSuccess') && rollData.naturalRoll) {
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

            contentHtml = `
                <div class="chat-roll-card ${glowClass}">
                    <div class="chat-roll-title">${rollData.title} ${critBadge}</div>
                    <div class="chat-roll-detail">${rollData.detail}</div>
                    ${extraDetails}
                    <div class="chat-roll-final" style="color: ${finalColor};">${rollData.result}</div>
                </div>
            `;
        } else if (msg.type === 'skill' || msg.type === 'skill_share') {
            let skillData;
            try { skillData = JSON.parse(msg.content); } catch(e) { skillData = { name: 'Habilidade', desc: msg.content }; }
            
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
        
        if (msg.type === 'system') {
            div.innerHTML = contentHtml; // System messages don't have standard headers
        } else {
            div.innerHTML = `
                <div class="chat-meta">
                    <span class="chat-sender">${msg.senderName}</span>
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

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !currentChatTableId || !currentUser) return;
    
    const msg = {
        senderName: getMode() === 'master' ? `${currentUser.name} (Mestre)` : currentUser.name,
        senderEmail: currentUser.email,
        timestamp: Date.now(),
        type: 'text',
        content: text
    };
    
    chatRef.push(msg);
    input.value = '';
    input.style.height = 'auto';
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

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

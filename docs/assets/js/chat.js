let currentChatTableId = null;
let chatRef = null;
let chatListener = null;
let unreadChatCount = 0;
let isChatOpen = false;

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
    if (currentChatTableId === tableId) return; // already listening to this table
    
    if (chatRef && chatListener) {
        chatRef.off('child_added', chatListener);
    }
    
    currentChatTableId = tableId;
    const fab = document.getElementById('chat-fab');
    if (fab) fab.classList.remove('hidden');
    
    document.getElementById('chat-messages').innerHTML = ''; // Limpar mensagens antigas
    unreadChatCount = 0;
    
    chatRef = firebase.database().ref(`dandora_chat_${tableId}`);
    chatListener = chatRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        renderChatMessage(msg);
        
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
    const fab = document.getElementById('chat-fab');
    if (fab) fab.classList.add('hidden');
    document.getElementById('dandora-chat-container').classList.add('closed');
    isChatOpen = false;
}

function renderChatMessage(msg) {
    const container = document.getElementById('chat-messages');
    
    const div = document.createElement('div');
    div.className = 'chat-message';
    
    const isMe = currentUser && msg.senderEmail === currentUser.email;
    if (isMe) div.classList.add('mine');
    
    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let contentHtml = '';
    
    if (msg.type === 'image') {
        contentHtml = `<img src="${msg.content}" class="chat-img" onclick="window.open('${msg.content}', '_blank')">`;
    } else if (msg.type === 'roll') {
        // Roll data (from master or player)
        let rollData;
        try { rollData = JSON.parse(msg.content); } catch(e) { rollData = msg.content; }
        
        let critBadge = '';
        let glowClass = '';
        let finalColor = 'var(--text-light)';
        
        if (rollData.isCritSuccess) {
            critBadge = '<span style="background:#3498db; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:10px;">✨ Acerto Crítico!</span>';
            glowClass = 'crit-success-glow';
            finalColor = '#3498db';
        } else if (rollData.isCritFail) {
            critBadge = '<span style="background:#e74c3c; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:10px;">💥 Falha Crítica!</span>';
            glowClass = 'crit-fail-glow';
            finalColor = '#e74c3c';
        }

        contentHtml = `
            <div class="chat-roll-card ${glowClass}">
                <div class="chat-roll-title">${rollData.title} ${critBadge}</div>
                <div class="chat-roll-detail">${rollData.detail}</div>
                <div class="chat-roll-final" style="color: ${finalColor};">${rollData.result}</div>
            </div>
        `;
    } else if (msg.type === 'skill') {
        // Skill usage
        let skillData;
        try { skillData = JSON.parse(msg.content); } catch(e) { skillData = msg.content; }
        
        contentHtml = `
            <div class="chat-skill-card">
                <div class="chat-skill-title"><i class="fa-solid fa-bolt"></i> ${skillData.name}</div>
                <div class="chat-skill-desc">${skillData.desc}</div>
            </div>
        `;
    } else {
        // text
        contentHtml = `<div class="chat-text">${msg.content}</div>`;
    }
    
    div.innerHTML = `
        <div class="chat-meta">
            <span class="chat-sender">${msg.senderName}</span>
            <span class="chat-time">${timeStr}</span>
        </div>
        ${contentHtml}
    `;
    
    container.appendChild(div);
    
    // Auto-scroll só se estiver próximo ao fundo ou se for mensagem própria
    if (isChatOpen) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
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
    input.style.height = 'auto'; // reset textarea height
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
            // Resize image to max 800px width/height to save DB space
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
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress quality
            
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
    e.target.value = ''; // reset input
}

// Escuta mensagens do iframe (Ficha site)
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'DANDORA_CHAT_MSG' && currentChatTableId && currentUser) {
        // Envia a mensagem recebida da ficha para o Firebase
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

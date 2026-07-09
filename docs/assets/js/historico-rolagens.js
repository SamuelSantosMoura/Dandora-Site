let historyRef = null;
let historyListener = null;
let allRolls = []; // Guardará os últimos 100 eventos de rolagens

// Inicializa a escuta do histórico para a mesa atual
function initHistoryForTable(tableId) {
    if (!firebase || !firebase.database) return;
    
    if (historyRef && historyListener) {
        historyRef.off('child_added', historyListener);
    }
    
    allRolls = [];
    renderHistoryView();
    
    historyRef = firebase.database().ref(`dandora_chat_${tableId}`);
    
    historyListener = historyRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        if (msg.type === 'roll' || msg.type === 'skill') {
            // Processa mensagem
            let parsedContent;
            try {
                parsedContent = JSON.parse(msg.content);
            } catch(e) {
                parsedContent = { title: 'Desconhecido', detail: msg.content };
            }
            
            allRolls.push({
                ...msg,
                parsed: parsedContent
            });
            
            // Renderiza atualização se as abas estiverem abertas
            renderHistoryView();
        }
    });
}

function stopHistory() {
    if (historyRef && historyListener) {
        historyRef.off('child_added', historyListener);
    }
    allRolls = [];
}

// Renderiza a visão tanto para Mestre quanto Jogador
function renderHistoryView() {
    const isMaster = getMode() === 'master';
    const containerId = isMaster ? 'tm-history-list' : 'pt-history-list';
    const filterPlayerId = isMaster ? 'tm-history-player' : 'pt-history-player';
    const filterSearchId = isMaster ? 'tm-history-search' : 'pt-history-search';
    
    const container = document.getElementById(containerId);
    if (!container) return; // Aba não existe na view atual
    
    const filterPlayer = document.getElementById(filterPlayerId)?.value || 'all';
    const filterSearch = (document.getElementById(filterSearchId)?.value || '').toLowerCase();
    
    // Filtragem
    let filtered = allRolls.filter(r => {
        if (filterPlayer !== 'all' && r.senderEmail !== filterPlayer) return false;
        
        if (filterSearch) {
            const title = (r.parsed.title || r.parsed.name || '').toLowerCase();
            const detail = (r.parsed.detail || r.parsed.desc || '').toLowerCase();
            const resultStr = String(r.parsed.result || '').toLowerCase();
            const playerName = (r.senderName || '').toLowerCase();
            if (!title.includes(filterSearch) && !detail.includes(filterSearch) && !resultStr.includes(filterSearch) && !playerName.includes(filterSearch)) {
                return false;
            }
        }
        return true;
    });
    
    // Ordenação (Mais recente primeiro)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    // Renderização
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Nenhuma rolagem ou habilidade encontrada.</div>';
        return;
    }
    
    filtered.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'history-card glass-panel';
        div.style.marginBottom = '15px';
        div.style.padding = '15px';
        div.style.borderLeft = '4px solid var(--gold-primary)';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '8px';
        
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        
        let headerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-family:var(--font-epic); color:var(--gold-light); font-size:1.1rem;">${msg.senderName}</span>
                <span style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-regular fa-clock"></i> ${timeStr}</span>
            </div>
        `;
        
        let contentHTML = '';
        if (msg.type === 'roll') {
            let isCritSuccess = false;
            let isCritFail = false;
            let resultColor = 'var(--text-light)';
            
            if (msg.parsed.naturalRoll) {
                if (msg.parsed.naturalRoll === 20) {
                    isCritSuccess = true;
                    resultColor = '#2ecc71'; // Verde
                } else if (msg.parsed.naturalRoll === 1) {
                    isCritFail = true;
                    resultColor = '#e74c3c'; // Vermelho
                }
            }
            
            const badge = isCritSuccess ? '<span style="background:#2ecc71; color:#000; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:10px;">CRÍTICO!</span>' 
                        : (isCritFail ? '<span style="background:#e74c3c; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:10px;">FALHA CRÍTICA!</span>' : '');
            
            contentHTML = `
                <div style="font-size:1.05rem; font-weight:bold;">${msg.parsed.title} ${badge}</div>
                <div style="font-size:0.9rem; color:var(--text-muted);">${msg.parsed.detail}</div>
                <div style="font-size:1.4rem; font-family:var(--font-epic); color:${resultColor}; margin-top:5px;">Resultado: ${msg.parsed.result}</div>
            `;
            if (isCritSuccess) div.style.borderLeftColor = '#2ecc71';
            if (isCritFail) div.style.borderLeftColor = '#e74c3c';
            
        } else if (msg.type === 'skill') {
            contentHTML = `
                <div style="font-size:1.05rem; font-weight:bold; color:var(--primary-color);"><i class="fa-solid fa-bolt"></i> ${msg.parsed.name}</div>
                <div style="font-size:0.9rem; color:var(--text-muted); white-space:pre-wrap;">${msg.parsed.desc}</div>
            `;
            div.style.borderLeftColor = 'var(--primary-color)';
        }
        
        div.innerHTML = headerHTML + contentHTML;
        container.appendChild(div);
    });
}

// Hooks chamados pelos filtros no HTML
window.onHistoryFilterChange = function() {
    renderHistoryView();
};

window.populateHistoryPlayerSelect = function(tableId) {
    const membersKey = `dandora_table_members_${tableId}`;
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];
    
    // Atualiza para o Mestre
    const tmSelect = document.getElementById('tm-history-player');
    if (tmSelect) {
        tmSelect.innerHTML = '<option value="all">Todos os Jogadores</option>';
        members.forEach(m => {
            tmSelect.innerHTML += `<option value="${m.playerEmail}">${m.playerName}</option>`;
        });
    }
    
    // Atualiza para o Jogador
    const ptSelect = document.getElementById('pt-history-player');
    if (ptSelect) {
        ptSelect.innerHTML = '<option value="all">Todos os Jogadores</option>';
        members.forEach(m => {
            ptSelect.innerHTML += `<option value="${m.playerEmail}">${m.playerName}</option>`;
        });
    }
};

// Integração com a navegação principal (chamado por app2.js quando uma mesa é aberta)
function initHistory() {
    let tid = null;
    if (typeof getActiveTableId === 'function') {
        tid = getActiveTableId();
    } else {
        tid = typeof currentTableId !== 'undefined' ? currentTableId : null;
    }
    if (tid) {
        initHistoryForTable(tid);
        populateHistoryPlayerSelect(tid);
    }
}

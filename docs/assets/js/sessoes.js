// ==========================================
// SESSIONS MANAGER (DIÁRIO DE CAMPANHA)
// ==========================================

let currentSessionEditingId = null;

function createNewSession(sessionId = null) {
    if (!currentTableId) {
        alert("Nenhuma mesa selecionada.");
        return;
    }
    
    currentSessionEditingId = sessionId;
    const modal = document.getElementById('session-modal');
    const titleEl = document.getElementById('session-modal-title');
    
    if (sessionId) {
        titleEl.textContent = "Editar Sessão";
        const sessions = JSON.parse(localStorage.getItem(`dandora_sessions_${currentTableId}`)) || [];
        const s = sessions.find(x => x.id === sessionId);
        if (s) {
            document.getElementById('ss-title').value = s.title || '';
            document.getElementById('ss-status').value = s.status || 'Planejada';
            document.getElementById('ss-summary').value = s.summary || '';
            document.getElementById('ss-events').value = s.events || '';
            document.getElementById('ss-combats').value = s.combats || '';
            document.getElementById('ss-npcs').value = s.npcs || '';
            document.getElementById('ss-locations').value = s.locations || '';
            document.getElementById('ss-notes').value = s.notes || '';
        }
    } else {
        titleEl.textContent = "Planejar Sessão";
        document.getElementById('session-form').reset();
        
        // Auto-title
        const sessions = JSON.parse(localStorage.getItem(`dandora_sessions_${currentTableId}`)) || [];
        document.getElementById('ss-title').value = `Sessão ${sessions.length + 1}`;
        document.getElementById('ss-status').value = 'Planejada';
    }
    
    modal.showModal();
}

function closeSessionModal() {
    document.getElementById('session-modal').close();
    currentSessionEditingId = null;
}

function saveSession(event) {
    event.preventDefault();
    if (!currentTableId) return;
    
    const key = `dandora_sessions_${currentTableId}`;
    let sessions = JSON.parse(localStorage.getItem(key)) || [];
    
    const sessionData = {
        title: document.getElementById('ss-title').value,
        status: document.getElementById('ss-status').value,
        summary: document.getElementById('ss-summary').value,
        events: document.getElementById('ss-events').value,
        combats: document.getElementById('ss-combats').value,
        npcs: document.getElementById('ss-npcs').value,
        locations: document.getElementById('ss-locations').value,
        notes: document.getElementById('ss-notes').value,
        lastEdited: new Date().toISOString()
    };
    
    if (currentSessionEditingId) {
        const index = sessions.findIndex(x => x.id === currentSessionEditingId);
        if (index > -1) {
            sessions[index] = { ...sessions[index], ...sessionData };
        }
    } else {
        sessions.push({
            id: Date.now().toString(),
            ...sessionData
        });
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));
    closeSessionModal();
    renderSessions();
}

function renderSessions() {
    const list = document.getElementById('tm-sessions-list');
    if (!list || !currentTableId) return;
    
    const sessions = JSON.parse(localStorage.getItem(`dandora_sessions_${currentTableId}`)) || [];
    
    if (sessions.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; margin-top:2rem;">Nenhuma sessão planejada. Clique em "Nova Sessão" para organizar a campanha.</p>`;
        return;
    }
    
    list.innerHTML = sessions.map(s => {
        let statusColor = "var(--text-muted)";
        let statusIcon = "fa-calendar";
        let scrollBg = "rgba(26, 20, 15, 0.95)";
        
        if (s.status === 'Em andamento') {
            statusColor = "#e0a96d";
            statusIcon = "fa-fire";
            scrollBg = "rgba(40, 30, 20, 0.95)";
        } else if (s.status === 'Concluída') {
            statusColor = "#6da0e0";
            statusIcon = "fa-check-double";
            scrollBg = "rgba(15, 20, 25, 0.95)";
        }
        
        return `
        <div class="session-scroll ${s.status === 'Concluída' ? 'session-completed' : ''}" style="position:relative; background-color: ${scrollBg}; border: 1px solid var(--gold-dim); border-left: 4px solid ${statusColor}; border-radius: 4px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 1rem;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.8rem;">
                <div>
                    <h3 style="font-family:'Cinzel',serif; color:var(--gold-primary); margin:0; font-size: 1.3rem;">${s.title}</h3>
                    <div style="color:${statusColor}; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-top:0.3rem;"><i class="fa-solid ${statusIcon}"></i> ${s.status}</div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="btn-outline" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="createNewSession('${s.id}')" title="Editar"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-outline" style="padding:0.4rem 0.8rem; font-size:0.85rem; border-color:#e07060; color:#e07060;" onclick="deleteSession('${s.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            
            <div style="font-size:0.95rem; line-height:1.6; color:var(--text-light);">
                ${s.summary ? `<p style="margin-bottom:0.8rem;"><strong>Resumo:</strong><br>${s.summary.replace(/\\n/g, '<br>')}</p>` : ''}
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-top:1rem; padding-top:1rem; border-top: 1px dashed rgba(212,175,55,0.2);">
                    ${s.events ? `<div><strong style="color:var(--gold-dim); font-size:0.85rem; text-transform:uppercase;">Cenas Importantes</strong><p style="margin-top:0.3rem; font-size:0.9rem;">${s.events.replace(/\\n/g, '<br>')}</p></div>` : ''}
                    ${s.combats ? `<div><strong style="color:var(--gold-dim); font-size:0.85rem; text-transform:uppercase;">Combates</strong><p style="margin-top:0.3rem; font-size:0.9rem;">${s.combats.replace(/\\n/g, '<br>')}</p></div>` : ''}
                </div>
                
                <div style="display:flex; gap:2rem; margin-top:1rem; padding-top:1rem; border-top: 1px dashed rgba(212,175,55,0.2);">
                    ${s.npcs ? `<div><strong style="color:var(--gold-dim); font-size:0.85rem; text-transform:uppercase;"><i class="fa-solid fa-users"></i> NPCs:</strong> <span style="font-size:0.9rem;">${s.npcs}</span></div>` : ''}
                    ${s.locations ? `<div><strong style="color:var(--gold-dim); font-size:0.85rem; text-transform:uppercase;"><i class="fa-solid fa-map"></i> Locais:</strong> <span style="font-size:0.9rem;">${s.locations}</span></div>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function deleteSession(id) {
    if (!confirm("Tem certeza que deseja excluir esta sessão? Essa ação não pode ser desfeita.")) return;
    const key = `dandora_sessions_${currentTableId}`;
    let sessions = JSON.parse(localStorage.getItem(key)) || [];
    sessions = sessions.filter(s => s.id !== id);
    localStorage.setItem(key, JSON.stringify(sessions));
    renderSessions();
}

// Intercept tab switching to render content
const _originalSwitchTableTabSessions = switchTableTab;
switchTableTab = function(tabId) {
    _originalSwitchTableTabSessions(tabId);
    if (tabId === 'tm-sessions') {
        renderSessions();
    }
}

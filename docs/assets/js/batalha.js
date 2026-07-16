// ==========================================
// GERENCIADOR DE BATALHA (Mestre)
// ==========================================

let battleMonsters = [];

// ==========================================
// RENDERIZAR JOGADORES NA BATALHA
// ==========================================
function renderBattlePlayers() {
    const grid = document.getElementById('battle-players-grid');
    if (!grid) return;
    
    const mode = typeof getMode === 'function' ? getMode() : (sessionStorage.getItem('currentMode') || localStorage.getItem('dandora_currentMode'));
    if (mode !== 'master' || !currentTableId) return;

    const membersKey = `dandora_table_members_${currentTableId}`;
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];
    
    if (members.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted);">Nenhum jogador na mesa.</div>';
        return;
    }
    
    let html = '';
    members.forEach((m, idx) => {
        const sheetKey = `dandora_sheet_${currentTableId}_${m.playerEmail}`;
        const storedSheet = JSON.parse(localStorage.getItem(sheetKey));
        const p = storedSheet || m.activeSheet || m.activeSheetSummary;
        
        if (p && p.nome) {
            const hpAtual = parseInt(p.vidaAtual || p.pv_atual) || 0;
            const hpMax = parseInt(p.vidaMax || p.pv_max) || 1;
            const hpPercent = Math.max(0, Math.min(100, (hpAtual / hpMax) * 100));
            const isDead = hpAtual <= 0;
            
            const paAtual = parseInt(p.paAtual || p.pa_atual) || 0;
            const paMax = parseInt(p.paMax || p.pa_max) || 1;
            const paPercent = Math.max(0, Math.min(100, (paAtual / paMax) * 100));
            
            const ca = parseInt(p.ca || p.classeArmadura || p.classe_armadura) || 10;
            
            // Tratamento de condições (string separada por vírgula no nosso caso, ou array se implementarmos depois)
            let condicoesHTML = '';
            let condicoesArr = [];
            if (p.condicoes) {
                if (Array.isArray(p.condicoes)) condicoesArr = p.condicoes;
                else if (typeof p.condicoes === 'string' && p.condicoes.trim()) condicoesArr = p.condicoes.split(',').map(c => c.trim());
            }
            if (condicoesArr.length > 0) {
                condicoesHTML = condicoesArr.map(c => `<span class="badge" style="background:#e67e22; color:#fff; padding:2px 5px; border-radius:4px; font-size:0.7rem; margin-right:4px;">${c}</span>`).join('');
            } else {
                condicoesHTML = '<span style="font-size:0.75rem; color:var(--text-muted);">Normal</span>';
            }

            const portrait = p.portrait ? `<img src="${p.portrait}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid ${isDead ? '#555' : 'var(--gold-dim)'}; filter: ${isDead ? 'grayscale(100%)' : 'none'};">` : `<i class="fa-solid fa-user-shield" style="font-size: 2rem; color: ${isDead ? '#555' : 'var(--gold-primary)'};"></i>`;
            
            html += `
            <div class="table-card glass-panel" style="display:flex; flex-direction:column; gap:10px; position:relative; ${isDead ? 'opacity:0.8; filter: grayscale(50%); border-color:#555;' : ''}">
                
                <div style="display:flex; align-items:center; gap:10px;">
                    ${portrait}
                    <div style="flex:1;">
                        <h3 style="margin:0; font-size:1rem; color: ${isDead ? '#888' : 'var(--gold-primary)'};">${p.nome}</h3>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${m.playerName}</div>
                    </div>
                    <div style="text-align:center; background: rgba(0,0,0,0.4); border: 1px solid var(--gold-dim); padding: 4px 8px; border-radius: 4px;">
                        <div style="font-size:0.7rem; color:var(--gold-dim);">CA</div>
                        <div style="font-size:1.1rem; font-weight:bold;">${ca}</div>
                    </div>
                </div>

                <div style="font-size: 0.8rem; margin-top: 5px;">
                    <div>Condições: ${condicoesHTML} <button onclick="addPlayerCondition('${m.playerEmail}')" style="background:none;border:none;color:var(--gold-dim);cursor:pointer;" title="Adicionar Condição"><i class="fa-solid fa-plus-circle"></i></button></div>
                </div>

                <!-- VIDA -->
                <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.85rem;">
                        <span style="color:#e74c3c;"><i class="fa-solid fa-heart"></i> Vida</span>
                        <span><b>${hpAtual}</b> / ${hpMax}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden; margin-bottom:8px;">
                        <div style="height:100%; background:${isDead ? '#555' : '#e74c3c'}; width:${hpPercent}%; transition: width 0.3s;"></div>
                    </div>
                    <div style="display:flex; gap:4px; justify-content:space-between;">
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e74c3c; color:#e74c3c;" onclick="changePlayerStat('${m.playerEmail}', 'vidaAtual', -10)">-10</button>
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e74c3c; color:#e74c3c;" onclick="changePlayerStat('${m.playerEmail}', 'vidaAtual', -5)">-5</button>
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e74c3c; color:#e74c3c;" onclick="changePlayerStat('${m.playerEmail}', 'vidaAtual', -1)">-1</button>
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#2ecc71; color:#2ecc71;" onclick="changePlayerStat('${m.playerEmail}', 'vidaAtual', 1)">+1</button>
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#2ecc71; color:#2ecc71;" onclick="changePlayerStat('${m.playerEmail}', 'vidaAtual', 5)">+5</button>
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#2ecc71; color:#2ecc71;" onclick="changePlayerStat('${m.playerEmail}', 'vidaAtual', 10)">+10</button>
                    </div>
                </div>

                <!-- PONTOS DE AÇÃO -->
                <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.85rem;">
                        <span style="color:#3498db;"><i class="fa-solid fa-bolt"></i> PA</span>
                        <span><b>${paAtual}</b> / ${paMax}</span>
                    </div>
                    <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden; margin-bottom:8px;">
                        <div style="height:100%; background:#3498db; width:${paPercent}%; transition: width 0.3s;"></div>
                    </div>
                    <div style="display:flex; gap:4px; justify-content:space-between;">
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e67e22; color:#e67e22;" onclick="changePlayerStat('${m.playerEmail}', 'paAtual', -1)">-1</button>
                        <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#3498db; color:#3498db;" onclick="changePlayerStat('${m.playerEmail}', 'paAtual', 1)">+1</button>
                        <button class="btn-outline" style="flex:2; padding:2px; font-size:0.75rem;" onclick="setPlayerStat('${m.playerEmail}', 'paAtual', ${paMax})">Máx</button>
                    </div>
                </div>

            </div>
            `;
        } else {
            html += `
            <div class="table-card glass-panel" style="display:flex; flex-direction:column; gap:10px; position:relative; opacity:0.6; justify-content:center; align-items:center; min-height: 150px;">
                <i class="fa-solid fa-user-clock" style="font-size: 2rem; color: var(--text-muted);"></i>
                <h3 style="margin:0; font-size:1rem; color: var(--text-muted);">Aguardando Ficha</h3>
                <div style="font-size:0.8rem; color:var(--text-muted);">${m.playerName}</div>
            </div>
            `;
        }
    });
    
    grid.innerHTML = html;
}

function syncPlayerSheetDirect(playerEmail, data) {
    if (!currentTableId) return;
    const sheetKey = `dandora_sheet_${currentTableId}_${playerEmail}`;
    
    window.dandoraDisableSync = true;
    localStorage.setItem(sheetKey, JSON.stringify(data));
    window.dandoraDisableSync = false;
    
    if (window.dandoraDatabase) {
        try {
            const cleanData = JSON.parse(JSON.stringify(data));
            window.dandoraDatabase.ref('dandora_data/' + btoa(unescape(encodeURIComponent(sheetKey)))).update(cleanData);
        } catch(e) { console.error(e); }
    }
}

// Manipulação da Ficha do Jogador (Mestre -> Ficha)
function changePlayerStat(playerEmail, stat, delta) {
    if (!currentTableId) return;
    const sheetKey = `dandora_sheet_${currentTableId}_${playerEmail}`;
    const p = JSON.parse(localStorage.getItem(sheetKey));
    if (!p) return;
    
    // Suporte tanto para os nomes de propriedades legados quanto os novos da ficha (pv_atual)
    const statName = stat === 'vidaAtual' ? 'pv_atual' : (stat === 'paAtual' ? 'pa_atual' : stat);
    const maxStatName = stat === 'vidaAtual' ? 'pv_max' : (stat === 'paAtual' ? 'pa_max' : (stat === 'vidaMax' ? 'pv_max' : 'pa_max'));
    
    const maxValue = parseInt(p[maxStatName] || p[stat === 'vidaAtual' ? 'vidaMax' : 'paMax']) || 1;
    let currentVal = parseInt(p[statName] || p[stat]) || 0;
    
    currentVal += delta;
    if (currentVal < 0) currentVal = 0;
    if (currentVal > maxValue) currentVal = maxValue;
    
    // Atualiza ambas as propriedades para manter compatibilidade
    p[statName] = currentVal;
    p[stat] = currentVal;
    
    // Atualiza a vida visual da grid e Firebase
    syncPlayerSheetDirect(playerEmail, p);
    renderBattlePlayers(); // Atualiza local
}

function setPlayerStat(playerEmail, stat, value) {
    if (!currentTableId) return;
    const sheetKey = `dandora_sheet_${currentTableId}_${playerEmail}`;
    const p = JSON.parse(localStorage.getItem(sheetKey));
    if (!p) return;
    
    p[stat] = value;
    syncPlayerSheetDirect(playerEmail, p);
    renderBattlePlayers();
}

function addPlayerCondition(playerEmail) {
    const cond = prompt("Digite o nome da Condição (ex: Envenenado):");
    if (!cond) return;
    
    const sheetKey = `dandora_sheet_${currentTableId}_${playerEmail}`;
    const p = JSON.parse(localStorage.getItem(sheetKey));
    if (!p) return;
    
    let condicoesArr = [];
    if (p.condicoes) {
        if (Array.isArray(p.condicoes)) condicoesArr = p.condicoes;
        else if (typeof p.condicoes === 'string' && p.condicoes.trim()) condicoesArr = p.condicoes.split(',').map(c => c.trim());
    }
    
    condicoesArr.push(cond.trim());
    p.condicoes = condicoesArr.join(', ');
    
    syncPlayerSheetDirect(playerEmail, p);
    renderBattlePlayers();
}


// ==========================================
// RENDERIZAR MONSTROS NA BATALHA
// ==========================================
function initBattleMonsters() {
    if (!currentTableId) return;
    const data = localStorage.getItem(`dandora_battle_monsters_${currentTableId}`);
    if (data) {
        try {
            battleMonsters = JSON.parse(data);
        } catch(e) { battleMonsters = []; }
    } else {
        battleMonsters = [];
    }
}

function saveBattleMonsters() {
    if (!currentTableId) return;
    localStorage.setItem(`dandora_battle_monsters_${currentTableId}`, JSON.stringify(battleMonsters));
    // Sincronizar com Firebase no futuro se quiser que jogadores vejam
}

function addBattleMonster() {
    battleMonsters.push({
        id: crypto.randomUUID(),
        nome: 'Novo Monstro',
        vidaAtual: 20,
        vidaMax: 20,
        ca: 10,
        condicoes: [],
        iniciativa: 0
    });
    saveBattleMonsters();
    renderBattleMonsters();
}

function duplicateBattleMonster(id) {
    const m = battleMonsters.find(x => x.id === id);
    if (!m) return;
    battleMonsters.push({
        ...m,
        id: crypto.randomUUID(),
        nome: m.nome + ' (Cópia)'
    });
    saveBattleMonsters();
    renderBattleMonsters();
}

function removeBattleMonster(id) {
    if (!confirm("Remover este monstro da batalha?")) return;
    battleMonsters = battleMonsters.filter(x => x.id !== id);
    saveBattleMonsters();
    renderBattleMonsters();
}

function updateMonsterField(id, field, value) {
    const m = battleMonsters.find(x => x.id === id);
    if (m) {
        m[field] = value;
        if (field === 'vidaMax') {
            m.vidaAtual = value; // Ao alterar Max, recupera atual (convenience)
        }
        saveBattleMonsters();
        renderBattleMonsters();
    }
}

function changeMonsterHP(id, delta) {
    const m = battleMonsters.find(x => x.id === id);
    if (!m) return;
    
    let hp = parseInt(m.vidaAtual) || 0;
    hp += delta;
    if (hp < 0) hp = 0;
    const max = parseInt(m.vidaMax) || 1;
    if (hp > max) hp = max;
    
    m.vidaAtual = hp;
    saveBattleMonsters();
    renderBattleMonsters();
}

function renderBattleMonsters() {
    const grid = document.getElementById('battle-monsters-grid');
    if (!grid) return;
    
    if (battleMonsters.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); grid-column:1/-1;">Nenhum monstro na batalha. Clique em Novo Monstro.</div>';
        return;
    }
    
    let html = '';
    battleMonsters.forEach(m => {
        const hpAtual = parseInt(m.vidaAtual) || 0;
        const hpMax = parseInt(m.vidaMax) || 1;
        const hpPercent = Math.max(0, Math.min(100, (hpAtual / hpMax) * 100));
        const isDead = hpAtual <= 0;
        
        // Limiares
        const leve = m.limiarLeve !== undefined ? m.limiarLeve : Math.floor(hpMax * 0.75);
        const maior = m.limiarMaior !== undefined ? m.limiarMaior : Math.floor(hpMax * 0.50);
        const massivo = m.limiarMassivo !== undefined ? m.limiarMassivo : Math.floor(hpMax * 0.25);
        
        let condicoesHTML = '';
        if (m.condicoes && m.condicoes.length > 0) {
            condicoesHTML = m.condicoes.map((c, i) => `<span class="badge" style="background:#8e44ad; color:#fff; padding:2px 5px; border-radius:4px; font-size:0.7rem; margin-right:4px; cursor:pointer;" title="Remover" onclick="removeMonsterCondition('${m.id}', ${i})">${c} &times;</span>`).join('');
        } else {
            condicoesHTML = '<span style="font-size:0.75rem; color:var(--text-muted);">Normal</span>';
        }

        html += `
        <div class="table-card glass-panel" style="display:flex; flex-direction:column; gap:10px; position:relative; ${isDead ? 'opacity:0.8; filter: grayscale(50%); border-color:#555;' : ''}">
            
            <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px; z-index: 2;">
                <button class="btn-outline" style="padding: 3px 6px; font-size:0.7rem;" onclick="duplicateBattleMonster('${m.id}')" title="Duplicar"><i class="fa-solid fa-copy"></i></button>
                <button class="btn-outline" style="padding: 3px 6px; font-size:0.7rem; border-color: #e74c3c; color: #e74c3c;" onclick="removeBattleMonster('${m.id}')" title="Remover"><i class="fa-solid fa-trash"></i></button>
            </div>

            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <input type="text" class="input-modern" style="font-size: 1rem; font-weight: bold; width: 80%; background:transparent; padding:2px; border:none; border-bottom: 1px dashed rgba(255,255,255,0.3); color: ${isDead ? '#888' : 'var(--gold-primary)'};" value="${m.nome}" onchange="updateMonsterField('${m.id}', 'nome', this.value)" placeholder="Nome" title="Clique para editar o nome">
                </div>
            </div>

            <!-- STATUS -->
            <div style="display:flex; gap:10px; align-items:center;">
                <div style="text-align:center; background: rgba(0,0,0,0.4); border: 1px solid var(--gold-dim); padding: 4px 8px; border-radius: 4px;">
                    <div style="font-size:0.7rem; color:var(--gold-dim);">CA</div>
                    <input type="number" class="input-modern" style="width:40px; padding:2px; text-align:center; background:transparent; border:none;" value="${m.ca}" onchange="updateMonsterField('${m.id}', 'ca', this.value)">
                </div>
                <div style="text-align:center; background: rgba(0,0,0,0.4); border: 1px solid var(--gold-dim); padding: 4px 8px; border-radius: 4px;">
                    <div style="font-size:0.7rem; color:var(--gold-dim);">Iniciativa</div>
                    <input type="number" class="input-modern" style="width:40px; padding:2px; text-align:center; background:transparent; border:none;" value="${m.iniciativa}" onchange="updateMonsterField('${m.id}', 'iniciativa', this.value)">
                </div>
                <button class="btn-outline" style="padding: 5px;" onclick="addMonsterToInitiative('${m.id}')" title="Lançar na Iniciativa"><i class="fa-solid fa-bolt"></i></button>
            </div>

            <div style="font-size: 0.8rem;">
                <div>Condições: ${condicoesHTML} <button onclick="addMonsterCondition('${m.id}')" style="background:none;border:none;color:var(--gold-dim);cursor:pointer;" title="Adicionar Condição"><i class="fa-solid fa-plus-circle"></i></button></div>
            </div>

            <!-- VIDA -->
            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.85rem; align-items:center;">
                    <span style="color:#e74c3c;"><i class="fa-solid fa-heart"></i> Vida</span>
                    <div style="display:flex; gap:4px; align-items:center;">
                        <input type="number" class="input-modern" style="width:45px; padding:2px; text-align:center; background:transparent; border:none;" value="${m.vidaAtual}" onchange="updateMonsterField('${m.id}', 'vidaAtual', this.value)">
                        <span>/</span>
                        <input type="number" class="input-modern" style="width:45px; padding:2px; text-align:center; background:transparent; border:none;" value="${m.vidaMax}" onchange="updateMonsterField('${m.id}', 'vidaMax', this.value)">
                    </div>
                </div>
                <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden; margin-bottom:8px;">
                    <div style="height:100%; background:${isDead ? '#555' : '#8e44ad'}; width:${hpPercent}%; transition: width 0.3s;"></div>
                </div>
                <div style="display:flex; gap:4px; justify-content:space-between;">
                    <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e74c3c; color:#e74c3c;" onclick="changeMonsterHP('${m.id}', -10)">-10</button>
                    <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e74c3c; color:#e74c3c;" onclick="changeMonsterHP('${m.id}', -5)">-5</button>
                    <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#e74c3c; color:#e74c3c;" onclick="changeMonsterHP('${m.id}', -1)">-1</button>
                    <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#2ecc71; color:#2ecc71;" onclick="changeMonsterHP('${m.id}', 1)">+1</button>
                    <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#2ecc71; color:#2ecc71;" onclick="changeMonsterHP('${m.id}', 5)">+5</button>
                    <button class="btn-outline" style="flex:1; padding:2px; font-size:0.75rem; border-color:#2ecc71; color:#2ecc71;" onclick="changeMonsterHP('${m.id}', 10)">+10</button>
                </div>
                
                <!-- Limiares -->
                <div style="margin-top: 10px; display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 5px; align-items:center;">
                    <div title="Dano Leve" style="display:flex; align-items:center; gap:2px;">Leve: <input type="number" class="input-modern" style="width:30px; padding:0; text-align:center; background:transparent; border:none; border-bottom:1px dashed rgba(255,255,255,0.2); color:#f1c40f; font-size:0.7rem;" value="${leve}" onchange="updateMonsterField('${m.id}', 'limiarLeve', this.value)" title="Editar Dano Leve"></div>
                    <div title="Dano Maior" style="display:flex; align-items:center; gap:2px;">Maior: <input type="number" class="input-modern" style="width:30px; padding:0; text-align:center; background:transparent; border:none; border-bottom:1px dashed rgba(255,255,255,0.2); color:#e67e22; font-size:0.7rem;" value="${maior}" onchange="updateMonsterField('${m.id}', 'limiarMaior', this.value)" title="Editar Dano Maior"></div>
                    <div title="Dano Massivo" style="display:flex; align-items:center; gap:2px;">Massivo: <input type="number" class="input-modern" style="width:30px; padding:0; text-align:center; background:transparent; border:none; border-bottom:1px dashed rgba(255,255,255,0.2); color:#e74c3c; font-size:0.7rem;" value="${massivo}" onchange="updateMonsterField('${m.id}', 'limiarMassivo', this.value)" title="Editar Dano Massivo"></div>
                </div>
            </div>

        </div>
        `;
    });
    
    grid.innerHTML = html;
}

function addMonsterCondition(id) {
    const cond = prompt("Digite o nome da Condição:");
    if (!cond) return;
    const m = battleMonsters.find(x => x.id === id);
    if (!m) return;
    if (!m.condicoes) m.condicoes = [];
    m.condicoes.push(cond.trim());
    saveBattleMonsters();
    renderBattleMonsters();
}

function removeMonsterCondition(id, index) {
    const m = battleMonsters.find(x => x.id === id);
    if (!m || !m.condicoes) return;
    m.condicoes.splice(index, 1);
    saveBattleMonsters();
    renderBattleMonsters();
}

function addMonsterToInitiative(id) {
    const m = battleMonsters.find(x => x.id === id);
    if (!m) return;
    if (typeof window.addInitiativeFromSheet === 'function') {
        window.addInitiativeFromSheet({
            name: m.nome,
            init: m.iniciativa,
            playerEmail: 'master_monster'
        });
        
        // Enviar para o Chat Geral
        if (typeof firebase !== 'undefined' && firebase.database && typeof currentTableId !== 'undefined' && currentTableId) {
            const chatRef = firebase.database().ref(`dandora_chat_${currentTableId}`);
            chatRef.push({
                senderEmail: 'master',
                senderName: 'Mestre',
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                type: 'roll',
                content: JSON.stringify({
                    title: 'Iniciativa',
                    detail: `${m.nome} rolou Iniciativa!`,
                    formula: 'Mestre',
                    result: m.iniciativa,
                    isSecret: false
                })
            });
        }
        
        alert(`Monstro ${m.nome} adicionado à iniciativa com valor ${m.iniciativa}!`);
    } else {
        alert("Painel de iniciativa não está conectado.");
    }
}

// Global hooks to trigger battle renderer
const originalRenderTablePlayers = window.renderTablePlayers;
window.renderTablePlayers = function() {
    if (originalRenderTablePlayers) originalRenderTablePlayers();
    renderBattlePlayers();
};

const originalOpenTableManagerBattle = window.openTableManager;
window.openTableManager = function(tid) {
    if (originalOpenTableManagerBattle) originalOpenTableManagerBattle(tid);
    setTimeout(() => {
        initBattleMonsters();
        renderBattleMonsters();
        renderBattlePlayers();
    }, 500);
};

window.addEventListener('DOMContentLoaded', () => {
    // Initializers if already in table (fallback)
    if (sessionStorage.getItem('currentMode') === 'master') {
        setTimeout(() => {
            initBattleMonsters();
            renderBattleMonsters();
            renderBattlePlayers();
        }, 1500);
    }
});

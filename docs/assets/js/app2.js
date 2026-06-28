// State Management
let currentUser = null; // null | { name: string, role: 'master' | 'player', email: string }

// ==========================================
// NAVIGATION & HISTORY
// ==========================================
let globalHistory = [];
let currentView = 'login-view';

function navigateTo(viewId, isBack = false) {
    if (!isBack && currentView && currentView !== viewId) {
        globalHistory.push(currentView);
    }
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target view
    const target = document.getElementById(viewId);
    if(target) {
        target.classList.add('active');
        currentView = viewId;
    }
    
    // Show or hide back button
    const backBtn = document.getElementById('global-back-btn');
    if (backBtn) {
        if (viewId === 'table-manager-view' || viewId === 'player-table-view' || viewId === 'home-view') {
            backBtn.style.display = 'none';
        } else {
            backBtn.style.display = globalHistory.length > 0 ? 'flex' : 'none';
        }
    }
    
    sessionStorage.setItem('currentView', currentView);
    sessionStorage.setItem('globalHistory', JSON.stringify(globalHistory));
    
    window.scrollTo(0, 0);
}

function goBack() {
    if (globalHistory.length > 0) {
        const prevView = globalHistory.pop();
        navigateTo(prevView, true);
    }
}

// Authentication Tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    if (tab === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.querySelectorAll('.auth-tabs .tab-btn')[0].classList.add('active');
        document.querySelectorAll('.auth-tabs .tab-btn')[1].classList.remove('active');
    } else {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.querySelectorAll('.auth-tabs .tab-btn')[0].classList.remove('active');
        document.querySelectorAll('.auth-tabs .tab-btn')[1].classList.add('active');
    }
}

function togglePasswordVisibility(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            iconEl.classList.remove('fa-eye');
            iconEl.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            iconEl.classList.remove('fa-eye-slash');
            iconEl.classList.add('fa-eye');
        }
    }
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const mode = document.getElementById('login-role').value; // Apenas o modo inicial
    
    let usersDB = JSON.parse(localStorage.getItem('dandora_users')) || [];
    
    const userIndex = usersDB.findIndex(u => u.email === email && u.password === password);
    
    if (userIndex !== -1) {
        // Atualiza último acesso
        usersDB[userIndex].lastAccess = new Date().toISOString();
        localStorage.setItem('dandora_users', JSON.stringify(usersDB));
        
        loginUser(usersDB[userIndex], mode);
    } else {
        alert("Credenciais inválidas. Verifique seus dados ou crie uma nova conta.");
    }
}

// Register Handler
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const mode = document.getElementById('reg-role').value; // Apenas o modo inicial
    
    const usersDB = JSON.parse(localStorage.getItem('dandora_users')) || [];
    
    if (usersDB.find(u => u.email === email)) {
        alert("Este email já está cadastrado no sistema!");
        return;
    }
    
    const newUser = { 
        name, 
        email, 
        password, 
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString()
    };
    usersDB.push(newUser);
    
    localStorage.setItem('dandora_users', JSON.stringify(usersDB));
    
    alert("Conta criada com sucesso! Bem-vindo(a) a Dandora.");
    loginUser(newUser, mode);
}

// Forgot Password Flow
function forgotPassword(event) {
    event.preventDefault();
    const email = prompt("Digite o e-mail da sua conta para recuperar a senha:");
    if (!email) return;
    
    let usersDB = JSON.parse(localStorage.getItem('dandora_users')) || [];
    const userIndex = usersDB.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        alert("Não encontramos nenhuma conta com esse e-mail.");
        return;
    }
    
    // Simula o envio de e-mail e clique no link
    alert(`[Simulação de E-mail]\nUm link de redefinição foi enviado para ${email}.\n(Clique em OK para simular que você abriu o link)`);
    
    const newPassword = prompt("Insira sua nova senha:");
    if (newPassword && newPassword.trim().length > 0) {
        usersDB[userIndex].password = newPassword.trim();
        localStorage.setItem('dandora_users', JSON.stringify(usersDB));
        alert("Senha redefinida com sucesso! Você pode fazer login com sua nova senha.");
        
        // Se a pessoa estiver logada e alterar a própria senha, desconecta por segurança
        if (currentUser && currentUser.email === email) {
            logout();
        }
    } else {
        alert("Operação cancelada.");
    }
}

// Login Logic
function loginUser(userData, initialMode) {
    currentUser = userData;
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    sessionStorage.setItem('currentMode', initialMode || 'player');
    
    // Update Navbar UI
    document.getElementById('auth-btn').classList.add('hidden');
    document.getElementById('dashboard-btn').classList.remove('hidden');
    document.getElementById('profile-btn').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    
    updateNavBadge();
    
    // Redirect to respective dashboard
    openDashboard();

    // Check for pending invite
    setTimeout(() => {
        const pending = sessionStorage.getItem('pendingInvite');
        if (pending) {
            sessionStorage.removeItem('pendingInvite');
            const joined = joinTable(pending);
            if (joined) {
                sessionStorage.setItem('currentMode', 'player');
                openDashboard();
            }
        }
    }, 100);
}

// Mode / Profile Management
function getMode() {
    return sessionStorage.getItem('currentMode') || 'player';
}

function updateNavBadge() {
    const badge = document.getElementById('nav-mode-badge');
    if (!badge) return;
    const mode = getMode();
    if (mode === 'master') {
        badge.textContent = 'MESTRE';
        badge.style.background = '#e07060'; // Vermelho para mestre
        badge.style.color = '#fff';
    } else {
        badge.textContent = 'JOGADOR';
        badge.style.background = 'var(--gold-primary)'; // Dourado
        badge.style.color = '#000';
    }
    badge.style.display = 'block';
}

function switchMode(newMode) {
    if (!currentUser) return;
    sessionStorage.setItem('currentMode', newMode);
    updateNavBadge();
    
    // Atualiza os cards visuais na aba Perfil
    document.getElementById('mode-card-player').classList.toggle('active', newMode === 'player');
    document.getElementById('mode-card-master').classList.toggle('active', newMode === 'master');
    
    // Se o usuário já estava num dashboard e trocou de modo, redirecionamos para o correto
    if (currentView === 'dashboard-player-view' || currentView === 'dashboard-master-view' || currentView === 'table-manager-view') {
        openDashboard();
    }
    
    // Adiciona feedback visual
    const msg = newMode === 'master' ? 'Trocado para Modo Mestre' : 'Trocado para Modo Jogador';
    alert(msg);
}

// Renderizar dados do Perfil
function renderProfile() {
    if (!currentUser) return;
    
    document.getElementById('prof-name').textContent = currentUser.name;
    document.getElementById('prof-email').textContent = currentUser.email;
    
    if (currentUser.createdAt) {
        const d = new Date(currentUser.createdAt);
        document.getElementById('prof-created').textContent = `Conta criada em: ${d.toLocaleDateString()}`;
    }
    
    // Conta estatísticas (local mock)
    // 1. Quantas mesas (Mestre)
    const allTables = JSON.parse(localStorage.getItem('dandora_tables')) || [];
    const myTables = allTables.filter(t => t.masterEmail === currentUser.email);
    document.getElementById('prof-stat-tables').textContent = myTables.length;
    
    // 2. Quantas fichas (Jogador)
    const playerFichasKey = `dandora_fichas_${currentUser.email}`;
    const myFichas = JSON.parse(localStorage.getItem(playerFichasKey)) || [];
    document.getElementById('prof-stat-chars').textContent = myFichas.length;
    
    // Setar o card ativo
    const mode = getMode();
    document.getElementById('mode-card-player').classList.toggle('active', mode === 'player');
    document.getElementById('mode-card-master').classList.toggle('active', mode === 'master');
}

// Interceptamos o navigateTo original caso seja a view de perfil
const originalNavigateTo = navigateTo;
navigateTo = function(viewId, isBack = false) {
    if (viewId === 'profile-view') {
        renderProfile();
    }
    
    // Controle de Permissões Básicas na UI
    if (viewId === 'table-manager-view') {
        if (getMode() !== 'master') {
            alert('Acesso negado. Apenas o Mestre pode acessar o gerenciamento da mesa.');
            return;
        }
    }
    
    originalNavigateTo(viewId, isBack);
};

// Logout
function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentMode');
    sessionStorage.removeItem('currentTableId');
    sessionStorage.removeItem('currentTableTab');
    globalHistory = [];
    sessionStorage.removeItem('globalHistory');
    
    // Update Navbar UI
    document.getElementById('auth-btn').classList.remove('hidden');
    document.getElementById('dashboard-btn').classList.add('hidden');
    document.getElementById('profile-btn').classList.add('hidden');
    const badge = document.getElementById('nav-mode-badge');
    if (badge) badge.style.display = 'none';
    
    document.getElementById('logout-btn').classList.add('hidden');
    
    originalNavigateTo('home-view');
}

// Open Dashboard
function openDashboard() {
    if (!currentUser) {
        originalNavigateTo('login-view');
        return;
    }
    
    const mode = getMode();
    
    if (mode === 'master') {
        const masterNameEl = document.getElementById('master-name');
        if (masterNameEl) masterNameEl.textContent = currentUser.name;
        renderMasterTables();
        originalNavigateTo('dashboard-master-view');
    } else {
        const playerNameEl = document.getElementById('player-name');
        if (playerNameEl) playerNameEl.textContent = currentUser.name;
        renderPlayerTables();
        originalNavigateTo('dashboard-player-view');
    }
}

// Render Master Data
function renderMasterTables() {
    const list = document.getElementById('master-tables-list');
    
    // Obter mesas do LocalStorage baseadas no email do Mestre
    const tablesKey = `dandora_tables_${currentUser.email}`;
    const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    
    if (userTables.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Você ainda não possui mesas criadas. Clique em "Criar Nova Mesa" para começar.</p>`;
        return;
    }
    
    list.innerHTML = userTables.map(t => {
        const inviteCode = t.code ? t.code : '-----';
        return `
        <div class="table-card glass-panel" style="position: relative;">
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(212,175,55,0.15); border: 1px solid var(--gold-dim); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-family: monospace; letter-spacing: 2px; color: var(--gold-primary);">
                <i class="fa-solid fa-key"></i> ${inviteCode}
            </div>
            <h3>${t.name}</h3>
            <p><i class="fa-solid fa-users"></i> ${t.players} Jogadores ativos</p>
            <div class="tags">
                ${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div style="display:flex; gap: 8px; margin-top: 0.5rem;">
                <button class="btn-outline" style="flex:1;" onclick="openTableManager(${t.id})">Acessar Painel</button>
                <button class="btn-outline" style="border-color:#e07060; color:#e07060; padding: 0.5rem 0.8rem; flex-shrink:0;" onclick="deleteTable(${t.id})" title="Excluir mesa">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Função auxiliar para gerar código de 5 caracteres
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Criar Nova Mesa (LocalStorage)
function createNewTable() {
    const tableName = prompt("Qual será o nome da nova mesa?");
    if (tableName) {
        const tablesKey = `dandora_tables_${currentUser.email}`;
        const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
        
        const inviteCode = generateInviteCode();
        const newTableId = userTables.length + 1;
        
        userTables.push({
            id: newTableId,
            name: tableName,
            code: inviteCode,
            players: 0,
            tags: ["Nova Campanha"]
        });
        
        localStorage.setItem(tablesKey, JSON.stringify(userTables));
        
        // Adicionar ao registro global (para os jogadores encontrarem)
        let globalTables = JSON.parse(localStorage.getItem('dandora_global_tables')) || [];
        globalTables.push({
            code: inviteCode,
            masterEmail: currentUser.email,
            masterName: currentUser.name,
            tableName: tableName,
            tableId: newTableId
        });
        localStorage.setItem('dandora_global_tables', JSON.stringify(globalTables));
        
        renderMasterTables();
    }
}

// ==========================================
// TABLE MANAGER LOGIC
// ==========================================
let currentTableId = null;

function openTableManager(tableId) {
    currentTableId = tableId;
    sessionStorage.setItem('currentTableId', tableId);
    const tablesKey = `dandora_tables_${currentUser.email}`;
    const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    const table = userTables.find(t => t.id === tableId);
    
    if(!table) return;
    
    // Update Header
    document.getElementById('tm-table-name').textContent = table.name;
    
    // Load Notes
    const notesKey = `dandora_notes_${tableId}`;
    const notes = localStorage.getItem(notesKey) || '';
    document.getElementById('tm-notes-area').value = notes;
    
    // Render Mock Players (We don't have a real DB of players yet)
    renderTablePlayers();
    
    // Reset Tabs
    switchTableTab('tm-players');
    
    // Navigate
    navigateTo('table-manager-view');
    
    // Inicia a sincronização de rolagens
    if (typeof initRollSync === 'function') setTimeout(initRollSync, 500);
}

function switchTableTab(tabId) {
    document.querySelectorAll('.tm-tab').forEach(t => t.classList.remove('active'));
    
    if (window.event && window.event.currentTarget && window.event.currentTarget.classList) {
        window.event.currentTarget.classList.add('active');
    } else {
        document.querySelectorAll('.tm-tab').forEach(t => {
            if(t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) t.classList.add('active');
        });
    }
    
    document.querySelectorAll('.tm-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    sessionStorage.setItem('currentTableTab', tabId);
}

function saveTableNotes() {
    if(!currentTableId) return;
    const content = document.getElementById('tm-notes-area').value;
    const notesKey = `dandora_notes_${currentTableId}`;
    localStorage.setItem(notesKey, content);
}

function renderTablePlayers() {
    const list = document.getElementById('tm-players-list');
    if (!currentTableId) return;
    
    const membersKey = `dandora_table_members_${currentTableId}`;
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];
    
    if (members.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align:center; padding: 2rem;">Ainda não há jogadores nesta mesa.</p>`;
        return;
    }
    
    list.innerHTML = members.map((m, idx) => {
        // Obter ficha a partir da chave separada e mesclar com fallback
        const sheetKey = `dandora_sheet_${currentTableId}_${m.playerEmail}`;
        const storedSheet = JSON.parse(localStorage.getItem(sheetKey));
        const activeSheet = storedSheet || m.activeSheet || m.activeSheetSummary;
        
        if (activeSheet && activeSheet.nome) {
            const p = activeSheet;
            const level = p.nivel ? `Nv. ${p.nivel}` : '';
            const pClass = p.classe || 'Aventureiro';
            const portrait = p.portrait ? `<img src="${p.portrait}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--gold-dim); margin-right: 10px;">` : `<i class="fa-solid fa-user-shield" style="font-size: 1.5rem; color: var(--gold-primary); margin-right: 10px;"></i>`;
            
            return `
            <div class="table-card glass-panel" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; flex:1; min-width: 100%;">
                    ${portrait}
                    <div>
                        <h3 style="margin:0;">${m.playerName}</h3>
                        <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">${p.nome} - ${pClass} <span style="font-size: 0.8rem; color: var(--gold-dim);">${level}</span></p>
                    </div>
                </div>
                <div style="display:flex; gap:8px; width: 100%; margin-top: 5px;">
                    <button class="btn-outline" style="flex:1; padding: 0.5rem;" onclick="masterViewPlayerSheet(${idx})"><i class="fa-solid fa-eye"></i> Ver Ficha</button>
                    <button class="btn-outline" style="flex:1; padding: 0.5rem; border-color:#e07060; color:#e07060;" onclick="kickPlayer('${m.playerEmail}', '${m.playerName}')" title="Expulsar jogador">
                        <i class="fa-solid fa-user-xmark"></i> Expulsar
                    </button>
                </div>
            </div>
            `;
        } else {
            return `
            <div class="table-card glass-panel" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; flex:1;">
                    <i class="fa-solid fa-user-clock" style="font-size: 1.5rem; color: var(--text-muted); margin-right: 10px;"></i>
                    <div>
                        <h3 style="margin:0; color: var(--text-muted);">Aguardando Ficha...</h3>
                        <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">Jogador: ${m.playerName}</p>
                    </div>
                </div>
                <button class="btn-outline" style="border-color:#e07060; color:#e07060;" onclick="kickPlayer('${m.playerEmail}', '${m.playerName}')" title="Expulsar jogador">
                    <i class="fa-solid fa-user-xmark"></i> Expulsar
                </button>
            </div>
            `;
        }
    }).join('');
}

function masterViewPlayerSheet(memberIdx) {
    if(!currentTableId) return;
    const membersKey = `dandora_table_members_${currentTableId}`;
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];
    const member = members[memberIdx];
    
    if(member) {
        sessionStorage.setItem('master_editing_player_idx', memberIdx);
        openSheetModal(currentTableId, member.playerEmail, true);
    }
}

function openSheetModal(tId = null, pEmail = null, isReadOnly = false, vaultId = null) {
    const iframe = document.getElementById('sheet-iframe');
    if (iframe) {
        if (vaultId) {
            // Ficha Independente do Cofre
            const vaultKey = `dandora_vault_${currentUser.email}`;
            const vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
            const sheet = vault.find(s => s._vaultId === vaultId);
            if (sheet) {
                localStorage.setItem(`dandora_sheet_vault_${vaultId}_${currentUser.email}`, JSON.stringify(sheet));
            } else {
                localStorage.setItem(`dandora_sheet_vault_${vaultId}_${currentUser.email}`, "{}");
            }
            iframe.src = `Ficha site/index.html?v=7&tableId=vault_${vaultId}&playerEmail=${currentUser.email}&readOnly=false&vaultId=${vaultId}`;
        } else {
            let tableId = tId;
            let playerEmail = pEmail;
            
            if (!tableId && !playerEmail) {
                if (sessionStorage.getItem('currentMode') === 'master') {
                    tableId = currentTableId;
                    playerEmail = currentUser.email;
                } else {
                    if (currentPlayerTableId && currentUser) {
                        const playerTables = JSON.parse(localStorage.getItem(`dandora_player_tables_${currentUser.email}`)) || [];
                        const pTable = playerTables.find(t => t.id === currentPlayerTableId);
                        if (pTable) {
                            tableId = pTable.masterTableId;
                            playerEmail = currentUser.email;
                        }
                    }
                }
            }
            
            if (tableId && playerEmail) {
                iframe.src = `Ficha site/index.html?v=7&tableId=${tableId}&playerEmail=${playerEmail}&readOnly=${isReadOnly}`;
            } else {
                iframe.src = `Ficha site/index.html?v=7`;
            }
        }
    }
    document.getElementById('sheet-modal').classList.remove('hidden');
    const bBtn = document.getElementById('global-back-btn');
    if (bBtn) bBtn.style.display = 'none';
}

function closeSheetModal() {
    document.getElementById('sheet-modal').classList.add('hidden');
    const bBtn = document.getElementById('global-back-btn');
    if (bBtn && currentView !== 'table-manager-view' && currentView !== 'player-table-view' && currentView !== 'home-view') {
        bBtn.style.display = globalHistory.length > 0 ? 'flex' : 'none';
    }
    
    const iframe = document.getElementById('sheet-iframe');
    if (iframe) {
        const src = iframe.src;
        // Save back to vault if it was an independent sheet
        if (src && src.includes('vaultId=')) {
            const urlParams = new URLSearchParams(src.split('?')[1]);
            const vId = urlParams.get('vaultId');
            const storageKey = `dandora_sheet_vault_${vId}_${currentUser.email}`;
            const sheetData = JSON.parse(localStorage.getItem(storageKey));
            if (sheetData && Object.keys(sheetData).length > 0) {
                // Update or create in vault
                const vaultKey = `dandora_vault_${currentUser.email}`;
                let vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
                sheetData._vaultId = vId;
                sheetData._saveDate = new Date().toLocaleDateString('pt-BR');
                const idx = vault.findIndex(s => s._vaultId === vId);
                if (idx >= 0) {
                    vault[idx] = sheetData;
                } else {
                    vault.push(sheetData);
                }
                localStorage.setItem(vaultKey, JSON.stringify(vault));
                if (typeof renderVaultSheetsDashboard === 'function') renderVaultSheetsDashboard();
                if (typeof renderVaultSheets === 'function') renderVaultSheets();
            }
        }
    }
    
    // Refresh table if needed
    if(typeof renderActiveSheet === 'function' && currentView === 'player-table-view') renderActiveSheet();
    if(typeof renderTablePlayers === 'function' && currentView === 'table-manager-view') renderTablePlayers();
    
    sessionStorage.removeItem('master_editing_player_idx');
    
    if (typeof renderActiveSheet === 'function') renderActiveSheet();
    if (typeof renderTablePlayers === 'function') renderTablePlayers();
}

// ==========================================
// PLAYER TABLE LOGIC
// ==========================================
let currentPlayerTableId = null;

function joinTable(inviteCodeParam = null) {
    if (!currentUser) return false;
    let tableCode = inviteCodeParam;
    if (!tableCode) {
        tableCode = prompt("Digite o CÓDIGO de convite (5 dígitos) da mesa:");
    }
    if (!tableCode) return false;
    
    const codeUpper = tableCode.toUpperCase().trim();
    
    // Buscar no registro global de mesas
    const globalTables = JSON.parse(localStorage.getItem('dandora_global_tables')) || [];
    const foundTable = globalTables.find(t => t.code === codeUpper);
    
    if (!foundTable) {
        alert("Código de mesa inválido ou mesa não encontrada!");
        return false;
    }

    const tablesKey = `dandora_player_tables_${currentUser.email}`;
    const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    
    // Prevent duplicate joins
    if(userTables.find(t => t.code === codeUpper)) {
        alert("Você já está participando desta mesa!");
        return true;
    }

    userTables.push({
        id: userTables.length + 1,
        name: foundTable.tableName,
        master: foundTable.masterName,
        code: codeUpper,
        masterEmail: foundTable.masterEmail,
        masterTableId: foundTable.tableId
    });
    
    localStorage.setItem(tablesKey, JSON.stringify(userTables));
    
    // Adicionar jogador à lista global da mesa do Mestre
    const membersKey = `dandora_table_members_${foundTable.tableId}`;
    let members = JSON.parse(localStorage.getItem(membersKey)) || [];
    members.push({
        playerEmail: currentUser.email,
        playerName: currentUser.name,
        activeSheet: null
    });
    localStorage.setItem(membersKey, JSON.stringify(members));

    // Incrementar contagem de jogadores na mesa do Mestre
    const masterTablesKey = `dandora_tables_${foundTable.masterEmail}`;
    let masterTables = JSON.parse(localStorage.getItem(masterTablesKey)) || [];
    let mTable = masterTables.find(t => t.id === foundTable.tableId);
    if(mTable) {
        mTable.players = (mTable.players || 0) + 1;
        localStorage.setItem(masterTablesKey, JSON.stringify(masterTables));
    }
    
    alert(`Você entrou na mesa: ${foundTable.tableName} (Mestre: ${foundTable.masterName})`);
    renderPlayerTables();
    return true;
}

function renderPlayerTables() {
    const list = document.getElementById('player-tables-list');
    if (list && currentUser) {
        const tablesKey = `dandora_player_tables_${currentUser.email}`;
        const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
        
        if (userTables.length === 0) {
            list.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Você ainda não participa de nenhuma mesa. Clique em "Entrar em uma Mesa" para começar.</p>`;
        } else {
            list.innerHTML = userTables.map(t => `
                <div class="table-card glass-panel">
                    <h3>${t.name}</h3>
                    <p><i class="fa-solid fa-crown"></i> ${t.master}</p>
                    <div style="display:flex; gap:8px; margin-top:1rem;">
                        <button class="btn-outline" style="flex:1;" onclick="openPlayerTable(${t.id})">Acessar Aventura</button>
                        <button class="btn-outline" style="border-color:#e07060; color:#e07060; padding:0.5rem 0.8rem; flex-shrink:0;" onclick="leaveTable(${t.id}, '${t.code}', '${t.masterEmail}', ${t.masterTableId})" title="Sair da mesa">
                            <i class="fa-solid fa-right-from-bracket"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Also render dashboard vault and load global notes
    if (currentUser) {
        if (typeof renderVaultSheetsDashboard === 'function') renderVaultSheetsDashboard();
        const notesArea = document.getElementById('pd-notes-area');
        if (notesArea) {
            notesArea.value = localStorage.getItem(`dandora_global_notes_${currentUser.email}`) || '';
        }
    }
}

function openPlayerTable(tableId) {
    currentPlayerTableId = tableId;
    sessionStorage.setItem('currentPlayerTableId', tableId);
    
    const tablesKey = `dandora_player_tables_${currentUser.email}`;
    const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    const table = userTables.find(t => t.id === tableId);
    
    if(!table) return;
    
    // Update Header
    document.getElementById('pt-table-name').textContent = table.name;
    
    // Load Notes
    const notesKey = `dandora_player_notes_${tableId}_${currentUser.email}`;
    const notes = localStorage.getItem(notesKey) || '';
    document.getElementById('pt-notes-area').value = notes;
    
    // Reset Tabs
    switchPlayerTab('pt-sheet');
    
    // Navigate
    navigateTo('player-table-view');
    
    // Inicia a sincronização de rolagens
    if (typeof initRollSync === 'function') setTimeout(initRollSync, 500);
}

function switchPlayerTab(tabId) {
    document.querySelectorAll('.pt-tab').forEach(t => t.classList.remove('active'));
    
    if (window.event && window.event.currentTarget && window.event.currentTarget.classList) {
        window.event.currentTarget.classList.add('active');
    } else {
        document.querySelectorAll('.pt-tab').forEach(t => {
            if(t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) t.classList.add('active');
        });
    }
    
    document.querySelectorAll('.pt-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    if (tabId === 'pt-sheet') {
        if(typeof renderActiveSheet === 'function') renderActiveSheet();
        if(typeof renderVaultSheets === 'function') renderVaultSheets();
    }
    
    sessionStorage.setItem('currentPlayerTableTab', tabId);
}

function switchPlayerDashTab(tabId) {
    document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
    
    if (window.event && window.event.currentTarget && window.event.currentTarget.classList) {
        window.event.currentTarget.classList.add('active');
    } else {
        document.querySelectorAll('.pd-tab').forEach(t => {
            if(t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) t.classList.add('active');
        });
    }
    
    document.querySelectorAll('.pd-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    sessionStorage.setItem('currentPlayerDashTab', tabId);
}

function savePlayerGlobalNotes() {
    if (!currentUser) return;
    const area = document.getElementById('pd-notes-area');
    if (area) {
        localStorage.setItem(`dandora_global_notes_${currentUser.email}`, area.value);
    }
}

function savePlayerNotes() {
    if(!currentPlayerTableId || !currentUser) return;
    const content = document.getElementById('pt-notes-area').value;
    const notesKey = `dandora_player_notes_${currentPlayerTableId}_${currentUser.email}`;
    localStorage.setItem(notesKey, content);
}

// ==========================================
// CHARACTER VAULT LOGIC
function syncPlayerSheetToTable(data) {
    let targetTableId = null;
    let targetEmail = null;
    
    // Identificar a mesa e o email alvo dependendo do modo atual
    if (sessionStorage.getItem('currentMode') === 'master') {
        if (currentTableId) {
            targetTableId = currentTableId;
            const editingIdx = sessionStorage.getItem('master_editing_player_idx');
            if (editingIdx !== null) {
                const members = JSON.parse(localStorage.getItem(`dandora_table_members_${currentTableId}`)) || [];
                const member = members[editingIdx];
                if (member) targetEmail = member.playerEmail;
            }
        }
    } else {
        if (currentPlayerTableId && currentUser) {
            const playerTables = JSON.parse(localStorage.getItem(`dandora_player_tables_${currentUser.email}`)) || [];
            const pTable = playerTables.find(t => t.id === currentPlayerTableId);
            if (pTable && pTable.masterTableId) {
                targetTableId = pTable.masterTableId;
                targetEmail = currentUser.email;
            }
        }
    }
    
    if (targetTableId && targetEmail) {
        const sheetKey = `dandora_sheet_${targetTableId}_${targetEmail}`;
        
        // Salvar localmente sem ativar o trigger global do firebase-sync (que faria set total)
        window.dandoraDisableSync = true;
        localStorage.setItem(sheetKey, JSON.stringify(data));
        window.dandoraDisableSync = false;
        
        // Realizar o UPDATE campo a campo no Firebase para mesclar sem conflitos!
        if (window.dandoraDatabase) {
            try {
                const cleanData = JSON.parse(JSON.stringify(data));
                window.dandoraDatabase.ref('dandora_data/' + btoa(sheetKey)).update(cleanData);
            } catch(e) {}
        }
        
        // Mantemos um fallback do nome e dados básicos na lista de membros para caso offline
        if (sessionStorage.getItem('currentMode') !== 'master') {
            const membersKey = `dandora_table_members_${targetTableId}`;
            let members = JSON.parse(localStorage.getItem(membersKey)) || [];
            let member = members.find(m => m.playerEmail === targetEmail);
            if (member) {
                member.activeSheetSummary = { nome: data.nome, classe: data.classe, nivel: data.nivel, portrait: data.portrait };
                localStorage.setItem(membersKey, JSON.stringify(members)); // Isso sim será enviado por set
            }
        }
    }
}

function renderActiveSheet() {
    const infoContainer = document.getElementById('pt-active-sheet-info');
    if (!infoContainer) return;

    try {
        let targetTableId = null;
        let targetEmail = null;

        if (sessionStorage.getItem('currentMode') === 'master') {
            if (currentTableId) {
                targetTableId = currentTableId;
                targetEmail = currentUser.email; // Fallback, mestre não costuma ter ficha
            }
        } else {
            if (currentPlayerTableId && currentUser) {
                const playerTables = JSON.parse(localStorage.getItem(`dandora_player_tables_${currentUser.email}`)) || [];
                const pTable = playerTables.find(t => t.id === currentPlayerTableId);
                if (pTable && pTable.masterTableId) {
                    targetTableId = pTable.masterTableId;
                    targetEmail = currentUser.email;
                }
            }
        }

        let data = null;
        if (targetTableId && targetEmail) {
            const sheetKey = `dandora_sheet_${targetTableId}_${targetEmail}`;
            const rawData = localStorage.getItem(sheetKey);
            data = rawData ? JSON.parse(rawData) : null;
        } else {
            const rawData = localStorage.getItem('dandora-ficha-v1');
            data = rawData ? JSON.parse(rawData) : null;
        }
        
        // Enviar cópia atualizada da ficha para o Mestre da Mesa (backup ao renderizar)
        syncPlayerSheetToTable(data);
        
        if (data && data.nome) {
            const nivel = data.nivel ? `Nv. ${data.nivel}` : '';
            const classe = data.classe || 'Aventureiro';
            const portrait = data.portrait ? `<img src="${data.portrait}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-dim);">` : `<i class="fa-solid fa-user-shield" style="font-size: 2.5rem; color: var(--gold-primary);"></i>`;
            
            infoContainer.innerHTML = `
                ${portrait}
                <div>
                    <h3 style="margin:0;">${data.nome} <span style="font-size: 0.8rem; color: var(--gold-dim);">${nivel}</span></h3>
                    <p style="margin:0; color: var(--text-muted);">${classe}</p>
                </div>
            `;
        } else {
            infoContainer.innerHTML = `
                <i class="fa-solid fa-file-circle-question" style="font-size: 2.5rem; color: var(--text-muted);"></i>
                <div>
                    <h3 style="margin:0; color: var(--text-muted);">Slot Vazio</h3>
                    <p style="margin:0; color: var(--text-muted);">Nenhuma ficha em uso</p>
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
    }
}

function getActiveSheetKey() {
    let targetTableId = null;
    let targetEmail = null;
    if (sessionStorage.getItem('currentMode') === 'master') {
        if (currentTableId) {
            targetTableId = currentTableId;
            targetEmail = currentUser.email;
        }
    } else {
        if (currentPlayerTableId && currentUser) {
            const playerTables = JSON.parse(localStorage.getItem(`dandora_player_tables_${currentUser.email}`)) || [];
            const pTable = playerTables.find(t => t.id === currentPlayerTableId);
            if (pTable && pTable.masterTableId) {
                targetTableId = pTable.masterTableId;
                targetEmail = currentUser.email;
            }
        }
    }
    if (targetTableId && targetEmail) {
        return `dandora_sheet_${targetTableId}_${targetEmail}`;
    }
    return 'dandora-ficha-v1';
}

function saveActiveSheetToVault() {
    try {
        const sheetKey = getActiveSheetKey();
        const rawData = localStorage.getItem(sheetKey);
        if (!rawData) {
            alert("Não há ficha ativa para salvar.");
            return;
        }
        const data = JSON.parse(rawData);
        if (!data.nome) {
            alert("A ficha precisa ter pelo menos um Nome para ser salva.");
            return;
        }
        
        const vaultKey = `dandora_vault_${currentUser.email}`;
        let vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
        
        const saveId = Date.now().toString();
        data._vaultId = saveId;
        data._saveDate = new Date().toLocaleString();
        
        vault.push(data);
        localStorage.setItem(vaultKey, JSON.stringify(vault));
        
        alert(`A ficha de ${data.nome} foi salva no cofre com sucesso!`);
        renderVaultSheets();
    } catch (e) {
        console.error(e);
    }
}

function renderVaultSheets() {
    const list = document.getElementById('pt-vault-list');
    if (!list || !currentUser) return;
    
    const vaultKey = `dandora_vault_${currentUser.email}`;
    const vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
    
    if (vault.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Seu cofre está vazio. Salve a ficha atual para guardá-la aqui.</p>`;
        return;
    }
    
    list.innerHTML = vault.map(sheet => {
        const classe = sheet.classe || 'Aventureiro';
        const nivel = sheet.nivel ? `Nv. ${sheet.nivel}` : '';
        const portrait = sheet.portrait ? `<img src="${sheet.portrait}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--gold-dim); margin-right: 10px;">` : `<i class="fa-solid fa-user" style="font-size: 1.5rem; color: var(--gold-primary); margin-right: 10px;"></i>`;
        
        return `
        <div class="table-card glass-panel" style="position: relative;">
            <div style="display:flex; align-items:center; margin-bottom: 10px;">
                ${portrait}
                <div>
                    <h3 style="font-size:1.1rem; margin:0;">${sheet.nome} <span style="font-size:0.8rem; color:var(--gold-dim);">${nivel}</span></h3>
                    <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">${classe}</p>
                </div>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 15px;">Salvo em: ${sheet._saveDate}</p>
            
            <div style="display:flex; gap: 5px;">
                <button class="btn-epic w-100" onclick="loadSheetFromVault('${sheet._vaultId}')"><i class="fa-solid fa-upload"></i> Carregar</button>
                <button class="btn-outline" style="border-color: #f57878; color: #f57878; padding: 10px;" onclick="deleteSheetFromVault('${sheet._vaultId}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

function loadSheetFromVault(id) {
    if(!confirm("Atenção: Carregar essa ficha vai substituir a sua 'Ficha Ativa'. Você salvou o progresso atual no cofre?")) return;
    
    const vaultKey = `dandora_vault_${currentUser.email}`;
    const vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
    const sheet = vault.find(s => s._vaultId === id);
    
    if (sheet) {
        const sheetKey = getActiveSheetKey();
        localStorage.setItem(sheetKey, JSON.stringify(sheet));
        renderActiveSheet();
        alert(`A ficha de ${sheet.nome} foi carregada e está ativa.`);
    }
}

function deleteSheetFromVault(id) {
    if(!confirm("Tem certeza que deseja excluir essa ficha do seu cofre permanentemente?")) return;
    
    const vaultKey = `dandora_vault_${currentUser.email}`;
    let vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
    vault = vault.filter(s => s._vaultId !== id);
    
    localStorage.setItem(vaultKey, JSON.stringify(vault));
    renderVaultSheets();
    if (typeof renderVaultSheetsDashboard === 'function') renderVaultSheetsDashboard();
}

function createNewBlankSheet() {
    const vaultId = Date.now().toString();
    const vaultKey = `dandora_vault_${currentUser.email}`;
    let vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
    
    const newSheet = {
        _vaultId: vaultId,
        _saveDate: new Date().toLocaleDateString('pt-BR'),
        nome: "Novo Personagem"
    };
    
    vault.push(newSheet);
    localStorage.setItem(vaultKey, JSON.stringify(vault));
    
    if (typeof renderVaultSheetsDashboard === 'function') renderVaultSheetsDashboard();
    
    // Open in modal for editing immediately
    openSheetModal(null, null, false, vaultId);
}

function editVaultSheet(vaultId) {
    openSheetModal(null, null, false, vaultId);
}

function renderVaultSheetsDashboard() {
    const list = document.getElementById('pd-vault-list');
    if (!list || !currentUser) return;
    
    const vaultKey = `dandora_vault_${currentUser.email}`;
    const vault = JSON.parse(localStorage.getItem(vaultKey)) || [];
    
    if (vault.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Seu cofre está vazio. Você pode criar fichas independentes e elas aparecerão aqui.</p>`;
        return;
    }
    
    list.innerHTML = vault.map(sheet => {
        const classe = sheet.classe || 'Aventureiro';
        const nivel = sheet.nivel ? `Nv. ${sheet.nivel}` : '';
        const portrait = sheet.portrait ? `<img src="${sheet.portrait}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--gold-dim); margin-right: 10px;">` : `<i class="fa-solid fa-user" style="font-size: 1.5rem; color: var(--gold-primary); margin-right: 10px;"></i>`;
        
        return `
        <div class="table-card glass-panel" style="position: relative;">
            <div style="display:flex; align-items:center; margin-bottom: 10px;">
                ${portrait}
                <div>
                    <h3 style="font-size:1.1rem; margin:0;">${sheet.nome} <span style="font-size:0.8rem; color:var(--gold-dim);">${nivel}</span></h3>
                    <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">${classe}</p>
                </div>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 15px;">Salvo em: ${sheet._saveDate}</p>
            
            <div style="display:flex; gap: 5px;">
                <button class="btn-epic w-100" onclick="editVaultSheet('${sheet._vaultId}')"><i class="fa-solid fa-pen"></i> Editar Ficha</button>
                <button class="btn-outline" style="border-color: #f57878; color: #f57878; padding: 10px;" onclick="deleteSheetFromVault('${sheet._vaultId}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

// ==========================================
// TABLE MANAGEMENT ACTIONS
// ==========================================

function generateInviteLink() {
    if (!currentTableId || !currentUser) return;
    const tablesKey = `dandora_tables_${currentUser.email}`;
    const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    const table = userTables.find(t => t.id === currentTableId);
    
    if (table && table.code) {
        const inviteUrl = window.location.origin + window.location.pathname + "?invite=" + table.code;
        navigator.clipboard.writeText(inviteUrl).then(() => {
            alert("Link de convite copiado para a área de transferência!\n" + inviteUrl);
        }).catch(err => {
            prompt("Copie o link abaixo e envie para seus jogadores:", inviteUrl);
        });
    } else {
        alert("Erro ao gerar link de convite. Esta mesa não possui um código válido.");
    }
}

/**
 * MESTRE: Exclui a mesa completamente.
 * Remove a mesa do registro do mestre, do registro global,
 * e remove a referência da mesa na lista de todos os jogadores membros.
 */
function deleteTable(tableId) {
    if (!currentUser || getMode() !== 'master') return;

    const tablesKey = `dandora_tables_${currentUser.email}`;
    let userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    const table = userTables.find(t => t.id === tableId);
    if (!table) return;

    const confirmed = confirm(
        `⚠️ EXCLUIR MESA\n\n"${table.name}"\n\nIsso removerá a mesa para TODOS os jogadores que estão nela. Esta ação não pode ser desfeita!\n\nDeseja continuar?`
    );
    if (!confirmed) return;

    // 1. Buscar todos os membros e remover a mesa da lista de cada jogador
    const membersKey = `dandora_table_members_${tableId}`;
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];

    members.forEach(m => {
        const playerTablesKey = `dandora_player_tables_${m.playerEmail}`;
        let playerTables = JSON.parse(localStorage.getItem(playerTablesKey)) || [];
        playerTables = playerTables.filter(pt => pt.masterTableId !== tableId);
        localStorage.setItem(playerTablesKey, JSON.stringify(playerTables));

        // Remover anotações do jogador nessa mesa
        // (buscamos por masterTableId no player_tables, mas o notesKey usa o id local do jogador)
        // Limpamos pelo código da mesa
        const notesKey = `dandora_player_notes_${m.playerEmail}_${table.code}`;
        localStorage.removeItem(notesKey);
    });

    // 2. Remover dados da mesa (membros e anotações do mestre)
    localStorage.removeItem(membersKey);
    localStorage.removeItem(`dandora_notes_${tableId}`);

    // 3. Remover do registro global de mesas
    let globalTables = JSON.parse(localStorage.getItem('dandora_global_tables')) || [];
    globalTables = globalTables.filter(gt => gt.code !== table.code);
    localStorage.setItem('dandora_global_tables', JSON.stringify(globalTables));

    // 4. Remover da lista de mesas do mestre
    userTables = userTables.filter(t => t.id !== tableId);
    localStorage.setItem(tablesKey, JSON.stringify(userTables));

    renderMasterTables();
    alert(`A mesa "${table.name}" foi excluída com sucesso.`);
}

/**
 * MESTRE: Expulsa um jogador específico da mesa atual.
 * Remove o jogador da lista de membros e da lista de mesas do jogador.
 */
function kickPlayer(playerEmail, playerName) {
    if (!currentUser || sessionStorage.getItem('currentMode') !== 'master' || !currentTableId) return;

    const confirmed = confirm(
        `ðŸš« EXPULSAR JOGADOR\n\n"${playerName}"\n\nEste jogador será removido desta mesa. Ele precisará de um novo convite para entrar novamente.\n\nDeseja continuar?`
    );
    if (!confirmed) return;

    // 1. Remover da lista de membros da mesa
    const membersKey = `dandora_table_members_${currentTableId}`;
    let members = JSON.parse(localStorage.getItem(membersKey)) || [];
    const kicked = members.find(m => m.playerEmail === playerEmail);
    members = members.filter(m => m.playerEmail !== playerEmail);
    localStorage.setItem(membersKey, JSON.stringify(members));

    // 2. Remover a mesa da lista do jogador
    const playerTablesKey = `dandora_player_tables_${playerEmail}`;
    let playerTables = JSON.parse(localStorage.getItem(playerTablesKey)) || [];
    playerTables = playerTables.filter(pt => pt.masterTableId !== currentTableId);
    localStorage.setItem(playerTablesKey, JSON.stringify(playerTables));

    // 3. Decrementar contador de jogadores na mesa do mestre
    const masterTablesKey = `dandora_tables_${currentUser.email}`;
    let masterTables = JSON.parse(localStorage.getItem(masterTablesKey)) || [];
    let mTable = masterTables.find(t => t.id === currentTableId);
    if (mTable && mTable.players > 0) {
        mTable.players -= 1;
        localStorage.setItem(masterTablesKey, JSON.stringify(masterTables));
    }

    renderTablePlayers();
    alert(`${playerName} foi expulso da mesa.`);
}

/**
 * JOGADOR: Sai de uma mesa específica.
 * Remove apenas a entrada desse jogador; a mesa continua existindo para os outros.
 */
function leaveTable(playerTableId, tableCode, masterEmail, masterTableId) {
    if (!currentUser || getMode() !== 'player') return;

    const tablesKey = `dandora_player_tables_${currentUser.email}`;
    let userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
    const table = userTables.find(t => t.id === playerTableId);
    if (!table) return;

    const confirmed = confirm(
        `ðŸšª SAIR DA MESA\n\n"${table.name}"\n\nVocê sairá desta mesa. Para voltar, precisará de um novo convite do Mestre.\n\nDeseja continuar?`
    );
    if (!confirmed) return;

    // 1. Remover da lista de mesas do jogador
    userTables = userTables.filter(t => t.id !== playerTableId);
    localStorage.setItem(tablesKey, JSON.stringify(userTables));

    // 2. Remover da lista de membros da mesa do mestre
    const membersKey = `dandora_table_members_${masterTableId}`;
    let members = JSON.parse(localStorage.getItem(membersKey)) || [];
    members = members.filter(m => m.playerEmail !== currentUser.email);
    localStorage.setItem(membersKey, JSON.stringify(members));

    // 3. Decrementar contador de jogadores na mesa do mestre
    const masterTablesKey = `dandora_tables_${masterEmail}`;
    let masterTables = JSON.parse(localStorage.getItem(masterTablesKey)) || [];
    let mTable = masterTables.find(t => t.id === masterTableId);
    if (mTable && mTable.players > 0) {
        mTable.players -= 1;
        localStorage.setItem(masterTablesKey, JSON.stringify(masterTables));
    }

    // 4. Remover anotações pessoais do jogador nessa mesa
    localStorage.removeItem(`dandora_player_notes_${playerTableId}_${currentUser.email}`);

    renderPlayerTables();
    alert(`Você saiu da mesa "${table.name}" com sucesso.`);
}

// Initialize checks on load
document.addEventListener('DOMContentLoaded', () => {
    // Check invite URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
        sessionStorage.setItem('pendingInvite', inviteParam);
        window.history.replaceState({}, '', window.location.pathname);
    }

    // Restore user
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        
        // Update Navbar UI
        const authBtn = document.getElementById('auth-btn');
        if(authBtn) authBtn.classList.add('hidden');
        const dashBtn = document.getElementById('dashboard-btn');
        if(dashBtn) dashBtn.classList.remove('hidden');
        const outBtn = document.getElementById('logout-btn');
        if(outBtn) outBtn.classList.remove('hidden');
        const profBtn = document.getElementById('profile-btn');
        if(profBtn) profBtn.classList.remove('hidden');
        
        if (typeof updateNavBadge === 'function') updateNavBadge();
        
        if (getMode() === 'master') {
            const mName = document.getElementById('master-name');
            if(mName) mName.textContent = currentUser.name;
            renderMasterTables();
        } else {
            const pName = document.getElementById('player-name');
            if(pName) pName.textContent = currentUser.name;
            renderPlayerTables();
        }
    }

    // Restore History
    const storedHistory = sessionStorage.getItem('globalHistory');
    if (storedHistory) {
        globalHistory = JSON.parse(storedHistory);
    }

    // Restore View
    const storedView = sessionStorage.getItem('currentView');
    if (storedView) {
        if (storedView === 'table-manager-view') {
            const storedTableId = sessionStorage.getItem('currentTableId');
            if (storedTableId && currentUser) {
                currentTableId = parseInt(storedTableId);
                const tablesKey = `dandora_tables_${currentUser.email}`;
                const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
                const table = userTables.find(t => t.id === currentTableId);
                
                if (table) {
                    const tableNameEl = document.getElementById('tm-table-name');
                    if(tableNameEl) tableNameEl.textContent = table.name;
                    
                    const notesKey = `dandora_notes_${currentTableId}`;
                    const notesEl = document.getElementById('tm-notes-area');
                    if(notesEl) notesEl.value = localStorage.getItem(notesKey) || '';
                    
                    renderTablePlayers();
                    
                    const storedTab = sessionStorage.getItem('currentTableTab');
                    if (storedTab) {
                        switchTableTab(storedTab);
                    } else {
                        switchTableTab('tm-players');
                    }
                }
            }
        } else if (storedView === 'player-table-view') {
            const storedPlayerTableId = sessionStorage.getItem('currentPlayerTableId');
            if (storedPlayerTableId && currentUser) {
                currentPlayerTableId = parseInt(storedPlayerTableId);
                const tablesKey = `dandora_player_tables_${currentUser.email}`;
                const userTables = JSON.parse(localStorage.getItem(tablesKey)) || [];
                const table = userTables.find(t => t.id === currentPlayerTableId);
                
                if (table) {
                    const tableNameEl = document.getElementById('pt-table-name');
                    if(tableNameEl) tableNameEl.textContent = table.name;
                    
                    const notesKey = `dandora_player_notes_${currentPlayerTableId}_${currentUser.email}`;
                    const notesEl = document.getElementById('pt-notes-area');
                    if(notesEl) notesEl.value = localStorage.getItem(notesKey) || '';
                    
                    const storedTab = sessionStorage.getItem('currentPlayerTableTab');
                    if (storedTab) {
                        switchPlayerTab(storedTab);
                    } else {
                        switchPlayerTab('pt-sheet');
                    }
                }
            }
        }
        // Force navigation without modifying history again
        const tempHistory = [...globalHistory];
        navigateTo(storedView, true);
        globalHistory = tempHistory;
        sessionStorage.setItem('globalHistory', JSON.stringify(globalHistory));
        
        // Inicia a sincronização de rolagens se estiver numa mesa
        if ((storedView === 'table-manager-view' || storedView === 'player-table-view') && typeof initRollSync === 'function') {
            setTimeout(initRollSync, 1000);
        }
    } else {
        navigateTo('home-view');
    }

    // Process pending invite if already logged in
    if (currentUser) {
        setTimeout(() => {
            const pending = sessionStorage.getItem('pendingInvite');
            if (pending) {
                sessionStorage.removeItem('pendingInvite');
                const joined = joinTable(pending);
                if (joined) {
                    sessionStorage.setItem('currentMode', 'player');
                    openDashboard();
                }
            }
        }, 300);
    }
});

// ==========================================
// ==========================================
// FIREBASE SYNC LISTENER
// ==========================================
window.addEventListener('dandoraDataSync', () => {
    // Restaurar currentUser se houver mudanï¿½a externa
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    // Atualiza a interface baseada na tela atual sem recarregar a pï¿½gina
    if (currentView === 'dashboard-master-view') {
        renderMasterTables();
    } else if (currentView === 'dashboard-player-view') {
        renderPlayerTables();
    } else if (currentView === 'table-manager-view') {
        renderTablePlayers();
        
        const notesKey = `dandora_notes_${currentTableId}`;
        const notesEl = document.getElementById('tm-notes-area');
        // Sï¿½ atualiza o texto se o mestre nï¿½o estiver digitando nele no momento
        if (notesEl && document.activeElement !== notesEl) {
            notesEl.value = localStorage.getItem(notesKey) || '';
        }
        
        if (typeof renderMissions === 'function') renderMissions();
        if (typeof renderSessions === 'function') renderSessions();
        
        const iframe = document.getElementById('sheet-iframe');
        if (iframe && iframe.contentWindow && document.getElementById('sheet-modal').classList.contains('active')) {
            iframe.contentWindow.postMessage({ type: 'DANDORA_SYNC_UPDATE' }, '*');
        }
    } else if (currentView === 'table-player-view') {
        if (typeof renderPlayerCompanions === 'function') renderPlayerCompanions();
        
        // Sincronizar Ficha do Jogador
        const iframe = document.getElementById('sheet-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'DANDORA_SYNC_UPDATE' }, '*');
        }
    }
});
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DANDORA_SHEET_UPDATED') {
        if (typeof syncPlayerSheetToTable === 'function') syncPlayerSheetToTable(event.data.data);
    } else if (event.data && event.data.type === 'DANDORA_ROLL') {
        // Broadcast the roll if we are in a table
        if (getActiveTableId() && window.dandoraDatabase) {
            broadcastRoll(event.data.data);
        }
    }
});

// ==========================================
// REAL-TIME ROLLS PANEL
// ==========================================
window.masterRollsHistory = [];

function getActiveTableId() {
    const mode = sessionStorage.getItem('currentMode');
    if (mode === 'master') {
        return typeof currentTableId !== 'undefined' ? currentTableId : null;
    } else {
        if (typeof currentPlayerTableId !== 'undefined' && currentPlayerTableId && currentUser) {
            const playerTables = JSON.parse(localStorage.getItem(`dandora_player_tables_${currentUser.email}`)) || [];
            const pTable = playerTables.find(t => t.id === currentPlayerTableId);
            if (pTable && pTable.masterTableId) {
                return pTable.masterTableId;
            }
        }
    }
    return null;
}

function broadcastRoll(rollData) {
    const tid = getActiveTableId();
    if (!tid || !window.dandoraDatabase) return;
    rollData.timestamp = Date.now();
    if (currentUser && currentUser.name) {
        rollData.playerName = currentUser.name;
    }
    window.dandoraDatabase.ref('tables/' + tid + '/rolls').push(rollData);
}

function initRollSync() {
    const tid = getActiveTableId();
    if (!tid || !window.dandoraDatabase) return;
    
    // Clear current history
    window.masterRollsHistory = [];
    const container = document.getElementById('master-roll-history');
    if (container) container.innerHTML = '';
    
    // Listen for new rolls
    window.dandoraDatabase.ref('tables/' + tid + '/rolls')
        .orderByChild('timestamp')
        .limitToLast(100)
        .on('child_added', (snapshot) => {
            const roll = snapshot.val();
            // Evitar duplicados
            if (!window.masterRollsHistory.some(r => r.timestamp === roll.timestamp)) {
                window.masterRollsHistory.push(roll);
                renderMasterRolls();
                
                // Repassa a rolagem para o Iframe da ficha do jogador (se estiver aberta)
                const iframe = document.getElementById('sheet-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ type: 'DANDORA_SYNC_ROLL', data: roll }, '*');
                }
            }
        });
}

function renderMasterRolls() {
    const container = document.getElementById('master-roll-history');
    const filterEl = document.getElementById('roll-filter');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filter = filterEl ? filterEl.value : 'all';
    
    // Reverse array to show newest at top (if we prepend)
    const sorted = [...window.masterRollsHistory].sort((a,b) => b.timestamp - a.timestamp);
    
    let renderedCount = 0;
    
    sorted.forEach(roll => {
        // Player should not see Master's rolls if we implement this view for players
        // But for the master view, show everything.
        
        if (filter === 'simple' && roll.complex) return;
        if (filter === 'complex' && !roll.complex) return;
        
        renderedCount++;
        
        const card = document.createElement('div');
        card.style.background = 'rgba(25, 25, 25, 0.9)';
        card.style.border = '1px solid var(--gold-dark)';
        card.style.borderRadius = '6px';
        card.style.padding = '10px';
        card.style.marginBottom = '10px';
        card.style.animation = 'fadeIn 0.5s ease';
        
        let header = `
            <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px dashed var(--gold-dim); padding-bottom: 5px; margin-bottom: 8px;">
                <div>
                    <span style="font-weight: bold; color: var(--gold-primary); font-size: 1rem;">
                        ${roll.isMaster ? '🧙 Mestre' : '🧝 ' + (roll.playerName ? roll.playerName + ' - ' : '') + (roll.characterName || 'Desconhecido')}
                    </span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">
                        ${roll.title}
                    </div>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">
                    ${new Date(roll.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        `;
        
        let body = '';
        if (roll.complex) {
            body = `
                <div style="font-size: 0.85rem; margin-bottom: 5px;">Fórmula: <span style="color: var(--text-light);">${roll.calculation}</span></div>
                <div style="text-align: right; margin-top: 5px;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Resultado Final</span><br>
                    <span style="font-size: 1.5rem; font-weight: bold; color: var(--gold-light);">${roll.finalResult}</span>
                </div>
            `;
        } else {
            let diceHTML = '';
            if (roll.rolls) {
                roll.rolls.forEach((r, idx) => {
                    let isWinner = (idx === roll.winningIndex);
                    let color = isWinner ? 'var(--gold-primary)' : 'var(--text-muted)';
                    let weight = isWinner ? 'bold' : 'normal';
                    let extra = '';
                    if (isWinner && r === 20) extra = '<span style="color: #4CAF50; font-size: 0.7rem; display: block;">Crítico!</span>';
                    if (isWinner && r === 1) extra = '<span style="color: #F44336; font-size: 0.7rem; display: block;">Falha!</span>';
                    
                    diceHTML += `
                        <div style="display: inline-block; text-align: center; margin-right: 10px; opacity: ${isWinner ? 1 : 0.5};">
                            <i class="fa-solid fa-dice-d20" style="color: ${color}; font-size: 1.2rem;"></i>
                            <div style="font-weight: ${weight}; margin-top: 3px;">${r}</div>
                            ${extra}
                        </div>
                    `;
                });
            }
            
            body = `
                <div style="margin-bottom: 5px; font-size: 0.85rem; color: var(--text-muted);">
                    Bônus: <span style="color: var(--text-light);">${roll.bonus > 0 ? '+'+roll.bonus : roll.bonus}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>${diceHTML}</div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total</span><br>
                        <span style="font-size: 1.5rem; font-weight: bold; color: var(--gold-light);">${roll.finalResult}</span>
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = header + body;
        container.appendChild(card);
    });
    
    if (renderedCount === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: 2rem;">Nenhuma rolagem recente...</div>';
    }
}

window.clearMasterRollHistory = function() {
    if (confirm("Limpar o histórico de rolagens na sua tela? (Isso não apaga do banco de dados)")) {
        window.masterRollsHistory = [];
        renderMasterRolls();
    }
};

// Modifique openTable para chamar initRollSync
const originalOpenTable = window.openTable;
window.openTable = function(tableId) {
    if (typeof originalOpenTable === 'function') {
        originalOpenTable(tableId);
    }
    setTimeout(initRollSync, 500);
};
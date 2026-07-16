let monsters = [];

function loadMonsters() {
    try {
        const data = localStorage.getItem('dandora_monsters');
        if (data) {
            monsters = JSON.parse(data);
        } else {
            monsters = [];
        }
    } catch (e) {
        monsters = [];
    }
}

function saveMonsters() {
    localStorage.setItem('dandora_monsters', JSON.stringify(monsters));
}

function addMonster() {
    monsters.push({
        id: crypto.randomUUID(),
        mode: 'manual',
        nome: '',
        vida: '',
        ca: '',
        anotacoes: '',
        pdfPage: ''
    });
    saveMonsters();
    renderMonsters();
}

function duplicateMonster(id) {
    const m = monsters.find(x => x.id === id);
    if (!m) return;
    monsters.push({
        ...m,
        id: crypto.randomUUID(),
        nome: m.nome ? m.nome + ' (Cópia)' : ''
    });
    saveMonsters();
    renderMonsters();
}

function removeMonster(id) {
    if (!confirm("Tem certeza que deseja remover este monstro?")) return;
    monsters = monsters.filter(x => x.id !== id);
    saveMonsters();
    renderMonsters();
}

function updateMonster(id, field, value) {
    const m = monsters.find(x => x.id === id);
    if (m) {
        m[field] = value;
        saveMonsters();
    }
}

function switchMonstroTab(id, mode) {
    updateMonster(id, 'mode', mode);
    renderMonsters();
}

function renderPdfPage(id, pageNum) {
    updateMonster(id, 'pdfPage', pageNum);
    const iframe = document.getElementById(`pdf-frame-${id}`);
    if (!iframe) return;
    if (!pageNum || pageNum < 1) {
        iframe.src = "";
        return;
    }
    iframe.src = `assets/Bestiario de Dandora (1).pdf#page=${pageNum}&view=FitH`;
}

function adicionarMonstroIniciativa(id) {
    const m = monsters.find(x => x.id === id);
    if (!m || !m.nome) {
        alert("Preencha o nome do monstro antes de adicionar à iniciativa.");
        return;
    }
    
    // Rolar d20 + modificador de destreza? Monstros não tem atributos destreza explicitos aqui. 
    // Vamos rolar um d20 simples.
    const initRoll = Math.floor(Math.random() * 20) + 1;
    
    // Envia para o painel de iniciativa
    if (typeof window.addInitiativeFromSheet === 'function') {
        window.addInitiativeFromSheet({
            name: m.nome,
            init: initRoll,
            playerEmail: 'master_monster'
        });
        alert(`Monstro ${m.nome} adicionado à iniciativa com valor ${initRoll}!`);
    } else {
        alert("Painel de iniciativa não está carregado ou conectado.");
    }
}

function criarBloco(m) {
    const isManual = m.mode === 'manual';
    return `
    <div class="table-card" id="card-${m.id}" style="display:flex; flex-direction:column; gap:10px; position:relative;">
        
        <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px; z-index: 2;">
            <button class="btn-outline" style="padding: 5px 8px;" onclick="duplicateMonster('${m.id}')" title="Duplicar Monstro"><i class="fa-solid fa-copy"></i></button>
            <button class="btn-outline" style="padding: 5px 8px; border-color: #e74c3c; color: #e74c3c;" onclick="removeMonster('${m.id}')" title="Remover Monstro"><i class="fa-solid fa-trash"></i></button>
        </div>

        <div style="display:flex; gap:10px; margin-top: 30px;">
            <button id="btn-manual-${m.id}" class="${isManual ? 'btn-epic' : 'btn-outline'}" style="flex:1; padding:8px; font-size:0.8rem;" onclick="switchMonstroTab('${m.id}', 'manual')">Manual</button>
            <button id="btn-pdf-${m.id}" class="${!isManual ? 'btn-epic' : 'btn-outline'}" style="flex:1; padding:8px; font-size:0.8rem;" onclick="switchMonstroTab('${m.id}', 'pdf')">PDF Oficial</button>
        </div>
        
        <!-- MODO MANUAL -->
        <div id="manual-${m.id}" style="display: ${isManual ? 'block' : 'none'};">
            <label for="nome-${m.id}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">Nome da Criatura</label>
            <input class="input-modern" type="text" id="nome-${m.id}" placeholder="ex.: Goblin Ferrugem" style="width:100%; margin-bottom:10px;" value="${m.nome}" oninput="updateMonster('${m.id}', 'nome', this.value)" />
            <div style="display:flex;gap:10px; margin-bottom:10px;">
              <div style="flex:1;">
                <label for="vida-${m.id}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">Vida</label>
                <input class="input-modern" type="text" id="vida-${m.id}" placeholder="ex.: 45 / 45" style="width:100%;" value="${m.vida}" oninput="updateMonster('${m.id}', 'vida', this.value)" />
              </div>
              <div style="flex:1;">
                <label for="ca-${m.id}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">CA</label>
                <input class="input-modern" type="text" id="ca-${m.id}" placeholder="ex.: 15" style="width:100%;" value="${m.ca}" oninput="updateMonster('${m.id}', 'ca', this.value)" />
              </div>
            </div>
            <label for="anotacoes-${m.id}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">Anotações</label>
            <textarea class="input-modern" id="anotacoes-${m.id}" rows="4" placeholder="Habilidades, resistências, status…" style="width:100%; resize:vertical; margin-bottom:15px;" oninput="updateMonster('${m.id}', 'anotacoes', this.value)">${m.anotacoes}</textarea>
            
            <div style="display:flex; gap:10px;">
                <button class="btn-outline" style="flex:1;" onclick="adicionarMonstroIniciativa('${m.id}')">
                <i class="fa-solid fa-bolt"></i> Iniciativa
                </button>
                <button class="btn-outline" style="flex:1;" onclick="exportarMonstroPDF('${m.id}')">
                <i class="fa-solid fa-file-pdf"></i> Salvar PDF
                </button>
            </div>
        </div>

        <!-- MODO PDF -->
        <div id="pdf-${m.id}" style="display: ${!isManual ? 'block' : 'none'}; text-align:center;">
            <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:15px;">
                <div style="flex:1; text-align:left;">
                    <label style="color:var(--gold-dim); display:block; margin-bottom:5px;">Página no PDF:</label>
                    <input class="input-modern" type="number" id="pdf-page-${m.id}" placeholder="Pág. (ex: 35)" style="width:100%;" min="1" value="${m.pdfPage}" />
                </div>
                <button class="btn-outline" style="padding:10px;" onclick="renderPdfPage('${m.id}', document.getElementById('pdf-page-${m.id}').value)"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
            </div>
            <div style="width:100%; height:400px; background:rgba(0,0,0,0.3); border:1px dashed var(--gold-dim); display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
                <iframe id="pdf-frame-${m.id}" src="${m.pdfPage ? `assets/Bestiario de Dandora (1).pdf#page=${m.pdfPage}&view=FitH` : ''}" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        </div>
    </div>`;
}

function renderMonsters() {
    const container = document.getElementById('blocos');
    if (!container) return;
    
    if (monsters.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">Nenhum monstro criado ainda. Clique em "Novo Monstro" para começar.</div>`;
        return;
    }
    
    container.innerHTML = monsters.map(m => criarBloco(m)).join('');
}

function exportarMonstroPDF(id) {
    const m = monsters.find(x => x.id === id);
    if (!m) return;
    
    const nome = m.nome.trim() || 'Monstro Desconhecido';
    const vida = m.vida.trim() || '--';
    const ca = m.ca.trim() || '--';
    const anotacoes = m.anotacoes.trim() || 'Nenhuma anotação.';

    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '30px';
    pdfContainer.style.background = '#111';
    pdfContainer.style.color = '#e0e0e0';
    pdfContainer.style.fontFamily = "'Inter', sans-serif";
    pdfContainer.style.width = '600px';

    pdfContainer.innerHTML = `
    <div style="border: 2px solid #c9a84c; border-radius: 8px; padding: 20px; background: rgba(0,0,0,0.4);">
        <h1 style="color: #c9a84c; font-family: 'Cinzel', serif; border-bottom: 1px solid #c9a84c; padding-bottom: 10px; margin-top: 0;">
        ${nome}
        </h1>
        <div style="display: flex; gap: 20px; margin-bottom: 20px; font-size: 1.2rem;">
        <div><strong style="color: #c9a84c;">❤ Vida:</strong> ${vida}</div>
        <div><strong style="color: #c9a84c;">🛡️ CA:</strong> ${ca}</div>
        </div>
        <div>
        <h3 style="color: #c9a84c; border-bottom: 1px dashed rgba(201,168,76,0.3); padding-bottom: 5px;">Habilidades e Anotações</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${anotacoes}</p>
        </div>
    </div>
    `;

    document.body.appendChild(pdfContainer);

    const opt = {
    margin:       10,
    filename:     `${nome}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
    document.body.removeChild(pdfContainer);
    });
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    loadMonsters();
    renderMonsters();
    
    // Add "New Monster" button to the header
    const header = document.querySelector('#tm-monstros .dashboard-header');
    if (header) {
        const btn = document.createElement('button');
        btn.className = 'btn-epic';
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Novo Monstro';
        btn.onclick = addMonster;
        header.insertBefore(btn, header.children[1]);
    }
});

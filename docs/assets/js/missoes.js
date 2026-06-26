// ==========================================
// MISSION GENERATOR & MANAGER
// ==========================================

let currentMissionEditingId = null;

const missionIdeas = {
    objectives: [
        "Resgatar um nobre sequestrado", "Recuperar um artefato roubado", "Investigar o desaparecimento de uma caravana",
        "Assassinar um líder cultista", "Escoltar uma relíquia até um templo sagrado", "Limpar uma mina infestada de monstros",
        "Descobrir quem está envenenando o poço da vila", "Proteger um posto avançado de um ataque iminente",
        "Encontrar uma erva rara para curar uma praga", "Caçar uma besta mágica que aterroriza os fazendeiros",
        "Negociar um tratado de paz entre duas tribos rivais", "Roubar um documento incriminatório da mansão do prefeito"
    ],
    locations: [
        "Ruínas de um antigo templo élfico", "Cavernas Subterrâneas Cristalinas", "Uma mansão abandonada na floresta",
        "Um acampamento orc no desfiladeiro", "Os esgotos abaixo da capital", "Um navio encalhado em um recife fantasma",
        "A torre de um mago recluso", "Um cemitério profanado", "Uma vila de pescadores coberta por névoa eterna",
        "Um forte esquecido na tundra gelada", "O mercado negro subterrâneo", "Um oásis escondido no deserto escarlate"
    ],
    twists: [
        "O contratante era o verdadeiro vilão o tempo todo", "O 'monstro' na verdade está protegendo seus filhotes",
        "A relíquia atrai hordas de mortos-vivos quando movida", "O alvo do assassinato é um sósia inocente",
        "O tesouro é ilusório ou amaldiçoado", "Uma facção rival também foi contratada para o mesmo serviço",
        "O ambiente desmorona durante o clímax da missão", "Um aliado se revela um traidor",
        "A vila inteira faz parte do culto sombrio", "O problema foi causado por um erro do próprio contratante"
    ],
    rewards: [
        "500 Moedas de Ouro", "Uma arma mágica Incomum", "Uma propriedade antiga e em ruínas na vila",
        "Informações cruciais sobre a missão principal", "Um cavalo de guerra treinado",
        "O favor de uma divindade local", "Anistia por crimes passados", "Um mapa do tesouro",
        "Um item maravilhoso (Raro)", "100 Moedas de Platina e um título de nobreza menor"
    ]
};

function getRandomIdea(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function openMissionGenerator(missionId = null) {
    if (!currentTableId) {
        alert("Nenhuma mesa selecionada.");
        return;
    }
    
    currentMissionEditingId = missionId;
    const modal = document.getElementById('mission-modal');
    const titleEl = document.getElementById('mission-modal-title');
    
    if (missionId) {
        titleEl.textContent = "Editar Missão";
        const missions = JSON.parse(localStorage.getItem(`dandora_missions_${currentTableId}`)) || [];
        const m = missions.find(x => x.id === missionId);
        if (m) {
            document.getElementById('ms-title').value = m.title || '';
            document.getElementById('ms-objective').value = m.objective || '';
            document.getElementById('ms-location').value = m.location || '';
            document.getElementById('ms-description').value = m.description || '';
            document.getElementById('ms-npcs').value = m.npcs || '';
            document.getElementById('ms-twists').value = m.twists || '';
            document.getElementById('ms-rewards').value = m.rewards || '';
            document.getElementById('ms-difficulty').value = m.difficulty || 'Média';
        }
    } else {
        titleEl.textContent = "Criar Nova Missão";
        document.getElementById('mission-form').reset();
    }
    
    modal.showModal();
}

function closeMissionModal() {
    document.getElementById('mission-modal').close();
    currentMissionEditingId = null;
}

function generateRandomMission() {
    document.getElementById('ms-title').value = "Aventura: " + getRandomIdea(missionIdeas.objectives).split(' ')[0] + " nas Sombras";
    document.getElementById('ms-objective').value = getRandomIdea(missionIdeas.objectives);
    document.getElementById('ms-location').value = getRandomIdea(missionIdeas.locations);
    document.getElementById('ms-twists').value = getRandomIdea(missionIdeas.twists);
    document.getElementById('ms-rewards').value = getRandomIdea(missionIdeas.rewards);
    document.getElementById('ms-difficulty').value = ["Fácil", "Média", "Difícil", "Mortal"][Math.floor(Math.random() * 4)];
}

function saveMission(event) {
    event.preventDefault();
    if (!currentTableId) return;
    
    const key = `dandora_missions_${currentTableId}`;
    let missions = JSON.parse(localStorage.getItem(key)) || [];
    
    const missionData = {
        title: document.getElementById('ms-title').value,
        objective: document.getElementById('ms-objective').value,
        location: document.getElementById('ms-location').value,
        description: document.getElementById('ms-description').value,
        npcs: document.getElementById('ms-npcs').value,
        twists: document.getElementById('ms-twists').value,
        rewards: document.getElementById('ms-rewards').value,
        difficulty: document.getElementById('ms-difficulty').value
    };
    
    if (currentMissionEditingId) {
        const index = missions.findIndex(x => x.id === currentMissionEditingId);
        if (index > -1) {
            missions[index] = { ...missions[index], ...missionData };
        }
    } else {
        missions.push({
            id: Date.now().toString(),
            ...missionData
        });
    }
    
    localStorage.setItem(key, JSON.stringify(missions));
    closeMissionModal();
    renderMissions();
}

function renderMissions() {
    const list = document.getElementById('tm-missions-list');
    if (!list || !currentTableId) return;
    
    const missions = JSON.parse(localStorage.getItem(`dandora_missions_${currentTableId}`)) || [];
    
    if (missions.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; margin-top:2rem;">Nenhuma missão criada. Clique em "Nova Missão" para começar.</p>`;
        return;
    }
    
    list.innerHTML = missions.map(m => `
        <div class="mission-card glass-panel" style="position:relative; background-color: rgba(26, 20, 15, 0.95); border: 1px solid var(--gold-dim); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <div style="position:absolute; top:10px; right:10px; display:flex; gap:5px;">
                <button class="btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="openMissionGenerator('${m.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="duplicateMission('${m.id}')" title="Duplicar"><i class="fa-solid fa-copy"></i></button>
                <button class="btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:#e07060; color:#e07060;" onclick="deleteMission('${m.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
            <h3 style="font-family:'Cinzel',serif; color:var(--gold-primary); margin:0; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:0.5rem; width: 85%; font-size: 1.2rem;">${m.title}</h3>
            
            <div style="flex:1;">
                <p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong style="color:var(--gold-dim);">Objetivo:</strong> ${m.objective}</p>
                ${m.location ? `<p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong style="color:var(--gold-dim);">Local:</strong> ${m.location}</p>` : ''}
                ${m.difficulty ? `<p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong style="color:var(--gold-dim);">Dificuldade:</strong> <span class="tag">${m.difficulty}</span></p>` : ''}
            </div>
            
            ${m.rewards ? `<div style="margin-top:auto; background:rgba(0,0,0,0.3); padding:0.8rem; border-radius:4px; border-left:3px solid var(--gold-primary);"><strong style="color:var(--gold-primary); font-size:0.8rem; display:block; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.3rem;">Recompensas:</strong><span style="font-size:0.9rem;">${m.rewards}</span></div>` : ''}
        </div>
    `).join('');
}

function deleteMission(id) {
    if (!confirm("Tem certeza que deseja excluir esta missão?")) return;
    const key = `dandora_missions_${currentTableId}`;
    let missions = JSON.parse(localStorage.getItem(key)) || [];
    missions = missions.filter(m => m.id !== id);
    localStorage.setItem(key, JSON.stringify(missions));
    renderMissions();
}

function duplicateMission(id) {
    const key = `dandora_missions_${currentTableId}`;
    let missions = JSON.parse(localStorage.getItem(key)) || [];
    const original = missions.find(m => m.id === id);
    if (original) {
        missions.push({
            ...original,
            id: Date.now().toString(),
            title: original.title + " (Cópia)"
        });
        localStorage.setItem(key, JSON.stringify(missions));
        renderMissions();
    }
}

// Intercept tab switching to render content
const _originalSwitchTableTabMissions = switchTableTab;
switchTableTab = function(tabId) {
    _originalSwitchTableTabMissions(tabId);
    if (tabId === 'tm-missions') {
        renderMissions();
    }
}

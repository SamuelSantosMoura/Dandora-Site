// ==========================================
// DANDORA FIREBASE SYNC ENGINE
// ==========================================

// Configuração do Firebase (SUBSTITUA ESTES VALORES PELOS DO SEU PROJETO)
const firebaseConfig = {
    apiKey: "AIzaSyDGdMNpMroJrDNhHI6xy5msgISX5D6WFzw",
    authDomain: "dandora-rpg.firebaseapp.com",
    databaseURL: "https://dandora-rpg-default-rtdb.firebaseio.com",
    projectId: "dandora-rpg",
    storageBucket: "dandora-rpg.firebasestorage.app",
    messagingSenderId: "195226029108",
    appId: "1:195226029108:web:3909e2ecc4c7fdebbece61"
};

// Funções seguras para Base64 com suporte a acentos/unicode
function safeBtoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
function safeAtob(str) {
    return decodeURIComponent(escape(atob(str)));
}

// Se a chave não foi configurada, abortar silenciosamente
if (firebaseConfig.apiKey !== "COLE_SUA_CHAVE_AQUI") {
    
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    window.dandoraDatabase = database;
    
    // Salvar as funções originais do localStorage
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    // Flag para evitar loops infinitos
    let isSyncingFromCloud = false;

    // Track when a key was last written locally to prevent cloud overwriting it during typing
    const lastLocalWrite = {};

    // Track the last value sent to the cloud so we can ignore echoes
    const lastSentToCloud = {};

    // Chaves locais que nunca devem ser sincronizadas para a nuvem
    // NOTA: dandora_users FOI REMOVIDO desta lista para permitir login entre dispositivos
    const EXCLUDED_KEYS = ['dandora_currentUser', 'dandora_currentMode', 'dandora-ficha-v1'];
    
    // 1. Interceptar escritas no localStorage (Enviar para a nuvem)
    localStorage.setItem = function(key, value) {
        lastLocalWrite[key] = Date.now();
        originalSetItem.apply(this, arguments); // Salva localmente primeiro
        
        // Só sincroniza se não estiver recebendo da nuvem, se não for uma chave excluída e se não estiver explicitamente desabilitado
        if (!isSyncingFromCloud && key.startsWith('dandora_') && !EXCLUDED_KEYS.includes(key) && !window.dandoraDisableSync) {
            try {
                const safeKey = safeBtoa(key);
                let toSave = value;
                try { toSave = JSON.parse(value); } catch(e) {}
                lastSentToCloud[key] = value; // Rastrear o valor enviado para ignorar eco
                database.ref('dandora_data/' + safeKey).set(toSave);
            } catch(e) {
                console.error("Erro ao sincronizar com Firebase:", e);
            }
        }
    };
    
    localStorage.removeItem = function(key) {
        lastLocalWrite[key] = Date.now();
        originalRemoveItem.apply(this, arguments);
        if (!isSyncingFromCloud && key.startsWith('dandora_') && !EXCLUDED_KEYS.includes(key)) {
            try {
                const safeKey = safeBtoa(key);
                database.ref('dandora_data/' + safeKey).remove();
            } catch(e) {}
        }
    };
    
    localStorage.clear = function() {
        originalClear.apply(this, arguments);
    };
    
    // Enviar dados locais para a nuvem no primeiro acesso
    database.ref('dandora_data').once('value').then(snapshot => {
        if (!snapshot.exists()) {
            isSyncingFromCloud = true;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('dandora_') && !EXCLUDED_KEYS.includes(key)) {
                    const value = localStorage.getItem(key);
                    const safeKey = safeBtoa(key);
                    let toSave = value;
                    try { toSave = JSON.parse(value); } catch(e) {}
                    database.ref('dandora_data/' + safeKey).set(toSave);
                }
            }
            isSyncingFromCloud = false;
        }
    });

    // 2. Escutar mudanças na nuvem (Receber atualizações de outros dispositivos)
    database.ref('dandora_data').on('value', (snapshot) => {
        const cloudData = snapshot.val() || {};
        let dataChanged = false;
        
        isSyncingFromCloud = true; // Bloqueia o envio de volta
        
        for (const safeKey in cloudData) {
            try {
                const cloudValue = cloudData[safeKey];
                const cloudString = typeof cloudValue === 'object' ? JSON.stringify(cloudValue) : cloudValue;
                const originalKey = safeAtob(safeKey); // Desfaz o Base64 para ler a chave original
                
                // Ignorar chaves de sessão locais
                if (EXCLUDED_KEYS.includes(originalKey)) continue;
                
                // Ignorar se a chave foi alterada localmente nos ultimos 5 segundos (evita sobrescrever quem esta digitando)
                if (Date.now() - (lastLocalWrite[originalKey] || 0) < 5000) continue;
                
                // Ignorar eco: se o valor da nuvem é igual ao que acabamos de enviar
                if (lastSentToCloud[originalKey] !== undefined) {
                    const sentString = lastSentToCloud[originalKey];
                    if (sentString === cloudString) {
                        delete lastSentToCloud[originalKey]; // Limpar após confirmar eco
                        continue;
                    }
                }

                const localValue = localStorage.getItem(originalKey);
                
                let isDifferent = true;
                if (localValue) {
                    try {
                        const localParsed = JSON.parse(localValue);
                        const cloudParsed = typeof cloudValue === 'object' ? cloudValue : JSON.parse(cloudValue);
                        
                        function deepEq(a, b) {
                            if (a === b) return true;
                            if (a == null || typeof a != "object" || b == null || typeof b != "object") return false;
                            let keysA = Object.keys(a), keysB = Object.keys(b);
                            if (keysA.length != keysB.length) return false;
                            for (let key of keysA) {
                                if (!keysB.includes(key) || !deepEq(a[key], b[key])) return false;
                            }
                            return true;
                        }
                        
                        isDifferent = !deepEq(localParsed, cloudParsed);
                    } catch (e) {
                        isDifferent = localValue !== cloudString;
                    }
                }
                
                if (isDifferent) {
                    let finalValue = cloudString;
                    
                    // Merge inteligente para dandora_users (banco de contas)
                    // Preserva contas de AMBOS os dispositivos para evitar perda de dados
                    if (originalKey === 'dandora_users') {
                        try {
                            let localUsers = localValue ? JSON.parse(localValue) : [];
                            let cloudUsers = typeof cloudValue === 'object' ? cloudValue : JSON.parse(cloudValue);
                            
                            if (!Array.isArray(localUsers)) localUsers = Object.values(localUsers || {});
                            if (!Array.isArray(cloudUsers)) cloudUsers = Object.values(cloudUsers || {});
                            
                            if (Array.isArray(localUsers) && Array.isArray(cloudUsers)) {
                                // Criar mapa por email para merge
                                const mergedMap = new Map();
                                
                                // Adicionar todos os usuários da nuvem primeiro
                                cloudUsers.forEach(u => { if (u && u.email) mergedMap.set(u.email.toLowerCase(), u); });
                                
                                // Adicionar/atualizar com usuários locais
                                localUsers.forEach(u => {
                                    if (!u || !u.email) return;
                                    const emailLower = u.email.toLowerCase();
                                    const existing = mergedMap.get(emailLower);
                                    if (!existing) {
                                        // Usuário só existe localmente, adicionar
                                        mergedMap.set(emailLower, u);
                                    } else {
                                        // Usuário existe em ambos — manter o com acesso mais recente
                                        const localTime = u.lastAccess ? new Date(u.lastAccess).getTime() : 0;
                                        const cloudTime = existing.lastAccess ? new Date(existing.lastAccess).getTime() : 0;
                                        if (localTime > cloudTime) {
                                            mergedMap.set(u.email, u);
                                        }
                                        // Se cloud é mais recente, já está no mapa
                                    }
                                });
                                
                                const mergedUsers = Array.from(mergedMap.values());
                                finalValue = JSON.stringify(mergedUsers);
                                
                                // Se o merge resultou em mais usuários que a nuvem, enviar de volta
                                if (mergedUsers.length > cloudUsers.length) {
                                    database.ref('dandora_data/' + safeKey).set(mergedUsers);
                                }
                            }
                        } catch (mergeErr) {
                            console.error('Erro no merge de usuários:', mergeErr);
                            // Em caso de erro, aceitar dados da nuvem como fallback
                        }
                    }
                    
                    originalSetItem.call(localStorage, originalKey, finalValue);
                    dataChanged = true;
                }
            } catch (e) {
                console.error("Erro ao processar chave do Firebase:", e);
            }
        }
        
        isSyncingFromCloud = false;
        
        // Se houve mudanças vindas da nuvem, avisa o site para redesenhar a tela
        if (dataChanged) {
            window.dispatchEvent(new CustomEvent('dandoraDataSync'));
        }
    });

} else {
    console.warn("⚠️ Firebase Sync não ativado. Insira suas chaves no arquivo firebase-sync.js para habilitar o multiplayer e sincronização de celular.");
}

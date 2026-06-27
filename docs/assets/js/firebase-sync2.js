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
    
    // 1. Interceptar escritas no localStorage (Enviar para a nuvem)
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments); // Salva localmente primeiro
        
        // Só sincroniza se não estiver recebendo da nuvem e se não estiver explicitamente desabilitado
        if (!isSyncingFromCloud && key.startsWith('dandora_') && !window.dandoraDisableSync) {
            try {
                const safeKey = btoa(key);
                let toSave = value;
                try { toSave = JSON.parse(value); } catch(e) {}
                database.ref('dandora_data/' + safeKey).set(toSave);
            } catch(e) {
                console.error("Erro ao sincronizar com Firebase:", e);
            }
        }
    };
    
    localStorage.removeItem = function(key) {
        originalRemoveItem.apply(this, arguments);
        if (!isSyncingFromCloud && key.startsWith('dandora_')) {
            try {
                const safeKey = btoa(key);
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
                if (key.startsWith('dandora_')) {
                    const value = localStorage.getItem(key);
                    const safeKey = btoa(key);
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
                const originalKey = atob(safeKey); // Desfaz o Base64 para ler a chave original
                const localValue = localStorage.getItem(originalKey);
                
                if (localValue !== cloudString) {
                    let finalValue = cloudString;
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

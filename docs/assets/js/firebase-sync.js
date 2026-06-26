// ==========================================
// DANDORA FIREBASE SYNC ENGINE
// ==========================================

// Configuração do Firebase (SUBSTITUA ESTES VALORES PELOS DO SEU PROJETO)
const firebaseConfig = {
    apiKey: "COLE_SUA_CHAVE_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "NUMERO_AQUI",
    appId: "APP_ID_AQUI"
};

// Se a chave não foi configurada, abortar silenciosamente
if (firebaseConfig.apiKey !== "COLE_SUA_CHAVE_AQUI") {
    
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // Salvar as funções originais do localStorage
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    // Flag para evitar loops infinitos
    let isSyncingFromCloud = false;
    
    // 1. Interceptar escritas no localStorage (Enviar para a nuvem)
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments); // Salva localmente primeiro
        
        // Só sincroniza chaves do próprio site e se não estiver recebendo da nuvem agora
        if (!isSyncingFromCloud && key.startsWith('dandora_')) {
            try {
                // Usa Base64 para a chave para evitar problemas com '.', '#', '@' no Firebase
                const safeKey = btoa(key);
                database.ref('dandora_data/' + safeKey).set(value);
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
    
    // Enviar dados locais para a nuvem no primeiro acesso (se a nuvem estiver vazia)
    // ou puxar da nuvem (se o dispositivo for novo/celular)
    database.ref('dandora_data').once('value').then(snapshot => {
        if (!snapshot.exists()) {
            // Nuvem vazia, fazer upload dos dados locais (PC principal)
            isSyncingFromCloud = true;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('dandora_')) {
                    const value = localStorage.getItem(key);
                    const safeKey = btoa(key);
                    database.ref('dandora_data/' + safeKey).set(value);
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
                const originalKey = atob(safeKey); // Desfaz o Base64 para ler a chave original
                const localValue = localStorage.getItem(originalKey);
                
                if (localValue !== cloudValue) {
                    originalSetItem.call(localStorage, originalKey, cloudValue);
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

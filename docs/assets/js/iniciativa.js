(function() {
    const nameInput  = document.getElementById('nameInput');
    const initInput  = document.getElementById('initInput');
    const addBtn     = document.getElementById('addBtn');
    const rollBtn    = document.getElementById('rollBtn');
    const resetBtn   = document.getElementById('resetBtn');
    const listBody   = document.getElementById('listBody');
    const rowTemplate = document.getElementById('rowTemplate');
    const editDialog = document.getElementById('editDialog');
    const editName   = document.getElementById('editName');
    const editInit   = document.getElementById('editInit');

    let items = [];
    let fbRef = null;

    function getTableId() {
        if (typeof window.getActiveTableId === 'function') {
            return window.getActiveTableId();
        }
        return window.currentTableId || null;
    }

    // Inicialização da sincronização com Firebase
    function initFirebase() {
        const tId = getTableId();
        if (fbRef) fbRef.off();
        if (tId && window.dandoraDatabase) {
            fbRef = window.dandoraDatabase.ref(`dandora_initiative_${tId}`);
            fbRef.on('value', snapshot => {
                const data = snapshot.val();
                if (data) {
                    items = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                } else {
                    items = [];
                }
                renderLocal();
            });
        } else {
            // Fallback para localStorage
            items = loadLocal() || [];
            renderLocal();
        }
    }

    window.initInitiativeSync = initFirebase;
    
    // Tenta inicializar se tableId já estiver disponível, ou aguarda (ex: openTable)
    setTimeout(initFirebase, 2000);

    // Função exposta para a janela principal (app2.js) inserir iniciativa vinda da Ficha
    window.addInitiativeFromSheet = function(payload) {
        const tId = getTableId();
        if (tId && fbRef) {
            // Payload: { name: string, init: number, playerEmail: string }
            // Verifica se o personagem já existe
            const existingId = items.find(i => i.playerEmail === payload.playerEmail || i.name === payload.name)?.id;
            const newId = existingId || crypto.randomUUID();
            fbRef.child(newId).set({
                name: payload.name,
                init: payload.init,
                playerEmail: payload.playerEmail
            });
        }
    };

    function save() {
        const tId = getTableId();
        if (tId && fbRef) {
            const dataToSave = {};
            items.forEach(i => {
                const { id, ...rest } = i;
                dataToSave[id] = rest;
            });
            fbRef.set(dataToSave);
        } else {
            try { localStorage.setItem('initiative-items', JSON.stringify(items)); } catch {}
        }
    }
    
    function loadLocal() {
      try { return JSON.parse(localStorage.getItem('initiative-items')) || []; } catch { return []; }
    }

    function toNumber(value) {
      if (value === '' || value === null || value === undefined) return NaN;
      const n = Number(value);
      return Number.isFinite(n) ? n : NaN;
    }

    function sortItems() {
      items.sort((a, b) => b.init - a.init);
    }

    function clearInputs() {
      if(nameInput) {
        nameInput.value = '';
        initInput.value = '';
        nameInput.focus();
      }
    }

    function renderLocal() {
      if (listBody) {
          listBody.innerHTML = '';
          sortItems();
          for (const item of items) {
            const row = rowTemplate.content.firstElementChild.cloneNode(true);
            row.querySelector('.name').textContent = item.name;
            row.querySelector('.initiative').innerHTML = `<span class="chip">${item.init}</span>`;
            row.querySelector('.edit').addEventListener('click', () => openEdit(item));
            row.querySelector('.remove').addEventListener('click', () => removeItem(item.id));
            listBody.appendChild(row);
          }
      }
      
      const ptList = document.getElementById('pt-initiative-list');
      if (ptList) {
          ptList.innerHTML = '';
          sortItems();
          for (const item of items) {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding: 10px;">${item.name}</td>
                <td style="padding: 10px; text-align: right;"><span class="chip" style="background:var(--gold-dim); padding:4px 8px; border-radius:4px; font-weight:bold; color:var(--bg-dark);">${item.init}</span></td>
            `;
            ptList.appendChild(tr);
          }
      }
    }

    function addItem() {
      const name = (nameInput.value || '').trim();
      const init = toNumber(initInput.value);
      if (!name) { alert('Digite um nome.'); nameInput.focus(); return; }
      if (!Number.isFinite(init)) { alert('Iniciativa inválida: use apenas números (ex.: 12).'); initInput.focus(); return; }
      
      const newId = crypto.randomUUID();
      items.push({ id: newId, name, init });
      save();
      renderLocal();
      clearInputs();
    }

    function removeItem(id) {
      if (fbRef) {
          fbRef.child(id).remove();
      } else {
          items = items.filter(i => i.id !== id);
          save();
          renderLocal();
      }
    }

    function openEdit(item) {
      if(!editDialog) return;
      editName.value = item.name;
      editInit.value = item.init;
      editDialog.returnValue = 'cancel';
      editDialog.showModal();
      editDialog.onclose = () => {
        if (editDialog.returnValue !== 'ok') return;
        const name = editName.value.trim();
        const init = toNumber(editInit.value);
        if (!name) return alert('Nome não pode ficar vazio.');
        if (!Number.isFinite(init)) return alert('Iniciativa inválida.');
        
        if (fbRef) {
            fbRef.child(item.id).update({ name, init });
        } else {
            const idx = items.findIndex(x => x.id === item.id);
            if (idx !== -1) { items[idx] = { ...items[idx], name, init }; save(); renderLocal(); }
        }
      };
    }

    function rollD20PlusMod() {
      const mod = toNumber(initInput.value);
      if (!Number.isFinite(mod)) { alert('Digite seu modificador numérico no campo de iniciativa para usar d20 + mod.'); initInput.focus(); return; }
      const d20 = Math.floor(Math.random() * 20) + 1;
      initInput.value = d20 + mod;
      addBtn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:200});
    }

    if(addBtn) addBtn.addEventListener('click', addItem);
    if(rollBtn) rollBtn.addEventListener('click', rollD20PlusMod);
    if(resetBtn) resetBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar toda a lista?')) { 
          if(fbRef) fbRef.remove();
          else { items = []; save(); renderLocal(); }
          clearInputs(); 
      }
    });

    if(nameInput && initInput) {
        [nameInput, initInput].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); }));
    }

    renderLocal();
})();

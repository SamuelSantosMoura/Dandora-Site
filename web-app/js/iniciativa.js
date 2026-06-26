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

    let items = load() || [];

    function save() {
      try { localStorage.setItem('initiative-items', JSON.stringify(items)); } catch {}
    }
    function load() {
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
      nameInput.value = '';
      initInput.value = '';
      nameInput.focus();
    }

    function render() {
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
      save();
    }

    function addItem() {
      const name = (nameInput.value || '').trim();
      const init = toNumber(initInput.value);
      if (!name) { alert('Digite um nome.'); nameInput.focus(); return; }
      if (!Number.isFinite(init)) { alert('Iniciativa inválida: use apenas números (ex.: 12).'); initInput.focus(); return; }
      items.push({ id: crypto.randomUUID(), name, init });
      render();
      clearInputs();
    }

    function removeItem(id) {
      items = items.filter(i => i.id !== id);
      render();
    }

    function openEdit(item) {
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
        const idx = items.findIndex(x => x.id === item.id);
        if (idx !== -1) { items[idx] = { ...items[idx], name, init }; render(); }
      };
    }

    function rollD20PlusMod() {
      const mod = toNumber(initInput.value);
      if (!Number.isFinite(mod)) { alert('Digite seu modificador numérico no campo de iniciativa para usar d20 + mod.'); initInput.focus(); return; }
      const d20 = Math.floor(Math.random() * 20) + 1;
      initInput.value = d20 + mod;
      addBtn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:200});
    }

    addBtn.addEventListener('click', addItem);
    rollBtn.addEventListener('click', rollD20PlusMod);
    resetBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar toda a lista?')) { items = []; render(); clearInputs(); }
    });

    [nameInput, initInput].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); }));

    render();
  

/* ============================================================
   DANDORA RPG â€” Ficha de Personagem â€” Lógica
   Persistência LocalStorage + Exportar/Importar JSON
   ============================================================ */

(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const tableId = urlParams.get('tableId');
  const playerEmail = urlParams.get('playerEmail');
  
  let STORAGE_KEY = 'dandora-ficha-v1';
  if (tableId && playerEmail) {
    STORAGE_KEY = `dandora_sheet_${tableId}_${playerEmail}`;
  }
  
  const readOnly = urlParams.get('readOnly') === 'true';

  let saveTimeout = null;

  /* ==========================================================
     INICIALIZAÇÃO
  ========================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    bindAutoSave();
    updateAllBars();
    updateAllDice();
    updateSlots();
    updateSaveIndicator();
  });

  /* ==========================================================
     AUTO-SAVE â€” Debounced (500ms)
  ========================================================== */
  function bindAutoSave() {
    const container = document.querySelector('.container');
    if (!container) return;

    container.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveData();
        updateAllBars();
        updateSlots();
      }, 500);
    });

    container.addEventListener('change', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveData();
        updateSlots();
      }, 300);
    });
  }

  /* ==========================================================
     COLETA DE DADOS
  ========================================================== */
  function collectData() {
    return {
      // Identidade
      nome: val('nome'),
      jogador: val('jogador'),
      classe: val('classe'),
      origem: val('origem'),
      heranca: val('heranca') || (val('heranca-nivel') ? val('heranca-nivel').split('/')[0]?.trim() : ''),
      nivel: val('nivel') || (val('heranca-nivel') ? val('heranca-nivel').split('/')[1]?.trim() : ''),
      portrait: getPortraitData(),

      // Combate
      classe_armadura: val('classe-armadura'),
      iniciativa: val('iniciativa'),
      deslocamento: val('deslocamento'),
      pontos_destino: val('pontos-destino'),

      // Atributos (valor 0-10)
      forca: val('attr-forca'),
      destreza: val('attr-destreza'),
      constituicao: val('attr-constituicao'),
      inteligencia: val('attr-inteligencia'),
      vontade: val('attr-vontade'),
      carisma: val('attr-carisma'),

      // Recursos
      pv_atual: val('pv-atual'),
      pv_max: val('pv-max'),
      pa_atual: val('pa-atual'),
      pa_max: val('pa-max'),
      xp: val('xp'),
      loucura: val('loucura'),

      // Armadura
      armadura: val('armadura-escudos'),

      // Perícias
      pericias: collectSkills(),

      // Ataques
      ataques: collectAttacks(),

      // Inventário
      container_type: val('container-type'),
      moedas_bronze: val('moedas-bronze'),
      moedas_prata: val('moedas-prata'),
      moedas_ouro: val('moedas-ouro'),
      moedas_diamante: val('moedas-diamante'),
      itens: collectItems(),

      // Anotações
      anotacoes: val('anotacoes'),

      // Magias header
      atrib_conjuracao: val('atrib-conjuracao'),
      bonus_ataque_magia: val('bonus-ataque-magia'),
      teste_resistencia_magia: val('teste-resistencia-magia'),

      // Magias
      magias: collectSpells(),

      // Habilidades
      habilidades: collectHabilidades(),

      // Histórico e Favoritos
      history: window.rollHistory || [],
      customFavorites: window.customFavorites || []
    };
  }

  function collectSkills() {
    const skills = {};
    document.querySelectorAll('.skill-row').forEach(row => {
      const key = row.dataset.skill;
      if (!key) return;
      const cb = row.querySelector('input[type="checkbox"]');
      const input = row.querySelector('input[type="text"]');
      skills[key] = {
        proficient: cb ? cb.checked : false,
        bonus: input ? input.value : ''
      };
    });
    return skills;
  }

  function collectAttacks() {
    const attacks = [];
    document.querySelectorAll('#attacks-body tr').forEach(tr => {
      const inputs = tr.querySelectorAll('input');
      if (inputs.length >= 6) {
        attacks.push({
          nome: inputs[0].value,
          bonus: inputs[1].value,
          dano: inputs[2].value,
          critico: inputs[3].value,
          tipo: inputs[4].value,
          alcance: inputs[5].value
        });
      }
    });
    return attacks;
  }

  function collectSpells() {
    const spells = [];
    document.querySelectorAll('.spell-card').forEach(card => {
      const inputs = card.querySelectorAll('input');
      const textarea = card.querySelector('textarea');
      if (inputs.length >= 8) {
        spells.push({
          nome: inputs[0].value,
          tipo: inputs[1].value,
          execucao: inputs[2].value,
          alcance: inputs[3].value,
          alvo: inputs[4].value,
          duracao: inputs[5].value,
          pa: inputs[6].value,
          resistencia: inputs[7].value,
          efeito: textarea ? textarea.value : ''
        });
      }
    });
    return spells;
  }

  function collectHabilidades() {
    const habs = [];
    document.querySelectorAll('#habilidades-container .spell-card').forEach(card => {
      const inputs = card.querySelectorAll('input');
      const textarea = card.querySelector('textarea');
      if (inputs.length >= 3 && textarea) {
        habs.push({
          nome: inputs[0].value,
          tipo: inputs[1].value,
          custo: inputs[2].value,
          desc: textarea.value
        });
      }
    });
    return habs;
  }

  function collectItems() {
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
      const nameInput = row.querySelector('.item-name');
      const slotsInput = row.querySelector('.item-slots');
      const qtyInput = row.querySelector('.item-qty');
      items.push({
        nome: nameInput ? nameInput.value : '',
        slots: slotsInput ? parseInt(slotsInput.value) || 0 : 0,
        quantidade: qtyInput ? parseInt(qtyInput.value) || 1 : 1
      });
    });
    return items;
  }

  function getPortraitData() {
    const img = document.getElementById('portrait-img');
    if (img && img.src && img.style.display !== 'none' && !img.src.endsWith('/')) {
      // Verifica se é um data URL real (não vazio)
      if (img.src.startsWith('data:')) return img.src;
    }
    return '';
  }

  /* ==========================================================
     SALVAR NO LOCALSTORAGE
  ========================================================== */
  function saveData() {
    try {
      const data = collectData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Não enviamos mais automaticamente para o mestre! (Salvamento Manual)
    } catch (e) {
      console.error('Erro ao salvar:', e);
      if (e.name === 'QuotaExceededError') {
        showToast('⚠️ Armazenamento cheio! Tente reduzir a imagem.');
      }
    }
  }

  window.syncToMaster = function() {
    try {
      const data = collectData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'DANDORA_SHEET_UPDATED', data: data }, '*');
      }
      showToast('💾 Ficha salva e sincronizada com a mesa!');
      updateSaveIndicator();
    } catch (e) {
      console.error('Erro ao sincronizar:', e);
      showToast('❌ Erro ao salvar ficha.');
    }
  };

  /* ==========================================================
     CARREGAR DO LOCALSTORAGE
  ========================================================== */
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      applyData(data);
    } catch (e) {
      console.error('Erro ao carregar:', e);
    }
  }

  function applyData(data) {
    if (!data) return;
    const activeEl = document.activeElement;

    // Identidade
    setVal('nome', data.nome);
    setVal('jogador', data.jogador);
    setVal('classe', data.classe);
    setVal('origem', data.origem);
    setVal('heranca', data.heranca || (data.heranca_nivel ? data.heranca_nivel.split('/')[0]?.trim() : ''));
    setVal('nivel', data.nivel || (data.heranca_nivel ? data.heranca_nivel.split('/')[1]?.trim() : ''));

    // Portrait
    if (data.portrait) {
      setPortrait(data.portrait);
    }

    // Combate
    setVal('classe-armadura', data.classe_armadura);
    setVal('iniciativa', data.iniciativa);
    setVal('deslocamento', data.deslocamento);
    setVal('pontos-destino', data.pontos_destino);

    // Atributos
    setVal('attr-forca', data.forca);
    setVal('attr-destreza', data.destreza);
    setVal('attr-constituicao', data.constituicao);
    setVal('attr-inteligencia', data.inteligencia);
    setVal('attr-vontade', data.vontade);
    setVal('attr-carisma', data.carisma);

    // Recursos
    setVal('pv-atual', data.pv_atual);
    setVal('pv-max', data.pv_max);
    setVal('pa-atual', data.pa_atual);
    setVal('pa-max', data.pa_max);
    setVal('xp', data.xp);
    setVal('loucura', data.loucura);

    // Armadura
    setVal('armadura-escudos', data.armadura);

    // Perícias
    const isTypingInSkills = activeEl && activeEl.closest('.skills-grid');
    if (data.pericias && !isTypingInSkills) {
      Object.keys(data.pericias).forEach(key => {
        const row = document.querySelector(`.skill-row[data-skill="${key}"]`);
        if (!row) return;
        const cb = row.querySelector('input[type="checkbox"]');
        const input = row.querySelector('input[type="text"]');
        if (cb) cb.checked = data.pericias[key].proficient;
        if (input && document.activeElement !== input) input.value = data.pericias[key].bonus || '';
      });
    }

    // Ataques
    const isTypingInAttacks = activeEl && activeEl.closest('#attacks-body');
    if (Array.isArray(data.ataques) && data.ataques.length > 0 && !isTypingInAttacks) {
      const tbody = document.getElementById('attacks-body');
      if (tbody) {
        tbody.innerHTML = '';
        data.ataques.forEach(atk => addAttackRow(atk));
      }
    }

    // Inventário
    setVal('container-type', data.container_type);
    setVal('moedas-bronze', data.moedas_bronze);
    setVal('moedas-prata', data.moedas_prata);
    setVal('moedas-ouro', data.moedas_ouro);
    setVal('moedas-diamante', data.moedas_diamante);
    const isTypingInItems = activeEl && activeEl.closest('#items-list');
    if (Array.isArray(data.itens) && data.itens.length > 0 && !isTypingInItems) {
      const list = document.getElementById('items-list');
      if (list) {
        list.innerHTML = '';
        data.itens.forEach(item => addItem(item));
      }
    }

    // Anotações
    setVal('anotacoes', data.anotacoes);

    // Magias header
    setVal('atrib-conjuracao', data.atrib_conjuracao);
    setVal('bonus-ataque-magia', data.bonus_ataque_magia);
    setVal('teste-resistencia-magia', data.teste_resistencia_magia);

    // Magias
    const isTypingInSpells = activeEl && activeEl.closest('#spells-container');
    const spellsContainer = document.getElementById('spells-container');
    if (spellsContainer && Array.isArray(data.magias) && data.magias.length > 0 && !isTypingInSpells) {
      spellsContainer.innerHTML = '';
      data.magias.forEach(sp => addSpellCard(sp));
    }

    // Habilidades
    const isTypingInHabs = activeEl && activeEl.closest('#habilidades-container');
    const habsContainer = document.getElementById('habilidades-container');
    if (habsContainer && Array.isArray(data.habilidades) && data.habilidades.length > 0 && !isTypingInHabs) {
      habsContainer.innerHTML = '';
      data.habilidades.forEach(hb => addHabilidadeCard(hb));
    }

    // Histórico e Favoritos
    window.rollHistory = data.history || [];
    window.customFavorites = data.customFavorites || [];
    if(typeof renderFavorites === 'function') renderFavorites();
    renderHistory();

    updateAllBars();
    updateAllDice();
    updateSlots();
  }

  /* ==========================================================
     HELPERS
  ========================================================== */
  function val(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return el.value || '';
  }

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null) return;
    if (el.type === 'checkbox') {
      el.checked = !!value;
    } else {
      // Evitar sobrescrever se o usuǭrio estiver digitando neste exato campo
      if (el.value != value && document.activeElement !== el) {
        el.value = value;
      }
    }
  }

  /* ==========================================================
     BARRAS DE RECURSO (PV / PA)
  ========================================================== */
  function updateAllBars() {
    updateBar('pv-atual', 'pv-max', 'pv-bar', 'hp');
    updateBar('pa-atual', 'pa-max', 'pa-bar', 'ap');
  }

  function updateBar(currentId, maxId, barId, type) {
    const current = parseInt(val(currentId)) || 0;
    const max = parseInt(val(maxId)) || 1;
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    const bar = document.getElementById(barId);
    if (!bar) return;

    bar.style.width = pct + '%';

    if (type === 'hp') {
      bar.classList.remove('high', 'mid');
      if (pct > 60) bar.classList.add('high');
      else if (pct > 30) bar.classList.add('mid');
    }
  }

  /* ==========================================================
     DADOS D20 â€” Cálculo e Display
  ========================================================== */
  function calcDiceConfig(value) {
    const v = parseInt(value) || 0;
    if (v <= 0) return { count: 2, strategy: 'lowest' }; // -4 a 0
    if (v >= 1 && v <= 3) return { count: 1, strategy: 'single' };
    if (v >= 4 && v <= 6) return { count: 2, strategy: 'highest' };
    if (v >= 7 && v <= 9) return { count: 3, strategy: 'highest' };
    return { count: 4, strategy: 'highest' }; // 10
  }

  function updateAllDice() {
    const attrs = ['forca', 'destreza', 'constituicao', 'inteligencia', 'vontade', 'carisma'];
    attrs.forEach(attr => {
      const input = document.getElementById('attr-' + attr);
      if (input) updateDiceDisplay(input, attr);
    });
  }

  function updateDiceDisplay(input, attrName) {
    const config = calcDiceConfig(input.value);
    const count = config.count;
    const diceEl = document.getElementById('dice-' + attrName);
    if (!diceEl) return;
    const iconsEl = diceEl.querySelector('.dice-icons');
    if (!iconsEl) return;

    if (count === 0) {
      iconsEl.innerHTML = '<span class="dice-none">â€”</span>';
    } else {
      let html = '';
      for (let i = 0; i < count; i++) {
        html += '<span class="dice-d20">â¬¡</span>';
      }
      html += '<span class="dice-count">' + count + 'd20</span>';
      iconsEl.innerHTML = html;
    }
  }

  window.updateDice = function (input) {
    // Clamp -4 to 10
    let v = parseInt(input.value);
    if (isNaN(v)) return;
    if (v > 10) { input.value = 10; }
    if (v < -4) { input.value = -4; }

    const id = input.id; // "attr-forca"
    const attrName = id.replace('attr-', '');
    updateDiceDisplay(input, attrName);
  };

  /* ==========================================================
     RETRATO DO PERSONAGEM
  ========================================================== */
  window.handlePortrait = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // Redimensionar para max 400Ã—400 para economizar espaço
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const maxSize = 400;
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round(h * maxSize / w);
            w = maxSize;
          } else {
            w = Math.round(w * maxSize / h);
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setPortrait(dataUrl);
        saveData();
        showToast('âœ¦ Imagem adicionada!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  function setPortrait(dataUrl) {
    const img = document.getElementById('portrait-img');
    const placeholder = document.getElementById('portrait-placeholder');
    const removeBtn = document.getElementById('btn-remove-portrait');

    if (img) {
      img.src = dataUrl;
      img.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'block';
  }

  window.removePortrait = function () {
    const img = document.getElementById('portrait-img');
    const placeholder = document.getElementById('portrait-placeholder');
    const removeBtn = document.getElementById('btn-remove-portrait');

    if (img) {
      img.src = '';
      img.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (removeBtn) removeBtn.style.display = 'none';

    saveData();
  };

  /* ==========================================================
     SAVE INDICATOR
  ========================================================== */
  function updateSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    if (!indicator) return;
    indicator.classList.add('visible');
    setTimeout(() => {
      indicator.classList.remove('visible');
    }, 3000);
  }

  /* ==========================================================
     ATAQUES DINÃ‚MICOS
  ========================================================== */
  window.addAttackRow = function (data) {
    const tbody = document.getElementById('attacks-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    const d = data || {};
    tr.innerHTML = `
      <td><input type="text" value="${esc(d.nome)}" placeholder="Nome da arma"></td>
      <td><input type="text" value="${esc(d.bonus)}" placeholder="+0"></td>
      <td><input type="text" value="${esc(d.dano)}" placeholder="1d8+3"></td>
      <td><input type="text" value="${esc(d.critico)}" placeholder="20/x2"></td>
      <td><input type="text" value="${esc(d.tipo)}" placeholder="Cortante"></td>
      <td><input type="text" value="${esc(d.alcance)}" placeholder="1,5m"></td>
      <td class="col-actions">
        <button class="btn small danger" onclick="removeAttackRow(this)" title="Remover ataque">âœ•</button>
      </td>
    `;
    tbody.appendChild(tr);
    saveData();
  };

  window.removeAttackRow = function (btn) {
    const tr = btn.closest('tr');
    if (tr) {
      tr.style.opacity = '0';
      tr.style.transform = 'translateX(-20px)';
      tr.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        tr.remove();
        saveData();
      }, 300);
    }
  };

  /* ==========================================================
     MAGIAS DINÃ‚MICAS
  ========================================================== */
  window.addSpellCard = function (data) {
    const container = document.getElementById('spells-container');
    if (!container) return;

    const d = data || {};
    const card = document.createElement('div');
    card.className = 'spell-card';
    card.innerHTML = `
      <button class="spell-remove" onclick="removeSpellCard(this)" title="Remover magia">âœ•</button>
      <div class="spell-top">
        <div>
          <label class="field-label">Nome da Magia / Ritual</label>
          <input type="text" value="${esc(d.nome)}" placeholder="Nome da magia...">
        </div>
        <div>
          <label class="field-label">Tipo da Magia</label>
          <input type="text" value="${esc(d.tipo)}" placeholder="Arcana, Divina...">
        </div>
      </div>
      <div class="spell-meta">
        <div>
          <label class="field-label">Execução</label>
          <input type="text" value="${esc(d.execucao)}" placeholder="Padrão">
        </div>
        <div>
          <label class="field-label">Alcance</label>
          <input type="text" value="${esc(d.alcance)}" placeholder="9m">
        </div>
        <div>
          <label class="field-label">Alvo</label>
          <input type="text" value="${esc(d.alvo)}" placeholder="1 criatura">
        </div>
        <div>
          <label class="field-label">Duração</label>
          <input type="text" value="${esc(d.duracao)}" placeholder="Instantânea">
        </div>
        <div>
          <label class="field-label">PA</label>
          <input type="text" value="${esc(d.pa)}" placeholder="2">
        </div>
      </div>
      <div class="spell-resistance">
        <label class="field-label">Resistência</label>
        <input type="text" value="${esc(d.resistencia)}" placeholder="Vontade anula">
      </div>
      <div class="spell-effect">
        <label class="field-label">Dano / Efeito</label>
        <textarea placeholder="Descreva o efeito da magia...">${esc(d.efeito)}</textarea>
      </div>
    `;
    container.appendChild(card);
    saveData();
  };

  window.removeSpellCard = function (btn) {
    const card = btn.closest('.spell-card');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(-10px)';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        card.remove();
        saveData();
      }, 300);
    }
  };

  window.addHabilidadeCard = function (data) {
    const container = document.getElementById('habilidades-container');
    if (!container) return;

    const d = data || {};
    const card = document.createElement('div');
    card.className = 'spell-card';
    card.innerHTML = `
      <button class="spell-remove" onclick="removeHabilidadeCard(this)" title="Remover habilidade">âœ•</button>
      <div class="spell-top">
        <div style="flex: 2;">
          <label class="field-label">Nome da Habilidade</label>
          <input type="text" value="${esc(d.nome)}" placeholder="Nome...">
        </div>
        <div>
          <label class="field-label">Fonte</label>
          <input type="text" value="${esc(d.tipo)}" placeholder="Classe, Origem...">
        </div>
        <div style="flex: 0.5;">
          <label class="field-label">Custo (PA)</label>
          <input type="text" value="${esc(d.custo)}" placeholder="Ex: 1">
        </div>
      </div>
      <div class="spell-desc">
        <label class="field-label">Descrição</label>
        <textarea placeholder="Como funciona essa habilidade?">${esc(d.desc)}</textarea>
      </div>
    `;
    container.appendChild(card);
    saveData();
  };

  window.removeHabilidadeCard = function (btn) {
    const card = btn.closest('.spell-card');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(-10px)';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        card.remove();
        saveData();
      }, 300);
    }
  };

  /* ==========================================================
     INVENTÃRIO â€” Espaços de Itens (Slots)
  ========================================================== */
  window.addItem = function (data) {
    const list = document.getElementById('items-list');
    if (!list) return;

    const d = data || {};
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="item-name" value="${esc(d.nome)}" placeholder="Nome do item...">
      <div class="item-field">
        <label class="item-field-label">Esp.</label>
        <input type="number" class="item-slots" value="${d.slots !== undefined ? d.slots : 1}" min="0" max="20">
      </div>
      <div class="item-field">
        <label class="item-field-label">Qtd</label>
        <input type="number" class="item-qty" value="${d.quantidade !== undefined ? d.quantidade : 1}" min="1" max="99">
      </div>
      <span class="item-slot-total"></span>
      <button class="btn small danger item-remove-btn" onclick="removeItem(this)" title="Remover item">âœ•</button>
    `;
    list.appendChild(row);

    // Listeners para atualizar slots em tempo real
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => updateSlots());
    });

    updateSlots();
  };

  window.removeItem = function (btn) {
    const row = btn.closest('.item-row');
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      row.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        row.remove();
        updateSlots();
        saveData();
      }, 300);
    }
  };

  function updateSlots() {
    const select = document.getElementById('container-type');
    const baseSlots = 4;
    const containerBonus = select ? parseInt(select.value) || 0 : 0;
    const totalSlots = baseSlots + containerBonus;

    let usedSlots = 0;
    document.querySelectorAll('.item-row').forEach(row => {
      const slotsInput = row.querySelector('.item-slots');
      const qtyInput = row.querySelector('.item-qty');
      const totalEl = row.querySelector('.item-slot-total');
      const s = parseInt(slotsInput?.value) || 0;
      const q = parseInt(qtyInput?.value) || 1;
      const itemTotal = s * q;
      usedSlots += itemTotal;
      if (totalEl) {
        totalEl.textContent = itemTotal > 0 ? '= ' + itemTotal : '';
      }
    });

    const usedEl = document.getElementById('slots-used');
    const totalEl = document.getElementById('slots-total');
    const barEl = document.getElementById('slots-bar');

    if (usedEl) usedEl.textContent = usedSlots;
    if (totalEl) totalEl.textContent = totalSlots;

    if (barEl) {
      const pct = totalSlots > 0 ? Math.min(100, (usedSlots / totalSlots) * 100) : 0;
      barEl.style.width = pct + '%';
      barEl.classList.remove('over', 'warning');
      if (usedSlots > totalSlots) {
        barEl.classList.add('over');
      } else if (pct > 75) {
        barEl.classList.add('warning');
      }
    }
  }

  window.updateContainerSlots = function () {
    updateSlots();
    saveData();
  };

  /* ==========================================================
     EXPORTAR JSON
  ========================================================== */
  window.exportJSON = function () {
    const data = collectData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const characterName = data.nome || 'personagem';
    const safeName = characterName.replace(/[^a-zA-Z0-9_\-\u00C0-\u017F ]/g, '').replace(/\s+/g, '_');

    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha_${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('âœ¦ Ficha exportada com sucesso!');
  };

  /* ==========================================================
     IMPORTAR JSON
  ========================================================== */
  window.triggerImport = function () {
    document.getElementById('import-input').click();
  };

  window.handleImport = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        applyData(data);
        saveData();
        updateAllBars();
        updateAllDice();
        updateSlots();
        showToast('âœ¦ Ficha importada com sucesso!');
      } catch (err) {
        showToast('âš  Erro ao ler o arquivo JSON');
        console.error('Erro na importação:', err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  /* ==========================================================
     LIMPAR FICHA
  ========================================================== */
  window.confirmClear = function () {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.classList.add('active');
  };

  window.cancelClear = function () {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.classList.remove('active');
  };

  window.executeClear = function () {
    localStorage.removeItem(STORAGE_KEY);

    // Limpar todos os inputs e textareas
    document.querySelectorAll('.container input[type="text"], .container input[type="number"]').forEach(el => {
      el.value = '';
    });
    document.querySelectorAll('.container textarea').forEach(el => {
      el.value = '';
    });
    document.querySelectorAll('.container input[type="checkbox"]').forEach(el => {
      el.checked = false;
    });
    document.querySelectorAll('.container select').forEach(el => {
      el.selectedIndex = 0;
    });

    // Resetar retrato
    removePortrait();

    // Resetar ataques
    const attacksBody = document.getElementById('attacks-body');
    if (attacksBody) {
      attacksBody.innerHTML = '';
      for (let i = 0; i < 5; i++) addAttackRow();
    }

    // Resetar inventário
    const itemsList = document.getElementById('items-list');
    if (itemsList) itemsList.innerHTML = '';

    // Resetar magias
    const spellsContainer = document.getElementById('spells-container');
    if (spellsContainer && spellsContainer.children.length === 0) {
      for (let i = 0; i < 2; i++) addSpellCard();
    }
    const habsContainer = document.getElementById('habilidades-container');
    if (habsContainer && habsContainer.children.length === 0) {
      addHabilidadeCard();
    }

    updateAllBars();
    updateAllDice();
    updateSlots();
    cancelClear();
    showToast('âœ¦ Ficha limpa com sucesso!');
  };

  /* ==========================================================
     TOAST
  ========================================================== */
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DANDORA_SYNC_UPDATE') {
      loadData();
    }
  });

  /* ==========================================================
     SISTEMA DE ROLAGEM (BG3 STYLE)
  ========================================================== */
  
  // Variáveis globais de rolagem
  window.rollHistory = [];
  let pendingSkillData = null; // Guarda os dados da perícia enquanto o modal está aberto

  // Mapeamento de siglas para IDs
  const attrMap = {
    'For': { id: 'forca', name: 'Força' },
    'Des': { id: 'destreza', name: 'Destreza' },
    'Con': { id: 'constituicao', name: 'Constituição' },
    'Int': { id: 'inteligencia', name: 'Inteligência' },
    'Von': { id: 'vontade', name: 'Vontade' },
    'Car': { id: 'carisma', name: 'Carisma' }
  };

  window.rollAttribute = function(attrId, attrName) {
    const valStr = val('attr-' + attrId);
    const attrValue = parseInt(valStr) || 0;
    executeRoll(attrName, attrValue, 0, `Rolagem de Atributo`);
  };

  window.rollSkill = function(btn, skillName) {
    const row = btn.closest('.skill-row');
    const attrSpan = row.querySelector('.skill-attr');
    const bonusInput = row.querySelector('.skill-bonus');
    const bonus = parseInt(bonusInput ? bonusInput.value : 0) || 0;
    
    let attrText = attrSpan ? attrSpan.textContent.replace('[', '').replace(']', '') : '';
    
    if (attrText === 'For/Des' || attrText === '') {
      // Perícia dúbia ou sem atributo -> abrir modal
      pendingSkillData = { name: skillName, bonus: bonus };
      openAttrSelector(skillName, attrText === 'For/Des' ? ['For', 'Des'] : Object.keys(attrMap));
    } else {
      // Perícia com atributo claro
      const mapped = attrMap[attrText];
      if (mapped) {
        const attrValue = parseInt(val('attr-' + mapped.id)) || 0;
        executeRoll(`${skillName} [${mapped.name}]`, attrValue, bonus, `Rolagem de Perícia`);
      } else {
        // Fallback
        executeRoll(skillName, 0, bonus, `Rolagem de Perícia`);
      }
    }
  };

  // --- Modal de Seleção de Atributo ---
  function openAttrSelector(skillName, optionsKeys) {
    const overlay = document.getElementById('attr-selector-overlay');
    const title = document.getElementById('attr-selector-title');
    const container = document.getElementById('attr-selector-buttons');
    
    title.textContent = skillName;
    container.innerHTML = '';
    
    optionsKeys.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = attrMap[key].name;
      btn.onclick = () => confirmAttrSelector(key);
      container.appendChild(btn);
    });
    
    overlay.classList.add('active');
  }

  window.closeAttrSelector = function() {
    document.getElementById('attr-selector-overlay').classList.remove('active');
    pendingSkillData = null;
  };

  function confirmAttrSelector(attrKey) {
    if (!pendingSkillData) return;
    
    const mapped = attrMap[attrKey];
    const attrValue = parseInt(val('attr-' + mapped.id)) || 0;
    const { name, bonus } = pendingSkillData;
    
    closeAttrSelector();
    executeRoll(`${name} [${mapped.name}]`, attrValue, bonus, `Rolagem de Perícia`);
  }

  // --- Execução da Rolagem e Animação ---
  function executeRoll(title, attrValue, bonus, subtitle) {
    const config = calcDiceConfig(attrValue);
    
    // Preparar UI do Overlay
    const overlay = document.getElementById('roller-overlay');
    document.getElementById('roller-title').textContent = title;
    
    let strategyText = '';
    if (config.strategy === 'lowest') strategyText = 'Desvantagem (-4 a 0)';
    else if (config.strategy === 'highest') strategyText = 'Vantagem (' + config.count + 'd20)';
    else strategyText = 'Rolagem Normal (1d20)';
    
    document.getElementById('roller-subtitle').textContent = strategyText;
    
    const arena = document.getElementById('dice-arena');
    arena.innerHTML = '';
    
    const resultPanel = document.getElementById('roller-result-panel');
    resultPanel.classList.remove('show');
    
    // Gerar rolagens
    const rolls = [];
    for(let i=0; i<config.count; i++) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    
    // Encontrar vencedor
    let winningIndex = 0;
    if (config.strategy === 'highest') {
      let max = -1;
      rolls.forEach((r, idx) => { if(r > max) { max = r; winningIndex = idx; } });
    } else if (config.strategy === 'lowest') {
      let min = 99;
      rolls.forEach((r, idx) => { if(r < min) { min = r; winningIndex = idx; } });
    }
    
    const d20Result = rolls[winningIndex];
    const finalResult = d20Result + bonus;
    
    // Criar elementos de dado na arena
    const diceElements = [];
    rolls.forEach((r, idx) => {
      const die = document.createElement('div');
      die.className = 'die-3d rolling';
      die.textContent = r; // Número final que vai aparecer quando parar
      arena.appendChild(die);
      diceElements.push(die);
    });
    
    // Mostrar overlay
    overlay.classList.add('active');
    
    // Parar animação após 1.5s
    setTimeout(() => {
      diceElements.forEach((die, idx) => {
        die.classList.remove('rolling');
        die.classList.add('finished');
        
        if (idx === winningIndex) {
          die.classList.add('winner');
          if (rolls[idx] === 20) die.classList.add('crit-success');
          if (rolls[idx] === 1) die.classList.add('crit-fail');
        } else {
          die.classList.add('loser');
        }
      });
      
      // Mostrar resultado final
      document.getElementById('roller-final-value').textContent = finalResult;
      
      let calcStr = `Dado: ${d20Result}`;
      if (bonus !== 0) calcStr += ` ${bonus > 0 ? '+' : ''}${bonus} (Bônus)`;
      document.getElementById('roller-calculation').textContent = calcStr;
      
      resultPanel.classList.add('show');
      
      // Salvar histórico
      addRollToHistory({
        date: new Date().toISOString(),
        title: title,
        rolls: rolls,
        winningIndex: winningIndex,
        bonus: bonus,
        finalResult: finalResult
      });
      
    }, 1500);
  }

  window.closeRoller = function() {
    document.getElementById('roller-overlay').classList.remove('active');
  };

  // --- Histórico de Rolagem ---
  function addRollToHistory(rollData) {
    window.rollHistory.unshift(rollData);
    if (window.rollHistory.length > 50) {
      window.rollHistory.pop(); // Limita a 50 itens
    }
    renderHistory();
    saveData();

    // Broadcast para a tela do mestre/painel de rolagens
    const broadcastData = { ...rollData };
    broadcastData.characterName = val('nome') || 'Desconhecido';
    window.parent.postMessage({
      type: 'DANDORA_ROLL',
      data: broadcastData
    }, '*');
  }

  function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    
    list.innerHTML = '';
    if (window.rollHistory.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">Nenhuma rolagem ainda.</div>';
      return;
    }
    
    window.rollHistory.forEach(r => {
      const date = new Date(r.date);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      let diceStr = r.rolls.map((v, i) => i === r.winningIndex ? `<b>[${v}]</b>` : v).join(', ');
      
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-item-header">
          <span>${date.toLocaleDateString()} ${timeStr}</span>
        </div>
        <div class="history-item-title">${esc(r.title)}</div>
        <div class="history-item-calc">
          ðŸŽ² ${diceStr} ${r.bonus !== 0 ? `| Bônus: ${r.bonus > 0 ? '+' : ''}${r.bonus}` : ''}
        </div>
        <div class="history-item-result">${r.finalResult}</div>
      `;
      list.appendChild(item);
    });
  }

  window.toggleHistory = function() {
    const sidebar = document.getElementById('history-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  };

  window.clearHistory = function() {
    if(confirm('Tem certeza que deseja apagar o histórico de rolagens?')) {
      window.rollHistory = [];
      renderHistory();
      saveData();
    }
  };

  /* ==========================================================
     UTILS
  ========================================================== */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
  /* ==========================================================
     MESA DE ROLAGEM CUSTOMIZADA
  ========================================================== */
  window.customDice = { 4:0, 6:0, 8:0, 10:0, 12:0, 20:0, 100:0 };
  window.customFavorites = [];

  window.adjDie = function(die, delta) {
    window.customDice[die] = Math.max(0, window.customDice[die] + delta);
    const el = document.getElementById('cnt-d' + die);
    if(el) el.textContent = window.customDice[die];
    updateRollerPreview();
  };

  window.adjBonus = function(delta) {
    const el = document.getElementById('roller-bonus');
    if(el) {
      el.value = parseInt(el.value || 0) + delta;
      updateRollerPreview();
    }
  };

  window.updateRollerPreview = function() {
    const el = document.getElementById('roller-preview');
    if(!el) return;
    
    let parts = [];
    for(let d in window.customDice) {
      if(window.customDice[d] > 0) parts.push(`${window.customDice[d]}d${d}`);
    }
    
    let bonusStr = '';
    const elBonus = document.getElementById('roller-bonus');
    const bonus = elBonus ? parseInt(elBonus.value) || 0 : 0;
    if(bonus !== 0) {
      bonusStr = bonus > 0 ? ` + ${bonus}` : ` - ${Math.abs(bonus)}`;
    }
    
    if(parts.length === 0) {
      el.textContent = `0d20${bonusStr}`;
    } else {
      el.textContent = parts.join(' + ') + bonusStr;
    }
  };

  window.clearCustomRoller = function() {
    for(let d in window.customDice) {
      window.customDice[d] = 0;
      const el = document.getElementById('cnt-d' + d);
      if(el) el.textContent = '0';
    }
    const b = document.getElementById('roller-bonus');
    if(b) b.value = '0';
    updateRollerPreview();
  };

  window.executeCustomRoll = function() {
    let hasDice = false;
    let config = [];
    for(let d in window.customDice) {
      if(window.customDice[d] > 0) {
        hasDice = true;
        for(let i=0; i<window.customDice[d]; i++) {
          config.push(parseInt(d));
        }
      }
    }
    const elBonus = document.getElementById('roller-bonus');
    const bonus = elBonus ? parseInt(elBonus.value) || 0 : 0;
    
    if(!hasDice) {
      showToast('Selecione ao menos um dado!');
      return;
    }
    
    let title = document.getElementById('roller-preview').textContent;
    executeComplexRoll(config, bonus, "Rolagem Customizada", title);
  };

  window.saveFavoriteRoll = function() {
    let hasDice = false;
    for(let d in window.customDice) {
      if(window.customDice[d] > 0) hasDice = true;
    }
    if(!hasDice) {
      showToast('Selecione dados para favoritar!');
      return;
    }
    
    const formula = document.getElementById('roller-preview').textContent;
    let name = prompt("Nome para esta rolagem favorita:", formula);
    if(!name) return;
    
    const elBonus = document.getElementById('roller-bonus');
    const bonus = elBonus ? parseInt(elBonus.value) || 0 : 0;

    window.customFavorites.push({
      name: name,
      dice: JSON.parse(JSON.stringify(window.customDice)),
      bonus: bonus,
      formula: formula
    });
    saveData();
    renderFavorites();
  };

  window.deleteFavorite = function(index) {
    window.customFavorites.splice(index, 1);
    saveData();
    renderFavorites();
  };

  window.rollFavorite = function(index) {
    const fav = window.customFavorites[index];
    if(!fav) return;
    
    let config = [];
    for(let d in fav.dice) {
      if(fav.dice[d] > 0) {
        for(let i=0; i<fav.dice[d]; i++) {
          config.push(parseInt(d));
        }
      }
    }
    executeComplexRoll(config, fav.bonus, fav.name, fav.formula);
  };

  window.renderFavorites = function() {
    const list = document.getElementById('favorites-list');
    if(!list) return;
    list.innerHTML = '';
    window.customFavorites.forEach((fav, i) => {
      const item = document.createElement('div');
      item.className = 'favorite-item';
      item.innerHTML = `
        <span class="fav-name" onclick="rollFavorite(${i})">${esc(fav.name)}</span>
        <span class="fav-formula" onclick="rollFavorite(${i})">${esc(fav.formula)}</span>
        <button class="fav-del-btn" onclick="deleteFavorite(${i})">âœ•</button>
      `;
      list.appendChild(item);
    });
  };

  window.executeComplexRoll = function(diceArray, bonus, title, formulaStr) {
    const overlay = document.getElementById('roller-overlay');
    const elTitle = document.getElementById('roller-title');
    const elSubtitle = document.getElementById('roller-subtitle');
    if(elTitle) elTitle.textContent = title;
    if(elSubtitle) elSubtitle.textContent = formulaStr;
    
    const arena = document.getElementById('dice-arena');
    if(arena) arena.innerHTML = '';
    
    const resultPanel = document.getElementById('roller-result-panel');
    if(resultPanel) resultPanel.classList.remove('show');
    
    let sum = 0;
    let grouped = {};
    const diceElements = [];
    
    diceArray.forEach(sides => {
      const result = Math.floor(Math.random() * sides) + 1;
      sum += result;
      
      if(!grouped[sides]) grouped[sides] = [];
      grouped[sides].push(result);
      
      const die = document.createElement('div');
      die.className = 'die-3d die-3d-d' + sides + ' rolling';
      die.innerHTML = '<span class="die-label-3d">d' + sides + '</span>' + result;
      if(arena) arena.appendChild(die);
      diceElements.push(die);
    });
    
    const finalResult = sum + bonus;
    
    if(overlay) overlay.classList.add('active');
    
    setTimeout(() => {
      diceElements.forEach(die => {
        die.classList.remove('rolling');
        die.classList.add('finished');
      });
      
      const elFinal = document.getElementById('roller-final-value');
      if(elFinal) elFinal.textContent = finalResult;
      
      let calcStr = "";
      for(let d in grouped) {
        let sumD = grouped[d].reduce((a,b)=>a+b, 0);
        calcStr += `${grouped[d].length}d${d}=`;
        if (grouped[d].length > 1) {
          calcStr += `[${grouped[d].join(',')}] (${sumD}) | `;
        } else {
          calcStr += `${sumD} | `;
        }
      }
      if(bonus !== 0) {
        calcStr += `Bônus: ${bonus > 0 ? '+'+bonus : bonus}`;
      } else {
        calcStr = calcStr.replace(/ \| $/, '');
      }
      
      const elCalc = document.getElementById('roller-calculation');
      if(elCalc) elCalc.textContent = calcStr;
      if(resultPanel) resultPanel.classList.add('show');
      
      const hTitle = title === "Rolagem Customizada" ? formulaStr : title;
      const historyItem = {
        date: new Date().toISOString(),
        title: hTitle,
        complex: true,
        calculation: calcStr,
        finalResult: finalResult
      };
      
      if (typeof addRollToHistory === 'function') {
        addRollToHistory(historyItem);
      } else {
        window.rollHistory.unshift(historyItem);
        if (window.rollHistory.length > 50) window.rollHistory.pop();
        if(typeof renderHistory === 'function') renderHistory();
        if(typeof saveData === 'function') saveData();
        
        // Broadcast
        historyItem.characterName = val('nome') || 'Desconhecido';
        window.parent.postMessage({ type: 'DANDORA_ROLL', data: historyItem }, '*');
      }
      
    }, 1500);
  };

  // --- Sincronização Recebida do Mestre ---
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DANDORA_SYNC_ROLL') {
      const roll = event.data.data;
      if (roll.isMaster) return; // Jogadores não veem rolagens do mestre
      
      // Evitar duplicatas baseadas no timestamp (ou adicionando se não houver)
      const exists = window.rollHistory.some(r => r.timestamp === roll.timestamp || (r.date === roll.date && r.title === roll.title));
      if (!exists) {
        window.rollHistory.unshift(roll);
        if (window.rollHistory.length > 50) window.rollHistory.pop();
        if (typeof renderHistory === 'function') renderHistory();
      }
    }
  });

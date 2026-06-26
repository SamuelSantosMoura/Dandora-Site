    const numBlocos = 6;

    function criarBloco(index) {
      return `
      <div class="table-card" id="card-${index}">
        <label for="nome-${index}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">Nome da Criatura</label>
        <input class="input-modern" type="text" id="nome-${index}" placeholder="ex.: Goblin Ferrugem" style="width:100%; margin-bottom:10px;" />
        <div style="display:flex;gap:10px; margin-bottom:10px;">
          <div style="flex:1;">
            <label for="vida-${index}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">Vida</label>
            <input class="input-modern" type="text" id="vida-${index}" placeholder="ex.: 45 / 45" style="width:100%;" />
          </div>
          <div style="flex:1;">
            <label for="ca-${index}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">CA</label>
            <input class="input-modern" type="text" id="ca-${index}" placeholder="ex.: 15" style="width:100%;" />
          </div>
        </div>
        <label for="anotacoes-${index}" style="color:var(--gold-dim); display:block; margin-bottom:5px;">Anotações</label>
        <textarea class="input-modern" id="anotacoes-${index}" rows="4" placeholder="Habilidades, resistências, status…" style="width:100%; resize:vertical;"></textarea>
      </div>`;
    }

    const container = document.getElementById('blocos');
    for (let i = 0; i < numBlocos; i++) {
      container.innerHTML += criarBloco(i);
    }

    function salvarDados(index) {
      localStorage.setItem(`bloco-${index}-nome`,      document.getElementById(`nome-${index}`).value);
      localStorage.setItem(`bloco-${index}-vida`,      document.getElementById(`vida-${index}`).value);
      localStorage.setItem(`bloco-${index}-ca`,        document.getElementById(`ca-${index}`).value);
      localStorage.setItem(`bloco-${index}-anotacoes`, document.getElementById(`anotacoes-${index}`).value);
    }

    for (let i = 0; i < numBlocos; i++) {
      document.getElementById(`nome-${i}`).value      = localStorage.getItem(`bloco-${i}-nome`)      || '';
      document.getElementById(`vida-${i}`).value      = localStorage.getItem(`bloco-${i}-vida`)      || '';
      document.getElementById(`ca-${i}`).value        = localStorage.getItem(`bloco-${i}-ca`)        || '';
      document.getElementById(`anotacoes-${i}`).value = localStorage.getItem(`bloco-${i}-anotacoes`) || '';

      document.getElementById(`nome-${i}`).addEventListener('input',      () => salvarDados(i));
      document.getElementById(`vida-${i}`).addEventListener('input',      () => salvarDados(i));
      document.getElementById(`ca-${i}`).addEventListener('input',        () => salvarDados(i));
      document.getElementById(`anotacoes-${i}`).addEventListener('input', () => salvarDados(i));
    }
  

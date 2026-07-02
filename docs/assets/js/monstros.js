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
        <textarea class="input-modern" id="anotacoes-${index}" rows="4" placeholder="Habilidades, resistências, status…" style="width:100%; resize:vertical; margin-bottom:15px;"></textarea>
        
        <button class="btn-outline" style="width:100%;" onclick="exportarMonstroPDF(${index})">
          <i class="fa-solid fa-file-pdf"></i> Salvar PDF da Ficha
        </button>
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

    function exportarMonstroPDF(index) {
      const nome = document.getElementById(`nome-${index}`).value.trim() || 'Monstro Desconhecido';
      const vida = document.getElementById(`vida-${index}`).value.trim() || '--';
      const ca = document.getElementById(`ca-${index}`).value.trim() || '--';
      const anotacoes = document.getElementById(`anotacoes-${index}`).value.trim() || 'Nenhuma anotação.';

      // Criar um container temporário e invisível para gerar o PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.padding = '30px';
      pdfContainer.style.background = '#111'; // Fundo dark
      pdfContainer.style.color = '#e0e0e0';
      pdfContainer.style.fontFamily = "'Inter', sans-serif";
      pdfContainer.style.width = '600px';

      // Estilo do PDF
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

      // Anexar temporariamente ao body
      document.body.appendChild(pdfContainer);

      // Opções para o html2pdf
      const opt = {
        margin:       10,
        filename:     `${nome}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Gerar PDF
      html2pdf().set(opt).from(pdfContainer).save().then(() => {
        // Remover container temporário
        document.body.removeChild(pdfContainer);
      });
    }

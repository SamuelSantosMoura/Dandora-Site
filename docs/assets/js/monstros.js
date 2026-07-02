const numBlocos = 10;
    
    function renderPdfPage(pageNum, index) {
        const iframe = document.getElementById(`pdf-frame-${index}`);
        if (!iframe) return;
        
        if (!pageNum || pageNum < 1) {
            iframe.src = "";
            return;
        }
        
        // Salva a preferência de página localmente
        localStorage.setItem(`bloco-${index}-pdf-page`, pageNum);

        // Usa o visualizador de PDF nativo do navegador através de um iframe
        // Isso burla o bloqueio de CORS do protocolo file://
        // O parâmetro #page= permite ir direto para a página, e view=FitH ajusta a largura
        iframe.src = `assets/Bestiario de Dandora (1).pdf#page=${pageNum}&view=FitH`;
    }

    function switchMonstroTab(index, mode) {
        const manualDiv = document.getElementById(`manual-${index}`);
        const pdfDiv = document.getElementById(`pdf-${index}`);
        const btnManual = document.getElementById(`btn-manual-${index}`);
        const btnPdf = document.getElementById(`btn-pdf-${index}`);
        
        if (mode === 'manual') {
            manualDiv.style.display = 'block';
            pdfDiv.style.display = 'none';
            btnManual.classList.add('btn-epic');
            btnManual.classList.remove('btn-outline');
            btnPdf.classList.add('btn-outline');
            btnPdf.classList.remove('btn-epic');
            localStorage.setItem(`bloco-${index}-mode`, 'manual');
        } else {
            manualDiv.style.display = 'none';
            pdfDiv.style.display = 'block';
            btnPdf.classList.add('btn-epic');
            btnPdf.classList.remove('btn-outline');
            btnManual.classList.add('btn-outline');
            btnManual.classList.remove('btn-epic');
            localStorage.setItem(`bloco-${index}-mode`, 'pdf');
            
            const pg = document.getElementById(`pdf-page-${index}`).value;
            if(pg) {
                renderPdfPage(pg, index);
            }
        }
    }

    function criarBloco(index) {
      return `
      <div class="table-card" id="card-${index}" style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; gap:10px;">
            <button id="btn-manual-${index}" class="btn-epic" style="flex:1; padding:8px; font-size:0.8rem;" onclick="switchMonstroTab(${index}, 'manual')">Manual</button>
            <button id="btn-pdf-${index}" class="btn-outline" style="flex:1; padding:8px; font-size:0.8rem;" onclick="switchMonstroTab(${index}, 'pdf')">PDF Oficial</button>
        </div>
        
        <!-- MODO MANUAL -->
        <div id="manual-${index}">
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
              <i class="fa-solid fa-file-pdf"></i> Salvar PDF Próprio
            </button>
        </div>

        <!-- MODO PDF -->
        <div id="pdf-${index}" style="display:none; text-align:center;">
            <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:15px;">
                <div style="flex:1; text-align:left;">
                    <label style="color:var(--gold-dim); display:block; margin-bottom:5px;">Página no PDF:</label>
                    <input class="input-modern" type="number" id="pdf-page-${index}" placeholder="Pág. (ex: 35)" style="width:100%;" min="1" />
                </div>
                <button class="btn-outline" style="padding:10px;" onclick="renderPdfPage(document.getElementById('pdf-page-${index}').value, ${index})"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
            </div>
            <div style="width:100%; height:400px; background:rgba(0,0,0,0.3); border:1px dashed var(--gold-dim); display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
                <iframe id="pdf-frame-${index}" src="" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        </div>
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

    // Inicialização ao carregar a página
    for (let i = 0; i < numBlocos; i++) {
      // Carregar modo (manual ou pdf)
      const mode = localStorage.getItem(`bloco-${i}-mode`) || 'manual';
      switchMonstroTab(i, mode);

      // Carregar dados textuais do modo manual
      document.getElementById(`nome-${i}`).value      = localStorage.getItem(`bloco-${i}-nome`)      || '';
      document.getElementById(`vida-${i}`).value      = localStorage.getItem(`bloco-${i}-vida`)      || '';
      document.getElementById(`ca-${i}`).value        = localStorage.getItem(`bloco-${i}-ca`)        || '';
      document.getElementById(`anotacoes-${i}`).value = localStorage.getItem(`bloco-${i}-anotacoes`) || '';
      
      // Carregar página em PDF salva (se houver)
      const savedPage = localStorage.getItem(`bloco-${i}-pdf-page`);
      if (savedPage) {
          document.getElementById(`pdf-page-${i}`).value = savedPage;
      }

      // Adicionar listeners para modo manual
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

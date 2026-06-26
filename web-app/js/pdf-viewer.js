// pdf-viewer.js — Visualizador de PDF usando iframe nativo do browser

let pdfDoc       = null;
let pageNum      = 1;
let pageRendering = false;
let pageNumPending = null;
let scale        = 1.5;
let currentPdfUrl = null;

// Elementos resolvidos depois que o DOM estiver pronto
let canvas, ctx, pdfFrame;

/* ─── Inicialização segura ──────────────────────────────────────── */
function initPdfViewer() {
    canvas   = document.getElementById('pdf-canvas');
    pdfFrame = document.getElementById('pdf-iframe');
    if (canvas) ctx = canvas.getContext('2d');

    const prevBtn       = document.getElementById('prev-page');
    const nextBtn       = document.getElementById('next-page');
    const zoomInBtn     = document.getElementById('zoom-in');
    const zoomOutBtn    = document.getElementById('zoom-out');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    if (prevBtn)       prevBtn.addEventListener('click', onPrevPage);
    if (nextBtn)       nextBtn.addEventListener('click', onNextPage);
    if (zoomInBtn)     zoomInBtn.addEventListener('click', onZoomIn);
    if (zoomOutBtn)    zoomOutBtn.addEventListener('click', onZoomOut);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullScreen);
}

/* ─── Renderização de página (pdf.js canvas) ────────────────────── */
function renderPage(num) {
    if (!pdfDoc || !canvas || !ctx) return;

    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
        const viewport    = page.getViewport({ scale: scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width  = Math.floor(viewport.width  * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width  = Math.floor(viewport.width)  + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

        const renderTask = page.render({
            canvasContext: ctx,
            transform: transform,
            viewport: viewport
        });

        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    const pageNumEl = document.getElementById('page-num');
    if (pageNumEl) pageNumEl.textContent = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/* ─── Controles de navegação ────────────────────────────────────── */
function onPrevPage() {
    if (!pdfDoc || pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

function onZoomIn() {
    scale += 0.25;
    if (pdfDoc) {
        queueRenderPage(pageNum);
    } else if (pdfFrame) {
        // sem efeito em iframe nativo — só esconde/mostra a info
    }
}

function onZoomOut() {
    if (scale <= 0.5) return;
    scale -= 0.25;
    if (pdfDoc) queueRenderPage(pageNum);
}

/* ─── Tela Cheia ────────────────────────────────────────────────── */
function toggleFullScreen() {
    const readerView = document.getElementById('pdf-reader-view');
    if (!document.fullscreenElement) {
        readerView.requestFullscreen().catch(err => {
            console.error('Erro ao entrar em tela cheia:', err.message);
        });
    } else {
        document.exitFullscreen();
    }
}

/* ─── Abrir PDF ─────────────────────────────────────────────────── */
function openPdf(url) {
    currentPdfUrl = url;
    navigateTo('pdf-reader-view');

    // Reinicia estado
    pageNum  = 1;
    scale    = 1.5;
    pdfDoc   = null;

    // Elementos da UI de controle
    const prevBtn     = document.getElementById('prev-page');
    const nextBtn     = document.getElementById('next-page');
    const zoomInBtn   = document.getElementById('zoom-in');
    const zoomOutBtn  = document.getElementById('zoom-out');
    const pageNumEl   = document.getElementById('page-num');
    const pageCountEl = document.getElementById('page-count');
    const pdfControls = document.getElementById('pdf-canvas-controls');

    // --- Tentativa 1: iframe nativo (funciona com file:// e http://) ---
    if (pdfFrame) {
        // Exibe o iframe, esconde o canvas
        pdfFrame.style.display = 'block';
        if (canvas) canvas.style.display = 'none';

        pdfFrame.src = url;

        // Controles de paginação não fazem sentido no iframe nativo
        if (pageNumEl)   pageNumEl.textContent   = '—';
        if (pageCountEl) pageCountEl.textContent = '—';

        // Desabilita botões que não se aplicam ao iframe
        [prevBtn, nextBtn].forEach(btn => {
            if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }
        });
        // Zoom ainda mostra/esconde mensagem; mantém botões ativos para UX
        [zoomInBtn, zoomOutBtn].forEach(btn => {
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        });
        return;
    }

    // --- Tentativa 2: pdf.js via canvas (funciona em http://) ---
    if (!canvas || !ctx) {
        canvas   = document.getElementById('pdf-canvas');
        if (canvas) ctx = canvas.getContext('2d');
    }

    if (canvas) canvas.style.display = 'block';

    if (typeof pdfjsLib === 'undefined') {
        alert('pdf.js não foi carregado corretamente. Tente acessar via servidor HTTP.');
        return;
    }

    pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;

        [prevBtn, nextBtn].forEach(btn => {
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        });

        renderPage(pageNum);
    }).catch(function (error) {
        console.error('Erro ao carregar o PDF:', error);
        alert('Não foi possível carregar o PDF. Se você estiver usando file://, abra o site via servidor local.');
    });
}

/* ─── Fechar PDF ────────────────────────────────────────────────── */
function closePdf() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    // Limpa o iframe para parar o PDF
    if (pdfFrame) pdfFrame.src = '';
    navigateTo('library-view');
}

/* ─── Inicializa quando o DOM estiver pronto ────────────────────── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPdfViewer);
} else {
    initPdfViewer();
}

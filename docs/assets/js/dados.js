/* ============================================================
   DADOS.JS — Mesa de Rolagem do Mestre
   Sistema de dados completo e independente da ficha do jogador
   ============================================================ */

'use strict';

// ── Estado ────────────────────────────────────────────────────
const MD = {
    dice:      { 4:0, 6:0, 8:0, 10:0, 12:0, 20:0, 100:0 },
    bonus:     0,
    favorites: [],
    history:   [],
};

// ── Utilitários ───────────────────────────────────────────────
function mdRand(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function mdSaveFavorites() {
    localStorage.setItem('dandora_master_dice_favs', JSON.stringify(MD.favorites));
}

function mdSaveHistory() {
    localStorage.setItem('dandora_master_dice_history', JSON.stringify(MD.history));
}

function mdLoadData() {
    try {
        const favs = localStorage.getItem('dandora_master_dice_favs');
        if (favs) MD.favorites = JSON.parse(favs);
        const hist = localStorage.getItem('dandora_master_dice_history');
        if (hist) MD.history = JSON.parse(hist);
    } catch(e) { console.warn('Dados.js: erro ao carregar dados', e); }
}

function mdToast(msg, duration = 2200) {
    const el = document.getElementById('md-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
}

// ── Preview da fórmula ─────────────────────────────────────────
function mdUpdatePreview() {
    const el = document.getElementById('md-preview');
    if (!el) return;
    const parts = [];
    for (const d in MD.dice) {
        if (MD.dice[d] > 0) parts.push(`${MD.dice[d]}d${d}`);
    }
    const bonusStr = MD.bonus !== 0
        ? (MD.bonus > 0 ? ` + ${MD.bonus}` : ` - ${Math.abs(MD.bonus)}`)
        : '';
    el.textContent = parts.length === 0 ? `—${bonusStr || ''}` : parts.join(' + ') + bonusStr;
}

// ── Ajustar dados / bônus ──────────────────────────────────────
function mdAdjDie(die, delta) {
    MD.dice[die] = Math.max(0, (MD.dice[die] || 0) + delta);
    const el = document.getElementById('md-cnt-d' + die);
    if (el) el.textContent = MD.dice[die];
    mdUpdatePreview();
}

function mdAdjBonus(delta) {
    MD.bonus += delta;
    const el = document.getElementById('md-bonus');
    if (el) el.value = MD.bonus;
    mdUpdatePreview();
}

function mdBonusInput() {
    const el = document.getElementById('md-bonus');
    if (el) { MD.bonus = parseInt(el.value) || 0; mdUpdatePreview(); }
}

function mdClearRoller() {
    for (const d in MD.dice) {
        MD.dice[d] = 0;
        const el = document.getElementById('md-cnt-d' + d);
        if (el) el.textContent = '0';
    }
    MD.bonus = 0;
    const b = document.getElementById('md-bonus');
    if (b) b.value = '0';
    mdUpdatePreview();
}

// ── Rolar dados rápidos (1 clique) ────────────────────────────
function mdQuickRoll(sides, qty = 1) {
    const config = Array(qty).fill(sides);
    mdExecuteRoll(config, 0, `${qty}d${sides}`, `${qty}d${sides}`);
}

// ── Executar rolagem completa ──────────────────────────────────
function mdExecuteCustomRoll() {
    const config = [];
    for (const d in MD.dice) {
        for (let i = 0; i < MD.dice[d]; i++) config.push(parseInt(d));
    }
    if (config.length === 0) { mdToast('Selecione ao menos um dado!'); return; }
    const formula = document.getElementById('md-preview')?.textContent || '?';
    mdExecuteRoll(config, MD.bonus, 'Rolagem Customizada', formula);
}

function mdExecuteRoll(diceArray, bonus, title, formula) {
    const overlay   = document.getElementById('md-overlay');
    const elTitle   = document.getElementById('md-roll-title');
    const elSub     = document.getElementById('md-roll-subtitle');
    const arena     = document.getElementById('md-arena');
    const resPanel  = document.getElementById('md-result-panel');
    const elFinal   = document.getElementById('md-final-value');
    const elCalc    = document.getElementById('md-calculation');

    if (elTitle) elTitle.textContent = title;
    if (elSub)   elSub.textContent   = formula;
    if (arena)   arena.innerHTML = '';
    if (resPanel) resPanel.classList.remove('show');

    let sum = 0;
    const grouped = {};
    const diceEls = [];

    diceArray.forEach(sides => {
        const result = mdRand(sides);
        sum += result;
        if (!grouped[sides]) grouped[sides] = [];
        grouped[sides].push(result);

        const die = document.createElement('div');
        die.className = `md-die md-die-d${sides} rolling`;
        die.innerHTML = `<span class="md-die-label">d${sides}</span>${result}`;
        if (arena) arena.appendChild(die);
        diceEls.push(die);
    });

    const finalResult = sum + bonus;
    if (overlay) overlay.classList.add('active');

    setTimeout(() => {
        diceEls.forEach(die => {
            die.classList.remove('rolling');
            die.classList.add('finished');
        });

        if (elFinal) elFinal.textContent = finalResult;

        let calcStr = '';
        for (const d in grouped) {
            const sumD = grouped[d].reduce((a, b) => a + b, 0);
            calcStr += `${grouped[d].length}d${d}=`;
            calcStr += grouped[d].length > 1
                ? `[${grouped[d].join(',')}] (${sumD}) | `
                : `${sumD} | `;
        }
        if (bonus !== 0) {
            calcStr += `Bônus: ${bonus > 0 ? '+' + bonus : bonus}`;
        } else {
            calcStr = calcStr.replace(/ \| $/, '');
        }
        if (elCalc) elCalc.textContent = calcStr;
        if (resPanel) resPanel.classList.add('show');

        // Salvar no histórico
        const hItem = {
            date:        new Date().toLocaleString(),
            title:       title === 'Rolagem Customizada' ? formula : title,
            formula,
            calcStr,
            finalResult,
        };
        MD.history.unshift(hItem);
        if (MD.history.length > 60) MD.history.pop();
        mdSaveHistory();
        mdRenderHistory();

    }, 1400);
}

function mdCloseOverlay() {
    const overlay = document.getElementById('md-overlay');
    if (overlay) overlay.classList.remove('active');
}

// ── Favoritos ─────────────────────────────────────────────────
function mdSaveFavorite() {
    let hasDice = false;
    for (const d in MD.dice) if (MD.dice[d] > 0) hasDice = true;
    if (!hasDice) { mdToast('Selecione dados para favoritar!'); return; }

    const formula = document.getElementById('md-preview')?.textContent || '?';
    const name = prompt('Nome para esta rolagem favorita:', formula);
    if (!name) return;

    MD.favorites.push({
        name,
        dice:    JSON.parse(JSON.stringify(MD.dice)),
        bonus:   MD.bonus,
        formula,
    });
    mdSaveFavorites();
    mdRenderFavorites();
    mdToast(`⭐ "${name}" salvo nos favoritos!`);
}

function mdRollFavorite(index) {
    const fav = MD.favorites[index];
    if (!fav) return;
    const config = [];
    for (const d in fav.dice) {
        for (let i = 0; i < fav.dice[d]; i++) config.push(parseInt(d));
    }
    mdExecuteRoll(config, fav.bonus, fav.name, fav.formula);
}

function mdDeleteFavorite(index) {
    MD.favorites.splice(index, 1);
    mdSaveFavorites();
    mdRenderFavorites();
}

function mdRenderFavorites() {
    const list = document.getElementById('md-favorites-list');
    if (!list) return;
    if (MD.favorites.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">Nenhum favorito ainda.</p>`;
        return;
    }
    list.innerHTML = MD.favorites.map((fav, i) => `
        <div class="md-fav-item">
            <div class="md-fav-info" onclick="mdRollFavorite(${i})">
                <span class="md-fav-name">⭐ ${fav.name}</span>
                <span class="md-fav-formula">${fav.formula}</span>
            </div>
            <button class="md-fav-del" onclick="mdDeleteFavorite(${i})" title="Remover">✕</button>
        </div>
    `).join('');
}

// ── Histórico ─────────────────────────────────────────────────
function mdToggleHistory() {
    const sidebar = document.getElementById('md-history-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function mdRenderHistory() {
    const list = document.getElementById('md-history-list');
    if (!list) return;
    if (MD.history.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; padding:1rem;">Sem rolagens ainda.</p>`;
        return;
    }
    list.innerHTML = MD.history.map(h => `
        <div class="md-history-item">
            <div class="md-history-header">
                <span class="md-history-title">${h.title}</span>
                <span class="md-history-result ${h.finalResult >= 20 ? 'crit' : h.finalResult <= 1 ? 'fail' : ''}">${h.finalResult}</span>
            </div>
            <div class="md-history-calc">${h.calcStr}</div>
            <div class="md-history-date">${h.date}</div>
        </div>
    `).join('');
}

function mdClearHistory() {
    if (!confirm('Limpar todo o histórico de rolagens?')) return;
    MD.history = [];
    mdSaveHistory();
    mdRenderHistory();
}

// ── Inicialização ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    mdLoadData();
    mdUpdatePreview();
    mdRenderFavorites();
    mdRenderHistory();
});

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
        <button class="fav-del-btn" onclick="deleteFavorite(${i})">✕</button>
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
        calcStr += \`\${grouped[d].length}d\${d}=\`;
        if (grouped[d].length > 1) {
          calcStr += \`[\${grouped[d].join(',')}] (\${sumD}) | \`;
        } else {
          calcStr += \`\${sumD} | \`;
        }
      }
      if(bonus !== 0) {
        calcStr += \`Bônus: \${bonus > 0 ? '+'+bonus : bonus}\`;
      } else {
        calcStr = calcStr.replace(/ \\| $/, '');
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
      
      window.rollHistory.unshift(historyItem);
      if (window.rollHistory.length > 50) window.rollHistory.pop();
      if(typeof renderHistory === 'function') renderHistory();
      if(typeof saveData === 'function') saveData();
      
    }, 1500);
  };

/* ========================================================
       BANCO DE DADOS DE ITENS
    ======================================================== */

    const TIPOS = {
      arma:      { nome: 'Arma',          icones: ['⚔','🗡','🏹','🪓','🔱','🗺'] },
      armadura:  { nome: 'Armadura',       icones: ['🛡','🪬','🦺'] },
      acessorio: { nome: 'Acessório',      icones: ['💍','📿','🧣','🪬','👁'] },
      consumivel:{ nome: 'Consumível',     icones: ['🧪','⚗️','🫙','💊','🌿'] },
      reliquia:  { nome: 'Relíquia',       icones: ['✦','🔮','💀','🧿','📜'] },
      cajado:    { nome: 'Cajado/Varinha', icones: ['🪄','🌟','🔯','🎇'] },
      escudo:    { nome: 'Escudo',         icones: ['🛡','🔰','⬡'] },
    };

    const RARIDADES = ['comum','incomum','raro','muito-raro','lendario','artefato'];
    const RARIDADE_PESO = [25, 30, 22, 13, 7, 3]; // porcentagens de chance

    const RARIDADE_LABEL = {
      'comum':      'Comum',
      'incomum':    'Incomum',
      'raro':       'Raro',
      'muito-raro': 'Muito Raro',
      'lendario':   'Lendário',
      'artefato':   'Artefato'
    };

    const RARIDADE_COR = {
      'comum':      '#aaa',
      'incomum':    '#7de87d',
      'raro':       '#78a4f5',
      'muito-raro': '#c07ef5',
      'lendario':   '#f5d87a',
      'artefato':   '#f57878'
    };

    const ESCOLAS = {
      'abjuracao':    { nome: 'Abjuração',    icone: '🔵' },
      'conjuracao':   { nome: 'Conjuração',   icone: '🟣' },
      'divinacao':    { nome: 'Divinação',    icone: '🟡' },
      'encantamento': { nome: 'Encantamento', icone: '💜' },
      'evocacao':     { nome: 'Evocação',     icone: '🔴' },
      'ilusao':       { nome: 'Ilusão',       icone: '⚪' },
      'necromancia':  { nome: 'Necromancia',  icone: '⚫' },
      'transmutacao': { nome: 'Transmutação', icone: '🟢' },
    };

    const PREFIXOS_NOME = [
      'Anciã','Sombria','Sagrada','Maldita','Lendária','Etérea','Venerada',
      'Esquecida','Verdadeira','Flamejante','Glacial','Reluzente','Amaldiçoada',
      'Profética','Abissal','Divina','Corrompida','Ancestral','Arcana','Profana'
    ];

    const NOMES_ARMA = [
      'Espada','Lâmina','Gládio','Machado','Alabarda','Arco','Besta','Adaga',
      'Lança','Martelo de Guerra','Foice','Tridente','Bastão','Mangualde','Rapieira'
    ];
    const NOMES_ARMADURA = [
      'Armadura','Couraça','Brunea','Malha','Cota','Peitoral','Vestes','Manto'
    ];
    const NOMES_ACESSORIO = [
      'Anel','Amuleto','Colar','Bracelete','Tiara','Braçal','Fivela','Broche','Pendente'
    ];
    const NOMES_CONSUMIVEL = [
      'Poção','Elixir','Bálsamo','Tintura','Pó','Filtro','Frasco','Taça','Vial'
    ];
    const NOMES_RELIQUIA = [
      'Orbe','Tomo','Cristal','Fragmento','Pedra','Ossada','Relicário','Caveira','Espelho'
    ];
    const NOMES_CAJADO = [
      'Cajado','Varinha','Bordão','Báculo','Totem','Foco Arcano','Cetro'
    ];
    const NOMES_ESCUDO = [
      'Escudo','Broquel','Égide','Pavês','Rodela','Testudo'
    ];

    const SUFIXOS_NOME = [
      'das Sombras','da Lua Sangrenta','do Abismo','das Estrelas Mortas',
      'do Eterno Gelo','do Inferno','dos Deuses Caídos','da Tempestade',
      'da Última Batalha','do Juízo Final','do Esquecimento','da Criação',
      'da Ruína','do Alvorecer','do Crepúsculo','das Eras','dos Titãs',
      'do Profeta','da Profecia','do Destino','da Vingança','da Redenção'
    ];

    const PROPRIEDADES_POR_ESCOLA = {
      abjuracao: [
        { icone:'🔵', texto: 'Concede +{n} na Classe de Armadura.', n:[1,3] },
        { icone:'🔵', texto: 'Reduz o dano mágico sofrido em {n}.', n:[1,6] },
        { icone:'🔵', texto: 'Uma vez por descanso longo, anula um feitiço de nível {n} ou inferior.', n:[1,5] },
        { icone:'🔵', texto: 'Resistência a dano de um elemento à escolha do portador.', n:null },
        { icone:'🔵', texto: 'Imune ao status Amedrontado enquanto equipado.', n:null },
        { icone:'🔵', texto: 'Cria um escudo invisível; reduz dano de projéteis em {n}.', n:[2,8] },
      ],
      conjuracao: [
        { icone:'🟣', texto: 'Teleporta o portador até {n} metros como ação bônus (1x/descanso).', n:[5,30] },
        { icone:'🟣', texto: 'Invoca um familiar etéreo que concede vantagem em Percepção.', n:null },
        { icone:'🟣', texto: 'Pode convocar um arma conjurada que dura {n} turnos.', n:[3,10] },
        { icone:'🟣', texto: 'Portões dimensionais custam {n} PM a menos para abrir.', n:[2,5] },
        { icone:'🟣', texto: 'Uma vez por dia, conjura um escudo de força (CA +{n} por 1 minuto).', n:[2,4] },
      ],
      divinacao: [
        { icone:'🟡', texto: 'Permite fazer uma pergunta de sim/não ao Mestre uma vez por sessão.', n:null },
        { icone:'🟡', texto: 'Concede Vantagem em testes de Percepção e Intuição.', n:null },
        { icone:'🟡', texto: 'Detecta mentiras automaticamente em um raio de {n} metros.', n:[5,20] },
        { icone:'🟡', texto: 'Uma vez por descanso, revela a localização de um objeto ou pessoa desejada.', n:null },
        { icone:'🟡', texto: 'O portador nunca é surpreendido em combate.', n:null },
        { icone:'🟡', texto: 'Vê através de ilusões; imune ao status Enfeitiçado.', n:null },
      ],
      encantamento: [
        { icone:'💜', texto: 'Concede +{n} em testes de Carisma e Diplomacia.', n:[2,6] },
        { icone:'💜', texto: 'Uma vez por dia, encanta uma criatura (Teste de Vontade DT {n} para resistir).', n:[12,18] },
        { icone:'💜', texto: 'Inimigos atacados sofrem Desvantagem no próximo ataque contra o portador.', n:null },
        { icone:'💜', texto: 'O portador inspira aliados a 15m; eles ganham +{n} em ataques por 1 rodada.', n:[1,3] },
        { icone:'💜', texto: 'Gera uma aura de calma; criaturas neutras preferem não atacar o portador.', n:null },
      ],
      evocacao: [
        { icone:'🔴', texto: 'Acrescenta {n}d{d} de dano de fogo a ataques físicos.', n:[1,4], d:[4,8] },
        { icone:'🔴', texto: 'Acrescenta {n}d{d} de dano de raio a ataques físicos.', n:[1,4], d:[4,8] },
        { icone:'🔴', texto: 'Uma vez por descanso, solta uma explosão de {n}d6 de dano em cone de 6m.', n:[3,10] },
        { icone:'🔴', texto: 'Projéteis ou ataques à distância ganham {n}m de alcance adicional.', n:[10,30] },
        { icone:'🔴', texto: 'Causa {n}d4 de dano elemental extra em críticos.', n:[1,6] },
        { icone:'🔴', texto: 'Acrescenta {n}d6 de dano de gelo a ataques físicos.', n:[1,4] },
      ],
      ilusao: [
        { icone:'⚪', texto: 'Concede Invisibilidade por {n} rodadas (1x/descanso).', n:[2,6] },
        { icone:'⚪', texto: 'O portador pode alterar sua aparência à vontade (ilusão menor).', n:null },
        { icone:'⚪', texto: 'Ataques contra o portador têm Desvantagem na primeira rodada de combate.', n:null },
        { icone:'⚪', texto: 'Cria duplicatas ilusórias (1d{n}); inimigos escolhem alvo aleatoriamente.', n:[4,6] },
        { icone:'⚪', texto: 'Sons produzidos pelo portador podem ser silenciados à vontade.', n:null },
      ],
      necromancia: [
        { icone:'⚫', texto: 'Ataques que causam dano drenam {n} PV do alvo e curam o portador.', n:[2,8] },
        { icone:'⚫', texto: 'Uma vez por descanso, anima um cadáver como Morto-Vivo sob sua ordem por {n} horas.', n:[1,8] },
        { icone:'⚫', texto: 'Imune a efeitos de morte instantânea e dreno de nível.', n:null },
        { icone:'⚫', texto: 'Concede visão no escuro de {n} metros.', n:[10,30] },
        { icone:'⚫', texto: 'Quando o portador morre, ressurge com {n} PV após {m} rodadas (1x/semana).', n:[5,20], m:[1,3] },
        { icone:'⚫', texto: 'Aura de pavor; criaturas a 3m sofrem -2 em ataques e testes.', n:null },
      ],
      transmutacao: [
        { icone:'🟢', texto: 'Aumenta a Força em +{n} enquanto equipado.', n:[1,4] },
        { icone:'🟢', texto: 'Aumenta a Destreza em +{n} enquanto equipado.', n:[1,4] },
        { icone:'🟢', texto: 'Permite ao portador respirar sob água e nadar a velocidade normal.', n:null },
        { icone:'🟢', texto: 'Uma vez por dia, converte-se em névoa por {n} rodadas.', n:[1,4] },
        { icone:'🟢', texto: 'O material do item se adapta: conta como metal, madeira ou couro conforme necessário.', n:null },
        { icone:'🟢', texto: 'Aumenta a Constituição em +{n}; ganha +{m} PV por nível.', n:[1,3], m:[1,5] },
      ],
    };

    const MALDICOES = [
      'O portador não pode se desfazer do item voluntariamente.',
      'Cada amanhecer, o portador sofre {n}d4 de dano psíquico.', // n
      'O portador sente um desejo irrefreável de atacar aliados quando abaixo de 25% de PV.',
      'Sonhos perturbadores impedem descanso longo; o portador recupera apenas metade dos PV.',
      'O item sussurra vozes que concedem -2 em testes de Vontade permanentemente.',
      'O portador envelhece {n} anos a cada uso da propriedade principal do item.', // n
      'Qualquer cura mágica recebida pelo portador é reduzida à metade.',
      'O portador torna-se alvo preferencial de não-mortos e demônios.',
      'Usar o item cria uma marca sombria visível, revelando ao mundo que o item é maldito.',
      'O item drena {n} PM/PA do portador ao início de cada combate.', // n
      'O portador tem Desvantagem em testes de Carisma enquanto equipar o item.',
      'Uma sombra maligna emerge do item a cada lua cheia, atacando criaturas ao redor.',
    ];

    const HISTORIAS_SUFIXO = {
      arma: [
        'Foi forjada nas entranhas de um vulcão adormecido por um ferreiro que vendeu a alma ao deus da guerra.',
        'Pertenceu a um general lendário que nunca perdeu uma batalha — até sua última.',
        'Emana um fraco gemido quando a batalha se aproxima, como se clamasse por sangue.',
        'Dizem que seus golpes atravessam ilusões e revelam a forma verdadeira dos seres.',
        'A lâmina escurece na presença de traidores, como se absolvesse os leais.',
        'Foi rachada numa batalha mítica e remendada com metal de um meteorito.',
      ],
      armadura: [
        'Moldada a partir das escamas de um dragão ancião, carrega o orgulho bestial de sua criadora.',
        'Quem a veste sente um peso invisível de batalhas passadas — e a determinação de sobrevivê-las.',
        'Suas runas foram gravadas por um anão cego cujos dedos liam o futuro pelo toque.',
        'Mantém a temperatura do portador constante, seja no deserto abrasador ou nas tundras glaciais.',
      ],
      acessorio: [
        'Pertenceu a uma rainha que governou por três séculos sem envelhecer uma ruga.',
        'Foi encontrado num cofre submerso no fundo de um lago sem nome.',
        'Quando removido, revela marcas de fogo na pele de quem o usou por mais de um dia.',
        'Cria um elo tênue entre o portador e algo além do plano material.',
      ],
      consumivel: [
        'Produzido por uma alquimista reclusa que desapareceu antes de revelar o segredo da receita.',
        'O líquido brilha tenuemente na escuridão, pulsando no ritmo do coração de quem o segura.',
        'Diz-se que só funciona plenamente sob luz de lua cheia.',
        'Tem sabor diferente para cada pessoa — refletindo sua memória mais feliz.',
      ],
      reliquia: [
        'Sobreviveu à queda de um império inteiro, circulando de ruína em ruína através dos séculos.',
        'Emana um calor suave na presença de magia, como se reconhecesse seus semelhantes.',
        'Seu propósito verdadeiro ainda é desconhecido; estudiosos discutem há gerações.',
        'Reage à presença de deuses — vibrando de alegria ou tremendo de medo.',
      ],
      cajado: [
        'O núcleo de cristal contém um fragmento de estrela capturado por um mago moribundo.',
        'Talhado de madeira de uma árvore que cresceu no centro de uma explosão arcana.',
        'Responde ao humor do portador, brilhando mais forte quando ele está determinado.',
        'Cada entalhe representa um feitiço perdido que pode ser redescoberto pelo portador certo.',
      ],
      escudo: [
        'Carrega o brasão de uma família extinta — mas alguns dizem ver seus espíritos na superfície polida.',
        'Sobreviveu a assédios incontáveis; cada amassado conta uma história de resistência.',
        'Ressoa com um toque baixo quando o portador está prestes a ser atingido.',
        'Foi presenteado por uma divindade a um paladino como sinal de aprovação divina.',
      ],
    };

    /* ========================================================
       UTILITÁRIOS
    ======================================================== */

    function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function escolherRaridade(sel) {
      if (sel !== 'aleatorio') return sel;
      const total = RARIDADE_PESO.reduce((a,b) => a+b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < RARIDADES.length; i++) {
        r -= RARIDADE_PESO[i];
        if (r <= 0) return RARIDADES[i];
      }
      return 'incomum';
    }

    function escolherEscola(sel) {
      if (sel !== 'aleatorio') return sel;
      const escolas = Object.keys(ESCOLAS);
      return rand(escolas);
    }

    function escolherTipo(sel) {
      if (sel !== 'aleatorio') return sel;
      return rand(Object.keys(TIPOS));
    }

    function numPropriedades(raridade) {
      const map = { comum:1, incomum:1, raro:2, 'muito-raro':3, lendario:4, artefato:5 };
      return map[raridade] || 1;
    }

    function temMaldicao(selMaldicao, raridade) {
      if (selMaldicao === 'forcada') return true;
      if (selMaldicao === 'nenhuma') return false;
      // Aleatório: chance aumenta com raridade
      const chances = { comum:3, incomum:8, raro:18, 'muito-raro':30, lendario:45, artefato:65 };
      return Math.random() * 100 < (chances[raridade] || 10);
    }

    function gerarNomeItem(tipo, prefixo, sufixo) {
      const nomes = {
        arma: NOMES_ARMA, armadura: NOMES_ARMADURA, acessorio: NOMES_ACESSORIO,
        consumivel: NOMES_CONSUMIVEL, reliquia: NOMES_RELIQUIA,
        cajado: NOMES_CAJADO, escudo: NOMES_ESCUDO
      };
      const base = rand(nomes[tipo] || NOMES_ARMA);
      return `${prefixo} ${base} ${sufixo}`;
    }

    function gerarNomeMundano(tipo, raridade) {
      const bases = {
        arma: ['Espada Longa', 'Espada Curta', 'Machado de Batalha', 'Arco Curto', 'Besta Leve', 'Adaga de Aço', 'Maça', 'Lança', 'Rapieira'],
        armadura: ['Cota de Malha', 'Armadura de Couro', 'Peitoral de Aço', 'Armadura Acolchoada', 'Vestes de Pano', 'Couraça de Bronze'],
        escudo: ['Escudo de Madeira', 'Escudo de Ferro', 'Broquel', 'Escudo Pesado', 'Rodela de Aço'],
        acessorio: ['Anel de Ouro', 'Anel de Prata', 'Colar de Bronze', 'Amuleto Simples', 'Bracelete de Couro', 'Cordão de Ouro'],
        consumivel: ['Poção de Cura', 'Poção de Mana', 'Antídoto', 'Bálsamo Restaurador', 'Ração de Viagem', 'Erva Medicinal', 'Frasco de Fogo Alquímico'],
        reliquia: ['Estátua Antiga', 'Cálice de Ouro', 'Papiro Amassado', 'Joia Bruta', 'Moeda Comemorativa', 'Cristal Opaco'],
        cajado: ['Cajado de Madeira', 'Varinha Torcida', 'Foco Arcano Simples', 'Bordão de Caminhante']
      };
      let nome = rand(bases[tipo] || bases.arma);
      if (raridade === 'incomum') nome += ' (+1)';
      else if (raridade === 'raro') nome += ' (+2)';
      else if (raridade === 'muito-raro') nome += ' (+3)';
      else if (raridade === 'lendario') nome += ' (+4)';
      else if (raridade === 'artefato') nome += ' (+5)';
      return nome;
    }

    function formatarPropriedade(prop) {
      let texto = prop.texto;
      if (prop.n) {
        const val = Array.isArray(prop.n) ? randInt(prop.n[0], prop.n[1]) : prop.n;
        texto = texto.replace('{n}', val);
      }
      if (prop.d) {
        const val = Array.isArray(prop.d) ? rand([4,6,8]) : prop.d;
        texto = texto.replace('{d}', val);
      }
      if (prop.m) {
        const val = Array.isArray(prop.m) ? randInt(prop.m[0], prop.m[1]) : prop.m;
        texto = texto.replace('{m}', val);
      }
      return texto;
    }

    function formatarMaldicao(maldicao) {
      return maldicao
        .replace('{n}', randInt(1,4))
        .replace('{m}', randInt(1,3));
    }

    function gerarBonus(raridade) {
      const bonusMap = { comum:0, incomum:1, raro:1, 'muito-raro':2, lendario:3, artefato:3 };
      const base = bonusMap[raridade];
      if (raridade === 'artefato' && Math.random() > 0.5) return '+4';
      if (base === 0) return null;
      return `+${base}`;
    }

    /* ========================================================
       GERADOR PRINCIPAL
    ======================================================== */

    function gerarItemBase(selTipo, selRaridade, selEscola, selMaldicao, isMundane = false) {
      const tipo     = escolherTipo(selTipo);
      const raridade = escolherRaridade(selRaridade);
      const escola   = escolherEscola(selEscola);
      const maldito  = temMaldicao(selMaldicao, raridade);
      const bonus    = gerarBonus(raridade);

      let nome;
      if (isMundane) {
        nome = gerarNomeMundano(tipo, raridade);
      } else {
        const prefixo = rand(PREFIXOS_NOME);
        const sufixo  = rand(SUFIXOS_NOME);
        nome = gerarNomeItem(tipo, prefixo, sufixo);
      }
      
      const icone   = rand(TIPOS[tipo].icones);

      // Propriedades mágicas
      const poolPropriedades = PROPRIEDADES_POR_ESCOLA[escola] || [];
      const qtdProps = Math.min(numPropriedades(raridade), poolPropriedades.length);
      const usadas = new Set();
      const propriedades = [];
      while (propriedades.length < qtdProps) {
        const idx = Math.floor(Math.random() * poolPropriedades.length);
        if (!usadas.has(idx)) {
          usadas.add(idx);
          propriedades.push(formatarPropriedade(poolPropriedades[idx]));
        }
        if (usadas.size >= poolPropriedades.length) break;
      }

      // Maldição
      let maldicaoTexto = null;
      if (maldito) {
        maldicaoTexto = formatarMaldicao(rand(MALDICOES));
      }

      // História
      const historiaPool = HISTORIAS_SUFIXO[tipo] || HISTORIAS_SUFIXO.reliquia;
      const historia = rand(historiaPool);

      // Valor estimado
      const valoresBase = { comum:'5–50 MP', incomum:'50–100 MP', raro:'1–20 MO', 'muito-raro':'21–500 MO', lendario:'1–5 MD', artefato:'5–10 MD (ou Inestimável)' };

      return { nome, tipo, raridade, escola, bonus, icone, propriedades, maldicaoTexto, historia, valor: valoresBase[raridade] };
    }

    function gerarItem() {
      const selTipo      = document.getElementById('sel-tipo').value;
      const selRaridade  = document.getElementById('sel-raridade').value;
      const selEscola    = document.getElementById('sel-escola').value;
      const selMaldicao  = document.getElementById('sel-maldicao').value;
      
      return gerarItemBase(selTipo, selRaridade, selEscola, selMaldicao);
    }

    /* ========================================================
       RENDERIZAÇÃO
    ======================================================== */

    function badgeRaridadeClass(r) {
      return 'badge badge-' + r;
    }

    function iconeBgCor(raridade) {
      const cores = {
        'comum':      'rgba(120,120,120,0.18)',
        'incomum':    'rgba(70,180,70,0.18)',
        'raro':       'rgba(60,110,210,0.18)',
        'muito-raro': 'rgba(140,60,200,0.18)',
        'lendario':   'rgba(201,168,76,0.22)',
        'artefato':   'rgba(220,60,60,0.18)'
      };
      return cores[raridade] || 'rgba(201,168,76,0.1)';
    }

    function renderItemHTML(item) {
      const bonusStr = item.bonus ? ` <span style="font-size:13px;opacity:0.8">${item.bonus}</span>` : '';

      const statsExtra = [];
      if (item.bonus) {
        if (['arma','cajado'].includes(item.tipo)) {
          statsExtra.push({ label:'Bônus de Ataque', valor: item.bonus });
          statsExtra.push({ label:'Bônus de Dano', valor: item.bonus });
        } else if (['armadura','escudo'].includes(item.tipo)) {
          statsExtra.push({ label:'Bônus de CA', valor: item.bonus });
        } else {
          statsExtra.push({ label:'Bônus Mágico', valor: item.bonus });
        }
      }

      const statsHTML = [
        { label:'Tipo', valor: TIPOS[item.tipo].nome },
        { label:'Escola', valor: `${ESCOLAS[item.escola].icone} ${ESCOLAS[item.escola].nome}` },
        { label:'Valor', valor: item.valor },
        ...statsExtra
      ].map(s => `
        <div class="item-stat">
          <span class="label">${s.label}</span>
          <span class="valor">${s.valor}</span>
        </div>`).join('');

      const propsHTML = item.propriedades.map(p => `
        <li>
          <span class="prop-icone">${ESCOLAS[item.escola].icone}</span>
          <span>${p}</span>
        </li>`).join('');

      const maldicaoHTML = item.maldicaoTexto ? `
        <div class="maldicao-box">
          <span class="label">☠ MALDIÇÃO</span>
          <p>${item.maldicaoTexto}</p>
        </div>` : '';

      return `
        <div class="item-header">
          <div class="item-icone" style="background:${iconeBgCor(item.raridade)};border:1px solid ${RARIDADE_COR[item.raridade]}40;">
            ${item.icone}
          </div>
          <div class="item-titulo-bloco">
            <div class="item-nome">${item.nome}${bonusStr}</div>
            <div class="item-badges">
              <span class="${badgeRaridadeClass(item.raridade)}">${RARIDADE_LABEL[item.raridade]}</span>
              <span class="badge badge-tipo">${TIPOS[item.tipo].nome}</span>
              ${item.maldicaoTexto ? '<span class="badge" style="background:rgba(180,30,30,0.12);border-color:rgba(180,30,30,0.5);color:#f57878;">☠ Maldito</span>' : ''}
            </div>
          </div>
        </div>

        <div class="item-corpo">
          ${statsHTML}
        </div>

        <h3>✦ Propriedades Mágicas</h3>
        <ul class="propriedades-lista">
          ${propsHTML}
        </ul>

        ${maldicaoHTML}

        <h3 style="margin-top:18px;">📜 Lore</h3>
        <p class="item-historia">${item.historia}</p>

        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(212,175,55,0.2); display:flex; gap:10px; align-items:center;">
            <label style="color:var(--gold-dim); font-size:0.85rem;">Enviar para:</label>
            <select class="input-modern item-player-select" style="min-width:150px;"></select>
            <button class="btn-outline" onclick="enviarItemParaJogador(this)"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
            <textarea class="item-data-hidden" style="display:none;">${JSON.stringify(item)}</textarea>
        </div>
      `;
    }

    function renderMiniItemHTML(item, idx) {
      const dot = `<span class="rarity-dot" style="background:${RARIDADE_COR[item.raridade]};color:${RARIDADE_COR[item.raridade]};display:inline-block;"></span>`;
      return `
        <div class="mini-item" onclick="expandirItem(${idx})" id="mini-item-${idx}">
          <div class="mini-item-header">
            <div>
              <div class="mini-item-nome">${item.icone} ${item.nome}</div>
              <div class="mini-item-sub">
                ${RARIDADE_LABEL[item.raridade]} · ${TIPOS[item.tipo].nome} · ${ESCOLAS[item.escola].icone} ${ESCOLAS[item.escola].nome}
                ${item.maldicaoTexto ? ' · ☠ Maldito' : ''}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              ${dot}
              <span style="font-size:12px;color:var(--gold-dark);">${item.valor}</span>
            </div>
          </div>
        </div>`;
    }

    /* ========================================================
       GERAÇÃO E DISPLAY
    ======================================================== */

    let itensGerados = [];

    function gerarItens() {
      const qty = Math.min(Math.max(parseInt(document.getElementById('qty-itens').value) || 1, 1), 10);
      itensGerados = [];

      const resultado = document.getElementById('item-resultado');
      const lista = document.getElementById('lista-itens');

      if (qty === 1) {
        const item = gerarItem();
        itensGerados = [item];
        resultado.innerHTML = renderItemHTML(item);
        resultado.style.display = 'block';
        resultado.classList.remove('revealed');
        void resultado.offsetWidth; // reflow
        resultado.classList.add('revealed');
        lista.innerHTML = '';
        carregarJogadoresNaSelect(resultado.querySelector('.item-player-select'));
      } else {
        resultado.style.display = 'none';
        lista.innerHTML = '';
        for (let i = 0; i < qty; i++) {
          const item = gerarItem();
          itensGerados.push(item);
          lista.innerHTML += renderMiniItemHTML(item, i);
        }
      }
    }

    function expandirItem(idx) {
      const item = itensGerados[idx];
      if (!item) return;

      // Remover destaques anteriores
      document.querySelectorAll('.mini-item').forEach(el => el.style.borderColor = '');

      const mini = document.getElementById(`mini-item-${idx}`);
      if (mini) mini.style.borderColor = RARIDADE_COR[item.raridade];

      const resultado = document.getElementById('item-resultado');
      resultado.innerHTML = renderItemHTML(item);
      resultado.style.display = 'block';
      resultado.classList.remove('revealed');
      void resultado.offsetWidth;
      resultado.classList.add('revealed');
      resultado.scrollIntoView({ behavior:'smooth', block:'start' });
      carregarJogadoresNaSelect(resultado.querySelector('.item-player-select'));
    }

    /* ========================================================
       SISTEMA DE TESOURO E ENVIO
    ======================================================== */

    function carregarJogadoresNaSelect(selectElement) {
        if (!selectElement) return;
        if (!window.currentTableId) return;
        
        const membersKey = `dandora_table_members_${currentTableId}`;
        const members = JSON.parse(localStorage.getItem(membersKey)) || [];
        
        selectElement.innerHTML = '<option value="">-- Selecione o Jogador --</option>';
        
        members.forEach(m => {
            if (m.activeSheet && m.activeSheet.nome) {
                const opt = document.createElement('option');
                opt.value = m.playerEmail;
                opt.textContent = `${m.activeSheet.nome} (${m.playerName})`;
                selectElement.appendChild(opt);
            }
        });
    }

    // Gerador de Tesouro (Moedas)
    let tesouroAtual = null;

    function gerarTesouro() {
        const tipo = document.getElementById('sel-tesouro-tipo').value;
        const moedas = { mb: 0, mp: 0, mo: 0, md: 0 };
        
        if (tipo === 'pobre') {
            moedas.mb = randInt(10, 100);
            moedas.mp = randInt(1, 20);
        } else if (tipo === 'medio') {
            moedas.mb = randInt(50, 200);
            moedas.mp = randInt(10, 100);
            moedas.mo = randInt(1, 15);
        } else if (tipo === 'rico') {
            moedas.mp = randInt(50, 300);
            moedas.mo = randInt(10, 100);
            if (Math.random() > 0.8) moedas.md = randInt(1, 3);
        } else if (tipo === 'epico') {
            moedas.mp = randInt(100, 500);
            moedas.mo = randInt(50, 300);
            moedas.md = randInt(1, 20);
        }
        
        tesouroAtual = moedas;
        
        let html = '';
        if (moedas.md > 0) html += `<span style="color:#b9f2ff; margin-right:15px;">💎 ${moedas.md} MD</span>`;
        if (moedas.mo > 0) html += `<span style="color:#ffd700; margin-right:15px;">🪙 ${moedas.mo} MO</span>`;
        if (moedas.mp > 0) html += `<span style="color:#c0c0c0; margin-right:15px;">🥈 ${moedas.mp} MP</span>`;
        if (moedas.mb > 0) html += `<span style="color:#cd7f32; margin-right:15px;">🥉 ${moedas.mb} MB</span>`;
        
        const resDiv = document.getElementById('tesouro-resultado');
        document.getElementById('tesouro-valores').innerHTML = html;
        resDiv.style.display = 'block';
        
        carregarJogadoresNaSelect(document.getElementById('tesouro-player-select'));
    }

    // Função genérica para enviar modificações para a ficha de um jogador
    function enviarParaFicha(playerEmail, modifierFn) {
        if (!window.currentTableId) return false;
        
        // Atualiza na mesa
        const membersKey = `dandora_table_members_${currentTableId}`;
        let members = JSON.parse(localStorage.getItem(membersKey)) || [];
        let member = members.find(m => m.playerEmail === playerEmail);
        
        if (member && member.activeSheet) {
            modifierFn(member.activeSheet);
            localStorage.setItem(membersKey, JSON.stringify(members));
            
            // Tenta atualizar também o backup local do jogador se possível 
            // (Na realidade isso precisaria de um backend ou polling, mas atualizamos no localStorage global dele também)
            const playerFichasKey = `dandora_fichas_${playerEmail}`;
            let fichasJogador = JSON.parse(localStorage.getItem(playerFichasKey)) || [];
            let fichaOriginal = fichasJogador.find(f => f.id === member.activeSheet.id);
            if (fichaOriginal) {
                modifierFn(fichaOriginal);
                localStorage.setItem(playerFichasKey, JSON.stringify(fichasJogador));
            }
            return true;
        }
        return false;
    }

    function enviarTesouroParaJogador() {
        const email = document.getElementById('tesouro-player-select').value;
        if (!email) {
            alert('Selecione um jogador!');
            return;
        }
        if (!tesouroAtual) return;
        
        const success = enviarParaFicha(email, (ficha) => {
            ficha.moedas_diamante = (parseInt(ficha.moedas_diamante) || 0) + (tesouroAtual.md || 0);
            ficha.moedas_ouro = (parseInt(ficha.moedas_ouro) || 0) + (tesouroAtual.mo || 0);
            ficha.moedas_prata = (parseInt(ficha.moedas_prata) || 0) + (tesouroAtual.mp || 0);
            ficha.moedas_bronze = (parseInt(ficha.moedas_bronze) || 0) + (tesouroAtual.mb || 0);
        });
        
        if (success) {
            alert('Tesouro enviado para o jogador com sucesso!');
            document.getElementById('tesouro-resultado').style.display = 'none';
        } else {
            alert('Erro ao enviar. O jogador pode não ter uma ficha ativa.');
        }
    }

    function enviarItemParaJogador(btnElement) {
        const container = btnElement.parentElement;
        const select = container.querySelector('.item-player-select');
        const dataArea = container.querySelector('.item-data-hidden');
        
        const email = select.value;
        if (!email) {
            alert('Selecione um jogador!');
            return;
        }
        
        const item = JSON.parse(dataArea.value);
        
        const success = enviarParaFicha(email, (ficha) => {
            if (!ficha.itens) ficha.itens = [];
            
            // Adiciona o item mágico
            ficha.itens.push({
                nome: `${item.icone} ${item.nome} (${RARIDADE_LABEL[item.raridade]})`,
                quantidade: 1,
                slots: 1 // Padrão
            });
        });
        
        if (success) {
            alert('Item Mágico enviado para o jogador com sucesso!');
        } else {
            alert('Erro ao enviar. O jogador pode não ter uma ficha ativa.');
        }
    }

    // Sistema de Baú
    let bauAtual = { moedas: null, itens: [] };

    function gerarBau() {
        const local = document.getElementById('sel-bau-local').value;
        const nivel = document.getElementById('sel-bau-nivel').value;
        
        let poolTipos = ['aleatorio'];
        if (local === 'masmorra') poolTipos = ['arma', 'armadura', 'escudo', 'consumivel'];
        else if (local === 'mansao') poolTipos = ['acessorio', 'reliquia', 'consumivel'];
        else if (local === 'igreja') poolTipos = ['reliquia', 'cajado', 'consumivel'];
        else if (local === 'abandonado') poolTipos = ['consumivel', 'acessorio', 'armadura'];
        else if (local === 'acampamento') poolTipos = ['arma', 'escudo', 'consumivel'];

        // Quantidade de itens baseada no nível
        let qtdItens = 1;
        let raridadeBase = 'aleatorio';
        if (nivel === 'pobre') { qtdItens = randInt(1, 2); raridadeBase = rand(['comum', 'comum', 'incomum']); }
        else if (nivel === 'medio') { qtdItens = randInt(1, 3); raridadeBase = rand(['comum', 'incomum', 'raro']); }
        else if (nivel === 'rico') { qtdItens = randInt(2, 4); raridadeBase = rand(['incomum', 'raro', 'muito-raro']); }
        else if (nivel === 'epico') { qtdItens = randInt(3, 5); raridadeBase = rand(['raro', 'muito-raro', 'lendario']); }

        bauAtual.itens = [];
        for (let i = 0; i < qtdItens; i++) {
            const tipo = rand(poolTipos);
            bauAtual.itens.push(gerarItemBase(tipo, raridadeBase, 'aleatorio', 'nenhuma', true));
        }

        // Moedas baseadas no nível
        const moedas = { mb: 0, mp: 0, mo: 0, md: 0 };
        if (nivel === 'pobre') { moedas.mb = randInt(20, 150); moedas.mp = randInt(5, 30); }
        else if (nivel === 'medio') { moedas.mb = randInt(100, 300); moedas.mp = randInt(20, 100); moedas.mo = randInt(1, 10); }
        else if (nivel === 'rico') { moedas.mp = randInt(100, 400); moedas.mo = randInt(10, 50); if(Math.random()>0.8) moedas.md = randInt(1,2); }
        else if (nivel === 'epico') { moedas.mo = randInt(50, 200); moedas.md = randInt(2, 10); }
        
        bauAtual.moedas = moedas;

        // Renderização
        let htmlMoedas = '';
        if (moedas.md > 0) htmlMoedas += `<span style="color:#b9f2ff; margin-right:15px;">💎 ${moedas.md} MD</span>`;
        if (moedas.mo > 0) htmlMoedas += `<span style="color:#ffd700; margin-right:15px;">🪙 ${moedas.mo} MO</span>`;
        if (moedas.mp > 0) htmlMoedas += `<span style="color:#c0c0c0; margin-right:15px;">🥈 ${moedas.mp} MP</span>`;
        if (moedas.mb > 0) htmlMoedas += `<span style="color:#cd7f32; margin-right:15px;">🥉 ${moedas.mb} MB</span>`;
        if (htmlMoedas === '') htmlMoedas = '<span style="color:var(--text-muted)">Nenhuma moeda</span>';
        
        document.getElementById('bau-moedas').innerHTML = htmlMoedas;
        
        let htmlItens = '';
        bauAtual.itens.forEach(item => {
            const dot = `<span class="rarity-dot" style="background:${RARIDADE_COR[item.raridade]};color:${RARIDADE_COR[item.raridade]};display:inline-block;width:8px;height:8px;border-radius:50%;"></span>`;
            htmlItens += `
            <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--gold-dim); padding: 10px; border-radius: 8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-family:var(--font-epic); color:var(--gold-primary);">${item.icone} ${item.nome}</div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">${RARIDADE_LABEL[item.raridade]} · ${TIPOS[item.tipo].nome}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  ${dot}
                  <span style="font-size:12px;color:var(--gold-dark);">${item.valor}</span>
                </div>
              </div>
            </div>`;
        });
        document.getElementById('bau-itens').innerHTML = htmlItens;

        const resDiv = document.getElementById('bau-resultado');
        resDiv.style.display = 'block';
        carregarJogadoresNaSelect(document.getElementById('bau-player-select'));
    }

    function enviarBauParaJogador() {
        const email = document.getElementById('bau-player-select').value;
        if (!email) { alert('Selecione um jogador!'); return; }
        if (!bauAtual.moedas && bauAtual.itens.length === 0) return;

        const success = enviarParaFicha(email, (ficha) => {
            if (bauAtual.moedas) {
                ficha.moedas_diamante = (parseInt(ficha.moedas_diamante) || 0) + (bauAtual.moedas.md || 0);
                ficha.moedas_ouro = (parseInt(ficha.moedas_ouro) || 0) + (bauAtual.moedas.mo || 0);
                ficha.moedas_prata = (parseInt(ficha.moedas_prata) || 0) + (bauAtual.moedas.mp || 0);
                ficha.moedas_bronze = (parseInt(ficha.moedas_bronze) || 0) + (bauAtual.moedas.mb || 0);
            }
            if (!ficha.itens) ficha.itens = [];
            bauAtual.itens.forEach(item => {
                ficha.itens.push({
                    nome: `${item.icone} ${item.nome} (${RARIDADE_LABEL[item.raridade]})`,
                    quantidade: 1,
                    slots: 1
                });
            });
        });

        if (success) {
            alert('Baú enviado para o jogador com sucesso!');
            document.getElementById('bau-resultado').style.display = 'none';
        } else {
            alert('Erro ao enviar. O jogador pode não ter uma ficha ativa.');
        }
    }

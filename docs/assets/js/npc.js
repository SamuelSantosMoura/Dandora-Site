    /* ============================================================
       BANCO DE DADOS
    ============================================================ */

    const nomesMasculinos = [
      "Aeron","Baldric","Cedric","Darian","Eldrin","Faelan","Garrick","Hadrian",
      "Icarus","Jareth","Kael","Lucan","Merek","Orrin","Perrin","Quillon","Roderic",
      "Sylas","Theron","Ulric","Varek","Wulfric","Xavian","Yorick","Zarek","Leoric",
      "Magnus","Drystan","Thorne","Brennan","Corvin","Erwan","Faeron","Gideon",
      "Halvard","Idris","Jorath","Kyren","Lorn","Mathis","Nolan","Osric","Pravin",
      "Quinlan","Revan","Soren","Tavish","Ulvar","Voss","Wendel"
    ];

    const nomesFemininos = [
      "Aelene","Brienne","Celeste","Daphne","Elira","Fiora","Gwen","Helena","Isolde",
      "Jasna","Keira","Liora","Mira","Nyssa","Odessa","Petra","Quinara","Rowena",
      "Selene","Thalia","Vanya","Wynne","Xanthe","Yseult","Zinnia","Lyra","Maris",
      "Dahlia","Talia","Aerin","Brisa","Calla","Devna","Eira","Fara","Gwyndra",
      "Helia","Irene","Jora","Kassia","Lenna","Morwen","Neve","Orla","Phaedra",
      "Rhea","Sable","Tirsa","Umbra","Vesna"
    ];

    const racas = [
      "Humano","Elfo","Orc","Fauno","Anão","Vampiro","Goblin","Onis","Fada",
      "Tiefling","Mestiço","Construto","Tritão","Rediit","Xaoc","Meio-Monstro",
      "Titan","Voxai","Homúnculo","Cielos","Pequenino"
    ];

    /* Cada ocupação tem: nome, habilidades possíveis e fragmentos de história */
    const OCUPACOES = [
      {
        nome: "Ferreiro",
        habilidades: [
          {
            titulo: "Reforço de Emergência",
            desc: "Durante o combate, o ferreiro repara rapidamente o equipamento de um aliado adjacente, concedendo +2 na Classe de Armadura até o fim do turno seguinte.",
            mecanica: "O aliado ganha +2 CA por 1 rodada."
          },
          {
            titulo: "Arma Improvisada",
            desc: "O ferreiro forja ou improvisa uma arma no calor da batalha, entregando-a a um aliado desarmado. Esse aliado realiza seu próximo ataque com Vantagem.",
            mecanica: "Um aliado desarmado ganha Vantagem no próximo ataque."
          }
        ],
        historia: [
          [
            "Cresceu entre bigornas e fornalhas, herdando o ofício do pai antes mesmo de saber ler. Cada cicatriz em suas mãos conta uma história de metal derretido e força bruta.",
            "Nunca quis ser herói — apenas fazer boas ferramentas. Mas a vida tem uma forma cruel de colocar ferreiros em campos de batalha.",
            "Carrega sempre um martelo pequeno pendurado no cinto, não como arma, mas como lembrança do dia em que reconstruiu a aldeia após um incêndio devastador."
          ],
          [
            "Aprendeu a trabalhar com metais raros depois de encontrar um fragmento de meteorito em um campo de batalha abandonado.",
            "Dizem que suas armaduras nunca quebram quando o portador realmente precisa. Ele diz que é só bom trabalho. Seus clientes dizem que é magia."
          ]
        ]
      },
      {
        nome: "Caçadora",
        habilidades: [
          {
            titulo: "Olho de Águia",
            desc: "A caçadora aponta uma fraqueza no inimigo: o próximo ataque de um aliado contra o alvo indicado ignora resistências e causa +1d6 de dano adicional.",
            mecanica: "Um aliado causa +1d6 de dano e ignora resistência no próximo ataque."
          },
          {
            titulo: "Armadilha Relâmpago",
            desc: "A caçadora arremessa uma armadilha improvisada. Um inimigo à escolha fica Imobilizado até o fim do próximo turno (Teste de Destreza DT 14 para resistir).",
            mecanica: "Um inimigo fica Imobilizado por 1 rodada (Resistência DT 14)."
          }
        ],
        historia: [
          [
            "Passou os primeiros anos de vida seguindo trilhas invisíveis pela floresta, aprendendo a ler o mundo pelos rastros que os outros ignoram.",
            "Caça há tanto tempo que já não sabe distinguir instinto de habilidade. Para ela, não há diferença.",
            "Tem um acordo silencioso com a natureza: nunca mata mais do que precisa, nunca mente sobre o que fez."
          ],
          [
            "Era mensageira antes de ser caçadora. Uma emboscada mudou tudo — sobreviveu, seus companheiros não.",
            "Agora rastreia não apenas presas, mas também aqueles que destroem o equilíbrio da floresta que chama de lar."
          ]
        ]
      },
      {
        nome: "Mago Errante",
        habilidades: [
          {
            titulo: "Escudo Arcano",
            desc: "O mago lança um escudo de força ao redor de um aliado. Esse aliado absorve os próximos {d}d4+2 pontos de dano antes que o escudo se dissipe.",
            mecanica: "Um aliado absorve 1d4+2 pontos de dano.",
            dados: true
          },
          {
            titulo: "Projétil Arcano",
            desc: "O mago dispara um raio de energia concentrada em um inimigo, causando 2d6 de dano arcano. O mago precisa ter linha de visão.",
            mecanica: "Um inimigo sofre 2d6 de dano arcano."
          }
        ],
        historia: [
          [
            "Estudou em três academias diferentes — foi expulso das duas primeiras por fazer perguntas demais. A terceira o expulsou por responder de mais.",
            "Viaja há anos buscando um feitiço que viu uma vez em sonho. Ainda não sabe se o sonho era profecia ou apenas ceia mal feita.",
            "Carrega um grimório cujas páginas mudam de texto conforme o humor do mago. Ele nega que isso seja possível."
          ],
          [
            "Aprendeu magia sozinho, com livros roubados de bibliotecas que não queriam seus clientesy. Isso explica por que sua magia funciona... de forma criativa.",
            "Cada feitiço que lança deixa uma cicatriz invisível em sua alma. Ele conta as cicatrizes quando não consegue dormir."
          ]
        ]
      },
      {
        nome: "Mercador",
        habilidades: [
          {
            titulo: "Bolsa de Recursos",
            desc: "O mercador saca de sua bolsa um item útil guardado para emergências: uma poção de cura, uma tocha mágica ou uma corda encantada (Mestre escolhe ou rola 1d3). O aliado o recebe imediatamente.",
            mecanica: "Um aliado recebe um item de emergência (poção, tocha mágica ou corda encantada)."
          },
          {
            titulo: "Distração Lucrativa",
            desc: "O mercador grita uma oferta ou lança moedas aos inimigos. Todos os inimigos em 6m têm Desvantagem nos ataques durante 1 rodada enquanto se distraem.",
            mecanica: "Inimigos em 6m têm Desvantagem em ataques por 1 rodada."
          }
        ],
        historia: [
          [
            "Percorreu mais estradas do que a maioria dos cavaleiros. Cada cidade é uma oportunidade; cada fronteira, uma negociação.",
            "Sabe o preço de tudo e o valor de quase nada. Está aprendendo a diferença.",
            "Sua bolsa sempre parece ter exatamente o que alguém precisa — e ele cobra exatamente o que a pessoa pode pagar."
          ],
          [
            "Foi ladrão antes de ser mercador. A diferença, ele diz, é que agora as pessoas sabem que estão sendo cobradas.",
            "Tem dívidas em quatro cidades e amigos em oito. O saldo, insiste ele, é positivo."
          ]
        ]
      },
      {
        nome: "Bardo",
        habilidades: [
          {
            titulo: "Canção de Bravura",
            desc: "O bardo entoa um verso poderoso. Todos os aliados que ouvirem ganham +2 em rolagens de ataque e resistência até o início do próximo turno do bardo.",
            mecanica: "Aliados em alcance auditivo ganham +2 em ataques e resistências por 1 rodada."
          },
          {
            titulo: "Zombaria Ensurdecedora",
            desc: "O bardo canta uma sátira humilhante sobre um inimigo. O alvo sofre Desvantagem em ataques e fica com raiva do bardo — focando ataques nele.",
            mecanica: "Um inimigo tem Desvantagem em ataques e prioriza o bardo como alvo."
          }
        ],
        historia: [
          [
            "Conhece uma canção para cada ocasião: festas, funerais, batalhas, e ao menos três para situações que prefere não detalhar.",
            "Sua voz é sua espada. Sua língua é seu escudo. O alaúde às costas é só para criar expectativa.",
            "Coleciona histórias como outros colecionam ouro. Diz que as histórias duram mais."
          ],
          [
            "Começou como bufão na corte de um lorde menor. Quando o lorde caiu, o bufão sobreviveu — porque ninguém mata o homem que conhece todos os segredos em forma de canção.",
            "Tem um poema inacabado que escreve há dez anos. Cada vez que termina, rasga. Ainda não encontrou o final certo."
          ]
        ]
      },
      {
        nome: "Assassino",
        habilidades: [
          {
            titulo: "Marca do Alvo",
            desc: "O assassino indica um ponto cego no inimigo marcado. O próximo ataque de qualquer aliado contra esse inimigo é automaticamente um Ataque Crítico.",
            mecanica: "O próximo ataque de um aliado contra o alvo é crítico automático."
          },
          {
            titulo: "Névoa de Fumaça",
            desc: "O assassino lança uma bomba de fumaça. Todos os combatentes na área de 4m ficam Cegos até o fim do próximo turno. O assassino já conhece a saída.",
            mecanica: "Todos em 4m ficam Cegos por 1 rodada (exceto o assassino)."
          }
        ],
        historia: [
          [
            "Não fala sobre o passado. Não porque seja vergonhoso, mas porque os detalhes ainda estão em processo judicial em algum lugar.",
            "Vive de contratos e princípios. Os contratos mudam. Os princípios, dizem os que o conhecem, são surpreendentemente firmes.",
            "Tem um código: nunca crianças, nunca inocentes, nunca por vingança pessoal. O terceiro item está sendo testado ultimamente."
          ],
          [
            "Foi treinado por uma guilda que não existe mais. Ele cuida de não existir com ela.",
            "Às vezes ajuda pessoas sem cobrar. Nunca explica por quê. Quem pergunta aprende a não perguntar."
          ]
        ]
      },
      {
        nome: "Curandeira",
        habilidades: [
          {
            titulo: "Curandeira de Campo",
            desc: "No calor da batalha, a curandeira aplica ervas e curativos em um aliado adjacente, restaurando 1d6 de Pontos de Vida. O esforço e o perigo do campo de batalha exigem seu tributo.",
            mecanica: "Um aliado recupera 1d6 PV."
          },
          {
            titulo: "Antídoto Improvisado",
            desc: "A curandeira remove um efeito de veneno ou sangramento ativo de um aliado, estancando o dano contínuo imediatamente.",
            mecanica: "Remove Veneno ou Sangramento de um aliado."
          }
        ],
        historia: [
          [
            "Aprendeu medicina em tempos de guerra, quando os livros não chegavam e os pacientes não esperavam.",
            "Suas mãos salvaram mais vidas do que ela consegue contar. Suas noites são contadas por aquelas que não conseguiu salvar.",
            "Acredita que toda ferida tem cura — inclusive as que não aparecem na pele."
          ],
          [
            "Foi recusada em três hospitais reais por ser de origem humilde. Fundou o próprio, numa carroça, percorrendo vilarejos sem médico.",
            "Carrega um diário com o nome de cada paciente que perdeu. As páginas estão quase no fim. Ela faz questão de não abrir um novo caderno."
          ]
        ]
      },
      {
        nome: "Cavaleiro",
        habilidades: [
          {
            titulo: "Proteção Jurada",
            desc: "O cavaleiro se posiciona entre um aliado e um inimigo, desviando para si o próximo ataque destinado a esse aliado. O cavaleiro sofre o dano no lugar.",
            mecanica: "O cavaleiro absorve o próximo golpe destinado a um aliado."
          },
          {
            titulo: "Investida Montada",
            desc: "O cavaleiro avança em carga, empurrando um inimigo médio ou menor para 3m de distância e derrubando-o (Caído). O inimigo não pode se levantar até o próximo turno.",
            mecanica: "Um inimigo médio ou menor é empurrado 3m e fica Caído por 1 rodada."
          }
        ],
        historia: [
          [
            "Serviu à coroa por quinze anos. Quando a coroa caiu, o cavaleiro continuou de pé, sem saber muito bem a quem servir.",
            "Sua honra é o único título que ninguém pode confiscar. Ele a guarda com mais cuidado do que a espada.",
            "Recita os votos da ordem todas as manhãs — não por fé, mas para não esquecer quem escolheu ser."
          ],
          [
            "Perdeu o cavalo numa batalha que não deveria ter acontecido. Ainda caminha com a armadura, porque não sabe ser outra coisa.",
            "É gentil com crianças e animais de uma forma que desconcerta quem o vê em combate."
          ]
        ]
      },
      {
        nome: "Patrulheiro",
        habilidades: [
          {
            titulo: "Aviso Antecipado",
            desc: "O patrulheiro detecta uma emboscada ou flanqueio inimigo antes que aconteça. O grupo inteiro age antes dos inimigos naquele turno e não pode ser surpreendido.",
            mecanica: "O grupo age primeiro e não é surpreendido naquele turno."
          },
          {
            titulo: "Retirada Coberta",
            desc: "O patrulheiro cobre a retirada de um aliado, realizando ataques de distração. Um aliado pode se mover até o dobro de sua velocidade sem provocar ataques de oportunidade.",
            mecanica: "Um aliado se move com velocidade dobrada sem provocar ataques de oportunidade."
          }
        ],
        historia: [
          [
            "Conhece cada trilha, cada pedra, cada armadilha possível em um raio de quarenta quilômetros da última vila que chamou de lar.",
            "Passa mais tempo sozinho do que na companhia de outros. Isso o tornaria solitário se não fosse tão bom nisso.",
            "Toda vez que diz 'está calmo demais', as pessoas que não o conhecem ignoram. As que conhecem correm."
          ],
          [
            "Protegeu fronteiras durante anos sem que ninguém soubesse seu nome. Preferia assim.",
            "Seus relatórios eram tão precisos que o comandante os decorava. Ele nunca escreveu nada fictício — o que tornava cada relatório de perigo real aterrorizante."
          ]
        ]
      },
      {
        nome: "Alquimista",
        habilidades: [
          {
            titulo: "Bomba Ácida",
            desc: "O alquimista arremessa um frasco de ácido em um inimigo, que sofre 2d4 de dano de ácido imediatamente e 1d4 adicional no início do próximo turno.",
            mecanica: "Um inimigo sofre 2d4 de dano de ácido + 1d4 no turno seguinte."
          },
          {
            titulo: "Elixir Acelerador",
            desc: "O alquimista entrega um elixir fumegante a um aliado. Esse aliado ganha uma ação adicional no turno atual.",
            mecanica: "Um aliado ganha 1 ação adicional neste turno."
          }
        ],
        historia: [
          [
            "Toda explosão em seu laboratório foi classificada como 'experimento bem-sucedido com resultados inesperados'.",
            "Fala com as substâncias que manipula como se elas tivessem personalidade. Após anos de experiência, suspeita que elas tenham.",
            "Tem uma lista de coisas que nunca mais vai misturar. A lista cresce a cada semana."
          ],
          [
            "Estudou alquimia para encontrar a cura para uma doença que perdeu um ente querido. Encontrou cinquenta outras curas no processo, e ainda não chegou lá.",
            "Dorme pouco, pensa rápido e sempre cheira levemente a enxofre. Considera isso uma identidade."
          ]
        ]
      },
      {
        nome: "Ladrão",
        habilidades: [
          {
            titulo: "Toque de Mestre",
            desc: "O ladrão furta silenciosamente um item do inimigo: uma poção, uma chave mágica ou uma arma secundária. O item fica disponível para uso imediato por qualquer aliado.",
            mecanica: "O ladrão rouba um item do inimigo para uso dos aliados."
          },
          {
            titulo: "Golpe Baixo",
            desc: "O ladrão ataca de surpresa em um ponto vulnerável, fazendo o inimigo soltar o que segurava e ficando Atordoado por 1 rodada.",
            mecanica: "Um inimigo fica Atordoado por 1 rodada e solta o que carregava."
          }
        ],
        historia: [
          [
            "Aprendeu a contar antes de aprender a ler — e o que aprendeu a contar foram as moedas dos outros.",
            "Tem um código de honra que poucos acreditam existir. Nunca rouba de quem realmente não tem nada. O problema é definir o limite.",
            "Diz que parou de roubar. Diz isso desde os doze anos."
          ],
          [
            "Cresceu nas ruas de uma cidade grande o suficiente para ter esquinas que nunca viram luz do sol.",
            "Já devolveu coisas roubadas três vezes na vida. Cada uma dessas vezes mudou o rumo de uma história — a sua, inclusive."
          ]
        ]
      },
      {
        nome: "Guardião das Ruínas",
        habilidades: [
          {
            titulo: "Conhecimento Antigo",
            desc: "O guardião revela uma fraqueza oculta do inimigo baseada em séculos de lore. O grupo inteiro trata aquele tipo de inimigo como se tivesse Vantagem em todos os ataques por 2 rodadas.",
            mecanica: "O grupo tem Vantagem em ataques contra aquele tipo de criatura por 2 rodadas."
          },
          {
            titulo: "Barreira de Escombros",
            desc: "O guardião derruba estruturas estrategicamente, criando uma barreira de cobertura. Um aliado ganha Cobertura Total por 1 rodada.",
            mecanica: "Um aliado ganha Cobertura Total (inimigos têm Desvantagem em ataques contra ele) por 1 rodada."
          }
        ],
        historia: [
          [
            "Vive entre pedras que contam histórias mais longas do que qualquer livro. Aprendeu a ouvi-las.",
            "Guarda segredos de civilizações que ninguém mais lembra. Alguns desses segredos, ele decidiu, não merecem ser lembrados.",
            "Parece mais confortável com o silêncio milenar das ruínas do que com a agitação dos vivos."
          ],
          [
            "Foi arqueólogo antes de se tornar guardião. A diferença, descobriu, é quem você está protegendo: o passado ou o futuro.",
            "Tem um diário com mapas de lugares que não existem mais. Considera isso um dever de memória."
          ]
        ]
      },
      {
        nome: "Sacerdote do Fogo",
        habilidades: [
          {
            titulo: "Bênção das Chamas",
            desc: "O sacerdote invoca o fogo sagrado em uma arma de um aliado. Os ataques desse aliado causam +1d6 de dano de fogo por 2 rodadas.",
            mecanica: "Uma arma aliada causa +1d6 de dano de fogo por 2 rodadas."
          },
          {
            titulo: "Purificação Ardente",
            desc: "O sacerdote remove um efeito de maldição, veneno ou necromancia de um aliado através do fogo purificador. O aliado sofre 1d4 de dano de fogo, mas fica livre do efeito.",
            mecanica: "Remove maldição/veneno/necromancia de um aliado (aliado sofre 1d4 de dano de fogo)."
          }
        ],
        historia: [
          [
            "Cresceu em um templo onde o fogo nunca se apaga. Saiu quando percebeu que alguns usavam as chamas para queimar em vez de iluminar.",
            "Acredita que o fogo é a única honestidade do mundo: consome o que é podre, aquece o que é vivo.",
            "Cada cicatriz de queimadura que carrega foi uma escolha. Ainda não se arrepende de nenhuma."
          ],
          [
            "Expulso da ordem por questionar os dízimos. Ainda ora ao mesmo deus — apenas sem os intermediários.",
            "Quando ora, o fogo ao redor dele queima diferente. Ele diz que não é magia. As pessoas ao redor discordam silenciosamente."
          ]
        ]
      },
      {
        nome: "Monge da Névoa",
        habilidades: [
          {
            titulo: "Mãos da Serenidade",
            desc: "O monge canaliza energia interna em um toque, restaurando 1d8 de Pontos de Vida e removendo o status Atordoado ou Amedrontado de um aliado.",
            mecanica: "Um aliado recupera 1d8 PV e tem Atordoado ou Amedrontado removido."
          },
          {
            titulo: "Passo da Névoa",
            desc: "O monge guia um aliado através de um movimento fluido e imprevisto. Esse aliado pode se teleportar para qualquer espaço livre em 6m como ação bônus.",
            mecanica: "Um aliado se teleporta para um espaço livre em até 6m (ação bônus)."
          }
        ],
        historia: [
          [
            "Passou quinze anos em silêncio num monastério na montanha. As duas palavras que disse ao sair foram mais impactantes do que todos os sermões que ouviu.",
            "Não luta — redireciona. Não resiste — flui. Isso desconcerta muito mais os inimigos do que qualquer espada.",
            "Tem uma calma que as pessoas ao redor começam a absorver sem perceber."
          ],
          [
            "Deixou o monastério após uma visão que não compartilha com ninguém. A urgência no olhar tranquilo dele é a coisa mais perturbadora que seus companheiros já viram.",
            "Dorme sentado, acorda antes do amanhecer, e nunca reclama de nada. Isso, dizem, é a parte mais assustadora."
          ]
        ]
      },
      {
        nome: "Arqueiro Sombrio",
        habilidades: [
          {
            titulo: "Flecha Paralisante",
            desc: "O arqueiro dispara uma flecha especial que atinge um ponto nervoso do inimigo. O alvo fica Paralisado por 1 rodada (sem teste de resistência se o ataque acertar).",
            mecanica: "Um inimigo fica Paralisado por 1 rodada (se o ataque acertar, sem resistência)."
          },
          {
            titulo: "Cobertura de Fogo",
            desc: "O arqueiro dispara uma rajada de flechas, forçando todos os inimigos em uma área de 6m a se abaixar. Inimigos nessa área têm Desvantagem em ataques por 1 rodada.",
            mecanica: "Todos os inimigos em 6m têm Desvantagem em ataques por 1 rodada."
          }
        ],
        historia: [
          [
            "Aprendeu a atirar no escuro antes de aprender a atirar com luz. Diz que a segunda habilidade é superestimada.",
            "Cada flecha é marcada com um símbolo diferente. Nunca explicou o sistema. Nunca errou o alvo errado.",
            "Fala pouco, observa muito, e sempre sabe exatamente de onde o perigo virá antes que ele chegue."
          ],
          [
            "Foi caçador de recompensas antes de decidir que havia alvos mais merecedores do que os que colocavam na lista.",
            "O arco que usa pertenceu a outro arqueiro sombrio. Não fala como veio parar em suas mãos."
          ]
        ]
      },
      {
        nome: "Domador de Feras",
        habilidades: [
          {
            titulo: "Companheiro em Combate",
            desc: "O domador ordena a sua besta de estimação que ataque um inimigo. A criatura causa 1d8+2 de dano e tem chance de derrubar o alvo (Caído, em um 5 ou 6 no d6).",
            mecanica: "Uma besta aliada ataca causando 1d8+2 de dano e possivelmente Derrubando o alvo."
          },
          {
            titulo: "Rugido Aterrorizante",
            desc: "O domador ordena que sua besta solte um rugido ensurdecedor. Todos os inimigos em 9m devem fazer um Teste de Vontade DT 13 ou ficam Amedrontados por 1 rodada.",
            mecanica: "Inimigos em 9m fazem Teste de Vontade DT 13 ou ficam Amedrontados por 1 rodada."
          }
        ],
        historia: [
          [
            "Nunca teve medo de animais. Sempre teve medo de pessoas. Com os anos, aprendeu que as duas espécies têm mais em comum do que gostaria.",
            "Sua besta o seguiu depois que ele a libertou de uma armadilha. Nenhum dos dois entende muito bem a relação, mas os dois comparecem.",
            "Trata animais com mais paciência e gentileza do que a maioria das pessoas trata crianças."
          ],
          [
            "Trabalhou em circos, zoológicos e expedições de caça. Saiu de todos depois de discordar com os chefes sobre o que constitui 'respeito' por uma criatura viva.",
            "Sua besta o salvou de uma situação impossível três vezes. Ele ainda não sabe como retribuir. A besta parece não se importar."
          ]
        ]
      },
      {
        nome: "Navegador de Tempestades",
        habilidades: [
          {
            titulo: "Leitura dos Ventos",
            desc: "O navegador interpreta correntes de ar e movimento, permitindo que um aliado realize um movimento adicional de até 6m sem gastar ação, como se flutuasse pela corrente.",
            mecanica: "Um aliado se move até 6m adicionais sem gastar ação."
          },
          {
            titulo: "Tempestade Concentrada",
            desc: "O navegador usa conhecimento dos padrões climáticos para invocar uma rajada de vento localizada, empurrando um inimigo até 4m e derrubando-o (Caído).",
            mecanica: "Um inimigo é empurrado 4m e fica Caído."
          }
        ],
        historia: [
          [
            "Passou metade da vida no mar e a outra metade desejando estar nele. A terra firme ainda parece estranha sob seus pés.",
            "Lê o tempo como outros leem rostos: com cuidado, com experiência, e com a consciência de que ambos podem mentir.",
            "Sobreviveu a sete tempestades que deveriam tê-lo matado. Parou de contar depois da sétima porque o número começou a parecer petulante."
          ],
          [
            "Perdeu o navio numa batalha naval que não devia ter travado. Navega em terra firme desde então, esperando a chance de ter um casco entre ele e o horizonte novamente.",
            "Conhece as estrelas pelo nome e conversa com elas quando ninguém está olhando. O céu, ao contrário do mar, sempre responde."
          ]
        ]
      },
      {
        nome: "Criador de Golems",
        habilidades: [
          {
            titulo: "Golem de Bolso",
            desc: "O criador ativa um golem miniaturizado que carregava consigo. O golem ataca um inimigo (2d6 de dano de concussão) e depois desmorona, seu propósito cumprido.",
            mecanica: "Um golem descartável ataca causando 2d6 de dano de concussão (uso único)."
          },
          {
            titulo: "Mão Mecânica",
            desc: "O criador usa um braço mecânico alongável para agarrar um inimigo a até 6m de distância, mantendo-o Imobilizado por 1 rodada enquanto concentra.",
            mecanica: "Um inimigo em até 6m fica Imobilizado por 1 rodada (requer concentração)."
          }
        ],
        historia: [
          [
            "Acredita que tudo no mundo pode ser melhorado com engrenagem suficiente. A vida lhe prova o contrário com regularidade desconcertante.",
            "Seus golems têm personalidades distintas. Ele nega categoricamente que isso tenha a ver com os materiais que usa para construí-los.",
            "Fala mais facilmente com construtos do que com pessoas. Diz que é porque construtos não interrompem."
          ],
          [
            "Perdeu três dedos em experimentos. Substituiu dois por versões mecânicas melhoradas e deixou o terceiro ausente como lembrete.",
            "Sonha em criar um golem que possa sonhar. Ainda não sabe se isso seria maravilhoso ou terrível."
      }
    ];
    
    // Novas ocupações com no mínimo 3 habilidades úteis em combate
    OCUPACOES.push(
      {
        nome: "Arcanista",
        habilidades: [
          {
            titulo: "Distorção Espacial",
            desc: "O arcanista altera o tecido do espaço, teleportando um aliado em perigo para até 9m de distância.",
            mecanica: "Teleporta um aliado em até 9m."
          },
          {
            titulo: "Escudo de Mana",
            desc: "O arcanista canaliza sua energia para proteger um aliado. O alvo ganha resistência a todo dano até o início do próximo turno do arcanista.",
            mecanica: "Um aliado ganha resistência a todo dano por 1 rodada."
          },
          {
            titulo: "Raio Arcano Concentrado",
            desc: "Dispara energia pura que atinge um inimigo com impacto violento, causando 2d8 de dano arcano e empurrando-o 3m para trás.",
            mecanica: "Causa 2d8 de dano arcano e empurra o alvo 3m."
          }
        ],
        historia: [
          [
            "Estuda o fluxo invisível da magia há décadas. Considera o mundo físico apenas uma ilusão grosseira em comparação à beleza dos padrões arcanos.",
            "Já desvendou segredos que enlouqueceriam mentes menores. O custo foi apenas uma leve insônia permanente e a incapacidade de tolerar ignorância.",
            "Prefere a companhia de livros à de pessoas. Livros raramente fazem perguntas estúpidas ou atrapalham a concentração."
          ],
          [
            "Nasceu com a habilidade de ver as linhas de mana do mundo. Isso o tornou um prodígio, mas também um alvo para aqueles que desejam controlar tal poder.",
            "Guarda um pequeno orbe brilhante em seu bolso. Afirma que é o núcleo de uma estrela morta. Ninguém ousou contestar."
          ]
        ]
      },
      {
        nome: "Ladino",
        habilidades: [
          {
            titulo: "Ponto Cego",
            desc: "O ladino distrai um inimigo com um movimento rápido. O próximo ataque contra esse inimigo tem Vantagem garantida.",
            mecanica: "Próximo ataque contra o alvo tem Vantagem."
          },
          {
            titulo: "Armadilha de Tropeço",
            desc: "Usando uma corda ou rasteira rápida, o ladino derruba um inimigo. O alvo fica Caído e perde metade de seu deslocamento no próximo turno.",
            mecanica: "Inimigo fica Caído e com metade do deslocamento."
          },
          {
            titulo: "Arremesso Preciso",
            desc: "Atira uma adaga exatamente na articulação do inimigo, causando 1d6 de dano e reduzindo o deslocamento dele à metade por 1 rodada.",
            mecanica: "Causa 1d6 de dano e reduz o deslocamento do alvo à metade."
          }
        ],
        historia: [
          [
            "Sabe que a melhor maneira de vencer uma luta é garantir que o oponente não saiba que está lutando até ser tarde demais.",
            "Possui um conjunto de ferramentas de arrombamento herdado de seu mentor. Considera cadeados apenas sugestões temporárias.",
            "Acredita firmemente na redistribuição de riquezas, começando pela redistribuição das riquezas dos outros para os seus próprios bolsos."
          ],
          [
            "Cresceu nas sombras de uma cidade grande. A escuridão sempre foi mais acolhedora do que a luz implacável do sol.",
            "Tem uma coleção de moedas de diferentes reinos. Cada uma representa um trabalho concluído com sucesso e uma fuga por pouco."
          ]
        ]
      },
      {
        nome: "Cavaleiro Real",
        habilidades: [
          {
            titulo: "Postura Inabalável",
            desc: "O cavaleiro assume uma base defensiva perfeita. Ele e todos os aliados a até 3m ganham +2 na Classe de Armadura por 1 rodada.",
            mecanica: "Aliados em 3m ganham +2 CA por 1 rodada."
          },
          {
            titulo: "Golpe de Punição",
            desc: "O cavaleiro concentra sua honra em um ataque devastador, causando 1d8 de dano extra e forçando o inimigo a focar seus ataques nele.",
            mecanica: "Causa 1d8 dano extra e atrai o foco do inimigo."
          },
          {
            titulo: "Brado de Inspiração",
            desc: "Solta um grito de guerra que reanima um aliado caído ou prestes a cair, concedendo-lhe 1d6 PV temporários imediatamente.",
            mecanica: "Um aliado recebe 1d6 PV temporários."
          }
        ],
        historia: [
          [
            "Treinado desde a infância nas artes da guerra e da cortesia. Acha que a segunda é frequentemente mais letal que a primeira.",
            "Sua armadura brilha mesmo após semanas na estrada. Há rumores de que ele tem um escudeiro invisível, ou apenas uma obsessão doentia por polimento.",
            "Acredita que a verdadeira força de um reino reside na retidão de seus defensores."
          ],
          [
            "Fez um juramento de proteger os fracos. Descobriu rapidamente que os fracos muitas vezes estão em situações incrivelmente perigosas.",
            "Carrega o estandarte de uma casa nobre caída. Jura que, enquanto viver, o nome deles não será esquecido."
          ]
        ]
      },
      {
        nome: "Pugilista",
        habilidades: [
          {
            titulo: "Gancho Desnorteante",
            desc: "Atinge o queixo do inimigo com força bruta, causando 1d8 de dano. O inimigo fica Desorientado, tendo Desvantagem em seu próximo ataque.",
            mecanica: "Causa 1d8 de dano; inimigo tem Desvantagem no próximo ataque."
          },
          {
            titulo: "Esquiva Perfeita",
            desc: "Lê o movimento do oponente, desviando do ataque e contra-atacando instantaneamente com um soco rápido que causa 1d6 de dano.",
            mecanica: "Absorve/esquiva de um ataque e causa 1d6 de dano de contra-ataque."
          },
          {
            titulo: "Arremesso Corporal",
            desc: "Agarra um inimigo de tamanho médio ou menor e o usa como projétil contra outro inimigo próximo, causando 1d6 de dano a ambos.",
            mecanica: "Arremessa inimigo em outro, causando 1d6 a ambos."
          }
        ],
        historia: [
          [
            "Nunca precisou de uma lâmina. Suas mãos calejadas quebraram mais espadas do que a maioria dos guerreiros sequer desembainhou.",
            "Lutou em arenas clandestinas por anos. Cada cicatriz em seu corpo tem um preço que foi pago em sangue e ouro.",
            "Fala pouco. Prefere que seus punhos comuniquem suas objeções."
          ],
          [
            "Aprendeu a lutar nas ruas, onde as regras de combate são ditadas por quem sobrevive no fim da noite.",
            "Geralmente está envolto em ataduras manchadas. Diz que é para proteger as mãos, mas todos sabem que é para esconder as marcas de suas vitórias."
          ]
        ]
      },
      {
        nome: "Bardo de Batalha",
        habilidades: [
          {
            titulo: "Acorde Dissonante",
            desc: "Toca uma nota mágica terrivelmente aguda. Inimigos a até 4m sofrem 1d6 de dano sônico e ficam surdos até o fim da rodada.",
            mecanica: "Inimigos em 4m sofrem 1d6 de dano sônico e surdez."
          },
          {
            titulo: "Ritmo Frenético",
            desc: "Acelera a batida de sua música. O grupo inteiro ganha +3m de deslocamento e não pode ser Imobilizado por 1 rodada.",
            mecanica: "Grupo ganha +3m deslocamento e imunidade a Imobilização por 1 rodada."
          },
          {
            titulo: "Melodia Revigorante",
            desc: "A melodia calma e constante restaura as energias. Um aliado pode gastar um Dado de Vida imediatamente para se curar como ação livre.",
            mecanica: "Aliado pode gastar um Dado de Vida livremente."
          }
        ],
        historia: [
          [
            "Acha que a maioria das batalhas carece de uma trilha sonora adequada. Está aqui para corrigir esse erro terrível.",
            "Seu alaúde já foi usado como clava em mais de uma ocasião. Acredita que a música deve ser sentida fisicamente.",
            "Viaja com os combatentes para compor epopeias precisas. A verdade é melhor que a ficção, especialmente quando rima."
          ],
          [
            "Foi expulso da escola de música por introduzir magias de ataque em sonatas clássicas. O professor não sobreviveu ao segundo movimento.",
            "Costuma dedilhar as cordas do instrumento antes mesmo da luta começar, prevendo o andamento do combate."
          ]
        ]
      },
      {
        nome: "Sacerdote",
        habilidades: [
          {
            titulo: "Cura Divina",
            desc: "Canaliza a energia de sua fé para fechar as feridas de um aliado, restaurando 2d6 de Pontos de Vida.",
            mecanica: "Restaura 2d6 PV de um aliado."
          },
          {
            titulo: "Santuário Menor",
            desc: "Cria uma aura protetora de 3m ao seu redor. Inimigos têm Desvantagem para atacar qualquer aliado dentro dessa aura.",
            mecanica: "Aura de 3m; ataques inimigos contra aliados na aura têm Desvantagem."
          },
          {
            titulo: "Julgamento Sagrado",
            desc: "Invoca uma luz punitiva dos céus contra um inimigo blasfemo, causando 2d6 de dano radiante instantâneo.",
            mecanica: "Causa 2d6 de dano radiante a um inimigo."
          }
        ],
        historia: [
          [
            "Serve a uma divindade de luz e cura, mas entende que às vezes a luz precisa queimar para purificar.",
            "Caminha pelo campo de batalha com a mesma serenidade que caminharia nos jardins do templo. A fé é sua verdadeira armadura.",
            "Tem uma palavra de conforto para os feridos e uma oração de misericórdia para os caídos. Para os inimigos, oferece apenas julgamento."
          ],
          [
            "Deixou o conforto do clero para levar a palavra aos cantos mais sombrios do mundo. Descobriu que as sombras são densas e famintas.",
            "Suas vestes brancas raramente permanecem assim, manchadas com o sangue daqueles que tentou salvar."
          ]
        ]
      },
      {
        nome: "Xamã",
        habilidades: [
          {
            titulo: "Totem de Proteção",
            desc: "Invoca um espírito protetor através de um pequeno totem. Aliados a até 6m ganham +1 na CA e Vantagem em resistências mágicas.",
            mecanica: "Aliados em 6m ganham +1 CA e Vantagem em resistências mágicas."
          },
          {
            titulo: "Vínculo Espiritual",
            desc: "O xamã se liga espiritualmente a um aliado. Metade do dano que esse aliado sofreria é transferido para o xamã, mas é reduzido à metade novamente.",
            mecanica: "Transfere parte do dano de um aliado para si com redução."
          },
          {
            titulo: "Fúria dos Elementos",
            desc: "Chama um raio elétrico ou rajada de fogo que atinge até dois inimigos próximos, causando 1d8 de dano a cada um.",
            mecanica: "Causa 1d8 de dano elementar a dois inimigos."
          }
        ],
        historia: [
          [
            "Ouve as vozes dos ancestrais na brisa e nas pedras. Eles frequentemente dão conselhos não solicitados e criticam suas escolhas de vida.",
            "Sua magia não vem de livros ou divindades, mas da terra sob seus pés e do sangue em suas veias.",
            "Veste peles e ossos que contam histórias das caçadas antigas. Os espíritos dessas criaturas ainda o acompanham."
          ],
          [
            "A tribo foi destruída, mas os espíritos de seu povo caminham com ele. Ele busca um lugar onde possam finalmente descansar.",
            "Tem o hábito de pedir permissão às árvores antes de colher seus frutos ou quebrar seus galhos."
          ]
        ]
      },
      {
        nome: "Caçador",
        habilidades: [
          {
            titulo: "Marca da Presa",
            desc: "O caçador estuda e marca o inimigo. Todos os ataques aliados contra esse inimigo recebem +2 de dano até ele cair.",
            mecanica: "Aliados causam +2 de dano contra o alvo marcado."
          },
          {
            titulo: "Tiro Penetrante",
            desc: "Dispara um projétil com força extrema que atravessa o inimigo, causando 1d10 de dano e atingindo outro alvo diretamente atrás dele (1d6 de dano).",
            mecanica: "Causa 1d10 no alvo principal e 1d6 no inimigo atrás."
          },
          {
            titulo: "Esconderijo Natural",
            desc: "Utiliza elementos do ambiente para ocultar a si e a um aliado, tornando-os alvos impossíveis de focar (Invisibilidade Menor) por 1 rodada.",
            mecanica: "Oculta a si e a um aliado por 1 rodada."
          }
        ],
        historia: [
          [
            "Sobrevivente nato. Sabe onde encontrar água no deserto e comida na tundra. Em combate, a cidade é apenas outro tipo de selva.",
            "Seu arco é uma extensão de seu braço. Suas flechas são forjadas com pontas que garantem que a presa não sofra mais do que o necessário.",
            "Não confia na civilização. Paredes de pedra são armadilhas; o céu aberto é a única liberdade verdadeira."
          ],
          [
            "Há anos persegue uma fera mítica que lhe tirou a visão de um olho. A cicatriz lateja sempre que o perigo se aproxima.",
            "Aprendeu a ler o vento e os rastros não por hobby, mas porque não dominar essas habilidades significava a morte."
          ]
        ]
      },
      {
        nome: "Bruxo",
        habilidades: [
          {
            titulo: "Toque Sombrio",
            desc: "Canaliza energia necrótica através de um toque, causando 1d8 de dano a um inimigo e curando um aliado na metade desse valor.",
            mecanica: "Causa 1d8 dano necrótico e cura um aliado na metade."
          },
          {
            titulo: "Maldição Debilitante",
            desc: "O bruxo profere palavras sombrias que enfraquecem as juntas do inimigo, concedendo-lhe -2 em suas jogadas de ataque por 2 rodadas.",
            mecanica: "Alvo recebe -2 nos ataques por 2 rodadas."
          },
          {
            titulo: "Passo das Sombras",
            desc: "Utiliza as sombras como portal. O bruxo e um aliado trocam de posição instantaneamente para confundir ou salvar o parceiro.",
            mecanica: "O bruxo troca de posição instantaneamente com um aliado."
          }
        ],
        historia: [
          [
            "Fez um pacto com uma entidade do vazio que ocasionalmente sussurra coisas perturbadoras em sua mente. Ele aprendeu a ignorá-la na maior parte do tempo.",
            "Sua magia tem cheiro de ozônio e cinzas frias. Onde ele pisa, a grama escurece sutilmente.",
            "Vê os medos das pessoas refletidos em seus olhos. Acha essa informação incrivelmente útil e ocasionalmente deprimente."
          ],
          [
            "Estudou os tomos proibidos que outros magos trancaram. Argumenta que o conhecimento não tem moralidade, apenas aplicação.",
            "Seus olhos têm um brilho antinatural quando está irritado. A maioria das pessoas prefere não deixá-lo irritado."
          ]
        ]
      },
      {
        nome: "Nobre",
        habilidades: [
          {
            titulo: "Ordem de Ataque",
            desc: "Com autoridade inquestionável, o nobre comanda um aliado a realizar um ataque imediato contra um alvo, fora do turno desse aliado.",
            mecanica: "Um aliado realiza um ataque imediato extra."
          },
          {
            titulo: "Presença Majestosa",
            desc: "A postura superior do nobre faz os inimigos em 6m hesitarem; eles recebem -2 em suas jogadas de ataque neste turno.",
            mecanica: "Inimigos em 6m têm -2 nos ataques neste turno."
          },
          {
            titulo: "Suborno de Emergência",
            desc: "Joga um punhado de moedas de ouro ou joias brilhantes no chão. Inimigos menos inteligentes ou gananciosos perdem seu próximo turno recolhendo.",
            mecanica: "Inimigos perdem o próximo turno por ganância/distração."
          }
        ],
        historia: [
          [
            "Nasceu em lençóis de seda e foi criado com talheres de prata. A sujeira e o sangue do mundo real ainda lhe causam um leve nojo, mas ele se adapta.",
            "Sua linhagem é antiga e respeitada. Seu nome abre portas em palácios, mas nas estradas atrai ladrões.",
            "Garante aos outros que o combate é apenas 'política executada com ferramentas menos refinadas'."
          ],
          [
            "Foi traído e deserdado por sua família. Agora usa suas habilidades de liderança nas trincheiras, buscando poder para recuperar o que é seu.",
            "Sempre veste roupas impecáveis, mesmo no meio de uma masmorra imunda. Aparência é metade da batalha."
          ]
        ]
      },
      {
        nome: "Bárbaro",
        habilidades: [
          {
            titulo: "Grito Feroz",
            desc: "Um rugido primitivo que gela o sangue. Todos os inimigos em 9m ficam Amedrontados e não podem se aproximar do bárbaro por 1 rodada.",
            mecanica: "Inimigos em 9m ficam Amedrontados por 1 rodada."
          },
          {
            titulo: "Golpe Devastador",
            desc: "Abre mão da própria defesa para aplicar um ataque furioso, causando 2d12 de dano. O bárbaro sofre Vantagem nos ataques contra ele na próxima rodada.",
            mecanica: "Causa 2d12 de dano, mas fica vulnerável no próximo turno."
          },
          {
            titulo: "Resistência Brutal",
            desc: "Ignora a dor através pura teimosia. Quando sofreria dano que o deixaria inconsciente, o bárbaro reduz o dano à metade e se mantém de pé.",
            mecanica: "Reduz à metade dano letal e se mantém lutando."
          }
        ],
        historia: [
          [
            "A raiva não é uma emoção, é uma ferramenta, um escudo, e um combustível inesgotável.",
            "Cresceu nas montanhas geladas, onde a fraqueza significa a morte por congelamento ou devorado. Nunca foi fraco.",
            "Acha a civilização complicada demais. Resolver problemas com uma grande machadada é elegante em sua simplicidade."
          ],
          [
            "Seu corpo é um mapa de cicatrizes de feras monstruosas. Ele tem orgulho de cada uma delas, lembrando o gosto de cada criatura.",
            "Só confia em pessoas que conseguem acompanhar seu ritmo em uma bebedeira. A lista é incrivelmente curta."
          ]
        ]
      },
      {
        nome: "Guerreiro",
        habilidades: [
          {
            titulo: "Golpe de Fenda",
            desc: "Um movimento amplo e poderoso que atinge até dois inimigos adjacentes ao guerreiro, causando 1d8 de dano a cada um.",
            mecanica: "Atinge dois inimigos adjacentes causando 1d8 de dano a ambos."
          },
          {
            titulo: "Defesa Total",
            desc: "O guerreiro assume a linha de frente, forçando inimigos próximos a focarem nele e ganhando +4 na CA contra esses ataques por 1 rodada.",
            mecanica: "Provoca os inimigos e ganha +4 CA por 1 rodada."
          },
          {
            titulo: "Desarmar",
            desc: "Com um golpe técnico e preciso, o guerreiro atinge as mãos do oponente, desarmando-o e jogando sua arma a 3m de distância.",
            mecanica: "Inimigo deixa cair a arma, lançada a 3m."
          }
        ],
        historia: [
          [
            "Soldado veterano de inúmeras campanhas. Conhece o cheiro do medo e da lama melhor do que o cheiro de pão fresco.",
            "Sua espada é uma extensão de seu corpo, mantida sempre afiada. A disciplina militar é a única religião que ele realmente segue.",
            "Não luta por glória ou ouro, luta porque é a única coisa que sabe fazer tão bem que se torna arte."
          ],
          [
            "Serviu a senhores que não mereciam seu sacrifício. Agora, aluga sua lâmina para aqueles que a causa ele julga justa.",
            "Sempre verifica suas ferramentas de combate três vezes antes de dormir. A paranoia o manteve vivo."
          ]
        ]
      },
      {
        nome: "Cientista",
        habilidades: [
          {
            titulo: "Granada Biológica",
            desc: "Lança um frasco experimental que explode em uma nuvem tóxica. Inimigos em uma área de 3m sofrem 1d6 de dano venenoso e ficam envenenados.",
            mecanica: "Dano em área (1d6 venenoso) e envenena os inimigos."
          },
          {
            titulo: "Estimulante Experimental",
            desc: "Injeta rapidamente um soro volátil em um aliado. Ele ganha +3m de movimento e cura 1d8 PV, mas sofre 1 de dano colateral no fim do turno.",
            mecanica: "Cura 1d8, dá +3m movimento, aliado sofre 1 de dano no final."
          },
          {
            titulo: "Raio Paralisador",
            desc: "Dispara uma engenhoca portátil que emite um pulso magnético, imobilizando o alvo por 1 rodada se suas pernas forem afetadas.",
            mecanica: "Imobiliza um alvo por 1 rodada."
          }
        ],
        historia: [
          [
            "A ciência não tem limites, apenas orçamentos limitados e excessiva preocupação ética dos outros.",
            "Seus equipamentos frequentemente faíscam e zumbem perigosamente. Assegura a todos que 'está tudo perfeitamente calculado'.",
            "Acredita que magia é apenas ciência que ainda não foi explicada em um quadro negro."
          ],
          [
            "Foi expulso da academia de inventores por suas teorias sobre fusão biológica. Acha que o mundo está atrasado.",
            "Sempre carrega um caderno de anotações. Observa as mortes em combate para 'coleta de dados'."
          ]
        ]
      },
      {
        nome: "Padeiro",
        habilidades: [
          {
            titulo: "Rolo de Massa Giratório",
            desc: "Brandindo o rolo de amassar com destreza, o padeiro atinge a cabeça do inimigo causando 1d6 de dano e o desorientando (Desvantagem no próximo ataque).",
            mecanica: "Causa 1d6 de dano e dá Desvantagem ao alvo no próximo ataque."
          },
          {
            titulo: "Farinha nos Olhos",
            desc: "Lança rapidamente um punhado de farinha finamente moída nos olhos do inimigo, deixando-o Cego por 1 rodada.",
            mecanica: "O inimigo fica Cego por 1 rodada."
          },
          {
            titulo: "Pão Escudo Anão",
            desc: "Saca um pão anão endurecido de meses de idade e o usa para aparar o ataque letal destinado a um aliado, anulando o dano completamente.",
            mecanica: "Anula o dano do próximo ataque contra um aliado adjacente."
          }
        ],
        historia: [
          [
            "Passou a vida acordando de madrugada para sovar massa. Seus braços são fortes como os de um ferreiro. Pães pesados não se sozinham.",
            "Um dia, bandidos entraram em sua padaria para roubar os lucros. Eles saíram voando pelas janelas. Desde então, ele é muito respeitado.",
            "Acredita que todos os problemas do mundo poderiam ser resolvidos com um bom croissant amanteigado."
          ],
          [
            "A vida aventuresca o encontrou porque precisava de ingredientes raros que as rotas comerciais normais não entregavam.",
            "Carrega cheiro de levedura e canela constantes, não importa há quanto tempo esteja na estrada."
          ]
        ]
      },
      {
        nome: "Cozinheiro",
        habilidades: [
          {
            titulo: "Caldo Fervente",
            desc: "Arremessa um frasco de sopa fervente no rosto do inimigo, causando 1d6 de dano de fogo e distraindo-o severamente.",
            mecanica: "Causa 1d6 de dano de fogo e distrai o alvo."
          },
          {
            titulo: "Faca de Açougueiro",
            desc: "Aplica técnicas de corte de carnes em combate. Realiza um golpe rápido que causa 1d8 de dano cortante e inflige Sangramento.",
            mecanica: "Causa 1d8 cortante e Sangramento no alvo."
          },
          {
            titulo: "Refeição Revigorante Rápida",
            desc: "Entrega uma pequena iguaria perfeita para combate. O aliado come como ação bônus, curando 1d4 PV e ganhando Vantagem em seu próximo ataque.",
            mecanica: "Aliado cura 1d4 PV e ganha Vantagem no ataque."
          }
        ],
        historia: [
          [
            "A cozinha de um restaurante lotado é uma zona de guerra. Cortar vegetais rapidamente lhe deu os reflexos de um espadachim.",
            "Sua maior motivação para sobreviver é não deixar que os paladares medíocres dominem o mundo.",
            "Nunca desperdiça nada. Avalia monstros mortos murmurando sobre 'tempero certo' e 'textura macia'."
          ],
          [
            "Costumava servir à realeza, mas foi banido quando criticou a falta de paladar do rei em público. Acha que valeu a pena.",
            "Carrega um conjunto de facas de chef que cuida melhor do que alguns pais cuidam dos filhos."
          ]
        ]
      },
      {
        nome: "Vendedor",
        habilidades: [
          {
            titulo: "Oferta Imperdível",
            desc: "Distrai um inimigo acenando um item aparentemente mágico. O inimigo fica hipnotizado e perde sua ação bônus na próxima rodada.",
            mecanica: "Inimigo perde sua ação bônus."
          },
          {
            titulo: "Pechincha Agressiva",
            desc: "Ataca o ego e as posses do alvo, xingando sua armadura e técnica. O abalo psicológico reduz a CA do inimigo em 2 por 1 rodada.",
            mecanica: "Reduz a CA do inimigo em 2 por 1 rodada."
          },
          {
            titulo: "Amostra Grátis Explosiva",
            desc: "Joga alegremente uma pequena sacola que reage com o ar. Causa 2d4 de dano em área, sem pedir devolução.",
            mecanica: "Causa 2d4 de dano em área (3m)."
          }
        ],
        historia: [
          [
            "Consegue vender areia no deserto e água no oceano. A oratória não é apenas um talento, é uma arma afiada e mortal.",
            "O campo de batalha é apenas um mercado com negociações mais agressivas. E ele nunca perde uma negociação.",
            "Sorri incansavelmente. O sorriso pode ser caloroso ou aterrorizante, dependendo de que lado do balcão o oponente está."
          ],
          [
            "Perdeu tudo em um naufrágio. Aventura-se porque tesouros de masmorras têm uma margem de lucro de 100%.",
            "Mede os inimigos avaliando quanto vale o equipamento deles no mercado negro."
          ]
        ]
      },
      {
        nome: "Caçador de Recompensas",
        habilidades: [
          {
            titulo: "Boleadeira Precisa",
            desc: "Arremessa uma boleadeira nas pernas do oponente, causando 1d4 de dano contundente, derrubando e Imobilizando o alvo.",
            mecanica: "Causa 1d4 dano, derruba e Imobiliza o inimigo."
          },
          {
            titulo: "Golpe Sujo",
            desc: "Não luta limpo. Atinge um ponto vital doloroso que causa 1d6 de dano e Atordoa o inimigo por 1 rodada, impedindo-o de agir.",
            mecanica: "Causa 1d6 de dano e Atordoa o alvo por 1 rodada."
          },
          {
            titulo: "Foco no Contrato",
            desc: "Analisa friamente o inimigo principal. Pelas próximas 2 rodadas, os ataques contra esse inimigo ignoram as penalidades de cobertura.",
            mecanica: "Ataques aliados contra o alvo marcado ignoram cobertura."
          }
        ],
        historia: [
          [
            "Para ele, todo mundo tem um preço na cabeça. É só questão de saber quem está pagando.",
            "Dorme com um olho aberto e a mão no cabo da faca. É assim que sobrevive a profissão que atrai rancores mortais.",
            "Nunca leva nada para o lado pessoal. É apenas negócios. Frios, duros e lucrativos negócios."
          ],
          [
            "Costumava prender criminosos sob a lei, mas a lei pagava mal. Agora ele faz a própria justiça por uma comissão justa.",
            "Carrega algemas e amarras feitas de materiais incrivelmente resistentes. Acha a fuga do prisioneiro um desrespeito profissional."
          ]
        ]
      }
    ];

    /* ============================================================
       GERADOR
    ============================================================ */

    function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function gerarNPC() {
      const sexo = Math.random() > 0.5 ? "Masculino" : "Feminino";
      const nome = sexo === "Masculino"
        ? rand(nomesMasculinos)
        : rand(nomesFemininos);

      const idade = Math.floor(Math.random() * 60) + 16;

      // Raça com chance de Mestiço
      let racaSelecionada = rand(racas);
      let racaFinal = racaSelecionada;
      if (racaSelecionada === "Mestiço") {
        const r1 = rand(racas.filter(r => r !== "Mestiço"));
        let r2 = rand(racas.filter(r => r !== "Mestiço" && r !== r1));
        racaFinal = `${r1}/${r2}`;
      }

      // Ocupação
      const ocup = rand(OCUPACOES);
      const habilidade = rand(ocup.habilidades);

      // História (1 a 3 parágrafos)
      const blocoHistoria = rand(ocup.historia);

      // ID único para o tracker desta ficha
      const uid = Date.now();

      // Monta HTML da habilidade
      const habHTML = `
        <div class="habilidade-box">
          <div class="habilidade-nome">⚡ ${habilidade.titulo}</div>
          <div class="habilidade-desc">${habilidade.desc}</div>
          <div class="habilidade-mecanica">
            <span class="mecanica-chip">🎯 ${habilidade.mecanica}</span>
            <span class="mecanica-chip perigo">⚠ Coloca o NPC em perigo</span>
            <span class="mecanica-chip perigo">🎲 Role 1d12 após o uso</span>
            <span class="mecanica-chip perigo">Par = 1 Ferimento · 2 Ferimentos = Incapacitado</span>
          </div>
          <div class="ferimento-tracker">
            <span class="ferimento-label">Ferimentos:</span>
            <div class="ferimento-dots">
              <div class="ferimento-dot" id="dot1-${uid}" onclick="toggleFerimento('dot1-${uid}')"></div>
              <div class="ferimento-dot" id="dot2-${uid}" onclick="toggleFerimento('dot2-${uid}')"></div>
            </div>
            <button class="btn-rolar-d12" onclick="rolarD12('${uid}')">🎲 Rolar 1d12</button>
            <span class="resultado-d12" id="res-${uid}"></span>
          </div>
        </div>`;

      // Monta HTML da história
      const historiaHTML = blocoHistoria
        .map(p => `<p class="historia-paragrafo">${p}</p>`)
        .join('');

      const html = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
          <h3 style="font-size:22px; margin:0;">✦ ${nome}</h3>
        </div>

        <div class="npc-ficha" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
          <!-- Foto do NPC -->
          <div class="npc-portrait-container" style="flex: 0 0 150px; display: flex; flex-direction: column; gap: 10px;">
            <div id="npc-portrait-frame-${uid}" onclick="document.getElementById('npc-portrait-input-${uid}').click()" style="width: 150px; height: 150px; border: 2px dashed var(--gold-dim); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; background: rgba(0,0,0,0.5); position: relative;">
              <span id="npc-portrait-placeholder-${uid}" style="color: var(--text-muted); font-size: 0.8rem; text-align: center;">📷<br>Adicionar Foto</span>
              <img id="npc-portrait-img-${uid}" src="" style="display:none; width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;">
            </div>
            <input type="file" id="npc-portrait-input-${uid}" accept="image/*" onchange="handleNpcPortrait(event, '${uid}')" style="display:none;">
          </div>
          
          <div style="flex: 1; min-width: 300px;">
            <div class="npc-linha">
              <span class="label">Nome:</span>
              <span>${nome}</span>
            </div>
            <div class="npc-linha">
              <span class="label">Idade:</span>
              <span>${idade} anos</span>
            </div>
            <div class="npc-linha">
              <span class="label">Sexo:</span>
              <span>${sexo}</span>
            </div>
            <div class="npc-linha">
              <span class="label">Raça:</span>
              <span>${racaFinal}</span>
            </div>
            <div class="npc-linha">
              <span class="label">Ocupação / Trabalho:</span>
              <span>${ocup.nome}</span>
            </div>
          </div>
          
          <div class="npc-linha" style="flex-direction:column; align-items:flex-start; gap:10px; width: 100%;">
            <span class="label">Habilidade de Apoio:</span>
            ${habHTML}
          </div>
        </div>

        <div class="historia-section">
          <h3>📜 História</h3>
          ${historiaHTML}
        </div>
      `;

      // Dados estruturados do NPC para salvar
      window._npcAtual = { nome, idade, sexo, raca: racaFinal, ocupacao: ocup.nome, habilidade, historia: blocoHistoria, uid, savedAt: null, foto: null };

      const npcDiv = document.getElementById("npc");
      npcDiv.style.display = "block";
      npcDiv.classList.remove("visivel");
      void npcDiv.offsetWidth;
      npcDiv.classList.add("visivel");
      npcDiv.innerHTML = html + `
        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(212,175,55,0.2); display:flex; gap:0.8rem; justify-content:flex-end;">
          <button class="npc-save-btn" onclick="saveNPC()">
            <i class="fa-solid fa-bookmark"></i> Salvar NPC
          </button>
        </div>`;
    }

    /* ============================================================
       TRACKER DE FERIMENTOS E D12
    ============================================================ */

    function toggleFerimento(id) {
      const dot = document.getElementById(id);
      if (dot) dot.classList.toggle('ativo');
    }

    function rolarD12(uid) {
      const resultado = Math.floor(Math.random() * 12) + 1;
      const resEl = document.getElementById('res-' + uid);
      if (!resEl) return;

      const par = resultado % 2 === 0;
      resEl.textContent = `→ ${resultado} (${par ? 'PAR — 1 ferimento!' : 'ímpar — salvo!'})`;
      resEl.className = 'resultado-d12 ' + (par ? 'par' : 'impar');

      if (par) {
        // Marca automaticamente o primeiro ferimento disponível
        const dot1 = document.getElementById('dot1-' + uid);
        const dot2 = document.getElementById('dot2-' + uid);
        if (dot1 && !dot1.classList.contains('ativo')) {
          dot1.classList.add('ativo');
        } else if (dot2 && !dot2.classList.contains('ativo')) {
          dot2.classList.add('ativo');
        }
      }
    }

    function handleNpcPortrait(event, uid) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const base64Img = e.target.result;
        // Atualiza UI
        const imgEl = document.getElementById('npc-portrait-img-' + uid);
        const placeholder = document.getElementById('npc-portrait-placeholder-' + uid);
        if (imgEl && placeholder) {
          imgEl.src = base64Img;
          imgEl.style.display = 'block';
          placeholder.style.display = 'none';
        }
        // Salva no objeto atual
        if (window._npcAtual && window._npcAtual.uid === parseInt(uid)) {
          window._npcAtual.foto = base64Img;
        }
      };
      reader.readAsDataURL(file);
    }

    /* ============================================================
       SISTEMA DE NPCs SALVOS
    ============================================================ */


    function loadSavedNPCs() {
      try { return JSON.parse(localStorage.getItem(NPC_STORAGE_KEY) || '[]'); }
      catch(e) { return []; }
    }

    function persistNPCs(list) {
      localStorage.setItem(NPC_STORAGE_KEY, JSON.stringify(list));
    }

    function saveNPC() {
      if (!window._npcAtual) return;
      const list = loadSavedNPCs();
      const npc = Object.assign({}, window._npcAtual, { savedAt: new Date().toLocaleString(), id: Date.now() });
      list.unshift(npc);
      if (list.length > 50) list.pop();
      persistNPCs(list);
      renderSavedNPCs();
      updateNPCVaultCount();
      // feedback visual no botão
      const btn = document.querySelector('.npc-save-btn');
      if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!'; btn.disabled = true; btn.style.opacity = '0.7'; }
    }

    function toggleNPCVault() {
      const panel = document.getElementById('npc-vault-panel');
      if (panel) panel.classList.toggle('open');
      renderSavedNPCs();
    }

    function renderSavedNPCs() {
      const list = loadSavedNPCs();
      const container = document.getElementById('npc-vault-list');
      if (!container) return;
      if (list.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:2rem;">Nenhum NPC salvo ainda.<br>Gere um NPC e clique em "Salvar NPC".</p>';
        return;
      }
      container.innerHTML = list.map((npc, i) => `
        <div class="npc-vault-item" onclick="viewSavedNPC(${i})">
          <div class="npc-vault-item-info">
            <span class="npc-vault-name">✦ ${npc.nome}</span>
            <span class="npc-vault-meta">${npc.raca} · ${npc.ocupacao} · ${npc.idade} anos</span>
            <span class="npc-vault-date">${npc.savedAt}</span>
          </div>
          <button class="npc-vault-del" onclick="event.stopPropagation(); deleteSavedNPC(${i})" title="Excluir">✕</button>
        </div>
      `).join('');
    }

    function viewSavedNPC(index) {
      const list = loadSavedNPCs();
      const npc = list[index];
      if (!npc) return;

      const uid = npc.uid || Date.now();
      const habHTML = `
        <div class="habilidade-box">
          <div class="habilidade-nome">⚡ ${npc.habilidade.titulo}</div>
          <div class="habilidade-desc">${npc.habilidade.desc}</div>
          <div class="habilidade-mecanica">
            <span class="mecanica-chip">🎯 ${npc.habilidade.mecanica}</span>
            <span class="mecanica-chip perigo">⚠ Coloca o NPC em perigo</span>
            <span class="mecanica-chip perigo">🎲 Role 1d12 após o uso</span>
            <span class="mecanica-chip perigo">Par = 1 Ferimento · 2 Ferimentos = Incapacitado</span>
          </div>
          <div class="ferimento-tracker">
            <span class="ferimento-label">Ferimentos:</span>
            <div class="ferimento-dots">
              <div class="ferimento-dot" id="dot1-v${uid}" onclick="toggleFerimento('dot1-v${uid}')"></div>
              <div class="ferimento-dot" id="dot2-v${uid}" onclick="toggleFerimento('dot2-v${uid}')"></div>
            </div>
            <button class="btn-rolar-d12" onclick="rolarD12('v${uid}')">🎲 Rolar 1d12</button>
            <span class="resultado-d12" id="res-v${uid}"></span>
          </div>
        </div>`;

      const historiaHTML = (npc.historia || []).map(p => `<p class="historia-paragrafo">${p}</p>`).join('');

      const html = `
        <h3 style="margin-bottom:20px; font-size:22px;">✦ ${npc.nome}</h3>
        <div class="npc-ficha">
          <div class="npc-linha"><span class="label">Nome:</span><span>${npc.nome}</span></div>
          <div class="npc-linha"><span class="label">Idade:</span><span>${npc.idade} anos</span></div>
          <div class="npc-linha"><span class="label">Sexo:</span><span>${npc.sexo}</span></div>
          <div class="npc-linha"><span class="label">Raça:</span><span>${npc.raca}</span></div>
          <div class="npc-linha"><span class="label">Ocupação / Trabalho:</span><span>${npc.ocupacao}</span></div>
          <div class="npc-linha" style="flex-direction:column; align-items:flex-start; gap:10px;">
            <span class="label">Habilidade de Apoio:</span>${habHTML}
          </div>
        </div>
        <div class="historia-section"><h3>📜 História</h3>${historiaHTML}</div>
        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(212,175,55,0.2); display:flex; gap:0.8rem; justify-content:flex-end;">
          <span style="color:var(--text-muted); font-size:0.8rem; align-self:center;">Salvo em ${npc.savedAt}</span>
        </div>`;

      const npcDiv = document.getElementById('npc');
      npcDiv.style.display = 'block';
      npcDiv.classList.remove('visivel');
      void npcDiv.offsetWidth;
      npcDiv.classList.add('visivel');
      npcDiv.innerHTML = html;

      // Fecha o painel e scrolla pro NPC
      const panel = document.getElementById('npc-vault-panel');
      if (panel) panel.classList.remove('open');
      setTimeout(() => npcDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    function deleteSavedNPC(index) {
      if (!confirm('Excluir este NPC salvo?')) return;
      const list = loadSavedNPCs();
      list.splice(index, 1);
      persistNPCs(list);
      renderSavedNPCs();
      updateNPCVaultCount();
    }

    // Inicializa contagem no botão do sidebar
    function updateNPCVaultCount() {
      const badge = document.getElementById('npc-vault-count');
      if (badge) badge.textContent = loadSavedNPCs().length;
    }

    document.addEventListener('DOMContentLoaded', () => {
      renderSavedNPCs();
      updateNPCVaultCount();
    });

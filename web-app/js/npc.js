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

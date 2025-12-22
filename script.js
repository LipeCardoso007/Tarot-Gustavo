const cards = [
  {
    name: "O Sol",
    meaning: "Clareza e alegria iluminam seu caminho. Aproveite a energia positiva.",
    tag: "Luz",
    topics: {
      amor: "Relacoes mais leves e sinceras. Compartilhe sua alegria.",
      trabalho: "Boa fase para apresentar ideias e ser reconhecido.",
      caminho: "Sinais claros indicam que voce esta no rumo certo.",
      energia: "Vitalidade em alta. Use para cuidar do que ama."
    }
  },
  {
    name: "A Lua",
    meaning: "Intuicao forte e sensibilidade. Ouva seu interior e evite ilusoes.",
    tag: "Sombra",
    topics: {
      amor: "Nem tudo esta dito. Converse com delicadeza.",
      trabalho: "Observe detalhes antes de decidir. Confie na intuicao.",
      caminho: "Caminhos escondidos surgem com paciencia.",
      energia: "Sono e descanso sao essenciais agora."
    }
  },
  {
    name: "A Estrela",
    meaning: "Esperanca renovada. Inspire-se e mantenha a fe no futuro.",
    tag: "Guia",
    topics: {
      amor: "Curar o passado abre espaco para novas conexoes.",
      trabalho: "Projetos criativos ganham folego e apoio.",
      caminho: "Seu proposito fica mais claro."
    }
  },
  {
    name: "A Sacerdotisa",
    meaning: "Silencio e sabedoria. O momento pede observacao.",
    tag: "Mistério",
    topics: {
      amor: "Fale menos, observe mais. A resposta vem.",
      trabalho: "Estude e prepare-se antes de agir.",
      caminho: "O proximo passo se revela com calma.",
      energia: "Ritualize o descanso e a introspeccao."
    }
  },
  {
    name: "A Roda",
    meaning: "Mudancas em movimento. A vida gira e traz novas possibilidades.",
    tag: "Movimento",
    topics: {
      amor: "Aceite o fluxo. O inesperado pode surpreender.",
      trabalho: "Mudancas de rota podem abrir portas.",
      caminho: "Adapte-se para seguir em frente.",
      energia: "Renove suas praticas para manter o ritmo."
    }
  },
  {
    name: "O Eremita",
    meaning: "Sabedoria interior. Busque respostas em voce.",
    tag: "Pausa",
    topics: {
      amor: "Tempo para cuidar de si antes de se abrir.",
      trabalho: "Revise metas com calma e estrategia.",
      caminho: "Solidao escolhida traz clareza.",
      energia: "Reduza o ritmo e recarregue."
    }
  }
];

const card = document.getElementById("card");
const cardName = document.getElementById("cardName");
const cardMeaning = document.getElementById("cardMeaning");
const cardTag = document.getElementById("cardTag");
const drawBtn = document.getElementById("drawBtn");
const resetBtn = document.getElementById("resetBtn");
const topicHint = document.getElementById("topicHint");
const chips = document.querySelectorAll(".chip");

let currentTopic = null;
let currentCard = null;

function pickCard() {
  const idx = Math.floor(Math.random() * cards.length);
  currentCard = cards[idx];
  updateCardText();
}

function updateCardText() {
  if (!currentCard) return;
  cardName.textContent = currentCard.name;
  cardTag.textContent = currentCard.tag;
  cardMeaning.textContent = currentTopic && currentCard.topics[currentTopic]
    ? currentCard.topics[currentTopic]
    : currentCard.meaning;
}

function flipCard() {
  card.classList.add("flipped");
}

function resetCard() {
  card.classList.remove("flipped");
}

card.addEventListener("click", () => {
  if (!currentCard) {
    pickCard();
  }
  flipCard();
});

drawBtn.addEventListener("click", () => {
  pickCard();
  flipCard();
});

resetBtn.addEventListener("click", () => {
  resetCard();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentTopic = chip.dataset.topic;
    topicHint.textContent = `Tema atual: ${chip.textContent}.`;
    updateCardText();
  });
});

pickCard();

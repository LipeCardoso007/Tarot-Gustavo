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

const FLIP_DURATION_MS = 900;
const SOUND_ENABLED = true;

let currentTopic = null;
let currentCard = null;
let flipTimer = null;
let doneTimer = null;
let audioCtx = null;

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
  if (!currentCard) return;
  card.classList.remove("flip-anim");
  card.classList.remove("done");
  void card.offsetWidth;
  card.classList.add("flip-anim");
  card.classList.add("flipped");
  if (flipTimer) clearTimeout(flipTimer);
  if (doneTimer) clearTimeout(doneTimer);
  flipTimer = setTimeout(() => {
    card.classList.remove("flip-anim");
  }, FLIP_DURATION_MS);
  doneTimer = setTimeout(() => {
    card.classList.add("done");
  }, FLIP_DURATION_MS);
  if (SOUND_ENABLED) {
    playFlipSound();
  }
}

function resetCard() {
  card.classList.remove("flipped");
  card.classList.remove("done");
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

function playFlipSound() {
  if (!window.AudioContext) return;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.22);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

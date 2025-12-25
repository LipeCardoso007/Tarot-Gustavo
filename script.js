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
const soundToggle = document.getElementById("soundToggle");
const adminBtn = document.getElementById("adminBtn");
const adminModal = document.getElementById("adminModal");
const adminForm = document.getElementById("adminForm");
const adminCancel = document.getElementById("adminCancel");
const adminLogin = document.getElementById("adminLogin");
const adminPassword = document.getElementById("adminPassword");

const FLIP_DURATION_MS = 900;
const ADMIN_FALLBACK_TARGET = "admin.html";

let currentTopic = null;
let currentCard = null;
let flipTimer = null;
let doneTimer = null;
let audioCtx = null;
let soundEnabled = true;

function openAdminModal() {
  if (!adminModal) return;
  adminModal.classList.add("open");
  adminModal.setAttribute("aria-hidden", "false");
  if (adminLogin) {
    adminLogin.focus();
  }
}

function closeAdminModal() {
  if (!adminModal) return;
  adminModal.classList.remove("open");
  adminModal.setAttribute("aria-hidden", "true");
  if (adminForm) {
    adminForm.reset();
  }
}

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
  if (navigator.vibrate) {
    navigator.vibrate(18);
  }
  if (flipTimer) clearTimeout(flipTimer);
  if (doneTimer) clearTimeout(doneTimer);
  flipTimer = setTimeout(() => {
    card.classList.remove("flip-anim");
  }, FLIP_DURATION_MS);
  doneTimer = setTimeout(() => {
    card.classList.add("done");
  }, FLIP_DURATION_MS);
  if (soundEnabled) {
    playFlipSound();
  }
}

function resetCard() {
  card.classList.remove("flipped");
  card.classList.remove("done");
  card.classList.remove("flip-anim");
  if (flipTimer) clearTimeout(flipTimer);
  if (doneTimer) clearTimeout(doneTimer);
}

card.addEventListener("click", () => {
  if (card.classList.contains("flipped")) {
    resetCard();
    pickCard();
    setTimeout(() => {
      flipCard();
    }, 120);
    return;
  }
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
updateSoundToggle();

if (adminBtn) {
  adminBtn.addEventListener("click", () => {
    openAdminModal();
  });
}

if (adminCancel) {
  adminCancel.addEventListener("click", () => {
    closeAdminModal();
  });
}

if (adminModal) {
  adminModal.addEventListener("click", (event) => {
    if (event.target && event.target.dataset && event.target.dataset.close === "true") {
      closeAdminModal();
    }
  });
}

if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const loginValue = adminLogin ? adminLogin.value.trim() : "";
    const passwordValue = adminPassword ? adminPassword.value.trim() : "";
    if (!loginValue || !passwordValue) {
      return;
    }
    const target = (adminBtn && adminBtn.dataset.target) ? adminBtn.dataset.target : ADMIN_FALLBACK_TARGET;
    closeAdminModal();
    window.location.href = target;
  });
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundToggle();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && adminModal && adminModal.classList.contains("open")) {
    closeAdminModal();
  }
});

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

function updateSoundToggle() {
  if (!soundToggle) return;
  soundToggle.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
  soundToggle.textContent = soundEnabled ? "Som: ligado" : "Som: desligado";
}

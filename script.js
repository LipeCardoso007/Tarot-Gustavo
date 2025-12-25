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
const carouselTrack = document.getElementById("carouselTrack");
const carouselMore = document.getElementById("carouselMore");
const drawCount = document.getElementById("drawCount");
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
const flipTimers = new WeakMap();
const doneTimers = new WeakMap();
let audioCtx = null;
let soundEnabled = true;
let drawTotal = 1;
let cardPool = [];
let cardNodes = [];
let centerIndex = 0;
let dragStartX = 0;
let dragOffset = 0;
let isDragging = false;
let cardSpacing = 200;

const cardTemplate = card;
if (cardTemplate) {
  cardTemplate.remove();
}

function buildCardPool(count) {
  const pool = [];
  const used = new Set();
  while (pool.length < count) {
    const idx = Math.floor(Math.random() * cards.length);
    if (used.has(idx) && cards.length > count) {
      continue;
    }
    used.add(idx);
    pool.push({ ...cards[idx] });
  }
  return pool;
}

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
  cardPool = buildCardPool(drawTotal);
  centerIndex = 0;
}

function flipCard(cardEl) {
  if (!cardEl) return;
  cardEl.classList.remove("flip-anim");
  cardEl.classList.remove("done");
  void cardEl.offsetWidth;
  cardEl.classList.add("flip-anim");
  cardEl.classList.add("flipped");
  if (navigator.vibrate) {
    navigator.vibrate(18);
  }
  const existingFlip = flipTimers.get(cardEl);
  const existingDone = doneTimers.get(cardEl);
  if (existingFlip) clearTimeout(existingFlip);
  if (existingDone) clearTimeout(existingDone);
  const flipTimer = setTimeout(() => {
    cardEl.classList.remove("flip-anim");
  }, FLIP_DURATION_MS);
  const doneTimer = setTimeout(() => {
    cardEl.classList.add("done");
  }, FLIP_DURATION_MS);
  flipTimers.set(cardEl, flipTimer);
  doneTimers.set(cardEl, doneTimer);
  if (soundEnabled) {
    playFlipSound();
  }
}

function resetCard(cardEl) {
  if (!cardEl) return;
  cardEl.classList.remove("flipped");
  cardEl.classList.remove("done");
  cardEl.classList.remove("flip-anim");
  const existingFlip = flipTimers.get(cardEl);
  const existingDone = doneTimers.get(cardEl);
  if (existingFlip) clearTimeout(existingFlip);
  if (existingDone) clearTimeout(existingDone);
}

function updateCardSpacing() {
  if (!cardNodes.length) return;
  const rect = cardNodes[0].getBoundingClientRect();
  cardSpacing = rect.width * 0.7;
}

function updateMoreIndicator() {
  if (!carouselMore) return;
  const extra = drawTotal - 3;
  if (extra > 0) {
    carouselMore.textContent = `+${extra}`;
    carouselMore.classList.add("show");
  } else {
    carouselMore.textContent = "";
    carouselMore.classList.remove("show");
  }
}

function layoutCarousel(offset = 0) {
  if (!cardNodes.length) return;
  updateCardSpacing();
  const spacing = cardSpacing || 200;
  const dragUnits = offset / spacing;
  cardNodes.forEach((node, index) => {
    const distance = index - centerIndex - dragUnits;
    const absDistance = Math.abs(distance);
    const scale = Math.max(0.72, 1 - absDistance * 0.2);
    const translate = (index - centerIndex) * spacing + offset;
    node.style.setProperty("--tx", `${translate}px`);
    node.style.setProperty("--scale", scale.toFixed(3));
    node.style.opacity = absDistance > 1.6 ? "0" : "1";
    node.style.pointerEvents = absDistance > 1.1 ? "none" : "auto";
    node.style.zIndex = String(100 - Math.round(absDistance * 10));
    node.classList.toggle("is-center", absDistance < 0.01);
  });
}

function handleCardClick(index) {
  if (index !== centerIndex) {
    centerIndex = index;
    layoutCarousel(0);
    return;
  }
  const cardNode = cardNodes[index];
  if (!cardNode || cardNode.classList.contains("flipped")) {
    return;
  }
  flipCard(cardNode);
}

function renderCarousel() {
  if (!carouselTrack || !cardTemplate) return;
  carouselTrack.innerHTML = "";
  cardNodes = cardPool.map((cardData, index) => {
    const cardNode = cardTemplate.cloneNode(true);
    cardNode.id = "";
    cardNode.classList.add("carousel-card");
    const front = cardNode.querySelector("#cardFront");
    if (front) front.removeAttribute("id");
    const nameEl = cardNode.querySelector("#cardName") || cardNode.querySelector("h2");
    const meaningEl = cardNode.querySelector("#cardMeaning") || cardNode.querySelector("p");
    const tagEl = cardNode.querySelector("#cardTag") || cardNode.querySelector(".tag");
    if (nameEl) nameEl.removeAttribute("id");
    if (meaningEl) meaningEl.removeAttribute("id");
    if (tagEl) tagEl.removeAttribute("id");
    if (cardData) {
      nameEl.textContent = cardData.name;
      tagEl.textContent = cardData.tag;
      meaningEl.textContent = currentTopic && cardData.topics[currentTopic]
        ? cardData.topics[currentTopic]
        : cardData.meaning;
    }
    cardNode.addEventListener("click", () => {
      handleCardClick(index);
    });
    carouselTrack.appendChild(cardNode);
    return cardNode;
  });
  centerIndex = Math.min(centerIndex, cardNodes.length - 1);
  layoutCarousel(0);
  updateMoreIndicator();
}

resetBtn.addEventListener("click", () => {
  pickCard();
  centerIndex = 0;
  renderCarousel();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentTopic = chip.dataset.topic;
    topicHint.textContent = `Tema atual: ${chip.textContent}.`;
    renderCarousel();
  });
});

if (drawCount) {
  drawCount.addEventListener("change", (event) => {
    drawTotal = parseInt(event.target.value, 10) || 1;
    pickCard();
    renderCarousel();
  });
}

if (carouselTrack) {
  carouselTrack.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragOffset = 0;
    carouselTrack.classList.add("dragging");
    carouselTrack.setPointerCapture(event.pointerId);
  });

  carouselTrack.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    dragOffset = event.clientX - dragStartX;
    layoutCarousel(dragOffset);
  });

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    carouselTrack.classList.remove("dragging");
    carouselTrack.releasePointerCapture(event.pointerId);
    const threshold = cardSpacing * 0.25;
    if (Math.abs(dragOffset) > threshold) {
      centerIndex += dragOffset < 0 ? 1 : -1;
      centerIndex = Math.max(0, Math.min(centerIndex, cardNodes.length - 1));
    }
    dragOffset = 0;
    layoutCarousel(0);
  };

  carouselTrack.addEventListener("pointerup", endDrag);
  carouselTrack.addEventListener("pointercancel", endDrag);
}

window.addEventListener("resize", () => {
  layoutCarousel(0);
});

pickCard();
renderCarousel();
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
    if (loginValue !== "gustavo123" || passwordValue !== "34713471") {
      alert("Login ou senha incorretos.");
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

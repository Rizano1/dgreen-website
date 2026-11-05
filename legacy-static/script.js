(() => {
  const TOTAL_PAGES = 42;
  const pageSrc = (n) => `assets/menu/p-${String(n).padStart(2, "0")}.jpg`;

  // First page of each chapter in the printed menu
  const CHAPTERS = [
    ["Cover", 1],
    ["Appetizer", 2],
    ["Salad", 4],
    ["All Day Brunch", 6],
    ["Smoothie Bowl", 9],
    ["Asian Selection", 10],
    ["Soup", 22],
    ["Pasta", 23],
    ["On the Grill", 26],
    ["Western", 27],
    ["Dessert", 32],
    ["Beverage", 34],
  ];

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const header = document.getElementById("header");

  /* ---------------- HERO ---------------- */
  const hero = document.querySelector(".hero");
  const heroTitle = document.getElementById("heroTitle");
  const heroWall = document.getElementById("heroWall");
  const leavesBack = document.getElementById("leavesBack");
  const leavesFront = document.getElementById("leavesFront");
  const scrollCue = document.getElementById("scrollCue");
  const heroSvgs = [heroWall, leavesBack, leavesFront];
  const GATE_W = 440; // width of the arch opening in viewBox units

  function layoutHero() {
    const w = innerWidth, h = innerHeight;
    const portrait = w / h < 0.9;
    const vb = portrait ? [380, -250, 840, 1500] : [0, 0, 1600, 1000];
    heroSvgs.forEach((svg) => svg.setAttribute("viewBox", vb.join(" ")));
    // size the title to sit inside the gate opening
    const scale = Math.max(w / vb[2], h / vb[3]);
    heroTitle.style.setProperty("--gate", `${GATE_W * scale}px`);
    heroTitle.querySelector("h1").style.fontSize = `${GATE_W * scale * 0.145}px`;
  }

  function updateHero() {
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    // exponential zoom feels like walking at a constant pace
    heroWall.style.transform = `scale(${Math.pow(9, p)})`;
    heroWall.style.opacity = 1 - clamp((p - 0.85) / 0.15);
    leavesBack.style.transform = `scale(${Math.pow(6, p)})`;
    leavesBack.style.opacity = 1 - clamp((p - 0.5) / 0.35);
    leavesFront.style.transform = `scale(${Math.pow(14, p)})`;
    leavesFront.style.opacity = 1 - clamp((p - 0.35) / 0.35);

    const tp = clamp(p / 0.4);
    heroTitle.style.opacity = 1 - tp;
    heroTitle.style.transform = `translateY(6vh) scale(${1 + tp * 0.35})`;
    heroTitle.style.filter = `blur(${tp * 6}px)`;
    scrollCue.style.opacity = 1 - clamp(p / 0.08);
    return p;
  }

  /* ---------------- MENU BOOK ---------------- */
  const menu = document.getElementById("menu");
  const book = document.getElementById("book");
  const stage = document.querySelector(".book-stage");
  const shadow = book.querySelector(".book-shadow");
  const spine = book.querySelector(".book-spine");
  const chaptersEl = document.getElementById("chapters");
  const pageLabel = document.getElementById("pageLabel");
  const meterFill = document.getElementById("meterFill");

  let single = false;
  let leaves = []; // {el, front:{face,img,page}, back:{face,img,page}}
  let seg = 1; // px of scroll per page turn
  let pageW = 300;

  function makeFace(side, page) {
    const face = document.createElement("div");
    face.className = `face ${side}${page ? "" : " blank"}`;
    let img = null;
    if (page) {
      img = document.createElement("img");
      img.alt = `D'Green menu, page ${page}`;
      img.decoding = "async";
      img.draggable = false;
      face.appendChild(img);
    }
    return { face, img, page };
  }

  function buildBook() {
    leaves.forEach((l) => l.el.remove());
    leaves = [];
    book.classList.toggle("single", single);
    const count = single ? TOTAL_PAGES : TOTAL_PAGES / 2;
    for (let k = 0; k < count; k++) {
      const frontPage = single ? k + 1 : 2 * k + 1;
      const backPage = single ? null : 2 * k + 2;
      const el = document.createElement("div");
      el.className = "leaf" + (k === 0 ? " is-cover" : "");
      const front = makeFace("front", frontPage);
      const back = makeFace("back", backPage);
      el.append(front.face, back.face);
      book.appendChild(el);
      leaves.push({ el, front, back, t: -1 });
    }
    buildChapters();
  }

  function buildChapters() {
    chaptersEl.innerHTML = "";
    CHAPTERS.forEach(([name, page]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.dataset.page = page;
      b.addEventListener("click", () => goToPage(page));
      chaptersEl.appendChild(b);
    });
  }

  // index of the resting position (p) that shows a given page
  const restForPage = (n) => (single ? n - 1 : Math.floor(n / 2));

  function goToPage(n) {
    const top = menu.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (restForPage(n) + 0.3) * seg + 1, behavior: "smooth" });
  }

  function layoutBook() {
    const nextSingle = innerWidth < 760 || innerWidth / innerHeight < 0.8;
    if (nextSingle !== single || !leaves.length) {
      single = nextSingle;
      buildBook();
    }
    const sr = stage.getBoundingClientRect();
    const cols = single ? 1 : 2;
    const ratio = 595.276 / 841.89;
    const stageW = Math.min(sr.width, innerWidth - 32);
    const availH = sr.height * 0.94;
    const availW = (single ? stageW * 0.82 : stageW * 0.92) / cols;
    pageW = Math.floor(Math.min(availW, availH * ratio));
    const pageH = Math.floor(pageW / ratio);
    book.style.setProperty("--page-w", `${pageW}px`);
    book.style.setProperty("--page-h", `${pageH}px`);
    book.style.perspective = `${pageW * 3.4}px`;

    seg = innerHeight * (single ? 0.45 : 0.6);
    menu.style.height = `${(leaves.length + 0.6) * seg + innerHeight}px`;
  }

  function loadNear(p, range = 3) {
    leaves.forEach((l, i) => {
      if (Math.abs(i - p) <= range) {
        [l.front, l.back].forEach((f) => {
          if (f.img && !f.img.src) f.img.src = pageSrc(f.page);
        });
      }
    });
  }

  function updateBook() {
    const r = menu.getBoundingClientRect();
    const scrolled = -r.top;
    const n = leaves.length;
    const p = clamp(scrolled / seg - 0.3, 0, n);
    loadNear(p);

    leaves.forEach((l, i) => {
      const t = easeInOut(clamp((p - i - 0.2) / 0.6));
      if (t === l.t) return;
      l.t = t;
      const turning = t > 0 && t < 1;
      l.el.style.transform = `rotateY(${-180 * t}deg)`;
      l.el.style.zIndex = turning ? 2 * n : t >= 0.5 ? n + i : n - i;
      const shade = Math.sin(t * Math.PI) * 0.28;
      l.front.face.style.setProperty("--shade", t < 0.5 ? shade : 0);
      l.back.face.style.setProperty("--shade", t >= 0.5 ? shade : 0);
      l.el.style.opacity = single ? 1 - clamp((t - 0.55) / 0.4) : 1;
      l.el.style.visibility = single && t >= 1 ? "hidden" : "visible";
    });

    if (!single) {
      // centre the closed covers, slide to full spread once opened
      const tFirst = leaves[0].t;
      const tLast = leaves[n - 1].t;
      const shift = (-(1 - tFirst) + tLast) * (pageW / 2);
      book.style.transform = `translateX(${shift}px)`;
      shadow.style.left = `${(1 - tFirst) * 50}%`;
      shadow.style.right = `${tLast * 50}%`;
      spine.style.opacity = Math.min(tFirst, 1 - tLast);
    } else {
      book.style.transform = "";
      shadow.style.left = "0";
      shadow.style.right = "0";
    }

    // label + chapter
    const rest = Math.round(p);
    let rightPage, label;
    if (single) {
      rightPage = Math.min(rest + 1, TOTAL_PAGES);
      label = rightPage === 1 ? "Cover" : `Page ${rightPage} of ${TOTAL_PAGES}`;
    } else {
      rightPage = 2 * rest + 1;
      label = rest === 0 ? "Cover" : rest >= n ? "Back cover" : `Pages ${2 * rest} – ${2 * rest + 1}`;
    }
    if (pageLabel.textContent !== label) pageLabel.textContent = label;
    meterFill.style.width = `${(p / n) * 100}%`;

    let active = 0;
    CHAPTERS.forEach(([, page], i) => { if (page <= rightPage) active = i; });
    [...chaptersEl.children].forEach((b, i) => {
      const on = i === active;
      if (b.classList.contains("active") !== on) {
        b.classList.toggle("active", on);
        if (on) {
          // scroll only the chip row, never the page
          const left = b.offsetLeft - (chaptersEl.clientWidth - b.offsetWidth) / 2;
          chaptersEl.scrollTo({ left, behavior: "smooth" });
        }
      }
    });
  }

  /* ---------------- header + loop ---------------- */
  const visit = document.getElementById("visit");

  function updateHeader(heroP) {
    const inVisit = visit.getBoundingClientRect().top <= 64;
    header.classList.toggle("on-dark-solid", inVisit);
    header.classList.toggle("on-light", !inVisit && heroP > 0.55);
  }

  let ticking = false;
  function frame() {
    ticking = false;
    const hp = updateHero();
    updateBook();
    updateHeader(hp);
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  function layout() {
    layoutHero();
    layoutBook();
    leaves.forEach((l) => (l.t = -1));
    frame();
  }

  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", layout);
  layout();
  // preload the cover pages right away, the rest once the page has settled
  loadNear(0);
  addEventListener("load", () => setTimeout(() => loadNear(0, Infinity), 1500));
})();

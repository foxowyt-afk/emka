var _dashboardMaxScroll = Infinity;

function setDashboardScrollLimit() {
  try {
    const body = document.body;
    if (!body || !body.classList.contains("dashboard-page")) return;
    const header = document.querySelector("header.app-header");
    const title = document.getElementById("main-title");
    if (!header || !title) return;

    const viewportH =
      (window.visualViewport && window.visualViewport.height) ||
      window.innerHeight ||
      document.documentElement.clientHeight ||
      0;
    const headerH = Math.ceil(header.getBoundingClientRect().height || 0);
    const titleRect = title.getBoundingClientRect();
    const coverDistance = Math.max(
      0,
      Math.ceil(titleRect.bottom - headerH + 1 + window.scrollY),
    );

    _dashboardMaxScroll = coverDistance;

    const targetH = Math.max(0, Math.round(viewportH + coverDistance));
    body.style.minHeight = targetH + "px";
    body.style.height = targetH + "px";
  } catch (_) { }
}

window.addEventListener("scroll", function () {
  if (window.scrollY > _dashboardMaxScroll) {
    window.scrollTo(0, _dashboardMaxScroll);
  }
}, { passive: true });

function applyEntryAnimation() {
  try {
    const fromLogin = sessionStorage.getItem("from-login");
    if (fromLogin === "true") {
      sessionStorage.removeItem("from-login");
      const section = document.getElementById("wybor-p");
      if (section) {
        section.style.opacity = "0";
        section.style.transform = "translateY(100vh)";
        requestAnimationFrame(() => {
          section.classList.add("slide-up-enter");
        });
      }
    }
  } catch (e) { }
}

const AVAILABLE_DOCS = {
  mdowod: {
    id: "mdowod",
    title: "mDowód",
    image: "assets/icons/mdowod_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "dowod.html",
  },
  diia: {
    id: "diia",
    title: "Diia.pl",
    image: "assets/icons/diia_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "diia.html",
  },
  legszk: {
    id: "legszk",
    title: "Legitymacja szkolna",
    image: "assets/icons/leg_szkolna_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "legszk.html",
  },
  legstu: {
    id: "legstu",
    title: "Legitymacja studencka",
    image: "assets/icons/leg_studencka_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "legstu.html",
  },
  prawojazdy: {
    id: "prawojazdy",
    title: "Prawo jazdy",
    image: "assets/icons/prawo_jazdy_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "prawojazdy.html",
  },
};

let cardOrder = [];
let visibleCards = [];

function loadSettings() {
  try {
    const savedOrder = localStorage.getItem("doc-cards-order");
    const savedVisible = localStorage.getItem("doc-cards-visible");

    if (savedOrder) {
      cardOrder = JSON.parse(savedOrder);
    } else {
      cardOrder = ["mdowod", "diia", "legszk", "legstu", "prawojazdy"];
    }

    if (savedVisible) {
      visibleCards = JSON.parse(savedVisible);
    } else {
      visibleCards = ["mdowod"];
    }
  } catch (e) {
    cardOrder = ["mdowod", "diia", "legszk", "legstu", "prawojazdy"];
    visibleCards = ["mdowod"];
  }
}

function saveSettings() {
  try {
    localStorage.setItem("doc-cards-order", JSON.stringify(cardOrder));
    localStorage.setItem("doc-cards-visible", JSON.stringify(visibleCards));
  } catch (e) { }
}

function renderCards() {
  const container = document.getElementById("cards-container");
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const cardsToRender = cardOrder.filter((id) => visibleCards.includes(id));

  const containerWidth = container.clientWidth || 304;
  const baseHeight = Math.round((containerWidth * 205) / 304);
  const offsetPerCard = 80;
  const totalHeight =
    baseHeight + Math.max(0, cardsToRender.length - 1) * offsetPerCard;
  container.style.minHeight = totalHeight + "px";

  cardsToRender.forEach((docId, index) => {
    const doc = AVAILABLE_DOCS[docId];
    if (!doc) return;

    const card = document.createElement("div");
    card.className = "id-card";
    card.dataset.href = doc.href;
    card.dataset.docId = docId;
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.style.top = index * offsetPerCard + "px";
    card.style.zIndex = index + 1;

    const img = document.createElement("img");
    img.src = doc.image;
    img.alt = doc.title;
    img.className = "id-card-image";
    img.loading = "eager";
    img.decoding = "async";
    img.width = 400;
    img.height = 240;

    const header = document.createElement("div");
    header.className = "id-card-header";

    const title = document.createElement("span");
    title.className = "id-card-title";
    title.textContent = doc.title;

    const logo = document.createElement("img");
    logo.src = doc.logo;
    logo.alt = "Logo " + doc.title;
    logo.className = "id-card-logo";
    logo.loading = "eager";
    logo.width = 64;
    logo.height = 64;

    header.appendChild(title);
    header.appendChild(logo);
    card.appendChild(img);
    card.appendChild(header);

    card.addEventListener("click", function (e) {
      if (card.classList.contains("is-activating")) return;
      card.classList.add("is-activating");
      card.style.pointerEvents = "none";

      setTimeout(function () {
        window.location.href = card.dataset.href;
      }, 320);
    });

    container.appendChild(card);
  });
}

function refreshCardsLayout() {
  try {
    renderCards();
    setDashboardScrollLimit();
  } catch (_) { }
}

function renderSortableList() {
  const sortableContainer = document.getElementById("sortable-cards");
  if (!sortableContainer) return;

  while (sortableContainer.firstChild) {
    sortableContainer.removeChild(sortableContainer.firstChild);
  }

  visibleCards.forEach((docId) => {
    const doc = AVAILABLE_DOCS[docId];
    if (!doc) return;

    const item = document.createElement("div");
    item.className = "sortable-item";
    item.draggable = true;
    item.dataset.docId = docId;

    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";

    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    const span3 = document.createElement("span");

    dragHandle.appendChild(span1);
    dragHandle.appendChild(span2);
    dragHandle.appendChild(span3);

    const label = document.createElement("span");
    label.className = "sortable-item-label";
    label.textContent = doc.title;

    item.appendChild(dragHandle);
    item.appendChild(label);

    sortableContainer.appendChild(item);
  });

  initDragAndDrop();
}

let draggedElement = null;
let draggedOverElement = null;
let touchStartY = 0;
let touchCurrentY = 0;
let isDragging = false;

function initDragAndDrop() {
  const items = document.querySelectorAll(".sortable-item");

  items.forEach((item) => {
    item.addEventListener("dragstart", function (e) {
      draggedElement = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", this.innerHTML);
    });

    item.addEventListener("dragend", function (e) {
      this.classList.remove("dragging");

      const allItems = document.querySelectorAll(".sortable-item");
      allItems.forEach((el) => el.classList.remove("dragover"));

      draggedElement = null;
      draggedOverElement = null;

      updateOrderFromDOM();
    });

    item.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (draggedElement && draggedElement !== this) {
        draggedOverElement = this;

        const container = this.parentNode;
        const afterElement = getDragAfterElement(container, e.clientY);

        if (afterElement == null) {
          container.appendChild(draggedElement);
        } else {
          container.insertBefore(draggedElement, afterElement);
        }
      }
    });

    item.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    item.addEventListener(
      "touchstart",
      function (e) {
        isDragging = false;
        touchStartY = e.touches[0].clientY;

        setTimeout(() => {
          if (!isDragging) {
            draggedElement = this;
            this.classList.add("dragging");
            isDragging = true;

            const overlayContent = document.querySelector(
              "#customize-overlay .overlay-content",
            );
            if (overlayContent) {
              overlayContent.classList.add("dragging-active");
            }
          }
        }, 150);
      },
      { passive: false },
    );

    item.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging || !draggedElement) return;

        e.preventDefault();
        e.stopPropagation();

        touchCurrentY = e.touches[0].clientY;
        const touch = e.touches[0];

        const elementBelow = document.elementFromPoint(
          touch.clientX,
          touch.clientY,
        );
        const sortableItem = elementBelow?.closest(".sortable-item");

        if (sortableItem && sortableItem !== draggedElement) {
          const container = draggedElement.parentNode;
          const afterElement = getDragAfterElement(container, touch.clientY);

          if (afterElement == null) {
            container.appendChild(draggedElement);
          } else {
            container.insertBefore(draggedElement, afterElement);
          }
        }
      },
      { passive: false },
    );

    item.addEventListener(
      "touchend",
      function (e) {
        if (isDragging && draggedElement) {
          draggedElement.classList.remove("dragging");

          const allItems = document.querySelectorAll(".sortable-item");
          allItems.forEach((el) => el.classList.remove("dragover"));

          const overlayContent = document.querySelector(
            "#customize-overlay .overlay-content",
          );
          if (overlayContent) {
            overlayContent.classList.remove("dragging-active");
          }

          draggedElement = null;
          isDragging = false;

          updateOrderFromDOM();
        }
      },
      { passive: false },
    );

    item.addEventListener(
      "touchcancel",
      function (e) {
        if (draggedElement) {
          draggedElement.classList.remove("dragging");

          const overlayContent = document.querySelector(
            "#customize-overlay .overlay-content",
          );
          if (overlayContent) {
            overlayContent.classList.remove("dragging-active");
          }

          draggedElement = null;
          isDragging = false;
        }
      },
      { passive: false },
    );
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".sortable-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function updateOrderFromDOM() {
  const items = document.querySelectorAll(".sortable-item");
  const newOrder = [];

  items.forEach((item) => {
    const docId = item.dataset.docId;
    if (docId && visibleCards.includes(docId)) {
      newOrder.push(docId);
    }
  });

  visibleCards = newOrder;

  cardOrder = cardOrder.filter((id) => !visibleCards.includes(id));
  cardOrder = [...visibleCards, ...cardOrder];

  saveSettings();
  renderCards();
}

function updateCheckboxStates() {
  const checkboxes = document.querySelectorAll(
    '#add-doc-overlay input[type="checkbox"]',
  );

  checkboxes.forEach((checkbox) => {
    const docId = checkbox.dataset.docId;
    checkbox.checked = visibleCards.includes(docId);
  });
}

function showOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  overlay.style.display = "flex";
  document.documentElement.style.overflow = "hidden";

  if (overlayId === "add-doc-overlay") {
    updateCheckboxStates();
  } else if (overlayId === "customize-overlay") {
    renderSortableList();
  }
}

function hideOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  overlay.style.display = "none";
  document.documentElement.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", function () {
  loadSettings();
  renderCards();

  applyEntryAnimation();

  const addBtn = document.querySelector(".floating-add-doc-btn");
  try {
    if (typeof initHeaderTitleObserver === "function") {
      initHeaderTitleObserver({
        onEnter: function () {
          if (addBtn) addBtn.classList.remove("compact");
        },
        onLeave: function () {
          if (addBtn) addBtn.classList.add("compact");
        },
      });
    }
  } catch (_) { }

  setDashboardScrollLimit();

  const addDocBtn = document.getElementById("add-doc-btn");
  if (addDocBtn) {
    addDocBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showOverlay("add-doc-overlay");
    });
  }

  const closeAddBtn = document.getElementById("close-add-overlay");
  if (closeAddBtn) {
    closeAddBtn.addEventListener("click", function () {
      hideOverlay("add-doc-overlay");
    });
  }

  const docCheckboxes = document.querySelectorAll(
    '#add-doc-overlay input[type="checkbox"]',
  );
  docCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const docId = this.dataset.docId;

      if (this.checked) {
        let conflictingDocs = [];

        if (docId === "mdowod" && visibleCards.includes("diia")) {
          conflictingDocs = ["diia"];
        } else if (docId === "diia" && visibleCards.includes("mdowod")) {
          conflictingDocs = ["mdowod"];
        }

        if (docId === "legszk" && visibleCards.includes("legstu")) {
          conflictingDocs.push("legstu");
        } else if (docId === "legstu" && visibleCards.includes("legszk")) {
          conflictingDocs.push("legszk");
        }

        if (conflictingDocs.length > 0) {
          conflictingDocs.forEach((conflictId) => {
            visibleCards = visibleCards.filter((id) => id !== conflictId);
            const conflictCheckbox = document.querySelector(
              `input[data-doc-id="${conflictId}"]`,
            );
            if (conflictCheckbox) conflictCheckbox.checked = false;
          });
        }

        if (!visibleCards.includes(docId)) {
          visibleCards.push(docId);
        }
      } else {
        visibleCards = visibleCards.filter((id) => id !== docId);
      }

      saveSettings();
      renderCards();
    });
  });

  const customizeBtn = document.getElementById("customize-view-btn");
  if (customizeBtn) {
    customizeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showOverlay("customize-overlay");
    });
  }

  const closeCustomizeBtn = document.getElementById("close-customize-overlay");
  if (closeCustomizeBtn) {
    closeCustomizeBtn.addEventListener("click", function () {
      hideOverlay("customize-overlay");
    });
  }

  const overlays = document.querySelectorAll(".overlay");
  overlays.forEach((overlay) => {
    const backdrop = overlay.querySelector(".overlay-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        hideOverlay(overlay.id);
      });
    }
  });
});

window.addEventListener("load", setDashboardScrollLimit);
window.addEventListener("resize", refreshCardsLayout);
window.addEventListener("orientationchange", refreshCardsLayout);
if (window.visualViewport) {
  try {
    window.visualViewport.addEventListener("resize", refreshCardsLayout);
  } catch (_) { }
}

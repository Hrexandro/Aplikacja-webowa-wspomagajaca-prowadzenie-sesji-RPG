const demoState = {
  users: [
    { id: 1, email: "gm@test.pl", displayName: "Marcin MG", role: "GM" },
    { id: 2, email: "gracz@test.pl", displayName: "Gracz Testowy", role: "PLAYER" }
  ],

  campaigns: [
    {
      id: 1,
      name: "Dolina Cieni",
      description: "Kampania dark fantasy o wyprawach poza granice cywilizacji.",
      system: "DCC / dark fantasy",
      createdAt: "2026-06-06"
    }
  ],

  campaignMembers: [
    { id: 1, userId: 1, campaignId: 1, role: "GM" },
    { id: 2, userId: 2, campaignId: 1, role: "PLAYER" }
  ],

  generatedContent: [
    {
      id: 1,
      campaignId: 1,
      type: "lokacja",
      title: "Opuszczona kaplica",
      content: "Na skraju mokradeł stoi kamienna kaplica z zatartymi symbolami. Wewnątrz znajduje się popękany ołtarz i ślady świeżo palonych świec.",
      gmComment: "Można wykorzystać jako pierwsze miejsce spotkania z kultystami.",
      isCommentShared: false,
      createdAt: "2026-06-06",
      isShared: true
    },
    {
      id: 2,
      campaignId: 1,
      type: "notatka MG",
      title: "Tajemnica kultu",
      content: "Kult działa pod przykrywką miejscowego bractwa pogrzebowego.",
      gmComment: "Tego graczom na razie nie ujawniać. To informacja do późniejszego śledztwa.",
      isCommentShared: false,
      createdAt: "2026-06-06",
      isShared: false
    },
    {
      id: 3,
      campaignId: 1,
      type: "notatka MG",
      title: "Zawartość znalezionej skrzyni",
      content: "W skrzyni drużyna znajduje srebrny pierścień, trzy stare monety i mapę prowadzącą do ruin na północy.",
      gmComment: "To, co znaleźliście w skrzyni.",
      isCommentShared: true,
      createdAt: "2026-06-06",
      isShared: true
    }
  ]
};

let state = loadState();
let currentUser = null;
let selectedCampaignId = state.campaigns[0]?.id || null;
function loadState() {
  const saved = localStorage.getItem("rpgAppState");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem("rpgAppState", JSON.stringify(demoState));
  return demoState;
}

function saveState() {
  localStorage.setItem("rpgAppState", JSON.stringify(state));
}

document.addEventListener("DOMContentLoaded", () => {
  // document.getElementById("login-gm").addEventListener("click", () => loginAs("GM"));
  // document.getElementById("login-player").addEventListener("click", () => loginAs("PLAYER"));

  // document.getElementById("login-error").addEventListener("click", () => {
  //   document.getElementById("login-message").textContent = "Nieprawidłowe dane logowania.";
  //   document.getElementById("login-message").className = "message error";
  // });

  document.getElementById("login-form").addEventListener("submit", handleLogin);

  document.getElementById("fill-gm").addEventListener("click", () => {
    fillDemoLogin("gm@test.pl");
  });

  document.getElementById("fill-player").addEventListener("click", () => {
    fillDemoLogin("gracz@test.pl");
});

  document.getElementById("logout-button").addEventListener("click", logout);

  document.querySelectorAll(".sidebar button[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  document.getElementById("save-content").addEventListener("click", saveGeneratedContent);
});

function fillDemoLogin(email) {
  document.getElementById("login-email").value = email;
  document.getElementById("login-password").value = "demo";
  document.getElementById("login-message").textContent = "";
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const message = document.getElementById("login-message");

  if (email === "gm@test.pl" && password === "demo") {
    loginAs("GM");
    return;
  }

  if (email === "gracz@test.pl" && password === "demo") {
    loginAs("PLAYER");
    return;
  }

  message.textContent = "Nieprawidłowy adres e-mail lub hasło.";
  message.className = "message error";
}

function loginAs(role) {
  currentUser = state.users.find((user) => user.role === role);

  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("app-view").classList.remove("hidden");
  document.getElementById("logout-button").classList.remove("hidden");
  document.getElementById("login-message").textContent = "";

  updateNavigationForRole();
  renderDashboard();
  renderCampaigns();
  renderCampaignSelect();
  renderMaterials();
  renderPlayerView();

  if (role === "PLAYER") {
    showView("player");
  } else {
    showView("dashboard");
  }
}

function logout() {
  currentUser = null;

  document.getElementById("app-view").classList.add("hidden");
  document.getElementById("logout-button").classList.add("hidden");
  document.getElementById("login-view").classList.remove("hidden");
}

function updateNavigationForRole() {
  const buttons = document.querySelectorAll(".sidebar button[data-view]");

  buttons.forEach((button) => {
    const view = button.dataset.view;

    if (currentUser.role === "PLAYER") {
      button.classList.toggle("hidden", view !== "player");
    } else {
      button.classList.remove("hidden");
    }
  });
}

function showView(viewName) {
  document.querySelectorAll(".content .panel").forEach((panel) => {
    panel.classList.add("hidden");
  });

  const selectedView = document.getElementById(`${viewName}-view`);

  if (selectedView) {
    selectedView.classList.remove("hidden");
  }

  if (viewName === "dashboard") renderDashboard();
  if (viewName === "campaigns") renderCampaigns();
  if (viewName === "materials") renderMaterials();
  if (viewName === "player") renderPlayerView();
  if (viewName === "generator") renderCampaignSelect();
}
function generateForCampaign(campaignId) {
    selectedCampaignId = Number(campaignId);
    renderCampaignSelect();
    showView("generator");
}
function renderDashboard() {
  const dashboard = document.getElementById("dashboard-view");

  const campaignsCount = state.campaigns.length;
  const materialsCount = state.generatedContent.length;
  const sharedCount = state.generatedContent.filter((item) => item.isShared).length;

  dashboard.innerHTML = `
    <h2>Panel Mistrza Gry</h2>
    <p>Witaj, ${currentUser.displayName}. To jest demonstracyjny panel aplikacji.</p>

    <div class="stats-grid">
      <div class="card">
        <h3>${campaignsCount}</h3>
        <p>Kampanie</p>
      </div>
      <div class="card">
        <h3>${materialsCount}</h3>
        <p>Zapisane materiały</p>
      </div>
      <div class="card">
        <h3>${sharedCount}</h3>
        <p>Udostępnione graczom</p>
      </div>
    </div>

<div class="card">
  <h3>Szybkie akcje</h3>
  <p>Najczęściej używane funkcje panelu Mistrza Gry.</p>

  <div class="card-actions">
    <button type="button" onclick="showView('campaigns')">Utwórz kampanię</button>
    <button type="button" onclick="showView('generator')">Przejdź do generatora</button>
    <button type="button" onclick="showView('materials')">Zobacz materiały</button>
  </div>
</div>
  `;
}

function renderCampaigns() {
  const campaignsView = document.getElementById("campaigns-view");

  const campaignCards = state.campaigns.map((campaign) => `
    <div class="card">
      <h3>${escapeHTML(campaign.name)}</h3>
      <p>${escapeHTML(campaign.description)}</p>
      <p><strong>System / klimat:</strong> ${escapeHTML(campaign.system || "Nie podano")}</p>
      <p><strong>Utworzono:</strong> ${campaign.createdAt}</p>

      <button type="button" class="secondary generate-for-campaign" data-id="${campaign.id}">
        Generuj treść do kampanii
      </button>
    </div>
  `).join("");

  campaignsView.innerHTML = `
    <h2>Kampanie</h2>

    <form id="campaign-form" class="card">
      <h3>Nowa kampania</h3>

      <label for="campaign-name">Nazwa kampanii</label>
      <input id="campaign-name" type="text" placeholder="np. Dolina Cieni">

      <label for="campaign-description">Opis kampanii</label>
      <textarea id="campaign-description" rows="3" placeholder="Krótki opis kampanii"></textarea>

      <label for="campaign-system">System / klimat</label>
      <input id="campaign-system" type="text" placeholder="np. DCC, dark fantasy">

      <button type="submit">Utwórz kampanię</button>
      <p id="campaign-message"></p>
    </form>

    <h3>Lista kampanii</h3>
    ${campaignCards || "<p>Brak kampanii.</p>"}
  `;

  document.getElementById("campaign-form").addEventListener("submit", createCampaign);
  document.querySelectorAll(".generate-for-campaign").forEach((button) => {
  button.addEventListener("click", () => {
    generateForCampaign(button.dataset.id);
  });
});
}

function createCampaign(event) {
  event.preventDefault();

  const name = document.getElementById("campaign-name").value.trim();
  const description = document.getElementById("campaign-description").value.trim();
  const system = document.getElementById("campaign-system").value.trim();
  const message = document.getElementById("campaign-message");

  if (!name) {
    message.textContent = "Podaj nazwę kampanii.";
    message.className = "message error";
    return;
  }

  const newCampaign = {
    id: Date.now(),
    name,
    description: description || "Brak opisu.",
    system: system || "Nie podano",
    createdAt: new Date().toISOString().slice(0, 10)
  };

  state.campaigns.push(newCampaign);
  selectedCampaignId = newCampaign.id;
  state.campaignMembers.push({
    id: Date.now() + 1,
    userId: currentUser.id,
    campaignId: newCampaign.id,
    role: "GM"
  });

  saveState();

  renderCampaigns();
  renderCampaignSelect();
  renderDashboard();
}

function renderCampaignSelect() {
  const campaignSelect = document.getElementById("campaign-select");

  campaignSelect.innerHTML = state.campaigns.map((campaign) => `
    <option value="${campaign.id}" ${campaign.id === selectedCampaignId ? "selected" : ""}>
      ${escapeHTML(campaign.name)}
    </option>
  `).join("");
}

function saveGeneratedContent() {
  if (!currentUser || currentUser.role !== "GM") {
    return;
  }

  const content = normalizeText(document.getElementById("name-display").innerText);
  const campaignId = Number(document.getElementById("campaign-select").value);
  const isShared = document.getElementById("share-content").checked;
  const gmComment = document.getElementById("gm-comment").value.trim();
  const isCommentShared = document.getElementById("share-comment").checked;
  const message = document.getElementById("save-message");

  const categorySelect = document.getElementById("kategoria");
  const selectedCategoryName =
    categorySelect.options[categorySelect.selectedIndex].textContent;

  if (!content) {
    message.textContent = "Najpierw wygeneruj treść.";
    message.className = "message error";
    return;
  }

  if (!campaignId) {
    message.textContent = "Wybierz kampanię.";
    message.className = "message error";
    return;
  }

  const newContent = {
    id: Date.now(),
    campaignId,
    type: "Wygenerowana treść: " + selectedCategoryName,
    title: selectedCategoryName,
    content,
    gmComment,
    isCommentShared,
    createdAt: new Date().toISOString().slice(0, 10),
    isShared
  };

  state.generatedContent.push(newContent);
  saveState();

  document.getElementById("gm-comment").value = "";
  document.getElementById("share-comment").checked = false;

  message.textContent = "Treść zapisana do kampanii.";
  message.className = "message success";

  renderMaterials();
  renderPlayerView();
  renderDashboard();
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .join("\n");
}

function formatText(text) {
  return escapeHTML(normalizeText(text)).replaceAll("\n", "<br>");
}
function campaignOptions(selectedId = null) {
  return state.campaigns.map((campaign) => `
    <option value="${campaign.id}" ${campaign.id === selectedId ? "selected" : ""}>
      ${escapeHTML(campaign.name)}
    </option>
  `).join("");
}


function renderMaterials() {
  const materialsView = document.getElementById("materials-view");

  const noteForm = currentUser && currentUser.role === "GM"
    ? `
      <form id="manual-note-form" class="card">
        <h3>Nowa notatka MG</h3>

        <label for="note-campaign-select">Kampania</label>
        <select id="note-campaign-select">
          ${campaignOptions()}
        </select>

        <label for="note-title">Tytuł notatki</label>
        <input id="note-title" type="text" placeholder="np. Zawartość znalezionej skrzyni">

        <label for="note-content">Treść notatki</label>
        <textarea id="note-content" rows="4" placeholder="Wpisz treść notatki lub informacji dla kampanii."></textarea>

        <label for="note-gm-comment">Komentarz MG</label>
        <textarea id="note-gm-comment" rows="3" placeholder="Opcjonalny komentarz MG, np. wyjaśnienie dla graczy albo prywatna notatka."></textarea>

        <div class="save-row">
          <label class="share-label">
            <input type="checkbox" id="note-share">
            Udostępnij notatkę graczom
          </label>

          <label class="share-label">
            <input type="checkbox" id="note-share-comment">
            Pokaż komentarz graczom
          </label>

          <button type="submit">Dodaj notatkę</button>
        </div>

        <p id="note-message"></p>
      </form>
    `
    : "";

  const materials = state.generatedContent.map((item) => {
    const campaign = state.campaigns.find((campaign) => campaign.id === item.campaignId);

    return `
      <div class="card">
        <h3>${escapeHTML(item.title)}</h3>
        <p><strong>Kampania:</strong> ${campaign ? escapeHTML(campaign.name) : "Brak kampanii"}</p>
        <p><strong>Typ:</strong> ${escapeHTML(item.type)}</p>
        <div class="material-content">${formatText(item.content)}</div>

        ${
          item.gmComment
            ? `<div class="gm-comment">
                <strong>Komentarz MG:</strong><br>
                ${formatText(item.gmComment)}
                <p><strong>Komentarz widoczny dla gracza:</strong> ${item.isCommentShared ? "Tak" : "Nie"}</p>
              </div>`
            : ""
        }

        <p><strong>Widoczne dla gracza:</strong> ${item.isShared ? "Tak" : "Nie"}</p>

        <div class="card-actions">
          <button class="secondary toggle-share" data-id="${item.id}">
            ${item.isShared ? "Ukryj przed graczami" : "Udostępnij graczom"}
          </button>

          ${
            item.gmComment
              ? `<button class="secondary toggle-comment-share" data-id="${item.id}">
                  ${item.isCommentShared ? "Ukryj komentarz przed graczami" : "Pokaż komentarz graczom"}
                </button>`
              : ""
          }
        </div>
      </div>
    `;
  }).join("");

  materialsView.innerHTML = `
    <h2>Materiały kampanii</h2>
    <p>Lista treści zapisanych przez Mistrza Gry do kampanii.</p>
    ${noteForm}
    ${materials || "<p>Brak zapisanych materiałów.</p>"}
  `;

  const manualNoteForm = document.getElementById("manual-note-form");
  if (manualNoteForm) {
    manualNoteForm.addEventListener("submit", createManualNote);
  }

  document.querySelectorAll(".toggle-share").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const item = state.generatedContent.find((content) => content.id === id);

      if (item) {
        item.isShared = !item.isShared;
        saveState();
        renderMaterials();
        renderPlayerView();
        renderDashboard();
      }
    });
  });

  document.querySelectorAll(".toggle-comment-share").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const item = state.generatedContent.find((content) => content.id === id);

      if (item) {
        item.isCommentShared = !item.isCommentShared;
        saveState();
        renderMaterials();
        renderPlayerView();
      }
    });
  });
}

function createManualNote(event) {
  event.preventDefault();

  const campaignId = Number(document.getElementById("note-campaign-select").value);
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const gmComment = document.getElementById("note-gm-comment").value.trim();
  const isShared = document.getElementById("note-share").checked;
  const isCommentShared = document.getElementById("note-share-comment").checked;
  const message = document.getElementById("note-message");

  if (!title) {
    message.textContent = "Podaj tytuł notatki.";
    message.className = "message error";
    return;
  }

  if (!content) {
    message.textContent = "Wpisz treść notatki.";
    message.className = "message error";
    return;
  }

  const newNote = {
    id: Date.now(),
    campaignId,
    type: "notatka MG",
    title,
    content,
    gmComment,
    isCommentShared,
    createdAt: new Date().toISOString().slice(0, 10),
    isShared
  };

  state.generatedContent.push(newNote);
  saveState();

  renderMaterials();
  renderPlayerView();
  renderDashboard();
}

function renderPlayerView() {
  const playerView = document.getElementById("player-view");

  const sharedMaterials = state.generatedContent.filter((item) => item.isShared);

  const materials = sharedMaterials.map((item) => {
    const campaign = state.campaigns.find((campaign) => campaign.id === item.campaignId);

    return `
      <div class="card">
        <h3>${escapeHTML(item.title)}</h3>
        <p><strong>Kampania:</strong> ${campaign ? escapeHTML(campaign.name) : "Brak kampanii"}</p>
        <div class="material-content">${formatText(item.content)}</div>

        ${
          item.gmComment && item.isCommentShared
            ? `<div class="player-comment">
                <strong>Komentarz Mistrza Gry:</strong><br>
                ${formatText(item.gmComment)}
              </div>`
            : ""
        }
      </div>
    `;
  }).join("");

  playerView.innerHTML = `
    <h2>Widok gracza</h2>
    <p>Gracz widzi tylko materiały udostępnione przez Mistrza Gry.</p>
    ${materials || "<p>Brak udostępnionych materiałów.</p>"}
  `;
}
window.showView = showView;
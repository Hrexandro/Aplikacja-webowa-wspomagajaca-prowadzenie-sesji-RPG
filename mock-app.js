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
      content: "Na skraju mokradeł stoi kamienna kaplica z zatartymi symbolami.",
      createdAt: "2026-06-06",
      isShared: true
    },
    {
      id: 2,
      campaignId: 1,
      type: "notatka MG",
      title: "Tajemnica kultu",
      content: "Kult działa pod przykrywką miejscowego bractwa pogrzebowego.",
      createdAt: "2026-06-06",
      isShared: false
    }
  ]
};

let state = loadState();
let currentUser = null;

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
  document.getElementById("login-gm").addEventListener("click", () => loginAs("GM"));
  document.getElementById("login-player").addEventListener("click", () => loginAs("PLAYER"));

  document.getElementById("login-error").addEventListener("click", () => {
    document.getElementById("login-message").textContent = "Nieprawidłowe dane logowania.";
    document.getElementById("login-message").className = "message error";
  });

  document.getElementById("logout-button").addEventListener("click", logout);

  document.querySelectorAll(".sidebar button[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  document.getElementById("save-content").addEventListener("click", saveGeneratedContent);
});

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
      <p>Utwórz kampanię, wygeneruj treść RPG, zapisz wynik i udostępnij go graczom.</p>
    </div>
  `;
}

function renderCampaigns() {
  const campaignsView = document.getElementById("campaigns-view");

  const campaignCards = state.campaigns.map((campaign) => `
    <div class="card">
      <h3>${campaign.name}</h3>
      <p>${campaign.description}</p>
      <p><strong>System / klimat:</strong> ${campaign.system || "Nie podano"}</p>
      <p><strong>Utworzono:</strong> ${campaign.createdAt}</p>
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
    <option value="${campaign.id}">${campaign.name}</option>
  `).join("");
}

function saveGeneratedContent() {
  if (!currentUser || currentUser.role !== "GM") {
    return;
  }

  const content = document.getElementById("name-display").innerText.trim();
  const campaignId = Number(document.getElementById("campaign-select").value);
  const isShared = document.getElementById("share-content").checked;
  const message = document.getElementById("save-message");

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
    type: "wygenerowana treść",
    title: "Wynik generatora",
    content,
    createdAt: new Date().toISOString().slice(0, 10),
    isShared
  };

  state.generatedContent.push(newContent);
  saveState();

  message.textContent = "Treść zapisana do kampanii.";
  message.className = "message success";

  renderMaterials();
  renderPlayerView();
  renderDashboard();
}

function renderMaterials() {
  const materialsView = document.getElementById("materials-view");

  const materials = state.generatedContent.map((item) => {
    const campaign = state.campaigns.find((campaign) => campaign.id === item.campaignId);

    return `
      <div class="card">
        <h3>${item.title}</h3>
        <p><strong>Kampania:</strong> ${campaign ? campaign.name : "Brak kampanii"}</p>
        <p><strong>Typ:</strong> ${item.type}</p>
        <p>${item.content}</p>
        <p><strong>Widoczne dla gracza:</strong> ${item.isShared ? "Tak" : "Nie"}</p>
        <button class="secondary toggle-share" data-id="${item.id}">
          ${item.isShared ? "Ukryj przed graczem" : "Udostępnij graczowi"}
        </button>
      </div>
    `;
  }).join("");

  materialsView.innerHTML = `
    <h2>Materiały kampanii</h2>
    <p>Lista treści zapisanych przez Mistrza Gry do kampanii.</p>
    ${materials || "<p>Brak zapisanych materiałów.</p>"}
  `;

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
}

function renderPlayerView() {
  const playerView = document.getElementById("player-view");

  const sharedMaterials = state.generatedContent.filter((item) => item.isShared);

  const materials = sharedMaterials.map((item) => {
    const campaign = state.campaigns.find((campaign) => campaign.id === item.campaignId);

    return `
      <div class="card">
        <h3>${item.title}</h3>
        <p><strong>Kampania:</strong> ${campaign ? campaign.name : "Brak kampanii"}</p>
        <p>${item.content}</p>
      </div>
    `;
  }).join("");

  playerView.innerHTML = `
    <h2>Widok gracza</h2>
    <p>Gracz widzi tylko materiały udostępnione przez Mistrza Gry.</p>
    ${materials || "<p>Brak udostępnionych materiałów.</p>"}
  `;
}
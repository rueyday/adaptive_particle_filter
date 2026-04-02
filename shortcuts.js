const DEFAULT_SHORTCUTS = [
  { label: "GitHub",  url: "https://github.com" },
  { label: "Gmail",   url: "https://mail.google.com" },
  { label: "YouTube", url: "https://youtube.com" },
  { label: "Twitter", url: "https://x.com" },
  { label: "Reddit",  url: "https://reddit.com" },
  { label: "ChatGPT", url: "https://chatgpt.com" },
];

let shortcuts = loadShortcuts();
let editPanel = null;

renderShortcuts();

document.getElementById("shortcuts-edit-btn").addEventListener("click", toggleEditMode);

function renderShortcuts() {
  const grid = document.getElementById("shortcuts-grid");
  grid.innerHTML = "";

  shortcuts.forEach(({ label, url }) => {
    const a = document.createElement("a");
    a.className = "shortcut-btn";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    try {
      const img = document.createElement("img");
      img.className = "shortcut-icon";
      img.src = `${new URL(url).origin}/favicon.ico`;
      img.onerror = () => { img.style.display = "none"; };
      a.appendChild(img);
    } catch (_) {}

    const span = document.createElement("span");
    span.className = "shortcut-label";
    span.textContent = label;
    a.appendChild(span);

    grid.appendChild(a);
  });
}

function toggleEditMode() {
  const btn = document.getElementById("shortcuts-edit-btn");
  if (editPanel) {
    closeEditPanel();
    return;
  }

  btn.classList.add("active");
  editPanel = document.createElement("div");
  editPanel.className = "shortcuts-edit-panel";

  function buildRows() {
    editPanel.innerHTML = "";

    shortcuts.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "shortcut-edit-row";

      const nameInput = document.createElement("input");
      nameInput.className = "name-input";
      nameInput.value = s.label;
      nameInput.placeholder = "Name";
      nameInput.addEventListener("input", () => { shortcuts[i].label = nameInput.value; });

      const urlInput = document.createElement("input");
      urlInput.className = "url-input";
      urlInput.value = s.url;
      urlInput.placeholder = "https://...";
      urlInput.addEventListener("input", () => { shortcuts[i].url = urlInput.value; });

      const del = document.createElement("button");
      del.className = "shortcut-delete-btn";
      del.textContent = "×";
      del.title = "Remove";
      del.addEventListener("click", () => {
        shortcuts.splice(i, 1);
        buildRows();
        renderShortcuts();
        saveShortcuts();
      });

      row.appendChild(nameInput);
      row.appendChild(urlInput);
      row.appendChild(del);
      editPanel.appendChild(row);
    });

    const actions = document.createElement("div");
    actions.className = "shortcuts-edit-actions";

    const addBtn = document.createElement("button");
    addBtn.id = "shortcuts-add-row-btn";
    addBtn.textContent = "+ Add shortcut";
    addBtn.addEventListener("click", () => {
      shortcuts.push({ label: "", url: "" });
      buildRows();
      const rows = editPanel.querySelectorAll(".shortcut-edit-row");
      rows[rows.length - 1].querySelector(".name-input").focus();
    });

    const doneBtn = document.createElement("button");
    doneBtn.id = "shortcuts-done-btn";
    doneBtn.textContent = "Done";
    doneBtn.addEventListener("click", closeEditPanel);

    actions.appendChild(addBtn);
    actions.appendChild(doneBtn);
    editPanel.appendChild(actions);
  }

  buildRows();
  document.querySelector(".shortcuts-section").appendChild(editPanel);
}

function closeEditPanel() {
  shortcuts = shortcuts.filter(s => s.label.trim() || s.url.trim());
  saveShortcuts();
  renderShortcuts();
  if (editPanel) {
    editPanel.remove();
    editPanel = null;
  }
  document.getElementById("shortcuts-edit-btn").classList.remove("active");
}

function saveShortcuts() {
  localStorage.setItem("axiom_shortcuts", JSON.stringify(shortcuts));
}

function loadShortcuts() {
  try {
    const saved = JSON.parse(localStorage.getItem("axiom_shortcuts"));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_SHORTCUTS;
  } catch {
    return DEFAULT_SHORTCUTS;
  }
}

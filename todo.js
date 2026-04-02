const DISMISS_DELAY = 10 * 60 * 1000;

let tasks = loadTasks();
const timers = {};

renderTasks();

document.getElementById("todo-add-btn").addEventListener("click", addTask);
document.getElementById("todo-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

function addTask() {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false, doneAt: null });
  saveTasks();
  renderTasks();
  input.value = "";
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (task.done) {
    task.done = false;
    task.doneAt = null;
    clearTimeout(timers[id]);
    delete timers[id];
  } else {
    task.done = true;
    task.doneAt = Date.now();
    scheduleDismiss(task);
  }

  saveTasks();
  renderTasks();
}

function scheduleDismiss(task) {
  const elapsed = Date.now() - task.doneAt;
  const remaining = Math.max(0, DISMISS_DELAY - elapsed);

  clearTimeout(timers[task.id]);
  timers[task.id] = setTimeout(() => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    renderTasks();
  }, remaining);
}

function renderTasks() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "todo-item" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const label = document.createElement("span");
    label.className = "todo-item-text";
    label.textContent = task.text;

    li.appendChild(label);

    if (task.done) {
      const timer = document.createElement("span");
      timer.className = "todo-timer";
      timer.dataset.doneAt = task.doneAt;
      li.appendChild(timer);
      updateTimerDisplay(timer, task.doneAt);
    }

    li.addEventListener("click", () => toggleTask(task.id));
    list.appendChild(li);

    if (task.done) scheduleDismiss(task);
  });
}

setInterval(() => {
  document.querySelectorAll(".todo-timer").forEach(el => {
    updateTimerDisplay(el, Number(el.dataset.doneAt));
  });
}, 1000);

function updateTimerDisplay(el, doneAt) {
  const remaining = Math.max(0, DISMISS_DELAY - (Date.now() - doneAt));
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  el.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
}

function saveTasks() {
  localStorage.setItem("axiom_tasks", JSON.stringify(tasks));
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("axiom_tasks")) || [];
  } catch {
    return [];
  }
}

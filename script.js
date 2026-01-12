// ---- TIME ----
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById("time").textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

// ---- TODO LIST ----
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.textContent = todo.text;
    if (todo.done) li.classList.add("done");

    li.onclick = () => {
      todos[index].done = !todos[index].done;
      saveTodos();
      renderTodos();
    };

    li.oncontextmenu = (e) => {
      e.preventDefault();
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    };

    list.appendChild(li);
  });
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    todos.push({ text: input.value, done: false });
    input.value = "";
    saveTodos();
    renderTodos();
  }
});

renderTodos();

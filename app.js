// app.js

const todoList = document.getElementById("todoList");
const pagination = document.getElementById("pagination");
const loader = document.getElementById("loader");

let todos = []; // All todos from API
let currentPage = 1;
const itemsPerPage = 10;

// 🟢 Fetch Todos
async function fetchTodos() {
  try {
    loader.style.display = "block";
    const res = await fetch("https://dummyjson.com/todos?limit=100");
    const data = await res.json();

    // Add fake createdAt date
    todos = data.todos.map(todo => ({
      ...todo,
      createdAt: new Date(Date.now() - Math.random() * 10000000000) // fake date
    }));

    renderTodos();
  } catch (err) {
    alert("Error fetching todos.");
  } finally {
    loader.style.display = "none";
  }
}

// 🟢 Render Todos
function renderTodos() {
  const filtered = applyFilters(todos);
  const paginated = paginate(filtered, currentPage, itemsPerPage);

  todoList.innerHTML = "";
  paginated.forEach(todo => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = `${todo.todo} - ${todo.createdAt.toDateString()}`;
    todoList.appendChild(li);
  });

  renderPagination(filtered.length);
}

// 🟢 Pagination Helpers
function paginate(arr, page, perPage) {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", () => {
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(li);
  }
}

// 🟢 Add Todo (POST)
document.getElementById("addTodoBtn").addEventListener("click", async () => {
  const input = document.getElementById("newTodoInput");
  const task = input.value.trim();
  if (!task) return alert("Please enter a todo");

  try {
    loader.style.display = "block";
    const res = await fetch("https://dummyjson.com/todos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todo: task, completed: false, userId: 1 }),
    });

    const newTodo = await res.json();
    newTodo.createdAt = new Date(); // Simulate date
    todos.unshift(newTodo);
    input.value = "";
    renderTodos();
  } catch (err) {
    alert("Failed to add todo.");
  } finally {
    loader.style.display = "none";
  }
});

// 🟢 Filters
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderTodos();
});

document.getElementById("filterBtn").addEventListener("click", () => {
  currentPage = 1;
  renderTodos();
});

function applyFilters(data) {
  const searchVal = document.getElementById("searchInput").value.toLowerCase();
  const fromDate = new Date(document.getElementById("fromDate").value);
  const toDate = new Date(document.getElementById("toDate").value);

  return data.filter(todo => {
    const matchesSearch = todo.todo.toLowerCase().includes(searchVal);
    const created = new Date(todo.createdAt);
    const matchesDate =
      (!isNaN(fromDate) ? created >= fromDate : true) &&
      (!isNaN(toDate) ? created <= toDate : true);
    return matchesSearch && matchesDate;
  });
}

// 🟢 Initial Load
fetchTodos();

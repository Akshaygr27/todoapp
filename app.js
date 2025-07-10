// Load todos from localStorage or initialize an empty array
    let todos = JSON.parse(localStorage.getItem("udo_todos")) || [];
    let editIndex = null;
    let deleteIndex = null;

    const form = document.getElementById("todo-form");
    const list = document.getElementById("todo-list");
    const editText = document.getElementById("edit-text");
    const editDate = document.getElementById("edit-date");

    // Generate a simple unique ID using timestamp and random string
    const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Render all todo items into the list container
    const renderTodos = () => {
      list.innerHTML = "";
      // Display the latest todos first
      const reversedTodos = [...todos].reverse();
      reversedTodos.forEach((todo, index) => {
        const card = document.createElement("div");
        card.className = `col-12 fade-in`;
        card.innerHTML = `
          <div class="card todo-card p-3 ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">${todo.text}</h5>
                <small class="text-muted">Due: ${todo.date}</small>
              </div>
              <div class="btn-group">
                <button class="btn btn-sm btn-success" onclick="toggleComplete(${todos.indexOf(todo)})">
                  ${todo.completed ? 'Undo' : 'Done'}
                </button>
                <button class="btn btn-sm btn-primary" onclick="openEdit(${todos.indexOf(todo)})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="openDelete(${todos.indexOf(todo)})">Delete</button>
              </div>
            </div>
          </div>
        `;
        list.appendChild(card);
      });
      // Store updated todos to localStorage
      localStorage.setItem("udo_todos", JSON.stringify(todos));
    };

    // Handle add new todo form submission
    form.onsubmit = (e) => {
      e.preventDefault();
      const text = document.getElementById("todo-text").value;
      const date = document.getElementById("todo-date").value;
      todos.push({ id: generateId(), text, date, completed: false });
      form.reset();
      renderTodos();
    };

    // Toggle completed state of a todo item
    const toggleComplete = (i) => {
      todos[i].completed = !todos[i].completed;
      renderTodos();
    };

    // Open edit modal and populate fields with selected todo
    const openEdit = (i) => {
      editIndex = i;
      editText.value = todos[i].text;
      editDate.value = todos[i].date;
      new bootstrap.Modal(document.getElementById("editModal")).show();
    };

    // Save changes from edit modal
    document.getElementById("saveEdit").onclick = () => {
      todos[editIndex].text = editText.value;
      todos[editIndex].date = editDate.value;
      renderTodos();
      bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    };

    // Open delete confirmation modal
    const openDelete = (i) => {
      deleteIndex = i;
      new bootstrap.Modal(document.getElementById("deleteModal")).show();
    };

    // Confirm and delete todo item
    document.getElementById("confirmDelete").onclick = () => {
      todos.splice(deleteIndex, 1);
      renderTodos();
      bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
    };

    // Initial rendering of todos on page load
    renderTodos();
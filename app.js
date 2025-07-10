// Load todos from localStorage or initialize an empty array
    let todos = JSON.parse(localStorage.getItem("udo_todos")) || [];
    let editIndex = null;
    let deleteIndex = null;

    const form = document.getElementById("todo-form");
    const list = document.getElementById("todo-list");
    const pagination = document.getElementById("pagination");
    const editText = document.getElementById("edit-text");
    const editDate = document.getElementById("edit-date");
    const searchInput = document.getElementById("search-input");
    const noResults = document.getElementById("no-results");

    // Generate a simple unique ID using timestamp and random string
    const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    let currentPage = 1;
    const itemsPerPage = 5;

    // Render all todo items into the list container
    const renderTodos = (filtered = null) => {
      list.innerHTML = "";
      pagination.innerHTML = "";
      const dataToRender = filtered ? [...filtered].reverse() : [...todos].reverse();

      const start = (currentPage - 1) * itemsPerPage;
      const paginatedTodos = dataToRender.slice(start, start + itemsPerPage);

      if (dataToRender.length === 0) {
        noResults.style.display = "block";
      } else {
        noResults.style.display = "none";
      }

      paginatedTodos.forEach((todo) => {
        const index = todos.indexOf(todo);
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
                <button class="btn btn-sm btn-success" onclick="toggleComplete(${index})">
                  ${todo.completed ? 'Undo' : 'Done'}
                </button>
                <button class="btn btn-sm btn-primary" onclick="openEdit(${index})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="openDelete(${index})">Delete</button>
              </div>
            </div>
          </div>
        `;
        list.appendChild(card);
      });
      // Store updated todos to localStorage
      if (!filtered) renderPagination(dataToRender.length);
      localStorage.setItem("udo_todos", JSON.stringify(todos));
    };
    // Render pagination based on total items
    // This function creates pagination links based on the total number of items
    function renderPagination(totalItems) {
      const pageCount = Math.ceil(totalItems / itemsPerPage);
      for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = () => {
          currentPage = i;
          renderTodos();
        };
        pagination.appendChild(li);
      }
    }

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
    
    // Search input filter (case-insensitive)
    searchInput.addEventListener("input", function () {
      const keyword = this.value.trim().toLowerCase();

      if (keyword === "") {
        currentPage = 1;
        renderTodos();
        return;
      }

      const filtered = todos.filter(todo =>
        todo.text.toLowerCase().includes(keyword)
      );

      currentPage = 1;
      renderTodos(filtered);
    });
    // Initial rendering of todos on page load
    renderTodos();
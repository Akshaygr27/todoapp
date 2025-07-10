// Load todos from localStorage or initialize an empty array
    let todos = JSON.parse(localStorage.getItem("udo_todos")) || [];
    let editIndex = null;
    let deleteIndex = null;

    const importFile = document.getElementById("import-file");
    const form = document.getElementById("todo-form");
    const list = document.getElementById("todo-list");
    const pagination = document.getElementById("pagination");
    const editText = document.getElementById("edit-text");
    const editDate = document.getElementById("edit-date");
    const searchInput = document.getElementById("search-input");
    const noResults = document.getElementById("no-results");
    const filterSelect = document.getElementById("filter-select");
    const exportSelect = document.getElementById("export-select");
    const toastEl = document.getElementById("toast");
    const toastBody = document.getElementById("toast-body");
    const toastInstance = new bootstrap.Toast(toastEl);

    // Show toast with message
    function showToast(message) {
      toastBody.textContent = message;
      toastInstance.show();
    }

    // Generate a simple unique ID using timestamp and random string
    const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    let currentPage = 1;
    const itemsPerPage = 5;

    // Render all todo items into the list container
    const renderTodos = (filtered = null) => {
      list.innerHTML = "";
      pagination.innerHTML = "";

      // Get selected filter (all, completed, pending)
      const selectedFilter = filterSelect.value;

      // Prepare data (from filtered search or all todos)
      let dataToRender = filtered ? [...filtered] : [...todos];

      // Apply filter logic
      if (selectedFilter === "completed") {
        dataToRender = dataToRender.filter(todo => todo.completed);
      } else if (selectedFilter === "pending") {
        dataToRender = dataToRender.filter(todo => !todo.completed);
      }

      // Sort latest first
      dataToRender = dataToRender.reverse();

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
      showToast("Task created successfully.");
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
      showToast("Task updated successfully.");
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
      showToast("Task deleted successfully.");
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
    // Filter dropdown change event
    // This function listens for changes in the filter dropdown and re-renders the todos accordingly
    filterSelect.addEventListener("change", () => {
      currentPage = 1;
      renderTodos();
    });
    // download helper function
    function downloadFile(content, fileName, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
    // Handle export on dropdown selection
    exportSelect.addEventListener("change", () => {
      if (!todos.length) {
        alert("No todos to export.");
        exportSelect.value = "-- select --";
        return;
      }

      let content = "";
      const type = exportSelect.value;

      switch (type) {
        case "txt":
          content = todos.map(t => `Task: ${t.text}\nDue: ${t.date}\nCompleted: ${t.completed}\n---`).join("\n");
          downloadFile(content, "todos.txt", "text/plain");
          break;

        case "json":
          content = JSON.stringify(todos, null, 2);
          downloadFile(content, "todos.json", "application/json");
          break;

        case "csv":
          content = "ID,Task,Due Date,Completed\n";
          content += todos.map(t => `${t.id},"${t.text}",${t.date},${t.completed}`).join("\n");
          downloadFile(content, "todos.csv", "text/csv");
          break;

        case "sql":
          content = todos.map(t =>
            `INSERT INTO todos (id, text, date, completed) VALUES ('${t.id.replace(/'/g, "''")}', '${t.text.replace(/'/g, "''")}', '${t.date}', ${t.completed});`
          ).join("\n");
          downloadFile(content, "todos.sql", "text/sql");
          break;
      }

      // Reset to default
      exportSelect.value = "-- select --";
    });
    // Function for import file reader and parser logic
    importFile.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const ext = file.name.split('.').pop().toLowerCase();

        let imported = [];

        try {
          if (ext === "json") {
            // Expecting array of objects with id, text, date, completed
            imported = JSON.parse(content);
          } else if (ext === "csv") {
            // Skip header, split by lines
            const lines = content.trim().split('\n').slice(1);
            imported = lines.map(line => {
              const [id, text, date, completed] = line.split(',');
              return {
                id: id.trim(),
                text: text.replace(/(^\"|\"$)/g, '').trim(),
                date: date.trim(),
                completed: completed.trim() === 'true'
              };
            });
          } else if (ext === "txt") {
            // Very basic format parsing (Task: .., Due: .., Completed: ..)
            const chunks = content.split('---').map(c => c.trim()).filter(Boolean);
            imported = chunks.map(chunk => {
              const lines = chunk.split('\n').map(l => l.trim());
              const text = lines.find(l => l.startsWith("Task:"))?.slice(5).trim() || "";
              const date = lines.find(l => l.startsWith("Due:"))?.slice(4).trim() || "";
              const completed = lines.find(l => l.startsWith("Completed:"))?.slice(10).trim() === "true";
              return { id: generateId(), text, date, completed };
            });
          } else if (ext === "sql") {
            // Parse INSERT statements (very basic)
            const rows = content.match(/INSERT INTO todos.*?VALUES \\((.*?)\\);/gi) || [];
            imported = rows.map(row => {
              const values = row.match(/\\((.*?)\\)/)?.[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')) || [];
              return {
                id: values[0],
                text: values[1],
                date: values[2],
                completed: values[3] === 'true' || values[3] === '1'
              };
            });
          }

          // Merge with current todos
          todos = [...todos, ...imported];
          localStorage.setItem("udo_todos", JSON.stringify(todos));
          renderTodos();

          alert(`Imported ${imported.length} tasks successfully.`);
          importFile.value = ''; // reset input

        } catch (err) {
          alert("Failed to import. Please check file format.");
        }
      };

      reader.readAsText(file);
    });

    // Initial rendering of todos on page load
    renderTodos();
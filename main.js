$(document).ready(function () {
  carregarTarefas();
  setupEventListeners();

  function setupEventListeners() {
    // Menu handlers
    $("#menuButton").on("click", () => $("#popupMenu").fadeIn(200));
    $("#closeMenu").on("click", () => $("#popupMenu").fadeOut(200));
    $("#popupMenu").on("click", closePopupOnOutsideClick);

    // Task handlers
    $("#tarefa-btn").on("click", handleAddTask);
    $(document).on("click", ".delete-btn", handleDeleteTask);
    $(document).on("click", ".complete-btn", handleCompleteTask);
    $(document).on("click", ".confirm-btn", handleConfirmTask);
    $(document).on("click", ".cancel-btn", handleCancelTask);
    $("#clearAllBtn, #clearAll").on("click", handleClearAllTasks);
    $("#collectByDateBtn").on("click", handleCollectByDate);

    // Filter and selection handlers
    $(".filter-btn").on("click", handleFilterTasks);
    $("#prioritySelect").on("change", handlePrioritySelection);

    // Input validation handler
    $("#tarefaInput").on("input", validateInput);
  }

  function handleAddTask() {
    const tarefaText = $("#tarefaInput").val().trim();
    const priority = $("#prioritySelect").val();
    const person = $("#peopleSelect").val();

    if (tarefaText && priority) {
      addTaskToGroup(tarefaText, priority, person);
      clearInputs();
    }
  }

  function addTaskToGroup(text, priority, person) {
    const currentDate = formatCurrentDate();
    const dateGroupId = `date-${currentDate.replace(/\//g, "-")}`;
    let $dateGroup = getOrCreateDateGroup(dateGroupId, currentDate);

    const taskHTML = createTaskHTML(text, priority, person);
    $dateGroup.find(".tasks-for-date").prepend(taskHTML);
    salvarTarefas();
  }

  function formatCurrentDate() {
    return new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  function getOrCreateDateGroup(dateGroupId, displayDate) {
    let $dateGroup = $(`#${dateGroupId}`);

    if ($dateGroup.length === 0) {
      $("#tarefa-List").prepend(`
        <div class="date-group" id="${dateGroupId}">
          <h3 class="date-header">${displayDate}</h3>
          <ul class="tasks-for-date"></ul>
        </div>
      `);
      $dateGroup = $(`#${dateGroupId}`);
    }

    return $dateGroup;
  }

  function createTaskHTML(text, priority, person) {
    const prefix = getPrefixByPriority(priority);
    const formattedText = formatTaskText(text, prefix);
    const priorityClass = `prefix-${priority.toLowerCase().replace(":", "")}`;
    const personClass = person
      ? `prefix-${person.toLowerCase().replace(":", "")}`
      : "";

    return `
      <li>
        <div class="task-content">
          <span class="task-text">
            <span class="task-prefix ${priorityClass}">${priority}</span>
            ${
              person
                ? `<span class="task-prefix ${personClass}">${person}</span>`
                : ""
            }
            ${formattedText}
          </span>
          <button class="complete-btn">Passei para ficha</button>
          <span class="delete-btn"><i class="bi bi-trash-fill"></i></span>
        </div>
        <div class="confirm-buttons" style="display: none;">
          <button class="confirm-btn">Confirmar</button>
          <button class="cancel-btn">Cancelar</button>
        </div>
      </li>`;
  }

  function formatTaskText(text, prefix) {
    return text
      .split(",")
      .map((item) => `${prefix} ${item.trim()}`)
      .join(", ");
  }

  function handleDeleteTask(e) {
    e.stopPropagation();
    $(this)
      .closest("li")
      .fadeOut(300, function () {
        $(this).remove();
        cleanEmptyDateGroups();
        salvarTarefas();
      });
  }

  function handleCompleteTask() {
    const $task = $(this).closest("li");
    $task.find(".confirm-buttons").show();
    $(this).hide();
  }

  function handleConfirmTask() {
    const $task = $(this).closest("li");
    $task.addClass("completed");
    $task.find(".confirm-buttons").hide();
    salvarTarefas();
  }

  function handleCancelTask() {
    const $task = $(this).closest("li");
    $task.find(".confirm-buttons").hide();
    $task.find(".complete-btn").show();
  }

  function handleClearAllTasks() {
    if (confirm("Tem certeza que deseja limpar todas as tarefas?")) {
      $("#tarefa-List").empty();
      localStorage.removeItem("tarefas");
      $("#popupMenu").fadeOut(200);
    }
  }

  function handleFilterTasks() {
    const filter = $(this).data("filter");
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    if (filter === "all") {
      $(".date-group").show();
      $(".date-group li").show();
      return;
    }

    $(".date-group").each(function () {
      const $group = $(this);
      let hasVisibleTasks = false;

      $group.find("li").each(function () {
        const $task = $(this);
        const taskText = $task.find(".task-text").text().toLowerCase();
        let shouldShow = false;

        switch (filter) {
          case "urgente":
            shouldShow =
              taskText.includes("atm") || taskText.includes("urgente");
            break;
          case "importante":
            shouldShow =
              taskText.includes("ats") || taskText.includes("importante");
            break;
          case "normal":
            shouldShow =
              taskText.includes("atv") || taskText.includes("normal");
            break;
          case "b-area-santana":
            shouldShow =
              taskText.includes("b. area santana") ||
              taskText.includes("castro");
            break;
          case "b-area-vitoria":
            shouldShow =
              taskText.includes("b. area vitoria") ||
              taskText.includes("joão vitor");
            break;
        }

        if (shouldShow) {
          hasVisibleTasks = true;
          $task.show();
        } else {
          $task.hide();
        }
      });

      if (hasVisibleTasks) {
        $group.show();
      } else {
        $group.hide();
      }
    });
  }

  function handlePrioritySelection() {
    const selectedPriority = $(this).val();
    $("#peopleSelect optgroup").hide();

    const groupMap = {
      "Montana:": ".group-Montana",
      "Santana:": ".group-Santana",
      "Vitória:": ".group-Vitória",
      "B. AREA SANTANA:": ".group-b-area-santana",
      "B. AREA VITORIA:": ".group-b-area-vitoria",
    };

    if (groupMap[selectedPriority]) {
      $(groupMap[selectedPriority]).show();
    }

    $("#peopleSelect").val("");
  }

  function closePopupOnOutsideClick(e) {
    if (e.target === this) {
      $(this).fadeOut(200);
    }
  }

  function cleanEmptyDateGroups() {
    $(".date-group").each(function () {
      if ($(this).find("li").length === 0) {
        $(this).remove();
      }
    });
  }

  function getPrefixByPriority(priority) {
    const prefixMap = {
      "Montana:": "ATM",
      "Santana:": "ATS",
      "Vitória:": "ATV",
      "B. AREA SANTANA:": "ASA",
      "B. AREA VITORIA:": "AVA",
    };
    return prefixMap[priority] || "";
  }

  function clearInputs() {
    $("#tarefaInput, #prioritySelect, #peopleSelect").val("");
    $("#peopleSelect optgroup").hide();
  }

  function salvarTarefas() {
    localStorage.setItem("tarefas", $("#tarefa-List").html());
  }

  function carregarTarefas() {
    const tarefas = localStorage.getItem("tarefas");
    if (tarefas) {
      $("#tarefa-List").html(tarefas);
    }
  }

  function validateInput() {
    const input = $(this).val();
    const validInput = input.replace(/[^0-9,]/g, "");
    if (input !== validInput) {
      $(this).val(validInput);
    }
  }

  function handleCollectByDate() {
    const tasksByDate = {};

    $(".date-group").each(function () {
      const date = $(this).find(".date-header").text();
      const tasks = $(this)
        .find("li")
        .map(function () {
          return $(this).find(".task-text").text();
        })
        .get();

      tasksByDate[date] = tasks;
    });

    console.log(tasksByDate);
    alert(JSON.stringify(tasksByDate, null, 2));
  }
});

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
    $("#clearAllBtn, #clearAll").on("click", handleClearAllTasks);

    // Filter and selection handlers
    $(".filter-btn").on("click", handleFilterTasks);
    $("#prioritySelect").on("change", handlePrioritySelection);
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
            <span class="delete-btn">&times;</span>
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
});

$(document).ready(function () {
  carregarTarefas();

  $("#tarefaInput").on("input", function () {
    $(this).val(
      $(this)
        .val()
        .replace(/[^0-9,]/g, "")
    );

    $(this).val($(this).val().replace(/,{2,}/g, ","));

    $(this).val($(this).val().replace(/^,/, ""));
  });

  $("#peopleSelect optgroup").hide();

  $("#prioritySelect").on("change", function () {
    const selectedPriority = $(this).val().replace(":", "").toLowerCase();

    $("#peopleSelect optgroup").hide();

    if (selectedPriority) {
      $(`#peopleSelect .group-${selectedPriority}`).show();
    }

    $("#peopleSelect").val("");
  });

  let lastDeletedTask = null;

  $("header").after(`
    <button id="undoButton" style="display: none;">Desfazer última exclusão</button>
  `);

  $(document).on("click", ".delete-btn", function (e) {
    e.stopPropagation();
    const $taskItem = $(this).closest("li");

    lastDeletedTask = {
      html: $taskItem.prop("outerHTML"),
      position: $taskItem.index(),
    };

    $("#undoButton").fadeIn().css("display", "block");

    setTimeout(() => {
      $("#undoButton").fadeOut();
    }, 5000);

    $taskItem.fadeOut(500, function () {
      $(this).remove();
      salvarTarefas();
    });
  });

  $("#undoButton").on("click", function () {
    if (lastDeletedTask) {
      const $taskList = $("#tarefa-List");

      if (lastDeletedTask.position === 0) {
        $taskList.prepend(lastDeletedTask.html);
      } else {
        $taskList
          .children()
          .eq(lastDeletedTask.position - 1)
          .after(lastDeletedTask.html);
      }

      $taskList.find("li").last().hide().fadeIn();

      lastDeletedTask = null;
      $(this).fadeOut();

      salvarTarefas();
    }
  });

  $("#clearAll").on("click", function () {
    if (
      confirm(
        "Tem certeza que deseja limpar todas as tarefas? você não poderá desfazer essa ação."
      )
    ) {
      $("#tarefa-List").empty();
      localStorage.removeItem("tarefas");
    }
  });

  $("#tarefa-btn").on("click", function () {
    let tarefaText = $("#tarefaInput").val().trim();
    const selectedPriority = $("#prioritySelect").val();
    const selectedPerson = $("#peopleSelect").val();
    if (tarefaText.length > 0) {
      let prefix = "";
      switch (selectedPriority) {
        case "URGENTE:":
          tarefaText = tarefaText
            .split(",")
            .map((item) => "ATM " + item.trim())
            .join(", ");
          prefix += `<span class="task-prefix prefix-urgente">${selectedPriority}</span>`;
          break;
        case "IMPORTANTE:":
          tarefaText = tarefaText
            .split(",")
            .map((item) => "ATS " + item.trim())
            .join(", ");
          prefix += `<span class="task-prefix prefix-importante">${selectedPriority}</span>`;
          break;
        case "NORMAL:":
          tarefaText = tarefaText
            .split(",")
            .map((item) => "ATV " + item.trim())
            .join(", ");
          prefix += `<span class="task-prefix prefix-normal">${selectedPriority}</span>`;
          break;
      }

      if (selectedPerson) {
        const personClass = `prefix-${selectedPerson
          .toLowerCase()
          .replace(":", "")}`;
        prefix += `<span class="task-prefix ${personClass}">${selectedPerson}</span>`;
      }

      const currentDate = new Date().toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const taskHTML = `
          <li>
            <div class="task-content">
              <span class="task-text">${prefix}${tarefaText}</span>
              <span class="delete-btn">&times;</span>
            </div>
            <div class="task-date">Criado em: ${currentDate}</div>
          </li>`;

      $("#tarefa-List").append(taskHTML);

      $("#tarefaInput").val("");
      $("#prioritySelect").val("");
      $("#peopleSelect").val("");

      salvarTarefas();
    }
  });

  $(document).on("click", "li", function (e) {
    if (!$(e.target).hasClass("delete-btn")) {
      $(this).toggleClass("completed");
      salvarTarefas();
    }
  });

  $(document).on("click", ".delete-btn", function (e) {
    e.stopPropagation();
    $(this)
      .closest("li")
      .fadeOut(500, function () {
        $(this).remove();
        salvarTarefas();
      });
  });

  function salvarTarefas() {
    const tarefas = $("#tarefa-List").html();
    localStorage.setItem("tarefas", tarefas);
  }

  function carregarTarefas() {
    const tarefas = localStorage.getItem("tarefas");
    if (tarefas) {
      $("#tarefa-List").html(tarefas);
    }
  }
});

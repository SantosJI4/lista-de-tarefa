$(document).ready(function() {
    carregarTarefas()

    $('#tarefa-btn').on('click', function () {
        var tarefaText = $('#tarefaInput').val()
        if (tarefaText.length > 0) {
            addTarefa(tarefaText)
            salvarTarefas()
            $('#tarefaInput').val('')
        }
    })
    function addTarefa(text) {
        $('#tarefa-List').append('<li><span>&times;</span>' + text + '</li>')
    }

    $(document).on('click', 'li', function() {
        $(this).toggleClass('completed')
        salvarTarefas()
    })
    $(document).on('click', 'span', function(e) {
        e.stopPropagation()
        $(this).parent().fadeOut(500, function() {
            $(this).remove()
            salvarTarefas()
        })
    })


    function salvarTarefas() {
        var tarefas = $('#tarefa-List').html()
        localStorage.setItem('tarefas', tarefas)
    }
    function carregarTarefas() {
        var tarefas = localStorage.getItem('tarefas')
        if (tarefas) {
            $('tarefa-List').html(tarefas)
        }
    }
})
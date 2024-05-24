$(document).ready(function () {
    $('#CPF').mask('000.000.000-00', { reverse: true });
    $('#CPFBeneficiario').mask('000.000.000-00', { reverse: true });

    $('#btBeneficiarios').click(function (event) {
        event.preventDefault();
        $('#beneficarioForms').modal('show');
    });

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        let beneficiarios = [];

        $('#tabelaBeneficiarios tbody tr').each(function () {
            var id = $(this).find('td:eq(0)').text();
            const cpf = $(this).find('td:eq(1)').text();
            const nome = $(this).find('td:eq(2)').text();
            beneficiarios.push({ Id: id, CPF: cpf, Nome: nome });
        });

        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                "Nome": $(this).find("#Nome").val(),
                "CEP": $(this).find("#CEP").val(),
                "Email": $(this).find("#Email").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Telefone": $(this).find("#Telefone").val(),
                "CPF": $(this).find("#CPF").val(),
                "Beneficiarios": beneficiarios
            },
            error: function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", r.responseJSON);
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
            },
            success: function (r) {
                ModalDialog("Sucesso!", r)
                $("#formCadastro")[0].reset();
            }
        });
    });

    $('#formIncluirBeneficiario').submit(function (e) {
        e.preventDefault();

        var cpf = $('#CPFBeneficiario').val();
        var nome = $('#NomeBeneficiario').val();

        var newRow = '<tr>' +
            '<td class="hidden-xs hidden"></td>' +
            '<td>' + cpf + '</td>' +
            '<td>' + nome + '</td>' +
            '<td class="text-center">' +
            '<button type="button" class="btn btn-sm btn-primary btn-alterar" style="margin-right: 0.4rem">Alterar</button>' +
            '<button type="button" class="btn btn-sm btn-primary btn-excluir">Excluir</button>' +
            '</td>' +
            '</tr>';

        $('#tabelaBeneficiarios tbody').append(newRow);

        $('#CPFBeneficiario').val('');
        $('#NomeBeneficiario').val('');
    });

    $('#tabelaBeneficiarios').on('click', 'button.btn-excluir', function () {
        var linha = $(this).closest('tr');

        linha.remove();
    });

    $('#tabelaBeneficiarios').on('click', 'button.btn-alterar', function () {
        var linha = $(this).closest('tr');

        if (linha.hasClass('em-edicao')) {
            var inputs = linha.find('input');
            var valores = [];

            inputs.each(function () {
                valores.push($(this).val());
            });

            linha.find('td:eq(1)').text(valores[0]);
            linha.find('td:eq(2)').text(valores[1]);

            $(this).text('Alterar');
            $(this).removeClass('btn-success');

            linha.removeClass('em-edicao');
        } else {
            var tdCPF = linha.find('td:eq(1)');
            var tdNome = linha.find('td:eq(2)');

            tdCPF.html('<div class="input-group"><input id="beneficiario_Alt_CPF" type="text" class="form-control" style="width: 13rem;" value="' + tdCPF.text() + '"></div>');
            tdNome.html('<div class="input-group"><input type="text" class="form-control" style="width: 150px;" value="' + tdNome.text() + '"></div>');
            $('#beneficiario_Alt_CPF').mask('000.000.000-00', { reverse: true });

            $(this).text('Salvar');

            linha.addClass('em-edicao');

            $(this).addClass('btn-success');
        }
    });
});

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}
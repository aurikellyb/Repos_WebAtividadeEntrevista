$(document).ready(function () {
    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);
        $('#formCadastro #CPF').val(obj.CPF).mask('000.000.000-00', { reverse: true });

        $('#tabelaBeneficiarios tbody').empty();

        $.each(obj.Beneficiarios, function (index, beneficiario) {
            var cpf = beneficiario.CPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

            var newRow = '<tr>                                       ' +
                '<td class="hidden-xs hidden">' + beneficiario.Id + '</td>                                                              ' +
                '<td>' + cpf + '</td>                            ' +
                '<td>' + beneficiario.Nome + '</td>                          ' +
                '<td class="text-center">                                                                             ' +
                '<button type="button" class="btn btn-sm btn-primary btn-alterar" style="margin-right: 0.4rem">Alterar</button>   ' +
                '<button type="button" class="btn btn-sm btn-primary btn-excluir">Excluir</button>                                ' +
                '</td>                                                                                                ' +
                '</tr>                                                                                                ';

            $('#tabelaBeneficiarios tbody').append(newRow);
        });
    }

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
            error:
                function (r) {
                    if (r.status == 400)
                        ModalDialog("Ocorreu um erro", r.responseJSON);
                    else if (r.status == 500)
                        ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                },
            success:
                function (r) {
                    ModalDialog("Sucesso!", r)
                    $("#formCadastro")[0].reset();
                    window.location.href = urlRetorno;
                }
        });
    })

    $('#formIncluirBeneficiario').submit(function (e) {
        e.preventDefault();

        const cpf = $('#CPFBeneficiario').val();
        const nome = $('#NomeBeneficiario').val();

        if (!cpf || !nome) {
            ModalDialog("Erro", "CPF e Nome são obrigatórios.");
            return;
        }

        const newRow =
            `<tr>
            <td class="hidden-xs hidden"></td>
            <td>${cpf}</td>
            <td>${nome}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-primary btn-alterar" style="margin-right: 0.4rem">Alterar</button>
                <button type="button" class="btn btn-sm btn-primary btn-excluir">Excluir</button>
            </td>
            </tr>`;

        $('#tabelaBeneficiarios tbody').append(newRow);

        limparCamposBeneficiario();
    });

    $('#tabelaBeneficiarios').on('click', 'button.btn-excluir', function () {
        var linha = $(this).closest('tr');

        linha.remove();
    });

    $('#tabelaBeneficiarios').on('click', 'button.btn-alterar', function () {
        var linha = $(this).closest('tr');
        var tdCPF = linha.find('td:eq(1)');
        var tdNome = linha.find('td:eq(2)');

        if (linha.hasClass('em-edicao')) {
            salvarEdicao(linha);
        } else {
            entrarModoEdicao(linha, tdCPF, tdNome);
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

function limparCamposBeneficiario() {
    $('#CPFBeneficiario').val('');
    $('#NomeBeneficiario').val('');
}

function entrarModoEdicao(linha, tdCPF, tdNome) {
    var cpfAtual = tdCPF.text();
    var nomeAtual = tdNome.text();

    var htmlCPF = '<div class="input-group"><input id="beneficiario_Alt_CPF" type="text" class="form-control cpf-input" value="' + cpfAtual + '"></div>';
    var htmlNome = '<div class="input-group"><input type="text" class="form-control nome-input" value="' + nomeAtual + '"></div>';

    tdCPF.html(htmlCPF);
    tdNome.html(htmlNome);

    $('#beneficiario_Alt_CPF').mask('000.000.000-00', { reverse: true });

    linha.addClass('em-edicao');
    linha.find('.btn-alterar').text('Salvar').addClass('btn-success');
}

function salvarEdicao(linha) {
    var tdCPF = linha.find('.cpf-input');
    var tdNome = linha.find('.nome-input');

    var novoCPF = tdCPF.val();
    var novoNome = tdNome.val();

    linha.find('td:eq(1)').text(novoCPF);
    linha.find('td:eq(2)').text(novoNome);

    linha.removeClass('em-edicao');
    linha.find('.btn-alterar').text('Alterar').removeClass('btn-success');
}
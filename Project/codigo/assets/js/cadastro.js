$(document).ready(function () {

    // const apiUrl = 'http://localhost:3000/logado';

    // async function deleteAllLogins() {
    //     try {
    //         const response = await axios.get(apiUrl);
    //         const logins = response.data;

    //         const deletePromises = logins.map(login => axios.delete(`${apiUrl}/${login.id}`));
    //         await Promise.all(deletePromises);

    //     } catch (error) {
    //         console.error('Erro ao deletar os registros:', error);
    //     }
    // }

    // async function login(dados) {
    //     try {
    //         await deleteAllLogins();
    //         localStorage.setItem("user", JSON.stringify(dados))
    //         const response = await axios.post('http://localhost:3000/logado', dados);
    //         window.location.href = 'calendario.html';
    //         console.log('Login realizado com sucesso:', response.data);
    //     } catch (error) {
    //         console.error('Erro ao realizar o login:', error);
    //     }
    // }


    //mascara CPF
    $(document).on('input', '#cpf', function () {
        let value = $(this).val();

        value = value.replace(/\D/g, '').substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        $(this).val(value);
    });

    $('#checkedBox input[name="role"]').change(function () {
        var isParticipante = $('#participante').is(':checked');

        if (isParticipante) {
            $('#imputOrganizador').remove();
        } else {
            if (!$('#imputOrganizador').length) {
                var imputOrganizadorHtml = `
                    <div class="row" id="imputOrganizador">
                      <div class="col-md-6 mb-3">
                        <div class="input-group">
                          <span class="input-group-text"><i class="bi bi-building"></i></span>
                          <input type="text" class="form-control" id="vinculo" placeholder="Vínculo com a instituição" required maxlength="14">
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <div class="input-group">
                          <span class="input-group-text"><i class="bi bi-card-list"></i></span>
                          <input type="text" class="form-control" id="cpf" placeholder="CPF" required>
                        </div>
                      </div>
                    </div>
                `;
                $('#alertContainer').before(imputOrganizadorHtml);
            }
        }
    });

    if ($('#participante').is(':checked')) {
        $('#imputOrganizador').remove();
    } else {
        if (!$('#imputOrganizador').length) {
            var imputOrganizadorHtml = `
                <div class="row" id="imputOrganizador">
                  <div class="col-md-6 mb-3">
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-building"></i></span>
                      <input type="text" class="form-control" id="vinculo" placeholder="Vínculo com a instituição" required maxlength="14">
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-card-list"></i></span>
                      <input type="text" class="form-control" id="cpf" placeholder="CPF" required>
                    </div>
                  </div>
                </div>
            `;
            $('#alertContainer').before(imputOrganizadorHtml);
        }
    }

    $('#btnCadastro').click(async function () {

         let Validado = ImputValidation();
         let SameEmail = await HaveSameEmail();
        if (Validado && !SameEmail) {
            var DbCadastro = {
                nome: {
                    primeiroNome: $('#PrimeiroNome').val(),
                    ultimoNome: $('#UltimoNome').val()
                },
                email: $('#email').val(),
                senha: CryptoJS.MD5($('#senha').val()).toString(),
                nomeuniversidade: $('#nomeuniversidade').val(),
                universidadeID: $('#universidadeID').val(),
                TipoUsuario: $('input[name="role"]:checked').val(),
                vinculo: $('#vinculo').val(),
                cpf: $('#cpf').val(),
                fotoPerfil: ""
            };

            console.log(DbCadastro);



            fetch('http://localhost:3000/cadastros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(DbCadastro)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    swal.fire({
                        title: 'Cadastro realizado com sucesso',
                        icon: 'success',
                        text: "Você será redirecionado para a página principal"
                    }).then((result => {
                        if (result.isConfirmed) {
                            window.location.href = 'login.html';
                        }
                    }))
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    });


    function ImputValidation() {

        let inputvalido = true;
        $('input[required]').each(function () {
            if ($(this).val() === '') {
                ShowAlert(`O campo ${$(this).attr('placeholder')} é obrigatório.`, "danger");
                inputvalido = false;
                return false;
            }
        });

        if (!inputvalido) { return false; }

        if ($('#confirmEmail').val() !== $('#email').val()) {
            ShowAlert("Os endereços de email não se coincidem. Por favor, verifique e tente novamente.", "danger");
            return false;
        }

        if (!$('#email').val().split('').includes('@')) {
            ShowAlert("Os endereços de email não se coincidem. Por favor, verifique e tente novamente.", "danger");
            return false;
        }

        if ($('#senha').val() !== $('#confirmSenha').val()) {
            ShowAlert("As senhas não coincidem. Por favor, verifique e tente novamente.", "danger");
            return false;
        }

        if ($('#senha').val().length < 5) {
            ShowAlert("Senha muito fraca", "danger");
            return false;
        }


        if ($('#imputOrganizador').length) {
            if ($('#cpf').val().length != 14) {
                ShowAlert("CPF invalido, CPF possui 11 digitos.", "danger");
                return false;
            }
        }

        return true;

    }

     async function HaveSameEmail(){
        const email = $('#email').val();
        const response = await fetch('http://localhost:3000/cadastros');
        const cadastros = await response.json();
          const sameEmail = cadastros.find(cadastro => cadastro.email === email);
          if (sameEmail){
            ShowAlert("Já existe um usuario com esse email", "danger");
            return true;
          }
          else{
            return false;
          }
    }

    

    function ShowAlert(message, type = "danger") {
        let alertContainer = $("#alertContainer");

        let alertDiv = $(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);

        alertContainer.append(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    
    $('#btnGoLogin').on('click', function() {
        window.location.href = 'login.html';
    });



});

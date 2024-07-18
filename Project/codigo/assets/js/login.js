$(document).ready(function () {
    const apiUrl = 'http://localhost:3000/logado';

    async function deleteAllLogins() {
        try {
            const res = await axios.get('http://localhost:3000/logado');
            const logins = res.data;

            const deletePromises = logins.map(login => axios.delete(`${apiUrl}/${login.id}`));
            await Promise.all(deletePromises);

        } catch (error) {
            console.error('Erro ao deletar os registros:', error);
        }
    }



    async function login(user) {
        try {

           
            await deleteAllLogins();
            localStorage.setItem("user", JSON.stringify(user)); 
            const res = await axios.post('http://localhost:3000/logado', user);
            swal.fire({
                title: 'Login realizado com sucesso',
                icon: 'success',
                text: "Você será redirecionado para a página principal"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'calendario.html';
                }
            });
        } 
        catch (error) {
            swal.fire({
                title: 'Erro ao realizar o login',
                icon: 'error',
                text: 'Verifique suas credenciais e tente novamente'
            });
            console.error(error);
        }
    }


    $('#btnEntrar').click(function () {
        const email = $('#emailLogin').val();
        const senha = CryptoJS.MD5($('#senhaLogin').val()).toString();              
        console.log(email+","+senha);
        fetch('http://localhost:3000/cadastros')
            .then(response => response.json())
            .then(cadastros => {

              const usuario = cadastros.find(cadastro => cadastro.email === email && cadastro.senha === senha);
                console.log(usuario);
                if (usuario) {
                    login(usuario); 
                } else {
                    
                    swal.fire({
                        title: 'Login falhou',
                        icon: 'error',
                        text: 'Email ou senha incorretos'
                    });
                }
            })
            .catch(error => {
                swal.fire({
                    title: 'Erro ao buscar usuários',
                    icon: 'error',
                    text: 'Houve um problema ao buscar os usuários. Tente novamente mais tarde.'
                });
                console.error('Erro ao buscar usuários:', error);
            });
    });

    $('#btnGoCadastro').on('click', function() {
        window.location.href = 'cadastro.html';
    });
});

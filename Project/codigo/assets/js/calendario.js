document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar;
    buscarUser()


    buscarEventos()
        .then(eventos => {
            calendar = new FullCalendar.Calendar(calendarEl, {
                themeSystem: 'bootstrap',
                eventColor: 'green',
                nextDayThreshold: '09:00:00',
                eventContent: function (arg) {
                    return {
                        html: '<b>' + arg.timeText + '</b> ' + arg.event.title
                    };
                },
                events: eventos,
                height: 'auto',
                aspectRatio: 1.5,
                locale: 'pt-br',
                eventClick: function (arg) {
                    chamaEvento(arg.event.title)
                },
                eventClassNames: function () {
                    return ['custom-event'];
                }
            });

            calendar.render();
        })
        .catch(error => {
            console.error('Erro ao buscar eventos:', error);
        });
});

$(document).ready(function () {
    $("#lastButton").click(function () {
        $("#modalNovoEvento").modal("show");
    });
});

$('#preco').change(function () {
    let valor = $(this).val().replace(/[^\d,]/g, '');

    let valorNumerico = parseFloat(valor.replace('.', '').replace(',', '.'));

    let valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    if ($(this).val().trim() == "" || $(this).val().trim() == "R$") {
        $(this).val("");
    } else {
        $(this).val(valorFormatado);
    }

    //console.log(valor, valorFormatado);
});

function buscarEventos() {
    return fetch("http://localhost:3000/eventos")
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao fazer a requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            let eventos = []

            data.forEach(dado => {
                let evento = ""
                let color = ""
                if (dado.tipo == "1") {
                    color = "#8A2BE2"
                } else {
                    color = "#21a34f"
                }
                evento = {
                    "title": dado.nomeEvento,
                    "start": dado.dataInicio,
                    "end": dado.dataFim,
                    "color": color,
                    "display": "block"
                }
                eventos.push(evento)
            });

            return eventos
        })
        .catch(error => {
            console.error('Ocorreu um erro:', error);
        });
}



$('#salvar').click(async function () {
    var request = true
    var nomeEvento = $('#nomeEvento').val()
    var dataInicio = $('#dataInicio').val()
    var dataFim = $('#dataFim').val()
    var participantes = $('#qtdPessoas').val()
    var cep = $('#cep').val().replace("-", "")
    var rua = $('#rua').val()
    var uf = $('#uf').val()
    var bairro = $('#bairro').val()
    var cidade = $('#cidade').val()
    var preco = $('#preco').val().replace("R$", "")
    var tipo = $('#tipo').val()
    var descricao = $('#descricao').val()

    // console.log({
    //     nomeEvento,
    //     dataInicio,
    //     dataFim,
    //     participantes,
    //     cep,
    //     preco,
    //     tipo,
    //     descricao
    // })


    if (nomeEvento.trim() == "" ||
        dataInicio.trim() == "" ||
        dataFim.trim() == "" ||
        participantes == "" ||
        cep.trim() == "" ||
        tipo == null
    ) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Preencha os campos obrigatórios!',
        });

        request = false
    }


    if (!request) {
        return
    }

    const resposta = await axios.get('http://localhost:3000/logado');
    const usuario = resposta.data[0].id;

    console.log(usuario);




    const url = 'http://localhost:3000/eventos';

    const data = {
        nomeEvento,
        dataInicio,
        dataFim,
        participantes,
        confirmados: [],
        cep,
        rua,
        cidade,
        bairro,
        uf,
        preco,
        tipo,
        usuario,
        descricao
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao fazer a requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Evento cadastrado com sucesso!',
            }).then(function () {
                $("#modalNovoEvento").modal("toggle");
                $('#nomeEvento').val("")
                $('#dataInicio').val("")
                $('#dataFim').val("")
                $('#qtdPessoas').val("")
                $('#cep').val("")
                $('#rua').val("")
                $('#bairro').val("")
                $('#cidade').val("")
                $('#preco').val("")
                $('#tipo').val("")
                $('#descricao').val("")
                var calendarEl = document.getElementById('calendar');
                var calendar;
                buscarEventos()
                    .then(eventos => {
                        calendar = new FullCalendar.Calendar(calendarEl, {
                            themeSystem: 'bootstrap',
                            eventColor: 'green',
                            nextDayThreshold: '09:00:00',
                            eventContent: function (arg) {
                                return {
                                    html: '<b>' + arg.timeText + '</b> ' + arg.event.title
                                };
                            },
                            events: eventos,
                            height: 'auto',
                            aspectRatio: 1.5,
                            locale: 'pt-br'
                        });

                        calendar.render();
                    })
                    .catch(error => {
                        console.error('Erro ao buscar eventos:', error);
                    });
            });
        })
        .catch(error => {
            console.error('Ocorreu um erro:', error);
        });



})

function searchArray() {
    let texto = $('#searchInput').val();
    let html = ""

    if (texto.trim() != "") {
        $('#searchResults').removeClass('d-none')
        $('#searchResults').addClass('d-flex, flex-column,gap-1')
        let regex = new RegExp(texto, 'i');
        let filtro = search.filter((s) => regex.test(s.nomeEvento));
        let id = ""
        filtro.forEach(dado => {
            if (dado.tipo == "1") {
                id = 'festa'
            } else {
                id = 'palestra'
            }
            html += `<div class='search w-100 p-1 bolder' onclick='editaEvento("${dado.id}")' id='${id}'>${dado.nomeEvento}</div>`
        })
    } else {
        $('#searchResults').removeClass('d-flex')
        $('#searchResults').addClass('d-none')
    }
    $('#searchResults').html(html)
}

var search = []
$('#searchInput').click(function () {
    axios.get('http://localhost:3000/eventos')
        .then(function (response) {
            // console.log(response.data)
            search = []
            response.data.forEach(dado => {

                search.push(dado)
            })
            searchArray()
        })
        .catch(function (error) {
            console.log(error);
        })
})

$('#searchInput').keyup(function () {
    searchArray()
})



// $('#searchInput').change(function(){
//     $('#searchResults').removeClass('d-flex')
//     $('#searchResults').addClass('d-none')
// })




async function buscarUser() {
    await axios.get(`http://localhost:3000/logado`)
        .then(function (response) {
            //console.log(response.data[0])
            let user = response.data[0]
            $('#usuario').text(`${user.nome.primeiroNome} ${user.nome.ultimoNome}`)

            const profilePicture = user.fotoPerfil === "" ? "https://sistemas.ft.unicamp.br/sgpg/imagens/sem_foto.png" : user.fotoPerfil;

            $("#ftSaldacao").attr("src", profilePicture);
            $("#ftPerfil").attr("src", profilePicture);



            if (user.TipoUsuario == "organizador") {
                $('#lastButton').removeClass('d-none')
                $('#lastButton').addClass('d-flex')
                $('#eventoOrganizador').removeClass('d-none')
                $('#eventoOrganizador').addClass('d-flex')
                $('#eventoUsuario').removeClass('d-flex')
                $('#eventoUsuario').addClass('d-none')
            } else {
                $('#lastButton').addClass('d-none')
                $('#lastButton').removeClass('d-flex')
                $('#eventoUsuario').removeClass('d-none')
                $('#eventoUsuario').addClass('d-flex')
                $('#eventoOrganizador').removeClass('d-flex')
                $('#eventoOrganizador').addClass('d-none')
                $('#confirmar').removeClass("d-none")
                $('#confirmar').attr("user", user.id)
                $('#cancelar').attr("user", user.id)
            }

        })
        .catch(function (error) {
            console.log(error);
        })
}


function mascaraCEP(input) {
    let value = input.value;
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");

    input.value = value;
}

$('#cep').change(function () {
    let cep = $(this).val().replace("-", "")

    axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        .then(function (response) {

            console.log(response)
            let info = response.data

            $('#rua').val(info.logradouro)
            $('#bairro').val(info.bairro)
            $('#cidade').val(info.localidade)
            $('#uf').val(info.uf)

        })
        .catch(function (error) {
            console.log(error);
        })
})

$('#confirmar').click(function () {
    let id = $(this).attr('evento');
    let userId = $(this).attr('user');
    axios.get(`http://localhost:3000/eventos?id=${id}`)
        .then(function (response) {
            if (response.data.length > 0) {
                let evento = response.data[0];
                let confirmados = evento.confirmados;
                if (confirmados.length < evento.participantes && !confirmados.includes(userId)) {
                    confirmados.push(userId);
                    axios.patch(`http://localhost:3000/eventos/${id}`, {
                        confirmados: confirmados
                    })
                        .then(function (response) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Sucesso!',
                                text: 'Presença confirmada!',
                                showConfirmButton: false
                            });
                            $('#confirmar').addClass("d-none");
                            $('#cancelar').removeClass("d-none");
                            editaEvento(id)
                        })
                        .catch(function (error) {
                            console.error("Erro no PATCH:", error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Erro!',
                                text: 'Ocorreu um erro ao confirmar presença.',
                                showConfirmButton: false
                            });
                        });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Limite de participantes atingido!',
                        showConfirmButton: false
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Evento não encontrado.',
                    showConfirmButton: false
                });
            }
        })
        .catch(function (error) {
            console.error("Erro no GET:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Ocorreu um erro ao obter os dados do evento.',
                showConfirmButton: false
            });
        });
});


$('#cancelar').click(function () {
    let id = $(this).attr('evento');
    let userId = $(this).attr('user');
    axios.get(`http://localhost:3000/eventos?id=${id}`)
        .then(function (response) {
            if (response.data.length > 0) {
                var evento = response.data[0];
                let confirmados = evento.confirmados;
                let index = confirmados.indexOf(userId);
                if (index > -1) {
                    confirmados.splice(index, 1);
                }
                axios.patch(`http://localhost:3000/eventos/${id}`, {
                    confirmados: confirmados
                })
                    .then(function (response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesso!',
                            text: 'Presença cancelada!',
                            showConfirmButton: false
                        });
                        $('#cancelar').addClass("d-none");
                        $('#confirmar').removeClass("d-none");
                        editaEvento(id);
                    })
                    .catch(function (error) {
                        console.error("Erro no PATCH:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro!',
                            text: 'Ocorreu um erro ao cancelar presença.',
                            showConfirmButton: false
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Evento não encontrado.',
                    showConfirmButton: false
                });
            }
        })
        .catch(function (error) {
            console.error("Erro no GET:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Ocorreu um erro ao obter os dados do evento.',
                showConfirmButton: false
            });
        });
});

function chamaEvento(nome) {
    axios.get(`http://localhost:3000/eventos?nomeEvento=${nome}`)
        .then(function (response) {
            let evento = response.data[0]
            editaEvento(evento.id)
        })
}


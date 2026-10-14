const API_URL = 'http://localhost:3000';

// 1. Carrega os laboratórios do banco de dados para dentro do <select> assim que a página abre
async function carregarLaboratorios() {
    try {
        const resposta = await fetch(`${API_URL}/laboratorios`);
        const laboratorios = await resposta.json();

        const selectLab = document.getElementById('lab');
        selectLab.innerHTML = '<option value="">Selecione um laboratório</option>';

        laboratorios.forEach(lab => {
            const option = document.createElement('option');
            option.value = lab.id; // Guarda o ID do laboratório
            option.textContent = lab.nome; // Mostra o nome na tela
            selectLab.appendChild(option);
        });
    } catch (erro) {
        console.error('Erro ao carregar laboratórios:', erro);
    }
}

// Executa a função de carregar os labs ao abrir a página
carregarLaboratorios();


// 2. Evento de envio do formulário (Validação + Conflito de Horário + Envio para a API)
document.getElementById('form-reserva').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Captura os valores dos campos
    const lab_id = document.getElementById('lab').value;
    const data = document.getElementById('data').value;
    const inicio = document.getElementById('inicio').value;
    const fim = document.getElementById('fim').value;
    const divMensagem = document.getElementById('mensagem');

    // Validação: Verificar se o horário de término é posterior ao de início
    if (inicio >= fim) {
        divMensagem.innerHTML = `<p style="color: red; font-weight: bold;">Erro: O horário de término deve ser posterior ao horário de início.</p>`;
        return;
    }

    // Validação de Data: Garantir que não é uma data no passado
    const hoje = new Date().toISOString().split('T')[0];
    if (data < hoje) {
        divMensagem.innerHTML = `<p style="color: red; font-weight: bold;">Erro: Não é possível fazer reservas para datas passadas.</p>`;
        return;
    }

    // Objeto com os dados para enviar via API
    const dadosReserva = { lab_id, data, inicio, fim };

    try {
        // Envia os dados para a API salvar no SQLite
        const resposta = await fetch(`${API_URL}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosReserva)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            // Formatação da data para o padrão brasileiro (DD/MM/AAAA)
            const [ano, mes, dia] = data.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            // Pega o texto do laboratório selecionado para mostrar na mensagem
            const selectLab = document.getElementById('lab');
            const nomeLab = selectLab.options[selectLab.selectedIndex].text;

            // Exibe os dados informados com sucesso
            divMensagem.innerHTML = `
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin-top: 15px;">
                    <p style="color: #16a34a; font-weight: bold; margin-bottom: 10px;">${resultado.mensagem}</p>
                    <ul style="list-style-type: none; padding: 0; margin: 0; color: #166534;">
                        <li><strong>Laboratório:</strong> ${nomeLab}</li>
                        <li><strong>Data:</strong> ${dataFormatada}</li>
                        <li><strong>Horário:</strong> ${inicio} às ${fim}</li>
                    </ul>
                </div>
            `;

            // Reseta o form e atualiza a lista de consultas
            document.getElementById('form-reserva').reset();
            carregarLaboratorios();
            carregarReservas();
        } else {
            // Exibe a mensagem de erro enviada pelo servidor (incluindo conflito de horário)
            divMensagem.innerHTML = `<p style="color: red; font-weight: bold;">Erro: ${resultado.erro}</p>`;
        }
    } catch (erro) {
        divMensagem.innerHTML = `<p style="color: red; font-weight: bold;">Erro de conexão com a API do servidor.</p>`;
    }
});


// 3. Função para Consultar e Listar as Reservas na tela (READ)
async function carregarReservas() {
    const listaUl = document.getElementById('lista-reservas');
    if (!listaUl) return; // Se a lista não existir no HTML, apenas ignora

    listaUl.innerHTML = '<li>Carregando...</li>';

    try {
        const resposta = await fetch(`${API_URL}/reservas`);
        const reservas = await resposta.json();

        listaUl.innerHTML = '';
        if (reservas.length === 0) {
            listaUl.innerHTML = '<li>Nenhuma reserva encontrada.</li>';
            return;
        }

        reservas.forEach(reserva => {
            const [ano, mes, dia] = reserva.data.split('-');
            const dataF = `${dia}/${mes}/${ano}`;

            const li = document.createElement('li');
            li.innerHTML = `
                <span><b>${reserva.lab}</b> - ${dataF} (${reserva.inicio} às ${reserva.fim})</span>
                <button onclick="deletarReserva(${reserva.id})">Excluir</button>
            `;
            listaUl.appendChild(li);
        });
    } catch (erro) {
        listaUl.innerHTML = '<li>Erro ao carregar reservas do servidor.</li>';
    }
}

// 4. Função para Deletar uma Reserva (DELETE)
async function deletarReserva(id) {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;

    try {
        await fetch(`${API_URL}/reservas/${id}`, { method: 'DELETE' });
        carregarReservas(); // Atualiza a lista na tela
    } catch (erro) {
        alert('Erro ao excluir reserva.');
    }
}

// 5. Evento para o botão de atualizar a lista manualmente
document.getElementById('btn-atualizar').addEventListener('click', carregarReservas);

// Carrega as reservas salvas assim que a página é aberta
carregarReservas();
const { Paciente, LinkedList } = require('./app');
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var totalRecep = {
    recep1: 0,
    recep2: 0
}

var totalAtendidos = 0;

var atendidosMedico = {
    'cardiologista' : 0,
    'dermatologista' : 0,
    'ortopedista' : 0,
    'pediatra' : 0
}

let guiche = 'nada ainda';
let guicheMedico = {
    nome: 'nada ainda',
    medico: 'nada ainda'
};

var ticketCounters = {
    leve: 0,
    medio: 0,
    grave: 0
};

var medicoA = "";

const leveP = new LinkedList();
const medioP = new LinkedList();
const graveP = new LinkedList();

const leveTemp = new LinkedList();
const medioTemp = new LinkedList();
const graveTemp = new LinkedList();

// Rota para servir o arquivo HTML RAIZ
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/index.html'));
});

// REQUEST da recepção de pacientes NÃO CADASTRADOS -> request de guiche.html
app.get('/chamarTicket', (req, res) => {
    const ID = req.query.id;
    if (ID == '0') {
        res.send(guiche);
    } else if (ID == '1') {
        totalRecep.recep1++;
        proxRecepcao(res);
    }else if (ID == '2') {
        totalRecep.recep2++;
        proxRecepcao(res);
    }
});

app.post('/cadastrarPaciente', (req, res) => {
    const paciente = new Paciente(req.body.nome, req.body.cpf, req.body.endereco, req.body.telefone, req.body.planoSaude, req.body.medico);
    switch (req.body.prioridade) {
        case '1':
            leveP.insertLast(paciente);
            break;
        case '2':
            medioP.insertLast(paciente);
            break;
        case '3':
            graveP.insertLast(paciente);
            break;
        default:
            throw new Error('Prioridade inválida');
    }
    res.json({ message: 'Paciente cadastrado com sucesso' });
});

// Request de médicos de próximo paciente JA CADASTRADOS -> request de medico.html
app.get('/proxPaciente', (req, res) => {
    const medicoId = req.query.id;
    medicoA = medico(medicoId);
    const paciente = proxConsulta(medicoId);
    if (paciente) {
        guicheMedico = {
            nome: paciente.nome,
            medico: medico(medicoId) + "<br> Sala: " + medicoId 
        };
        res.json(paciente);
    } else {
        res.json({ message: 'Nenhum paciente na fila' });
    }
});

// Request de paciente não cadastrado -> request de pegarTicket.html
app.get('/pegarTicket', (req, res) => {
    const ticketID = req.query.id;
    res.send(esperaRecepcao(ticketID));
});

// Tela de paciente atual
app.get('/paciente', (req, res) => {
    res.json(guicheMedico);
});

// Tela de recepção para cadastro do paciente (TELA SOMENTE PARA PACIENTES NÃO CADASTRADOS)
app.get('/pegar', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/pegarTicket.html'));
});

// Tela de guichê para cadastro do paciente para recepção (TELA SOMENTE PARA PACIENTES NÃO CADASTRADOS)
app.get('/guiche', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/guiche.html'));
});

// TELA DE CADASTRO DA RECEPÇÃO
app.get('/recepcao', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/recepcao.html'));
});

// Tela de guichê (SOMENTE PARA PACIENTES) para chamada de pacientes já cadastrados
app.get('/guicheMedico', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/guicheMedico.html'));
});

// Tela de médico para chamada de novos pacientes (TELA SOMENTE PARA MÉDICO)
app.get('/medico', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/medico.html'));
});

app.get('/estatistica', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/estatistica.html'));
});

app.get('/api/estatisticas', (req, res) => {
    const estatisticas = {
        clientesTotal: [totalAtendidos], // Substitua com dados reais
        clientesPorRecepcionista: [totalRecep.recep1, totalRecep.recep2], // Substitua com dados reais
        clientesPorMedico: [atendidosMedico.cardiologista, atendidosMedico.dermatologista, atendidosMedico.ortopedista, atendidosMedico.pediatra] // Substitua com dados reais
    };
    res.json(estatisticas);
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

function proxConsulta(medicoId) {
    switch (medicoId) {
        case '1':
            return getNextPatient(graveP, medioP, leveP);
        case '2':
            return getNextPatient(graveP, medioP, leveP);
        case '3':
            return getNextPatient(graveP, medioP, leveP);
        case '4':
            return getNextPatient(graveP, medioP, leveP);
        default:
            throw new Error('ID de médico inválido');
    }
}

function getNextPatient(...queues) {
    for (const queue of queues) {
        if (queue.count !== 0 && medicoA != null) {
            atendidosMedico[medicoA] += 1;
            totalAtendidos += 1;
            let patient = queue.searchByMedico(medicoA);
            medicoA = null;
            return patient;
        }
    }
    return null;
}

function medico(id) {
    const medicos = {
        '1': 'cardiologista',
        '2': 'dermatologista',
        '3': 'ortopedista',
        '4': 'pediatra'
    };
    return medicos[id] || 'Especialidade desconhecida';
}

function proxRecepcao(res) {
    if (graveTemp.count !== 0) {
        guiche = 'G' + graveTemp.head.data;
        graveTemp.removeFirst();
        res.send('3');
    } else if (medioTemp.count !== 0) {
        guiche = 'M' + medioTemp.head.data;
        medioTemp.removeFirst();
        res.send('2');
    } else if (leveTemp.count !== 0) {
        guiche = 'L' + leveTemp.head.data;
        leveTemp.removeFirst();
        res.send('1');
    } else {
        guiche = 'SEM FILA';
        res.send(null);
    }
}

function esperaRecepcao(prioridade) {
    let ticketPrefix;
    let ticketCounter;
    let tempList;

    switch (prioridade) {
        case '1':
            ticketPrefix = 'L';
            ticketCounter = ++ticketCounters.leve;
            tempList = leveTemp;
            break;
        case '2':
            ticketPrefix = 'M';
            ticketCounter = ++ticketCounters.medio;
            tempList = medioTemp;
            break;
        case '3':
            ticketPrefix = 'G';
            ticketCounter = ++ticketCounters.grave;
            tempList = graveTemp;
            break;
        default:
            throw new Error('Prioridade inválida');
    }

    tempList.insertLast(ticketCounter);
    tempList.printList();
    return ticketPrefix + ticketCounter;
}
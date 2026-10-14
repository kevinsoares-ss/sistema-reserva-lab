const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Importa o módulo de caminhos do Node

const app = express();
app.use(express.json());
app.use(cors());

// Configura o servidor para servir os arquivos da pasta atual (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname)));

// Conecta ou cria o arquivo de banco de dados local 'database.db'
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite local.');
    }
});

// Criação das Tabelas e Inserção Inicial de Laboratórios
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS laboratorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lab_id INTEGER,
        data TEXT NOT NULL,
        inicio TEXT NOT NULL,
        fim TEXT NOT NULL,
        FOREIGN KEY (lab_id) REFERENCES laboratorios (id)
    )`);

    db.get("SELECT COUNT(*) as count FROM laboratorios", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO laboratorios (nome) VALUES (?)");
            for (let i = 1; i <= 10; i++) {
                stmt.run(`Laboratório ${i}`);
            }
            stmt.finalize();
            console.log("Laboratórios padrão inseridos no banco.");
        }
    });
});

// [READ] - Rota para listar os laboratórios
app.get('/laboratorios', (req, res) => {
    db.all("SELECT * FROM laboratorios", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

// [CREATE] - Cadastrar nova reserva com verificação de conflito de horário
app.post('/reservas', (req, res) => {
    const { lab_id, data, inicio, fim } = req.body;

    if (!lab_id || !data || !inicio || !fim) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }

    // Consulta para verificar se já existe conflito de horário no mesmo laboratório e na mesma data
    const queryConflito = `
        SELECT * FROM reservas 
        WHERE lab_id = ? AND data = ? 
        AND ((inicio < ?) AND (fim > ?))
    `;

    db.get(queryConflito, [lab_id, data, fim, inicio], (err, row) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        // Se encontrar alguma linha, significa que o horário está ocupado
        if (row) {
            return res.status(400).json({ erro: "Já existe uma reserva para este laboratório neste horário." });
        }

        // Se não houver conflito, insere a reserva
        const queryInsert = `INSERT INTO reservas (lab_id, data, inicio, fim) VALUES (?, ?, ?, ?)`;
        db.run(queryInsert, [lab_id, data, inicio, fim], function (err) {
            if (err) {
                return res.status(500).json({ erro: err.message });
            }
            res.status(201).json({
                mensagem: "Reserva criada com sucesso!",
                reserva: { id: this.lastID, lab_id, data, inicio, fim }
            });
        });
    });
});

// [READ] - Consultar todas as reservas com o nome do laboratório (GET)
app.get('/reservas', (req, res) => {
    const query = `
        SELECT reservas.id, laboratorios.nome as lab, reservas.data, reservas.inicio, reservas.fim 
        FROM reservas 
        JOIN laboratorios ON reservas.lab_id = laboratorios.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

// [DELETE] - Excluir uma reserva (DELETE)
app.delete('/reservas/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM reservas WHERE id = ?`, id, function (err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json({ mensagem: "Reserva excluída com sucesso!" });
    });
});


// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('API rodando na porta 3000 (http://localhost:3000)');
});
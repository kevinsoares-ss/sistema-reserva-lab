# 🧪 Sistema de Reserva de Laboratórios

Aplicação web desenvolvida para o gerenciamento e agendamento de horários em laboratórios, contando com controle de conflitos, persistência de dados local e operações completas de CRUD (Create, Read, Update, Delete).

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

* **Front-end:** HTML5, CSS3 (com design moderno e responsivo) e JavaScript (Fetch API).
* **Back-end:** Node.js com Express.
* **Banco de Dados:** SQLite (com criação automática de tabelas e inserção inicial).
* **Bibliotecas/Módulos:** `sqlite3`, `cors`, `path`.

---

## ✨ Funcionalidades

* **Seleção Dinâmica:** Carregamento automático dos laboratórios cadastrados diretamente do banco de dados para o formulário.
* **Validação de Datas e Horários:** 
  * Bloqueio de reservas para datas passadas.
  * Verificação para garantir que o horário de término seja posterior ao de início.
* **Prevenção de Conflitos (Back-end):** O sistema barra automaticamente agendamentos duplicados ou sobrepostos no mesmo laboratório e na mesma data.
* **Listagem e Exclusão:** Consulta em tempo real de todas as reservas cadastradas e opção de cancelamento/exclusão individual.

---

## 📂 Estrutura do Projeto

```text
Estudo-reserva/
├── database.db         # Banco de dados SQLite gerado automaticamente
├── index.html          # Página principal da interface
├── style.css           # Estilos e design moderno da aplicação
├── script.js           # Lógica do front-end e requisições à API
├── server.js           # Servidor Node.js, rotas e regras do back-end
└── package.json        # Dependências do projeto

## 🔧 Como Executar o Projeto

1. Certifique-se de ter o Node.js instalado no seu computador antes de prosseguir.

2. Clone ou baixe o repositório para a sua máquina e abra a pasta do projeto no terminal.

3. Instale as dependências executando o comando:

Bash
$ npm install express cors sqlite3

4. Inicie o servidor do back-end:

Bash
$ node server.js

5. No navegador:
Aceda ao endereço http://localhost:3000 para utilizar o sistema integrado.

## 👨‍💻 Desenvolvido por
Projeto desenvolvido para estudos e aprimoramento em desenvolvimento web full-stack (Front-end com JavaScript e Back-end com Node.js e SQLite).

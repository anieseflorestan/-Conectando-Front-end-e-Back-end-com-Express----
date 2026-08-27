import express from 'express';
import pkg from 'pg';
const { Client } = pkg;

const app = express();

app.use(express.json());
app.use(express.static('public'));

function criarCliente() {
    return new Client({
        host:     'localhost',
        port:     5432,
        user:     'postgres',
        password: 'root',
        database: 'teste_db'
    });
}

app.get('/api/tarefas', async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();
        const resultado = await client.query(
            "SELECT * FROM tarefas ORDER BY id"
        );

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: "erro ao buscar a tarefas" });
    } finally {
        await client.end();
    }
});

app.get('/api/tarefas', async (req, res) => {
    const client = criarCliente();
    try {
        const { titulo,concluida } = req.body;

        const resultado = await client.query(
            `INSERT INTO teste (titulo,concluida )
            VALUES ($1, $2,)
            RETURNING *`

        );
    } catch (erro) {
        res.status(500).json({ erro: "erro ao buscar a tarefas" });
    } finally {
        await client.end();
    }
});
 

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
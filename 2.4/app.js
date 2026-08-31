import express from "express";
import pg from "pg";

const { Client } = pg;

const app = express();
const PORT = 3000;

app.use(express.json());


// GET /api/pratos
app.get("/api/pratos", async (req, res) => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        port: 5432,
        password: "root",
        database: "cardapio_db"
    });
    try {

        await client.connect();

        let query = `
            SELECT
                p.id,
                p.nome,
                p.descricao,
                p.preco,
                p.disponivel,
                c.nome AS categoria
            FROM pratos p
            INNER JOIN categorias c
                ON p.categoria_id = c.id
            WHERE 1=1
        `;

        const params = [];

        // Filtro por categoria
        if (req.query.categoria) {

            params.push(req.query.categoria);

            query += ` AND c.nome = $${params.length}`;
        }

        // Filtro por disponibilidade
        if (req.query.disponivel !== undefined) {

            params.push(req.query.disponivel === "true");

            query += ` AND p.disponivel = $${params.length}`;
        }

        query += ` ORDER BY c.nome, p.nome`;

        const resultado = await client.query(
            query,
            params
        );

        res.json(resultado.rows);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar pratos"
        });

    } finally {

        await client.end();
    }
});
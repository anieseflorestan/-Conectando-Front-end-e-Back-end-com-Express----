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

        const resultado = await client.query(`
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
            ORDER BY p.id
        `);

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


// GET /api/pratos/:id
app.get("/api/pratos/:id", async (req, res) => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "cardapio_db",
        password: "SUA_SENHA",
        port: 5432
    });

    try {
        await client.connect();

        const resultado = await client.query(`
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
            WHERE p.id = $1
        `, [req.params.id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Prato não encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao buscar prato"
        });

    } finally {
        await client.end();
    }
});


// GET /api/categorias
app.get("/api/categorias", async (req, res) => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "cardapio_db",
        password: "SUA_SENHA",
        port: 5432
    });

    try {
        await client.connect();

        const resultado = await client.query(
            "SELECT * FROM categorias ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao buscar categorias"
        });

    } finally {
        await client.end();
    }
});


// POST /api/pratos
app.post("/api/pratos", async (req, res) => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "cardapio_db",
        password: "SUA_SENHA",
        port: 5432
    });

    try {
        await client.connect();

        const {
            nome,
            descricao,
            preco,
            disponivel,
            categoria_id
        } = req.body;

        if (!nome || nome.trim() === "") {
            return res.status(400).json({
                erro: "Nome é obrigatório"
            });
        }

        if (preco === undefined || Number(preco) <= 0) {
            return res.status(400).json({
                erro: "Preço deve ser maior que zero"
            });
        }

        if (!categoria_id) {
            return res.status(400).json({
                erro: "categoria_id é obrigatório"
            });
        }

        const categoria = await client.query(
            "SELECT id FROM categorias WHERE id = $1",
            [categoria_id]
        );

        if (categoria.rows.length === 0) {
            return res.status(400).json({
                erro: "Categoria não encontrada"
            });
        }

        const resultado = await client.query(`
            INSERT INTO pratos
            (nome, descricao, preco, disponivel, categoria_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            nome,
            descricao || null,
            preco,
            disponivel ?? true,
            categoria_id
        ]);

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao cadastrar prato"
        });

    } finally {
        await client.end();
    }
});


// PUT /api/pratos/:id
app.put("/api/pratos/:id", async (req, res) => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "cardapio_db",
        password: "SUA_SENHA",
        port: 5432
    });

    try {
        await client.connect();

        const {
            nome,
            descricao,
            preco,
            disponivel,
            categoria_id
        } = req.body;

        const resultado = await client.query(`
            UPDATE pratos
            SET
                nome = $1,
                descricao = $2,
                preco = $3,
                disponivel = $4,
                categoria_id = $5
            WHERE id = $6
            RETURNING *
        `, [
            nome,
            descricao,
            preco,
            disponivel,
            categoria_id,
            req.params.id
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Prato não encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao atualizar prato"
        });

    } finally {
        await client.end();
    }
});


// DELETE /api/pratos/:id
app.delete("/api/pratos/:id", async (req, res) => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "cardapio_db",
        password: "SUA_SENHA",
        port: 5432
    });

    try {
        await client.connect();

        const resultado = await client.query(
            "DELETE FROM pratos WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Prato não encontrado"
            });
        }

        res.json({
            mensagem: "Prato removido com sucesso"
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao remover prato"
        });

    } finally {
        await client.end();
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

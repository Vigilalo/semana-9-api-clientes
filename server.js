const express = require("express");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        mensaje: "API REST de clientes funcionando correctamente"
    });
});

app.get("/api/clientes", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM cliente ORDER BY id_cliente"
        );

        res.status(200).json(resultado.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

app.get("/api/clientes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                error: "El ID debe ser un número entero positivo"
            });
        }

        const resultado = await pool.query(
            "SELECT * FROM cliente WHERE id_cliente = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});
app.post("/api/clientes", async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;

        if (!nombre || !email || !telefono) {
            return res.status(400).json({
                error: "Nombre, email y teléfono son obligatorios"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO cliente (nombre, email, telefono)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nombre, email, telefono]
        );

        res.status(201).json({
            mensaje: "Cliente creado correctamente",
            cliente: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "El correo electrónico ya está registrado"
            });
        }

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

app.put("/api/clientes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                error: "El ID debe ser un número entero positivo"
            });
        }

        if (!nombre || !email || !telefono) {
            return res.status(400).json({
                error: "Nombre, email y teléfono son obligatorios"
            });
        }

        const resultado = await pool.query(
            `UPDATE cliente
             SET nombre = $1,
                 email = $2,
                 telefono = $3
             WHERE id_cliente = $4
             RETURNING *`,
            [nombre, email, telefono, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Cliente actualizado correctamente",
            cliente: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "El correo electrónico ya está registrado"
            });
        }

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});


app.delete("/api/clientes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                error: "El ID debe ser un número entero positivo"
            });
        }

        const resultado = await pool.query(
            "DELETE FROM cliente WHERE id_cliente = $1 RETURNING *",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Cliente eliminado correctamente",
            cliente: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});


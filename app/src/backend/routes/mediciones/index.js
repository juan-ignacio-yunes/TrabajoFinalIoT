const express = require('express');
const pool = require('../../mysql-connector');


// ----- obtener peso de animal ----- //

const routerMediciones = express.Router();

routerMediciones.get('/', function (req, res) {
    const { id, inicio, fin } = req.query;

    if (!id || !inicio || !fin) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos: id, inicio y/o fin' });
    }

    console.log("Se hizo GET a la API de mediciones para la mascota con ID:", id);
    console.log("Parámetros recibidos:", { id, inicio, fin });

    // Consulta optimizada para el gráfico
    const query = `
    SELECT 
        DATE(fechaHora_medicion) AS fecha, 
        ROUND(AVG(JSON_UNQUOTE(JSON_EXTRACT(valor, '$.peso_animal'))), 2) AS peso_promedio
    FROM mediciones 
    WHERE pet_id = ? AND fechaHora_medicion BETWEEN ? AND ?
    GROUP BY DATE(fechaHora_medicion)
    ORDER BY fecha ASC`;

    // Consulta optimizada para el último peso
    const queryUltimoPeso = `
    SELECT JSON_UNQUOTE(JSON_EXTRACT(valor, '$.peso_animal')) AS ultimo_peso
    FROM mediciones
    WHERE pet_id = ?
    ORDER BY measure_id DESC
    LIMIT 1`;

    // Ejecutar ambas consultas
    pool.query(query, [id, inicio, fin], function (err, result) {
        if (err) {
            console.error("Error en la consulta de promedios:", err);
            return res.status(500).json({ error: 'Error al obtener las mediciones' });
        }

        // Obtener el último peso
        pool.query(queryUltimoPeso, [id], function (errUltimo, resultUltimo) {
            if (errUltimo) {
                console.error("Error en la consulta del último peso:", errUltimo);
                return res.status(500).json({ error: 'Error al obtener el último peso' });
            }

            const ultimoPeso = resultUltimo.length > 0 ? resultUltimo[0].ultimo_peso : null;

            // Responder con ambos valores
            res.json({
                datos: result, // Datos para el gráfico
                ultimo_peso: ultimoPeso // Última medición registrada
            });
        });
    });
});

module.exports = routerMediciones;
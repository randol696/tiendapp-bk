const express = require('express');
const app = express();
const port = 3000;
const { Pool } = require('pg');
require('dotenv').config()

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // update to match the domain you will make the request from
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});
//Railway postgress conection

app.get('/data', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM tb_product');
      const results = { 'results': (result) ? result.rows : null};
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });

  app.delete('/data/:id', async (req, res) => {
    try {
        const client = await pool.connect();
        const id = parseInt(req.params.id);
        const result = await client.query('DELETE FROM tb_product WHERE id = $1', [id]);
        res.status(200).send(`Row with ID: ${id} deleted successfully.`);
        client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
});

app.post('/data', async (req, res) => {
  const { product, price } = req.body;

  try {
      const client = await pool.connect();
      const result = await client.query('INSERT INTO tb_product (product, price) VALUES ($1, $2)', [product, price]);
      res.status(201).json({ message: 'Data inserted successfully.' });
      client.release();
  } catch (err) {
      console.error(err);
      res.send("Error " + err);
  }
});

app.put('/data/:id', async (req, res) => {
    try {
        const client = await pool.connect();
        const id = parseInt(req.params.id);
        const { column_name, new_value } = req.body;
        
        const result = await client.query(`UPDATE product SET ${column_name} = $1 WHERE id = $2`, [new_value, id]);
        res.status(200).send(`Row with ID: ${id} updated successfully.`);
        client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
});
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
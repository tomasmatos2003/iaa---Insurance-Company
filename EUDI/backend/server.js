const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/vc', (req, res) => {
  const { id, type, issuer, credentialSubject } = req.body;

  const query = 'INSERT INTO vcs (id, type, issuer, subject) VALUES (?, ?, ?, ?)';
  db.query(query, [id, type, issuer, JSON.stringify(credentialSubject)], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to insert VC');
    }
    res.send('VC saved');
  });
});

app.get('/vcs', (req, res) => {
  db.query('SELECT * FROM vcs', (err, result) => {
    if (err) return res.status(500).send('Failed to fetch VCs');
    res.json(result);
  });
});

app.listen(3001, () => console.log('🔌 Server running on http://localhost:3001'));

const express = require('express');
const path = require('path');
const axios = require('axios');
const redis = require('redis');
const app = express();

const API_URL = 'http://data.fixer.io/api';

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, 'views')
  });
});

app.get('/rate/:date', (req, res) => {
  const { date } = req.params;
  const url = `${API_URL}/${date}?access_key=3c9aaafbf633ba5df9d4900ee996b183`;

  axios
    .get(url)
    .then(response => {
      return res.json({ rates: response.data.rates });
    })
    .catch(error => {
      console.log(error);
    });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

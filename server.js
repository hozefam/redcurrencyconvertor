const express = require('express');
const path = require('path');
const axios = require('axios');
const redis = require('redis');
const app = express();

const API_URL = 'http://data.fixer.io/api';

const client = redis.createClient();
client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', err => {
  console.log(`Error : ${err}`);
});

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, 'views')
  });
});

app.get('/rate/:date', (req, res) => {
  const { date } = req.params;
  const url = `${API_URL}/${date}?access_key=3c9aaafbf633ba5df9d4900ee996b183`;

  const countKey = `EUR:${date}:count`;
  const ratesKey = `EUR:${date}:rates`;

  client.incr(countKey, (err, count) => {
    client.hgetall(ratesKey, (err, rates) => {
      if (rates) {
        console.log('Cached');
        return res.status(200).json({ rates, count });
      }

      axios
        .get(url)
        .then(response => {
          client.hmset(ratesKey, response.data.rates, (err, result) => {
            if (err) {
              console.log(err);
            }
          });

          return res.status(200).json({ count, rates: response.data.rates });
        })
        .catch(error => {
          console.log(res.status(400).json(error.response.data));
        });
    });
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

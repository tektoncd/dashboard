const express = require('express');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello tekton dashboard!!\n');
});
app.get('/sample', (req, res) => {
  res.send('Hello tekton dashboard!! Here is /sample\n');
});

app.listen(PORT, HOST);
console.log(`Listening at http://${HOST}:${PORT}`); // eslint-disable-line no-console

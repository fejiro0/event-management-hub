import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Minimal Express App!');
});

export default app;

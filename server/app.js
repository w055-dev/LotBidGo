const express = require('express');
const cors = require('cors');
const { port } = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/api', routes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
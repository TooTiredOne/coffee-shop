const express = require('express');
const apiRouter = express.Router();
const empRouter = require('./employee');
const bodyParser = require('body-parser');

apiRouter.use(bodyParser.json());
apiRouter.use('/employees', empRouter);


module.exports = apiRouter;
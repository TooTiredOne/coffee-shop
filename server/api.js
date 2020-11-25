const express = require('express');
const apiRouter = express.Router();
const empRouter = require('./employee');
const menuRouter = require('./menu');
const bodyParser = require('body-parser');

apiRouter.use(bodyParser.json());
apiRouter.use('/employees', empRouter);
apiRouter.use('/menus', menuRouter);


module.exports = apiRouter;
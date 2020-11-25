const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const apiRouter = require('./server/api');

app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`The server listens on port ${PORT}`);
})
module.exports = app;
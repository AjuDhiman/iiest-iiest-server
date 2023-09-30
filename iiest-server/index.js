const express = require('express');
const app = express();
const dotenv  = require('dotenv');
const cors = require('cors');
const connectToMongo = require('./config/db.js');

dotenv.config();
app.use(express.json());
app.use(cors());


const config = JSON.parse(process.env.CONFIG);
const port = config.PORT || 3000;
console.log(port)

app.use('/iiest/', require('./routers/employeeRoute.js'));
app.use('/iiest/fbo', require('./routers/fboRoute.js'));

connectToMongo();

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`)
})
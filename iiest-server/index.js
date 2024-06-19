const express = require('express');
const app = express();
const dotenv  = require('dotenv');
const cors = require('cors');
const connectToMongo = require('./config/db')
const session = require('express-session'); 
const path = require('path');

dotenv.config();

app.use(cors({credentials: true, origin: 'http://localhost:4200'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: 'samplepaymentproject',
  saveUninitialized: false,
  resave: true
}))

// Define the directory where your static files reside next two lines we are using for acessing local storage we will remove them when we use aws
const fostacDoc = path.join(__dirname, 'documents', 'foscos');
const foscosDoc = path.join(__dirname, 'documents', 'fostac');
const hraDoc = path.join(__dirname, 'documents', 'hra');
const cheques = path.join(__dirname, 'documents', 'cheques');

// Serve static files from the public directory
app.use(express.static(fostacDoc));
app.use(express.static(foscosDoc));
app.use(express.static(hraDoc));
app.use(express.static(cheques));

const config = JSON.parse(process.env.CONFIG);
const port = config.PORT || 3000;

app.use('/iiest', require('./routers/employeeRoute.js'));
app.use('/iiest', require('./routers/fboRoute.js'));
app.use('/iiest', require('./routers/operationRoute.js'));
// app.use('/iiest', require('./routers/trainingRoute.js'));

connectToMongo();

app.listen(port, () => {
 console.log(`Example app listening on port: ${port}`)
});
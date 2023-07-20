import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiRouter from './router';

// initialize
const app = express();

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// REGISTER OUR ROUTES -------------------------------
// all of our routes will not be prefixed with anything
// this should go AFTER body parser
app.use('', apiRouter);

// additional init stuff should go before hitting the routing
// DB Setup
// const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/blog';
//const mongoURI = 'mongodb+srv://garb_dbuser:vusW7BJbchkMZ@cluster0.o53iy.mongodb.net/garbdb?retryWrites=true&w=majority' || 'mongodb://localhost/blog';
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/blog';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// default index route
app.get('/', (req, res) => {
  res.send('hi');
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);

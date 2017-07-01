require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const validator = require('express-validator');
const bby = require('bestbuy')(process.env.BBY_API_KEY);

const app = express();

// CONSTANTS FROM .ENV FILE
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 27017;

// MIDDLEWARE STACK
app.use(helmet());
app.use(compression());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(validator());
app.use(morgan('common'));

mongoose.Promise = global.Promise;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '../public/index.html');
});

// CATCH ALL ROUTE //
app.get('*', (req, res) => {
  res.status(404).json({
    message: '404 ERR0R: PAGE NOT FOUND.',
  });
});

// MAIN API CALL FOR PRODUCT DETAILS //
app.post('/', (req, res) => {
  // SANITIZE INPUTS
  req.sanitizeBody('upc').trim();
  req.sanitizeBody('upc').escape();

  // VALIDATE INPUTS
  req.checkBody('upc', 'UPC is not valid.').notEmpty();
  req
    .checkBody(
      'upc',
      "Looks like you didn't scan the right barcode. Please scan the UPC code."
    )
    .isNumeric()
    .isInt({ allow_leading_zeroes: true })
    .isLength({ min: 12, max: 12 });

  // ASSIGN SANITIZED VALUE TO VARIABLE
  let upc = req.body.upc;

  // ASSIGN ALL ERRORS
  let errors = req.validationErrors();

  // INSTANTIATE SEARCH
  const search = bby.products(`upc=${upc}`);

  search.then(data => {
    if (errors) {
      // IF THERE ARE VALIDATION ERRORS
      res.json({
        message: errors[0].msg,
      });
    } else if (!data.total) {
      // IF THERE ARE NO RESULTS FROM THE API
      res.json({
        message: 'UPC not recognized. Please try your search again.',
      });
    } else {
      // ON SUCCESS
      let product = data.products[0];

      let productDetails = {
        name: product.name,
        sku: product.sku,
        upc: product.upc,
        department: product.department,
        departmentId: product.departmentId,
        modelNumber: product.modelNumber,
        classId: product.classId,
      };
      res.json(productDetails);
    }
  });
});

app.listen((port = PORT), () => {
  console.log(`Listening on port ${port}`);
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// TAKES A DATABASE URL AS AN ARGUMENT. NEEDED FOR INTEGRATION TESTS. DEFAULTS TO THE MAIN URL.
const runServer = (databaseUrl = DATABASE_URL, port = PORT) =>
  new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(
            `Your app is listening on port ${port} in a ${env} environment.`
          );
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });

const closeServer = () =>
  mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server. Goodbye old friend.');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  });

module.exports = {
  runServer,
  closeServer,
  app,
};

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const compression = require('compression');
const logger = require('./middleware/logger').logger;
const bby = require('bestbuy')(process.env.BBY_API_KEY);

const {
  emailerMiddleware
} = require('./middleware/emailer');

const app = express();

app.use(compression());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan('common', {
  stream: logger.stream
}));

mongoose.Promise = global.Promise;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '../public/index.html');
});

// CATCH ALL ROUTE //
app.get('*', (req, res) => {
  res.status(404).json({
    message: '404 ERR0R: PAGE NOT FOUND.'
  });
});


// MAIN API CALL FOR PRODUCT DETAILS //
app.post('/', (req, res) => {
  const upc = req.body.upc;

  const search = bby.products(`upc=${upc}`);

  search.then(data => {
    if (!data.total) {
      res.json({
        error: 'NO PRODUCTS FOUND.',
        message: 'Try your search again please.'
      });
    } else {
      let product = data.products[0];

      let productDetails = {
        name: product.name,
        sku: product.sku,
        upc: product.upc,
        department: product.department,
        departmentId: product.departmentId,
        modelNumber: product.modelNumber,
        classId: product.classId
      }
      res.json(productDetails);
    }
  });
});

// call to send email
app.post('/login', (req, res, next) => {
  emailerMiddleware(req.body.textInput);
  res.end();
});

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({
    error: 'Something went wrong'
  }).end();
});


app.listen(PORT = process.env.PORT || 2727, () => {
  logger.info(`Listening on port ${PORT}`)
});

const runServer = (DATABASE_URL = process.env.DATABASE_URL, port = PORT) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
          console.log(`Your app is listening on port ${PORT}.`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

const closeServer = () => {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server. Goodbye old friend.');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

module.exports = {
  runServer,
  closeServer,
  app
};
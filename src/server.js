require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bby = require('bestbuy')(process.env.BBY_API_KEY);

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan('common'));

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
  let upc = req.body.upc;

  const search = bby.products('upc=' + upc);

  search.then(data => {
    if (!data.total) {
      console.log('No products found. Try your search again please.');
    } else {
      let product = data.products[0];

      let productDetails = {
        name: product.name,
        sku: product.sku,
        upc: product.upc,
        department: product.department,
        class: product.class
      }
      res.json(productDetails);
    }
  });
});

app.listen(PORT = process.env.PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

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

module.exports = { runServer,closeServer,app };
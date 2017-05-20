const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const should = chai.should();

const { Product } = require('../src/models');
const { app, runServer, closeServer } = require('../src/app');

chai.use(chaiHttp);

let seedProducts = () => {
  console.log('Seeding products now.');
  const seedData = [];

  for(let i  = 0; i < 10; i++){
    seedData.push(generateProductInfo());
  }
  return Product.insertMany(seedData);
}

let generateProductInfo = () => {
  return {
    sku: faker.random.number(),
    department: faker.random.word(),
    class: faker.random.word(),
    quantity: faker.random.number()
  }
}

let tearDownDB = () => {
  console.warn('REAMIN CALM. DELETING THE DATABASE');
  return mongoose.connection.dropDatabase();
}
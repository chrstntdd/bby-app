const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const _ = require('lodash');

process.env.NODE_ENV = 'test';

const should = chai.should();

const { app, runServer, closeServer } = require('../src/server');

chai.use(chaiHttp);

let generateValidUPC = () => {
  const validUPCs = [
    '888462313674',
    '888462815611',
    '888462761222',
    '718037826806',
    '033991057494',
    '885909627301',
    '818279015058',
    '600603166860',
    '617885008184',
    '086429215126'
  ];
  return _.sample(validUPCs);
};

let generateInvalidUPC = () =>
  faker.random.number({
    min: 100000000000,
    max: 999999999999
  });

describe('Best Buy API response', () => {
  it('should exist', () => {
    const newUPC = generateValidUPC();
    return chai.request(app).post('/').send(`upc=${newUPC}`).then(res => {
      res.should.exist;
    });
  });
  it('should return product data for a valid UPC', () => {
    const newUPC = generateValidUPC();
    return chai.request(app).post('/').send(`upc=${newUPC}`).then(res => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.an('object');
      res.body.should.include.keys(
        'name',
        'sku',
        'upc',
        'department',
        'departmentId',
        'classId',
        'modelNumber'
      );
      res.body.should.not.include.keys('error');
      res.body.upc.should.equal(newUPC);
      res.body.modelNumber.should.be.a('string');
      res.body.name.should.be.a('string');
      res.body.sku.should.be.a('number');
      res.body.upc.should.be.a('string');
      res.body.department.should.be.a('string');
      res.body.departmentId.should.be.a('number');
      res.body.classId.should.be.a('number');
    });
  });
  it('should return an error message for an invalid UPC', () => {
    const newUPC = generateInvalidUPC();
    return chai.request(app).post('/').send(`upc=${newUPC}`).then(res => {
      res.should.be.json;
      res.body.should.be.an('object');
      console.error(res.body);
      res.body.should.have.keys('message');
      res.body.message.should.equal(
        'UPC not recognized. Please try your search again.'
      );
    });
  });
});

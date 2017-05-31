const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: Number,
    required: true
  },
  upc: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  departmentId: {
    type: Number,
    required: true
  },
  modelNumber: {
    type: String,
    required: true
  },
  classId: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number
  }
});

const tableSchema = mongoose.Schema({
  products: [productSchema]
});

const Product = mongoose.model('Product', productSchema);
const Table = mongoose.model('Table', tableSchema);

module.exports = {
  Product,
  Table
}
$(() => {
  handleUPCInput();
  handleDecrementQty();
  handleRemoveItem();
  handleFinalize();
})

const state = {
  products: [],
  finalList: []
};

let $clientUPC = $('#upc');

const validUPC = () => {
  let clientUPCValue = _.trim($clientUPC.val())
  clientUPCValue.length == 12 ?
    callBbyAPI(clientUPCValue) :
    console.log('Invalid UPC');
}

const callBbyAPI = (clientUPCValue) => {
  $.post('/', `upc=${clientUPCValue}`, data => {
    if (doesExist(data)) {
      let product = _.find(state.products, data);
      product.quantity++;
    } else {
      data.quantity = 1;
      state.products.push(data);
    }
    setTimeout(() => $clientUPC.val(''), 500);

    renderProduct(data);
  });
}

const doesExist = data => {
  if (!_.some(state.products, data)) {
    return false;
  } else {
    return true;
  }
}

const handleUPCInput = () => {
  $clientUPC.on('input', () => {
    validUPC();
  });
}


const renderProduct = (data) => {
  let productDetailsHTML = (
    '<li>' +
    '<p class="name"></p>' +
    '<p class="sku"></p>' +
    '<p class="upc"></p>' +
    '<p class="department"></p>' +
    '<p class="class"></p>' +
    '<p class="quantity"></p>' +
    '<button class="decrement-quantity">-1</button>' +
    '<button class="remove-item">remove item</button>' +
    '</li>'
  );

  let $temp = $(productDetailsHTML);
  let sku = '#' + data.sku;

  $temp.attr('id', data.sku);
  $temp.find('.name').text(data.name);
  $temp.find('.sku').text('sku: ' + data.sku);
  $temp.find('.upc').text('upc: ' + data.upc);
  $temp.find('.department').text('department: ' + data.department);
  $temp.find('.class').text('class: ' + data.class);
  $temp.find('.quantity').text(data.quantity);

  if ($(sku).length) {
    $productQty = parseInt($(sku + ' .quantity').text());
    $(sku + ' .quantity').text($productQty + 1);
  } else {
    $('#product-list').append($temp);
  }
}

const handleRemoveItem = () => {
  $('#product-list').on('click', '.remove-item', e => {
    // alert the user that theyre about to delete an item.
    let productSku = $(e.currentTarget).parent().attr('id');
    $(`#${productSku}`).remove();
    let product = _.find(state.products, obj => obj.sku == productSku);
    product.quantity = 0;
  });
}

const handleDecrementQty = () => {
  $('#product-list').on('click', '.decrement-quantity', e => {
    let productSku = $(e.currentTarget).parent().attr('id');
    let currentQty = $(`#${productSku} .quantity`).text();
    let product = _.find(state.products, obj => obj.sku == productSku);

    if (currentQty <= 0) {
      $(`#${productSku} .quantity`).text(currentQty);
      currentQty = 0;
      product.quantity = 0;
    } else {
      $(`#${productSku} .quantity`).text(currentQty - 1);
      product.quantity--;
    }
  });
}

const handleFinalize = () => {
  $('#finalize').on('click', e => {
    sortProducts();
  });
}

const sortProducts = () => {
  let tempState = state.products;
  state.finalList = orderProducts(removeZeroQty(tempState));
}

const removeZeroQty = (productArr) => {
  return _.remove(productArr, obj => obj.quantity !== 0);
}

const orderProducts = (productArr) => {
  return _.sortBy(productArr, ['department', 'class', 'sku']);
}
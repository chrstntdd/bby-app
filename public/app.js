$(() => {
  handleUPCInput();
  handleDecrementQty();
  handleRemoveItem();
})

const state = {
  products: []
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
  $temp.find('.sku').text(data.sku);
  $temp.find('.upc').text(data.upc);
  $temp.find('.department').text(data.department);
  $temp.find('.class').text(data.class);
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
  $('#product-list').on('click', '.decrement-quantity',  e => {
    let productSku = $(e.currentTarget).parent().attr('id');
    let currentQty = $(`#${productSku} .quantity`).text();
    $(`#${productSku} .quantity`).text(currentQty - 1);
    let product = _.find(state.products, obj => obj.sku == productSku);
    product.quantity--
  });
}
import "babel-polyfill";

$(() => {
  handleUPCInput();
  handleDecrementQty();
  handleRemoveItem();
  handleFinalize();
  $('table').hide();
})

const state = {
  products: [],
  finalList: []
};

let productDetailsHTML = (
    `
    <tr id=''>
      <td class='department' scope='row'></td>
      <td class='class'></td>
      <td class='sku'></td>
      <td class='name'></td>
      <td class='upc'></td>
      <td class='quantity'></td>
      <td class='remove-item'><button>remove</button></td>
      <td class='decrement-quantity'><button>-1</button></td>
    </tr>
    `
  );

let $clientUPC = $('#upc');

const validUPC = () => {
  let clientUPCValue = _.trim($clientUPC.val())
  clientUPCValue.length == 12 ?
    callBbyAPI(clientUPCValue) :
    alert('UPC not recognized. Please scan again.');
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
    setTimeout(() => $clientUPC.val(''), 250);

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
    $('table').show();
  });
}

const bindDataToHTML = (data) => {
  let $productRow = $(productDetailsHTML);

  $productRow.attr('id', data.sku);
  $productRow.find('.name').text(data.name);
  $productRow.find('.sku').text(data.sku);
  $productRow.find('.upc').text(data.upc);
  $productRow.find('.department').text(data.departmentId + ' - ' + data.department);
  $productRow.find('.class').text(data.class);
  $productRow.find('.quantity').text(data.quantity);

  return $productRow;
}


const renderProduct = (data) => {
  let productHTML = bindDataToHTML(data);

  let sku = '#' + data.sku;

  if ($(sku).length) {
    // if the SKU exists already, increment quantity else add it to the table
    let $productQty = parseInt($(sku + ' .quantity').text());
    $(sku + ' .quantity').text($productQty + 1);
  } else {
    $('#table-body').append(productHTML);
  }
}

const handleRemoveItem = () => {
  $('#table-body').on('click', '.remove-item', e => {
    // alert the user that theyre about to delete an item.
    let productSku = $(e.currentTarget).parent().attr('id');
    $(`#${productSku}`).remove();
    let product = _.find(state.products, obj => obj.sku == productSku);
    product.quantity = 0;
  });
}

const handleDecrementQty = () => {
  $('#table-body').on('click', '.decrement-quantity', e => {
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
    resetState();
    sortProducts();
    renderFinalTable();
  });
}

const sortProducts = () => {
  let tempState = state.products;
  state.finalList = orderProducts(removeZeroQty(tempState));
  state.products = state.finalList;
}

const removeZeroQty = (productArr) => {
  return _.remove(productArr, obj => obj.quantity !== 0);
}

const orderProducts = (productArr) => {
  return _.orderBy(productArr, ['departmentId', 'class', 'sku'], ['asc', 'asc', 'desc']);
}

const renderFinalTable = () => {
  _.map(state.finalList, element => {
    renderProduct(element);
  });
}

const resetState = () => {
  $('#table-body').children().remove();
}
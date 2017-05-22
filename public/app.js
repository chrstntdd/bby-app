import "babel-polyfill";

$(() => {
  loadCookie();
  handleUPCInput();
  handleDecrementQty();
  handleRemoveItem();
  handleFinalize();
  handleStartOver();
})

window.state = {
  products: [],
  finalList: []
};

const validUPC = () => {
  let clientUPCValue = _.trim($('#upc').val())
  clientUPCValue.length == 12 ?
    callBbyAPI(clientUPCValue) :
    alert('UPC not recognized. Please scan again.');
}

const callBbyAPI = (clientUPCValue) => {
  $.post('/', `upc=${clientUPCValue}`, (data) => {
    if (doesExist(data)) {
      let product = _.find(state.products, data);
      product.quantity++;
    } else {
      data.quantity = 1;
      state.products.push(data);
    }
    setTimeout(() => $('#upc').val(''), 250);
    syncCookies();
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
  $('#upc').on('input', () => {
    validUPC();
    $('table').show();
  });
}

const syncCookies = () => {
  let jsonState = JSON.stringify(state.products);
  createCookie('cookieState',jsonState ,1);
}

const loadCookie = () => {
  if (document.cookie.indexOf('cookieState') > -1) {
    // if cookie exists, get it, parse it, set the state, show the table, then render the products in state;
    let parsedCookieData = JSON.parse(getCookie('cookieState'));
    state.products = parsedCookieData;
    $('table').show();
    renderTable(state.products);
  } 
}

const bindDataToHTML = (data) => {

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
    // alert the user that they're about to delete an item.
    let productSku = $(e.currentTarget).parent().attr('id');
    $(`#${productSku}`).remove();
    let product = _.find(state.products, obj => obj.sku == productSku);
    _.remove(state.products, product);
    syncCookies();
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
    syncCookies();
  });
}

const handleStartOver = () => {
  $('#start-over').on('click', e => {
    eraseCookie('cookieState');
    state.products = [];
    clearTable();
  });
}

const handleFinalize = () => {
  $('#finalize').on('click', e => {
    clearTable();
    sortProducts();
    renderTable(state.finalList);
    syncCookies();
  });
}

const sortProducts = () => {
  let tempState = state.products;
  state.finalList = orderProducts(tempState);
  state.products = state.finalList;
}

const orderProducts = (productArr) => {
  return _.orderBy(productArr, ['departmentId', 'class', 'sku'], ['asc', 'asc', 'desc']);
}

const renderTable = (collection) => {
  _.map(collection, element => {
    renderProduct(element);
  });
}

const clearTable = () => {
  $('#table-body').children().remove();
}

const createCookie = (name, value, days) => {
  let expires;
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toGMTString()}`;
  } else {
    expires = '';
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
}

const getCookie = (c_name) => {
  if (document.cookie.length > 0) {
    let c_start = document.cookie.indexOf(`${c_name}=`);
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      let c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return '';
}

const eraseCookie = (name) => {
  createCookie(name, '', -1);
}
import 'babel-polyfill';

$(() => {
  loadCookie();
  handleUPCInput();
  handleDecrementQty();
  handleRemoveItem();
  handleFormatTable();
  handleClearTable();
  handlePrint();
});

window.state = {
  products: [],
  finalList: []
};

const callBbyAPI = clientUPCValue => {
  $.post('/', `upc=${clientUPCValue}`, data => {
    if ('message' in data) {
      alert(data.message);
      setTimeout(() => $('#upc').val(''), 50);
      syncCookies();
    } else {
      $('table').show();
      if (doesExist(data)) {
        let product = _.find(state.products, data);
        product.quantity++;
      } else {
        data.quantity = 1;
        state.products.push(data);
      }
      setTimeout(() => $('#upc').val(''), 150);
      syncCookies();
      renderProduct(data);
    }
  });
};

const doesExist = data => {
  if (!_.some(state.products, data)) {
    return false;
  } else {
    return true;
  }
};

const handleUPCInput = () => {
  $('#upc').on('input', () => {
    validUPC();
  });
};

const validUPC = () => {
  // GET RAW VALUE FROM DOM
  let clientUPCValue = $('#upc').val();

  // CONVERT INPUT TO ARR AND PARSE EACH VALUE AS AN INT
  let clientUPCArr = clientUPCValue.split('').map(num => parseInt(num, 10));

  // CHECK THAT EACH ENTRY IN THE ARRAY IS A VALID NUMBER
  let UPCNumArr = clientUPCArr.filter(num => _.isInteger(num));

  // CONVERT BACK TO STRING
  let HopefullyValidUPC = UPCNumArr.join('').toString();

  if (HopefullyValidUPC.length === 12) {
    callBbyAPI(HopefullyValidUPC);
  }
};

const syncCookies = () => {
  let jsonState = JSON.stringify(state.products);
  createCookie('cookieState', jsonState, 1);
};

const loadCookie = () => {
  if (document.cookie.indexOf('cookieState') > -1) {
    // if cookie exists, get it, parse it, set the state, show the table, then render the products in state;
    let parsedCookieData = JSON.parse(getCookie('cookieState'));
    state.products = parsedCookieData;
    $('table').show();
    renderTable(state.products);
  } else {
    $('table').hide();
  }
};

const bindDataToHTML = data => {
  let productDetailsHTML = `
    <tr id=''>
      <td class='department' scope='row'></td>
      <td class='class'></td>
      <td class='sku'></td>
      <td class='model'</td>
      <td class='name'></td>
      <td class='upc'></td>
      <td class='quantity'></td>
      <td class='remove-item'><button>remove</button></td>
      <td class='decrement-quantity'><button>-1</button></td>
    </tr>
    `;

  let $productRow = $(productDetailsHTML);

  $productRow.attr('id', data.sku);
  $productRow.find('.name').text(data.name);
  $productRow.find('.sku').text(data.sku);
  $productRow.find('.upc').text(data.upc);
  $productRow
    .find('.department')
    .text(data.departmentId + ' - ' + data.department);
  $productRow.find('.class').text(data.classId);
  $productRow.find('.model').text(data.modelNumber);
  $productRow.find('.quantity').text(data.quantity);

  return $productRow;
};

const renderProduct = data => {
  let productHTML = bindDataToHTML(data);

  let sku = '#' + data.sku;

  if ($(sku).length) {
    // if the SKU exists already, increment quantity else add it to the table
    let $productQty = parseInt($(sku + ' .quantity').text());
    $(sku + ' .quantity').text($productQty + 1);
  } else {
    $('#table-body').prepend(productHTML);
  }
};

const handleRemoveItem = () => {
  $('#table-body').on('click', '.remove-item', e => {
    // alert the user that they're about to delete an item.
    let productSku = $(e.currentTarget).parent().attr('id');
    $(`#${productSku}`).remove();
    let product = _.find(state.products, obj => obj.sku == productSku);
    _.remove(state.products, product);
    syncCookies();
  });
};

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
};

const handleClearTable = () => {
  $('#clear-table').on('click', e => {
    eraseCookie('cookieState');
    state.products = [];
    clearTable();
  });
};

const handleFormatTable = () => {
  $('#format-table').on('click', e => {
    clearTable();
    sortProducts();
    renderTable(state.finalList);
    syncCookies();
    $('table').show();
  });
};

const handlePrint = () => {
  $('#print-table').on('click', e => {
    window.print();
  });
};

const sortProducts = () => {
  let tempState = state.products;
  state.finalList = orderProducts(tempState);
  state.products = state.finalList;
};

const orderProducts = productArr => {
  return _.orderBy(
    productArr,
    ['departmentId', 'classId', 'sku'],
    ['desc', 'desc', 'desc']
  );
};

const renderTable = collection => {
  _.map(collection, element => {
    renderProduct(element);
  });
};

const clearTable = () => {
  $('#table-body').children().remove();
  $('table').hide();
};

const createCookie = (name, value, days) => {
  let expires;
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toGMTString()}`;
  } else {
    expires = '';
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
};

const getCookie = c_name => {
  if (document.cookie.length > 0) {
    let c_start = document.cookie.indexOf(`${c_name}=`);
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      let c_end = document.cookie.indexOf(';', c_start);
      if (c_end == -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return '';
};

const eraseCookie = name => {
  createCookie(name, '', -1);
};

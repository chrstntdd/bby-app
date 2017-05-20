// VALID UPC = 888462313674

let clientUPC = document.getElementById('upc');

let validUPC = () => {
  let clientUPCValue = R.trim(clientUPC.value)
  clientUPCValue.length == 12 ? callBbyAPI(clientUPCValue) : console.log('invalid UPC');
}

let callBbyAPI = (clientUPCValue) => {
  console.log('Valid UPC!');
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = () => {
    if (xhr.status !== 200){
      alert('Request failed. Returned status of ' + xhr.status);
    }
  }
  xhr.send('upc=' + clientUPCValue);
}

clientUPC.addEventListener('input', validUPC);
var rootNameObj;
var quantityObj;
var arrayValuesRoot = [];
var valueInput = document.getElementById("valueRoot");
var nroValues = 1;
var placeholderCustom = `Valor N°: ${nroValues}`;
valueInput.placeholder = placeholderCustom;

var divValues = document.getElementById("divValues");
divValues.style.display = "none";


var changeArrayValue = function(position, value) {
  console.log(position);
  console.log(value);
};

// function to create HTML dinamically
function createSpanRoot(position, value){
  let span = document.createElement("span");
  span.setAttribute("class", "badge rounded-pill bg-info badgeCustom");
  span.setAttribute("id", `badge-${position}`);
  span.innerHTML = `${position}: ${value}`;
  return span
}

function createButtonDissmiss(position, valueBtn){
  let btnDissmiss = document.createElement("button");
  btnDissmiss.setAttribute("class", "btn-close");
  btnDissmiss.addEventListener('click', changeArrayValue);
  return btnDissmiss
}

//----------------------


function saveRoot(){
  rootNameObj = document.getElementById("rootName");
  quantityObj = document.getElementById("quantity");
  rootNameObj.disabled = true;
  quantityObj.disabled = true;
  divValues.style.display = "block";
}

function rebootRoot(){
  rootNameObj.value = "";
  quantityObj.value = "";
  rootNameObj.disabled = false;
  quantityObj.disabled = false;
  divValues.style.display = "none";
}

function addValueRoot(){
  arrayValuesRoot.push(valueInput.value);
  let spanCustom = createSpanRoot(nroValues, valueInput.value);
  let btnDissmissCustom = createButtonDissmiss(nroValues, valueInput.value);
  spanCustom.appendChild(btnDissmissCustom);

  document.getElementById("divLoades").appendChild(spanCustom);
  nroValues += 1;
  if(nroValues > quantityObj.value){
    valueInput.placeholder = `La carga de datos está completa`;
    valueInput.disabled = true;
  }else{
    valueInput.placeholder = `Valor N°: ${nroValues}`
  }
  valueInput.value = "";
  console.log(arrayValuesRoot);
}


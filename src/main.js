var gralData = [];
var rootData = [];
var entropyGral = 0;
var variablesNames = [];
var mainRoot;

var excelFile = document.getElementById("excel-file");

excelFile.addEventListener("change", function () {
  readXlsxFile(excelFile.files[0]).then(function (data) {
    console.log(data);
    gralData = data;
    var i = 0;
    data.map((row, index) => {
      let table = document.getElementById("table-result");
      i == 0 ? generateTableHead(table, row) : generateTableRows(table, row);
      i++;
    });
    variablesNames = data[0];
    //rootData = extractRootData(data);
    //entropyGral = calculateEntropy(rootData);
  });
});

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTableRows(table, data) {
  let newRow = table.insertRow(-1);
  data.map((row, index) => {
    let newCell = newRow.insertCell();
    let newText = document.createTextNode(row);
    newCell.appendChild(newText);
  });
}

function extractRootData(data) {
  const lengthData = data[0].length;
  let rootValues = [];
  for (let index = 1; index < data.length; index++) {
    const element = data[index];
    rootValues.push(element[lengthData - 1]);
  }
  return rootValues;
}

function logaritmBaseTwo(x) {
  return Math.log(x) / Math.log(2);
}

function calculateEntropy(arrayValues) {
  const totalValaues = arrayValues.length;
  const counts = arrayValues.reduce(
    (cnt, cur) => ((cnt[cur] = cnt[cur] + 1 || 1), cnt),
    {}
  );
  var result = 0;
  for (const key in counts) {
    const element = counts[key];
    result +=
      -(element / totalValaues) * logaritmBaseTwo(element / totalValaues);
  }
  return Math.round(result * 1000) / 1000;
}

function nodeExecution(indexValue, theGralData) {

  rootData = extractRootData(theGralData);
  entropyGral = calculateEntropy(rootData);

  let variablesValues = [];
  let resultData = {};

  resultData["name"] = variablesNames[indexValue];
  resultData["index"] = indexValue;

  for (let index = 1; index < theGralData.length; index++) {
    const element = theGralData[index];
    variablesValues.push(element[indexValue]);
  }

  const counts = variablesValues.reduce(
    (cnt, cur) => ((cnt[cur] = cnt[cur] + 1 || 1), cnt),
    {}
  );

  const countsRoot = rootData.reduce(
    (cnt, cur) => ((cnt[cur] = cnt[cur] + 1 || 1), cnt),
    {}
  );

  var entropyData = 0;
  var referencesValues = [];
  for (const key in counts) {
    var result = {};
    for (const keyRoot in countsRoot) {
      let count = 0;
      for (let i = 0; i < rootData.length; i++) {
        if (variablesValues[i] == key && rootData[i] == keyRoot) {
          count += 1;
        }
      }
      result[`${key}-${keyRoot}`] = count;
    }
    referencesValues.push(result);
    entropyData += calculatePartialEntropy(result, theGralData.length - 1);
  }
  resultData["referenceValues"] = referencesValues;
  resultData["profit"] = Math.round((entropyGral - entropyData) * 1000) / 1000;
  return resultData;
}

function calculatePartialEntropy(objValue, total) {
  var summed = 0;
  var result = 0;
  for (var key in objValue) {
    summed += objValue[key];
  }
  let acum = 0;
  for (var key in objValue) {
    const element = objValue[key];
    let partialResult = -(element / summed) * logaritmBaseTwo(element / summed);
    result += isNaN(partialResult) ? 0 : partialResult;
  }
  acum += (summed / total) * (Math.round(result * 1000) / 1000);
  return acum;
}

function addChildToFather(father, name){
  father.addChild(name);
}

//esta es la funcion principal
function completeNodeExecution() {

  var test = recursiveLoop(gralData);
  console.log(test);
}


function recursiveLoop(data){
  var element = recursiveTree(data);
  var conjuntosNuevos = element.newSet;
  var nodo = new Tree(element.name);

  for (let index = 0; index < conjuntosNuevos.length; index++) {
    const hijo = recursiveTree(conjuntosNuevos[index]);
    if(hijo.newSet.length > 0){
      var test = recursiveLoop(conjuntosNuevos[index])
    }
    addChildToFather(nodo, hijo.name)
  }

  return nodo;
}




function analizarRama (theData) {
  const hijo = recursiveTree(theData);
  if(hijo.newSet.length > 0){
    for (let index = 0; index < hijo.newSet.length; index++) {
      const element = analizarRama(hijo.newSet[index]);
      
    }
  }
}









function createNodeElement(data, fatherElement) {
  var nodeUl = document.createElement("ul");
  var nodeLi = document.createElement("li");
  var tagNode = document.createElement("a");
  tagNode.setAttribute("href", "#");
  tagNode.innerHTML = data.name;
  nodeLi.setAttribute("id", `index-${data.index}`);
  nodeLi.appendChild(tagNode);
  nodeUl.appendChild(nodeLi);
  document.getElementById(fatherElement).appendChild(nodeUl);
}

//nuevo createElement
function justCreate(data){
  var nodeLi = document.createElement("li");
  var tagNode = document.createElement("a");
  tagNode.setAttribute("href", "#");
  tagNode.innerHTML = data.name;
  nodeLi.setAttribute("id", `index-${data.index}`);
  nodeLi.appendChild(tagNode);
  return nodeLi;
}

function detectRefData(referenceValues) {
  var arrayKeys = [];

  for (let index = 0; index < referenceValues.length; index++) {
    const element = referenceValues[index];
    for (var key in element) {
      if (element[key] == 0) {
        let valueSplit = key.split("-");
        for (let indexValue = 1; indexValue < gralData.length; indexValue++) {
          const element = gralData[indexValue];
          for (let i = 0; i < element.length; i++) {
            const dataElement = element[i];
            if( valueSplit[0] == dataElement){
              arrayKeys.push(indexValue);
            }
          }
        }
      }
    }
  }
  return arrayKeys;
}

function createNewSet(arrayReferences){

  let newSetData = [];
  var newSet = [];

  for (let index = 0; index < arrayReferences.length; index++) {
    const element = arrayReferences[index];
    let labelPart = "";
    let hasToBePart = true;
    for (const key in element) {
      labelPart = key.split("-");;
      if (element[key] == 0){
        hasToBePart = false;
      }
    }
    if(hasToBePart){
      newSetData = [];
      for (let i = 0; i < gralData.length; i++) {
        const element = gralData[i];
        if(i == 0){
          newSetData.push(element)
        }
        for (let j = 0; j < element.length; j++) {
          let valueData = element[j];
          if(valueData == labelPart[0]){
            newSetData.push(element)
          }
        }
      }
      newSet.push(newSetData);
    }
  }
  return newSet
}

function recursiveTree(group){
  var result = {};
  var maxElementSecond = {}; 
  var nodeDataSecond = [];
  for (let index = 0; index < variablesNames.length - 1; index++) {
    const result = nodeExecution(index, group);
    nodeDataSecond.push(result);
  }
  maxElementSecond = nodeDataSecond.reduce(function (prev, current) {
    return prev.profit > current.profit ? prev : current;
  });

  result["name"] = maxElementSecond.name;

  //paraa ver 
  var newSetCreatedSecond = createNewSet(maxElementSecond.referenceValues);
  result["newSet"] = newSetCreatedSecond
  return result;
}

var Tree = function(value) {
  this.name = value;
  this.children = [];
};

Tree.prototype.addChild = function(value) {
  var child = new Tree(value);
  this.children.push(child);
  return child;
}


///----------------------
//posible borrado en el futuro
// function removeColumn(indexRemove){
//   for (let index = 0; index < gralData.length; index++) {
//     const element = gralData[index];
//     element.splice(indexRemove, 1);
//   }
// }

// function removeRow(arrayIndex){
//   for (let index = 0; index < arrayIndex.length; index++) {
//     const elementIndex = arrayIndex[index];
//     gralData.splice((elementIndex - index), 1);
//   }
// }
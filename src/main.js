var gralData = [];
var rootData = [];
var entropyGral = 0;
var variablesNames = [];

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
    rootData = extractRootData(data);
    entropyGral = calculateEntropy(rootData);
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
  console.log(rootValues);
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

function nodeExecution(indexValue) {
  let variablesValues = [];
  let resultData = {};

  resultData["name"] = variablesNames[indexValue];
  resultData["index"] = indexValue;

  for (let index = 1; index < gralData.length; index++) {
    const element = gralData[index];
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
    entropyData += calculatePartialEntropy(result, gralData.length - 1);
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

function completeNodeExecution() {
  var nodeData = [];
  for (let index = 0; index < variablesNames.length - 1; index++) {
    const result = nodeExecution(index);
    nodeData.push(result);
  }
  const maxElement = nodeData.reduce(function (prev, current) {
    return prev.profit > current.profit ? prev : current;
  });
  detectRefData(maxElement.referenceValues);
  removeColumn(maxElement.index);
  createNodeElement(maxElement, "theTree");
}

function createNodeElement(data, fatherElement) {
  var nodeUl = document.createElement("ul");
  var nodeLi = document.createElement("li");
  var tagNode = document.createElement("a");
  tagNode.setAttribute("href", "#");
  tagNode.setAttribute("id", `index-${data.index}`);
  tagNode.innerHTML = data.name;
  nodeLi.appendChild(tagNode);
  nodeUl.appendChild(nodeLi);
  document.getElementById(fatherElement).appendChild(nodeUl);
}

function detectRefData(referenceValues) {
  console.log(referenceValues);
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

function removeColumn(indexRemove){
  for (let index = 0; index < gralData.length; index++) {
    const element = gralData[index];
    element.splice(indexRemove, 1);
  }
  console.log(gralData);
}

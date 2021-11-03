var gralData = [];
var rootData = [];
var entropyGral = 0;
var variablesNames = [];
var mainRoot;

var excelFile = document.getElementById("excel-file");

excelFile.addEventListener("change", function () {
  const dataCsv = excelFile.files[0];
  Papa.parse(dataCsv, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (result) {
      for (let index = 0; index < result.data.length; index++) {
        let arrayOfData = [];
        const element = result.data[index];
        if (index == 0) {
          Object.keys(element).forEach((key) => {
            variablesNames.push(key);
          });
          gralData.push(variablesNames);
        }
        Object.keys(element).forEach((key) => {
          if (isNumeric(element[key])) {
            arrayOfData.push(parseFloat(element[key]));
          } else {
            arrayOfData.push(element[key]);
          }
        });
        gralData.push(arrayOfData);
      }
      var i = 0;
      gralData.map((row, index) => {
        let table = document.getElementById("table-result");
        i == 0 ? generateTableHead(table, row) : generateTableRows(table, row);
        i++;
      });
    },
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
  console.log("------", indexValue);
  console.log("the gralDta", theGralData);
  console.log("the gralData en index", theGralData[1][indexValue]);
  console.log("------");

  let firstValue = theGralData[1][indexValue];

  if (isNumeric(firstValue)) {
    return processContinousValues(indexValue, theGralData);
  } else {
    return processGain(indexValue, theGralData);
  }

  console.log("Seguir por acá...");
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

function addChildToFather(father, name) {
  father.addChild(name);
}

//Esta es la funcion principal
function completeNodeExecution() {
  var test = recursiveLoop(gralData);
  console.log(test);
}

function recursiveLoop(data) {
  /* var element = recursiveTree(data);
  console.log("1salida element", element);
  var children = element.newSet;
  var nodo = new Nodo(element.name); */

  if (data.length == 0) {
    var nodo = new Nodo("fail");
    return nodo;
  } else if (variablesNames.length - 1 == usedVariables) {
    /* var element = recursiveTree(data);
    var children = element.newSet; */
    return nodo;
  } else {
    var element = recursiveTree(data);
    var children = element.newSet;
    var nodo = new Nodo(element.name);
    for (let index = 0; index < children.length; index++) {
      if (variablesNames.length - 1 == usedVariables) {
        return nodo;
      } else if (children[index].length > 1) {
        addChildToFather(nodo, recursiveLoop(children[index]));
      }
    }
  }

  return nodo;
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

function isNumeric(value) {
  return /^-?[0-9.,]+/.test(value);
}

//nuevo createElement
function justCreate(data) {
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
            if (valueSplit[0] == dataElement) {
              arrayKeys.push(indexValue);
            }
          }
        }
      }
    }
  }

  return arrayKeys;
}

let reduceData = [];
let band = true;
function createNewSet(arrayReferences, atributeName, reduceData) {
  let newSetData = [];
  var newSet = [];
  less = [];
  greater = [];
  let indexAtribute = gralData[0].indexOf(atributeName);

  for (let index = 0; index < arrayReferences.length; index++) {
    const element = arrayReferences[index];
    let labelPart = "";
    let hasToBePart = true;
    for (const key in element) {
      labelPart = key.split("-");
      if (element[key] == 0) {
        hasToBePart = false;
      }
    }
    if (hasToBePart) {
      newSetData = [];
      less = [];
      greater = [];
      let typeVar = "";
      for (let i = 0; i < reduceData.length; i++) {
        const element = reduceData[i];
        if (i == 0) {
          newSetData.push(element);
          less.push(element);
          greater.push(element);
        } else {
          let valueData = element[indexAtribute];
          if (isNumeric(valueData)) {
            // processContinous
            typeVar = "continous";
            let valueSplit = labelPart[0][0];
            let signo = valueSplit == ">" ? ">" : "<=";
            let signoLentgh = signo == ">" ? 1 : 2;
            let valueArray = labelPart[0].substr(signoLentgh);
            let valueFloat = parseFloat(valueArray);
            switch (signo) {
              case ">":
                {
                  if (valueData > valueFloat) {
                    greater.push(element);
                  }
                }
                break;
              case "<=":
                if (valueData <= valueFloat) {
                  less.push(element);
                }
                break;
            }
          } else {
            // processDiscrete
            typeVar = "discrete";
            if (valueData == labelPart[0]) {
              newSetData.push(element);
            }
          }
        }
      }
      if (typeVar == "continous") {
        newSet = [less, greater];
      } else {
        newSet.push(newSetData);
      }
    }
  }

  console.log("the newSet####", newSet);
  return newSet;
}

let usedVariables = [];

function recursiveTree(group) {
  console.log("recursive Tree", group);
  var result = {};
  var maxElementSecond = {};
  var nodeDataSecond = [];
  let maxElement = -1;
  for (let index = 0; index < variablesNames.length - 1; index++) {
    const result = nodeExecution(index, group);
    nodeDataSecond.push(result);
  }

  for (let index = 0; index < nodeDataSecond.length; index++) {
    const element = nodeDataSecond[index];
    const elementNotExist =
      usedVariables.indexOf(element.name) == -1 ? true : false;
    if (elementNotExist && element.profit >= maxElement) {
      maxElementSecond = element;
      maxElement = element.profit;
    }
  }

  usedVariables.push(maxElementSecond.name);
  result["name"] = maxElementSecond.name;

  var newSetCreatedSecond = createNewSet(
    maxElementSecond.referenceValues,
    maxElementSecond.name,
    group
  );

  result["newSet"] = newSetCreatedSecond;
  return result;
}

var Nodo = function (value) {
  this.name = value;
  this.children = [];
};

Nodo.prototype.addChild = function (value) {
  var child = new Nodo(value);
  this.children.push(child);
  return child;
};

function processContinousValues(indexValue, theGralData) {
  let valueContinous = [];
  let midPoint = [];
  let arrayGain = [];
  let dataCalculate = [];

  for (let index = 0; index < theGralData.length; index++) {
    const element = theGralData[index];
    dataCalculate.push([...element]);
  }

  for (let index = 1; index < theGralData.length; index++) {
    const element = theGralData[index][indexValue];
    valueContinous.push(element);
  }

  valueContinous.sort(function (a, b) {
    return a - b;
  });

  for (let index = 0; index < valueContinous.length - 1; index++) {
    const element = valueContinous[index];
    if (valueContinous[index] != valueContinous[index + 1]) {
      let threshold = (valueContinous[index] + valueContinous[index + 1]) / 2;
      midPoint.push(threshold);
    }
  }

  for (let index = 0; index < midPoint.length; index++) {
    const point = midPoint[index];

    for (let i = 1; i < dataCalculate.length; i++) {
      const valueCont = theGralData[i][indexValue];
      dataCalculate[i][indexValue] = point <= valueCont ? "Yes" : "No";
    }
    arrayGain.push(processGain(indexValue, dataCalculate));
  }

  let max = -Infinity;
  let keyMax;

  arrayGain.forEach(function (v, k) {
    if (max < +v.profit) {
      max = +v.profit;
      keyMax = k;
    }
  });

  let bestTreashold = arrayGain[keyMax];
  bestTreashold["umbral"] = midPoint[keyMax];

  let newReferences = [];

  for (let index = 0; index < bestTreashold.referenceValues.length; index++) {
    const element = bestTreashold.referenceValues[index];
    let newObj = {};
    Object.keys(element).forEach(function (key) {
      let splitValues = key.split("-");
      if (splitValues[0] == "No") {
        splitValues[0] = `<=${midPoint[keyMax]}`;
      } else {
        splitValues[0] = `>${midPoint[keyMax]}`;
      }
      let newKey = splitValues.join("-");
      newObj[`${newKey}`] = element[key];
    });
    newReferences.push(newObj);
  }

  bestTreashold.referenceValues = newReferences;
  return bestTreashold;
}

function processGain(indexValue, theGralData) {
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

function removeUsslessColumn(removeIndex, group) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
  }
}
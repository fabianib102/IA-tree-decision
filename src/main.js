var gralData = [];
var rootData = [];
var entropyGral = 0;
var variablesNames = [];
var resultArr = [];
let reduceData = [];
let usedVariables = [];

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
  let firstValue = theGralData[1][indexValue];
  if (isNumeric(firstValue)) {
    return processContinousValues(indexValue, theGralData);
  } else {
    return processGain(indexValue, theGralData);
  }
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

//Esta es la funcion principal que genera el arbol de decisión
function completeNodeExecution() {

  let treeData = recursiveLoop(gralData, "");

  console.log(treeData);

  if(gralData.length < 1){
    return false;
  }

  //run the tree
  // set the dimensions and margins of the diagram
  var margin = {top: 40, right: 90, bottom: 50, left: 90},
  width = 660 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  // declares a tree layout and assigns the size
  var treemap = d3.tree()
  .size([width, height]);

  //  assigns the data to a hierarchy using parent-child relationships
  var nodes = d3.hierarchy(treeData);

  // maps the node data to the tree layout
  nodes = treemap(nodes);

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#mainTree").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom),
  g = svg.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // adds the links between the nodes
  var link = g.selectAll(".link")
  .data( nodes.descendants().slice(1))
  .enter().append("path")
  .attr("class", "link")
  .attr("d", function(d) {
    return "M" + d.x + "," + d.y
      + "C" + d.x + "," + (d.y + d.parent.y) / 2
      + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
      + " " + d.parent.x + "," + d.parent.y;
    });

  // adds each node as a group
  var node = g.selectAll(".node")
  .data(nodes.descendants())
  .enter().append("g")
  .attr("class", function(d) { 
    return "node" + 
      (d.children ? " node--internal" : " node--leaf"); })
  .attr("transform", function(d) { 
    return "translate(" + d.x + "," + d.y + ")"; });

  // adds the circle to the node
  node.append("circle")
  .attr("r", 10);

  // adds the text to the node
  node.append("text")
  .attr("dy", ".35em")
  .attr("y", function(d) { return d.children ? -20 : 20; })
  .style("text-anchor", "middle")
  .text(function(d) { return d.data.value; });

  node.append("text")
  .attr("y", function(d) { return d.children ? -30 : 30; })
  .style("text-anchor", "middle")
  .text(function(d) { return d.data.gain ? `Ganancia: ${d.data.gain}` : ""; });

  node.append("text")
  .attr("y", function(d) { return d.children ? -40 : 40; })
  .style("text-anchor", "middle")
  .text(function(d) { return d.data.umbral; });
  

}

function recursiveLoop(data, fatherName) {
  var resultforescat = recursiveTree(data);
  let parent = fatherName ? fatherName : "";
  let nodo = new Tree(resultforescat.name, "", parent, resultforescat.ganancia);

  //let can = variablesNames.length - 1;
  //let firstCondition = usedVariables.length == can;
  let firstCondition = data.length == 0;
  //condicion de cierre
  if (firstCondition) {
    return true;
  } else {
    //no anda por que son datos discretos pueden tener mas de un set
    for (let index = 0; index < resultforescat.newSet.length; index++) {
      currentNode = resultforescat.newSet[index];
      if (currentNode["values"].length > 0) {
        nodo.addChild(
          recursiveLoop(currentNode["values"], resultforescat.name)
        );
      } else {
        let newNodo = new Tree(
          currentNode["decision"],
          currentNode["valueReference"],
          nodo.value,
          ""
        );
        nodo.addChild(newNodo);
      }
    }
    return nodo;
  }
}

var Tree = function (value, umbral, parent, gain) {
  this.value = value;
  this.umbral = umbral;
  this.parent = parent;
  this.gain = gain;
  this.children = [];
};

Tree.prototype.addChild = function (tree) {
  this.children.push(tree);
  return tree;
};

function isNumeric(value) {
  return /^-?[0-9.,]+/.test(value);
}

function getNodeLeaf(element) {
  let labelPart = "";
  let nodeLeaf = {};
  for (const key in element) {
    if (element[key] != 0) {
      labelPart = key.split("-");
      nodeLeaf["valueReference"] = labelPart[0];
      nodeLeaf["decision"] = labelPart[1];
      nodeLeaf["values"] = [];
    }
  }
  return nodeLeaf;
}

function getNodeBranch(element) {
  let nodeBranch = {};
  key = Object.keys(element)[0];
  let labelPart = key.split("-");
  nodeBranch["valueReference"] = labelPart[0];
  nodeBranch["decision"] = "undefined";
  return nodeBranch;
}

function createNewSet(arrayReferences, atributeName, reduceData) {
  let newSetData = [];
  var newSet = [];
  let indexAtribute = gralData[0].indexOf(atributeName);

  for (let index = 0; index < arrayReferences.length; index++) {
    const element = arrayReferences[index];
    let labelPart = "";
    let hasToBePart = true;
    let nodeLeaf = {};
    for (const key in element) {
      labelPart = key.split("-");
      if (element[key] == 0) {
        hasToBePart = false;
        nodeLeaf = getNodeLeaf(element);
        newSet.push(nodeLeaf);
      }
    }
    if (hasToBePart) {
      let nodeBranch = {};
      nodeBranch = getNodeBranch(element);
      newSetData = [];
      for (let i = 0; i < reduceData.length; i++) {
        const element = reduceData[i];
        if (i == 0) {
          newSetData.push(element);
        } else {
          let valueData = element[indexAtribute];
          if (isNumeric(valueData)) {
            // processContinous
            let valueSplit = labelPart[0][0];
            let signo = valueSplit == ">" ? ">" : "<=";
            let signoLentgh = signo == ">" ? 1 : 2;
            let valueArray = labelPart[0].substr(signoLentgh);
            let valueFloat = parseFloat(valueArray);
            switch (signo) {
              case ">":
                {
                  if (valueData > valueFloat) {
                    newSetData.push(element);
                  }
                }
                break;
              case "<=":
                if (valueData <= valueFloat) {
                  newSetData.push(element);
                }
                break;
            }
          } else {
            // processDiscrete
            if (valueData == labelPart[0]) {
              newSetData.push(element);
            }
          }
        }
      }
      nodeBranch["values"] = newSetData;
      newSet.push(nodeBranch);
    }
  }
  return newSet;
}

function recursiveTree(group) {
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
    if (element.profit >= maxElement) {
      maxElementSecond = element;
      maxElement = element.profit;
    }
  }

  result["name"] = maxElementSecond.name;
  result["ganancia"] = maxElementSecond.profit;

  var newSetCreatedSecond = createNewSet(
    maxElementSecond.referenceValues,
    maxElementSecond.name,
    group
  );
  result["newSet"] = newSetCreatedSecond;
  return result;
}

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

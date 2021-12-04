/**
 *  declaracion de variables globales para la aplicacion
 */
var gralData = [];
var rootData = [];
var entropyGral = 0;
var variablesNames = [];
var resultArr = [];
let reduceData = [];
let usedVariables = [];
let tasaGanacia;

var excelFile = document.getElementById("excel-file");

/**
 *  Funcion encargada de convertir los datos de formato csv a json
 */
excelFile.addEventListener("change", function () {
  const dataCsv = excelFile.files[0];
  let tableReset = document.getElementById("table-result");
  tableReset.deleteTHead();
  gralData = [];
  variablesNames = [];
  Papa.parse(dataCsv, {
    download: true,
    header: true,
    skipEmptyLines: true,
    delimiter: ";",
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

/**
 *  Funcion encargada de establecer las cabeceras de la tabla de datos, mostrada por la aplicacion
 */
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

/**
 * establece los valores en la tabla
 */
function generateTableRows(table, data) {
  let newRow = table.insertRow(-1);
  data.map((row, index) => {
    let newCell = newRow.insertCell();
    let newText = document.createTextNode(row);
    newCell.appendChild(newText);
  });
}

/**
 *  Funcion encargada de obtener el mejor, atributos del dataset analizado
 */
function extractRootData(data) {
  const lengthData = data[0].length;
  let rootValues = [];
  for (let index = 1; index < data.length; index++) {
    const element = data[index];
    rootValues.push(element[lengthData - 1]);
  }
  return rootValues;
}

/**
 * ejecula el logaritmo en base 2
 */
function logaritmBaseTwo(x) {
  return Math.log(x) / Math.log(2);
}

/**
 * Funcion encargada de calcular la entropia,
 * para un atributo determinado del dataset
 */
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

/**
 * Funcion encargada de determinar el tipo de dato(continua o discreta) para cada atributo del conjunto de datos (dataset)
 */
function nodeExecution(indexValue, theGralData) {
  let firstValue = theGralData[1][indexValue];
  if (isNumeric(firstValue)) {
    return processContinousValues(indexValue, theGralData);
  } else {
    return processGain(indexValue, theGralData);
  }
}

/**
 * calcula las entropias parciales
 */
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

function zoom() {
  var scale = d3.event.scale,
      translation = d3.event.translate,
      tbound = -h * scale,
      bbound = h * scale,
      lbound = (-w + m[1]) * scale,
      rbound = (w - m[3]) * scale;
  // limit translation to thresholds
  translation = [
      Math.max(Math.min(translation[0], rbound), lbound),
      Math.max(Math.min(translation[1], bbound), tbound)
  ];
  d3.select(".drawarea")
      .attr("transform", "translate(" + translation + ")" +
            " scale(" + scale + ")");
}

/**
 * Funcion principal de la aplicacion, encargada de generar el arbol de decision
 */
function completeNodeExecution(executionGain) {
  tasaGanacia = executionGain;

  let treeData = recursiveLoop(gralData, "");

  console.log(treeData);

  if (gralData.length < 1) {
    return false;
  }

  /**
   * definicion y establecimiento de un conjunto de variables, necesarios por la libreria d3, para graficar el arbol adecuadamente.
   */
  var margin = { top: 40, right: 90, bottom: 50, left: 90 },
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var treemap = d3.tree().size([width, height]);
  var nodes = d3.hierarchy(treeData);
  nodes = treemap(nodes);

  let idTree = tasaGanacia ? "#mainTreeGain" : "#mainTree";

  var svg = d3
      .select(idTree)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),
    g = svg
      .call(d3.behavior.zoom().scaleExtent([0.5, 5]).on("zoom", zoom))
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var link = g
    .selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", function (d) {
      return (
        "M" +
        d.x +
        "," +
        d.y +
        "C" +
        d.x +
        "," +
        (d.y + d.parent.y) / 2 +
        " " +
        d.parent.x +
        "," +
        (d.y + d.parent.y) / 2 +
        " " +
        d.parent.x +
        "," +
        d.parent.y
      );
    });

  var node = g
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr("class", function (d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  node.append("circle").attr("r", 10);

  node
    .append("text")
    .attr("dy", ".35em")
    .attr("y", function (d) {
      return d.children ? -20 : 20;
    })
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.value;
    });

  node
    .append("text")
    .attr("y", function (d) {
      return d.children ? -30 : 30;
    })
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.gain
        ? `${tasaGanacia ? "Tasa de Ganancia" : "Ganancia"}: ${d.data.gain}`
        : "";
    });

  node
    .append("text")
    .attr("y", function (d) {
      return d.children ? -40 : 40;
    })
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.umbral;
    });

  /* node
    .append("text")
    .attr("y", function (d) {
      return d.children ? -50 : 50;
    })
    .style("text-anchor", "middle")
    .text(function (d) {
      return "SI: 3";
    }); */
}

/**
 * Funcion encargada de evaluar atributo del dataset, de manera recursiva
 */
function recursiveLoop(data, fatherName, umbral) {
  var resultforescat = recursiveTree(data);
  let parent = fatherName ? fatherName : "";
  let umbralLabel = umbral ? umbral : "";
  let nodo = new Tree(
    resultforescat.name,
    umbralLabel,
    parent,
    resultforescat.ganancia
  );

  let firstCondition = data.length == 0;
  //condicion de cierre
  if (firstCondition) {
    return true;
  } else {
    for (let index = 0; index < resultforescat.newSet.length; index++) {
      currentNode = resultforescat.newSet[index];
      if (currentNode["values"].length > 0) {
        nodo.addChild(
          recursiveLoop(
            currentNode["values"],
            resultforescat.name,
            currentNode.valueReference
          )
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

/**
 * funtion encarga de definir la estructura de cada nodo del arbol
 * @param {string} value
 * @param {float} umbral
 * @param {Tree} parent
 * @param {float} gain
 */
var Tree = function (value, umbral, parent, gain) {
  this.value = value;
  this.umbral = umbral;
  this.parent = parent;
  this.gain = gain;
  this.children = [];
};

/**
 * Funcion encargada de agregar a un nodo determinado, nodos hijos
 */
Tree.prototype.addChild = function (tree) {
  this.children.push(tree);
  return tree;
};

/**
 * Funcion encangada de verificar si un valor determinado de tipo string es un numero
 * @param {string} value - un valor determinado para verificar si es numerico
 * @returns boolean
 */
function isNumeric(value) {
  return /^-?[0-9.,]+/.test(value);
}

/**
 * Funcion encangada de obtener los nodos hojas de un determinado nodo
 * @param {array} element - element es un array de atributos a evaluar
 * @returns nodeLeaf
 */
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

/**
 * Funcion encangada de obtener las rama de un nodo determinado con sus valores asociados a estas.
 * @param {array} element - element es un array de atributos a evaluar
 * @returns nodeBranch
 */
function getNodeBranch(element) {
  let nodeBranch = {};
  key = Object.keys(element)[0];
  let labelPart = key.split("-");
  nodeBranch["valueReference"] = labelPart[0];
  nodeBranch["decision"] = "undefined";
  return nodeBranch;
}

/**
 * funcion encargada de añadir a cada nodo, del arbol
 */
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

/**
 * funcion que devuelve un objeto que será representado en el futuro como nodo
 * con el nuevo conjunto separado
 */
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

/**
 * procesa conjuntos de valores continuos para discretizarlo
 */
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

/**
 * Funcion encangada de obtener la ganancia para un atributo determinado del dataset evaluado.
 * @param {integer} indexValue - indice del atributo del conjunto de datos a evaluar
 * @param {array} theGralData - conjunto de datos(dataset a evaluar) en formato de array
 */
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

  //hacer un if si hay que calcular tasa de ganancia
  if (tasaGanacia) {
    let gainData = Math.round((entropyGral - entropyData) * 1000) / 1000;
    let denominador = calculateDenominador(counts);
    resultData["profit"] = Number((gainData / denominador).toFixed(3));
  } else {
    resultData["profit"] =
      Math.round((entropyGral - entropyData) * 1000) / 1000;
  }
  return resultData;
}

/**
 * funcion calcula el denominador, cuando se trata del calculo de la tasa de ganancia
 */
function calculateDenominador(objValues) {
  let result = 0;
  let total = 0;
  Object.keys(objValues).forEach(function (key) {
    total += objValues[key];
  });

  Object.keys(objValues).forEach(function (key) {
    result +=
      -(objValues[key] / total) * logaritmBaseTwo(objValues[key] / total);
  });
  return Number(result.toFixed(3));
}

var gralData = [];
var rootData = [];
var entropyGral = 0;

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

function nodeExecution() {
  let variablesValues = [];
  for (let index = 1; index < gralData.length; index++) {
    const element = gralData[index];
    variablesValues.push(element[1]);
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
    entropyData += calculatePartialEntropy(result, (gralData.length - 1));
  }
  //seguir 
  console.log(entropyGral - entropyData);

}

function calculatePartialEntropy(objValue, total) {
  var summed = 0;
  var result = 0;
  for (var key in objValue) {
    summed += objValue[key];
  };
  let acum = 0;
  for (var key in objValue) {
    const element = objValue[key];
    result += -(element / summed) * logaritmBaseTwo(element / summed);
  };
  acum += ((summed/total) * (Math.round(result * 1000) / 1000));
  return acum;
}

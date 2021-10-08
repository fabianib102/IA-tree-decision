var objectData = {};

var excelFile = document.getElementById("excel-file");

excelFile.addEventListener("change", function () {
  readXlsxFile(excelFile.files[0]).then(function (data) {
    console.log(data);
    var i = 0;
    data.map((row, index) => {
      let table = document.getElementById("table-result");
      i == 0 ? generateTableHead(table, row) : generateTableRows(table, row);
      i++;
    });
    let rootData = extractRootData(data);
    calculateEntropy(rootData);
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
    // for (let i = 0; i < elements.length; i++) {
    //   const dataValue = elements[i];
    //   console.log(dataValue);
    // }
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
    result += (-(element/totalValaues) * logaritmBaseTwo(element/totalValaues));
  }
  console.log(Math.round(result * 1000) / 1000);
  return Math.round(result * 1000) / 1000;
}




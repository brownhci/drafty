let rows = [];
const search     = document.getElementById("search");
const searchBar  = document.getElementById("searchBar");
const searchVals = [];
let sortIsAsc = false;
const sortCol   = 0;

/*
* Resize headers to match columns: sw not done (prob going to do it statically)
*/
/* sw need to convert jquery
var fitHeaders = (function() {
  var prevWidth = [];
  return function() {
    //var $firstRow = $('#contentArea tr:not(.clusterize-extra-row):first');
    var columnsWidth = [];
    document.getElementById('clusterize-extra-row').children().each(function() {
      columnsWidth.push($(this).width());
    });
    if(columnsWidth.toString() == prevWidth.toString()) return;
    $('#headerArea tr').children().each(function(i) {
      $(this).width(columnsWidth[i]);
    });
    prevWidth = columnsWidth;
  }
})();
*/

/*
* Fetch suitable rows
*/
const filterRows = function(rows) {
  log('Filter Rows Started...')
  const results = [];
  for(let i = 0, ii = rows.length; i < ii; i++) {
    if(rows[i].active) results.push(rows[i].markup);
  }
  return results;
};

/*
* Init clusterize.js
*/
let clusterize = new Clusterize({ //uses existing markup: https://clusterize.js.org/
  scrollId: "scrollArea",
  contentId: "contentArea"
});

/*
* re-Init clusterize.js
*/
function initClusterize() {
  clusterize = new Clusterize({
    rows: filterRows(rows),
    scrollId: "scrollArea",
    contentId: "contentArea",
    callbacks: {
      // Update headers width on cluster change
      clusterChanged: function() {
        //fitHeaders();
      }
    }
  });
}

/*
* get data from table to fully seed the rows data structure used by clusterize
*/
const table = document.getElementById("drafty-table");
//const tableHidden = document.getElementById("drafty-table-hidden");
const tableHidden = document.getElementById("drafty-template").content.getElementById("drafty-table-hidden");
function getRowData(tbl) {
  log('starting...getRowData')
  for (var i = 0, row; row = tbl.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    vals = [];
    for (var j = 0, col; col = row.cells[j]; j++) {
      //iterate through columns
      //columns would be accessed using the "col" variable assigned in the for loop
      vals.push(col.innerHTML);
    }

    rows.push({
      values: vals,
      markup: row.outerHTML,
      active: true
    });
  }
}

// get row data
log('start: ' + performance.now())
getRowData(table);
getRowData(tableHidden);
initClusterize();
log('end: ' + performance.now())

/*
* Multi-column search
*/
const onSearch = function() {
  log('onSearch Started...')
  for(let i = 0, ii = rows.length; i < ii; i++) {
    let suitable = false;
    for(let j = 0, jj = rows[i].values.length; j < jj; j++) {
      if(rows[i].values[j].toString().indexOf(searchBar.value) + 1)
        suitable = true;
    }
    rows[i].active = suitable;
  }
  clusterize.update(filterRows(rows));
};
// TODO create a global search
//search.oninput = onSearch;

/*
* Sorting: sw: need to switched a
*/
const onSort = function(col_sort) {
  log(col_sort);

  if(sortIsAsc) {
    //asc
    rows = rows.sort((a, b) => (a.values[col_sort] >= b.values[col_sort]) ? 1 : (a.values[col_sort] === b.values[col_sort]) ? ((a.size > b.size) ? 1 : -1) : -1 );
  } else {
    //desc
    rows = rows.sort((a, b) => (a.values[col_sort] <= b.values[col_sort]) ? 1 : (a.values[col_sort] === b.values[col_sort]) ? ((a.size < b.size) ? 1 : -1) : -1 );
  }
  sortIsAsc = !sortIsAsc;
  clusterize.update(filterRows(rows)); //sw: filterRows prob not necessary in some cases
};

/*
* short hand logging function
*/
function log(val) {
  console.log(val);
}
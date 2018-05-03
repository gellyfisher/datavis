
var coincolors = { "ETH": "#3ca900", "BTC": "#ffb10a", "LTC": "#1852af" }

var coincolorsarr = ["#3ca900", "#ffb10a", "#1852af"]

var donut_chart;
var arc;
var pie;

function setUpDonutChart() {
  console.log("SETTING UP DONUT CHART")


  margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };
  donut_width = 400 - margin.left - margin.right;
  donut_height = donut_width - margin.top - margin.bottom;
  outerRadius = Math.min(donut_width, donut_height) / 3;
  innerRadius = Math.min(donut_width, donut_height) / 4;
  extend_pixels = 8;

  arc = d3.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);

  pie = d3.pie()
    .padAngle(0.02)
    .value(function(d) {
      var val;
      coin = d[0]
      val = d[1]
      for (var key in val) {
        return val[key]
      }
      return 0;
    });

  donut_chart = d3.select("#graph").append('svg')
    .attr("width", donut_width + margin.left + margin.right)
    .attr("height", donut_height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "donutChart")
    .attr("transform", "translate(" + ((donut_width / 2) + margin.left) + "," +
      ((donut_height / 2) + margin.top) + ")");


  currencies = ["ETH", "BTC", "LTC", "BCH", "DASH"]
  requestDataCurrentPrizes(currencies)
}

function drawDonutChart(data) {
  console.log("DRAWING DONUT CHART")

  var data_array = new Array();

  totalvalue = 0
  for (var entry in data) {
    totalvalue = totalvalue + data[entry]["EUR"];
  }
  console.log("totalvalue")
  console.log(totalvalue)

  for (var key in data) {
    data_array.push([key, data[key]])
  }

  donut_chart.selectAll("path")
  	.attr("d", arc)
    .data(pie(data_array))
    .enter().append("g");

  donut_chart.selectAll("g")
    .append("path")
    .style("fill", function(d) {
      return getColor(d.index)
      // return coincolorsarr[d.index]
    })
    .attr("d", arc);

  var g = donut_chart.selectAll("g");

  console.log(g)

  g.append("text")
    .attr("transform", function(d) {
      var _d = arc.centroid(d);
      _d[0] *= 1.5;	//multiply by a constant factor
      _d[1] *= 1.5;	//multiply by a constant factor
      return "translate(" + _d + ")";
    })
    .attr("dy", ".50em")
    .style("text-anchor", "middle")
    .text(function(d) {
      for (var key in d.data) {
        percentage = d.data[1]["EUR"] / totalvalue
        if (percentage > 0.05) {
          return d.data[0]
        }
      }
    });
}

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function getColor(index) {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(random(index) * 16)];
    index += 1
    index += random(index)
  }
  return color;
}

function random(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

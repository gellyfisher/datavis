let ybarScale, xbarScale, cbarScale;
let bar_graph;

let bar_yAxis, bar_xAxis;

let bar_graph_padding = {
  top: 30,
  right: padding.right,
  bottom: 50,
  left: padding.left
};

let bar_graph_height = 180 - bar_graph_padding.top - bar_graph_padding.bottom; // height of bars
let bar_graph_width = width - bar_graph_padding.left - bar_graph_padding.right;

let X_BAR_START_OFFSET = 2;

let bar_graphs_cointainer = []


function addBarChart(bound_coin, coin_color) {
	console.log("adding bar chart")
  let bar_graph = d3.select("div#volumes")
    .append("svg")
    .attr("width", width)
    .attr("height", 180)
    .attr("class", "barchart " + bound_coin)
    .append("g")
    .attr("transform", "translate(" + bar_graph_padding.left + "," + bar_graph_padding.top + ")");

  let xbarScale = d3.scaleBand()
    .range([X_BAR_START_OFFSET, bar_graph_width])
    .paddingInner(0.05);

  let ybarScale = d3.scaleLinear()
    .range([bar_graph_height, 0])
    .domain([0, 10]);

  let bar_yAxis = d3.axisLeft()
    .scale(ybarScale)
    .ticks(5);

  bar_yAxis.tickFormat(function(d) {
    return format_volume_text(d);
  });

  bar_graph.append("g")
    .attr("class", "y axis bar")
    .call(bar_yAxis);

  bar_graph.append("text")
    .attr("class", "bar_graph_title")
    .attr("y", -bar_graph_padding.top)
    .attr("x", -bar_graph_padding.left + 5)
    .attr("dy", "1em")
    .style("text-anchor", "left")
    .text(write_bar_title(bound_coin));

  let cbarScale = d3.scaleSequential()
    .interpolator(d3.interpolateRgb(shadeColor(coin_color, 40), shadeColor(coin_color, -40)));


  let currentBarGraphObject = {
    bound_coin: bound_coin,
    bar_graph: bar_graph,
    xbarScale: xbarScale,
    ybarScale: ybarScale,
    bar_yAxis: bar_yAxis,
    cbarScale: cbarScale
  };
  console.log(currentBarGraphObject)

  bar_graphs_cointainer.push(currentBarGraphObject)


}

function format_volume_text(d) {
  if (d < 1000) {
    return "€" + d;
  } else if (d < 1000000) {
    return "€" + Math.round(d / 1000) + " K";
  } else if (d < 1000000000) {
    return "€" + (Math.round(d / 10000) / 100) + " M";
  } else {
    return "€" + (Math.round(d / 1000000) / 1000) + " B";
  }
}

function write_bar_title(coin) {
  if (last_requested_time_between != 1) {
    return "Traded volume last " + last_requested_time_between + " hours of " + coin;
  } else {
    return "Traded volume last hour of " + coin;
  }
}

function drawBarChart(data) {
	console.log("drawing bar chart")
	console.log("data")

  for (var bar_chart_object in bar_graphs_cointainer) {
    let barObject = bar_graphs_cointainer[bar_chart_object]
    let ybarScale = barObject.ybarScale
    let bar_yAxis = barObject.bar_yAxis
    let xbarScale = barObject.xbarScale
    let bar_graph = barObject.bar_graph
    let cbarScale = barObject.cbarScale
    let coin = barObject.bound_coin
    let found = false;
    let bardata;

    for (key in data) {
      if (data[key].currency === coin) {
        bardata = data[key].data
        found = true;
      }
    }

    if (!found) {
      throw "specified coin not found";
      return;
    }

    xbarScale.domain(d3.range(bardata.length));
    ybarScale.domain([0, d3.max(bardata, d => d.volumeto) * 1.2]);
    cbarScale.domain([0, d3.max(bardata, d => d.volumeto)]);

    bar_graph.select(".y.axis.bar")
      .transition()
      .call(bar_yAxis)

    let bars = bar_graph.selectAll("rect")
      .data(bardata, d => d.time);

    bars.exit().remove();

    bars.enter()
      .append("rect")
      .attr("x", (d, i) => xbarScale(i))
      .attr("y", ybarScale(0))
      .attr("width", xbarScale.bandwidth())
      .attr("height", d => 0)
      .attr("fill", d => cbarScale(d.volumeto))
      .merge(bars)
      .attr("id", (d, i) => "bar" + i) //needs to be before transition (otherwise async execution and indicator won't find the id yet)
      .attr("class", "bar")
      .transition()
      .attr("width", xbarScale.bandwidth() - 0.05)
      .attr("x", (d, i) => xbarScale(i))
      .attr("y", d => ybarScale(d.volumeto))
      .attr("height", d => bar_graph_height - ybarScale(d.volumeto))
      .attr("fill", d => cbarScale(d.volumeto));

    d3.select(".bar_graph_title").text(write_bar_title(coin));
    drawBarGraphIndicator()
    drawBarChartGridLines()




  }

}


function drawBarGraphIndicator() {
  for (var bar_chart_object in bar_graphs_cointainer) {
    let barObject = bar_graphs_cointainer[bar_chart_object]
    let ybarScale = barObject.ybarScale
    let bar_yAxis = barObject.bar_yAxis
    let xbarScale = barObject.xbarScale
    let bar_graph = barObject.bar_graph
    let coin = barObject.bound_coin
    if (coin !== null) {
      if (mouseCoordX >= padding.left && mouseCoordX <= width - padding.right) {
        let eachBand = xbarScale.step(); //distance between 2 bands
        let index = Math.floor((mouseCoordX - X_BAR_START_OFFSET - bar_graph_padding.left) / eachBand + 0.05);
        bar_graph.select("#bar" + index).attr("stroke", "black");
        bar_graph.selectAll("rect:not(#bar" + index + ")").attr("stroke", null);
        let bar = bar_graph.select("#bar" + index);
        let bar_data = bar.datum();
        let bar_x = parseFloat(bar.attr("x"));
        let bar_width = parseFloat(bar.attr("width"));

        if (bar_data) {
          bar_graph.selectAll(".bar_graph_value_text").remove()

          let bar_x_offset = bar_x + (bar_width / 2)
          bar_graph.append("text")
            .attr("class", "bar_graph_value_text")
            .style("text-anchor", "center")
            .style("font-size", "small")
            .attr("x", Math.max(bar_x_offset - 15, 3))
            .attr("y", Math.max(bar.attr("y") - 30, 5))
            .text(format_volume_text(bar_data.volumeto));

          bar_graph.append("text")
            .attr("class", "bar_graph_value_text")
            .style("text-anchor", "center")
            .style("font-size", "small")
            .attr("x", bar_x_offset - 35)
            .attr("y", 120)
            .text(format_bar_date(bar_data.time));
        }
      }
    }
  }
}


function format_bar_date(date) {
  if (last_requested_time_between > 24) {
    return time_format_day(date);
  }
  return time_format_hour(date);
}

function drawBarChartGridLines() {
  for (var bar_chart_object in bar_graphs_cointainer) {
    let barObject = bar_graphs_cointainer[bar_chart_object]
    let bar_graph = barObject.bar_graph
    let coin = barObject.bound_coin
    bar_graph.selectAll(".gridline").remove()
    let ticks = bar_graph.selectAll("g.y>g.tick") //nth-child(n+3) to avoid selecting the tick on the x-axis
      .append("line")
      .attr("class", "gridline")
      .attr("stroke", grid_stroke_color)
      .attr("zIndex", "-1")
      .attr("x2", width - padding.right - padding.left)
  }
}

function removeBarChart(coin) {
  let foundindex = null;
  for (var bar_chart_object in bar_graphs_cointainer) {
    let barObject = bar_graphs_cointainer[bar_chart_object]
    let foundcoin = barObject.bound_coin
    if (foundcoin == coin) {
      foundindex = bar_chart_object;
    }
    if (foundindex != null) {
      bar_graphs_cointainer.splice(foundindex, 1);
      let bar_graph = d3.select("svg.barchart." + coin).remove();
    }
  }
}

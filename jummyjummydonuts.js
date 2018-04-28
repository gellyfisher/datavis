var data1 = [
    {indx: 0, name: "one", value: 130},
    {indx: 1, name: "two", value:  80},
    {indx: 2, name: "three", value:  35},
    {indx: 3, name: "four", value:  175},
    {indx: 4, name: "five", value:  50}
];

var data2 = [
    {indx: 0, name: "one", value: 20},
    {indx: 1, name: "two", value:  46},
    {indx: 2, name: "three", value:  15},
    {indx: 3, name: "four", value:  80},
    {indx: 4, name: "five", value:  43}
];

var currentdata = data1

function setUpDonutChart() {

    margin = {top: 20, right: 20, bottom: 20, left: 20};
    donut_width = 400 - margin.left - margin.right;
    donut_height = donut_width - margin.top - margin.bottom;
    outerRadius = Math.min(donut_width, donut_height) / 3;
    innerRadius = Math.min(donut_width, donut_height) / 4;
    extend_pixels = 8;


   

    arc = d3.arc()
    .padRadius(outerRadius)
    .innerRadius(innerRadius);


    pie = d3.pie()
    .padAngle(0.02)
    .startAngle(1.1*Math.PI)
    .endAngle(3.1*Math.PI)
    .value(function(d) { return d.value; });
    

    donut_chart = d3.select("#graph2").append('svg')
        .attr("width", donut_width + margin.left + margin.right)
        .attr("height", donut_height + margin.top + margin.bottom)
        .append("g")
        .attr("id", "donutChart")
        .attr("transform", "translate(" + ((donut_width/2)+margin.left) + "," +
                                      ((donut_height/2)+margin.top) + ")");
        

	donut_chart.append("text")
    .attr("x", - donut_width / 2)
    .attr("y", - height / 2)
    .text("change_testing_dataset")
    .style("cursor", "hand")
    .on("click", swap_dataset);

    colors = ["#8b0000", "#f091e7", "#f8ab52", "#ADD6FB", "#28e57a"];
    
    donut_chart.selectAll("path")
    .data(pie(currentdata))
    .enter().append("path")
    .style("fill", function(d) { return colors[d.data.indx]; })
    .each(function(d) { console.log(d); d.outerRadius = outerRadius - extend_pixels; })
    .attr("d", arc)
    .on("mouseover", arcTween_extend(outerRadius, 0))
    .on("mouseout", arcTween_extend(outerRadius - extend_pixels, 150))
    
    updateDonutChart(currentdata)


}

function updateDonutChart(passed_data) {


    var path = donut_chart.selectAll("path")
        .data(pie(data1))
        .enter()
        .append("path");

    path.transition()
        .duration(500)
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles

    
    console.log("updating donut")
    path.data(pie(passed_data));
    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    
}

function swap_dataset() {
    console.log("swapping")
    if (currentdata == data1) {
        currentdata = data2;
    } else {
        currentdata = data1;
    }

    console.log(currentdata)
    updateDonutChart(currentdata)
}

function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }


function arcTween_extend(outerRadius, delay) {
    return function() {
        d3.select(this).transition().delay(delay).attrTween("d", function(d) {
        var i = d3.interpolate(d.outerRadius, outerRadius);
        return function(t) { d.outerRadius = i(t); return arc(d); };
        });
    };
}
setUpDonutChart()

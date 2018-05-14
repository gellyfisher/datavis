let ybarScale,xbarScale,cbarScale;
let bargraph;

let barheight=100; // height of bar chart

let coin; // currently selected currency

function setUpBarChart() {
	bargraph=d3.select("div#volumes")
		.append("svg")
		.attr("width", width)
		.attr("height", barheight);

	xbarScale = d3.scaleBand()
			.rangeRound([padding.left, width - padding.right])
			.paddingInner(0.05);

	ybarScale = d3.scaleLinear()
				.range([0, barheight])
				.domain([0,10]);
				
	//assignBarChart(currentCurrencies[0],cScale(0));
}

function assignBarChart(newcoin, barcolor) {
	coin = newcoin;

	cbarScale = d3.scaleSequential()
				.interpolator(d3.interpolateRgb(shadeColor(barcolor, 40), shadeColor(barcolor, -40)));

	drawBarChart(saveData)
}

function drawBarChart(data) {
	saveData=data;

	if (coin === undefined) {
		return;
	}

	let found = false;
	for (key in data) {
		if (data[key].currency === coin) {
			bardata = data[key].data
			found=true;
		}
	}
	
	if (!found) {
		throw "specified coin not found";
		return;
	}

	xbarScale.domain(d3.range(bardata.length));
	ybarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);
	cbarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);

	let bars = bargraph.selectAll("rect")
    	.data(bardata, d => d.time);

	bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("x", (d, i) => xbarScale(i))
        .attr("y", barheight)
    	.attr("width", xbarScale.bandwidth())
        .attr("height", d => ybarScale(0))
    	.attr("fill", d => cbarScale(d.volumeto))
      .merge(bars)
    	.transition()
		.attr("width", xbarScale.bandwidth())
        .attr("x", (d, i) => xbarScale(i))
    	.attr("y", d => barheight - ybarScale(d.volumeto))
    	.attr("height", d => ybarScale(d.volumeto))
    	.attr("fill", d => cbarScale(d.volumeto));
}


function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

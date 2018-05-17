let mouseCoordX=0;
let mouseCoordY=0;

function getMouseCoordinates(container) {

	mouseCoordX=d3.mouse(container)[0];
	mouseCoordY=d3.mouse(container)[1];
}

function setupMouseEvents() {
	graph1 = d3.selectAll("div.graph_container")
		.on("mousemove", function() {
			dragGraph(this);
			getMouseCoordinates(this);
			drawLineIndicator();
			drawComparisonIndicator();
			drawBarGraphIndicator();
		})
	d3.selectAll("div#container").on("mouseover",disableScroll);
	d3.selectAll("div#container").on("mouseleave",enableScroll);
}

function startDragGraph(container) {
	dragging=true;
	let mouseX=d3.mouse(container)[0];

	prevMouseX=mouseX;
}

function endDragGraph(container) {
	dragging=false;
	let mouseX=d3.mouse(container)[0];

	let timeInBetween=(end-start)/(numPoints);
	let effectiveWidth=width-padding.left-padding.right

	let scale=Math.floor(numPoints*Math.abs(mouseX-prevMouseX)/effectiveWidth);

	if (mouseX>prevMouseX) {
		dragRightGraph(scale*timeInBetween);
	} else if (mouseX<prevMouseX) {
		dragLeftGraph(scale*timeInBetween);
	}
}

function dragGraph(container) {
	//We will only allow the dragging at most once in 150 ms. Otherwise this function is executed too often.

    if (dragging && (prevTime + 150 - Date.now()) < 0) {
		let mouseX=d3.mouse(container)[0];

		let timeInBetween=(end-start)/(numPoints);
		let effectiveWidth=width-padding.left-padding.right;

		let scale=Math.floor(numPoints*Math.abs(mouseX-prevMouseX)/effectiveWidth);

		if (mouseX>prevMouseX) {
			dragRightGraph(scale*timeInBetween);
		} else if (mouseX<prevMouseX) {
			dragLeftGraph(scale*timeInBetween);
		}
		prevMouseX=mouseX;
		prevTime = Date.now();
    }
}

function dragRightGraph(dist) { //in dit geval gaan we terug in de tijd
	dist=Math.min(dist,start.getTime()-minimumDate);

	start=new Date(start.getTime()-dist);
	end=new Date(end.getTime()-dist);

	requestMultipleData();
}

function dragLeftGraph(dist) { // nu gaan we vooruit in de tijd
	dist=Math.min(dist,(new Date()).getTime()-end.getTime());

	start=new Date(start.getTime()+dist);
	end=new Date(end.getTime()+dist);

	requestMultipleData();
}

function preventDefault(e) { //prevents scrolling
	e = e || window.event;
	if (e.preventDefault)
	  e.preventDefault();
	e.returnValue = false;
}

function disableScroll() {
	if (window.addEventListener) // older firefox
	  window.addEventListener('DOMMouseScroll', preventDefault, false);
	window.onwheel = preventDefault; // modern standard
	window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
}

function enableScroll() {
	if (window.removeEventListener)
		window.removeEventListener('DOMMouseScroll', preventDefault, false);
	window.onmousewheel = document.onmousewheel = null;
	window.onwheel = null;
}

function scrollGraph(container) {
	let mouseX=d3.event.clientX-$(container).offset().left; //d3.mouse(container)[0] werkt hier precies niet
	let effectiveWidth=width-padding.left-padding.right
	let scale=(mouseX-padding.left)/effectiveWidth //how much to the left is the mouse
	scale=Math.max(0,scale);
	scale=Math.min(1,scale); // make sure scale is between 0 and 1

	let dist=(end-start)/2; //distance from center to start/end

	if (d3.event.deltaY< 0) { //scroll up
		start=new Date(start.getTime()+scale*dist);
		end=new Date(end.getTime()-(1-scale)*dist);

	} else { //scroll down
		start=new Date(Math.max(start.getTime()-scale*dist,minimumDate));
		end=new Date(Math.min(end.getTime()+(1-scale)*dist,(new Date()).getTime()));
	 }

	 requestMultipleData();
}


let coin; // currently selected currency

function assignCoin(newcoin) {
	coin = newcoin;
}

function handleLineClick(d, i) {
	if (coin == d.currency){
		assignCoin(null)
		updateGraphs(saveData)

	} else {

		assignCoin(d.currency)
		updateGraphs(saveData)
	}
}

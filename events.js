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

function scrollGraph(container) {
	let mouseX=d3.event.clientX-18; //d3.mouse(container)[0] werkt hier precies niet
									// 18 is de marge van de body en de div samen... ja lelijk.
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

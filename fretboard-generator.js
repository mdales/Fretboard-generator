// Fretboard generator
//
// Copyright 2017 Digital Flapjack Ltd
//
// Released under the GPLv3

function generateFretPositions(scaleLength, frets) {

	var positions = [];

	for (i = 0; i <= frets; i++) {
		positions[i] = scaleLength - (scaleLength / Math.pow(2, i / 12));
	}

	return positions;
}



function drawFretboard() {

	var scaleLength = $("input[name=\"scale\"]").val()
	var scaleUnits = $("select[name=\"scale_units\"]").val()
	var frets = $("input[name=\"frets\"]").val()
	var nutWidth = $("input[name=\"nut\"]").val()
	var nutUnits = $("select[name=\"nut_units\"]").val()
	var inlayWidth = $("input[name=\"inlay\"]").val()
	var inlayUnits = $("select[name=\"inlay_units\"]").val()
	
	var displayScale = 2.0;
	var strokeWidth = 1.0;
	var height = 150.0;
	var x_offset = 100.0;
	var y_offset = 50.5;
	
	// internally do everything in mm
	if (scaleUnits == "inches") {
		scaleLength *= 25.4;
	}
	if (nutUnits == "inches") {
		nutWidth *= 25.4;
	}
	if (inlayUnits == "inches") {
		inlayWidth *= 25.4;
	}
	
	var positions = generateFretPositions(scaleLength, frets);

	$("#fretboardcanvas").clearCanvas()

	// draw the nut far side
	$("#fretboardcanvas").drawLine({
  		strokeStyle: '#000',
  		strokeWidth: strokeWidth,
  		x1: Math.floor(x_offset - (nutWidth * displayScale)) + 0.5, y1: y_offset,
  		x2: Math.floor(x_offset - (nutWidth * displayScale)) + 0.5, y2: y_offset + height
	});
	
	// draw the frets
	for (i = 0; i < positions.length; i++) {
		var pos = x_offset + (positions[i] * displayScale);
	
		$("#fretboardcanvas").drawLine({
  			strokeStyle: '#000',
			strokeWidth: strokeWidth,
			x1: Math.floor(pos) + 0.5, y1: y_offset,
			x2: Math.floor(pos) + 0.5, y2: y_offset + height
		});
		
		var fretNumber = (i % 12);
		switch (fretNumber) {
			case 3: case 5: case 7: case 9:
				$("#fretboardcanvas").drawArc({					
					strokeStyle: '#000',
				  	strokeWidth: strokeWidth,
				  	x: pos - (((positions[i] - positions[i - 1]) / 2.0) * displayScale), y: y_offset + (height / 2.0),
				  	radius: (inlayWidth / 2.0) * displayScale
				});
				break;
			case 0:
				$("#fretboardcanvas").drawArc({					
					strokeStyle: '#000',
				  	strokeWidth: strokeWidth,
				  	x: pos - (((positions[i] - positions[i - 1]) / 2.0) * displayScale), y: y_offset + (height / 4.0),
				  	radius: (inlayWidth / 2.0) * displayScale
				});
				$("#fretboardcanvas").drawArc({					
					strokeStyle: '#000',
				  	strokeWidth: strokeWidth,
				  	x: pos - (((positions[i] - positions[i - 1]) / 2.0) * displayScale), y: y_offset + (height * 3.0 / 4.0),
				  	radius: (inlayWidth / 2.0) * displayScale
				});
				break;
		}
	}
}

$(document).ready(function() {
	$("input").change(drawFretboard);
	$("select").change(drawFretboard);
	drawFretboard();
});


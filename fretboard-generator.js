// Fretboard generator
//
// Copyright 2017 Michael Dales
//
// Released under the GPLv3

var makerjs = require('makerjs');

/**
 * Calculates the fret positions given a scale length and the number of frets. Includes the zero fret.
 * @param {number} scaleLength - The scale length in whatever units.
 * @param {number} frets - How many frets to calculate for.
 * @return {[number]} A list of positions in the same units as the scale length was provided.
 */
function generateFretPositions(scaleLength, frets) {
    var positions = [];
    for (i = 0; i <= frets; i++) {
        positions[i] = scaleLength - (scaleLength / Math.pow(2, i / 12));
    }
    return positions;
}

/**
 * Returns the model for a fretboard in mm
 * @return {Model} A Model object.
 */
function generateFretboard() {

    var scaleLength = $("input[name=\"scale\"]").val();
    var scaleUnits = $("select[name=\"scale_units\"]").val();
    var frets = $("input[name=\"frets\"]").val();
    var nutWidth = $("input[name=\"nut\"]").val();
    var nutUnits = $("select[name=\"nut_units\"]").val();
    var inlayWidth = $("input[name=\"inlay\"]").val();
    var inlayUnits = $("select[name=\"inlay_units\"]").val();
    var slotStyle = $("select[name=\"slot_style\"]").val();
    var alignmentMarkers = $("input[name=\"alignment_markers\"]").is(":checked");
    
    const height = 75.0;
    const x_offset = 0.0;
    const y_offset = 0.0;
    const slotWidth = 0.5;
    
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

	var paths = [];
	var models = []

    // draw the nut far side
	if (slotStyle == "line") {
		var l = new makerjs.paths.Line([x_offset - nutWidth, y_offset], [x_offset - nutWidth, y_offset + height]);
		paths.push(l);
	} else {
		var r = new makerjs.models.Rectangle(slotWidth, height);
		r.origin = [(x_offset - nutWidth) - (slotWidth / 2.0), y_offset];
		models.push(r);
	}
	
    // draw the frets
    for (i = 0; i < positions.length; i++) {
        var pos = x_offset + positions[i];
    
    	// The fret itself
    	if (slotStyle == "line") {
			var l = new makerjs.paths.Line([pos, y_offset], [pos, y_offset + height]);
			paths.push(l);
		} else {
			var r = new makerjs.models.Rectangle(slotWidth, height);
 			r.origin = [pos - (slotWidth / 2.0), y_offset];
			models.push(r);
		}
		
		// alignment markers
		if (alignmentMarkers && (i % 12 == 0)) {
			var t = new makerjs.paths.Line([pos, y_offset - 12.0], [pos, y_offset - 2.0])
			paths.push(t);
			var b = new makerjs.paths.Line([pos, y_offset + height + 2.0], [pos, y_offset + height + 12.0])
			paths.push(b);
		}
         
        // Do the inlay markers next in a traditional style   
		if (i == 0) {
			continue;
		}
        var fretNumber = (i % 12);
        switch (fretNumber) {
		case 3: case 5: case 7: case 9:
			var c = new makerjs.paths.Circle([pos - ((positions[i] - positions[i - 1]) / 2.0), y_offset + (height / 2.0)], 
				inlayWidth / 2.0);
			paths.push(c);
			break;
			
		case 0:
			var c1 = new makerjs.paths.Circle([pos - ((positions[i] - positions[i - 1]) / 2.0), y_offset + (height / 4.0)],
				inlayWidth / 2.0);
			paths.push(c1);
			var c2 = new makerjs.paths.Circle([pos - ((positions[i] - positions[i - 1]) / 2.0), y_offset + (height * 3.0 / 4.0)],
				inlayWidth / 2.0);
			paths.push(c2);
			break;
        }
    }
    
    return {
    	paths: paths,
    	models: models,
    	units: makerjs.unitType.Millimeter
    };
}

/**
 * Call this each time the inputs update to refresh the preview.
 */
function drawFretboard() {

	var model = generateFretboard();    
	var renderOptions = {
		svgAttrs: {
			"id": 'drawing',
		},
		strokeWidth: 1 + 'px',
		scale: 0.75,
		units: model.units,
		useSvgPathOnly: false
	};

	makerjs.model.findChains(model, function(chains, loose, layer) {
		console.log('found ' + chains.length + ' chain(s) and ' + loose.length + ' loose path(s) on layer ' + layer);
	});

	var svg = makerjs.exporter.toSVG(model, renderOptions);
	$("div#fretboard").html(svg);
}

/**
 * Call this to cause a download of an SVG version.
 */
function saveSVGFretboard() {
	var model = generateFretboard();    
	var renderOptions = {
		svgAttrs: {
			"xmlns": "http://www.w3.org/2000/svg",
			"xmlns:xlink": "http://www.w3.org/1999/xlink"
		},
		units: model.units,
	};
	var svg = makerjs.exporter.toSVG(model, renderOptions);
	download(svg, "fretboard.svg", "image/svg+xml")
}

/**
 * Call this to cause a download of the DXF version.
 */
function saveDXFFretboard() {
	var model = generateFretboard();    
	var dxf = makerjs.exporter.toDXF(model);
	download(dxf, "fretboard.dxf", "application/dxf")
}

$(document).ready(function() {
    $("input").change(drawFretboard);
    $("select").change(drawFretboard);
    
    $("button#svg").click(saveSVGFretboard);
    $("button#dxf").click(saveDXFFretboard);
    
    drawFretboard();
});


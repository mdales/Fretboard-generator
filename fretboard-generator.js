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
 * @param {bool} bridgeLocation - Whether to add the bridge location to the last position or not.
 * @return {[number]} A list of positions in the same units as the scale length was provided.
 */
function generateFretPositions(scaleLength, frets, bridgeLocation) {
    var positions = [];
    for (i = 0; i <= frets; i++) {
        positions[i] = scaleLength - (scaleLength / Math.pow(2, i / 12));
    }
    if (bridgeLocation) {
        frets = parseInt(frets) + 1;
        positions[frets] = scaleLength;
    }
    return positions;
}

/**
 * Fills the table on the page with the actual fret positions.
 * @param {Object} params - All the page inputs.
 */
function fillPositionTable(params) {

    var positions = generateFretPositions(params.scaleLength, params.frets, params.bridgeLocation);
    if (params.positionUnits == "inches") {
    	for (i = 0; i < positions.length; i++) {
    		positions[i] = positions[i] / 25.4;
    	}
    }

    const tableWidth = 4;
    var tablehtml = "";

    // we don't care about fret 0 being at 0, so kill it and adjust when displaying
    positions = positions.slice(1);

    for (j = 0; j < positions.length / tableWidth; j++) {
    	var rowhtml = "<tr>";
		for (i = 0; i < tableWidth; i++) {
			fret = (j * tableWidth) + i;
			if (fret < params.frets) {
				rowhtml += "<td>" + (fret + 1) + "</td><td>" + positions[fret].toFixed(3) + "</td>";
			} else {
				rowhtml += "<td></td><td></td>";
			}
		}
		rowhtml += "</tr>\n";
		tablehtml += rowhtml;
	}

	$("table#positions tbody").html(tablehtml);
}

/**
 * Gets the user input from the input elements in the HTML
 * @return {Object} An object with all the parameters
 */
function getParameters() {
	var params = {
    	scaleLength: $("input[name=\"scale\"]").val(),
     	scaleUnits: $("select[name=\"scale_units\"]").val(),
    	frets: $("input[name=\"frets\"]").val(),
    	nutWidth: $("input[name=\"nut\"]").val(),
    	nutUnits: $("select[name=\"nut_units\"]").val(),
    	inlayWidth: $("input[name=\"inlay\"]").val(),
    	inlayUnits: $("select[name=\"inlay_units\"]").val(),
    	inlayStyle: $("select[name=\"inlay_style\"]").val(),
    	slotStyle: $("select[name=\"slot_style\"]").val(),
    	alignmentMarkers: $("input[name=\"alignment_markers\"]").is(":checked"),
    	bridgeLocation: $("input[name=\"bridge_location\"]").is(":checked"),
    	orientation: $("select[name=\"orientation\"]").val(),
    	positionUnits: $("select[name=\"position_units\"]").val()
	};

    // internally do everything in mm
    if (params.scaleUnits == "inches") {
        params.scaleLength *= 25.4;
    }
    if (params.nutUnits == "inches") {
        params.nutWidth *= 25.4;
    }
    if (params.inlayUnits == "inches") {
        params.inlayWidth *= 25.4;
    }
    return params;
}

/**
 * Draws a single inlay marker of the style provided
 * @param {Object} paths - The set of paths being built for the neck.
 * @param {String} style - Either "dots" or "crosshairs".
 * @param {Number} x_pos - The center x position on the inlay.
 * @param {Number} y_pos - The center u position on the inlay.
 * @param {Number} radius - The radius on the inlay.
 */
 function drawInlay(paths, style, x_pos, y_pos, radius) {

    if (style == "dots") {
        var c = new makerjs.paths.Circle([x_pos, y_pos], radius);
        paths.push(c);
    }
    if (style == "crosshairs") {
        var t = new makerjs.paths.Line([x_pos, y_pos - radius], [x_pos, y_pos + radius])
        paths.push(t);
        var b = new makerjs.paths.Line([x_pos - radius, y_pos], [x_pos + radius, y_pos])
        paths.push(b);
    }
}

/**
 * Returns the model for a fretboard in mm
 * @param {Object} params - An object with all the form params.
 * @return {Model} A Model object.
 */
function generateFretboard(params) {

    const height = 75.0;
    const x_offset = 0.0;
    const y_offset = 0.0;
    const slotWidth = 0.5;

    var positions = generateFretPositions(params.scaleLength, params.frets, params.bridgeLocation);

	var paths = [];
	var models = []

    // draw the nut far side
	if (params.slotStyle == "line") {
		var l = new makerjs.paths.Line([x_offset - params.nutWidth, y_offset], [x_offset - params.nutWidth, y_offset + height]);
		paths.push(l);
	} else {
		var r = new makerjs.models.Rectangle(slotWidth, height);
		r.origin = [(x_offset - params.nutWidth) - (slotWidth / 2.0), y_offset];
		models.push(r);
	}

    // draw the frets
    for (i = 0; i < positions.length; i++) {
        var pos = x_offset + positions[i];

    	// The fret itself
    	if (params.slotStyle == "line") {
			var l = new makerjs.paths.Line([pos, y_offset], [pos, y_offset + height]);
			paths.push(l);
		} else {
			var r = new makerjs.models.Rectangle(slotWidth, height);
 			r.origin = [pos - (slotWidth / 2.0), y_offset];
			models.push(r);
		}


		// alignment markers
		if (params.alignmentMarkers && (i % 12 == 0)) {
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
			var x_pos = pos - ((positions[i] - positions[i - 1]) / 2.0);
			var y_pos = y_offset + (height / 2.0);
			var radius = params.inlayWidth / 2.0;

			drawInlay(paths, params.inlayStyle, x_pos, y_pos, radius);

			break;

		case 0:
			var x_pos = pos - ((positions[i] - positions[i - 1]) / 2.0);
			var upper_y = y_offset + (height * 3.0 / 4.0);
			var lower_y = y_offset + (height / 4.0);
			var radius = params.inlayWidth / 2.0;

			drawInlay(paths, params.inlayStyle, x_pos, upper_y, radius);
			drawInlay(paths, params.inlayStyle, x_pos, lower_y, radius);

			break;
        }
    }

    model = {
    	paths: paths,
    	models: models,
    	units: makerjs.unitType.Millimeter
    };

    if (params.orientation == "portrait") {
    	makerjs.model.rotate(model, -90, [0, 0]);
    }

    return model;
}

/**
 * Call this each time the inputs update to refresh the preview.
 */
function drawFretboard() {

	var params = getParameters();
	var model = generateFretboard(params);
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

	fillPositionTable(params);
}

/**
 * Call this to cause a download of an SVG version.
 */
function saveSVGFretboard() {
	var params = getParameters();
	var model = generateFretboard(params);
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
	var params = getParameters();
	var model = generateFretboard(params);
	var dxf = makerjs.exporter.toDXF(model, {usePOLYLINE: true});
	download(dxf, "fretboard.dxf", "application/dxf")
}

$(document).ready(function() {
    $("input").change(drawFretboard);
    $("select").change(drawFretboard);

    $("button#svg").click(saveSVGFretboard);
    $("button#dxf").click(saveDXFFretboard);

    drawFretboard();
});


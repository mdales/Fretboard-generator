What is this?
=============

This is a simple javascript tool for generating fretboard layouts for luthiers. You can specify various parameters, such as fret count, scale length, and whether you're targeting a CNC router or laser cutter, and then it'll generate a SVG or DXF file for you, that looks a little like this:

![Freboard](fretboard.svg)

It is provided free to use under the GNU Public License v3 license, copyright Michael Dales 2017.

For more details, visit http://electricflapjack.com/ or contact me at michael@electricflapjack.com.

How to use this?
================

I use this with a laser cutter to etch a guide for the slots before using a narrow bladed saw, such as a Japanese Dozuki back saw with a 0.3mm blade, to cut the actual slots. If you use this route, the design file will generate 0.5mm wide rectangles for each slot. Most fret wire have a tang width of 0.5mm, so using a 0.3mm fret saw means that you can hammer the frets into the slots without using any glue to hold them in.

The rough workflow I've used successfully is:

1. Take the fretboard wood, and laser on the fret groves - the bounding box and dot inlays are in the DXF file for reference, but I do not cut or etch them.
1. There is a marker for the 0th and 12th Fret, etch those also, and use it to line up with your neck piece.
1. Glue the etched fretboard to your neck.
1. Before radiusing, use your dozuki saw to cut the fret slots, remembering that as you radius the board you will lose wood at the edge.
1. Hammer in the frets without using glue.


Alternatively you can select the CNN option which will generate a line rather than a slot, and use a very small router bit to make the slots.

Third party libraries
=====================

This project utilises three open source projects:

* jQuery - https://jquery.com/ (MIT license)
* MakerJS - https://maker.js.org/ (Apache License 2.0)
* Download - https://github.com/rndme/download (MIT license)

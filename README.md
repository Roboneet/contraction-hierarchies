# Contraction Hierarchies for Fast Network Routing

A client-server system to demonstrate contraction hierarchies algorithm on road networks

[Original Paper](http://algo2.iti.kit.edu/documents/routeplanning/geisberger_dipl.pdf)

### Usage

To find the contracted graph, use
` cd resources/contraction-hierarchies/`
`node main.js`


To start the server, use
`npm start`
open https://127.0.0.1:8080/testCH/

### Data
To find graph of road maps, use [OSM XML file to road graph converter](https://github.com/AndGem/OsmToRoadGraph) on osm data. File paths need to be set in resources/contraction-hierarchies/constants.js

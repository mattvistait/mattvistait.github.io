require([
  'Canvas-Flowmap-Layer/CanvasFlowmapLayer',
  'esri/graphic',
  'esri/map',
  'local-resources/config',
  'dojo/domReady!'
], function(
  CanvasFlowmapLayer,
  Graphic,
  Map,
  config
) {
  var map = new Map('map', {
    basemap: 'dark-gray-vector',
    center: [0, 0],
    zoom: 1
  });

  map.on('load', function() {
    var cityToCityLayer = new CanvasFlowmapLayer({
      // JSAPI GraphicsLayer constructor properties
      id: 'cityToCityLayer',
      visible: true,
      // CanvasFlowmapLayer custom constructor properties
      //  - required
      originAndDestinationFieldIds: config.originAndDestinationFieldIds,
      //  - optional
      pathDisplayMode: 'selection', // 'selection' or 'all'
      wrapAroundCanvas: true,
      animationStarted: true
    });

    map.addLayer(cityToCityLayer);

    // here we use Papa Parse to load and read the CSV data
    // we could have also used another library like D3js to do the same
    Papa.parse('../csv-data/Flowmap_Cities_one_to_many.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        var csvGraphics = results.data.map(function(datum) {
          return new Graphic({
            geometry: {
              x: datum.s_lon,
              y: datum.s_lat,
              spatialReference: {
                wkid: 4326
              }
            },
            attributes: datum
          });
        });

        // add all graphics to the canvas flowmap layer
        cityToCityLayer.addGraphics(csvGraphics);
      }
    });

    cityToCityLayer.on('click', function(evt) {
      // evt.sharedOriginGraphics: array of all ORIGIN graphics with the same ORIGIN ID field
      // evt.sharedDestinationGraphics: array of all ORIGIN graphics with the same DESTINATION ID field
      //  - you can mark shared origin or destination graphics as selected for path display using these modes:
      //    - 'SELECTION_NEW', 'SELECTION_ADD', or 'SELECTION_SUBTRACT'
      //  - these selected graphics inform the canvas flowmap layer which paths to display

      // NOTE: if the layer's pathDisplayMode was originally set to "all",
      // this manual selection will override the displayed paths
      if (evt.sharedOriginGraphics.length) {
        cityToCityLayer.selectGraphicsForPathDisplay(evt.sharedOriginGraphics, 'SELECTION_NEW');
      }
      if (evt.sharedDestinationGraphics.length) {
        cityToCityLayer.selectGraphicsForPathDisplay(evt.sharedDestinationGraphics, 'SELECTION_NEW');
      }
    });
  });
});

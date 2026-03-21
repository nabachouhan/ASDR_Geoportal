import "./public/css/style.css";
import "ol-layerswitcher/dist/ol-layerswitcher.css";

import DragBox from "ol/interaction/DragBox.js";
import Draw from "ol/interaction/Draw.js";
import Overlay from "ol/Overlay.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { LineString, Polygon, MultiPolygon } from "ol/geom.js";
import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";

import { getArea, getLength } from "ol/sphere.js";
import { unByKey } from "ol/Observable.js";
import GeoJSON from "ol/format/GeoJSON";



import {
  map,
  handleBaseToggle,
} from "./public/js/baseLayers.js";

import {
  pindrop
} from "./public/js/pindrop.js";

import {
  customHome,
  customFullscreen,
  fullscreen_click,
  customZoom,
} from "./public/js/interactions.js";

import {
  handleDrawUndo,
  handleDraw,
  handleMeasure,
  downloadDrawnFeatures,
  downloadMesuredFeatures
} from "./public/js/drawAndMeasure.js";

import {
  toggleSidebar,
  display_toggle,
  display_toggle_block,
  display_toggle_block_adminState,
} from "./public/js/sidebar.js";



import {
  querytooloptionload
} from './public/js/querytoolpopulate.js'

import {
  executeQuery,
} from './public/js/querytoolrender.js'

import {
  bufferoptionload, initBufferDrawing,bufferSource
} from './public/js/bufferlayerpopulate.js'

import{
  withinDistrictFilteronload,
  withinDistrictFilteronload2,
  performBoundaryLevelBufferAnalysis,
  displayBoundaryLevelResults
} from './public/js/sidebarDropdown.js'

import {
  renderAllLegends
} from './public/js/legend.js'


import {
  dragElement
} from './public/js/dragablecontainer.js'

import {
  renderCoordinate,
  renderScaleBar
} from './public/js/coordinateAndScale.js'

import { wmsLayerMap, initializeSidebar } from './public/js/categorywiselayers.js'

import { upload, uploadClear } from "./public/js/upload.js";
import { loc, clearLocation } from "./public/js/geocodelocator.js";

import { initUniversalConverter } from "./public/js/geojson2kml.js"

// const source = new VectorSource();



// geocode location
loc()

document.addEventListener("DOMContentLoaded", function () {
  
  renderCoordinate();
  renderScaleBar();
  querytooloptionload()
  bufferoptionload()
  initializeSidebar(map)
  initBufferDrawing(map);
  pindrop()
  renderAllLegends(map)
  handleBaseToggle()
  // Attach listener to map’s layer collection
  map.getLayers().on(['add', 'remove'], () => {
    renderAllLegends(map);
    
  });
  withinDistrictFilteronload();
  withinDistrictFilteronload2();


});
import {
  exportMapToPDF
} from './public/js/print.js'

import {
  scaleLine
} from './public/js/coordinateAndScale.js'
// bufferloadCategories()
// popup
document.getElementById("info-toggle").addEventListener("click", function () {
  document.getElementById("info").style.display = "none";
});

// upload file info popup
document
  .getElementById("upload-info-toggle")
  .addEventListener("click", function () {
    document.getElementById("popup-upload").style.display = "none";
  });
// pop up

// sidebar
document
  .querySelector(".menu_sidebar_container-toggle")
  .addEventListener("click", () => {
    console.log("clicked");

    toggleSidebar();
  });

document
  .getElementById("sidebar-datasets-toggle-btn")
  .addEventListener("click", () => {
    display_toggle_block("sidebar-datasets");
  });


document
  .getElementById("sidebar-datasets-administrative-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-administrative");
  });

document
  .getElementById("sidebar-datasets-Infrastructure-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-Infrastructure");
  });

document
  .getElementById("sidebar-datasets-land-resource-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-land-resource");
  });
document
  .getElementById("sidebar-datasets-water-resource-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-water-resource");
  });

document
  .getElementById("sidebar-datasets-disaster-management-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-disaster-management");
  });

document
  .getElementById("sidebar-datasets-weather-climate-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-weather-climate");
  });

document
  .getElementById("sidebar-datasets-utility-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-utility");
  });
document
  .getElementById("sidebar-datasets-terrain-btn")
  .addEventListener("click", () => {
    display_toggle_block_adminState("sidebar-datasets-terrain");
  });


document.getElementById("sidebar-buffer-btn").addEventListener("click", () => {
  display_toggle_block("buffer_search");
});

document.getElementById("sidebar-districtwise-btn").addEventListener("click", () => {
  display_toggle_block("districtwise_search");
});

// performBoundaryLevelBufferAnalysis buttom
document.getElementById("createBoundaryLevelBufferFilter").addEventListener("click", () => {
  performBoundaryLevelBufferAnalysis( map);
});

// clear performBoundaryLevelBufferAnalysis buttom
// document.getElementById("clearBoundaryLevelBufferFilter").addEventListener("click", () => {
//   display_toggle_block("districtwise_search");
// });

// document.getElementById("sidebar-blockwise-btn").addEventListener("click", () => {
//   display_toggle_block("blockwise_search");
// });

// document.getElementById("sidebar-villagewise-btn").addEventListener("click", () => {
//   display_toggle_block("villagewise_search");
// });

document.getElementById("sidebar-upload-btn").addEventListener("click", () => {
  display_toggle_block("upload");
});

document.getElementById("sidebar-universalconverter-btn").addEventListener("click", () => {
  display_toggle_block("universalconverter");
  initUniversalConverter();
});

document.getElementById("sidebar-geocode-btn").addEventListener("click", () => {
  display_toggle_block("geocode");
});

document.getElementById("clearButton").addEventListener("click", () => {
  clearLocation();
});

// Define base layers
document.getElementById("base_layer_list").addEventListener("click", () => {
  handleBaseToggle();
});

document.getElementById("sidebar-home-btn").addEventListener("click", () => {
  customHome();
});

document.getElementById("sidebar-zIn-btn").addEventListener("click", () => {
  customZoom("zIn");
});

document.getElementById("sidebar-zOut-btn").addEventListener("click", () => {
  customZoom("zOut");
});

document.getElementById("sidebar-print-btn").addEventListener("click", () => {
  display_toggle_block("Print_tool");
});

document.getElementById("export-pdf").addEventListener("click", () => {
  exportMapToPDF();
});

document.getElementById("sidebar-draw-btn").addEventListener("click", () => {
  display_toggle('sidebar-draw');
});



// // Attach print functionality to the export button
// const exportButton = document.getElementById('export-pdf');
// exportButton.addEventListener('click', exportMapToPDF);

document.getElementById("sidebar-pindrop-btn").addEventListener("click", () => {
  display_toggle_block('sidebar-pindrop');
});

document.getElementById("info-content-btn").addEventListener("click", () => {
  display_toggle_block('buffer-results');
});

document.getElementById("info-content2-btn").addEventListener("click", () => {
  display_toggle_block('query-results');
});

// Event listener for select button
document.getElementById("queryTool-select").addEventListener("click", () => {
  console.log("-------------------------------------------=====================");
  executeQuery("exe");
});

// Event listener for clear button

document.getElementById("queryTool-clear").addEventListener("click", () => {
  executeQuery("clear");
});


document.getElementById("legend-btn").addEventListener("click", () => {
  display_toggle_block("legend");
});


document.getElementById("sidebar-queryTool-btn").addEventListener("click", () => {
  display_toggle_block("querybuilder_tool");
  console.log("query-builder-in");

});

document.getElementById("query-collapse-icon").addEventListener("click", () => {
  display_toggle_block("queryTool-builder-container");
  console.log("query-builder-in");

});
// Make the DIV element draggable:
dragElement(document.getElementById("querybuilder_tool"));
dragElement(document.getElementById("buffer-results"));
dragElement(document.getElementById("query-results"));
dragElement(document.getElementById("legend"));


document.getElementById("sidebar-draw-download").addEventListener("click", () => {
  downloadDrawnFeatures();
});
document.getElementById("sidebar-measure-download").addEventListener("click", () => {
 downloadMesuredFeatures()
});

document.getElementById("sidebar-measure-btn").addEventListener("click", () => {
  display_toggle('sidebar-measure');

})

document
  .getElementById("sidebar-fullscrIn-btn")
  .addEventListener("click", () => {
    customFullscreen("easeIn");
  });

document
  .getElementById("sidebar-fullscrOut-btn")
  .addEventListener("click", () => {
    customFullscreen("easeOut");
  });

document.getElementById("sidebar-fullscr-btn").addEventListener("click", () => {
  fullscreen_click();
});
// Home Click  functionality Ends.....


document.getElementById("uploadButton").addEventListener("click", function () {
  upload();

})
document.getElementById("uploadClearButton").addEventListener("click", function () {
  uploadClear();

})

// document.getElementById('createBuffer').addEventListener('click', () => {
//   map.addInteraction(drawPointBuffer);
// });

document.getElementById('clearBuffer').addEventListener('click', () => {
  bufferSource.clear();
  document.getElementById('buffer-head').innerHTML = '';
  document.getElementById('buffer-chartdiv').style.display = 'none';
  document.getElementById('buffer-table').innerHTML = '';

});


// Store layers for management
// This forces the use of the native JavaScript Map instead of the OpenLayers Map

// const wmsLayerMap  = new window.Map();
console.log(wmsLayerMap);

// // Track populated themes






// Function to toggle the display of the ul

document.addEventListener("DOMContentLoaded", function () {
  const baseLayerContainer = document.getElementById("base_layer_container");
  const baseLayerList = document.getElementById("base_layer_menu");
  const baseLayerIcon = document.getElementById("base_layer_container_icon");

  // Toggle the display of the base layer list when the icon is clicked
  baseLayerIcon.addEventListener("click", function () {
    baseLayerList.classList.toggle("show");
  });

  // Hide the base layer list when clicking outside of it
  document.addEventListener("click", function (event) {
    if (!baseLayerContainer.contains(event.target)) {
      baseLayerList.classList.remove("show");
    }
  });
});



// Measure Tool starts here.................

//  Draw ends here............................

// -------------------------------------------------------------------------------------------------------------------------



//  Co-Ordinate Feature Ends .............





// Define the drag zoom interaction for selecting print area
const zoomininteraction = new DragBox();

zoomininteraction.on("boxend", function () {
  // Get the extent of the drawn box
  const zoominExtent = zoomininteraction.getGeometry().getExtent();
  map.getView().fit(zoominExtent);
});

const mapElement = document.getElementById("map");

function resetCursor() {
  mapElement.style.cursor = "auto"; // Reset cursor to normal
  map.removeInteraction(zoomininteraction);
}

// // Add event listener for "zoomend" event
map.on("moveend", resetCursor);

// // Append the button element to the document body
// document.body.appendChild(ziButton);
const ziButton = document.getElementById("dragSelect");
// Button click event listener for activating/deactivating drag zoom interaction
ziButton.addEventListener("click", () => {
  mapElement.style.cursor = "zoom-in";
  map.addInteraction(zoomininteraction);
});

//drag zoom interaction for selecting print area ends ............

// --- get current scale---
// Function to update the scale dropdown
function updateScaleOption() {
  console.log("moving");


  const scaleText = scaleLine.element.innerText || scaleLine.element.textContent;
  const match = scaleText.match(/1\s*:\s*([\d,]+)/);

  if (match) {
    const scaleValue = parseInt(match[1].replace(/,/g, ''), 10);

    const option = document.getElementById("current-scale-option");
    option.value = scaleValue / 1000;
    console.log(scaleValue);

    option.textContent = `1:${scaleValue.toLocaleString()} current`;
    console.log(`1:${scaleValue.toLocaleString()}`);

  }
}

// Update scale initially and on map move
map.on('moveend', updateScaleOption);
map.once('postrender', updateScaleOption);




// DRAW HANDLERS
document.querySelectorAll('[data-draw]').forEach(el => {
  el.addEventListener('click', () => {
    const type = el.getAttribute('data-draw');
    handleDraw(type);
  });
});

document.getElementById("draw_undo").addEventListener("click", () => {
  handleDrawUndo()
});

// MEASURE HANDLERS
document.querySelectorAll('[data-measure]').forEach(el => {
  el.addEventListener('click', () => {
    const type = el.getAttribute('data-measure');
    handleMeasure(type);
  });
});








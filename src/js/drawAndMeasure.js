

import Overlay from 'ol/Overlay';
import {Draw} from 'ol/interaction';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source';
import {Fill, Stroke, Style, Circle as CircleStyle} from 'ol/style';
import {LineString, Polygon} from 'ol/geom';
import {getLength, getArea} from 'ol/sphere';
import {unByKey} from 'ol/Observable';
import { map } from './baseLayers.js';
import GeoJSON from "ol/format/GeoJSON";

let sketch;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;

const continuePolygonMsg = "Click to continue drawing the polygon";
const continueLineMsg = "Click to continue drawing the line";

export const drsource = new VectorSource({ wrapX: false });
export const mrsource = new VectorSource({ wrapX: false });

const pointerMoveHandler = function (evt) {
  if (evt.dragging) return;

  let helpMsg = "Click to start drawing";

  if (sketch) {
    const geom = sketch.getGeometry();
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    }
  }

  if (helpTooltipElement && helpTooltip) {
    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove("hidden");
  }
};

map.on("pointermove", pointerMoveHandler);

map.getViewport().addEventListener("mouseout", function () {
  if (helpTooltipElement) {
    helpTooltipElement.classList.add("hidden");
  }
});

let Measureraw;

const formatLength = function (line) {
  const length = getLength(line);
  return length > 100
    ? Math.round((length / 1000) * 100) / 100 + " km"
    : Math.round(length * 100) / 100 + " m";
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  return area > 10000
    ? Math.round((area / 1000000) * 100) / 100 + " km<sup>2</sup>"
    : Math.round(area * 100) / 100 + " m<sup>2</sup>";
};

const style = new Style({
  fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
  stroke: new Stroke({
    color: "rgba(0, 0, 0, 0.5)",
    lineDash: [10, 10],
    width: 5,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({ color: "rgba(0, 0, 0, 0.7)" }),
    fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
  }),
});

export function customMeasure(event) {
  if (event === "clear") {
    if (measureTooltipElement) {
      var elem = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
      for (var i = elem.length - 1; i >= 0; i--) {
        elem[i].remove();
      }
    }
    mrsource.clear();
    return;
  }

  map.removeInteraction(shapeDraw);
  sketch = null;
  measureTooltipElement = null;
  createMeasureTooltip();

  const measureVector = new VectorLayer({
    source: mrsource,
    style: {
      "fill-color": "rgba(255, 255, 255, 0.2)",
      "stroke-color": "#075225",
      "stroke-width": 2,
      "circle-radius": 7,
      "circle-fill-color": "#075225",
    },
  });
  map.addLayer(measureVector);

  Measureraw = new Draw({
    source: mrsource,
    type: event,
    style: function (feature) {
      const geometryType = feature.getGeometry().getType();
      if (geometryType === event || geometryType === "Point") {
        return style;
      }
    },
  });

  map.addInteraction(Measureraw);
  createMeasureTooltip();
  createHelpTooltip();

  let output;
  let listener;

  Measureraw.on("drawstart", function (evt) {
    sketch = evt.feature;
    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on("change", function (evt) {
      const geom = evt.target;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      if (measureTooltipElement && measureTooltip) {
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      }
    });

    sketch.set("measure", output || "");
  });

  Measureraw.on("drawend", function (event) {
    const feature = event.feature;

    let finalmeasure = "";
    if (output.includes("km<sup>2</sup>")) {
      finalmeasure = output.replace("km<sup>2</sup>", "sq km");
    } else {
      finalmeasure = output.replace("m<sup>2</sup>", "sq m");
    }
    feature.set("measure", finalmeasure);

    const label = prompt("Enter a label for this shape:");
    feature.set("label", label || "");

    measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
    measureTooltip.setOffset([0, -7]);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    map.removeInteraction(Measureraw);
    map.removeOverlay(helpTooltip);
  });
}

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement("div");
  helpTooltipElement.className = "ol-tooltip hidden";
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: "center-left",
  });
  map.addOverlay(helpTooltip);
}

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement("div");
  measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: "bottom-center",
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}


export let shapeDraw;
export let drawVector;

function customDraw(event) {
  if (event === "clear") {
    drsource.clear();
    map.removeInteraction(Measureraw);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    return;
  }

  if (!drawVector) {
    drawVector = new VectorLayer({
      source: drsource,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#164ff7",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#164ff7",
      },
    });
    map.addLayer(drawVector);
  }

  shapeDraw = new Draw({
    source: drsource,
    type: event === "freehand" ? "LineString" : event,
    freehand: event === "freehand",
    style: new Style({
      fill: new Fill({ color: "rgba(255, 255, 255, 0.5)" }),
      stroke: new Stroke({
        color: "rgba(0, 0, 0, 0.8)",
        lineDash: [10, 10],
        width: event === "freehand" ? 2 : 5,
      }),
    }),
  });

  map.addInteraction(shapeDraw);
  createMeasureTooltip();
  createHelpTooltip();

  let listener;

  shapeDraw.on("drawend", function (event) {
    measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
    measureTooltip.setOffset([0, -7]);

    const feature = event.feature;
    const label = prompt("Enter a label for this shape:");
    feature.set("label", label || "");

    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    map.removeInteraction(shapeDraw);
    map.removeOverlay(helpTooltip);
  });
}

export function handleMeasure(event) {
  map.removeInteraction(Measureraw);
  customMeasure(event);
};

export function handleDraw(event) {
  map.removeInteraction(shapeDraw);
  customDraw(event);
};

export function handleDrawUndo(){
     if (shapeDraw && typeof shapeDraw.removeLastPoint === "function") {
    shapeDraw.removeLastPoint();
  }
}


export function downloadDrawnFeatures(){
    console.log("downloading");
      const download = document.getElementById("sidebar-draw-download");
      try {
        const geojsonFormat = new GeoJSON({ featureProjection: "EPSG:3857" }); // Assuming 'ol' is the OpenLayers namespace
        const features = drsource.getFeatures(); // Assuming 'drsource' is the vector source
        // Update feature properties to include label
        features.forEach((feature) => {
          if (!feature.get("label")) {
            feature.set("label", ""); // Default empty label if not set
          }
        });
        const json = geojsonFormat.writeFeatures(features);
        console.log(json);
        // Create data URI with correct MIME type and filename
        download.href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
        download.download = "data.geojson"; // Specify the filename with .geojson extension
        console.log(features);
      } catch (error) {
        console.error("Error during download:", error);
        // Handle the error appropriately, e.g., display a user-friendly message.
      }

}


export function downloadMesuredFeatures(){
     console.log("downloading");
      const download = document.getElementById("sidebar-measure-download");
      try {
        const geojsonFormat = new GeoJSON({ featureProjection: "EPSG:3857" }); // Assuming 'ol' is the OpenLayers namespace
        const features = mrsource.getFeatures(); // Assuming 'drsource' is the vector source
        // Update feature properties to include label
        features.forEach((feature) => {
          if (!feature.get("measure")) {
            feature.set("measure", ""); // Default empty label if not set
          }
        });
        const json = geojsonFormat.writeFeatures(features);
        console.log(json);
        // Create data URI with correct MIME type and filename
        download.href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
        download.download = "data.geojson"; // Specify the filename with .geojson extension
        console.log(features);
      } catch (error) {
        console.error("Error during download:", error);
        // Handle the error appropriately, e.g., display a user-friendly message.
      }

}
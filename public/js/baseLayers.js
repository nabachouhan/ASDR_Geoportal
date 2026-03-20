import "ol-layerswitcher/dist/ol-layerswitcher.css";

import { Map, View } from "ol";
import OSM from "ol/source/OSM";
// import {FullScreen, defaults as defaultControls} from 'ol/control.js';
import { Projection, fromLonLat } from "ol/proj";

import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer, VectorImage as VectorImageLayer } from "ol/layer.js";
import { get as getProjection, getPointResolution } from "ol/proj.js";

import XYZ from "ol/source/XYZ.js";
import Attribution from "ol/control/Attribution.js";

import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';

// Define base layers
export const osm = new TileLayer({
  source: new OSM({
    crossOrigin: "anonymous", // Set crossOrigin attribute
  }),
  title: "osm",
  name: "osm",
  isBase: true,
  preload: Infinity,
});

export const labelLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    crossOrigin: "anonymous", // Set crossOrigin attribute
  }),
  title: "labelLayer",
  visible: false,
  name: "labelLayer",
  isBase: true,
  preload: Infinity,
});

export const standardLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attributions: ["&copy; Esri</a>"],
    crossOrigin: "anonymous", // Set crossOrigin attribute
  }),
  title: "Standard",
  visible: false,
  name: "standardLayer",
  isBase: true,
  preload: Infinity,
});

export const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: ["&copy;Esri</a>"],
    crossOrigin: "anonymous", // Set crossOrigin attribute
  }),
  title: "satellite",
  visible: false,
  name: "satelliteLayer",
  maxZoom: 23, // Example maximum zoom level
  isBase: true,
  preload: Infinity,
});

export const hybridLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: ["&copy;Esri</a>"],
    crossOrigin: "anonymous", // Set crossOrigin attribute
  }),
  title: "hybrid",
  visible: false,
  name: "hybridLayer",
  maxZoom: 23, // Example maximum zoom level
  isBase: true,
  preload: Infinity,
});

export const transportLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    attributions: ["&copy;Esri</a>"],
    crossOrigin: "anonymous", // Set crossOrigin attribute
  }),
  title: "Transport",
  visible: false,
  name: "transportLayer",
  isBase: true,
  preload: Infinity,
});

export const osmHot = new TileLayer({
  source: new XYZ({
    url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    crossOrigin: "anonymous",
    maxZoom: 19,
    attributions: ["© OpenStreetMap, HOT"],
  }),
  title: "OSM Humanitarian",
  name: "osmHot",
  visible: false,
  isBase: true,
  preload: Infinity,
});

export const cartoLight = new TileLayer({
  source: new XYZ({
    url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    crossOrigin: "anonymous",
    maxZoom: 20,
    attributions: ["© CARTO © OpenStreetMap"],
  }),
  title: "Carto Light",
  name: "cartoLight",
  visible: false,
  isBase: true,
  preload: Infinity,
});

export const cartoDark = new TileLayer({
  source: new XYZ({
    url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    crossOrigin: "anonymous",
    maxZoom: 20,
    attributions: ["© CARTO © OpenStreetMap"],
  }),
  title: "Carto Dark",
  name: "cartoDark",
  visible: false,
  isBase: true,
  preload: Infinity,
});

export const cartoVoyager = new TileLayer({
  source: new XYZ({
    url: "https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    crossOrigin: "anonymous",
    maxZoom: 20,
    attributions: ["© CARTO © OpenStreetMap"],
  }),
  title: "Carto Voyager",
  name: "cartoVoyager",
  visible: false,
  isBase: true,
  preload: Infinity,
});

export const openTopo = new TileLayer({
  source: new XYZ({
    url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
    crossOrigin: "anonymous",
    maxZoom: 17,
    attributions: ["© OpenTopoMap © OpenStreetMap"],
  }),
  title: "OpenTopoMap",
  name: "openTopo",
  visible: false,
  isBase: true,
  preload: Infinity,
});


export const googleSatelliteLayer = new TileLayer({
  source: new XYZ({
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    crossOrigin: "anonymous",
    attributions: ["© Google"],
    maxZoom: 23,
  }),
  title: "Google Satellite",
  visible: false,
  name: "googleSatelliteLayer",
  isBase: true,
  preload: Infinity,
});

const assambound = new VectorImageLayer({
  source: new VectorSource({
    url: "../json/assam_state_bound.geojson",
    format: new GeoJSON(),
  }),
  style: {
    "stroke-color": 'rgb(255, 0, 0)',
    'stroke-width': 2,
  },
});

// Define sources
export const drsource = new VectorSource({ wrapX: false });
export const mrsource = new VectorSource({ wrapX: false });

// Define map and views
export const map = new Map({
  layers: [
    satelliteLayer,
    hybridLayer,
    osm,
    standardLayer,
    transportLayer,
    labelLayer, 
    osmHot,
    cartoLight,
    cartoDark,
    cartoVoyager,
    openTopo,
    googleSatelliteLayer,
    assambound
  ],
  target: "map",
  view: new View({
    projection: getProjection("EPSG:3857"),
    center: fromLonLat([93.074, 26.1872]),
    zoom: 8,
    maxZoom: 18,
  }),
  controls: [],
  keyboardEventTarget: document,
});
map.addControl(
  new Attribution({
    collapsible: false,
  })
);
export const worldview = new View({
  center: [0, 0],
  zoom: -2,
});

export function handleBaseToggle() {
  console.log("inside handleBase");

  // Your toggleLayer function
  function toggleLayer(layerName) {
    console.log("inside toggleLayer function");

    const layers = map.getLayers().getArray();

    layers.forEach(function (layer) {
      // Check if the layer name matches the clicked layer
      if (layer.get("isBase")) {
        if (layer.get("name") === layerName) {
          // Set the selected layer visible
          layer.setVisible(true);
        } else {
          // Hide the other layers
          layer.setVisible(false);

          if (
            layerName === "hybridLayer" &&
            layer.get("name") === "labelLayer"
          ) {
            layers.forEach(function (layer) {
              if (layer.get("name") === "labelLayer") {
                layer.setVisible(true);
              }
            });
          }
        }
      }
    });
  }

  // Event listeners for toggling layers
  // document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#base_layer_list li").forEach((item) => {
    console.log("querySelectorAll");

    item.addEventListener("click", () => {
      console.log("item clicked");

      const layerName = item.getAttribute("data-layer");
      console.log("Layer name:", layerName);

      // Log to check if toggleLayer is working
      try {
        toggleLayer(layerName);
        console.log("toggleLayer executed");
      } catch (error) {
        console.error("Error in toggleLayer:", error);
      }

      try {
        activateOption(item); // Highlight the selected option
        console.log("activateOption executed");
      } catch (error) {
        console.error("Error in activateOption:", error);
      }
    });
  });
  // })

  function activateOption(selectedElement) {
    // Your logic for highlighting the selected option
    const listItems = document.querySelectorAll("#base_layer_list li");
    listItems.forEach((item) => item.classList.remove("active"));
    selectedElement.classList.add("active");
  }
}

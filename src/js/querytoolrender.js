
import { selectedFile, selectedCategory } from './querytoolpopulate'
import { map } from './baseLayers'
import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import TileWMS from "ol/source/TileWMS.js";
import axios from "axios";
import { wmsLayerMap } from './categorywiselayers'
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";
import { Projection, fromLonLat, transformExtent } from "ol/proj";
import Text from "ol/style/Text";
import {
  queryObject,
} from "./querytoolpopulate.js";
import config from "../config.js";




// inilialize tilelayer for query tool
export let QerytoolWmsLayer;
export let wmsSource;
export let QuerytoolLabelLayer;
export let handlemapon = null;
export let queryLayerHighlightLayer;
// map onlick for  query tool layer




// Function to execute query and update map layer
export async function executeQuery(option) {
  console.log(option);

  if (option == "clear") {
    document.getElementById("queryTool-queryInput").value = "";

    // Get the selected layer name
    const selectedLayerName = selectedFile;



    map.removeLayer(QuerytoolLabelLayer);

    map.removeLayer(queryLayerHighlightLayer);

    // Remove the vector layer if needed
    map.getLayers().forEach((layer) => {
      if (layer) {
        // Check if the layer is defined
        const source = layer.getSource();
        if (source instanceof VectorSource) {
          const layerName = layer.get("name");
          if (layerName === "QuerytoolLabelLayer") {
            console.log("layer");
            console.log(layer);
            map.removeLayer(layer);
          }
        }
      }
    });

    // Find and remove the layer with the selected name
    map.getLayers().forEach((layer) => {
      const source = layer.getSource();
      if (source instanceof TileWMS) {
        const layerName = source.getParams()["LAYERS"];
        console.log(source.getParams());
        console.log(layerName);
        console.log(selectedLayerName);

        if (layerName === selectedLayerName) {
          map.removeLayer(layer);
        }
      }
    });

    return
  }

  const category = selectedCategory;
  const layer = selectedFile;
  const query = document.getElementById("queryTool-queryInput").value;
  const fieldnameDisplay = document.getElementById("queryTool-label").value;
  const minZoom = document.getElementById("queryTool-zoom").value;

  // **************************
  // Get the selected layer name

  map.removeLayer(QerytoolWmsLayer);
  map.removeLayer(QuerytoolLabelLayer);

  // **************************

  if (!query) {
    window.alert("Query field can't be empty..");
    return;
  }

  console.log("query");
  console.log(query);

  const wmsParams = {
    LAYERS: layer, // Layer name
    CQL_FILTER: query, // CQL filter to apply
    FORMAT: "image/png", // Image format (change as needed)
    BBOX: "10097025.688358642,2896046.127668757,10175297.205322662,2974317.6446327777", // Bounding box (example)
    WIDTH: 230, // Image width in pixels
    HEIGHT: 230, // Image height in pixels
    SRS: "EPSG:3857", // Spatial Reference System (e.g., EPSG:3857 for Web Mercator)
    TILED: true, // Enable tiling (if required)
  };

  // Construct WMS request with CQL_FILTER
  // Build WMS source
  wmsSource = new TileWMS({
    url: config.backendUrl + "/qToolwms",
    params: {
      LAYERS: layer,
      queryObject: JSON.stringify(queryObject),// stringify for sending via GET
      layer: layer,
      theme: category
    },
    serverType: "geoserver",
    crossOrigin: "anonymous",
  });

  console.log(wmsSource);

  QerytoolWmsLayer = new TileLayer({
    source: wmsSource,
    name: layer,
  });

  // console.log(`${config.geoserverurl}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${config.storename}:${layer}&outputFormat=application/json`);


  axios
    .get(config.backendUrl + "/labels", {
      params: {
        layer: layer,
        theme: category,
        fieldnameDisplay: fieldnameDisplay,
        queryObject: JSON.stringify(queryObject),
      },
    })
    .then((response) => {
      const data = response.data;
      console.log(data);

      QuerytoolLabelLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(data, {
            dataProjection: "EPSG:4326",
            featureProjection: map.getView().getProjection(),
          }),
        }),
        style: function (feature, resolution) {
          const zoom = map.getView().getZoom();
          if (zoom >= minZoom) {
            return new Style({
              text: new Text({
                font: "bold 16px Calibri,sans-serif",
                fill: new Fill({
                  color: "#ff0f7b",
                }),
                stroke: new Stroke({
                  color: "#fff",
                  width: 2,
                }),
                text: feature.get(fieldnameDisplay), // Use the attribute for label text
                offsetX: 0,
                offsetY: -15,
                textAlign: "center",
                textBaseline: "middle",
              }),
            });
          } else {
            return null;
          }
        },
      });

      map.addLayer(QuerytoolLabelLayer);
    })
    .catch((error) => {
      console.error("Error loading label layer:", error);
    });

  map.addLayer(QerytoolWmsLayer);
  wmsLayerMap.set(layer, QerytoolWmsLayer);

  // Create the highlight layer only once and reuse it
  queryLayerHighlightLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: "red",
        width: 2,
      }),
    }),
  });

  map.addLayer(queryLayerHighlightLayer); // Add highlight layer to the map once

  // Function to highlight feature
  function highlightFeature(featureData) {
    if (!featureData || Object.keys(featureData).length === 0) {
      console.warn("No feature data received.");
      return;
    }

    const format = new GeoJSON();
    const features = format.readFeatures(featureData);

    queryLayerHighlightLayer.getSource().clear(); // Clear previous highlights before adding new ones
    queryLayerHighlightLayer.getSource().addFeatures(features);
  }



  // -----------------display-------------------


  function displayFeatureResults(result) {
    console.log(result);

    const resultsDiv = document.getElementById('query-results');
    const resultsTable = document.getElementById('query-table');

    resultsDiv.style.display = 'block';
    resultsTable.style.display = 'block';

    const propertiesList = result.rows; // ✅ Use rows directly
    const totalCount = result.totalCount;
    const allKeys = Array.from(new Set(propertiesList.flatMap(p => Object.keys(p))));
    const rowsPerPage = 10;
    const totalRows = propertiesList.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    let currentPage = 1;

    const renderTable = (page) => {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedRows = propertiesList.slice(start, end);

      let tableHtml = `
      <h4 style="font-family: 'Helvetica Neue', Arial, sans-serif; margin-bottom: 5px; color: #333;">Fetched Feature Info</h4>
            <h5 style="font-family: 'Helvetica Neue', Arial, sans-serif; margin-bottom: 3px; color: #333;">Theme:<i> ${category}</i>  File:<i>${layer} </i> Total:<i>${totalCount}</i></h5>
      <h5 style="font-family: 'Helvetica Neue', Arial, sans-serif; margin-bottom: 3px; color: #333;">Query:<i> ${query}</i></h5>

      <div style="overflow-x: auto; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 13px; border: 1px solid #ccc;">
          <thead>
              <tr style="background-color: #f5f5f5; color: #333;">
              ${allKeys.map(k => `
                <th style="padding: 10px; border: 1px solid #ccc; text-align: left; white-space: nowrap;">
                  ${k}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${paginatedRows.map((p, index) => `
                <tr style="${index % 2 === 0 ? 'background:rgba(250, 250, 250, 0.79);' : 'background: rgba(255, 255, 255, 0.79);'} color: #333;">
                ${allKeys.map(k => `
                  <td style="padding: 10px; border: 1px solid #ccc; white-space: nowrap;">
                    ${p[k] ?? ''}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

      tableHtml += `
      <div style="text-align: right; margin-top: 15px; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <button id="prev-feature" style="padding: 8px 16px; margin: 0 5px; border: none; border-radius: 4px; background: #3498db; color: white; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === 1 ? '0.5' : '1'}; transition: opacity 0.2s;" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span style="margin: 0 15px; color: #333;">Page ${page} of ${totalPages}</span>
        <button id="next-feature" style="padding: 8px 16px; margin: 0 5px; border: none; border-radius: 4px; background: #3498db; color: white; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === totalPages ? '0.5' : '1'}; transition: opacity 0.2s;" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
      </div>
    `;

      resultsTable.innerHTML = tableHtml;

      document.getElementById('prev-feature')?.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable(currentPage);
        }
      });

      document.getElementById('next-feature')?.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderTable(currentPage);
        }
      });
    };

    renderTable(currentPage);
  }



  async function fetchFeatureInfo(theme, fileName, cql, limit = 100, offset = 0) {
    try {
      const response = await fetch(config.backendUrl + "/query", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, fileName, queryObject })
      });

      const data = await response.json();
      console.log(data);

      if (data.bbox) {
        const bbox4326 = data.bbox;
        // Transform to EPSG:3857 (Web Mercator) for OpenLayers
        const bbox3857 = transformExtent(bbox4326, 'EPSG:4326', 'EPSG:3857');

        map.getView().fit(bbox3857, {
          duration: 1000, // optional: smooth zoom effect (1 second)
          padding: [50, 50, 50, 50], // optional: padding around the box
        });
      }

      if (response.ok) {
        console.log(data);

        displayFeatureResults(data);
      } else {
        console.error(data.error || 'Failed to fetch features');
      }
    } catch (err) {
      console.error('Error fetching feature info:', err);
    }
  }

  fetchFeatureInfo(category, layer, query)


}


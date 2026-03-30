import GeoJSON from "ol/format/GeoJSON";
import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { map } from './baseLayers';
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import JSZip from 'jszip';
import shp from 'shpjs';
import * as togeojson from '@mapbox/togeojson';

export let uploadLayer = null; // To keep track of the uploaded layer
export let selectClick = null; // To store the interaction

export async function upload() {
    console.log("uploaded");

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const extension = file.name.split(".").pop().toLowerCase();

    // Remove existing layer and interaction before processing new file
    if (uploadLayer) {
        map.removeLayer(uploadLayer);
        uploadLayer = null;
    }
    if (selectClick) {
        map.removeInteraction(selectClick);
        selectClick = null;
    }

    // Handle different file types
    try {
        if (extension === "geojson" || extension === "json") {
            const data = await readFileAsText(file);
            uploadLayer = await processDataAndAddLayer(data, "geojson");
        } else if (extension === "kml") {
            const data = await readFileAsText(file);
            uploadLayer = await processDataAndAddLayer(data, "kml");
        } else if (extension === "zip") {
            const data = await readFileAsArrayBuffer(file);
            uploadLayer = await processDataAndAddLayer(data, "zip");
        } else {
            alert("Unsupported file format. Please upload a .geojson, .kml, or .zip file.");
            return;
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading the file. Please try again.");
        return;
    }

    // Add click interaction if layer was successfully added
    if (uploadLayer) {
        enableClickInteraction();
    }
}

// Helper function to read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (event) => reject(new Error(`File could not be read! Code ${event.target.error.code}`));
        reader.readAsText(file);
    });
}

// Helper function to read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (event) => reject(new Error(`File could not be read! Code ${event.target.error.code}`));
        reader.readAsArrayBuffer(file);
    });
}

export async function processDataAndAddLayer(data, extension) {
    console.log("Processing:", extension);

    let features = [];

    try {
        if (extension === "geojson") {
            const geojson = JSON.parse(data);
            features = new GeoJSON().readFeatures(geojson, {
                featureProjection: "EPSG:3857",
            });
        } else if (extension === "kml") {
            // Parse KML to GeoJSON using @mapbox/togeojson
            const kmlDoc = new DOMParser().parseFromString(data, "text/xml");
            const geojson = togeojson.kml(kmlDoc);
            features = new GeoJSON().readFeatures(geojson, {
                featureProjection: "EPSG:3857",
            });
        } else if (extension === "zip") {
            // Unzip and parse shapefile
            const geojson = await shp(data); // Fixed: Use parseZip for zipped shapefiles
            features = new GeoJSON().readFeatures(geojson, {
                featureProjection: "EPSG:3857",
            });
        } else {
            console.error("Unsupported format:", extension);
            return null;
        }
    } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing the uploaded file. Please ensure it is a valid format.");
        return null;
    }

    if (features.length === 0) {
        console.warn("No features found in the file.");
        alert("No valid features found in the uploaded file.");
        return null;
    }

    const vectorSource = new VectorSource({
        features,
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource,
    });

    map.addLayer(vectorLayer);

    const extent = vectorSource.getExtent();
    console.log("extent:", extent);

    // Check if extent is valid before fitting the view
    if (!isFinite(extent[0]) || !isFinite(extent[1]) || !isFinite(extent[2]) || !isFinite(extent[3])) {
        console.warn("Invalid extent, using default view");
    } else {
        map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000,
        });
    }

    return vectorLayer;
}

export function enableClickInteraction() {
    if (!uploadLayer) {
        console.warn("No upload layer available for click interaction.");
        return;
    }

    let popupContent = document.getElementById("popup-upload-content");
    let popupElement = document.getElementById("popup-upload");

    // Create a new Select interaction for the uploaded layer
    selectClick = new Select({
        condition: click,
        layers: [uploadLayer],
    });

    map.addInteraction(selectClick);

    // Handle feature click event
    selectClick.on("select", function (event) {
        const selectedFeatures = event.target.getFeatures();
        if (selectedFeatures.getLength() > 0) {
            const feature = selectedFeatures.item(0);
            const properties = feature.getProperties();

            // Remove geometry from displayed properties
            delete properties.geometry;

            // Create table rows from feature properties
            const tableRows = Object.entries(properties)
                .map(([key, value]) => `<tr><th>${key}</th><td>${value || "N/A"}</td></tr>`)
                .join("");

            // Populate the popup content with a table
            popupContent.innerHTML = `
                <strong>Feature Information</strong>
                <table>
                <tbody>
                    ${tableRows}
                </tbody>
                </table>
            `;

            // Show the popup
            popupElement.style.display = "block";
        } else {
            // Hide the popup if no feature is selected
            popupElement.style.display = "none";
        }
    });

    // Hide popup when clicking outside of a feature
    map.on("click", function () {
        if (selectClick && selectClick.getFeatures().getLength() === 0) {
            popupElement.style.display = "none";
        }
    });
}

export function uploadClear() {
    if (uploadLayer) {
        map.removeLayer(uploadLayer);
        uploadLayer = null;
    }
    if (selectClick) {
        map.removeInteraction(selectClick);
        selectClick = null;
    }
    // Ensure popup is hidden
    const popupElement = document.getElementById("popup-upload");
    if (popupElement) {
        popupElement.style.display = "none";
    }
}
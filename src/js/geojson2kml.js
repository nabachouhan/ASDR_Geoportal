import tokml from "@maphubs/tokml";
import * as shpwrite from "@mapbox/shp-write";
import shp from "shpjs";
import KML from "ol/format/KML";
import GeoJSON from "ol/format/GeoJSON";

let converterInitialized = false;

export function initUniversalConverter() {
  if (converterInitialized) return;
  converterInitialized = true;

  const input = document.getElementById("converterFileInput");
  const outputSelect = document.getElementById("converterOutputFormat");
  const button = document.getElementById("converterDownloadBtn");
  
  let geojsonData = null;

  input.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    geojsonData = null;
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      if (ext === 'zip') {
        const arrayBuffer = await file.arrayBuffer();
        geojsonData = await shp(arrayBuffer);
        alert("Shapefile loaded successfully!");
      } else if (ext === 'kml') {
        const text = await file.text();
        const format = new KML();
        const features = format.readFeatures(text, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        });
        const geojsonFormat = new GeoJSON();
        geojsonData = JSON.parse(geojsonFormat.writeFeatures(features));
        alert("KML loaded successfully!");
      } else if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        geojsonData = JSON.parse(text);
        alert("GeoJSON loaded successfully!");
      } else {
        alert("Unsupported file format.");
      }
    } catch (err) {
      console.error(err);
      alert("Error reading file. Ensure it is a valid format.");
    }
  });

  button.addEventListener("click", async () => {
    if (!geojsonData) {
      alert("Please upload and wait for a valid input file to load first.");
      return;
    }

    const outputFormat = outputSelect.value;
    
    // Normalize to a single feature collection for export
    let fc = geojsonData;
    if (Array.isArray(fc)) {
      fc = {
        type: "FeatureCollection",
        features: fc.flatMap(f => f.features || [])
      };
    }

    try {
      if (outputFormat === 'geojson') {
        const blob = new Blob([JSON.stringify(fc, null, 2)], {
          type: "application/geo+json",
        });
        downloadBlob(blob, "converted.geojson");
      } else if (outputFormat === 'kml') {
        const kmlString = tokml(fc, {
          name: "name",
          description: "description",
          documentName: "Converted KML",
          documentDescription: "Converted using Universal Format Converter",
        });
        const blob = new Blob([kmlString], {
          type: "application/vnd.google-earth.kml+xml",
        });
        downloadBlob(blob, "converted.kml");
      } else if (outputFormat === 'shapefile') {
         const options = {
            folder: 'shapefile_export',
            types: {
                point: 'points',
                polygon: 'polygons',
                line: 'lines'
            }
         };
         // Use download method provided by shpwrite to save zip
         shpwrite.download(fc, options);
      }
    } catch(err) {
      console.error(err);
      alert("Error during conversion. Ensure data is valid for this format.");
    }
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

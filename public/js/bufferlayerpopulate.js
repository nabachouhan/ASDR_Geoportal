import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Draw from 'ol/interaction/Draw';
import Feature from 'ol/Feature';
import { Point, LineString, Polygon } from 'ol/geom';
import { Fill, Stroke, Style } from 'ol/style';
import { transform } from 'ol/proj';
import { WKT } from 'ol/format';
import * as turf from '@turf/turf';
import GeoJSON from 'ol/format/GeoJSON';

export let bufferselectedCategory = '';
export let bufferselectedFile = '';
export let bufferselectedAttribute = '';

export let categoryInput = document.getElementById('queryTool-category');
export let fileInput = document.getElementById('queryTool-file');

export let categoryOptions = document.getElementById('categoryOptions');
export let fileOptions = document.getElementById('fileOptions');

export let bufferGeometryType = 'Point';
export let bufferSource = '';
let currentDrawInteraction = null;
let bufferLayer = null;

export async function bufferoptionload(map) {
  const buffercategoryOptions = document.getElementById('bufferlayer-theme');
  const bufferfileOptions = document.getElementById('bufferlayer-filename');
  const bufferattributeOptions = document.getElementById('bufferlayer-attribute');
  const bufferGeometryTypeSelect = document.getElementById('buffer-geometry-type');


  async function bufferloadCategories() {
    try {
      const response = await fetch('http://localhost:3010/api/themes');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const themes = await response.json();
      console.log('Fetched themes:', themes);
      buffercategoryOptions.innerHTML = '<option value="">Select...</option>';
      themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        buffercategoryOptions.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function bufferloadFiles(theme) {
    try {
      const response = await fetch(`http://localhost:3010/api/files/${theme}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const files = await response.json();
      console.log('Fetched files for theme', theme, ':', files);
      bufferfileOptions.innerHTML = '<option value="">Select...</option>';
      files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        bufferfileOptions.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading files:', err);
    }
  }

  async function bufferloadAttributes(theme, file) {
    try {
      const response = await fetch(`http://localhost:3010/api/attributes/${theme}/${file}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const attributes = await response.json();
      console.log('Fetched attributes for theme', theme, ':', attributes);
      bufferattributeOptions.innerHTML = '<option class="dropdown-option" value="">Select...</option>';
      attributes.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        bufferattributeOptions.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading attributes:', err);
    }
  }

  function updateDrawInteraction() {
    if (currentDrawInteraction) {
      map.removeInteraction(currentDrawInteraction);
      currentDrawInteraction = null;
    }
  }

  bufferGeometryTypeSelect.addEventListener('change', (event) => {
    bufferGeometryType = event.target.value;
    console.log('Selected geometry type:', bufferGeometryType);
    // Show KML upload wrapper only when KML mode is selected
    const kmlWrapper = document.getElementById('buffer-kml-upload-wrapper');
    if (kmlWrapper) kmlWrapper.style.display = bufferGeometryType === 'kml' ? 'block' : 'none';
    updateDrawInteraction();
  });

  buffercategoryOptions.addEventListener('change', (event) => {
    bufferselectedCategory = event.target.value;
    bufferselectedFile = '';
    bufferselectedAttribute = '';
    bufferfileOptions.innerHTML = '<option class="dropdown-option" value="">Select...</option>';
    if (bufferselectedCategory) {
      bufferloadFiles(bufferselectedCategory);
    }
  });

  bufferfileOptions.addEventListener('change', (event) => {
    bufferselectedFile = event.target.value;
    bufferselectedAttribute = '';
    bufferattributeOptions.innerHTML = '<option value="">Select...</option>';
    if (bufferselectedFile) {
      bufferloadAttributes(bufferselectedCategory, bufferselectedFile);
    }
  });

  bufferattributeOptions.addEventListener('change', (event) => {
    bufferselectedAttribute = event.target.value;
    console.log('Selected bufferselectedAttribute:', bufferselectedAttribute);
  });

  await bufferloadCategories();
}


// category input
categoryInput.addEventListener('input', () => {
  const query = categoryInput.value.toLowerCase();
  const options = categoryOptions.querySelectorAll('.dropdown-option');

  options.forEach(option => {
    const matches = option.textContent.toLowerCase().includes(query);
    option.style.display = matches ? 'block' : 'none';
  });

  categoryOptions.style.display = 'block';
});

// file input
fileInput.addEventListener('input', () => {
  const query = fileInput.value.toLowerCase();
  const options = fileOptions.querySelectorAll('.dropdown-option');

  options.forEach(option => {
    const matches = option.textContent.toLowerCase().includes(query);
    option.style.display = matches ? 'block' : 'none';
  });

  fileOptions.style.display = 'block';
});

export function initBufferDrawing(map) {
  if (!bufferLayer) {
    bufferSource = new VectorSource();
    bufferLayer = new VectorLayer({
      source: bufferSource,
      zIndex: 10,
      updateWhileAnimating: false,
      updateWhileInteracting: false,
    });
    map.addLayer(bufferLayer);
  }

  function createDrawInteraction() {
    return new Draw({
      source: bufferLayer.getSource(),
      type: bufferGeometryType,
      stopClick: true,
      freehand: false,
    });
  }

  document.getElementById('createBuffer').addEventListener('click', () => {
    const radius = parseFloat(document.getElementById('buffer-radius').value) || 5000;

    // KML upload mode: read and parse the uploaded KML file
    if (bufferGeometryType === 'kml') {
      const fileInput = document.getElementById('buffer-kml-file');
      if (!fileInput || !fileInput.files.length) {
        alert('Please select a KML file first.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const kmlText = e.target.result;
          const parser = new DOMParser();
          const kmlDoc = parser.parseFromString(kmlText, 'application/xml');
          const format = new (await import('ol/format/KML')).default();
          const features = format.readFeatures(kmlDoc, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection()
          });
          if (!features.length) { alert('No features found in KML.'); return; }

          bufferLayer.getSource().clear();
          features.forEach(f => bufferLayer.getSource().addFeature(f));

          // Union all geometries and buffer
          const geoJson = new GeoJSON();
          const turfFeatures = features.map(f =>
            geoJson.writeFeatureObject(f, { dataProjection: 'EPSG:4326', featureProjection: map.getView().getProjection() })
          );
          const union = turfFeatures.reduce((acc, cur) => acc ? turf.union(acc, cur) : cur, null);
          const buffer = turf.buffer(union, radius, { units: 'meters' });

          const bufferCoords = buffer.geometry.coordinates[0].map(coord =>
            transform(coord, 'EPSG:4326', map.getView().getProjection())
          );
          const bufferFeature = new Feature({ geometry: new Polygon([bufferCoords]), type: 'buffer' });
          bufferFeature.setStyle(new Style({
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' }),
            stroke: new Stroke({ color: '#FF0000', width: 2 })
          }));
          bufferLayer.getSource().addFeature(bufferFeature);
          await performBufferAnalysis(buffer, map, radius);
        } catch (err) {
          console.error('KML buffer error:', err);
          alert('Failed to process KML file.');
        }
      };
      reader.readAsText(fileInput.files[0]);
      return;
    }

    // Draw modes (Point, LineString, Polygon)
    if (currentDrawInteraction) {
      map.removeInteraction(currentDrawInteraction);
    }
    currentDrawInteraction = createDrawInteraction();
    map.addInteraction(currentDrawInteraction);

    currentDrawInteraction.on('drawend', async (event) => {
      const feature = event.feature;
      const geometry = feature.getGeometry();
      const radius = parseFloat(document.getElementById('buffer-radius').value) || 5000;
      console.log('Radius (meters):', radius);

      if (isNaN(radius) || radius <= 0) {
        alert("Please enter a valid radius value.");
        return;
      }
      if (radius < 1) {
        alert("Radius is too small. Please enter a value in meters (e.g., 1000 for 1km).");
        map.removeInteraction(currentDrawInteraction);
        currentDrawInteraction = null;
        return;
      }

      let buffer;
      try {
        if (bufferGeometryType === 'Point') {
          const coordinates = geometry.getCoordinates();
          const lonLat = transform(coordinates, map.getView().getProjection(), 'EPSG:4326');
          const point = turf.point(lonLat);
          buffer = turf.buffer(point, radius, { units: 'meters' });
        } else if (bufferGeometryType === 'LineString') {
          const coordinates = geometry.getCoordinates();
          const lonLatCoords = coordinates.map(coord => transform(coord, map.getView().getProjection(), 'EPSG:4326'));
          const line = turf.lineString(lonLatCoords);
          buffer = turf.buffer(line, radius, { units: 'meters' });
        } else if (bufferGeometryType === 'Polygon') {
          const coordinates = geometry.getCoordinates();
          const lonLatRings = coordinates.map(ring =>
            ring.map(coord => transform(coord, map.getView().getProjection(), 'EPSG:4326'))
          );
          const polygon = turf.polygon(lonLatRings);
          buffer = turf.buffer(polygon, radius, { units: 'meters' });
        }
        console.log('Buffer geometry:', buffer);
      } catch (err) {
        console.error('Error creating buffer:', err);
        alert('Failed to create buffer. Please try again.');
        map.removeInteraction(currentDrawInteraction);
        currentDrawInteraction = null;
        return;
      }

      const bufferCoords = buffer.geometry.type === 'Polygon'
        ? buffer.geometry.coordinates[0].map(coord => transform(coord, 'EPSG:4326', map.getView().getProjection()))
        : buffer.geometry.coordinates.map(ring => ring.map(coord => transform(coord, 'EPSG:4326', map.getView().getProjection())));

      const bufferFeature = new Feature({
        geometry: new Polygon(buffer.geometry.type === 'Polygon' ? [bufferCoords] : bufferCoords),
        type: 'buffer'
      });

      bufferLayer.getSource().clear();
      bufferLayer.getSource().addFeature(bufferFeature);

      bufferFeature.setStyle(new Style({
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' }),
        stroke: new Stroke({ color: '#FF0000', width: 2 }),
        zIndex: 9
      }));

      await performBufferAnalysis(buffer, map, radius);

      map.removeInteraction(currentDrawInteraction);
      currentDrawInteraction = null;
    });
  });

  document.getElementById('clearBuffer').addEventListener('click', () => {
    if (bufferLayer) {
      bufferLayer.getSource().clear();
    }
    if (currentDrawInteraction) {
      map.removeInteraction(currentDrawInteraction);
      currentDrawInteraction = null;
    }
    document.getElementById('buffer-head').innerHTML = '';;
    document.getElementById('buffer-chartdiv').style.display = 'none';
    document.getElementById('buffer-table').innerHTML = '';
  });

  async function performBufferAnalysis(buffer, map, radius) {
    if (!bufferselectedCategory || !bufferselectedFile) {
      alert("Please select a theme and layer.");
      return;
    }

    try {
      const wkt = new WKT().writeGeometry(
        new Polygon(buffer.geometry.type === 'Polygon'
          ? buffer.geometry.coordinates
          : buffer.geometry.coordinates
        )
      );
      console.log('Buffer WKT:', wkt);
      const clientBufferArea = turf.area(buffer) * 1e6; // Convert to sq meters
      console.log('Client buffer area (sq meters):', clientBufferArea);
      const response = await fetch('http://localhost:3010/api/buffer-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: bufferselectedCategory,
          table: bufferselectedFile,
          categoriseFieldName: bufferselectedAttribute,
          bufferWkt: wkt,
          radius: radius
        })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      console.log('Buffer analysis result:', result);
      displayBufferResults(result, map);
    } catch (err) {
      console.error('Error performing buffer analysis:', err);

      const resultsChartDiv = document.getElementById('buffer-chartdiv');
      const resultsTable = document.getElementById('buffer-table');

      resultsChartDiv.style.display = 'none';
      resultsTable.style.display = 'none';

      document.getElementById('buffer-head').innerHTML = 'Error performing buffer analysis.';
    }
  }

  function displayBufferResults(result, map) {
    const resultsDiv = document.getElementById('buffer-results');
    const resultsHead = document.getElementById('buffer-head');
    const resultsChart = document.getElementById('buffer-chart');
    const resultsChartDiv = document.getElementById('buffer-chartdiv');
    const resultsTable = document.getElementById('buffer-table');

    resultsDiv.style.display = 'block';
    resultsTable.style.display = 'block';

    resultsChartDiv.style.display = 'none';

    if (window.bufferChartInstance) {
      window.bufferChartInstance.destroy();
      window.bufferChartInstance = null;
    }

    let htmlHead = '<h4 style="font-family: Arial, sans-serif; color: #333; margin-bottom: 10px;">Buffer Analysis Results</h4>';
    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Features within buffer:</strong> ${result.featureCount}</p>`;

    const createChart = (labels, data, labelText) => {
      const ctx = resultsChart.getContext('2d');
      resultsChartDiv.style.display = 'block';
      window.bufferChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: labelText,
            data: data,
            backgroundColor: labels.map((_, i) => `hsl(${(i * 360) / labels.length}, 70%, 60%)`),
            borderColor: '#fff',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: { size: 12, family: 'Arial, sans-serif' },
                padding: 10,
                boxWidth: 20,
                color: '#333'
              }
            },
            datalabels: {
              color: '#fff',
              font: { size: 11, weight: 'bold' },
              formatter: (value, ctx2) => {
                const total = ctx2.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((value / total) * 100).toFixed(1);
                return `${value}\n(${pct}%)`;
              }
            }
          }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
      });
    };

    let htmlTable = '';

    if (result.geometryType === 'Point') {
      if (result.categoryCounts && Object.keys(result.categoryCounts).length > 0) {
        createChart(Object.keys(result.categoryCounts), Object.values(result.categoryCounts), 'Features by Category');
      }
    } else if (result.geometryType === 'LineString' || result.geometryType === 'MultiLineString') {
      htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Total length within buffer:</strong> ${result.totalLength ? result.totalLength.toFixed(2) : 0} meters</p>`;
      if (result.categoryLengths && Object.keys(result.categoryLengths).length > 0) {
        createChart(Object.keys(result.categoryLengths), Object.values(result.categoryLengths), 'Length by Category');
      }
    } else if (result.geometryType === 'Polygon' || result.geometryType === 'MultiPolygon') {
      const totalArea = result.totalArea ? result.totalArea.toFixed(2) : 0;
      const bufferArea = result.bufferArea ? result.bufferArea.toFixed(2) : 0;
      const percentage = result.percentageCovered || 0;
      htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Total area within buffer:</strong> ${totalArea} sq meters</p>`;
      htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Buffer area:</strong> ${bufferArea} sq meters</p>`;
      htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Percentage covered:</strong> ${percentage}%</p>`;
      if (result.categoryAreas && Object.keys(result.categoryAreas).length > 0) {
        htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Area by Category:</strong></p>`;
        createChart(Object.keys(result.categoryAreas), Object.values(result.categoryAreas), 'Area by Category');
      }
    }

    // Pagination logic
    if (result.featureCount > 0) {
      const propertiesList = result.features.map(f => f.properties);
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
        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #444; margin-top: 15px;"><strong>Feature Properties:</strong></p>
        <div style="max-width: 100%; overflow-x: auto;">
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 13px; border: 1px solid #ccc;">
            <thead>
              <tr style="background-color: #f5f5f5; color: #333;">
                ${allKeys.map(key => `<th style="padding: 10px; border: 1px solid #ccc; text-align: left; white-space: nowrap;">${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${paginatedRows.map((p, index) => `
                <tr style="${index % 2 === 0 ? 'background:rgba(250, 250, 250, 0.79);' : 'background: rgba(255, 255, 255, 0.79);'} color: #333;">
                  ${allKeys.map(key => `<td style="padding: 10px; border: 1px solid #ccc; white-space: nowrap;">${p[key] !== undefined ? p[key] : ''}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;

        // Pagination controls
        tableHtml += `
        <div style="margin-top: 10px; text-align: right; font-family: Arial, sans-serif;">
          <button id="prev-page" style="padding: 5px 10px; margin-right: 5px; background-color: #ddd; border: none; border-radius: 3px; cursor: pointer; ${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <span style="font-size: 14px; color: #444;">Page ${page} of ${totalPages}</span>
          <button id="next-page" style="padding: 5px 10px; margin-left: 5px; background-color: #ddd; border: none; border-radius: 3px; cursor: pointer; ${currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        </div>
      `;

        resultsTable.innerHTML = tableHtml;

        // Add event listeners for pagination buttons
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        if (prevButton) {
          prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
              currentPage--;
              renderTable(currentPage);
            }
          });
        }

        if (nextButton) {
          nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
              currentPage++;
              renderTable(currentPage);
            }
          });
        }
      };

      // Initial render
      renderTable(currentPage);
    } else {
      htmlTable = '<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;">No features found within buffer.</p>';
      resultsTable.innerHTML = htmlTable;
    }

    resultsHead.innerHTML = htmlHead;

    if ((result.geometryType === 'Point' || result.geometryType === 'LineString' || result.geometryType === 'Polygon' || result.geometryType === 'MultiPolygon') && result.intersectingGeometries) {
      const format = new GeoJSON();
      const features = result.intersectingGeometries.map(geoJson =>
        format.readFeature(geoJson, {
          dataProjection: 'EPSG:4326',
          featureProjection: map.getView().getProjection()
        })
      );
      features.forEach(feature => {
        feature.setStyle(new Style({
          fill: new Fill({ color: 'rgba(0, 255, 0, 0.2)' }),
          stroke: new Stroke({ color: '#00FF00', width: 2 }),
          zIndex: 8
        }));
        bufferLayer.getSource().addFeature(feature);
      });
    }
  }



  document.getElementById("info-content-btn").addEventListener("click", () => {
    display_toggle_block('buffer-results');
  });

  return null;
}
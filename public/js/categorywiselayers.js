
export const wmsLayerMap  = new window.Map();

// sidebarManager.js

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

const populatedThemes = new Set();
let allLayersByTheme = {};

const themeToIdMap = {
  administrative: "sidebar-datasets-administrative",
  infrastructure: "sidebar-datasets-Infrastructure",
  landresource: "sidebar-datasets-land-resource",
  "water resource": "sidebar-datasets-water-resource",
  "disaster management": "sidebar-datasets-disaster-management",
  weatherclimate: "sidebar-datasets-weather-climate",
  utility: "sidebar-datasets-utility",
  terrain: "sidebar-datasets-terrain",
};

async function fetchAllLayers() {
  const loading = document.getElementById("sidebar-loading");
  const error = document.getElementById("sidebar-error");
  if (loading) loading.style.display = "block";
  if (error) error.style.display = "none";

  try {
    const response = await fetch("http://localhost:3010/api/layers");
    if (!response.ok) throw new Error("Failed to fetch layers");
    const data = await response.json();

    allLayersByTheme = data.reduce((acc, { theme, layers }) => {
      acc[theme.toLowerCase()] = layers;
      return acc;
    }, {});
  } catch (err) {
    if (error) {
      error.textContent = `Error: ${err.message}`;
      error.style.display = "block";
    }
    console.error("Error fetching layers:", err);
  } finally {
    if (loading) loading.style.display = "none";
  }
}

function populateTheme(theme, ul, map) {
  if (populatedThemes.has(theme)) {
    toggleSidebarSection(ul);
    return;
  }

  const layers = allLayersByTheme[theme.toLowerCase()] || [];

  ul.innerHTML = "";
  if (layers.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No layers available";
    ul.appendChild(li);
  } else {
    layers.forEach((layer) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" id="${layer.file_name}" class="layer-checkbox">
        <label for="${layer.file_name}">${layer.title || layer.file_name}</label>
      `;
      ul.appendChild(li);
      li.querySelector("input").addEventListener("change", (e) => {
        if (e.target.checked) {
          addLayerToMap(layer, map);
        } else {
          removeLayerFromMap(layer.file_name, map);
        }
      });
    });
  }

  populatedThemes.add(theme);
  ul.classList.add("active");
}

function toggleSidebarSection(ul) {
  ul.classList.toggle("active");
}

function addLayerToMap(layer, map) {
  const wmsLayer = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:3010/api/wms',
      params: {
        'LAYERS': layer.file_name,
        'TILED': true,
        'FORMAT': 'image/png',
        'TRANSPARENT': true,
      },
          crossOrigin: 'anonymous' ,
      projection: `EPSG:${layer.srid || 4326}`,
      serverType: 'geoserver',
    }),
    visible: true,
    preload: Infinity,
    properties: {
      name: layer.file_name,
      title: layer.title || layer.file_name,
    },
  });
  map.addLayer(wmsLayer);
  wmsLayerMap.set(layer.file_name, wmsLayer);
}

function removeLayerFromMap(fileName, map) {
  const layer = wmsLayerMap.get(fileName);
  if (layer) {
    map.removeLayer(layer);
    wmsLayerMap.delete(fileName);
  }
}

function handleMapClick(map) {
  let mapClickEnabled = false;

  document.getElementById("toggleMapClickBtn").addEventListener("click", () => {
    mapClickEnabled = !mapClickEnabled;
    document.getElementById("toggleMapClickBtn").textContent = mapClickEnabled ? "visibility" : "visibility_off";
    if (!mapClickEnabled) {
      document.getElementById("featureInfo").style.display = "none";
    }
  });

  document.getElementById("closeInfoBtn").addEventListener("click", () => {
    document.getElementById("featureInfo").style.display = "none";
  });

  map.on('singleclick', function (evt) {
    if (!mapClickEnabled) return;

    const view = map.getView();
    const viewResolution = view.getResolution();
    const coordinate = evt.coordinate;

    wmsLayerMap.forEach((layer, fileName) => {
      if (layer instanceof TileLayer && layer.getVisible()) {
        const source = layer.getSource();
        const url = source.getFeatureInfoUrl(
          coordinate,
          viewResolution,
          view.getProjection(),
          {
            'INFO_FORMAT': 'application/json',
            'QUERY_LAYERS': fileName,
          }
        );

        console.log(url)

        if (url) {
          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              if (data.features && data.features.length > 0) {
                const props = data.features[0].properties;
                let table = `<h3>${fileName}</h3><table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>`;
                for (const [key, value] of Object.entries(props)) {
                  table += `<tr><td>${key}</td><td>${value}</td></tr>`;
                }
                table += `</tbody></table>`;

                document.getElementById("featureContent").innerHTML = table;
                document.getElementById("featureInfo").style.display = "block";
              }
            })
            .catch((err) => {
              console.error(`Error fetching GetFeatureInfo for ${fileName}:`, err);
            });
        }
      }
    });
  });
}

export function initializeSidebar(map) {
  Object.entries(themeToIdMap).forEach(([theme, id]) => {
    const btn = document.getElementById(`${id}-btn`);
    if (btn) {
      btn.addEventListener("click", () => {
        const ul = document.getElementById(id);
        if (ul) {
          populateTheme(theme, ul, map);
        }
      });
    }
  });

  fetchAllLayers();
  handleMapClick(map);
}

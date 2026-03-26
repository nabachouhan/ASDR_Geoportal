import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { Style, Icon, Text, Fill } from "ol/style.js";
import { fromLonLat, toLonLat } from "ol/proj";
import Overlay from "ol/Overlay.js";
import { map } from "./baseLayers.js";

export const pinSource = new VectorSource();
export const pinLayer = new VectorLayer({ source: pinSource });

/** Shared style factory — ensures both modes look identical */
function makePinStyle(lat, lon) {
  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: "../icons/locationblue.png",
      scale: 0.3,
    }),
    text: new Text({
      text: `Lat: ${Number(lat).toFixed(5)}, Lon: ${Number(lon).toFixed(5)}`,
      offsetY: 15,
      font: 'bold 12px Arial, sans-serif',
      fill: new Fill({ color: '#fff' }),
      backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
      padding: [3, 6, 3, 6],
    }),
  });
}

export function pindrop() {
  map.addLayer(pinLayer);

  // --- Copy overlay ---
  const copyEl = document.createElement('div');
  copyEl.style.cssText = 'background:rgba(0,0,0,.75);color:#fff;padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer;user-select:none;';
  copyEl.title = 'Click to copy';
  const copyOverlay = new Overlay({ element: copyEl, offset: [0, -60], positioning: 'bottom-center' });
  map.addOverlay(copyOverlay);

  function showCopyOverlay(lat, lon, coord) {
    copyEl.textContent = `📋 ${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`;
    copyOverlay.setPosition(coord);
    copyEl.onclick = () => {
      navigator.clipboard.writeText(`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`)
        .then(() => { copyEl.textContent = '✅ Copied!'; setTimeout(() => copyOverlay.setPosition(undefined), 1200); })
        .catch(() => alert(`Lat: ${Number(lat).toFixed(5)}, Lon: ${Number(lon).toFixed(5)}`));
    };
  }

  // --- Lat/Lon input pindrop ---
  document.getElementById("locate_Pindrop").addEventListener("click", function () {
    const lat = parseFloat(document.getElementById("lat").value);
    const lon = parseFloat(document.getElementById("lon").value);
    if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      alert("Please enter valid longitude (-180 to 180) and latitude (-90 to 90) values.");
      return;
    }
    const coord = fromLonLat([lon, lat]);
    map.getView().setCenter(coord);
    map.getView().setZoom(15);
    const pinFeature = new Feature({ geometry: new Point(coord) });
    pinFeature.setStyle(makePinStyle(lat, lon));
    pinSource.addFeature(pinFeature);
    showCopyOverlay(lat, lon, coord);
  });

  // --- Manual click-to-pin ---
  let isManualPinActive = false;
  const manualPinBtn = document.getElementById("manual_Pindrop");

  manualPinBtn.addEventListener("click", function () {
    isManualPinActive = !isManualPinActive;
    if (isManualPinActive) {
      manualPinBtn.style.backgroundColor = "#d3d3d3";
      manualPinBtn.textContent = "Cancel Pin";
      map.getTargetElement().style.cursor = 'crosshair';
    } else {
      manualPinBtn.style.backgroundColor = "";
      manualPinBtn.textContent = "Drop Manually";
      map.getTargetElement().style.cursor = '';
    }
  });

  map.on('singleclick', function (evt) {
    if (!isManualPinActive) return;
    const coordinate = evt.coordinate;
    const [lon, lat] = toLonLat(coordinate);
    document.getElementById("lat").value = lat.toFixed(5);
    document.getElementById("lon").value = lon.toFixed(5);
    const pinFeature = new Feature({ geometry: new Point(coordinate) });
    pinFeature.setStyle(makePinStyle(lat, lon));
    pinSource.addFeature(pinFeature);
    showCopyOverlay(lat, lon, coordinate);
    isManualPinActive = false;
    manualPinBtn.style.backgroundColor = "";
    manualPinBtn.textContent = "Drop Manually";
    map.getTargetElement().style.cursor = '';
  });

  // --- Remove all ---
  document.getElementById("locate_Pinremove").addEventListener("click", function () {
    pinSource.clear();
    copyOverlay.setPosition(undefined);
  });
}
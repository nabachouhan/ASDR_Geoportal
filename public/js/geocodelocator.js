import axios from "axios";
import { map } from "./baseLayers";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";

export let geoLocateLat;
export let geoLocateLon;

export const pinSource = new VectorSource();
export const pinLayer = new VectorLayer({ source: pinSource });
map.addLayer(pinLayer);

// Create a popup element
const popupEl = document.createElement("div");
popupEl.className = "ol-popup";
// popupEl.id = "ol-popup";

popupEl.style.cssText = `
  background: white;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
`;
document.body.appendChild(popupEl);

const popupOverlay = new Overlay({
  element: popupEl,
  positioning: "bottom-center",
  offset: [0, -30],
  stopEvent: true,
});

export function loc() {
  document.addEventListener("DOMContentLoaded", function () {
    const locationInput = document.getElementById("locationInput");
    const resultContainer = document.getElementById("resultContainer");

    locationInput.addEventListener("input", function () {
      const location = locationInput.value.trim();
      if (location) {
        getSuggestions(location);
      } else {
        resultContainer.innerHTML = "";
      }
    });

    async function getSuggestions(location) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
        );
        const suggestions = response.data;
        displaySuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error.message);
      }
    }

    function displaySuggestions(suggestions) {
        map.addOverlay(popupOverlay);

      if (suggestions && suggestions.length > 0) {
        const suggestionHTML = suggestions
          .map((suggestion) => {
            return `<li class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}" data-name="${suggestion.display_name}">${suggestion.display_name}</li>`;
          })
          .join("");
        resultContainer.innerHTML = `<ul>${suggestionHTML}</ul>`;
        const suggestionItems = document.querySelectorAll(".suggestion-item");
        suggestionItems.forEach((item) => {
          item.addEventListener("click", function () {
            const name = item.getAttribute("data-name");
            locationInput.value = name;
            geoLocateLat = parseFloat(item.getAttribute("data-lat"));
            geoLocateLon = parseFloat(item.getAttribute("data-lon"));
            locateLocation(geoLocateLat, geoLocateLon, name);
            clearSuggestions();
          });
        });
      } else {
        resultContainer.innerHTML = "<p>No suggestions found.</p>";
      }
    }

    function clearSuggestions() {
      resultContainer.innerHTML = "";
    }

    function locateLocation(lat, lon, locationName) {
      const coords = fromLonLat([lon, lat]);

      // Center and zoom
      map.getView().setCenter(coords);
      map.getView().setZoom(16);

      // Clear old pins
    //   pinSource.clear();

      // Create pin
      const pinFeature = new Feature({
        geometry: new Point(coords),
      });

      pinFeature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "../icons/locationred.png",
            scale: 0.2,
          }),
        })
      );

      pinSource.addFeature(pinFeature);

      // Show popup
      popupEl.innerHTML = `<strong>Location Info</strong><br>${locationName}`;
      popupOverlay.setPosition(coords);
    }

  });

}
export function clearLocation() {
  // Get the input element
//   var elt = document.getElementById('ol-popup');
//     document.removeChild(elt)

  // Clear the input field
  const locationInput = document.getElementById("locationInput");

  locationInput.value = "";
  pinSource.clear();
  map.removeOverlay(popupOverlay);

}

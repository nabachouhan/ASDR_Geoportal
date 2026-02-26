import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Icon from "ol/style/Icon.js";
import {  Style } from "ol/style.js";
import {  fromLonLat } from "ol/proj";
import {
  map,
} from "./baseLayers.js";

export const pinSource = new VectorSource();
export const pinLayer = new VectorLayer({
  source: pinSource,
});

export function pindrop(){
map.addLayer(pinLayer);

document
  .getElementById("locate_Pindrop")
  .addEventListener("click", function () {
    // Get longitude and latitude values from input fields
    let lat = parseFloat(document.getElementById("lat").value);
    let lon = parseFloat(document.getElementById("lon").value);
    console.log("lat");
    console.log(lat);

    console.log("lon");
    console.log(lon);

    // Ensure that lon and lat are valid numbers
    if (
      isNaN(lon) ||
      isNaN(lat) ||
      lon < -180 ||
      lon > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      alert(
        "Please enter valid longitude (-180 to 180) and latitude (-90 to 90) values."
      );
      return;
    }

    // Center the map view to the specified coordinates

    map.getView().setCenter(new fromLonLat([lon, lat]));
    map.getView().setZoom(15); // Set desired zoom level

    // Drop a pin at the specified coordinates
    let pinFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });

    // Add the pin feature to the pin source
    pinSource.addFeature(pinFeature);

    let pinStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "../icons/locationblue.png", // URL to the pin icon
        scale: 0.3,
      }),
    });

    pinFeature.setStyle(pinStyle);
  });

document
  .getElementById("locate_Pinremove")
  .addEventListener("click", function () {
    console.log("remove");

    pinSource.clear(); // Clear all features from the pin source
  });
}
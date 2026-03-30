
import ScaleLine from "ol/control/ScaleLine.js";
import MousePosition from "ol/control/MousePosition.js";
import { Projection, fromLonLat } from "ol/proj";
import { map } from './baseLayers.js';

export let projection = new Projection("EPSG:4326"); // Example: WGS 84 geographic projection

// coordinate tool starts ................
export const scaleLine = new ScaleLine({ bar: true, text: true, minWidth: 125 });
export function renderScaleBar(){
map.addControl(scaleLine);   
}


export function renderCoordinate(){
const coordPos = document.getElementById("lonlat_display");
const mousePos = new MousePosition({
    projection: "EPSG:4326",
  coordinateFormat: function (coordinate) {
    let point = new fromLonLat([coordinate[1], coordinate[0]], projection);
    let ltdegrees = Math.floor(point[0]);
    let ltminutes = (point[0] - ltdegrees) * 60;
    let ltcoor = ltdegrees + "° " + ltminutes.toFixed(2) + "'";
    let lndegrees = Math.floor(point[1]);
    let lnminutes = (point[1] - lndegrees) * 60;
    let lncoor = lndegrees + "° " + lnminutes.toFixed(2) + "'";
    let DDcoord = ltcoor + "  N " + lncoor + "E";
    coordPos.innerHTML = DDcoord;
  },
  // target: document.getElementById('lonlat_display')
});
map.addControl(mousePos);
}
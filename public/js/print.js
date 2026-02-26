import { renderAllLegends, getLegendItems } from "./legend.js";
import { map } from "./baseLayers.js";
import { scaleLine } from "./coordinateAndScale.js";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Map from "ol/Map.js";
import View from "ol/View.js";
import ScaleLine from "ol/control/ScaleLine.js";
import { defaults as defaultControls } from "ol/control/defaults.js";
import { register } from "ol/proj/proj4.js";
import {
  get as getProjection,
  getPointResolution,
  transformExtent,
} from "ol/proj.js";
import proj4 from "proj4";
import { compass, assaclogo } from "./logo.js";

// Define EPSG:4326 for Assam region
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

register(proj4);

const proj4326 = getProjection("EPSG:4326");

// export const scaleLine = new ScaleLine({ bar: true, text: true, minWidth: 125 });
// map.addControl(scaleLine);

export const dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148],
};

// Function to fetch image as base64
export async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error);
    return null;
  }
}

// export options for html2canvas
const exportOptions = {
  useCORS: true,
  ignoreElements: function (element) {
    const className = element.className || "";
    return (
      className.includes("ol-control") &&
      !className.includes("ol-scale") &&
      (!className.includes("ol-attribution") ||
        !className.includes("ol-uncollapsible"))
    );
  },
};

const exportButton = document.getElementById("export-pdf");

function formatCoordinate(coord, isLon) {
  const abs = Math.abs(coord);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(0);
  const dir = isLon ? (coord < 0 ? "W" : "E") : coord < 0 ? "S" : "N";
  return `${degrees}°${minutes}'${seconds}"${dir}`;
}

export async function exportMapToPDF() {
  exportButton.disabled = true;
  document.body.style.cursor = "progress";

  const format = document.getElementById("format").value;
  const resolution = document.getElementById("resolution").value;
  const scale = document.getElementById("scale").value;
  const dim = dims[format];
  const width = Math.round((dim[0] * resolution) / 25.4);
  const height = Math.round((dim[1] * resolution) / 25.4);
  const viewResolution = map.getView().getResolution();
  const scaleResolution =
    scale /
    getPointResolution(
      map.getView().getProjection(),
      resolution / 25.4,
      map.getView().getCenter()
    );

  // Fetch legend items and their images as base64
  const legendItems = getLegendItems();
  let legendImages = [];
  if (legendItems.length > 0) {
    legendImages = await Promise.all(
      legendItems.map(async (item) => {
        const base64 = await fetchImageAsBase64(item.imageUrl);
        return { name: item.name, base64 };
      })
    );
  } else {
    console.warn("No legend items found for PDF export");
  }

  scaleLine.setDpi(resolution);
  map.getTargetElement().style.width = width + "px";
  map.getTargetElement().style.height = height + "px";
  map.updateSize();
  map.getView().setResolution(scaleResolution);

  // Calculate extent after setting print resolution
  let fullExtent = map.getView().calculateExtent([width, height]);
  const geoFullExtent = transformExtent(
    fullExtent,
    map.getView().getProjection(),
    "EPSG:4326"
  );
  fullExtent = geoFullExtent;

  map.once("rendercomplete", function () {
    exportOptions.width = width;
    exportOptions.height = height;
    html2canvas(map.getViewport(), exportOptions).then(async function (canvas) {
      const pdf = new jsPDF("landscape", undefined, format);

      // Add map image first (unchanged to preserve accuracy)
      pdf.addImage(
        canvas.toDataURL("image/jpeg"),
        "JPEG",
        0,
        0,
        dim[0],
        dim[1]
      );

      // Define strap dimensions
      const topStrapHeight = 40; // Height of top strap in mm
      const boundaryOffset = 3; // Offset for the inner boundary in mm

      // Calculate accurate visible coordinates
      const dpi = Number(resolution);
      const pxPerMm = dpi / 25.4;
      const headerPx = topStrapHeight * pxPerMm;
      const bottomOffsetPx = boundaryOffset * pxPerMm;
      const leftOffsetPx = boundaryOffset * pxPerMm;
      const rightOffsetPx = boundaryOffset * pxPerMm;

      const visibleTopYPx = headerPx;
      const visibleBottomYPx = height - bottomOffsetPx;
      const visibleLeftXPx = leftOffsetPx;
      const visibleRightXPx = width - rightOffsetPx;

      const deltaLon = fullExtent[2] - fullExtent[0];
      const deltaLat = fullExtent[3] - fullExtent[1];

      const lonTL = fullExtent[0] + (visibleLeftXPx / width) * deltaLon;
      const latTL = fullExtent[3] - (visibleTopYPx / height) * deltaLat;
      const lonBR = fullExtent[0] + (visibleRightXPx / width) * deltaLon;
      const latBR = fullExtent[3] - (visibleBottomYPx / height) * deltaLat;

      // Add top strap with a darker gray background
      pdf.setFillColor(255, 255, 255); // Darker gray background
      pdf.rect(0, 0, dim[0], topStrapHeight, "F"); // Filled rectangle

      // Add a bottom border to the header strap
      // pdf.setDrawColor(0, 0, 0); // Black border
      // pdf.setLineWidth(0.3);
      // pdf.line(0, topStrapHeight, dim[0], topStrapHeight); // Bottom line of the strap

      // Fill the outer area (outside the boundary) with light gray
      pdf.setFillColor(255, 255, 255); // Light gray for the outer frame
      // Top strip (above the boundary)
      pdf.rect(0, 0, dim[0], boundaryOffset, "F");
      // Bottom strip (below the boundary)
      pdf.rect(0, dim[1] - boundaryOffset, dim[0], boundaryOffset, "F");
      // Left strip (left of the boundary, excluding top and bottom strips)
      pdf.rect(
        0,
        boundaryOffset,
        boundaryOffset,
        dim[1] - 2 * boundaryOffset,
        "F"
      );
      // Right strip (right of the boundary, excluding top and bottom strips)
      pdf.rect(
        dim[0] - boundaryOffset,
        boundaryOffset,
        boundaryOffset,
        dim[1] - 2 * boundaryOffset,
        "F"
      );

      // Add single inner boundary line
      pdf.setDrawColor(0, 102, 204); // Dark gray for boundary line
      pdf.setLineWidth(0.5); // Thickness of the inner line
      pdf.rect(
        boundaryOffset,
        boundaryOffset,
        dim[0] - 2 * boundaryOffset,
        dim[1] - 2 * boundaryOffset
      ); // Inner border

      // Add header
      pdf.setFont("Helvetica", "bold"); // Professional font
      pdf.setFontSize(16);
      pdf.setTextColor(0, 71, 171); // Black text
      pdf.text("ASSAM STATE SPACE APPLICATION CENTRE", dim[0] / 2, 15, {
        align: "center",
      });
      pdf.setFont("Helvetica", "normal");

      pdf.setFontSize(13);
      pdf.setTextColor(0, 71, 171); // Black text
      pdf.text(
        "Department of Science and Technology, Govt. of Assam",
        dim[0] / 2,
        22,
        { align: "center" }
      );

      // Add subheading
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text("GS Rd, Bigyan Bhawan, Guwahati, Assam 781005", dim[0] / 2, 28, {
        align: "center",
      });
      pdf.setFontSize(12);
      pdf.text(
        "www.assamsdr.assac.in | www.assac.assam.gov.in",
        dim[0] / 2,
        34,
        { align: "center" }
      );
      const imageSize = 15;
      const margin = 10;
      const x = dim[0] - imageSize - margin;
      const y = margin;

      pdf.addImage(compass, "PNG", x, y, imageSize, imageSize);

      const logoimageSize = 20;
      const logomargin = 20;
      const logoy = margin;

      pdf.addImage(
        assaclogo,
        "PNG",
        margin,
        logoy,
        logoimageSize,
        logoimageSize
      );

      // render legend

      if (legendImages.length > 0) {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        const boxSize = 5;
        const lineSpacing = 7; // Reduced line spacing
        const legendHeight = legendImages.length * lineSpacing + 5; // Extra for 'Legend:' label
        const legendWidth = 50; // Adjust as needed

        const padding = 4;

        const legendStartX = dim[0] - legendWidth - 10; // 10mm margin from right
        const legendStartY = dim[1] - legendHeight - 5; // 10mm margin from bottom

        // Draw white background
        pdf.setFillColor(255, 255, 255); // White
        pdf.rect(
          legendStartX - padding,
          legendStartY - padding - 5, // Shift up to include "Legend:" text
          legendWidth + padding * 2,
          legendHeight + padding * 2,
          "F"
        );

        // ✅ Draw border (stroke) around the legend box
        pdf.setDrawColor(0, 102, 204); // Black border
        pdf.rect(
          legendStartX - padding,
          legendStartY - padding - 5,
          legendWidth + padding * 2,
          legendHeight + padding * 2,
          "S" // Stroke only
        );

        // Draw legend label
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Legend:", legendStartX, legendStartY);

        // Draw legend items
        legendImages.forEach((item, index) => {
          const x = legendStartX;
          const y = legendStartY + 5 + index * lineSpacing;

          if (item.base64) {
            pdf.addImage(item.base64, "PNG", x, y, boxSize, boxSize);
          } else {
            pdf.setFillColor(0, 0, 255);
            pdf.setDrawColor(0, 0, 255);
            pdf.rect(x, y, boxSize, boxSize, "FD");
          }

          pdf.text(item.name, x + boxSize + 2, y + 4);
        });
      } else {
        console.warn("No legend images to render in PDF");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Legend: None", dim[0] - 60, dim[1] - 10);
      }

      // Add coordinates at top-left and bottom-right, skipping header and boundary
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const coordMargin = 5;
      const topLeftX = boundaryOffset ;
      const topLeftY = topStrapHeight ;
      const bottomRightX = dim[0] - boundaryOffset ;
      const bottomRightY = dim[1] - .5;

      // Top-left: lonTL, latTL
      const topLeftLon = formatCoordinate(lonTL, true);
      const topLeftLat = formatCoordinate(latTL, false);
      pdf.text(`${topLeftLon}, ${topLeftLat}`, topLeftX, topLeftY, {
        maxWidth: 80,
      });

      // Bottom-right: lonBR, latBR
      const bottomRightLon = formatCoordinate(lonBR, true);
      const bottomRightLat = formatCoordinate(latBR, false);
      pdf.text(
        `${bottomRightLon}, ${bottomRightLat}`,
        bottomRightX,
        bottomRightY,
        { align: "right", maxWidth: 80 }
      );

      pdf.save("assam-map.pdf");

      // Reset original map size and resolution
      map.getView().setResolution(viewResolution);
      scaleLine.setDpi(undefined);
      map.getTargetElement().style.width = "";
      map.getTargetElement().style.height = "";
      map.updateSize();
      exportButton.disabled = false;
      document.body.style.cursor = "auto";
    });
  });
}

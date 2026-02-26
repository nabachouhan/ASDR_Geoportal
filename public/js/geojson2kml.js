import tokml from "@maphubs/tokml";

export function geojson2kml() {
  const input = document.getElementById("geojson2kmlFileInput");
  const button = document.getElementById("geojson2kmlDownload");
  let geojsonData = null;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        geojsonData = JSON.parse(event.target.result);
        alert("GeoJSON loaded successfully!");
      } catch (err) {
        alert("Invalid GeoJSON file.");
      }
    };
    reader.readAsText(file);
  });

  button.addEventListener("click", () => {
    if (!geojsonData) {
      alert("Please upload a valid GeoJSON file first.");
      return;
    }

    // Convert using tokml
    const kmlString = tokml(geojsonData, {
      name: "name",
      description: "description",
      documentName: "My Converted KML",
      documentDescription: "Converted from GeoJSON using tokml",
    });

    // Download the KML file
    const blob = new Blob([kmlString], {
      type: "application/vnd.google-earth.kml+xml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.kml";
    a.click();
    URL.revokeObjectURL(url);
  });
}

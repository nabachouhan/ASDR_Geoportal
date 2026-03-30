export function displayDataInTableWithoutGraph(features) {
    console.log(features);
  
    const villageDetails = document.getElementById("villageDetails");
    document.getElementById("info-popup-head").innerHTML = "";
  
    const layer = document.getElementById("query-file").value;
    const query = document.getElementById("query-textbox").value;
  
    // Clear previous content
    villageDetails.innerHTML = "";
  
    // Create the canvas element for the chart
    const infoChart = document.getElementById("infoChart");
    infoChart.innerHTML = "";
  
    let featureCount = 0;
  
    // Create a table element
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.border = "1px solid #ddd";
  
    // Create table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
  
    // Get feature properties and filter out 'geometry'
    const properties = Object.keys(features[0]).filter(
      (prop) => prop !== "geometry"
    );
  
    properties.forEach((property) => {
      const th = document.createElement("th");
      th.style.border = "1px solid black";
      th.style.padding = "5px";
  
      th.textContent = property; // Set header cell text
      headerRow.appendChild(th);
    });
  
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    // Create table body
    const tbody = document.createElement("tbody");
  
    features.forEach((feature) => {
      featureCount++;
      const row = document.createElement("tr");
      properties.forEach((property) => {
        const td = document.createElement("td");
        td.style.border = "1px solid black";
        td.style.padding = "5px";
  
        td.textContent = feature[property]; // Set cell text
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
  
    table.appendChild(tbody);
  
    // Append the table to the villageDetails div
    const FeaturesHead = document.getElementById("info-popup-head");
    FeaturesHead.innerHTML = "";
  
    const featureCountHeader = document.createElement("h3");
    featureCountHeader.textContent = `Number of features Found: ${featureCount}`;
    featureCountHeader.style.paddingX = "10px";
  
    FeaturesHead.appendChild(featureCountHeader);
  
    const featureFileHeader = document.createElement("h5");
    featureFileHeader.textContent = `File: ${layer}`;
    featureFileHeader.style.paddingX = "10px";
  
    FeaturesHead.appendChild(featureFileHeader);
  
    const featureQueryHeader = document.createElement("h5");
    featureQueryHeader.textContent = `Query: ${query}`;
    featureQueryHeader.style.paddingX = "10px";
  
    FeaturesHead.appendChild(featureQueryHeader);
  
    villageDetails.appendChild(table);
  
    const infopopup = document.getElementById("villageInfo");
    infopopup.style.display = "block";
  }
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

// Initialize dropdown states
export let selectedCategoryForDistrictwise = '';
export let selectedFileForDistrictwise = '';
export let selectedDistrictForDistrictwise = '';
export let selectedCircleForDistrictwise = '';
export let selectedBlocktForDistrictwise = '';
export let selectedVillagetForDistrictwise = '';
export let selectedCategoryFieldForDistrictwise = '';
export let administrative_level = "";
export let administrative_level_value = "";

let analysisWmsLayer = null;



export async function withinDistrictFilteronload() {
  console.log("added.....................");
  const categoryInput = document.getElementById('districtwise-theme');
  const categoryOptions = document.getElementById('districtwise-themeOptions');
  const fileInput = document.getElementById('districtwise-filename');
  const fileOptions = document.getElementById('districtwiseFileOptions');
  const attributefield = document.getElementById('sidebar-filter-attribute');


  // Fetch and populate categories
  async function loadCategoriesForDistrictwise() {
    console.log("loadCategoriesForDistrictwise.");

    try {
      const response = await fetch('http://localhost:3010/api/themes');
      console.log("responseresponse.");

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const themes = await response.json();
      console.log('Fetched themes:', themes); // Debug log
      categoryOptions.innerHTML = '<div class="dropdown-option" data-value="">Select...</div>';
      themes.forEach(theme => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.value = theme;
        option.textContent = theme;
        categoryOptions.appendChild(option);
      });
      // Rebind event listeners for options
      bindOptionListeners(categoryOptions, categoryInput, (value) => {
        selectedCategoryForDistrictwise = value;
        fileInput.value = '';
        selectedFileForDistrictwise = '';

        if (value) loadFilesForDistrictwise(value);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  // Fetch and populate files for a category
  async function loadFilesForDistrictwise(theme) {
    try {
      const response = await fetch(`http://localhost:3010/api/files/${theme}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const files = await response.json();
      console.log('Fetched files for theme', theme, ':', files); // Debug log
      fileOptions.innerHTML = '';
      files.forEach(file => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.value = file;
        option.textContent = file;
        fileOptions.appendChild(option);
      });
      // Rebind event listeners for options
      bindOptionListeners(fileOptions, fileInput, (value) => {
        selectedFileForDistrictwise = value;
        // attributefield.innerHTML = '<option value="">-- Select --</option>';
        console.log("selectedFileForDistrictwise");
        console.log(selectedFileForDistrictwise);
        console.log("selectedFileForDistrictwise");
        console.log(selectedCategoryForDistrictwise);


        if (value && selectedCategoryForDistrictwise) loadAttributes(selectedCategoryForDistrictwise, value);
      });
    } catch (err) {
      console.error('Error loading files:', err);
    }
  }

  // Toggle dropdown visibility
  function toggleDropdown(input, options) {
    const isVisible = options.style.display === 'block';
    options.style.display = isVisible ? 'none' : 'block';
    input.readOnly = isVisible; // Allow typing only when dropdown is open
    console.log('Toggled dropdown:', input.id, 'Visible:', !isVisible); // Debug log
  }

  // Bind click event listeners to dropdown options
  function bindOptionListeners(optionsContainer, input, callback) {
    const options = optionsContainer.querySelectorAll('.dropdown-option');
    options.forEach(option => {
      // Remove existing listeners to prevent duplicates
      option.removeEventListener('click', option.clickHandler);
      option.clickHandler = () => {
        input.value = option.textContent;
        optionsContainer.style.display = 'none';
        input.readOnly = true;
        console.log('Selected option:', option.textContent, 'Value:', option.dataset.value); // Debug log
        callback(option.dataset.value);
      };
      option.addEventListener('click', option.clickHandler);
    });
  }

  // Fetch and populate attributes for a file
  async function loadAttributes(theme, fileName) {
    try {
      const response = await fetch(`http://localhost:3010/api/attributes/${theme}/${fileName}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const attributes = await response.json();
      console.log('Fetched attributes for file', fileName, ':', attributes); // Debug log
      attributefield.innerHTML = '<option value="">-- Select --</option>';
      attributes.forEach(attr => {
        const option = document.createElement('option');
        option.value = attr;
        option.textContent = attr;
        attributefield.appendChild(option);

      });
    } catch (err) {
      console.error('Error loading attributes:', err);
    }
  }

  // Category dropdown
  categoryInput.addEventListener('click', () => {
    toggleDropdown(categoryInput, categoryOptions);
  });

  // File dropdown
  fileInput.addEventListener('click', () => {
    if (selectedCategoryForDistrictwise) {
      toggleDropdown(fileInput, fileOptions);
    } else {
      console.log('No category selected, file dropdown disabled'); // Debug log
    }
  });


  // cat input
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


  // Clear button
  //   clearButton.addEventListener('click', () => {

  //     document.getElementById('queryTool-queryInput').value = '';
  //     // document.getElementById('queryTool-zoom').value = '12';
  //     console.log('Form cleared'); // Debug log
  //   });

  // Initialize categories on load
  console.log('Loading categories...'); // Debug log
  await loadCategoriesForDistrictwise();
}



export async function withinDistrictFilteronload2() {
  console.log("withinDistrictFilteronload2 - initialising hierarchy...");

  const districtInput  = document.getElementById('sidebar-filter-district');
  const districtOptions = document.getElementById('sidebar-filter-district-Options');
  const circleInput   = document.getElementById('sidebar-filter-circle');
  const circleOptions  = document.getElementById('sidebar-filter-circle-Options');
  const blockInput    = document.getElementById('sidebar-filter-block');
  const blockOptions   = document.getElementById('sidebar-filter-block-Options');
  const villageInput  = document.getElementById('sidebar-filter-village');
  const villageOptions = document.getElementById('sidebar-filter-village-Options');

  // ── helpers ──────────────────────────────────────────────────────────────
  function toggleDropdown(input, options) {
    const isVisible = options.style.display === 'block';
    options.style.display = isVisible ? 'none' : 'block';
    input.readOnly = isVisible;
  }

  function clearDropdown(input, optionsEl) {
    input.value = '';
    optionsEl.innerHTML = '';
    optionsEl.style.display = 'none';
  }

  function bindOptionListeners(optionsContainer, input, callback) {
    const options = optionsContainer.querySelectorAll('.dropdown-option');
    options.forEach(option => {
      option.removeEventListener('click', option.clickHandler);
      option.clickHandler = () => {
        input.value = option.textContent;
        optionsContainer.style.display = 'none';
        input.readOnly = true;
        callback(option.dataset.value);
      };
      option.addEventListener('click', option.clickHandler);
    });
  }

  function bindSearchFilter(input, optionsEl) {
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase();
      optionsEl.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.style.display = opt.textContent.toLowerCase().includes(query) ? 'block' : 'none';
      });
      optionsEl.style.display = 'block';
    });
  }

  function populateDropdown(optionsEl, input, items, callback) {
    optionsEl.innerHTML = '';
    items.forEach(item => {
      const opt = document.createElement('div');
      opt.className = 'dropdown-option';
      opt.dataset.value = item;
      opt.textContent = item;
      optionsEl.appendChild(opt);
    });
    bindOptionListeners(optionsEl, input, callback);
  }

  // ── API loaders ──────────────────────────────────────────────────────────

  async function loadDistrict() {
    try {
      const res = await fetch('http://localhost:3010/api/getdistricts');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const districts = await res.json();
      populateDropdown(districtOptions, districtInput, districts, (value) => {
        // Reset all downstream levels
        selectedDistrictForDistrictwise = value;
        selectedCircleForDistrictwise   = '';
        selectedBlocktForDistrictwise   = '';
        selectedVillagetForDistrictwise  = '';
        clearDropdown(circleInput, circleOptions);
        clearDropdown(blockInput, blockOptions);
        clearDropdown(villageInput, villageOptions);

        if (value) {
          // Load circles and blocks simultaneously on district select
          loadCircles(value);
          loadBlocks(value);
        }
      });
    } catch (err) {
      console.error('Error loading districts:', err);
    }
  }

  async function loadCircles(district) {
    try {
      const res = await fetch(`http://localhost:3010/api/getCircles/${district}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const circles = await res.json();
      populateDropdown(circleOptions, circleInput, circles, (value) => {
        selectedCircleForDistrictwise   = value;
        selectedBlocktForDistrictwise   = '';
        selectedVillagetForDistrictwise  = '';
        clearDropdown(villageInput, villageOptions);

        // Circle selected → load villages scoped to this circle
        if (value) loadVillagesByCircle(value);
      });
    } catch (err) {
      console.error('Error loading circles:', err);
    }
  }

  async function loadBlocks(district) {
    try {
      const res = await fetch(`http://localhost:3010/api/getblocks/${district}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const blocks = await res.json();
      populateDropdown(blockOptions, blockInput, blocks, (value) => {
        selectedBlocktForDistrictwise   = value;
        selectedVillagetForDistrictwise  = '';
        clearDropdown(villageInput, villageOptions);

        if (value) {
          // If a circle is already selected, load villages scoped to that circle
          // Otherwise load villages by district + block
          if (selectedCircleForDistrictwise) {
            loadVillagesByCircle(selectedCircleForDistrictwise);
          } else {
            loadVillagesByBlock(selectedDistrictForDistrictwise, value);
          }
        }
      });
    } catch (err) {
      console.error('Error loading blocks:', err);
    }
  }

  // Villages filtered by circle (API: getvillages/:district/:circle)
  async function loadVillagesByCircle(circle) {
    try {
      const res = await fetch(`http://localhost:3010/api/getvillages/${selectedDistrictForDistrictwise}/${circle}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const villages = await res.json();
      populateDropdown(villageOptions, villageInput, villages, (value) => {
        selectedVillagetForDistrictwise = value;
      });
    } catch (err) {
      console.error('Error loading villages by circle:', err);
    }
  }

  // Villages filtered by district + block (fallback when no circle chosen)
  async function loadVillagesByBlock(district, block) {
    try {
      const res = await fetch(`http://localhost:3010/api/getvillages/${district}/${block}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const villages = await res.json();
      populateDropdown(villageOptions, villageInput, villages, (value) => {
        selectedVillagetForDistrictwise = value;
      });
    } catch (err) {
      console.error('Error loading villages by block:', err);
    }
  }

  // ── click-to-open handlers ────────────────────────────────────────────────

  districtInput.addEventListener('click', () => toggleDropdown(districtInput, districtOptions));

  circleInput.addEventListener('click', () => {
    if (selectedDistrictForDistrictwise) toggleDropdown(circleInput, circleOptions);
  });

  blockInput.addEventListener('click', () => {
    if (selectedDistrictForDistrictwise) toggleDropdown(blockInput, blockOptions);
  });

  villageInput.addEventListener('click', () => {
    if (selectedCircleForDistrictwise || selectedBlocktForDistrictwise) {
      toggleDropdown(villageInput, villageOptions);
    }
  });

  // ── search/filter listeners ───────────────────────────────────────────────
  bindSearchFilter(districtInput, districtOptions);
  bindSearchFilter(circleInput, circleOptions);
  bindSearchFilter(blockInput, blockOptions);
  bindSearchFilter(villageInput, villageOptions);

  // ── clear button ─────────────────────────────────────────────────────────
  const clearBtn = document.getElementById('clearBoundaryLevelBufferFilter');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      selectedDistrictForDistrictwise  = '';
      selectedCircleForDistrictwise    = '';
      selectedBlocktForDistrictwise    = '';
      selectedVillagetForDistrictwise   = '';
      clearDropdown(districtInput, districtOptions);
      clearDropdown(circleInput, circleOptions);
      clearDropdown(blockInput, blockOptions);
      clearDropdown(villageInput, villageOptions);
    });
  }

  // ── bootstrap ─────────────────────────────────────────────────────────────
  console.log('Loading districts...');
  await loadDistrict();
}


export function displayBoundaryLevelResults(result, map) {
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
          }
        }
      }
    });
  };

  let htmlTable = '';

  if (result.geometryType === 'Point') {
    if (result.categoryCounts && Object.keys(result.categoryCounts).length > 0) {
      createChart(Object.keys(result.categoryCounts), Object.values(result.categoryCounts), 'Features by Category');
    }
    const buffermessage = result.buffermessage ? result.buffermessage : '';
    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Buffer Query:</strong> ${buffermessage}</p>`;

  } else if (result.geometryType === 'LineString' || result.geometryType === 'MultiLineString') {
    const buffermessage = result.buffermessage ? result.buffermessage : '';

    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Buffer Query:</strong> ${buffermessage}</p>`;
    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Covered Length:</strong> ${result.totalLength ? result.totalLength.toFixed(2) : 0} meters</p>`;
    if (result.categoryLengths && Object.keys(result.categoryLengths).length > 0) {
      createChart(Object.keys(result.categoryLengths), Object.values(result.categoryLengths), 'Length by Category');
    }
  } else if (result.geometryType === 'Polygon' || result.geometryType === 'MultiPolygon') {
    const totalArea = result.totalArea ? result.totalArea.toFixed(2) : 0;
    const bufferArea = result.bufferArea ? result.bufferArea.toFixed(2) : 0;
    const buffermessage = result.buffermessage ? result.buffermessage : '';

    const percentage = result.percentageCovered || 0;
    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Buffer Query:</strong> ${buffermessage}</p>`;
    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Buffer area &nbsp;&nbsp; :</strong>${bufferArea} sq meters</p>`;
    htmlHead += `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #444;"><strong>Covered Area:</strong>${totalArea} sq meters</p>`;
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
      // Safely apply features to a global bufferLayer if it exists, otherwise avoid crashing
      if (window.bufferLayer && window.Style && window.Fill && window.Stroke) {
        feature.setStyle(new window.Style({
          fill: new window.Fill({ color: 'rgba(0, 255, 0, 0.2)' }),
          stroke: new window.Stroke({ color: '#00FF00', width: 2 }),
          zIndex: 8
        }));
        window.bufferLayer.getSource().addFeature(feature);
      }
    });
  }
}

export async function performBoundaryLevelBufferAnalysis(map) {
  if (!selectedCategoryForDistrictwise || !selectedFileForDistrictwise) {
    alert("Please select a theme and layer.");
    return;
  }

  if (!selectedDistrictForDistrictwise) {
    alert("Please select a atleast District.");
    return;
  }

  try {
    selectedCategoryFieldForDistrictwise = document.getElementById("sidebar-filter-attribute").value;

    const response = await fetch('http://localhost:3010/api/within-admin-bound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: selectedCategoryForDistrictwise,
        table: selectedFileForDistrictwise,
        district: selectedDistrictForDistrictwise,
        circle: selectedCircleForDistrictwise,
        block: selectedBlocktForDistrictwise,
        village: selectedVillagetForDistrictwise,
        category: selectedCategoryFieldForDistrictwise
      })
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const result = await response.json();
    console.log('Buffer analysis result:', result);

    // Remove existing layer
    if (analysisWmsLayer) {
      map.removeLayer(analysisWmsLayer);
    }

    // Get map extent for BBOX
    const extent = map.getView().calculateExtent(map.getSize());

    if (selectedVillagetForDistrictwise) {
      administrative_level = "village"
      administrative_level_value = selectedVillagetForDistrictwise

    }
    else if (selectedBlocktForDistrictwise) {
      administrative_level = "block"
      administrative_level_value = selectedBlocktForDistrictwise
    }
    else if (selectedCircleForDistrictwise) {
      administrative_level = "circle"
      administrative_level_value = selectedCircleForDistrictwise
    }
    else if (selectedDistrictForDistrictwise) {
      administrative_level = "district"
      administrative_level_value = selectedDistrictForDistrictwise
    }

    analysisWmsLayer = new TileLayer({
      source: new TileWMS({
        url: "http://localhost:3010/api/clip-wms",
        crossOrigin: "anonymous",   // IMPORTANT

        params: {
          LAYERS: selectedFileForDistrictwise,
          boundaryLevel: administrative_level,
          boundaryId: administrative_level_value,
          inputmode: 'reference'
        },
        serverType: "geoserver"
      }),
      preload: Infinity
    });


    // Add layer to map
    map.addLayer(analysisWmsLayer);

    displayBoundaryLevelResults(result, map);
  } catch (err) {
    console.error('Error performing buffer analysis:', err);

    const resultsChartDiv = document.getElementById('buffer-chartdiv');
    const resultsTable = document.getElementById('buffer-table');

    resultsChartDiv.style.display = 'none';
    resultsTable.style.display = 'none';

    document.getElementById('buffer-head').innerHTML = 'Error performing buffer analysis.';
  }
}
// Initialize dropdown states
export let selectedCategoryForDistrictwise = '';
export let selectedFileForDistrictwise = '';
export let selectedDistrictForDistrictwise = '';
export let selectedBlocktForDistrictwise = '';
export let selectedVillagetForDistrictwise = '';
export let selectedCategoryFieldForDistrictwise = '';



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
    console.log("added.....................");
  const districtInput = document.getElementById('sidebar-filter-district');
  const districtOptions = document.getElementById('sidebar-filter-district-Options');
  const blockInput = document.getElementById('sidebar-filter-block');
  const blockOptions = document.getElementById("sidebar-filter-block-Options");
  const villageInput = document.getElementById("sidebar-filter-village");
  const villageOptions = document.getElementById("sidebar-filter-village-Options");

  // Fetch and populate categories
  async function loadDistrict() {
    console.log("loadCategoriesForDistrictwise.");

    try {
      const response = await fetch('http://localhost:3010/api/getdistricts');
          console.log("responseresponse.");

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const Districts = await response.json();
      // console.log('Fetched themes:', themes); // Debug log
      districtOptions.innerHTML = '<div class="dropdown-option" data-value="">Select...</div>';
      Districts.forEach(district => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.value = district;
        option.textContent = district;
        districtOptions.appendChild(option);
      });
      // Rebind event listeners for options
      bindOptionListeners(districtOptions, districtInput, (value) => {
        // selectedCategoryForDistrictwise = value;
        blockInput.value = '';
        villageInput.value='';

        selectedDistrictForDistrictwise = value;

        if (value) loadBlocks(value);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  // Fetch and populate files for a category
  async function loadBlocks(dist) {
    try {
      const response = await fetch(`http://localhost:3010/api/getdistricts/${dist}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const blocks = await response.json();
      console.log('Fetched blocks for theme', dist, ':', blocks); 
      blockOptions.innerHTML = '';
      blocks.forEach(block => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.value = block;
        option.textContent = block;
        blockOptions.appendChild(option);
      });
      // Rebind event listeners for options
      bindOptionListeners(blockOptions, blockInput, (value) => {
        villageInput.value='';
        selectedBlocktForDistrictwise= value;

        if (value) loadVillages( value);
      });
    } catch (err) {
      console.error('Error loading files:', err);
    }
  }

    // Fetch and populate files for a category
  async function loadVillages(block) {
    try {
      const response = await fetch(`http://localhost:3010/api/getdistricts/${selectedDistrictForDistrictwise}/${block}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const villages = await response.json();
      console.log('Fetched blocks for theme', block, ':', villages); 
      villageOptions.innerHTML = '';
      villages.forEach(village => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.value = village;
        option.textContent = village;
        villageOptions.appendChild(option);
      });
      // Rebind event listeners for options
      bindOptionListeners(villageOptions, villageInput, (value) => {
        selectedVillagetForDistrictwise = value;
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


    // Category dropdown
    districtInput.addEventListener('click', () => {
      selectedBlocktForDistrictwise = '';
selectedVillagetForDistrictwise = '';
      toggleDropdown(districtInput, districtOptions);
    });
 
    // File dropdown
    blockInput.addEventListener('click', () => {
selectedVillagetForDistrictwise = '';
      if (selectedDistrictForDistrictwise) {
        toggleDropdown(blockInput, blockOptions);
      } else {
        console.log('No category selected, file dropdown disabled'); // Debug log
      }
    });

        // village dropdown
    villageInput.addEventListener('click', () => {
      if (selectedBlocktForDistrictwise) {
        toggleDropdown(villageInput, villageOptions);
      } else {
        console.log('No category selected, file dropdown disabled'); // Debug log
      }
    });


  // cat input
    districtInput.addEventListener('input', () => {
  const query = districtInput.value.toLowerCase();
  const options = districtOptions.querySelectorAll('.dropdown-option');

  options.forEach(option => {
    const matches = option.textContent.toLowerCase().includes(query);
    option.style.display = matches ? 'block' : 'none';
  });

  districtOptions.style.display = 'block';
});

// file input


    blockInput.addEventListener('input', () => {
  const query = blockInput.value.toLowerCase();
  const options = blockOptions.querySelectorAll('.dropdown-option');

  options.forEach(option => {
    const matches = option.textContent.toLowerCase().includes(query);
    option.style.display = matches ? 'block' : 'none';
  });

  blockOptions.style.display = 'block';
});


// village

    villageInput.addEventListener('input', () => {
  const query = villageInput.value.toLowerCase();
  const options = villageOptions.querySelectorAll('.dropdown-option');

  options.forEach(option => {
    const matches = option.textContent.toLowerCase().includes(query);
    option.style.display = matches ? 'block' : 'none';
  });

  villageOptions.style.display = 'block';
});



  // Clear button
//   clearButton.addEventListener('click', () => {

//     document.getElementById('queryTool-queryInput').value = '';
//     // document.getElementById('queryTool-zoom').value = '12';
//     console.log('Form cleared'); // Debug log
//   });

  // Initialize categories on load
  console.log('Loading categories...'); // Debug log
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
      feature.setStyle(new Style({
        fill: new Fill({ color: 'rgba(0, 255, 0, 0.2)' }),
        stroke: new Stroke({ color: '#00FF00', width: 2 }),
        zIndex: 8
      }));
      bufferLayer.getSource().addFeature(feature);
    });
  }
}

export  async function performBoundaryLevelBufferAnalysis( map) {
    if (!selectedCategoryForDistrictwise || !selectedFileForDistrictwise) {
      alert("Please select a theme and layer.");
      return;
    }

    if (!selectedDistrictForDistrictwise ) {
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
          block: selectedBlocktForDistrictwise,
          village: selectedVillagetForDistrictwise,
          category:selectedCategoryFieldForDistrictwise
        })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      console.log('Buffer analysis result:', result);
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
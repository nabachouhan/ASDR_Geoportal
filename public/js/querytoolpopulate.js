// Initialize state
export let selectedCategory = '';
export let selectedFile = '';

export let queryObject = {
  filters: [],     // [{ field, operator, value }]
  connectors: []   // ["AND", "OR"] — length = filters.length - 1
};

export let historyStack = [];

export async function querytooloptionload() {
  const categoryInput = document.getElementById('queryTool-category');
  const categoryOptions = document.getElementById('categoryOptions');
  const fileInput = document.getElementById('queryTool-file');
  const fileOptions = document.getElementById('fileOptions');
  const labelSelect = document.getElementById('queryTool-label');
  const leftSelect = document.getElementById('queryTool-left-select');
  const rightSelect = document.getElementById('queryTool-right-select');
  const queryInput = document.getElementById('queryTool-queryInput');
  const clearButton = document.querySelector('#queryTool-clear');
  const undoButton = document.getElementById('queryTool-undo');

  // Helper: Deep clone for history
  function saveHistory() {
    historyStack.push(JSON.parse(JSON.stringify(queryObject)));
  }

  // Updated render function
  function renderQueryPreview() {
    let parts = [];

    queryObject.filters.forEach((filter, index) => {
      if (index > 0 && queryObject.connectors[index - 1]) {
        parts.push(queryObject.connectors[index - 1]);
      }

      // Only add filter if it has field and operator and value
      if (filter.field && filter.operator && filter.value !== null) {
        parts.push(`${filter.field} ${filter.operator} '${filter.value}'`);
      } else if (filter.field && filter.operator) {
        parts.push(`${filter.field} ${filter.operator}`);
      } else if (filter.field) {
        parts.push(`${filter.field}`);
      }
    });

    queryInput.value = parts.join(' ');
  }

  // NEW: Parse textarea back to queryObject
  function parseQueryToObject(queryStr) {
    if (!queryStr.trim()) {
      return { filters: [], connectors: [] };
    }

    const tokens = queryStr.split(/\s+/).filter(t => t.trim() !== '');
    const newFilters = [];
    const newConnectors = [];
    let i = 0;

    while (i < tokens.length) {
      // Expect field
      const field = tokens[i];
      if (!field || field.match(/['"]/)) {
        i++;
        continue;
      }
      i++;

      // Expect operator (handle multi-word like NOT LIKE)
      let operator = tokens[i] || '';
      let opStart = i;
      i++;
      if (operator.toUpperCase() === 'NOT' && i < tokens.length && tokens[i].toUpperCase() === 'LIKE') {
        operator = 'NOT LIKE';
        i++; // skip LIKE
      }

      if (!operator || ['AND', 'OR'].includes(operator.toUpperCase())) {
        i = opStart + 1; // backtrack
        continue;
      }

      // Expect quoted value
      let valueToken = tokens[i] || '';
      if (!valueToken.startsWith("'") || !valueToken.endsWith("'")) {
        i++;
        continue;
      }
      const value = valueToken.slice(1, -1); // remove quotes; assume no escaped quotes for simplicity

      newFilters.push({ field, operator, value });
      i++;

      // Expect connector or end
      if (i < tokens.length) {
        const next = tokens[i].toUpperCase();
        if (next === 'AND' || next === 'OR') {
          newConnectors.push(next);
          i++;
        }
      }
    }

    // Ensure connectors length = filters.length - 1
    if (newConnectors.length >= newFilters.length) {
      newConnectors.splice(newFilters.length - 1);
    }

    return { filters: newFilters, connectors: newConnectors };
  }

  // Load categories, files, attributes (unchanged, just minor cleanup)
  async function loadCategories() {
    try {
      const response = await fetch('http://localhost:3010/api/themes');
      const themes = await response.json();
      categoryOptions.innerHTML = '<div class="dropdown-option" data-value="">Select...</div>';
      themes.forEach(theme => {
        const div = document.createElement('div');
        div.className = 'dropdown-option';
        div.dataset.value = theme;
        div.textContent = theme;
        categoryOptions.appendChild(div);
      });
      bindOptionListeners(categoryOptions, categoryInput, (value) => {
        selectedCategory = value;
        selectedFile = '';
        fileInput.value = '';
        clearForm();
        if (value) loadFiles(value);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function loadFiles(theme) {
    try {
      const response = await fetch(`http://localhost:3010/api/files/${theme}`);
      const files = await response.json();
      fileOptions.innerHTML = '';
      files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'dropdown-option';
        div.dataset.value = file;
        div.textContent = file;
        fileOptions.appendChild(div);
      });
      bindOptionListeners(fileOptions, fileInput, (value) => {
        selectedFile = value;
        clearForm();
        if (value && selectedCategory) loadAttributes(selectedCategory, value);
      });
    } catch (err) {
      console.error('Error loading files:', err);
    }
  }

  async function loadAttributes(theme, fileName) {
    try {
      const response = await fetch(`http://localhost:3010/api/attributes/${theme}/${fileName}`);
      const attributes = await response.json();
      labelSelect.innerHTML = '<option value="">-- Select --</option>';
      leftSelect.innerHTML = '';
      rightSelect.innerHTML = '';

      attributes.forEach(attr => {
        // Label select
        const opt1 = document.createElement('option');
        opt1.value = attr;
        opt1.textContent = attr;
        labelSelect.appendChild(opt1);

        // Left select (fields)
        const opt2 = document.createElement('option');
        opt2.value = attr;
        opt2.textContent = attr;
        leftSelect.appendChild(opt2);
      });
    } catch (err) {
      console.error('Error loading attributes:', err);
    }
  }

  async function loadValues(theme, fileName, attribute) {
    try {
      const response = await fetch(`http://localhost:3010/api/values/${theme}/${fileName}/${attribute}`);
      const values = await response.json();
      rightSelect.innerHTML = '';
      values.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        rightSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading values:', err);
    }
  }

  function toggleDropdown(input, options) {
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  }

  function bindOptionListeners(container, input, callback) {
    container.querySelectorAll('.dropdown-option').forEach(opt => {
      opt.onclick = () => {
        input.value = opt.textContent;
        container.style.display = 'none';
        callback(opt.dataset.value);
      };
    });
  }

  function clearForm() {
    labelSelect.innerHTML = '<option value="">-- Select --</option>';
    leftSelect.innerHTML = '';
    rightSelect.innerHTML = '';
    queryInput.value = '';
    queryObject = { filters: [], connectors: [] };
    historyStack = [];
    renderQueryPreview();
  }

  // Event Listeners

  categoryInput.addEventListener('click', () => toggleDropdown(categoryInput, categoryOptions));
  fileInput.addEventListener('click', () => selectedCategory && toggleDropdown(fileInput, fileOptions));

  // Select field → start new filter or update current
  leftSelect.addEventListener('click', async (e) => {
    const field = e.target.value;
    if (!field) return;

    saveHistory();

    const lastFilter = queryObject.filters[queryObject.filters.length - 1];

    if (!lastFilter || (lastFilter.operator && lastFilter.value !== null)) {
      // Start new filter
      queryObject.filters.push({ field, operator: null, value: null });
    } else {
      // Update current incomplete filter
      lastFilter.field = field;
    }

    await loadValues(selectedCategory, selectedFile, field);
    renderQueryPreview();
  });

  // Operator buttons (click)
  document.querySelectorAll('#queryTool-button-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      saveHistory();

      const lastFilter = queryObject.filters[queryObject.filters.length - 1];

      if (["AND", "OR"].includes(text)) {
        // Only allow connector if we have at least one complete filter
        if (queryObject.filters.length > 0 && lastFilter && lastFilter.field && lastFilter.operator && lastFilter.value !== null) {
          queryObject.connectors.push(text);
          // Auto-start next filter placeholder
          queryObject.filters.push({ field: null, operator: null, value: null });
        }
      } else {
        // Comparison operator
        if (lastFilter && lastFilter.field) {
          lastFilter.operator = text;
        }
      }

      renderQueryPreview();
    });
  });

  // Right select: assign value on click
  rightSelect.addEventListener('click', (e) => {
    const value = e.target.value;
    if (value) {
      saveHistory();
      const lastFilter = queryObject.filters[queryObject.filters.length - 1];
      if (lastFilter && lastFilter.field && lastFilter.operator) {
        lastFilter.value = value;
      }
      renderQueryPreview();
    }
    console.log(queryObject);
  });

  // NEW: Listen for changes in query preview textarea
  let parseTimeout;
  queryInput.addEventListener('input', (e) => {
    clearTimeout(parseTimeout);
    parseTimeout = setTimeout(() => {
      saveHistory();
      const parsed = parseQueryToObject(e.target.value);
      queryObject.filters = parsed.filters;
      queryObject.connectors = parsed.connectors;
      console.log(queryObject);
    }, 500); // Debounce for real-time feel without too many parses
  });

  queryInput.addEventListener('blur', (e) => {
    clearTimeout(parseTimeout);
    const parsed = parseQueryToObject(e.target.value);
    queryObject.filters = parsed.filters;
    queryObject.connectors = parsed.connectors;
    renderQueryPreview(); // Canonicalize formatting on blur
    console.log(queryObject);
  });

  // Undo
  undoButton.addEventListener('click', () => {
    if (historyStack.length > 0) {
      queryObject = historyStack.pop();
      renderQueryPreview();
    }
  });

  // Clear everything
  clearButton.addEventListener('click', () => {
    categoryInput.value = '';
    fileInput.value = '';
    selectedCategory = '';
    selectedFile = '';
    clearForm();
  });

  // Initial load
  await loadCategories();
}
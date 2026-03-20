export function renderAllLegends(map) {
  createPreviewPanel();

  const legendDiv = document.getElementById('legend');

  // Styled header
  legendDiv.innerHTML = `
    <div style="
      padding: 6px 10px;
      background: linear-gradient(to right, #00625A, #00a884);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-radius: 6px 6px 0 0;
      user-select: none;
    ">Legend</div>
    <div id="legend-items-container" style="padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;"></div>
  `;

  legendDiv.style.display = 'block';

  const legendItems = [];
  const itemsContainer = legendDiv.querySelector('#legend-items-container');

  map.getLayers().forEach(layer => {
    const source = layer.getSource?.();
    if (source && source.getParams) {
      const params = source.getParams();
      const layerNames = params.LAYERS?.split(',') || [];
      layerNames.forEach(name => {
        const legendContainer = document.createElement('div');
        legendContainer.className = 'legend-item';
        legendContainer.style.display = 'flex';
        legendContainer.style.alignItems = 'center';
        legendContainer.style.gap = '8px';
        legendContainer.style.padding = '2px 0';

        const legendImg = document.createElement('img');
        const legendUrl = `http://localhost:3010/api/legend/${encodeURIComponent(name)}`;
        
        fetch(legendUrl)
          .then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.blob();
          })
          .then(blob => {
            legendImg.src = URL.createObjectURL(blob);
          })
          .catch(err => {
            console.error("Failed to fetch legend:", err);
          });

        legendImg.alt = name;
        legendImg.title = 'Click to preview';
        legendImg.style.flexShrink = '0';
        legendImg.style.border = '1px solid #ccc';
        legendImg.style.borderRadius = '2px';
        legendImg.style.backgroundColor = 'white';
        legendImg.style.cursor = 'pointer';

        legendImg.addEventListener('click', () => {
          const panel = document.getElementById('legend-preview-panel');
          const previewImg = document.getElementById('legend-preview-img');
          previewImg.src = legendImg.src;
          panel.style.display = 'block';
        });

        const label = document.createElement('div');
        label.textContent = name;
        label.style.fontSize = '12px';
        label.style.color = '#333';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
        label.style.whiteSpace = 'nowrap';
        label.style.flex = '1';

        legendContainer.appendChild(legendImg);
        legendContainer.appendChild(label);
        itemsContainer.appendChild(legendContainer);

        // Store legend data for PDF export
        legendItems.push({
          name,
          imageUrl: legendUrl,
        });
      });
    }
  });

  // Store legend items in a data attribute for access during PDF export
  legendDiv.dataset.legendItems = JSON.stringify(legendItems);
}

// Helper function to get legend items for PDF export
export function getLegendItems() {
  const legendDiv = document.getElementById('legend');
  const legendItems = legendDiv.dataset.legendItems
    ? JSON.parse(legendDiv.dataset.legendItems)
    : [];
  return legendItems;
}

let previewPanelCreated = false;

function createPreviewPanel() {
  if (previewPanelCreated) return;
  previewPanelCreated = true;
  
  const panel = document.createElement('div');
  panel.id = 'legend-preview-panel';
  panel.style.display = 'none';
  panel.style.position = 'absolute';
  panel.style.top = '100px';
  panel.style.right = '300px';
  panel.style.zIndex = '10000';
  panel.style.backgroundColor = 'white';
  panel.style.border = '1px solid #ccc';
  panel.style.borderRadius = '4px';
  panel.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
  
  const header = document.createElement('div');
  header.style.padding = '5px 10px';
  header.style.backgroundColor = '#00625A';
  header.style.color = 'white';
  header.style.cursor = 'move';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.borderRadius = '4px 4px 0 0';
  
  const title = document.createElement('span');
  title.textContent = 'Legend Preview';
  title.style.fontSize = '14px';
  title.style.fontWeight = 'bold';
  title.style.marginRight = '20px';
  
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.color = '#fff';
  closeBtn.onclick = () => panel.style.display = 'none';
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const content = document.createElement('div');
  content.style.padding = '10px';
  content.style.overflow = 'auto';
  content.style.maxHeight = '80vh';
  content.style.maxWidth = '80vw';
  content.style.backgroundColor = '#fff';
  
  const img = document.createElement('img');
  img.id = 'legend-preview-img';
  img.style.display = 'block';
  
  content.appendChild(img);
  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);
  
  // Drag logic
  let isDragging = false;
  let offsetX, offsetY;
  
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      panel.style.left = (e.clientX - offsetX) + 'px';
      panel.style.top = (e.clientY - offsetY) + 'px';
      panel.style.right = 'auto'; // Reset right anchor
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}
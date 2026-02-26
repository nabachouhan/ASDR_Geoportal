export function renderAllLegends(map) {
  const legendDiv = document.getElementById('legend');
  legendDiv.innerHTML = '<h4>Legend</h4>'; // Clear existing and add header

  // Apply flexbox to align items horizontally
  legendDiv.style.display = 'flex';
  legendDiv.style.flexDirection = 'column';
  legendDiv.style.gap = '5px';

  const legendItems = [];

  map.getLayers().forEach(layer => {
    const source = layer.getSource?.();
    if (source && source.getParams) {
      const params = source.getParams();
      const layerNames = params.LAYERS?.split(',') || [];
      layerNames.forEach(name => {
        const legendContainer = document.createElement('div');
        legendContainer.style.display = 'flex';
        legendContainer.style.alignItems = 'center';
        legendContainer.style.gap = '8px';
        legendContainer.style.whiteSpace = 'nowrap';

        const legendImg = document.createElement('img');
        legendImg.src = `http://localhost:3010/api/legend/${encodeURIComponent(name)}`;
        legendImg.alt = name;
        legendImg.title = name;
        legendImg.style.height = '20px';
        legendImg.style.width = '20px';
        legendImg.style.flexShrink = '0';
        legendImg.style.border = '1px solid #ccc';
        legendImg.style.backgroundColor = 'white';

        const label = document.createElement('div');
        label.textContent = name;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '12px';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';

        legendContainer.appendChild(legendImg);
        legendContainer.appendChild(label);
        legendDiv.appendChild(legendContainer);

        // Store legend data for PDF export
        legendItems.push({
          name,
          imageUrl: legendImg.src,
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
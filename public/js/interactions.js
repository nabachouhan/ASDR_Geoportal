import { map } from './baseLayers'

export function customHome(event) {

    // const homeButton = document.getElementById(event);
    const homeCoords = [10300257, 3061038];
    const asext = [9871398.959125951,2659063.0765955094,10774371.019098112,3298656.6453638803]
    // map.getView().setCenter(homeCoords);
    // map.getView().setZoom(7); // Optional: Set zoom level for home view
    map.getView().fit(asext, {
      padding: [50, 50, 50, 50], // Add 50px padding on all sides
      duration: 2000,            // Smooth 1-second zoom animation
    });
    
}

export function fullscreen_click() {
    console.log("full scr btn");
    
    let fullscrIn = document.getElementById("sidebar-fullscrIn-btn");
    let fullscrOut = document.getElementById("sidebar-fullscrOut-btn");


    console.log(window.getComputedStyle(fullscrIn).display)
    if (window.getComputedStyle(fullscrIn).display === 'block') {
        fullscrIn.style.display = 'none'
        fullscrOut.style.display = 'block'

    } else {
        fullscrIn.style.display = 'block'
        fullscrOut.style.display = 'none'

    }
}

export function customFullscreen(event) {
  if (document.fullscreenEnabled) {
    // Fullscreen API is supported
    console.log("full screen supported");

    if (event == "easeIn") {
      function enterFullscreen(element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Webkit prefix
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) { // Mozilla prefix
          element.mozRequestFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }

      // Usage:
      const mapElement = document.getElementById('body');
      enterFullscreen(mapElement);
    } else {
      function exitFullscreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Webkit prefix
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) { // Mozilla prefix
          document.mozCancelFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }
      // Usage:
      console.log('exitFullscreen()');
      
      exitFullscreen();
    }

  } else {
    // Handle fallback scenarios (optional)
    console.log("full screen not supported");
  }
}
export function customZoom(event) {
    console.log(event)
    if (event == "zIn") {
      const view = map.getView();
      const currentZoom = view.getZoom();
      // Adjust zoom step based on your preference (e.g., 0.5)
      const newZoom = currentZoom + 0.5;
      view.setZoom(Math.min(newZoom, view.getMaxZoom())); // Prevent exceeding max zoom
    }
    else if (event == "zOut") {
      const view = map.getView();
      const currentZoom = view.getZoom();
      const newZoom = currentZoom - 0.5;
      view.setZoom(Math.max(newZoom, view.getMinZoom())); // Prevent zooming below min zoom
  
    }
  }
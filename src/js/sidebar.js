

export function toggleSidebar(){
    const menu = document.querySelector('.menu_sidebar_container');
    menu.classList.toggle('active');
    let navmenuOpen = document.getElementById("menu_open")
    let navmenuClose = document.getElementById("menu_close")
    
    if(window.getComputedStyle(navmenuOpen).display==='block'){
        navmenuOpen.style.display='none'
        navmenuClose.style.display='block'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)

    }else{
        navmenuOpen.style.display='block'
        navmenuClose.style.display='none'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)

    }
}

export   function display_toggle_block(id) {
  console.log(id);
  
    const element = document.getElementById(id);
    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  
  }

 export  function display_toggle_block_adminState(id) {
    // Get the element with the specified ID
    const clickedSubMenu = document.getElementById(id);
  
    // Get all existing sub-menus
    const subMenus = document.querySelectorAll('.side_menu_container_optins .side_menu_cat3.show');
  
    // Close all open sub-menus except the clicked one
    subMenus.forEach(subMenu => {
      if (subMenu !== clickedSubMenu) {
        subMenu.classList.remove('show');  //close others
      }
    });
  
    // Toggle the clicked sub-menu's visibility
    clickedSubMenu.classList.toggle('show');       //display-hide toggle
  }

  // Function to toggle the side popup
export function display_toggle_side_Popup(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.sidebar_items .side_menu_popup.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show'); // Close others
    }
  });

  // Toggle the clicked baselayer-menu's visibility
  clickedSubMenu.classList.toggle('show'); // Toggle display
}


// export function display_toggle_side_Popup(id) {
//   const element = document.getElementById(id);
//   if (element.style.display === "none") {
//     element.style.display = "block";
//   } else {
//     element.style.display = "none";
//   }
// }
export function display_toggle(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.sidebar_items ul.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show');  //close others
    }
  });

  // Toggle the clicked sub-menu's visibility
  clickedSubMenu.classList.toggle('show');       //display-hide toggle
}
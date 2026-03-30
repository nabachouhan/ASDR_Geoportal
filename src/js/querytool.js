export function querytoolload(){
    

const dropdownInput = document.getElementById("queryTool-category");
const dropdownOptions = document.getElementById("categoryOptions");
const options = Array.from(dropdownOptions.querySelectorAll(".dropdown-option"));

// Toggle dropdown visibility
dropdownInput.addEventListener("click", () => {
    console.log("Toggle dropdown visibility");
    
    dropdownOptions.style.display =
        dropdownOptions.style.display === "block" ? "none" : "block";
    dropdownInput.readOnly = false; // Allow typing
});

// Filter options based on user input
dropdownInput.addEventListener("input", (e) => {
    console.log("Filter options based on user input");
    
    const query = e.target.value.toLowerCase();
    options.forEach(option => {
        option.style.display = option.textContent.toLowerCase().includes(query) ? "block" : "none";
    });
});

// Handle option selection
options.forEach(option => {
    console.log("Handle option selection");
    
    option.addEventListener("click", () => {
        dropdownInput.value = option.textContent;
        dropdownOptions.style.display = "none"; // Close dropdown
        dropdownInput.readOnly = true; // Lock typing again
    });
});

// Close dropdown when clicking outside
// document.addEventListener("click", (e) => {
//     console.log("Close dropdown when clicking outside");
    
//     if (!dropdownInput.contains(e.target) && !dropdownOptions.contains(e.target)) {
//         dropdownOptions.style.display = "none";
//         dropdownInput.readOnly = true;
//     }
// });
}

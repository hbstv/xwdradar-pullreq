const key = 'Please use your own API key at maptiler.com';
const map = L.map('mapid', {
    zoomControl: false,
    minZoom: 2.5,
    zoomSnap: 0,
    terrainControl: false,
    geolocateControl: false,
    easeLinearity: 0.4,
    bounceAtZoomLimits: false,
    maxBounds: [[-84, -180], [84, 180]], // Restrict map boundaries
    maxBoundsViscosity: 0.9 // Ensure the map view stops at the boundaries
}).setView([38.0, -100.4], 4);

/*
// Save position feature
map.on('moveend', () => {
    const bounds = map.getBounds();
    const zoomLevel = map.getZoom();

    setTimeout(() => map.resize(), 0);

    // Fetch data based on the current bounds and zoom level if needed
});
*/

// Create custom pane for label overlay
map.createPane('labelPane');
map.getPane('labelPane').style.zIndex = 200; // Higher z-index for labels

// Light Mode Layer
const lightModeLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/d3bdcfa3-d8d8-4bc1-958d-6d1780cb4de1/style.json?key=drXsj04WIDowwjjOrinL'
});

// Dark Mode Layer (base layer)
const darkModeLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/3d1b9c2b-3b90-4457-8310-fbd15c34d453/style.json?key=HKGa1lnD7ToUuzx5Ohp0'
});

// Label Layer (overlay on top of all modes)
const darkModeLabelLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/645f642d-36b4-42d1-8b02-b9968eff3443/style.json?key=HKGa1lnD7ToUuzx5Ohp0',
    pane: 'labelPane', // Higher z-index pane for overlay
    navigationControl: false,
    geolocateControl: false
});

// Satellite Layer
const satelliteLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/dd940e48-cc35-41f3-b8e6-3942e4a1f75b/style.json?key=HKGa1lnD7ToUuzx5Ohp0'
});

// custom icon setup
var tornadoReport = L.icon ({
    iconUrl: 'reports/tornado.svg',

    iconSize:     [16, 24], // size of the icon
    iconAnchor:   [8, 24], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

var hailReport = L.icon ({
    iconUrl: 'reports/hail.svg',

    iconSize:     [16, 24], // size of the icon
    iconAnchor:   [8, 24], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

var windReport = L.icon ({
    iconUrl: 'reports/wind.svg',

    iconSize:     [16, 24], // size of the icon
    iconAnchor:   [8, 24], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

let currentMapLayer;

// Function to set the map type and manage layers
function setMapType(type) {
    // Remove the current base layer
    if (currentMapLayer) {
        map.removeLayer(currentMapLayer);
    }

    // Remove dark mode layer if switching away from dark mode
    if (type !== 'dark' && map.hasLayer(darkModeLayer)) {
        map.removeLayer(darkModeLayer);
    }

    // Set the base layer based on the selected type
    if (type === 'light') {
        currentMapLayer = lightModeLayer;
        map.addLayer(darkModeLabelLayer);  // Add label layer to light mode
    } else if (type === 'dark') {
        currentMapLayer = darkModeLayer;
        map.addLayer(darkModeLayer);       // Add dark mode base layer
        map.addLayer(darkModeLabelLayer);  // Add label layer to dark mode
    } else if (type === 'satellite') {
        currentMapLayer = satelliteLayer;
        map.addLayer(darkModeLabelLayer);  // Add label layer to satellite mode
    }

    // Add the selected base layer to the map
    if (currentMapLayer) {
        map.addLayer(currentMapLayer);
    }

    // Shift the map slightly to the right
    const center = map.getCenter();
    map.setView([center.lat, center.lng + 0.000000001], map.getZoom(), { animate: false });

    // Save selected map type to localStorage
    localStorage.setItem('selectedMapLayer', type);
}

// Function to load the saved map type or default to dark mode
function loadSavedMapType() {
    const savedType = localStorage.getItem('selectedMapLayer') || 'dark'; // Default to dark
    setMapType(savedType);

    // Ensure the corresponding radio button is checked
    document.querySelector(`input[name="map-type"][value="${savedType}"]`).checked = true;
}

// Call the function to load the map type on page load
loadSavedMapType();


map.attributionControl.setPrefix(false); // Removes the "Leaflet" text
// Remove the attribution control if it exists
if (map.attributionControl) {
    map.attributionControl.remove();
}
        var apiData = {};
        var mapFrames = [];
        var lastPastFramePosition = -1;
        var radarLayers = [];
        var polygons = [];

const reportMarkers = {};


        
        var doFuture = true;
        
        var optionKind = 'radar';
        
        var optionTileSize = 256;
        var optionColorScheme = 6; // Default color scheme for radar
        var optionSmoothData = 1;
        var optionSnowColors = 1;
        
        var radarOpacity = 0.7;
        var alertOpacity = 0.4;
        var watchOpacity = 0.6;
        
        var animationPosition = 0;
        var animationTimer = false;
        
        var loadingTilesCount = 0;
        var loadedTilesCount = 0;

        var radarON = true;
        var satelliteON = false;
        var alertON = true;
        var watchesON = true;
        var allalerts = [];
        
        var displayTorReports = true;
        var displayWndReports = true;
        var displayHalReports = true;

        var alertData = [];
        var allalerts = [];
        
        var displayFloodWarnings = true;
        var displayFFloodWarnings = true;
        var displayOtherWarnings = true;
        var displaySpecWarnings = true;
        var displayTorWarnings = true;
        var displaySvrWarnings = true;
        var displayTorWatches = true;
        var displaySvrWatches = true;

        var watchPolygons = {};

var watchesLoaded = false;
var alertsLoaded = false;

// Save settings to localStorage
function saveSettings() {
    const settings = {
        radarOpacity,
        alertOpacity,
        watchOpacity,
        optionKind,
        optionTileSize,
        optionColorScheme,
        optionSmoothData,
        optionSnowColors,
        radarON,
        satelliteON,
        alertON,
        watchesON,
        reportsON, // Save the report markers toggle state
        hurricanesON, // Save the hurricane layers toggle state
        selectedOutlooks: [], // Store selected checkmarks
        mapType: currentMapLayer ? currentMapLayer.options.style : 'light', // Save the current map type
    };

    // Save selected checkmarks for outlooks
    document.querySelectorAll('input[type=checkbox]').forEach((elem) => {
        if (elem.checked) {
            settings.selectedOutlooks.push(elem.value);
        }
    });

    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('weatherAppSettings'));
    if (settings) {
        radarOpacity = settings.radarOpacity;
        alertOpacity = settings.alertOpacity;
        watchOpacity = settings.watchOpacity;
        optionKind = settings.optionKind || 'radar'; // Default to 'radar' if not set
        optionTileSize = settings.optionTileSize;
        optionColorScheme = settings.optionColorScheme;
        optionSmoothData = settings.optionSmoothData;
        optionSnowColors = settings.optionSnowColors;
        radarON = settings.radarON;
        satelliteON = settings.satelliteON;
        alertON = settings.alertON;
        watchesON = settings.watchesON;
        reportsON = settings.reportsON;
        hurricanesON = settings.hurricanesON !== undefined ? settings.hurricanesON : true; // Default to true if not set

        // Load and apply selected checkmarks for outlooks
        if (settings.selectedOutlooks && settings.selectedOutlooks.length > 0) {
            settings.selectedOutlooks.forEach(outlookType => {
                const checkbox = document.querySelector(`input[value="${outlookType}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    const day = outlookType.split('_')[1];
                    updateOutlookType(day, outlookType); // Load the corresponding outlook layer
                }
            });
        }

        // Restore the map view (center and zoom)
        if (settings.mapCenter && settings.mapZoom) {
            const center = [settings.mapCenter.lat, settings.mapCenter.lng];
            map.setView(center, settings.mapZoom);
        }

        // Restore report markers toggle
        if (settings.reportsON) {
            reportsON = settings.reportsON;
            if (reportsON) {
                startAutoRefresh(); // Start auto-refreshing if reports are on
            } else {
                stopAutoRefresh();
            }
        }

        // Update UI labels, sliders, and buttons
        document.getElementById('smoothing-button').innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
        document.getElementById('highres-button').innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
        document.getElementById('colors').value = optionColorScheme;

        // Update sliders and their values
        document.getElementById('alert-opacity-slider').value = alertOpacity;
        document.getElementById('alert-opacity-value').textContent = alertOpacity;
        document.getElementById('radar-opacity-slider').value = radarOpacity;
        document.getElementById('radar-opacity-value').textContent = radarOpacity;

        // Update radar type radio button
        document.querySelector(`input[name="radar-type"][value="${optionKind}"]`).checked = true;

        // Update button styles based on state
        const alertButton = document.getElementById("refreshalerts");
        alertButton.style.backgroundColor = alertON ? "white" : "#636381";
        alertButton.style.color = alertON ? "#7F1DF0" : "white";
        alertButton.style.border = alertON ? "#636381 2px solid" : "2px solid white";

        const alertsMenuButton = document.getElementById("alerts-menu-button");
        alertsMenuButton.style.backgroundColor = alertON ? "white" : "#636381";
        alertsMenuButton.style.color = alertON ? "#7F1DF0" : "white";
        alertsMenuButton.style.border = alertON ? "#636381 2px solid" : "2px solid white";

        const watchButton = document.getElementById("togglewatches");
        watchButton.style.backgroundColor = watchesON ? "white" : "#636381";
        watchButton.style.color = watchesON ? "#7F1DF0" : "white";
        watchButton.style.border = watchesON ? "#636381 2px solid" : "2px solid white";

        // Update hurricane button state
        const hurricaneButton = document.getElementById("toggle-hurricanes");
        hurricaneButton.style.backgroundColor = hurricanesON ? "white" : "#636381";
        hurricaneButton.style.color = hurricanesON ? "#7F1DF0" : "white";

        // Toggle hurricane layer based on saved settings
        toggleHurricanes(hurricanesON);
    } else {
        // If no settings found, ensure default state
        hurricanesON = true; // Default hurricane layer to ON
        toggleHurricanes(hurricanesON); // Show the hurricane layer by default
    }

    // Ensure initialization with the loaded radar type
    initialize(apiData, optionKind);
}

// Event listener for checkboxes to toggle outlook layers and save settings
document.querySelectorAll('input[type=checkbox]').forEach((elem) => {
    elem.addEventListener('change', function () {
        const outlookType = this.value;
        if (this.checked) {
            // Uncheck all other checkboxes before checking the current one
            document.querySelectorAll('input[type=checkbox]').forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });

            const day = outlookType.split('_')[1];
            updateOutlookType(day, outlookType);
        } else if (!this.checked && currentLayer) {
            removeCurrentLayer(() => {
                lastSelectedOutlook = '';
            });
        }

        // Save settings after any change
        saveSettings();
    });
});

// Call loadSettings when the page is ready to load saved settings
document.addEventListener('DOMContentLoaded', function () {
    loadSettings();
});

map.createPane('polygonPane');
map.getPane('polygonPane').style.zIndex = 400; // higher z-index for polygon

map.createPane('borderPane');
map.getPane('borderPane').style.zIndex = 300; // lower z-index for border


let isThrottled = false;
map.on('move', () => {
    if (!isThrottled) {
        isThrottled = true;
        setTimeout(() => {
            // Update radar loop or data
            isThrottled = false;
        }, 400); // Adjust delay as needed
    }
});

function debounce(fn, delay, immediate = false) {
    let timer = null;
    return function (...args) {
        const context = this;

        const later = () => {
            timer = null;
            if (!immediate) fn.apply(context, args);
        };

        const callNow = immediate && !timer;

        clearTimeout(timer);
        timer = setTimeout(later, delay);

        if (callNow) fn.apply(context, args);
    };
}



document.addEventListener('DOMContentLoaded', function() {
    loadSettings(); // Load settings when the page loads
});
        function formatTimestamp(isoTimestamp) {
            const date = new Date(isoTimestamp);
            const options = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
            };
            return date.toLocaleString('en-US', options);
        }
        
        function reverseSubarrays(arr) {
            return arr.map(subArr => subArr.slice().reverse());
        }
        
        function findPair(list, target) {
            for (let i = 0; i < list.length; i++) {
                if (list[i][0] === target) {
                    return list[i][1];
                }
            }
            return null;
        }
        
         document.querySelectorAll("a").forEach(function(item) {
            if (item.href == "https://www.maptiler.com/") {
                item.style.bottom = "58px";
                item.style.left = "6px";
            }
        });
        
        function findPairInDictionary(dicts, target) {
            for (const dict of dicts) {
                console.log(dict + " with target " + target);
                console.log(alertData);
                if (target in dict) {
                    return dict[target];
                }
            }
            console.log("Couldn't find obj.");
        }
        
        function convertDictsToArrayOfArrays(arr) {
            return arr.map(obj => Object.values(obj));
        }
        
       function getAlert(alertInfo) {
    var alertTitle = document.getElementById('alert_title');
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    var alertBorderColor = "#1A1A1A";
    var alertBorderWidth = "0px";
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertTitlebackgroundColor = "gold";
        if (alertInfo.properties.description.toLowerCase().includes("80 mph") || alertInfo.properties.description.toLowerCase().includes("destructive")) {
            alertBorderColor = "gold";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
        if (alertInfo.properties.description.toLowerCase().includes("tornado emergency")) {
            alertBorderColor = "maroon";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "lime";
        if (alertInfo.properties.description.toLowerCase().includes("flash flood emergency")) {
            alertBorderColor = "darkgreen";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#ecd4b1";
    }
 if (alertInfo.properties.event.includes("Special Marine")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "orange";
    }
     if (alertInfo.properties.event.includes("Extreme Wind")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "pink";
    }
     if (alertInfo.properties.event.includes("Snow Squall")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#5DE2E7";
    }
    var construct = '<div class="alert-header" style="background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><div style="overflow-y: auto; border: ' + alertBorderWidth + ' solid ' + alertBorderColor + ';">';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>';
    
    try {
        var hazards = alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " ");
    } catch {
        var hazards = "No hazards identified.";
    }
    
    construct = construct + '<p style="margin: 0px;"><b>Hazards: </b>' + hazards + '</p>';

try {
    // Match everything after "IMPACTS..." until we hit two newlines, an asterisk, or the end of the string
    var impacts = alertInfo.properties.description.match(/IMPACTS?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
        .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
        .trim(); // Clean up any leading or trailing whitespace
} catch {
    try {
        // Match everything after "IMPACT..." until we hit two newlines, an asterisk, or the end of the string
        var impacts = alertInfo.properties.description.match(/IMPACT?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
            .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
            .trim(); // Clean up any leading or trailing whitespace
    } catch {
        // If no impacts found, set default message
        var impacts = "No impacts identified.";
    }
}

// Add the impacts to the constructed content
construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br>';


    var description = alertInfo.properties.description.replace(/(?:SVR|FFW|TOR|SMW)\d{4}/g, "").replace(/\n/g, "<br>");
    construct = construct + '<button class="more-info-button" onclick="showAlertPopup(' + JSON.stringify(alertInfo).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-info-circle"></i> More Info</button>';
    construct = construct + '</div>';

    return construct;
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short'
    }).format(date);
}

function formatWatchDate(timestamp) {
    const year = parseInt(timestamp.slice(0, 4));
    const month = parseInt(timestamp.slice(4, 6)) - 1; // JavaScript months are 0-based
    const day = parseInt(timestamp.slice(6, 8));
    const hour = parseInt(timestamp.slice(8, 10));
    const minute = parseInt(timestamp.slice(10, 12));
    
    return new Date(Date.UTC(year, month, day, hour, minute));
}



function formatDate(inputDateString) {
    const inputDate = new Date(inputDateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short'
    }).format(inputDate);
}

function getAlert(alertInfo) {
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    var alertBorderColor = "#1A1A1A";
    var alertBorderWidth = "0px";
    
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertTitlebackgroundColor = "gold";
        if (alertInfo.properties.description.toLowerCase().includes("80 mph wind gusts") || alertInfo.properties.description.toLowerCase().includes("destructive storm")) {
            alertBorderColor = "gold";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
        if (alertInfo.properties.description.toLowerCase().includes("tornado emergency")) {
            alertBorderColor = "maroon";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "lime";
        if (alertInfo.properties.description.toLowerCase().includes("flash flood emergency")) {
            alertBorderColor = "darkgreen";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#ecd4b1";
    }
      if (alertInfo.properties.event.includes("Special Marine")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "orange";
    }
    if (alertInfo.properties.event.includes("Extreme Wind")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "pink";
    }
    if (alertInfo.properties.event.includes("Snow Squall")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#5DE2E7";
    }


    var construct = '<div class="alert-header" style="background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div>';
    
    var customMessages = '';
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div>';
    }
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div>';
    }

   else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div>';
    }
   else if (alertInfo.properties.description.includes("confirmed tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div>';
    } else if (alertInfo.properties.description.includes("reported tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div>';
    }
    if (alertInfo.properties.description.includes("DESTRUCTIVE")) {
        customMessages += '<div style="background-color: red; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div>';
    } else if (alertInfo.properties.description.includes("considerable")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }
else if (alertInfo.properties.description.includes("Two inch hail")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }
else if (alertInfo.properties.description.includes("Tennis")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }

    // Extract source from the description
    let source = "No source identified.";
    try {
        source = alertInfo.properties.description.match(/SOURCE\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting source:", e);
    }

    construct += customMessages;
    construct += '<div style="overflow-y: auto; border: ' + alertBorderWidth + ' solid ' + alertBorderColor + ';">';
    construct += '<p style="margin: 0;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct += '<p style="margin: 0;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct += '<p style="margin: 0;"><b>Source:</b> ' + source + '</p><br>';

    // Extracting hazards
    var hazards = "No hazards identified.";
    try {
        hazards = alertInfo.properties.description.match(/HAZARD\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting hazards:", e);
    }
    construct += '<p style="margin: 0;"><b>Hazards: </b>' + hazards + '</p>';

// Extracting impacts
var impacts = "No impacts identified.";
try {
    // Match everything after "IMPACTS..." until we hit two newlines, an asterisk, or the end of the string
    var impacts = alertInfo.properties.description.match(/IMPACTS?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
        .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
        .trim(); // Clean up any leading or trailing whitespace
} catch {
    try {
        // Match everything after "IMPACT..." until we hit two newlines, an asterisk, or the end of the string
        var impacts = alertInfo.properties.description.match(/IMPACT?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
            .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
            .trim(); // Clean up any leading or trailing whitespace
    } catch {
        // If no impacts found, set default message
        var impacts = "No impacts identified.";
    }
}

// Adding the impacts to the construct
construct += '<p style="margin: 0;"><b>Impacts: </b>' + impacts + '</p><br>';

    // Extracting description
    var description = alertInfo.properties.description.replace(/(?:SVR|FFW|TOR)\d{4}/g, "").replace(/\n/g, "<br>");
    construct += '<button class="more-info-button" onclick="showAlertPopup(' + JSON.stringify(alertInfo).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-info-circle"></i> More Info</button>';
    construct += '</div>';

    return construct;
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short'
    }).format(date);
}


function changeRadarPosition(position, preloadOnly, force) {
    while (position >= mapFrames.length) {
        position -= mapFrames.length;
    }
    while (position < 0) {
        position += mapFrames.length;
    }

    var currentFrame = mapFrames[animationPosition];
    var nextFrame = mapFrames[position];

    addLayer(nextFrame);

    if (preloadOnly || (isTilesLoading() && !force)) {
        return;
    }

    animationPosition = position;

    if (radarLayers[currentFrame.path]) {
        radarLayers[currentFrame.path].setOpacity(0);
    }
    radarLayers[nextFrame.path].setOpacity(radarOpacity);

    var pastOrForecast = nextFrame.time > Date.now() / 1000 ? 'Future' : (nextFrame.time === mapFrames[lastPastFramePosition].time ? 'Current' : 'Past');

    document.getElementById("timestamp").innerHTML = pastOrForecast + " • " + formatDate(new Date(nextFrame.time * 1000).toISOString());
}

function logAlert(alertInfo) {
    var alertLog = document.getElementById('alert-log');
    var noAlertsMessage = document.getElementById('no-alerts-message');
    var alertClass = '';

    // Determine the alert class based on the event type
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertClass = 'alert-severe-thunderstorm';
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertClass = 'alert-tornado';
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertClass = 'alert-flash-flood';
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertClass = 'alert-special-weather';
    } else if (alertInfo.properties.event.includes("Special Marine")) {
        alertClass = 'alert-special-marine';
    } else if (alertInfo.properties.event.includes("Extreme Wind")) {
        alertClass = 'alert-extreme-wind';
    }
     else if (alertInfo.properties.event.includes("Snow Squall")) {
        alertClass = 'alert-snow-squall';
    }

    if (alertClass) {
        var listItem = document.createElement('li');

        // Check for duplicate alerts
        var alertExists = false;
        for (var i = 0; i < alertLog.children.length; i++) {
            var child = alertLog.children[i];
            if (child.getAttribute('data-alert-id') === alertInfo.properties.id) {
                alertExists = true;
                break;
            }
        }
        if (alertExists) {
            return; // Alert already exists, skip adding it
        }

        // Set data attributes for alert ID and issued time
        listItem.setAttribute('data-alert-id', alertInfo.properties.id);
        listItem.setAttribute('data-issued-time', alertInfo.properties.sent);

        // Build the innerHTML of the list item
        listItem.innerHTML = 
            `<div class="alert-header ${alertClass}" style="padding: 8px; font-size: 17px; font-weight: bolder;">
                ${alertInfo.properties.event}
            </div>
            <div style="margin-top: 2px; font-size: 16px;">
                <b>Issued:</b> ${formatTimestamp(alertInfo.properties.sent)}<br>
                <b>Expires:</b> ${formatTimestamp(alertInfo.properties.expires)}<br>
                <b>Areas:</b> ${alertInfo.properties.areaDesc}
            </div>
            <div class="alert-buttons" style="margin-top: 2px;">
                <button class="more-info-button" onclick="showAlertPopup(${JSON.stringify(alertInfo).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-info-circle"></i> More Info
                </button>
                <button class="more-info-button" onclick="zoomToAlert(${JSON.stringify(alertInfo.geometry.coordinates).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-eye"></i> Show Me
                </button>
            </div>`;

        // Insert the alert in reverse chronological order based on issued time
        let inserted = false;
        const newAlertTime = new Date(alertInfo.properties.sent);
        for (let i = 0; i < alertLog.children.length; i++) {
            const existingAlertTime = new Date(alertLog.children[i].getAttribute('data-issued-time'));

            // If the new alert is more recent, insert it before the older alert
            if (newAlertTime > existingAlertTime) {
                alertLog.insertBefore(listItem, alertLog.children[i]);
                inserted = true;
                break;
            }
        }

        // If the alert is the oldest, append it at the end of the list
        if (!inserted) {
            alertLog.appendChild(listItem);
        }

        // Hide the "No active alerts" message since we have at least one alert
        noAlertsMessage.style.display = 'none';
        noAlertsMessage.classList.remove('centered-alert');
    }

    // Show "No active alerts" message if there are no alerts and alerts are turned on
    if (alertLog.children.length === 0 && alertON) {
        noAlertsMessage.style.display = 'block';
        noAlertsMessage.querySelector('p').innerText = 'No active alerts';
        noAlertsMessage.classList.add('centered-alert');
        document.getElementById('toggle-alerts-button').style.display = 'none'; 
    } else {
        noAlertsMessage.classList.remove('centered-alert');
    }
}

function updateAlertList(newAlerts) {
    var alertLog = document.getElementById('alert-log');
    alertLog.innerHTML = ''; // Clear existing alerts

    // Sort new alerts by 'sent' date in descending order (newest first)
    newAlerts.sort((a, b) => new Date(b.properties.sent) - new Date(a.properties.sent));

    // Add sorted alerts to the log
    newAlerts.forEach(alert => logAlert(alert));
}


function showAlertPopup(alertInfo) {
    document.getElementById('popup-title').innerText = alertInfo.properties.event;
    document.getElementById('popup-title').style.backgroundColor = getAlertHeaderColor(alertInfo.properties.event);

    // Custom messages
    let customMessages = '';
    
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("confirmed tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("reported tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("DESTRUCTIVE")) {
        customMessages += '<div style="background-color: red; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("considerable")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("Two inch hail")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("Tennis")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }

    // Extract source from the description
    let source = "No source identified.";
    try {
        source = alertInfo.properties.description.match(/SOURCE\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting source:", e);
    }

    document.getElementById('popup-details').innerHTML = `${customMessages}<b>Issued:</b> ${formatTimestamp(alertInfo.properties.sent)}<br><b>Expires:</b> ${formatTimestamp(alertInfo.properties.expires)}<br><b>Source:</b> ${source}`;

    // Extract hazards and impacts
    let hazards = "No hazards identified.";
    try {
        hazards = alertInfo.properties.description.match(/HAZARD\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting hazards:", e);
    }

    let impacts = "No impacts identified.";
    try {
        impacts = alertInfo.properties.description.match(/IMPACTS?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
            .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
            .trim(); // Clean up any leading or trailing whitespace
    } catch (e) {
        try {
            impacts = alertInfo.properties.description.match(/IMPACT\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
                .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
                .trim(); // Clean up any leading or trailing whitespace
        } catch (e) {
            console.log("Error extracting impacts:", e);
        }
    }

    // Add hazards and impacts to the popup with reduced margin below impacts
    document.getElementById('popup-hazards-impacts').innerHTML = `
        <p style="margin: 0;"><b>Hazards:</b> ${hazards}</p>
        <p style="margin: 0;"><b>Impacts:</b> ${impacts}</p>
    `;

    // Process the description to clean up odd line breaks
    var cleanedDescription = alertInfo.properties.description
        .replace(/(?:SVR|FFW|TOR)\d{4}/g, "") // Remove specific codes like SVR, FFW, and TOR
        .replace(/\*/g, "") // Remove asterisks
        .replace(/\n{2,}/g, "<br><br>") // Replace two or more newlines with two <br> tags for paragraph breaks
        .replace(/\n/g, " "); // Replace single newlines with a space to avoid odd breaks in sentences

    document.getElementById('popup-description').innerHTML = `<b>Description:</b><br>
        <p style="margin: 8px 0 0 4px; padding-left: 10px; border-left: 5px solid ${getAlertHeaderColor(alertInfo.properties.event)}; border-radius: 5px;">
        ${cleanedDescription}
        </p>`;

   document.getElementById('popup-action').innerHTML = `<b>Action Recommended:</b> ${alertInfo.properties.instruction || 'No specific actions recommended.'}<br><br><b>Areas:</b> ${alertInfo.properties.areaDesc || 'No area specified.'}`;

    var popup = document.getElementById('alert-popup');
    popup.classList.add('show');
}



function getAlertHeaderColor(event) {
    if (event.includes("Severe Thunderstorm")) return "gold";
    if (event.includes("Tornado")) return "red";
    if (event.includes("Flash Flood Warning")) return "lime";
    if (event.includes("Special Weather")) return "#ecd4b1";
    if (event.includes("Special Marine")) return "orange";
    if (event.includes("Extreme Wind")) return "pink";
    if (event.includes("Snow Squall")) return "#5DE2E7";
    return "white";
}


function closeAlertPopup() {
    // Get the popup element
    var popup = document.getElementById('alert-popup');

    // Add fade-out class to initiate the animation
    popup.classList.add('fade-out');

    // Set a timeout to remove 'show' and 'fade-out' after the animation ends (300ms)
    setTimeout(() => {
        popup.classList.remove('show', 'fade-out');
    }, 300);

    // Stop the speech synthesis when the popup is closed
    window.speechSynthesis.cancel();
    isPlaying = false;

    // Reset the Play/Pause button to its "Play Alert" state
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Play Alert';
    updateButtonStyle(playPauseBtn, false); // Set to "off" style when popup is closed
}

function zoomToAlert(coordinates) {
    // Reverse the subarrays if necessary (assuming coordinates[0] is an array of [lng, lat] pairs)
    var latLngs = reverseSubarrays(coordinates[0]);

    // Create a LatLngBounds object from the coordinates
    var bounds = L.latLngBounds(latLngs);

    // Calculate the center of the bounds
    var center = bounds.getCenter();

    // Get the zoom level that would fit the bounds
    var targetZoom = map.getBoundsZoom(bounds);

    // Decrease the zoom level by 1 or adjust as needed to zoom out
    var zoomOutLevel = targetZoom - 1; // Adjust this value to zoom out more or less

    // Ensure zoomOutLevel is within the map's min and max zoom levels
    zoomOutLevel = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoomOutLevel));

    // Use flyTo for a smooth animated transition
    map.flyTo(center, zoomOutLevel);
}

function loadAlerts() {
    if (!alertON) return; // Don't load alerts if alertON is false

    console.log("Loading alerts");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');
    xhr.onreadystatechange = function() {
        console.log("running");
        if (xhr.readyState === 4 && xhr.status === 200) {
            var alerts = JSON.parse(xhr.responseText).features;

            // Assign priority based on event type
            alerts.forEach(function(alert) {
                if (alert.properties.event.includes("Special Marine")) {
                    alert.priority = 7;
                } else if (alert.properties.event.includes("Special Weather")) {
                    alert.priority = 6;
                     } else if (alert.properties.event.includes("Snow Squall")) {
                    alert.priority = 5;
                } else if (alert.properties.event.includes("Flash Flood Warning")) {
                    alert.priority = 4;
                } else if (alert.properties.event.includes("Severe Thunderstorm")) {
                    alert.priority = 3;
                } else if (alert.properties.event.includes("Extreme Wind")) {
                    alert.priority = 2;
                } else if (alert.properties.event.includes("Tornado")) {
                    alert.priority = 1;
                } else {
                    alert.priority = 8; // Lowest priority for other events
                }
            });

            // Sort by priority and then by sent time (oldest to newest)
            alerts.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority; // Sort by priority
                }
                return new Date(a.properties.sent) - new Date(b.properties.sent); // If same priority, sort by time
            });

            // Clear existing polygons and borders
            polygons.forEach(function(polygon) {
                map.removeLayer(polygon);
            });
            polygons = []; // Reset the polygons array

            document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log

            // Reverse to display newest first within each priority
            alerts.reverse().forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    console.log(thisItem);
                    var polygonOptions = {};
                    if (alert.properties.event.includes("Severe Thunderstorm")) {
                        polygonOptions.color = 'gold';
                        if (alert.properties.description.toLowerCase().includes("80 mph") || alert.properties.description.toLowerCase().includes("destructive")) {
                            polygonOptions.color = 'gold';
                            polygonOptions.weight = 7;
                        }
                    } else if (alert.properties.event.includes("Tornado")) {
                        polygonOptions.color = 'red';
                        if (alert.properties.description.toLowerCase().includes("tornado emergency")) {
                            polygonOptions.color = 'maroon';
                            polygonOptions.weight = 7;
                        }
                    } else if (alert.properties.event.includes("Flash Flood Warning")) {
                        polygonOptions.color = 'lime';
                        if (alert.properties.description.toLowerCase().includes("flash flood emergency")) {
                            polygonOptions.color = 'darkgreen';
                            polygonOptions.weight = 7;
                        }
                    } else if (alert.properties.event.includes("Special Weather")) {
                        polygonOptions.color = '#ecd4b1';
                    } else if (alert.properties.event.includes("Special Marine")) {
                        polygonOptions.color = 'orange';
                    }
                      else if (alert.properties.event.includes("Snow Squall")) {
                        polygonOptions.color = '#5DE2E7';
                    }

                    if (polygonOptions.color) {
                        // Create and add the polygon to the map with the custom pane
                        var polygon = L.polygon(reverseSubarrays(thisItem), Object.assign({}, polygonOptions, {pane: 'polygonPane'})).addTo(map);
                        polygon.setStyle({fillOpacity: alertOpacity});

                        // Add border to the map with the custom pane
                        var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6.5, fillOpacity: 0, pane: 'borderPane'}).addTo(map);

                        // Add both polygon and border to polygons array to keep track
                        polygons.push(polygon);
                        polygons.push(border);  // Keep border synchronized with the polygon

                        var thisAlert = [];
                        thisAlert.push(polygon.getLatLngs().join());
                        thisAlert.push(alert.properties.id);
                        allalerts.push(thisAlert);

                        // Bind popup to polygon
                        polygon.bindPopup(getAlert(alert), {
                            autoPan: true,
                            maxheight: '200',
                            maxWidth: '350',
                            className: 'alertpopup'
                        });

                        polygon.on('click', function (e) {
                            e.originalEvent.stopPropagation();
                        });
                    }
                    logAlert(alert);
                } catch (error) {
                    console.log("No coords for obj or error:", error);
                }
            });
        } else {
            console.log("API Error");
        }
    };
    xhr.send();
}



// Refresh alert list dynamically every minute
setInterval(() => {
    loadAlerts(); // Reload alerts to refresh polygons and borders together
}, 60000); // Refresh every 60 seconds
// Ensure the alert list is refreshed dynamically
setInterval(() => {
    document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log
    polygons.forEach(polygon => {
        const alertId = allalerts.find(alert => alert[0] === polygon.getLatLngs().join())[1];
        const alertInfo = findPairInDictionary(alertData, alertId);
        if (alertInfo) {
            logAlert(alertInfo);
        }
    });
}, 60000); // Refresh every minute



function getWatchRisk(percentage, type) {
    let category = 'Very Low';
    let style = 'background-color: beige; color: black;';

    if (type === 'EF2-EF5 tornadoes') {
        if (percentage < 2) {
            category = 'Very Low';
            style = 'background-color: beige; color: black;';
        } else if (percentage > 2) {
            category = 'Low';
            style = 'background-color: orange; color: white;';
        } else if (percentage >= 3 && percentage < 25) {
            category = 'Moderate';
            style = 'background-color: red; color: white;';
       } else if (percentage >= 26 && percentage < 100) {
            category = 'High';
            style = 'background-color: pink; color: magenta; font-weight: bold;';
        }
    } else {
        if (percentage < 5) {
            category = 'Very Low';
            style = 'background-color: beige; color: black;';
        } else if (percentage >= 5 && percentage < 25) {
            category = 'Low';
            style = 'background-color: orange; color: white;';
        } else if (percentage >= 26 && percentage < 69) {
            category = 'Moderate';
            style = 'background-color: red; color: white;';
        } else if (percentage >= 70) {
            category = 'High';
            style = 'background-color: magenta; color: white; font-weight: bold;';
        }
    }

    return `<span class="risk-level" style="${style}">${category}</span>`;
}

function toggleAlertListMenu() {
    const menu = document.getElementById('alert-list-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.classList.add('fade-out');
        setTimeout(() => {
            menu.style.display = 'none';
            menu.classList.remove('fade-out');
        }, 300);
    }
}

function getWatch(watch) {
    const alertTitlecolor = 'white';
    const alertTitlebackgroundColor = watch.properties.TYPE == "SVR" ? "#998207" : "#841213";
    const alertTitle = `${watch.properties.TYPE == "TOR" ? "Tornado Watch #" : "Severe T-Storm Watch #"}${watch.properties.NUM}`;

    const issuedDate = formatWatchDate(watch.properties.ISSUE);
    const expiresDate = formatWatchDate(watch.properties.EXPIRE);

    const issuedFormatted = issuedDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    const expiresFormatted = expiresDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    let construct = `
        <div style="overflow-y: auto; color: white;">
            <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ${alertTitlebackgroundColor}; color: ${alertTitlecolor};">
                ${alertTitle}
            </div>`;
    
    if (watch.properties.IS_PDS) {
        construct += `
            <div style="background-color: magenta; border-radius: 5px; margin: 10px 0; display: flex; justify-content: center; text-align: center;">
                <p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p>
            </div>`;
    }
    
    construct += `
            <br>
            <p style="margin: 0px;"><b>Issued:</b> ${issuedFormatted}</p>
            <p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ${expiresFormatted}</p>
            <p style="margin: 0px;"><b>Max Hail Size:</b> ${watch.properties.MAX_HAIL}"</p>
            <p style="margin: 0px;"><b>Max Wind Gusts:</b> ${Math.ceil(watch.properties.MAX_GUST * 1.15077945)} mph</p><br>
            <button class="more-info-button" onclick="showWatchPopup(${JSON.stringify(watch).replace(/"/g, '&quot;')})"><i class="fa-solid fa-info-circle"></i> More Info</button>
        </div>`;

    return construct;
}

function showWatchPopup(alertInfo) {
    var popup = document.getElementById('watch-popup');
    document.getElementById('watch-popup-title').innerText = alertInfo.properties.TYPE === "TOR" ? "Tornado Watch #" + alertInfo.properties.NUM : "Severe T-Storm Watch #" + alertInfo.properties.NUM;
    document.getElementById('watch-popup-title').style.backgroundColor = alertInfo.properties.TYPE === "TOR" ? "#841213" : "#998207";

    var issuedDate = new Date(formatWatchDate(alertInfo.properties.ISSUE).getTime());
    var expiresDate = new Date(formatWatchDate(alertInfo.properties.EXPIRE).getTime());
    
    var issuedFormatted = issuedDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    var expiresFormatted = expiresDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    var details = `<p style="margin: 0px;"><b>Issued:</b> ${issuedFormatted}</p>`;
    details += `<p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ${expiresFormatted}</p>`;
    details += `<p style="margin: 0px;"><b>Max Hail Size:</b> ${alertInfo.properties.MAX_HAIL}"</p>`;
    details += `<p style="margin: 0px;"><b>Max Wind Gusts:</b> ${Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945)} mph</p><br>`;
    
    if (alertInfo.properties.IS_PDS) {
        details += `
            <div style="background-color: magenta; border-radius: 5px; margin: 10px 0; display: flex; justify-content: center; text-align: center;">
                <p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p>
            </div>`;
    }
    
    var probabilities = '<h3>Probabilities</h3>';
    probabilities += '<p style="margin: 5px 0;"><b>Tornado threat: </b>' + getWatchRisk(alertInfo.properties.P_TORTWO) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Strong tornado threat: </b>' + getWatchRisk(alertInfo.properties.P_TOREF2) + '</p>';
    probabilities += '<p style="margin: 5px 0;"><b>Wind threat: </b>' + getWatchRisk(alertInfo.properties.P_WIND10) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Strong wind threat: </b>' + getWatchRisk(alertInfo.properties.P_WIND65) + '</p>';
    probabilities += '<p style="margin: 5px 0;"><b>Hail threat: </b>' + getWatchRisk(alertInfo.properties.P_HAIL10) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Severe hail threat: </b>' + getWatchRisk(alertInfo.properties.P_HAIL2I) + '</p>';

    document.getElementById('watch-popup-details').innerHTML = details;
    document.getElementById('watch-popup-probabilities').innerHTML = probabilities;
    popup.classList.add('show');
}

    function closeWatchPopup() {
        var popup = document.getElementById('watch-popup');
        popup.classList.add('fade-out');
        setTimeout(() => {
            popup.classList.remove('show', 'fade-out');
        }, 300);
    }

    // Add this function to convert date strings to Date objects
    function formatWatchDate(timestamp) {
        const year = parseInt(timestamp.slice(0, 4));
        const month = parseInt(timestamp.slice(4, 6)) - 1; // JavaScript months are 0-based
        const day = parseInt(timestamp.slice(6, 8));
        const hour = parseInt(timestamp.slice(8, 10));
        const minute = parseInt(timestamp.slice(10, 12));

        return new Date(Date.UTC(year, month, day, hour, minute));
    }


// Checks watches to make sure they are not expired
function isWatchValid(timestamp) {
    // Parse the timestamp
    const year = parseInt(timestamp.slice(0, 4), 10);
    const month = parseInt(timestamp.slice(4, 6), 10) - 1; // Months are 0-based in JS
    const day = parseInt(timestamp.slice(6, 8), 10);
    const hours = parseInt(timestamp.slice(8, 10), 10);
    const minutes = parseInt(timestamp.slice(10, 12), 10);

    // Create a Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month, day, hours, minutes));

    // Get the current time in UTC
    const nowUTC = new Date();

    // Compare the two dates
    return (dateUTC > nowUTC);
}

    
function loadWatches() {
    if (!watchesON) return;

    console.log("Getting watches");
    const xhr = new XMLHttpRequest();
    const currentDate = new Date();
    xhr.open('GET', `https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=${currentDate.getFullYear()}&month1=${currentDate.getMonth() + 1}&day1=${currentDate.getDate()}&hour1=0&minute1=0&year2=${currentDate.getFullYear()}&month2=${currentDate.getMonth() + 1}&day2=${currentDate.getDate()}&hour2=23&minute2=0&format=geojson`, true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const watches = JSON.parse(xhr.responseText).features;
watches.forEach(function(watch) {
    const thisItem = reverseSubarrays(watch.geometry.coordinates[0][0]);
    
    if (isWatchValid(watch.properties.EXPIRE)) {
        if ((watch.properties.TYPE == "SVR" && displaySvrWatches) || (watch.properties.TYPE == "TOR" && displayTorWatches)) {
            // Create the white border polygon
            const border = L.polygon(thisItem, {
                color: 'black',
                weight: 6, // Border weight
                fillOpacity: 0 // Ensure border has no fill
            }).addTo(map);

            // Create the main watch polygon
            const polygon = L.polygon(thisItem, {
                color: watch.properties.TYPE == "SVR" ? '#998207' : '#841213', // Main color
                weight: 3, // Main polygon weight, smaller than the border
                fillOpacity: 0 // No fill for alert polygons
            }).addTo(map);

            polygon.bindPopup(getWatch(watch), {
                autoPan: true,
                maxHeight: '600',
                maxWidth: '500',
                className: 'alertpopup'
            });

            polygon.on('click', function (e) {
                e.originalEvent.stopPropagation();
            });

            // Store the polygon with its expiration time for potential cleanup
            const expirationTime = formatWatchDate(watch.properties.EXPIRE).getTime();
            watchPolygons[expirationTime] = polygon;

            console.log(`Added watch: ${JSON.stringify(watch.properties)}`);
            console.log(`Watch expiration time: ${new Date(expirationTime).toISOString()} (${expirationTime})`);
        }
    }
});

            watchesLoaded = true;
            checkIfLoadingComplete();
        }
    };
    xhr.send();
}

let currentLocationMarker = null;
let watchId = null;
let isLocationOn = false;

function startUpdatingLocation() {
    if (navigator.geolocation) {
        if (watchId === null) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Place or update the custom circle marker at the user's location
                   if (currentLocationMarker) {
    currentLocationMarker.setLatLng([lat, lon]);
} else {
    currentLocationMarker = L.circleMarker([lat, lon], {
        radius: 10, // Adjust the size as needed
        fillColor: '#7F1DF0', // Purple fill color
        color: '#FFFFFF', // White border color
        weight: 5, // Border width
        opacity: 1,
        fillOpacity: 1,
        interactive: false // Make it non-clickable
    }).addTo(map);

    // Only center the map on the location when first adding the marker
    if (isLocationOn) {
        map.flyTo([lat, lon], 8); // Adjust the zoom level as needed
    }
}

                },
                (error) => {
                    console.error("Error getting current location: ", error);
                },
                {
                    enableHighAccuracy: true, // Request the most accurate position
                    maximumAge: 5000, // Do not use cached position
                }
            );
        }
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function clearCurrentLocationMarker() {
    if (currentLocationMarker) {
        map.removeLayer(currentLocationMarker);
        currentLocationMarker = null;
    }
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function toggleLocation() {
    isLocationOn = !isLocationOn;

    const locationButton = document.getElementById('current-location-button');

    if (isLocationOn) {
        locationButton.style.backgroundColor = "white";
        locationButton.style.color = "#7F1DF0";
        locationButton.style.border = "2px solid #636381";
        startUpdatingLocation();
    } else {
        locationButton.style.backgroundColor = "#636381";
        locationButton.style.color = "white";
        locationButton.style.border = "2px solid white";
        clearCurrentLocationMarker();
    }
}

document.getElementById('current-location-button').addEventListener('click', toggleLocation);

// Clear the location marker on page unload
window.addEventListener('beforeunload', clearCurrentLocationMarker);

// Function to initialize button states
function initializeButtonStates() {
    var alertButton = document.getElementById("refreshalerts");
    var alertsMenuButton = document.getElementById("alerts-menu-button");
    var watchButton = document.getElementById("togglewatches");
    var locationButton = document.getElementById('current-location-button');
    var reportsButton = document.getElementById("togglereports"); // Added reports button

    // Initialize alert button states
    if (alertON) {
        alertButton.style.backgroundColor = "white";
        alertButton.style.color = "#7F1DF0";
        alertButton.style.border = "2px solid #636381 !important"; // Normal border

        alertsMenuButton.style.backgroundColor = "white";
        alertsMenuButton.style.color = "#7F1DF0";
        alertsMenuButton.style.border = "2px solid #636381 !important"; // Normal border
    } else {
        alertButton.style.backgroundColor = "#636381";
        alertButton.style.color = "white";
        alertButton.style.border = "2px solid white"; // White border when toggled off

        alertsMenuButton.style.backgroundColor = "#636381";
        alertsMenuButton.style.color = "white";
        alertsMenuButton.style.border = "2px solid white"; // White border when toggled off
    }

    // Initialize watches button states
    if (watchesON) {
        watchButton.style.backgroundColor = "white";
        watchButton.style.color = "#7F1DF0";
        watchButton.style.border = "2px solid #636381 !important"; // Normal border
    } else {
        watchButton.style.backgroundColor = "#636381";
        watchButton.style.color = "white";
        watchButton.style.border = "2px solid white"; // White border when toggled off
    }

    // Initialize location button states
    if (isLocationOn) {
        locationButton.style.backgroundColor = "white";
        locationButton.style.color = "#7F1DF0";
        locationButton.style.border = "2px solid #636381";
    } else {
        locationButton.style.backgroundColor = "#636381";
        locationButton.style.color = "white";
        locationButton.style.border = "2px solid white";
    }

    // Initialize reports button states
    if (reportsON) {
        reportsButton.style.backgroundColor = "white";
        reportsButton.style.color = "#7F1DF0";
        reportsButton.style.border = "2px solid #636381"; // Normal border when on
    } else {
        reportsButton.style.backgroundColor = "#636381";
        reportsButton.style.color = "white";
        reportsButton.style.border = "2px solid white"; // White border when toggled off
    }
}


// Call the initialize function on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeButtonStates();
});

// Ensure the map is displayed correctly after the changes
map.invalidateSize();

// Radar refresh interval
setInterval(refreshRadar, 60000); // Refresh radar every 1 minute in the background

// Helper function to log all current watches for debugging
function logCurrentWatches() {
    console.log("Current watches in watchPolygons:");
    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        console.log(`Watch expiration time: ${expirationDate.toISOString()} (${parsedExpirationTime})`);
    }
}

// Call logCurrentWatches to see the current watches
logCurrentWatches();

var loadingScreen = document.getElementById('loading-screen');


function checkIfLoadingComplete() {
    if (watchesLoaded && alertsLoaded) {
        // Fade out the loading screen
        const loadingScreen = document.getElementById('loading-screen');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            isLoadingScreenVisible = false; // Set flag to false after hiding the loading screen
            checkConnection(); // Check connection after hiding the loading screen
        }, 3500); // Remove loading screen after fade out
    }
}


function updateAlertOpacity(value) {
    alertOpacity = parseFloat(value);
    document.getElementById('alert-opacity-value').textContent = value;
    polygons.forEach(polygon => {
        if (polygon.options.color !== "#516BFF" && polygon.options.color !== "#FE5859") { // Ensure this condition matches your watch polygon colors
            polygon.setStyle({ fillOpacity: alertOpacity });
        }
    });
    saveSettings(); // Save settings after changing alert opacity
}

function updateRadarOpacity(value) {
    radarOpacity = parseFloat(value);
    document.getElementById('radar-opacity-value').textContent = value;
    Object.values(radarLayers).forEach(layer => {
        if (layer && map.hasLayer(layer)) {
            layer.setOpacity(radarOpacity);
        }
    });
    saveSettings(); // Save settings after changing radar opacity
}


        function formatDate(inputDateString) {
            const inputDate = new Date(inputDateString);
          
            const timeString = inputDate.toTimeString();
          
            const hours = inputDate.getHours();
            const minutes = inputDate.getMinutes();
          
            const formattedHours = (hours % 12) || 12;
          
            const amOrPm = hours >= 12 ? 'PM' : 'AM';
          
            const formattedTimeString = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${amOrPm}`;
          
            return formattedTimeString;
        }

        function startLoadingTile() {
            loadingTilesCount++;    
        }
        function finishLoadingTile() {
            setTimeout(function() { loadedTilesCount++; }, 250);
        }
        function isTilesLoading() {
            return loadingTilesCount > loadedTilesCount;
        }

        var apiRequest = new XMLHttpRequest();
        
        apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
pane: 'radarPane',
        apiRequest.onload = function(e) {
            apiData = JSON.parse(apiRequest.response);
            console.log("API Data Loaded:", apiData);
            initialize(apiData, optionKind);
        };
        apiRequest.onerror = function(e) {
            console.error("API request error:", e);
        };
        apiRequest.send();

function initialize(api, kind) {
    console.log("Initializing map with kind:", kind);
    for (var i in radarLayers) {
        map.removeLayer(radarLayers[i]);
    }
    for (var j in polygons) {
        map.removeLayer(polygons[j]);
    }
    mapFrames = [];
    radarLayers = [];
    polygons = [];
    animationPosition = 0;

    if (!api) {
        console.error("API data is not available.");
        return;
    }
    if (kind === 'radar' && api.radar && api.radar.past) {
        mapFrames = api.radar.past;
        if (api.radar.nowcast) {
            if (doFuture) {
                mapFrames = mapFrames.concat(api.radar.nowcast);
            }
        }

        lastPastFramePosition = api.radar.past.length - 1;
        showFrame(lastPastFramePosition, true);
    } else if (kind === 'satellite' && api.satellite && api.satellite.infrared) {
        mapFrames = api.satellite.infrared;
        lastPastFramePosition = api.satellite.infrared.length - 1;
        showFrame(lastPastFramePosition, true);
    }

  loadWatches();
    setTimeout(() => {
        loadReports();
        // Fade out the loading screen after the delay
        setTimeout(() => loadingScreen.style.display = 'none', 300); // Remove loading screen after fade out
    }, 3500); // Adjust the delay as needed

    // Load severe weather reports after everything else is set up
    setTimeout(() => {
        loadAlerts();
    }, 800); // Adjust this delay to fit with your existing timings
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to toggle the display of the Toggle Outlooks button
    function showToggleOutlooksButton() {
        document.getElementById('toggle-outlooks').style.display = 'block';
    }

    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="outlook"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (this.checked) {
                showToggleOutlooksButton();
            }
        });
    });

    // Function to toggle the outlooks
    function toggleOutlooks() {
        let outlooksOn = document.querySelectorAll('input[name="outlook"]:checked').length > 0;
        if (!outlooksOn) {
            document.querySelector('input[value="day1"]').checked = true;
            // Add logic to select the Day 1 Convective Outlook
        } else {
            document.querySelectorAll('input[name="outlook"]').forEach(function(radio) {
                radio.checked = false;
            });
            // Add logic to turn off all outlooks
        }
    }

    // Add event listener to the Toggle Outlooks button
    // Try-catch to prevent errors when no outlook is selected
    try {
        document.getElementById('toggle-outlooks').addEventListener('click', toggleOutlooks);
    } catch {
        console.log("No outlook selected.")
    }
});

function cleanupExpiredWatches() {
    const currentTime = Date.now();
    console.log(`Performing cleanup for expired watches at: ${new Date(currentTime)} (${currentTime})`);
    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        const currentDate = new Date(currentTime);
        console.log(`Current time: ${currentDate}, Watch expiration time: ${expirationDate}`);

        if (currentTime > parsedExpirationTime) {
            const polygon = watchPolygons[parsedExpirationTime];
            map.removeLayer(polygon);
            delete watchPolygons[parsedExpirationTime];
            console.log(`Cleaned up expired watch with expiration time: ${expirationDate} (${parsedExpirationTime})`);
        }
    }
}

// Schedule cleanup
setInterval(cleanupExpiredWatches, 60000); // Check every minute



let selectedVoice = null;
let isPlaying = false;
let isPaused = false;
let speechSynthesisUtterance = null;

// Function to populate the voice list
function populateVoiceList() {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
        // Check platform to prioritize voice selection
        const isAppleDevice = /Mac|iPhone|iPod|iPad/.test(navigator.platform);
        
        // For Apple devices, try to find 'Samantha'
        if (isAppleDevice) {
            selectedVoice = voices.find(voice => voice.name.includes('Samantha')) || voices[0];
        } else {
            // For Windows/PC, try to find 'Microsoft David Desktop - English (United States)'
            selectedVoice = voices.find(voice => voice.name === 'Microsoft David Desktop - English (United States)') || voices[0];
        }
        
        console.log("Selected voice:", selectedVoice.name); // Debug: Log the selected voice
    } else {
        console.warn("No voices found!");
    }
}

// Load the voices properly
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}
populateVoiceList();  // Call initially in case voices are already loaded

// Text formatting function
function formatTextForSpeech(text) {
    // Convert "mph" to "miles per hour"
    text = text.replace(/\bmph\b/gi, 'miles per hour');
    
    // Convert "kts" to "knots"
    text = text.replace(/\bkts\b/gi, 'knots');

    // Convert numbers to words (basic case for common speeds, temperatures, etc.)
    text = text.replace(/\b5\b/g, 'five');
    text = text.replace(/\b10\b/g, 'ten');
    text = text.replace(/\b15\b/g, 'fifteen');
    text = text.replace(/\b20\b/g, 'twenty');
    text = text.replace(/\b25\b/g, 'twenty-five');
    text = text.replace(/\b30\b/g, 'thirty');
    text = text.replace(/\b35\b/g, 'thirty-five');
    text = text.replace(/\b40\b/g, 'forty');
    text = text.replace(/\b45\b/g, 'forty-five');
    text = text.replace(/\b50\b/g, 'fifty');
    text = text.replace(/\b55\b/g, 'fifty-five');
    text = text.replace(/\b60\b/g, 'sixty');
    text = text.replace(/\b65\b/g, 'sixty-five');
    text = text.replace(/\b70\b/g, 'seventy');
    text = text.replace(/\b75\b/g, 'seventy-five');
    text = text.replace(/\b80\b/g, 'eighty');
    text = text.replace(/\b85\b/g, 'eighty-five');
    text = text.replace(/\b90\b/g, 'ninety');
    text = text.replace(/\b95\b/g, 'ninety-five');
    text = text.replace(/\bAL\b/g, 'Alabama');
    text = text.replace(/\bAK\b/g, 'Alaska');
    text = text.replace(/\bAZ\b/g, 'Arizona');
    text = text.replace(/\bAR\b/g, 'Arkansas');
    text = text.replace(/\bCA\b/g, 'California');
    text = text.replace(/\bCO\b/g, 'Colorado');
    text = text.replace(/\bCT\b/g, 'Connecticut');
    text = text.replace(/\bDE\b/g, 'Delaware');
    text = text.replace(/\bFL\b/g, 'Florida');
    text = text.replace(/\bGA\b/g, 'Georgia');
    text = text.replace(/\bHI\b/g, 'Hawaii');
    text = text.replace(/\bID\b/g, 'Idaho');
    text = text.replace(/\bIL\b/g, 'Illinois');
    text = text.replace(/\bIN\b/g, 'Indiana');
    text = text.replace(/\bIA\b/g, 'Iowa');
    text = text.replace(/\bKS\b/g, 'Kansas');
    text = text.replace(/\bKY\b/g, 'Kentucky');
    text = text.replace(/\bLA\b/g, 'Louisiana');
    text = text.replace(/\bME\b/g, 'Maine');
    text = text.replace(/\bMD\b/g, 'Maryland');
    text = text.replace(/\bMA\b/g, 'Massachusetts');
    text = text.replace(/\bMI\b/g, 'Michigan');
    text = text.replace(/\bMN\b/g, 'Minnesota');
    text = text.replace(/\bMS\b/g, 'Mississippi');
    text = text.replace(/\bMO\b/g, 'Missouri');
    text = text.replace(/\bMT\b/g, 'Montana');
    text = text.replace(/\bNE\b/g, 'Nebraska');
    text = text.replace(/\bNV\b/g, 'Nevada');
    text = text.replace(/\bNH\b/g, 'New Hampshire');
    text = text.replace(/\bNJ\b/g, 'New Jersey');
    text = text.replace(/\bNM\b/g, 'New Mexico');
    text = text.replace(/\bNY\b/g, 'New York');
    text = text.replace(/\bNC\b/g, 'North Carolina');
    text = text.replace(/\bND\b/g, 'North Dakota');
    text = text.replace(/\bOH\b/g, 'Ohio');
    text = text.replace(/\bOK\b/g, 'Oklahoma');
    text = text.replace(/\bOR\b/g, 'Oregon');
    text = text.replace(/\bPA\b/g, 'Pennsylvania');
    text = text.replace(/\bRI\b/g, 'Rhode Island');
    text = text.replace(/\bSC\b/g, 'South Carolina');
    text = text.replace(/\bSD\b/g, 'South Dakota');
    text = text.replace(/\bTN\b/g, 'Tennessee');
    text = text.replace(/\bTX\b/g, 'Texas');
    text = text.replace(/\bUT\b/g, 'Utah');
    text = text.replace(/\bVT\b/g, 'Vermont');
    text = text.replace(/\bVA\b/g, 'Virginia');
    text = text.replace(/\bWA\b/g, 'Washington');
    text = text.replace(/\bWV\b/g, 'West Virginia');
    text = text.replace(/\bWI\b/g, 'Wisconsin');
    text = text.replace(/\bWY\b/g, 'Wyoming');
    text = text.replace(/\bnm\b/g, 'nautical miles');

    // Time zone formatting (if needed)
    text = text.replace(/\bEDT\b/g, 'Eastern Daylight Time');
    text = text.replace(/\bEST\b/g, 'Eastern Standard Time');
    text = text.replace(/\bCDT\b/g, 'Central Daylight Time');
    text = text.replace(/\bCST\b/g, 'Central Standard Time');
    text = text.replace(/\bMDT\b/g, 'Mountain Daylight Time');
    text = text.replace(/\bMST\b/g, 'Mountain Standard Time');
    text = text.replace(/\bPDT\b/g, 'Pacific Daylight Time');
    text = text.replace(/\bPST\b/g, 'Pacific Standard Time');
    
    return text;
}

// Function to toggle TTS playback and handle radio state
function toggleListen() {
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (!selectedVoice) {
        console.warn("Voice is not loaded yet.");
        return;
    }

    if (isPlaying) {
        if (isPaused) {
            window.speechSynthesis.resume();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Pause Alert';
            isPaused = false;
            updateButtonStyle(playPauseBtn, true); // Apply "on" style
        } else {
            window.speechSynthesis.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Resume Alert';
            isPaused = true;
            updateButtonStyle(playPauseBtn, false, true); // Apply "resume" style
        }
    } else {
        let descriptionText = document.getElementById('popup-description').innerText || '';
        let actionText = document.getElementById('popup-action').innerText || '';
        if (!descriptionText && !actionText) {
            console.warn("No description or action text available!");
            return;
        }

        const alertText = formatTextForSpeech(descriptionText + ' ' + actionText);

        window.speechSynthesis.cancel();
        speechSynthesisUtterance = new SpeechSynthesisUtterance(alertText);
        speechSynthesisUtterance.lang = 'en-US';
        speechSynthesisUtterance.voice = selectedVoice;

        // Check if radio is playing and pause if so
        let player = document.getElementById('global-player');
        if (!player.paused) {
            player.pause();
            weatherRadioWasPlaying = true;
        }

        speechSynthesisUtterance.onend = function() {
            resetSpeechAndButton(playPauseBtn);

            // Resume radio if it was playing before TTS
            if (weatherRadioWasPlaying) {
                player.play();
                weatherRadioWasPlaying = false;
            }
        };

        window.speechSynthesis.speak(speechSynthesisUtterance);
        playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Pause Alert';
        isPlaying = true;
        isPaused = false;
        updateButtonStyle(playPauseBtn, true); // Apply "on" style for Pause Alert
    }
}


// Function to reset TTS state and button appearance
function resetSpeechAndButton(playPauseBtn) {
    window.speechSynthesis.cancel();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Play Alert';
    isPlaying = false;
    isPaused = false;
}

// Helper function to update button styles for on/off states
function updateButtonStyle(button, isOn, isResume = false) {
    if (isResume) {
        // Keep "Resume Alert" the same style as "Play Alert"
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    } else if (isOn) {
        // ON style (when playing)
        button.style.backgroundColor = "white"; 
        button.style.color = "#7F1DF0";  // Purple text
        button.style.border = "2px solid #636381"; // Gray border
    } else {
        // OFF style (for Play Alert or Resume Alert)
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    }
}

// Function to reset the speech synthesis and button states
function resetSpeechAndButton(playPauseBtn) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Reset button state to "Play Alert"
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i>Play Alert';
    updateButtonStyle(playPauseBtn, false);

    isPlaying = false;
    isPaused = false;
}


// Helper function to update button styles for on/off states
function updateButtonStyle(button, isOn) {
    if (isOn) {
        // ON style
        button.style.backgroundColor = "white"; 
        button.style.color = "#7F1DF0";  // Purple text
        button.style.border = "2px solid #636381"; // Gray border
    } else {
        // OFF style
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    }
}

// Function to reset the speech synthesis and button states
function resetSpeechAndButton(playPauseBtn) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Reset button state to "Play Alert"
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i>Play Alert';
    updateButtonStyle(playPauseBtn, false);

    isPlaying = false;
    isPaused = false;
}




var reportsON = true;
var refreshInterval;
var displayTorReports = true;
var displayHalReports = true;
var displayWndReports = true;

// Function to toggle reports on and off
function toggleReports() {
    reportsON = !reportsON;
    var reportsButton = document.getElementById("togglereports");

    console.log("Reports ON:", reportsON);

    if (reportsON) {
        reportsButton.style.backgroundColor = "white";
        reportsButton.style.color = "#7F1DF0";
        reportsButton.style.border = "2px solid #636381";
        loadReports(); // Load reports when toggled on
        startAutoRefresh(); // Start auto-refreshing every minute
    } else {
        reportsButton.style.backgroundColor = "#636381";
        reportsButton.style.color = "white";
        reportsButton.style.border = "2px solid white";
        removeReports(); // Remove reports when toggled off
        stopAutoRefresh(); // Stop auto-refreshing
    }
    saveSettings(); // Save the report toggle state
}

// Function to clear existing markers from the map
function removeReports() {
    console.log("Removing reports...");
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker && 
           (layer.options.className === 'tor-marker' || 
            layer.options.className === 'hail-marker' || 
            layer.options.className === 'wind-marker')) {
            map.removeLayer(layer);
            console.log("Removed:", layer.options.className);
        }
    });
}

// Function to start auto-refreshing reports every minute
function startAutoRefresh() {
    refreshInterval = setInterval(loadReports, 60000); // Refresh every 60 seconds
}

// Function to stop auto-refreshing reports
function stopAutoRefresh() {
    clearInterval(refreshInterval);
}


// Initialize button states on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings(); // Load saved settings
    if (reportsON) {
        startAutoRefresh(); // Start auto-refreshing if reports are on
        loadReports(); // Load reports when the page loads
    } else {
        removeReports(); // Remove any existing reports if they are on
    }
    updateButtonState(document.getElementById("togglereports"), reportsON); // Update button appearance
});


// Function to fetch and parse CSV
async function getCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    jsonData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return JSON.stringify(jsonData, null, 2);
}

function getReport(polycoords, type) {
    var alertInfo = polycoords;
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    if (type == "Tornado Report") {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
    } else if (type == "Wind Report") {
        alertTitlebackgroundColor = "blue";
    } else if (type == "Hail Report") {
        alertTitlebackgroundColor = "green";
    }

    var construct = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + type + '</div><br>';
    
    const timestamp = alertInfo.Time;
    const hour = parseInt(timestamp.substring(0, 2));
    const minute = parseInt(timestamp.substring(2, 4));
    const reportDate = new Date();
    reportDate.setUTCHours(hour, minute); // Use setUTCHours to set the time in UTC

    // Get the current time
    const currentTime = new Date();

    // Calculate the time difference in hours
    const timeDifference = (currentTime - reportDate) / (1000 * 60 * 60);

    // Skip reports older than 2 hours
    if (timeDifference > 2) {
        return null; // Return null if the report is older than 2 hours
    }

    const options = {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const newTime = reportDate.toLocaleString('en-US', options);

    construct = construct + '<p style="margin: 0px;"><b>Report Time:</b> ' + newTime + '</p>';

    if (type == "Tornado Report") {
        construct = construct + '<p style="margin: 0px;"><b>EF-Rating:</b> ' + alertInfo.F_Scale + '</p>';
    } else if (type == "Wind Report" && alertInfo.Speed != "UNK") {
        construct = construct + '<p style="margin: 0px;"><b>Wind Speed:</b> ' + alertInfo.Speed + 'mph</p>';
    } else if (type == "Hail Report") {
        construct = construct + '<p style="margin: 0px;"><b>Hail Size:</b> ' + Math.ceil(alertInfo.Size / 100) + '"</p>';
    }

    construct = construct + '<p style="margin: 0px;"><b>Location:</b> ' + alertInfo.Location + "; " + alertInfo.County + ", " + alertInfo.State + " (" + alertInfo.Lat + ", " + alertInfo.Lon + ")" + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Comments:</b> ' + alertInfo.Comments + '</p><br>';

    construct = construct + '</div>';

    return construct;
}


async function loadReports() {
    removeReports(); // Clear existing markers before adding new ones

    // Load Tornado Reports
    if (displayTorReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_torn.csv').then(json => {
            var torreps = JSON.parse(json);
            torreps.forEach(report => {
                try {
                    const popupContent = getReport(report, "Tornado Report");
                    if (popupContent) { // Only add if the report is within 2 hours
                        const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon), {icon: tornadoReport}], {
                            className: 'tor-marker'
                        }).addTo(map);
                        marker.setIcon(tornadoReport);
                        marker.bindPopup(popupContent, { "autoPan": true, 'maxheight': '300', 'maxWidth': '250', 'className': 'alertpopup' });
                        
                        // Check if the report is more than 2 hours old
                        const reportTime = report.Time;
                        const reportDate = getUTCReportDate(reportTime);
                        const now = new Date();
                        const timeDifference = (now - reportDate) / (1000 * 60 * 60); // Difference in hours

                        if (timeDifference > 2) {
                            map.removeLayer(marker); // Remove marker if it's older than 2 hours
                        }
                    }
                } catch (error) {
                    console.warn("Error adding tornado report:", error);
                }
            });
        });
    }

    // Load Hail Reports
    if (displayHalReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_hail.csv').then(json => {
            var reps = JSON.parse(json);
            reps.forEach(report => {
                try {
                    const popupContent = getReport(report, "Hail Report");
                    if (popupContent) { // Only add if the report is within 2 hours
                        const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon), {icon: hailReport}], {
                            className: 'hail-marker'
                        }).addTo(map);
                        marker.setIcon(hailReport);
                        marker.bindPopup(popupContent, { "autoPan": true, 'maxheight': '300', 'maxWidth': '250', 'className': 'alertpopup' });

                        // Check if the report is more than 2 hours old
                        const reportTime = report.Time;
                        const reportDate = getUTCReportDate(reportTime);
                        const now = new Date();
                        const timeDifference = (now - reportDate) / (1000 * 60 * 60); // Difference in hours

                        if (timeDifference > 2) {
                            map.removeLayer(marker); // Remove marker if it's older than 2 hours
                        }
                    }
                } catch (error) {
                    console.warn("Error adding hail report:", error);
                }
            });
        });
    }

    // Load Wind Reports
    if (displayWndReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_wind.csv').then(json => {
            var reps = JSON.parse(json);
            reps.forEach(report => {
                try {
                    const popupContent = getReport(report, "Wind Report");
                    if (popupContent) { // Only add if the report is within 2 hours
                        const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon), {icon: windReport}], {
                            className: 'wind-marker'
                        }).addTo(map);
                        marker.setIcon(windReport);
                        marker.bindPopup(popupContent, { "autoPan": true, 'maxheight': '300', 'maxWidth': '250', 'className': 'alertpopup' });

                        // Check if the report is more than 2 hours old
                        const reportTime = report.Time;
                        const reportDate = getUTCReportDate(reportTime);
                        const now = new Date();
                        const timeDifference = (now - reportDate) / (1000 * 60 * 60); // Difference in hours

                        if (timeDifference > 2) {
                            map.removeLayer(marker); // Remove marker if it's older than 2 hours
                        }
                    }
                } catch (error) {
                    console.warn("Error adding wind report:", error);
                }
            });
        });
    }

    // Return a Promise to ensure proper timing if necessary
    return new Promise((resolve) => setTimeout(resolve, 1000));
}

function getUTCReportDate(reportTime) {
    const hour = parseInt(reportTime.substring(0, 2));
    const minute = parseInt(reportTime.substring(2, 4));
    
    // Get the current date
    const reportDate = new Date();
    const currentDate = new Date();
    
    // Set the report time (UTC hours and minutes)
    reportDate.setUTCHours(hour, minute, 0, 0); // Set report time in UTC

    // If the report time is ahead of the current time, assume it was from yesterday
    if (reportDate > currentDate) {
        reportDate.setUTCDate(reportDate.getUTCDate() - 1);
    }

    return reportDate;
}

// Utility function to update the button appearance based on state
function updateButtonState(button, isActive) {
    if (isActive) {
        button.style.backgroundColor = "white";
        button.style.color = "#7F1DF0";
        button.style.border = "2px solid #636381";
    } else {
        button.style.backgroundColor = "#636381";
        button.style.color = "white";
        button.style.border = "2px solid white";
    }
}

 
        function addLayer(frame) {
        if (!radarLayers[frame.path]) {
            var colorScheme = optionKind == 'satellite' ? 0 : optionColorScheme;
            var smooth = optionSmoothData;
            var snow = optionSnowColors;

            var source = new L.TileLayer(apiData.host + frame.path + '/' + optionTileSize + '/{z}/{x}/{y}/' + colorScheme + '/' + smooth + '_' + snow + '.png', {
                tileSize: 256,
                opacity: 0, // Set initial opacity to 0
                zIndex: frame.time
            });

            source.on('loading', startLoadingTile);
            source.on('load', finishLoadingTile); 
            source.on('remove', finishLoadingTile);

            radarLayers[frame.path] = source;
        }
        if (!map.hasLayer(radarLayers[frame.path])) {
            map.addLayer(radarLayers[frame.path]);
        }
    }

var loadingScreen = document.getElementById('loading-screen');

apiRequest.onload = function(e) {
    apiData = JSON.parse(apiRequest.response);
    console.log("API Data Loaded:", apiData);
    initialize(apiData, optionKind);
    // Remove the loading screen after initializing
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.style.display = 'none', 300); // Remove loading screen after fade out
    }, 3200); // Adjust the delay as needed
};

    function updateRadarOpacity(value) {
        radarOpacity = parseFloat(value);
        document.getElementById('radar-opacity-value').textContent = value;
 // Update the opacity of the current frame only
        var currentFrame = mapFrames[animationPosition];
        if (currentFrame && radarLayers[currentFrame.path]) {
            radarLayers[currentFrame.path].setOpacity(radarOpacity);
        }

        saveSettings(); // Save settings after changing radar opacity
    }


let lastFrameTime = 0; // Keep track of the last frame update time
const throttleDelay = 200; // Delay in milliseconds (adjust this as needed)

function showFrame(nextPosition, force) {
    const now = Date.now();

    // If the last frame update was within the throttleDelay, don't proceed
    if (now - lastFrameTime < throttleDelay) return;

    // Update the timestamp of the last frame update
    lastFrameTime = now;

    // Remove the current frame before loading the next one
    var currentFrame = mapFrames[animationPosition];

    // Ensure the current frame exists and remove it
    if (currentFrame && radarLayers[currentFrame.path]) {
        map.removeLayer(radarLayers[currentFrame.path]);
    }

    var preloadingDirection = nextPosition - animationPosition > 0 ? 1 : -1;

    // Load the next frame
    changeRadarPosition(nextPosition, false, force);

    // Optionally preload the next frame in the direction of movement
    changeRadarPosition(nextPosition + preloadingDirection, true);
}

// Add an event listener for the keydown event
document.addEventListener('keydown', function(event) {
    // Check if the 'R' key is pressed
    if (event.key === 'r' || event.key === 'R') {
        refreshRadar(); // Call the radar refresh function
        console.log("Radar refresh triggered by 'R' key");
    }
});


         let animationSpeedMultiplier = parseFloat(localStorage.getItem('animationSpeedMultiplier')) || 1.0;  // Load saved speed or default to 1x
    updateSpeedButton();

    function toggleAnimationSpeed() {
        if (animationSpeedMultiplier === 1.0) {
            animationSpeedMultiplier = 2.0;  // Faster speed
            localStorage.setItem('animationSpeedMultiplier', animationSpeedMultiplier);  // Save to localStorage
        } else if (animationSpeedMultiplier === 2.0) {
            animationSpeedMultiplier = 0.5;  // Slower speed
            localStorage.setItem('animationSpeedMultiplier', animationSpeedMultiplier);  // Save to localStorage
        } else {
            animationSpeedMultiplier = 1.0;  // Back to normal speed
            localStorage.setItem('animationSpeedMultiplier', animationSpeedMultiplier);  // Save to localStorage
        }
        updateSpeedButton();
    }

    function updateSpeedButton() {
        let speedButton = document.getElementById("speed-button");
        if (animationSpeedMultiplier === 1.0) {
            speedButton.innerHTML = '<i class="fa-solid fa-forward"></i> Animation Speed: 1x';
        } else if (animationSpeedMultiplier === 2.0) {
            speedButton.innerHTML = '<i class="fa-solid fa-forward"></i> Animation Speed: 2x';
        } else if (animationSpeedMultiplier === 0.5) {
            speedButton.innerHTML = '<i class="fa-solid fa-forward"></i> Animation Speed: 0.5x';
        }
    }

    function stop() {
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = false;
            return true;
        }
        return false;
    }

    function play() {
        showFrame(animationPosition + 1);

        let delay = animationPosition == 12 ? 1500 : 400;
        delay = delay / animationSpeedMultiplier;  // Adjust delay based on speed multiplier

        animationTimer = setTimeout(play, delay);
    }

    // Load animation speed on page load
    document.addEventListener("DOMContentLoaded", function() {
        animationSpeedMultiplier = parseFloat(localStorage.getItem('animationSpeedMultiplier')) || 1.0;
        updateSpeedButton();
    });


        function playStop() {
            if (!stop()) {
                document.getElementById("stbtn").innerHTML = '<i class="fa-solid fa-pause"></i>';
                play();
            } else {
                document.getElementById("stbtn").innerHTML = '<i class="fa-solid fa-play"></i>';
                stop();
            }
        }

      function setRadarType(kind) {
    if (kind == 'radar' || kind == 'satellite'){
        optionKind = kind;
        initialize(apiData, optionKind);
    } else if (kind == 'future') {
        doFuture = true;
        initialize(apiData, optionKind);
    } else if (kind == 'past') {
        doFuture = false;
        initialize(apiData, optionKind);
    }
    saveSettings(); // Save settings after changing radar type
}

        function setColors() {
            var e = document.getElementById('colors');
            optionColorScheme = e.options[e.selectedIndex].value;
            initialize(apiData, optionKind);
            saveSettings(); // Save settings after changing color scheme
        }

        function toggleHighRes() {
            optionTileSize = optionTileSize == 256 ? 512 : 256;
            document.getElementById('highres-button').innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
            initialize(apiData, optionKind);
            saveSettings(); // Save settings after toggling resolution
        }

        function toggleSmoothing() {
            optionSmoothData = optionSmoothData == 0 ? 1 : 0;
            document.getElementById('smoothing-button').innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
            initialize(apiData, optionKind);
            saveSettings(); // Save settings after toggling smoothing
        }

        document.onkeydown = function (e) {
            e = e || window.event;
            switch (e.which || e.keyCode) {
                case 37: // left
                    stop();
                    showFrame(animationPosition - 1, true);
                    break;

                case 39: // right
                    stop();
                    showFrame(animationPosition + 1, true);
                    break;

                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault();
            return false;
        };
async function refreshRadar() {
    console.log("Refreshing radar in the background");
    try {
        const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        if (!response.ok) throw new Error("Failed to fetch radar data");

        const newApiData = await response.json();
        apiData = newApiData; // Update global apiData

        // Check if the radar pane exists; if not, create it
        if (!map.getPane('radarPane')) {
            map.createPane('radarPane');
            map.getPane('radarPane').style.zIndex = 450; // Adjust z-index as needed
        }

        // Reinitialize radar layers with the updated data
        initialize(apiData, optionKind);
    } catch (error) {
        console.error("Error during radar refresh:", error);
    }
}




// Toggle alerts function
function toggleAlerts() {
    alertON = !alertON;
    var alertButton = document.getElementById("refreshalerts");
    var alertsMenuButton = document.getElementById("alerts-menu-button");
    var noAlertsMessage = document.getElementById('no-alerts-message');
    var toggleAlertsButton = document.getElementById('toggle-alerts-button');

    if (alertON) {
        alertButton.style.backgroundColor = "white";
        alertButton.style.color = "#7F1DF0";
        alertButton.style.border = "2px solid #636381"; // Normal border

        alertsMenuButton.style.backgroundColor = "white";
        alertsMenuButton.style.color = "#7F1DF0";
        alertsMenuButton.style.border = "2px solid #636381"; // Normal border

        loadAlerts();

        // Set the "No active alerts" message if there are no alerts
        if (document.getElementById('alert-log').children.length === 0) {
            noAlertsMessage.style.display = 'block';
            noAlertsMessage.querySelector('p').innerText = 'No active alerts';
            toggleAlertsButton.style.display = 'none'; // Hide the button if alerts are on but there are none
        }
    } else {
        alertButton.style.backgroundColor = "#636381";
        alertButton.style.color = "white";
        alertButton.style.border = "2px solid white"; // White border when toggled off

        alertsMenuButton.style.backgroundColor = "#636381";
        alertsMenuButton.style.color = "white";
        alertsMenuButton.style.border = "2px solid white"; // White border when toggled off

        // Remove all alerts from the map
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon && layer.options.color !== "#516BFF" && layer.options.color !== "#FE5859") {
                map.removeLayer(layer);
            }
        });

        // Clear all alerts from the log
        document.getElementById('alert-log').innerHTML = '';

        // Show "Alerts are toggled off." message
        noAlertsMessage.style.display = 'block';
        noAlertsMessage.querySelector('p').innerText = 'Alerts are toggled off';
        toggleAlertsButton.style.display = 'block'; // Show the button when alerts are toggled off
    }

    saveSettings(); // Save settings after toggling alerts
}

// Toggle watches function
function toggleWatches() {
    watchesON = !watchesON;
    var watchButton = document.getElementById("togglewatches");

    if (watchesON) {
        watchButton.style.backgroundColor = "white";
        watchButton.style.color = "#7F1DF0";
        watchButton.style.border = "2px solid #636381"; // Normal border

        // Load watches and then re-add alerts with a delay
        loadWatches();
        setTimeout(() => {
            if (alertON) {
                loadAlerts();
            }
        }, 0); // Adjust the delay as needed
    } else {
        watchButton.style.backgroundColor = "#636381";
        watchButton.style.color = "white";
        watchButton.style.border = "2px solid white"; // White border when toggled off

        // Remove watches
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon && (layer.options.color === "#516BFF" || layer.options.color === "#FE5859")) {
                map.removeLayer(layer);
            }
        });
    }
    saveSettings(); // Save settings after toggling watches
}
// Call the initialize function on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeButtonStates();
});

function toggleSmoothing() {
    optionSmoothData = optionSmoothData == 0 ? 1 : 0;
    var smoothingButton = document.getElementById('smoothing-button');
    smoothingButton.innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
    smoothingButton.classList.toggle('toggle-off', optionSmoothData == 0);
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling smoothing
}

function toggleHighRes() {
    optionTileSize = optionTileSize == 256 ? 512 : 256;
    var highResButton = document.getElementById('highres-button');
    highResButton.innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
    highResButton.classList.toggle('toggle-off', optionTileSize == 256);
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling resolution
}

document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 37: // left
            stop();
            showFrame(animationPosition - 1, true);
            break;

        case 39: // right
            stop();
            showFrame(animationPosition + 1, true);
            break;

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault();
    return false;
};

function refreshRadar() {
    console.log("Refreshing radar in the background");
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();

 refreshInvestsLayers();
 refreshHurricaneLayers();
loadLightningLayer();
refreshMesoscaleLayer();

}



















// Toggle function to add/remove lightning layer
var lightningLayerVisible = true;

// Function to toggle different layers, now including mesoscale discussions
function toggleLayer(layerType, outlookType = null) {
    if (layerType === 'radar') {
        radarON = !radarON;

        updateToggleButtonState('radar', radarON);

        document.getElementById('smoothing-button').disabled = !radarON;
        document.getElementById('highres-button').disabled = !radarON;
        document.getElementById('colors').disabled = !radarON;

        optionColorScheme = radarON ? 6 : 0;
        optionKind = 'radar';

        if (!radarON && satelliteON) {
            toggleLayer('satellite');
        }
    } else if (layerType === 'satellite') {
        satelliteON = !satelliteON;

        updateToggleButtonState('satellite', satelliteON);

        document.getElementById('smoothing-button').disabled = satelliteON;
        document.getElementById('highres-button').disabled = satelliteON;
        document.getElementById('colors').disabled = satelliteON;

        optionKind = satelliteON ? 'satellite' : 'radar';
        optionColorScheme = satelliteON ? 0 : 6;

        if (!satelliteON && radarON) {
            toggleLayer('radar');
        }
    } else if (layerType === 'hurricanes') {
        hurricanesON = !hurricanesON;
        updateToggleButtonState('hurricanes', hurricanesON);

        if (hurricanesON) {
            if (!map.hasLayer(hurricaneLayer)) map.addLayer(hurricaneLayer);
            if (!map.hasLayer(watchesWarningsLayer)) map.addLayer(watchesWarningsLayer);
            if (!map.hasLayer(coneLayer)) map.addLayer(coneLayer);
            if (!map.hasLayer(windSwathLayer)) map.addLayer(windSwathLayer);
        } else {
            if (map.hasLayer(hurricaneLayer)) map.removeLayer(hurricaneLayer);
            if (map.hasLayer(watchesWarningsLayer)) map.removeLayer(watchesWarningsLayer);
            if (map.hasLayer(coneLayer)) map.removeLayer(coneLayer);
            if (map.hasLayer(windSwathLayer)) map.removeLayer(windSwathLayer);
        }
    } else if (layerType === 'reports') {
        reportsON = !reportsON;
        updateToggleButtonState('reports', reportsON);

        if (reportsON) {
            loadReports();
            startAutoRefresh();
        } else {
            removeReports();
            stopAutoRefresh();
        }
    } else if (layerType === 'lightning') {
        // Add support for lightning toggle
        lightningLayerVisible = !lightningLayerVisible;

        updateToggleButtonState('toggle-lightning', lightningLayerVisible);

        if (lightningLayerVisible) {
            loadLightningLayer();  // Call the function to load the lightning data
        } else {
            if (map.hasLayer(lightningLayer)) {
                map.removeLayer(lightningLayer);  // Remove the lightning layer
            }
        }
    } else if (layerType === 'outlook' && outlookType) {
        const day = outlookType.split('_')[1];

        if (lastSelectedOutlook === outlookType && currentLayer) {
            removeCurrentLayer(() => {
                lastSelectedOutlook = '';
            });
        } else {
            removeCurrentLayer(() => {
                setTimeout(() => {
                    fetchOutlookData(day, outlookType, () => {
                        lastSelectedOutlook = outlookType; // Save the last selected outlook
                    });
                }, 0);
            });
        }

        saveSettings(); // Save settings whenever an outlook is toggled
    } else if (layerType === 'mesoscale') {
        // Add support for Mesoscale Discussions toggle
        mesoscaleLayerVisible = !mesoscaleLayerVisible;

        updateToggleButtonState('togglediscussions', mesoscaleLayerVisible); // Update button state

        if (mesoscaleLayerVisible) {
            if (mesoscaleLayer) {
                mesoscaleLayer.addTo(map);
            } else {
                // Initialize the layer if it's not yet loaded
                initializeMesoscaleLayer();
            }
        } else {
            if (mesoscaleLayer && map.hasLayer(mesoscaleLayer)) {
                map.removeLayer(mesoscaleLayer);
            }
        }

        // Save the visibility state to localStorage (optional)
        localStorage.setItem('mesoscaleLayerVisible', mesoscaleLayerVisible);
    }

    initialize(apiData, optionKind);
    saveSettings(); // Save settings after any layer change
}



 document.addEventListener('DOMContentLoaded', function() {
            var attributionElements = document.getElementsByClassName('leaflet-control-attribution');
            for (var i = 0; i < attributionElements.length; i++) {
                attributionElements[i].style.display = 'none';
            }
        });

  // Prevent zooming on double-tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 75) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

let currentLayer = null;
let lastSelectedOutlook = ''; // Track the last selected outlook

// Initialize the pane for outlook layers
map.createPane('outlookPane');
map.getPane('outlookPane').style.zIndex = 200;

// Function to update the outlook type when the user clicks a checkbox
function updateOutlookType(day, outlookType) {
    const selectedCheckbox = document.querySelector(`input[value="${outlookType}"]`);

    if (lastSelectedOutlook === outlookType && currentLayer) {
        // If the same outlook is clicked again, remove the layer and uncheck the checkbox
        removeCurrentLayer(() => {
            lastSelectedOutlook = '';
            selectedCheckbox.checked = false;
            saveOutlookState(); // Save the updated state after removing the outlook
        });
    } else {
        // If a different outlook is selected, update the map with the new outlook
        removeCurrentLayer(() => {
            setTimeout(() => {
                fetchOutlookData(day, outlookType, () => {
                    lastSelectedOutlook = outlookType;
                    selectedCheckbox.checked = true; // Ensure the checkbox is checked
                    saveOutlookState(); // Save the updated state after selecting the outlook
                });
            }, 0); // Slight delay before fetching
        });
    }
}

// Remove the current layer from the map
function removeCurrentLayer(callback) {
    if (currentLayer) {
        console.log('Removing current layer:', currentLayer);

        // Remove the layer from the map
        map.removeLayer(currentLayer);

        // Explicitly set it to null to ensure it's fully removed
        currentLayer = null;

        console.log('Layer removed.');
    } else {
        console.log('No layer to remove.');
    }

    // Ensure the callback function is executed after removal
    if (callback) {
        callback();
    }
}

// Fetch the outlook data and add it to the map
function fetchOutlookData(day, outlookType, callback) {
    let url = ''; // Define the URL based on outlookType

    // Map the outlook type to its corresponding URL
    const urlMapping = {
        'convective_day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson',
        'tornado_day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_torn.nolyr.geojson',
        'wind_day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_wind.nolyr.geojson',
        'hail_day1': 'https://www.spc.noaa.gov/products/outlook/day1otlk_hail.nolyr.geojson',
        'convective_day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_cat.nolyr.geojson',
        'tornado_day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_torn.nolyr.geojson',
        'wind_day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_wind.nolyr.geojson',
        'hail_day2': 'https://www.spc.noaa.gov/products/outlook/day2otlk_hail.nolyr.geojson',
        'convective_day3': 'https://www.spc.noaa.gov/products/outlook/day3otlk_cat.nolyr.geojson',
        'probability_day3': 'https://www.spc.noaa.gov/products/outlook/day3otlk_prob.nolyr.geojson'
    };

    // Get the corresponding URL for the selected outlook type
    url = urlMapping[outlookType];

    if (!url) {
        console.error('Invalid outlook type selected');
        return;
    }

    console.log('Fetching GeoJSON from URL:', url);

    // Fetch and display the new layer
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched GeoJSON data:', JSON.stringify(data, null, 2));

            currentLayer = L.geoJSON(data, {
                style: function (feature) {
                    const label = feature.properties.LABEL2;
                    const adjustedLabel = label === "10% Significant Wind Risk" ? "30% Significant Wind Risk" : label;
                    return {
                        color: getBorderColor(adjustedLabel),
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0
                    };
                },
                pane: 'outlookPane', // Use the custom pane for this layer
                interactive: true, // Makes the layer clickable
                onEachFeature: function (feature, layer) {
                    // Bind popup to the feature
                    var popupContent = generateOutlookPopupContent(feature.properties);
                    layer.bindPopup(popupContent, {
                        autoPan: true,
                        maxHeight: '200',
                        maxWidth: '300',
                        className: 'alertpopup'
                    });
                }
            }).addTo(map);

            // Ensure the callback function is executed after fetching and adding the layer
            if (callback) {
                callback();
            }
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
        });
}

// Generate popup content for outlook layers
function generateOutlookPopupContent(properties) {
    let riskLabel = properties.LABEL2;

    // Override the display for "10% Significant Wind Risk"
    if (riskLabel === "10% Significant Wind Risk") {
        riskLabel = "30% Significant Wind Risk"; // Display as 30% Significant Wind Risk
    }

    // Determine the correct icon URL based on the risk level
    let iconUrl = "";
    switch (properties.LABEL2) {
        case "General Thunderstorm Risk":
            iconUrl = "https://i.ibb.co/BLpDqjr/IMG-7262.png";
            break;
        case "Marginal Risk":
            iconUrl = "https://i.ibb.co/HTgK74M/download-32.png";
            break;
        case "Slight Risk":
            iconUrl = "https://i.ibb.co/rd1xJLg/download-33.png";
            break;
        case "Enhanced Risk":
            iconUrl = "https://i.ibb.co/b29Tb0C/download-34.png";
            break;
        case "Moderate Risk":
            iconUrl = "https://i.ibb.co/Fw0D7Ky/download-35.png";
            break;
        case "High Risk":
            iconUrl = "https://i.ibb.co/p2fBxNk/download-36.png";
            break;
        case "2% Tornado Risk":
            iconUrl = "https://i.ibb.co/r2yj8cm/2.png";
            break;
        case "5% Tornado Risk":
            iconUrl = "https://i.ibb.co/SPgBMTd/5-wind.png";
            break;
        case "10% Tornado Risk":
            iconUrl = "https://i.postimg.cc/NF0xFHd6/10-tor.png";
            break;
        case "15% Tornado Risk":
            iconUrl = "https://i.ibb.co/Vwbz2g1/IMG-7277-modified.png";
            break;
        case "30% Tornado Risk":
            iconUrl = "https://i.ibb.co/qYjRDwM/30-tor.png";
            break;
        case "45% Tornado Risk":
            iconUrl = "https://i.postimg.cc/BZhgymvM/45-tor.png";
            break;
        case "5% Wind Risk":
            iconUrl = "https://i.ibb.co/SPgBMTd/5-wind.png";
            break;
        case "15% Wind Risk":
            iconUrl = "https://i.ibb.co/jD4gf2F/15-wind.png";
            break;
        case "30% Wind Risk":
            iconUrl = "https://i.ibb.co/rpPKWXw/30-wind.png";
            break;
        case "45% Wind Risk":
            iconUrl = "https://i.ibb.co/dtkmMpp/45-wind.png";
            break;
        case "5% Hail Risk":
            iconUrl = "https://i.ibb.co/SPgBMTd/5-wind.png";
            break;
        case "15% Hail Risk":
            iconUrl = "https://i.ibb.co/jD4gf2F/15-wind.png";
            break;
        case "30% Hail Risk":
            iconUrl = "https://i.ibb.co/rpPKWXw/30-wind.png";
            break;
        case "45% Hail Risk":
            iconUrl = "https://i.ibb.co/dtkmMpp/45-wind.png";
            break;
        case "10% Significant Wind Risk": // Override icon for display as 30% Significant Wind Risk
        case "30% Significant Wind Risk":
            iconUrl = "https://i.ibb.co/rpPKWXw/30-wind.png";
            break;
        default:
            iconUrl = "https://i.ibb.co/BLpDqjr/IMG-7262.png"; // Default icon
            break;
    }

    const popupContent = `
        <div style="overflow-y: auto; display: flex; flex-direction: column;">
            <div style="display: flex; flex-direction: row; align-items: center;">
                <img src="${iconUrl}" style="width: 45px; height: 45px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 5px; padding-left: 10px; border-radius: 5px; font-size: 17px; font-weight: bolder; color: white; min-height: 45px;">
                    ${riskLabel || "General Thunderstorm Risk"}
                </div>
            </div>
        </div>
    `;
    return popupContent;
}

// Event listeners for checkboxes to handle the click event
document.querySelectorAll('input[type=checkbox]').forEach((elem) => {
    elem.addEventListener('change', function() {
        const outlookType = this.value;
        const day = outlookType.split('_')[1];

        if (this.checked) {
            // Uncheck all other checkboxes before checking the current one
            document.querySelectorAll('input[type=checkbox]').forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });

            updateOutlookType(day, outlookType);
        } else if (!this.checked && currentLayer) {
            // If unchecking the currently checked checkbox, remove the layer
            removeCurrentLayer(() => {
                lastSelectedOutlook = ''; // Reset the last selected outlook
                saveOutlookState(); // Save settings after unchecking
            });
        }
        saveOutlookState(); // Save settings after any change
    });
});

// Function to save the current state to localStorage
function saveOutlookState() {
    const checkedOutlook = document.querySelector('input[type=checkbox]:checked');
    const savedState = {
        outlookType: checkedOutlook ? checkedOutlook.value : '',
    };
    localStorage.setItem('savedOutlookState', JSON.stringify(savedState));
    console.log("Saved settings:", savedState);
}

// Load saved settings when the page loads
function initializeOutlookSettings() {
    const savedState = JSON.parse(localStorage.getItem('savedOutlookState'));
    if (savedState && savedState.outlookType) {
        const savedCheckbox = document.querySelector(`input[value="${savedState.outlookType}"]`);
        if (savedCheckbox) {
            savedCheckbox.checked = true;
            const day = savedState.outlookType.split('_')[1];
            updateOutlookType(day, savedState.outlookType);
        }
    }
}

window.addEventListener('load', initializeOutlookSettings);

// Function to get border color based on risk type
function getBorderColor(label2) {
    switch (label2) {
        case 'Marginal Risk':
            return '#005500'; // Dark green for Marginal Risk border
        case 'Slight Risk':
            return '#DDAA00'; // Dark yellow for Slight Risk border
        case 'Enhanced Risk':
            return '#E36B01'; // Dark orange for Enhanced Risk border
        case 'Moderate Risk':
            return '#E4080A'; // Darker orange for Moderate Risk border
        case 'High Risk':
            return '#DF08E6'; // Dark red for High Risk border
        case '2% Tornado Risk':
            return '#005500'; // Dark green for 2% Tornado Risk
        case '5% Tornado Risk':
            return '#A07659'; // Dark yellow for 5% Tornado Risk
        case '10% Tornado Risk':
            return '#F1C32A'; // Dark orange for 10% Tornado Risk
        case '15% Tornado Risk':
            return '#E4080A'; // Dark red for 15% Tornado Risk
        case '30% Tornado Risk':
            return '#DF08E6'; // Purple for 30% Tornado Risk
        case '45% Tornado Risk':
            return '#960485'; // Purple for 45% Tornado Risk
        case '5% Wind Risk':
            return '#A07659'; // Dark yellow for 5% Wind Risk
        case '15% Wind Risk':
            return '#F1C32A'; // Dark yellow for 15% Wind Risk
        case '30% Wind Risk':
            return '#E4080A'; // Dark red for 30% Wind Risk
        case '45% Wind Risk':
            return '#DF08E6'; // Purple for 45% Wind Risk
        case '5% Hail Risk':
            return '#A07659'; // Dark yellow for 5% Hail Risk
        case '15% Hail Risk':
            return '#F1C32A'; // Dark yellow for 15% Hail Risk
        case '30% Hail Risk':
            return '#E4080A'; // Dark red for 30% Hail Risk
        case '45% Hail Risk':
            return '#DF08E6'; // Dark orange for 45% Hail Risk
        case '10% Significant Wind Risk': // Override for display as 30% Significant Wind Risk
        case '30% Significant Wind Risk':
            return '#000000'; // Black for Significant Wind Risk
        default:
            return '#55BB55'; // Default color for unknown or undefined risk
    }
}



// Create panes for custom layering control
map.createPane('conesPane'); // For the cone
map.createPane('swathPane'); // For the wind swath
map.createPane('warningsPane'); // For watches and warnings

// Set z-index values for the panes
map.getPane('conesPane').style.zIndex = 202; // Cone behind warnings
map.getPane('swathPane').style.zIndex = 203; // Wind swath behind cones
map.getPane('warningsPane').style.zIndex = 204; // Warnings above everything else


// Icons for different storm types
const std_icon = L.icon({
    iconUrl: 'https://i.ibb.co/TWgq1GT/image0-removebg-preview.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const sts_icon = L.icon({
    iconUrl: 'https://i.ibb.co/G9pWYkD/IMG-7246.png?format=webp&quality=lossless',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const td_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/TPR22TSn/IMG-4615-removebg-preview.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const ts_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/4d2xFjWV/IMG-4613-removebg-preview.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat1_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/3JBc57gs/IMG-4607-removebg-preview.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat2_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/bJxRxHg7/IMG-4608-removebg-preview.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat3_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/K8C7CsHX/IMG-4610-removebg-preview-1.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat4_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/gcMZfTxM/IMG-4619-removebg-preview.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat5_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/CMW0J24t/IMG-4612-removebg-preview-1.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const ptc_icon = L.icon({
    iconUrl: 'https://i.postimg.cc/TPR22TSn/IMG-4615-removebg-preview.webp',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Layers for hurricanes and related elements
let hurricaneLayer, watchesWarningsLayer, coneLayer, windSwathLayer;
let hurricaneLayersInitialized = false; // Track if layers are initialized

// Function to load the hurricane layers and keep them updated every 5 minutes
function loadHurricanes() {
    if (!hurricaneLayersInitialized) {
        // Initialize the hurricane layers with a filter for basins
        hurricaneLayer = L.esri.featureLayer({
            url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Active_Hurricanes_v1/FeatureServer/0',
            where: "BASIN IN ('AL', 'EP')", // Filter to include only Atlantic and Eastern Pacific basins
            pointToLayer: function (feature, latlng) {
                var stormType = feature.properties.STORMTYPE;
                var ssnum = feature.properties.SSNUM;
                return L.marker(latlng, { icon: getHurricaneIcon(stormType, ssnum) });
            },
            style: function (feature) {
                var stormType = feature.properties.STORMTYPE;
                return {
                    color: getTrackStyle(stormType),
                    weight: 2,
                    opacity: 1
                };
            },
            onEachFeature: function (feature, layer) {
                var stormName = feature.properties.STORMNAME;
                var stormTypeID = feature.properties.STORMTYPE;
                var maxWind = Math.round((feature.properties.MAXWIND * 1.15) / 5) * 5; // Convert to mph and round to nearest 5
                var gust = feature.properties.GUST ? Math.round((feature.properties.GUST * 1.15) / 5) * 5 : null; // Convert gusts to mph and round to nearest 5
                var pressure = feature.properties.MSLP;
                var direction = feature.properties.TCDIR;
                var speed = feature.properties.TCSPD;
                var shortDateTime = feature.properties.DATELBL + " " + feature.properties.TIMEZONE;
                var cat = feature.properties.SSNUM;

                // Get the correct storm type and name
                var stormType = "";
                if (stormTypeID == "TS") {
                    stormType = "Tropical Storm";
                } else if (stormTypeID == "TD") {
                    stormType = "Tropical Depression";
                } else if (stormTypeID == "STD") {
                    stormType = "Sub-Tropical Depression";  // Regular display as Sub-Tropical Depression
                } else if (stormTypeID == "STS") {
                    stormType = "Sub-Tropical Storm";  // Regular display as Sub-Tropical Depression
                } else if (stormTypeID == "") {
                    stormType = "Major Hurricane";
                } else {
                    stormType = "Hurricane";
                }

                // Determine the correct basin
                var basin = feature.properties.BASIN === "WP" ? "Western Pacific" :
                    feature.properties.BASIN === "EP" ? "Eastern Pacific" :
                    feature.properties.BASIN === "AL" ? "Atlantic" :
                    feature.properties.BASIN;

                var pressureText = (pressure && pressure !== 9999) ? pressure + " mb" : "Pressure data not available";
                var directionText = (direction && direction !== 9999) ? fixDirection(direction) : "Direction data not available";
                var speedText = (speed && speed !== 9999) ? speed + " mph" : "Speed data not available";

                // Get the correct icon for the popup based on storm type and category
                var stormIconUrl = getHurricaneIcon(stormTypeID, cat).options.iconUrl;

                // Determine identifier display
                var stormIdentifier = (stormTypeID == "STD") ? "SUB" : stormTypeID;

                var popupContent = `
                    <div style="overflow-y: auto; display: flex; flex-direction: column;">
                        <div style="display: flex; flex-direction: row; align-items: center;">
                            <img class="rotating" src="${stormIconUrl}" style="width: 45px; height: 45px;">
                            <div style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 5px; padding-left: 10px; border-radius: 5px; font-size: 19px; font-weight: bolder; color: white; min-height: 45px;">
                                ${stormType} ${stormName}
                            </div>
                        </div>
                        <p style="margin: 0px;">
                            ${(cat && cat !== 0) ? '<br><b>Category:</b> ' + cat.toString() + "<br>" : "<br>"}
                            <b>Time:</b> ${shortDateTime}<br>
                            <b>Winds:</b> ${maxWind} mph<br>
                            ${(gust && gust !== 0) ? "<b>Gusts:</b> " + gust + " mph<br><br>" : "<br>"}
                            ${pressureText !== "Pressure data not available" ? "<b>Pressure:</b> " + pressureText + "<br>" : ""}
                            ${(directionText !== "Direction data not available" && speedText !== "Speed data not available") ? "<b>Motion:</b> " + directionText + " at " + speedText + "<br><br>" : ""}
                            <b>Basin:</b> ${basin}<br>
                            <b>Identifier:</b> ${stormIdentifier} ${feature.properties.STORMNUM}<br>
                            <b>Location:</b> ${feature.properties.LAT}, ${feature.properties.LON}<br>
                        </p>
                    </div>
                `;
                layer.bindPopup(popupContent, { "autoPan": true, 'maxheight': '400', 'maxWidth': '300', 'className': 'alertpopup' });
            }
        });
  
        // Add the watches and warnings layer
        watchesWarningsLayer = L.esri.featureLayer({
            url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Active_Hurricanes_v1/FeatureServer/5',
            pane: 'warningsPane',
            style: function (feature) {
                var tcww = feature.properties.TCWW;
                switch (tcww) {
                    case 'HWR': return { color: 'rgb(255,0,0)', weight: 12, opacity: 1 };
                    case 'TWR': return { color: 'rgb(0,0,255)', weight: 8, opacity: 1 };
                    case 'HWA': return { color: 'rgb(255,174,185)', weight: 12, opacity: 1 };
                    case 'TWA': return { color: 'rgb(238,238,0)', weight: 8, opacity: 1 };
                    default: return { color: 'gray', weight: 2, opacity: 1 };
                }
            },
            onEachFeature: function (feature, layer) {
                var tcww = feature.properties.TCWW;
                var warningName = '';

                switch (tcww) {
                    case 'HWR': warningName = 'Hurricane Warning'; break;
                    case 'TWR': warningName = 'Tropical Storm Warning'; break;
                    case 'HWA': warningName = 'Hurricane Watch'; break;
                    case 'TWA': warningName = 'Tropical Storm Watch'; break;
                    default: warningName = 'Unknown Warning Type'; break;
                }

                let bgColor;
                switch (tcww) {
                    case 'HWR': bgColor = 'rgb(255,0,0)'; break;
                    case 'TWR': bgColor = 'rgb(0,0,255)'; break;
                    case 'HWA': bgColor = 'rgb(255,174,185)'; break;
                    case 'TWA': bgColor = 'rgb(238,238,0)'; break;
                    default: bgColor = 'gray'; break;
                }

                var popupContent = `
                    <div style="background-color: ${bgColor}; padding: 7px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; color: white;">
                        ${warningName}
                    </div>
                `;
                layer.bindPopup(popupContent, { autoPan: true, maxHeight: 400, maxWidth: 300, className: 'alertpopup' });
            }
        });

coneLayer = L.esri.featureLayer({
    url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Active_Hurricanes_v1/FeatureServer/4',
    pane: 'conesPane', // Set the pane for cone layer
    where: "BASIN IN ('AL', 'EP')", // Filter to include only Atlantic and Eastern Pacific basins
    style: function (feature) {
        return {
            color: "#000000",
            weight: 2,
            opacity: 1,
            fillColor: "gray",
            fillOpacity: 0.2
        };
    },
});


        hurricaneLayersInitialized = true;
    }
}


// Function to toggle hurricane layers on or off
function toggleHurricanes(shouldShow) {
    loadHurricanes();

    if (shouldShow) {
        if (!map.hasLayer(hurricaneLayer)) map.addLayer(hurricaneLayer);
        if (!map.hasLayer(watchesWarningsLayer)) map.addLayer(watchesWarningsLayer);
        if (!map.hasLayer(coneLayer)) map.addLayer(coneLayer);
    } else {
        if (map.hasLayer(hurricaneLayer)) map.removeLayer(hurricaneLayer);
        if (map.hasLayer(watchesWarningsLayer)) map.removeLayer(watchesWarningsLayer);
        if (map.hasLayer(coneLayer)) map.removeLayer(coneLayer);
    }

    saveSettings(); // Save the state whenever toggled
}

// Add event listener to handle click events for toggling hurricanes on or off
document.getElementById("toggle-hurricanes").addEventListener("click", function () {
    hurricanesON = !hurricanesON; // Toggle the state
    toggleHurricanes(hurricanesON); // Call function to handle the hurricane layer

    // Update button styles based on the new state
    this.style.backgroundColor = hurricanesON ? "white" : "#636381";
    this.style.color = hurricanesON ? "#7F1DF0" : "white";
    this.style.border = hurricanesON ? "2px solid #636381" : "2px solid white"; // Adding border style
});



function getHurricaneIcon(stormType, ssnum) {
    switch (stormType) {
        case 'STD': return std_icon;
        case 'TD': return td_icon;
        case 'TS': return ts_icon;
        case 'HU': return (ssnum == 1) ? cat1_icon : (ssnum == 2) ? cat2_icon : ptc_icon;
        case 'MH': return (ssnum == 3) ? cat3_icon : (ssnum == 4) ? cat4_icon : (ssnum == 5) ? cat5_icon : ptc_icon;
        default: return ptc_icon;
    }
}

function getTrackStyle(stormType) {
    switch (stormType) {
        case 'TS': return 'blue';
        case 'TD': return 'yellow';
        case 'H': return 'orange';
        case 'MH': return 'red';
        default: return 'gray';
    }
}

function fixDirection(direction) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    if (typeof direction === 'number') {
        const index = Math.round(direction / 22.5) % 16;
        return directions[index];
    } else {
        return "Invalid direction";
    }
}

// Set hurricanesON to true so the layers are ON by default
let hurricanesON = true;

// Initialize hurricane layers on startup
document.addEventListener('DOMContentLoaded', function () {
    loadHurricanes(); // Load hurricanes automatically when the page loads
    loadSettings(); // Load the last saved state
    updateButtonState(document.getElementById("toggle-hurricanes"), hurricanesON); // Update button state at startup
    toggleHurricanes(hurricanesON); // Ensure the layers are shown at startup
});


function refreshHurricaneLayers() {
    // Remove the hurricane layers if they exist
    if (map.hasLayer(hurricaneLayer)) map.removeLayer(hurricaneLayer);
    if (map.hasLayer(watchesWarningsLayer)) map.removeLayer(watchesWarningsLayer);
    if (map.hasLayer(coneLayer)) map.removeLayer(coneLayer);
    if (map.hasLayer(windSwathLayer)) map.removeLayer(windSwathLayer);

    // Re-load the hurricane layers
    loadHurricanes();
    
    // Re-add the layers
    if (hurricanesON) {
        map.addLayer(hurricaneLayer);
        map.addLayer(watchesWarningsLayer);
        map.addLayer(coneLayer);
        map.addLayer(windSwathLayer);
    }
}

// Create panes for custom layering control
map.createPane('investsPane'); // For invest areas
map.createPane('investIconsPane'); // For invest icons

// Set z-index values for the panes
map.getPane('investsPane').style.zIndex = 202; // Invest areas
map.getPane('investIconsPane').style.zIndex = 203; // Invest icons

// Icons for different probabilities
const invest10_icon = L.icon({
    iconUrl: 'https://i.ibb.co/2nM3869/IMG-7524.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const invest40_icon = L.icon({
    iconUrl: 'https://i.ibb.co/JBS4W5B/IMG-7525.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const invest70_icon = L.icon({
    iconUrl: 'https://i.ibb.co/S0GqtKP/IMG-7526.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Layers for invests and related elements
let investsLayer, investsIconsLayer;
let investsLayersInitialized = false;
let investsON = true; // State to track the toggle button, ON by default

// Function to load invests layers
function loadInvests() {
    if (!investsLayersInitialized) {
        // Initialize the invest layers
        investsLayer = L.esri.featureLayer({
            url: 'https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather/MapServer/3',
            pane: 'investsPane',
            style: function (feature) {
                const probability = feature.properties.prob7day;
                const innerColor = getInvestColor(probability);

                return {
                    color: "black", // Outer black border
                    weight: 6, // Thicker outer border
                    opacity: 1, // Full opacity for the outer border
                    fillColor: innerColor, // Corresponding fill color based on probability
                    fillOpacity: 0.3, // Original fill opacity
                };
            },
            onEachFeature: function (feature, layer) {
                const prob2day = feature.properties.prob2day || "N/A";
                const risk2day = feature.properties.risk2day || "N/A";
                const prob7day = feature.properties.prob7day || "N/A";
                const risk7day = feature.properties.risk7day || "N/A";
                const basin = feature.properties.basin || "N/A";

                const popupContent = `
                    <div style="overflow-y: auto; display: flex; flex-direction: column;">
                        <div style="display: flex; flex-direction: row; align-items: center;">
                            <img src="${getInvestIcon(prob7day).options.iconUrl}" style="width: 40px; height: 40px;">
                            <div style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 5px; padding-left: 10px; border-radius: 5px; font-size: 19px; font-weight: bolder; color: white; min-height: 45px;">
                                Potential Disturbance Area
                            </div>
                        </div>
                        <p style="margin: 0px;">
                            <b>Basin:</b> ${basin}<br>
                            <b>2-Day Probability:</b> ${prob2day} - ${risk2day}<br>
                            <b>7-Day Probability:</b> ${prob7day} - ${risk7day}<br>
                        </p>
                    </div>
                `;

                // Bind popup to the main layer
                layer.bindPopup(popupContent, {
                    autoPan: true,
                    maxWidth: 300,
                    className: 'alertpopup',
                });

                // Add black border as a separate layer with the same popup
                const innerStyle = {
                    color: getInvestColor(feature.properties.prob7day), // Inner border color
                    weight: 3, // Thin inner border
                    opacity: 1,
                    fillOpacity: 0, // No additional fill for inner border
                };

                const innerLayer = L.geoJSON(feature, {
                    style: innerStyle,
                    onEachFeature: function (_, innerLayer) {
                        innerLayer.bindPopup(popupContent, {
                            autoPan: true,
                            maxWidth: 300,
                            className: 'alertpopup',
                        });
                    },
                });
                innerLayer.addTo(map);

                // Save reference to dynamically created inner border
                if (!layer._innerBorders) layer._innerBorders = [];
                layer._innerBorders.push(innerLayer);
            },
        });

        investsIconsLayer = L.esri.featureLayer({
            url: 'https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather/MapServer/2',
            pane: 'investIconsPane',
            pointToLayer: function (feature, latlng) {
                const prob7day = feature.properties.prob7day || "N/A";

                // Create a marker with the icon
                const marker = L.marker(latlng, { icon: getInvestIcon(prob7day) });

                // Bind the same popup as the area
                const prob2day = feature.properties.prob2day || "N/A";
                const risk2day = feature.properties.risk2day || "N/A";
                const risk7day = feature.properties.risk7day || "N/A";
                const basin = feature.properties.basin || "N/A";

                const popupContent = `
                    <div style="overflow-y: auto; display: flex; flex-direction: column;">
                        <div style="display: flex; flex-direction: row; align-items: center;">
                            <img src="${getInvestIcon(prob7day).options.iconUrl}" style="width: 40px; height: 40px;">
                            <div style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 5px; padding-left: 10px; border-radius: 5px; font-size: 19px; font-weight: bolder; color: white; min-height: 45px;">
                                Potential Disturbance Area
                            </div>
                        </div>
                        <p style="margin: 0px;">
                            <b>Basin:</b> ${basin}<br>
                            <b>2-Day Probability:</b> ${prob2day} - ${risk2day}<br>
                            <b>7-Day Probability:</b> ${prob7day} - ${risk7day}<br>
                        </p>
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    autoPan: true,
                    maxWidth: 300,
                    className: 'alertpopup',
                });

                return marker;
            },
        });

        investsLayersInitialized = true;
    }
}

function refreshInvestsLayers() {
    // Remove the invest layers if they exist
    if (map.hasLayer(investsLayer)) map.removeLayer(investsLayer);
    if (map.hasLayer(investsIconsLayer)) map.removeLayer(investsIconsLayer);

    // Remove black borders if they exist
    if (investsLayer) {
        investsLayer.eachFeature(function (layer) {
            if (layer._innerBorders) {
                layer._innerBorders.forEach(innerLayer => {
                    if (map.hasLayer(innerLayer)) {
                        map.removeLayer(innerLayer);
                    }
                });
            }
        });
    }

    // Reload the invests layers
    loadInvests();

    // Re-add the layers if they are toggled ON
    if (investsON) {
        if (!map.hasLayer(investsLayer)) {
            map.addLayer(investsLayer);

            // Re-add black borders for all features
            investsLayer.eachFeature(function (layer) {
                if (layer._innerBorders) {
                    layer._innerBorders.forEach(innerLayer => {
                        if (!map.hasLayer(innerLayer)) {
                            map.addLayer(innerLayer);
                        }
                    });
                }
            });
        }

        if (!map.hasLayer(investsIconsLayer)) {
            map.addLayer(investsIconsLayer);
        }
    }
}




// Function to toggle invest layers on or off
function toggleInvests(shouldShow) {
    if (!investsLayersInitialized) loadInvests();

    if (shouldShow) {
        if (!map.hasLayer(investsLayer)) map.addLayer(investsLayer);

        // Ensure proper layering of inner borders and colored areas
        investsLayer.eachFeature(function (layer) {
            if (layer._innerBorders) {
                layer._innerBorders.forEach(innerLayer => {
                    if (!map.hasLayer(innerLayer)) map.addLayer(innerLayer);
                });
            }
        });

        if (!map.hasLayer(investsIconsLayer)) map.addLayer(investsIconsLayer);
    } else {
        if (map.hasLayer(investsLayer)) map.removeLayer(investsLayer);

        investsLayer.eachFeature(function (layer) {
            if (layer._innerBorders) {
                layer._innerBorders.forEach(innerLayer => {
                    if (map.hasLayer(innerLayer)) map.removeLayer(innerLayer);
                });
            }
        });

        if (map.hasLayer(investsIconsLayer)) map.removeLayer(investsIconsLayer);
    }

    const toggleButton = document.getElementById("toggle-disturbances");
    toggleButton.style.backgroundColor = shouldShow ? "white" : "#636381";
    toggleButton.style.color = shouldShow ? "#7F1DF0" : "white";
    toggleButton.style.border = shouldShow ? "2px solid #636381" : "2px solid white";

    saveToggleState(shouldShow); // Save the toggle state to localStorage
}

// Add event listener for "Toggle Disturbances" button
document.getElementById("toggle-disturbances").addEventListener("click", function () {
    investsON = !investsON; // Toggle state
    toggleInvests(investsON); // Update layers and button styles
});

// Function to save the toggle state to localStorage
function saveToggleState(state) {
    localStorage.setItem('investsToggleState', state ? 'true' : 'false');
}

// Function to load the toggle state from localStorage
function loadToggleState() {
    const savedState = localStorage.getItem('investsToggleState');
    return savedState === 'true'; // Return true if saved state is "true"
}

// Function to get invest colors based on probability
function getInvestColor(probability) {
    switch (probability) {
        case "10%":
        case "20%":
        case "30%":
            return "rgba(255, 255, 0, 1)"; // Yellow
        case "40%":
        case "50%":
        case "60%":
            return "rgba(230, 152, 0, 1)"; // Orange
        case "70%":
        case "80%":
        case "90%":
        case "100%":
            return "rgba(230, 0, 0, 1)"; // Red
        default:
            return "rgba(128, 128, 128, 1)"; // Gray
    }
}

// Function to get invest icons based on probability
function getInvestIcon(probability) {
    switch (probability) {
        case "10%":
        case "20%":
        case "30%":
            return invest10_icon;
        case "40%":
        case "50%":
        case "60%":
            return invest40_icon;
        case "70%":
        case "80%":
        case "90%":
        case "100%":
            return invest70_icon;
        default:
            return invest10_icon; // Default icon
    }
}

// Initialize invests layers on startup with saved state
document.addEventListener('DOMContentLoaded', function () {
    investsON = loadToggleState(); // Load saved state or default to true
    loadInvests(); // Load invests layers
    toggleInvests(investsON); // Toggle layers based on saved state
});


// Function to calculate opacity based on strike time
function calculateOpacity(strikeTime) {
    var now = Date.now();
    var ageInMinutes = (now - strikeTime) / 1000 / 60;
    if (ageInMinutes < 5) return 1.0;
    if (ageInMinutes < 30) return 0.5;
    return 0.2;
}

// Function to format lightning-specific timestamps in MM/DD/YYYY at hh:mm:ss AM/PM format
function formatLightningTimestamp(timestamp) {
    var date = new Date(timestamp);
    var formattedDate = date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
    });
    var formattedTime = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric', 
        hour12: true 
    });
    return `${formattedDate} at ${formattedTime}`;
}

// Function to format amps with commas
function formatAmperage(amps) {
    return `${amps.toLocaleString()} amps`; // Add commas to amps
}

// Function to generate the popup content for lightning strikes
function generatePopupContent(properties) {
    var popupContent = `
        <div style="overflow-y: auto; display: flex; flex-direction: column;">
            <div style="display: flex; flex-direction: row; align-items: center;">
                <img class="rotating" src="https://i.ibb.co/prQpQgs/IMG-5739.png" style="width: 45px; height: 45px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 5px; padding-left: 10px; border-radius: 5px; font-size: 19px; font-weight: bolder; color: white; min-height: 45px;">
                    Lightning Strike
                </div>
            </div>
            <p style="margin: 0px;">
                ${properties.datetime ? `<b>Time:</b> ${formatLightningTimestamp(properties.datetime)}<br>` : ""}
                ${properties.amps ? `<b>Amperage:</b> ${formatAmperage(properties.amps)}<br>` : ""}
            </p>
        </div>
    `;
    return popupContent;
}
// Optimized SVG as Base64
const base64SVG = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 12px; height: 12px;">
        <path fill="#ffffff" d="M0 256L28.5 28c2-16 15.6-28 31.8-28H228.9c15 0 27.1 12.1 27.1 27.1c0 3.2-.6 6.5-1.7 9.5L208 160H347.3c20.2 0 36.7 16.4 36.7 36.7c0 7.4-2.2 14.6-6.4 20.7l-192.2 281c-5.9 8.6-15.6 13.7-25.9 13.7h-2.9c-15.7 0-28.5-12.8-28.5-28.5c0-2.3 .3-4.6 .9-6.9L176 288H32c-17.7 0-32-14.3-32-32z"/>
    </svg>
`);

// Function to create a custom icon using L.icon (with Base64 SVG)
function getCustomIcon(opacity) {
    return L.icon({
        iconUrl: base64SVG,  // Use the Base64 encoded SVG
        iconSize: [12, 12],  // Adjust the size
        iconAnchor: [6, 12],  // Center the icon
        popupAnchor: [0, -12],  // Popup position relative to the icon
        opacity: opacity  // Set dynamic opacity for the icon
    });
}

// Variable to store the lightning layer
var lightningLayer;

// Function to load or refresh the lightning layer with filtering based on zoom level
function loadLightningLayer() {
    // Remove existing layer if present
    if (lightningLayer && map.hasLayer(lightningLayer)) {
        map.removeLayer(lightningLayer);
    }

    // Only load the layer if the zoom level is 7 or higher
    if (map.getZoom() >= 8.5) {
        lightningLayer = L.esri.featureLayer({
            url: 'https://utility.arcgis.com/usrsvcs/servers/a99a3d10fbf64f13897c8165d5393fca/rest/services/Severe/Lightning_CONUS/MapServer/0',
            pointToLayer: function (geojson, latlng) {
                // Filter out lightning strikes in Cuba (except Northwest Cuba) and in the Bahamas
                if (!isOutsideCuba(latlng) || isInBahamas(latlng)) {
                    return null; // Skip strikes in these areas
                }

                var strikeTime = geojson.properties.datetime;
                var opacity = calculateOpacity(strikeTime);

                // Create marker with custom icon using L.icon and dynamic opacity
                var marker = L.marker(latlng, { icon: getCustomIcon(opacity) });

                // Bind popup with the custom content
                var popupContent = generatePopupContent(geojson.properties);
                marker.bindPopup(popupContent, { autoPan: true, maxHeight: 400, maxWidth: 300, className: 'alertpopup' });

                return marker;
            }
        });

        // Add the lightning layer to the map
        lightningLayer.addTo(map);
    }
}

// Refresh the lightning layer every 60 seconds if zoom level is >= 8.5
function refreshLightningLayer() {
    if (lightningLayerVisible) {
        loadLightningLayer();
    } else {
        if (lightningLayer && map.hasLayer(lightningLayer)) {
            map.removeLayer(lightningLayer);
        }
    }
}

// Refresh every 60 seconds
setInterval(refreshLightningLayer, 60000);

// Handle zoom changes to adjust visibility but don't reload the entire layer
map.on('zoomend', function () {
    // If zoom level changes and the toggle is active, ensure the layer is visible or hidden
    if (map.getZoom() >= 8.5) {
        if (lightningLayerVisible && !map.hasLayer(lightningLayer)) {
            loadLightningLayer(); // Add the layer back if it's missing
        }
    } else if (lightningLayer) {
        // Remove the layer if below zoom threshold
        map.removeLayer(lightningLayer);
    }
});
// Function to check if the strike is in the Bahamas
function isInBahamas(latlng) {
    var lat = latlng.lat;
    var lng = latlng.lng;
    var northLatBahamas = 27.5;
    var southLatBahamas = 20.9;
    var westLngBahamas = -80.0;
    var eastLngBahamas = -72.0;
    return lat <= northLatBahamas && lat >= southLatBahamas && lng >= westLngBahamas && lng <= eastLngBahamas;
}

// Function to filter out lightning strikes in Cuba, except Northwest Cuba
function isOutsideCuba(latlng) {
    var lat = latlng.lat;
    var lng = latlng.lng;
    var northLatCuba = 23.4;
    var southLatCuba = 19.8;
    var westLngCuba = -85.0;
    var eastLngCuba = -74.0;
    var northLatNWCuba = 23.4;
    var southLatNWCuba = 23.0;
    var westLngNWCuba = -85.0;
    var eastLngNWCuba = -80.0;
    var isInCuba = lat <= northLatCuba && lat >= southLatCuba && lng >= westLngCuba && lng <= eastLngCuba;
    var isInNorthwestCuba = lat <= northLatNWCuba && lat >= southLatNWCuba && lng >= westLngNWCuba && lng <= eastLngNWCuba;
    return !isInCuba || isInNorthwestCuba;
}

// Toggle function to add/remove lightning layer and save the state
var lightningLayerVisible = localStorage.getItem('lightningLayerVisible');
if (lightningLayerVisible === null) {
    lightningLayerVisible = true; // Default to 'on' if there's no saved setting
} else {
    lightningLayerVisible = (lightningLayerVisible === 'true'); // Convert string to boolean
}

function toggleLightning() {
    var lightningButton = document.getElementById('toggle-lightning');

    if (lightningLayerVisible) {
        // Check if the layer exists before trying to remove it
        if (lightningLayer && map.hasLayer(lightningLayer)) {
            map.removeLayer(lightningLayer);
        }
        lightningLayerVisible = false;
        lightningButton.style.backgroundColor = "#636381";
        lightningButton.style.color = "white";
        lightningButton.style.border = "2px solid white";
    } else {
        loadLightningLayer(); // Reload the lightning layer
        lightningLayerVisible = true;
        lightningButton.style.backgroundColor = "white";
        lightningButton.style.color = "#7F1DF0";
        lightningButton.style.border = "2px solid #636381";
    }

    // Save state to localStorage
    localStorage.setItem('lightningLayerVisible', lightningLayerVisible);
}

// Restore button state on load based on saved settings
window.onload = function() {
    var lightningButton = document.getElementById('toggle-lightning');
    if (lightningLayerVisible) {
        loadLightningLayer();
        lightningButton.style.backgroundColor = "white";
        lightningButton.style.color = "#7F1DF0";
        lightningButton.style.border = "2px solid #636381";
    } else {
        if (lightningLayer && map.hasLayer(lightningLayer)) {
            map.removeLayer(lightningLayer); // Ensure it's removed if the setting is off
        }
        lightningButton.style.backgroundColor = "#636381";
        lightningButton.style.color = "white";
        lightningButton.style.border = "2px solid white";
    }
};

// Define a variable to hold the Mesoscale Discussion layer and its visibility state
var mesoscaleLayer;
var mesoscaleLayerVisible = localStorage.getItem('mesoscaleLayerVisible') === 'true'; // Default state is based on localStorage

// Function to initialize the Mesoscale Layer
function initializeMesoscaleLayer() {
    if (mesoscaleLayer) {
        map.removeLayer(mesoscaleLayer);  // Remove existing layer if present to avoid duplicate layers
    }

    mesoscaleLayer = L.esri.featureLayer({
        url: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/spc_mesoscale_discussion/MapServer/0',
        style: function (feature) {
            let discussionNumber = feature.properties.name || 'N/A';
            discussionNumber = discussionNumber.replace("MD", "").trim(); // Strip "MD" from the name

            // If the discussion is "NoArea", set line opacity to 0
            if (discussionNumber.includes("NoArea")) {
                return {
                    color: '#0000FF',  // Blue color (not visible with opacity 0)
                    weight: 4,         // Line thickness
                    opacity: 0,        // Make lines fully transparent
                    fillOpacity: 0     // No fill either
                };
            }

            // Normal style for other discussions
            return {
                color: '#0000FF',  // Blue color for the outlines
                weight: 4,         // Line thickness
                opacity: 0.8,      // Line opacity for visible lines
                fillOpacity: 0     // No fill, just the outlines
            };
        },
        onEachFeature: async function (feature, layer) {
            let discussionNumber = feature.properties.name || 'N/A';
            discussionNumber = discussionNumber.replace("MD", "").trim(); // Strip "MD" from the name

            const issuanceDate = feature.properties.idp_filedate ? new Date(feature.properties.idp_filedate).toLocaleString() : 'N/A';

            // Construct the correct SPC URL for the discussion
            const discussionUrl = `https://www.spc.noaa.gov/products/md/md${discussionNumber}.html`;

            // Fetch the Mesoscale Discussion content using the scrape function
            const discussionText = await scrapeFullMesoscaleDiscussion(discussionUrl);

            // Build the popup content dynamically
            const popupContent = buildPopupContent(discussionNumber, discussionText, issuanceDate);

            // Bind the popup with the customized style for polygons not labeled "NoArea"
            if (!discussionNumber.includes("NoArea")) {
                layer.bindPopup(popupContent, { autoPan: true, maxHeight: 400, maxWidth: 300, className: 'mesoscale-alertpopup' });
            }

            // Ensure the popup opens when the polygon is clicked, even for "NoArea"
            layer.on('click', function (e) {
                if (!discussionNumber.includes("NoArea")) {
                    layer.openPopup(e.latlng); // Ensure the popup opens at the clicked location
                }
            });
        }
    });

    // Add the Mesoscale layer to the map if it was visible previously
    if (mesoscaleLayerVisible) {
        mesoscaleLayer.addTo(map);
    }

    // Update button state to reflect current visibility
    updateButtonState();
}
// Function to build the popup content based on the full text
function buildPopupContent(mdNumber, discussionText, issuanceDate) {
    let popupContent = `
        <div class="mesoscale-alert-header">Mesoscale Discussion #${mdNumber}</div>
        <div class="mesoscale-popup-content">`;

    // Find "Valid" time range in the text and convert it to local time
    const validTime = findTextAfterKeyword(discussionText, "Valid");
    if (validTime) {
        const [issuedTime, expiresTime] = validTime.split(" - ");
        popupContent += `<div><b>Issued:</b> ${convertToFormattedTime(issuedTime)}</div>`;
        popupContent += `<div><b>Expires:</b> ${convertToFormattedTime(expiresTime)}</div>`;
    }

    // Find "Concerning" in the text
    const concerning = findTextAfterKeyword(discussionText, "Concerning");
    if (concerning) {
        popupContent += `<div><b>Concerning:</b> ${concerning}</div><br>`;
    }

    // Find "Probability of Watch Issuance" in the text
    const watchProbability = capitalizeFirstLetter(findTextAfterKeyword(discussionText, "Probability of Watch Issuance"));
    if (watchProbability) {
        popupContent += `<div><b>Probability of Watch Issuance:</b> ${watchProbability}</div>`;
    }

    // Find "Areas affected" in the text
    const areasAffected = capitalizeFirstLetter(findTextAfterKeyword(discussionText, "Areas affected"));
    if (areasAffected) {
        popupContent += `<div><b>Areas Affected:</b> ${areasAffected}</div>`;
    }

    popupContent += `</div>`;
    
    return popupContent;
}

// Helper function to capitalize the first letter of any string
function capitalizeFirstLetter(string) {
    if (!string) return null;
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to search for text after a specific keyword in the full discussion text
function findTextAfterKeyword(text, keyword) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex === -1) return null;

    // Find the text after the keyword up to the next newline or period
    const textAfterKeyword = text.slice(keywordIndex + keyword.length).split('\n')[0].replace('...', '').trim();
    return textAfterKeyword;
}

// Custom scraping function to fetch the entire Mesoscale Discussion content
function scrape(url) {
    return fetch(url)
        .then(response => response.text())
        .catch(error => {
            console.error('Error fetching the website:', error);
            return 'N/A';
        });
}

// Function to scrape the full content of the Mesoscale Discussion page
async function scrapeFullMesoscaleDiscussion(url) {
    const htmlText = await scrape(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Get the entire text from the <pre> tag which usually contains the discussion content
    const preElement = doc.querySelector('pre');
    return preElement ? preElement.textContent.trim() : 'No discussion available.';
}

// Function to convert UTC to the user's local time zone and format it as "October 19, 2024 at 8:51 PM EDT"
function convertToFormattedTime(utcTimeString) {
    const utcDate = convertUTCStringToLocal(utcTimeString);
    return utcDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short' // Add the time zone abbreviation (e.g., EDT, CDT, etc.)
    });
}

// Convert UTC timestamp (e.g., "192223Z") to local time
function convertUTCStringToLocal(utcString) {
    const year = new Date().getFullYear(); // We need the current year
    const month = new Date().getMonth();  // Get the current month
    const day = parseInt(utcString.slice(0, 2), 10);
    const hour = parseInt(utcString.slice(2, 4), 10);
    const minute = parseInt(utcString.slice(4, 6), 10);

    const utcDate = new Date(Date.UTC(year, month, day, hour, minute));
    return utcDate;
}

// Function to toggle Mesoscale Discussions layer
function toggleDiscussions() {
    var mesoscaleButton = document.getElementById('togglediscussions');

    // Toggle visibility
    mesoscaleLayerVisible = !mesoscaleLayerVisible;

    // Add or remove the layer from the map based on the current state
    if (mesoscaleLayerVisible) {
        if (!mesoscaleLayer) {
            initializeMesoscaleLayer(); // Initialize it if it doesn't exist
        } else {
            mesoscaleLayer.addTo(map);
        }
    } else {
        if (map.hasLayer(mesoscaleLayer)) {
            map.removeLayer(mesoscaleLayer);
        }
    }

    // Update button state after toggling
    updateButtonState();

    // Save the visibility state to localStorage (persistent across refreshes)
    localStorage.setItem('mesoscaleLayerVisible', mesoscaleLayerVisible);
}

// Function to update the button state
function updateButtonState() {
    var mesoscaleButton = document.getElementById('togglediscussions');

    if (mesoscaleLayerVisible) {
        mesoscaleButton.style.backgroundColor = "white";       // White background
        mesoscaleButton.style.color = "#7F1DF0";               // Purple text
        mesoscaleButton.style.border = "2px solid #636381";    // Dark border
    } else {
        mesoscaleButton.style.backgroundColor = "#636381"; // Dark background
        mesoscaleButton.style.color = "white";             // White text
        mesoscaleButton.style.border = "2px solid white";  // White border
    }
}

// Function to refresh the Mesoscale Discussions layer every 1 minute
function refreshMesoscaleLayer() {
    if (mesoscaleLayerVisible) {
        initializeMesoscaleLayer(); // Re-initialize to fetch updated data
    }
}

// Refresh the Mesoscale layer every 60,000 ms (1 minute)
setInterval(refreshMesoscaleLayer, 60000); // Refreshes the layer every 1 minute

// Ensure mesoscaleLayerVisible is applied when the page is reloaded or radar is refreshed
function applySavedSettings() {
    mesoscaleLayerVisible = localStorage.getItem('mesoscaleLayerVisible') === 'true';

    // Add the Mesoscale layer back to the map if it should be visible
    if (mesoscaleLayerVisible) {
        if (!mesoscaleLayer) {
            initializeMesoscaleLayer(); // If not initialized, initialize it
        } else {
            mesoscaleLayer.addTo(map);
        }
    }

    // Update the button state when the page loads
    updateButtonState();
}

// Call this function after the page or map is refreshed to reapply the saved settings
applySavedSettings();

// Global player for audio streams
let globalPlayer = document.createElement('audio');
globalPlayer.id = 'global-player';
document.body.appendChild(globalPlayer);

// Array to store weather radio markers
let weatherRadioMarkers = [];

// Variable to track the visibility of markers, initially set based on saved settings
let weatherRadioVisible = JSON.parse(localStorage.getItem('weatherRadioVisible')) ?? false; // Default to false

// Set initial state of the toggle button when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWeatherRadioToggleButton();
    addNOAATransmittersWithAudio(); // Load transmitters after initializing the button
});

// Function to initialize the toggle button based on saved state
function initializeWeatherRadioToggleButton() {
    const weatherRadioButton = document.getElementById('toggle-weather-radio');
    if (weatherRadioButton) {
        weatherRadioButton.innerHTML = `<i class="fas fa-radio"></i> Toggle Stations`;
        switchButtonStyle(weatherRadioButton, weatherRadioVisible);
    }
}

// Function to update the toggle button styles based on the state
function switchButtonStyle(button, isOn) {
    if (isOn) {
        // ON style
        button.style.backgroundColor = "white";
        button.style.color = "#7F1DF0";  // Purple text
        button.style.border = "2px solid #636381"; // Gray border
    } else {
        // OFF style
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    }
}

// Fetch NOAA Transmitters and add those with audio streams to the map
async function addNOAATransmittersWithAudio() {
    try {
        // Fetch transmitter data
        const response = await fetch('https://transmitters.weatherradio.org/');
        if (!response.ok) throw new Error('Network response was not ok');
        const transmitterData = await response.json();

        // Fetch the audio streams from icestats
        const iceStatsResponse = await fetch('https://icestats.weatherradio.org/');
        if (!iceStatsResponse.ok) throw new Error('Network response was not ok for icestats');
        const iceStatsData = await iceStatsResponse.json();
        const audioSources = iceStatsData.icestats.source;

        // Create a dictionary for easier lookup of stream details by call sign
        const audioStreams = {};
        for (let source of audioSources) {
            const serverName = source.server_name;
            const listenUrl = source.listenurl;
            const serverDescription = source.server_description;
            const currentListeners = source.listeners;

            if (serverName && listenUrl) {
                const callSign = serverName.split('-').pop().trim();
                audioStreams[callSign] = {
                    url: listenUrl,
                    description: serverDescription || "No description available",
                    listeners: currentListeners || 0
                };
            }
        }

        // Iterate over transmitter data and add markers to the map only if there's an audio link
        if (transmitterData.transmitters) {
            const transmitters = transmitterData.transmitters;

            for (let key in transmitters) {
                if (transmitters.hasOwnProperty(key)) {
                    const transmitter = transmitters[key];
                    const { LAT, LON, CALLSIGN, FREQ, SITENAME } = transmitter;

                    if (!LAT || !LON) continue;

                    const streamDetails = audioStreams[CALLSIGN] || null;

                    if (streamDetails) {
                        const customIcon = L.divIcon({
                            className: 'custom-marker-icon',
                            html: `<div style="width: 12px; height: 12px; background-color: #7F1DF0; border: 1px solid black; border-radius: 50%;"></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        });

                        const marker = L.marker([parseFloat(LAT), parseFloat(LON)], { icon: customIcon });

                        const popupContent = `
                            <div class="alertpopup" style="display: flex; align-items: center;">
                                <img src="https://i.ibb.co/vw43hWJ/Square-256x-20.png" alt="Weather Radio" style="width: 50px; height: 50px; margin-right: 15px; margin-top: 7px;">
                                <div style="font-size: 19px; font-weight: bold;">Weather Radio Station - ${CALLSIGN}</div>
                            </div>
                            <div style="font-size: 1em; margin-top: 12px;">
                                <b>Frequency:</b> ${FREQ} MHz<br>
                                <b>Location:</b> ${SITENAME}<br>
                                <b>Current Listeners:</b> ${streamDetails.listeners}<br>
                                <b>Credits:</b> ${streamDetails.description}<br>
                                <div class="audio-controls" style="margin-top: 10px; margin-bottom: 7px;">
                                    <button class="play-button" onclick="togglePlayPause('${CALLSIGN}', '${streamDetails.url}')">
                                        <i class="fas fa-volume-up"></i> Play
                                    </button>
                                </div>
                            </div>
                        `;
                        marker.bindPopup(popupContent, { className: 'alertpopup' });

                        weatherRadioMarkers.push(marker);

                        if (weatherRadioVisible) {
                            marker.addTo(map);
                        }

                        marker.on('popupopen', function () {
                            refreshPlayButtonState(CALLSIGN, streamDetails.url);
                        });
                    }
                }
            }
        } else {
            console.error('Transmitter data format incorrect.');
        }

    } catch (error) {
        console.error('Error fetching transmitter data:', error);
    }
}

// Function to toggle weather radio on/off
function toggleWeatherRadio() {
    weatherRadioVisible = !weatherRadioVisible;
    localStorage.setItem('weatherRadioVisible', weatherRadioVisible);

    weatherRadioMarkers.forEach(marker => {
        if (weatherRadioVisible) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });

    // Stop the global player if turning radio markers off
    let player = document.getElementById('global-player');
    if (!weatherRadioVisible && !isPlaying) {  // Check if TTS is not playing
        player.pause();
        player.src = '';
    }

    // Update button styles
    const weatherRadioButton = document.getElementById('toggle-weather-radio');
    if (weatherRadioButton) {
        switchButtonStyle(weatherRadioButton, weatherRadioVisible);
    }
}

// Function to play/pause a specific transmitter’s audio stream
function togglePlayPause(callSign, url) {
    let player = document.getElementById('global-player');
    const playButton = document.querySelector(`[onclick="togglePlayPause('${callSign}', '${url}')"]`);

    if (player.src !== url) {
        player.src = url;
        player.load();
        player.play().then(() => {
            playButton.innerHTML = '<i class="fas fa-volume-up"></i> Pause';
        }).catch((error) => {
            console.error("Playback error:", error);
        });
    } else {
        if (player.paused) {
            player.play().then(() => {
                playButton.innerHTML = '<i class="fas fa-volume-up"></i> Pause';
            }).catch((error) => {
                console.error("Playback error:", error);
            });
        } else {
            player.pause();
            playButton.innerHTML = '<i class="fas fa-volume-up"></i> Play';
        }
    }
}

// Function to refresh play button state when the popup is opened
function refreshPlayButtonState(callSign, url) {
    let player = document.getElementById('global-player');
    const playButton = document.querySelector(`[onclick="togglePlayPause('${callSign}', '${url}')"]`);

    if (player.src === url && !player.paused) {
        // If the player is currently playing this stream
        playButton.innerHTML = `<i class="fas fa-volume-up"></i> Pause`;
    } else {
        // Otherwise, display Play
        playButton.innerHTML = `<i class="fas fa-volume-up"></i> Play`;
    }
}

// Load the NOAA transmitters with audio streams onto the map
addNOAATransmittersWithAudio();

// Function to show the introduction screen with fade-in effect
function showIntroductionScreen() {
    const introScreen = document.getElementById('introduction-screen');
    const introContent = document.querySelector('.intro-content');

    introScreen.style.display = 'flex'; // Make intro screen container visible

    // Use a slight delay to apply the fade-in effect
    setTimeout(() => {
        introScreen.classList.add('fade-in-up'); // Add fade-in class
        introContent.style.opacity = 1; // Fade in the intro content
    }, 50); // Delay to allow CSS transition to trigger smoothly
}

// Event listener for the "Continue" button to close the intro screen
document.getElementById('intro-continue-button').addEventListener('click', () => {
    const introScreen = document.getElementById('introduction-screen');
    const introContent = document.querySelector('.intro-content');

    introScreen.classList.remove('fade-in-up');
    introScreen.classList.add('fade-out-down');
    introContent.style.opacity = 0; // Fade out the intro content

    setTimeout(() => {
        introScreen.remove(); // Remove intro screen from the DOM
        localStorage.setItem('introShown', 'true'); // Store flag in localStorage
        openLayersMenu(); // Open the layers menu
    }, 300); // Wait for fade-out animation to complete
});

// Only show the introduction screen with a 4-second delay for first-time users
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('introShown')) {
        // Delay showing the intro screen by 4 seconds
        setTimeout(() => {
            showIntroductionScreen();
        }, 4000);
    } else {
        // Immediately hide intro screen for returning users
        const introScreen = document.getElementById('introduction-screen');
        if (introScreen) {
            introScreen.remove(); // Remove the intro screen immediately
        }
    }
});

function showConnectionStatus(type) {
    const connectionStatus = document.getElementById("connection-status");
    const connectionMessage = document.getElementById("connection-message");

    if (type === "no") {
        connectionMessage.textContent = "No internet connection";
    }

    connectionStatus.classList.add("show");
    connectionStatus.classList.remove("hide");
}

function hideConnectionStatus() {
    const connectionStatus = document.getElementById("connection-status");
    connectionStatus.classList.add("hide");
    connectionStatus.classList.remove("show");
}

function checkConnectionSpeed() {
    const image = new Image();
    const imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

    // Set up image loading
    image.onload = function () {
        hideConnectionStatus(); // Hide connection status if the image loads successfully
    };

    // Fallback for no connection
    image.onerror = function () {
        showConnectionStatus("no"); // Show "No internet connection" if the image fails to load
    };

    // Start loading the image
    image.src = imageUrl + "?t=" + new Date().getTime();
}

function reloadExternalResources() {
    // Reload map type or styles
    addNOAATransmittersWithAudio();
    refreshRadar();
    map.removeLayer(currentMapLayer);
    map.addLayer(currentMapLayer);
   logAlert(alert);
}

    // Reload Font Awesome icons by re-adding the link
    const fontAwesomeLink = document.querySelector("link[href*='font-awesome']");
    if (fontAwesomeLink) {
        fontAwesomeLink.href = fontAwesomeLink.href + "?reload=" + new Date().getTime();
    }
    
 

function updateConnectionStatus() {
    if (navigator.onLine) {
        checkConnectionSpeed(); // Only check if online
        if (document.getElementById("connection-status").classList.contains("show")) {
            hideConnectionStatus();
            reloadExternalResources(); // Reload external resources when connection is back
        }
    } else {
        showConnectionStatus("no"); // Show "No internet connection" when offline
    }
}

// Listen for online and offline events
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

// Check connection status on page load
document.addEventListener("DOMContentLoaded", updateConnectionStatus);


function toggleMainMenu(menuId) {
    const menus = ['layers-menu', 'info-menu', 'radar-settings', 'alerts-settings', 'map-settings', 'alert-list-submenu', 'general-info', 'attributions', 'reports-settings', 'outlooks-settings', 'hurricane-settings', 'lightning-settings', 'weather-radio-settings'];
    menus.forEach(id => {
        const menu = document.getElementById(id);
        if (menuId === id) {
            if (menu.style.display === 'block') {
                menu.style.animation = 'fadeOutDown 0.3s forwards';
                setTimeout(() => {
                    menu.style.display = 'none';
                    menu.style.opacity = 0;
                }, 300); // wait for animation to complete
            } else {
                menu.style.display = 'block';
                menu.style.animation = 'fadeInUp 0.3s forwards';
                setTimeout(() => {
                    menu.style.opacity = 1;
                }, 300); // ensure the opacity change matches the duration of fadeInUp
            }
        } else {
            menu.style.animation = 'fadeOutDown 0.3s forwards';
            setTimeout(() => {
                menu.style.display = 'none';
                menu.style.opacity = 0;
            }, 300); // wait for animation to complete
        }
    });
}

function toggleSubMenu(menuId) {
    const subMenus = ['layers-menu', 'info-menu', 'radar-settings', 'alerts-settings', 'map-settings', 'alert-list-submenu', 'general-info', 'attributions', 'reports-settings', 'outlooks-settings', 'hurricane-settings', 'lightning-settings', 'weather-radio-settings'];
    subMenus.forEach(id => {
        const menu = document.getElementById(id);
        if (menuId === id) {
            if (menu.style.display === 'block') {
                menu.style.animation = 'fadeOutDown 0.3s forwards';
                setTimeout(() => {
                    menu.style.display = 'none';
                    menu.style.opacity = 0;
                }, 300); // wait for animation to complete
            } else {
                menu.style.display = 'block';
                menu.style.animation = 'fadeInUp 0.3s forwards';
                setTimeout(() => {
                    menu.style.opacity = 1;
                }, 300); // ensure the opacity change matches the duration of fadeInUp
            }
        } else {
            menu.style.animation = 'fadeOutDown 0.3s forwards';
            setTimeout(() => {
                menu.style.display = 'none';
                menu.style.opacity = 0;
            }, 300); // wait for animation to complete
        }
    });
}

// Function to close all menus
function closeAllMenus() {
    const allMenus = ['layers-menu', 'info-menu', 'radar-settings', 'alerts-settings', 'map-settings', 'alert-list-submenu', 'general-info', 'attributions', 'reports-settings', 'outlooks-settings', 'hurricane-settings', 'lightning-settings', 'alert-list-menu', 'weather-radio-settings'];
    
    allMenus.forEach(id => {
        const menu = document.getElementById(id);
        if (menu && menu.style.display === 'block') {
            menu.style.animation = 'fadeOutDown 0.3s forwards';
            setTimeout(() => {
                menu.style.display = 'none';
                menu.style.opacity = 0;
            }, 300); // wait for animation to complete
        }
    });
}

// Function to toggle a specific menu with animation
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    
    if (menu.style.display === 'block') {
        // If the menu is already open, fade it out downwards
        menu.style.animation = 'fadeOutDown 0.3s forwards';
        setTimeout(() => {
            menu.style.display = 'none';
            menu.style.opacity = 0;
        }, 300); // Wait for animation to complete
    } else {
        // Otherwise, close all other menus and fade the selected one in upwards
        closeAllMenus();
        setTimeout(() => {
            menu.style.display = 'block';
            menu.style.animation = 'fadeInUp 0.3s forwards';
            setTimeout(() => {
                menu.style.opacity = 1;
            }, 300); // Ensure the opacity change matches the duration of fadeInUp
        }, 0); // Wait for closing animations to complete before opening
    }
}


// Function to open the layers menu
function openLayersMenu() {
    // Assuming toggleMainMenu function exists and is used to open the layers menu
    if (typeof toggleMainMenu === 'function') {
        toggleMainMenu('layers-menu');
    }
}

// Function to close all menus
function closeAllMenus() {
    const allMenus = ['layers-menu', 'info-menu', 'radar-settings', 'alerts-settings', 'map-settings', 'alert-list-submenu', 'general-info', 'attributions', 'reports-settings', 'outlooks-settings', 'hurricane-settings', 'lightning-settings', 'alert-list-menu', 'weather-radio-settings'];

    allMenus.forEach(id => {
        const menu = document.getElementById(id);
        if (menu && menu.style.display === 'block') {
            menu.style.animation = 'fadeOutDown 0.3s forwards';
            setTimeout(() => {
                menu.style.display = 'none';
                menu.style.opacity = 0;
            }, 300); // Wait for animation to complete
        }
    });
}

// Function to temporarily hide the connection status
function temporarilyHideConnectionStatus() {
    const connectionStatus = document.getElementById("connection-status");
    if (connectionStatus.classList.contains("show")) {
        connectionStatus.classList.add("temporarily-hidden");
        connectionStatus.classList.remove("show");
    }
}

// Function to restore the connection status if the connection is still unstable
function restoreConnectionStatusIfUnstable() {
    const connectionStatus = document.getElementById("connection-status");
    if (navigator.onLine === false || connectionStatus.classList.contains("temporarily-hidden")) {
        connectionStatus.classList.remove("temporarily-hidden");
        connectionStatus.classList.add("show");
    }
}

// Adjusted function to toggle the Alert List Menu and manage connection status display
function toggleAlertListMenu() {
    const menu = document.getElementById('alert-list-menu');
    const isMenuOpen = menu.style.display === 'block';

    if (isMenuOpen) {
        // Close the menu and restore the connection status if still unstable
        closeAllMenus();
        restoreConnectionStatusIfUnstable();
    } else {
        // Open the menu and hide the connection status temporarily
        toggleMenu('alert-list-menu');
        temporarilyHideConnectionStatus();
    }
}



// Event listeners for the menu buttons
document.getElementById('layers-button').addEventListener('click', () => toggleMenu('layers-menu'));
document.getElementById('info-button').addEventListener('click', () => toggleMenu('info-menu'));
document.getElementById('alerts-settings-button').addEventListener('click', () => toggleMenu('alerts-settings'));
document.getElementById('alert-list-button').addEventListener('click', toggleAlertListMenu);

// Load settings and initialize buttons on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    loadSettings(); // Load settings when the page loads
    initializeButtonStates(); // Initialize buttons with their states

    // If reports are enabled, start the auto-refresh
    if (reportsON) {
        startAutoRefresh();
    }
});


        // Ensure map is displayed correctly after the changes
        map.invalidateSize();

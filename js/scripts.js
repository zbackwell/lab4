var map = L.map('map').setView([40, -95], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/zbackwell/clouz9etd008301r64ycm4moc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemJhY2t3ZWxsIiwiYSI6ImNsb2l5cnE3cjA1NXoya3BkcjdqZ3RsYWYifQ.z4_szcYwFxFXbcOmaM2e5g', {
    maxZoom: 19,
    minZoom: 5,
}).addTo(map);

// prop symbol code
// code adapted from workbook example
function calculateMinValue(data){
    // create empty array for values of interest
    var allValues = [];
    // loop through each city
    for(var city of data.features){
        // retrieve the population value
        var value = city.properties["HISPANIC"];
        // add the population value to the array
        allValues.push(value);
    }
    // find the minimum population to base symbol size
    var minValue = Math.min(...allValues)

    return minValue;
}

// radius calculation
function calcPropRadius(attValue) {
    // set the minimum radius
    var minRadius = 2;
    // Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.3715) * minRadius

    return radius;
};

// create a symbol for each city feature
function createPropSymbols(data){
    // set attribute to visualize
    var attribute = "HISPANIC";

    // symbol customization
    var options = {
        fillColor: "#00441b",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            // set attribute value to a number type for calculation
            var attValue = Number(feature.properties[attribute]);

            // set the symbol radius
            options.radius = calcPropRadius(attValue);

            var layer = L.circleMarker(latlng, options);

            // add popups containing city name and population
            var popupContent = "<p><b>City:</b> " + feature.properties.NAME + "</p><p><b>Hispanic Population:</b> " + feature.properties[attribute] + "</p>";

            // bind the popup to the circle marker
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-2) 
            });

            // create the symbol
            return layer;
        }
    })
    // add symbols to the map
    .addTo(map);
};

// import the cities data
fetch('/data/USA_Major_Cities.geojson')
    .then(function(response){
        return response.json();
    })
    // callback to above functions
    .then(function(json){
        minValue = calculateMinValue(json);
        createPropSymbols(json);
    })

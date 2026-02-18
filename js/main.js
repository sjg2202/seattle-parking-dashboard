// assign the access token
mapboxgl.accessToken =
    'pk.eyJ1Ijoic2d1aWViIiwiYSI6ImNta3AwZ2Z4ODBjZHIzbW9qb3h3OWVtazIifQ.lwISYmq5Dd3dGcjFibqxwA';

// declare the map object
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-122.335167, 47.608013], // Seattle
    zoom: 11,
    attributionControl: false
});

map.addControl(
    new mapboxgl.AttributionControl({
        customAttribution: 'Created by Shayla Guieb | GEOG 458'
    })
);

let parkingChart = null;


// stalls
var grades = [0, 50, 200, 1000];

// circle sizes
var radii = [2, 5, 10, 16];

// reset button
document.getElementById('reset').onclick = function () {
    map.flyTo({
        center: [-122.335167, 47.608013],
        zoom: 11
    });
};

map.on('load', function () {

    // load data
    map.addSource('parking', {
        type: 'geojson',
        data: 'assets/parking.geojson'
    });

    map.addSource('neighborhoods', {
        type: 'geojson',
        data: 'assets/neighborhoods.geojson'
    });

    // neighborhoods layer
    map.addLayer({
        id: 'neighborhoods',
        type: 'line',
        source: 'neighborhoods',
        paint: {
            'line-color': '#6b7280',
            'line-opacity': 0.4,
            'line-width': 1
        }
    });

    // parking points
    map.addLayer({
        id: 'parking',
        type: 'circle',
        source: 'parking',
        paint: {
            'circle-radius': {
            property: 'DEA_STALLS',
            stops: [
                [grades[0], radii[0]],
                [grades[1], radii[1]],
                [grades[2], radii[2]],
                [grades[3], radii[3]]
            ]
            },
            'circle-color': '#325a55',
            'circle-opacity': 0.7,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

    map.on('mouseenter', 'parking', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'parking', function () {
        map.getCanvas().style.cursor = '';
    });

    // popup
    map.on('click', 'parking', function (e) {
        var properties = e.features[0].properties;

        var name = properties.DEA_FACILITY_NAME;
        var stalls = properties.DEA_STALLS;

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<b>" + name + "</b><br>" + "Stalls: " + Number(stalls).toLocaleString())
            .addTo(map);
    });

    // update numbers and charts
    map.on('idle', function () {

        var features = map.queryRenderedFeatures({
            layers: ['parking']
        });

        // facilities count
        document.getElementById('facility-count').innerHTML =
            features.length.toLocaleString();

        // stall total
        var total = 0;

        for (var i = 0; i < features.length; i++) {
            var stalls = Number(features[i].properties.DEA_STALLS);

            if (!isNaN(stalls)) {
                total = total + stalls;
            }
        }

        document.getElementById('stall-sum').innerHTML =
            total.toLocaleString();

        // chart values
        var small = 0;
        var medium = 0;
        var large = 0;

        for (var i = 0; i < features.length; i++) {
            var stalls = Number(features[i].properties.DEA_STALLS);

            if (stalls <= 50) small++;
            else if (stalls <= 200) medium++;
            else large++;
        }

        updateChart(small, medium, large);
    });

});

// chart
function updateChart(small, medium, large) {

    if (!parkingChart) {

        parkingChart = c3.generate({
            bindto: '#parking-chart',
            data: {
                columns: [
                    ['Facilities', small, medium, large]
                ],
                type: 'bar',
                colors: {
                    Facilities: '#325a55'
                }
            },
            axis: {
                x: {
                    type: 'category',
                    categories: ['0–50', '51–200', '200+']
                }
            },
            padding: {
                left: 40,
                right: 10
            }
        });

    } else {

        parkingChart.load({
            columns: [
                ['Facilities', small, medium, large]
            ]
        });
    }
}
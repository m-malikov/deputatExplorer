var map = L.map('mapid').setView([80, 100], 3);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
}).addTo(map);

function style(feature) {
    return {
        fillColor: "#712f26",
        fillOpacity: 0.3,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
    }
}

fetch('russia_compressed.json').then(response => {
    return response.json();
}).then(features => {
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    
    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Статистика по регионам</h4>' +  (props ?
            '<b>' + props.main_name + '</b><br/>'
            : 'Наведите на регион');
    };
    
    info.addTo(map);
    
    function highlightFeature(e) {
        var layer = e.target;
    
        layer.setStyle({
            weight: 2,
            dashArray: '',
            fillOpacity: 0.1
        });
    
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);
    }

    var regionsLayer;

    function resetHighlight(e) {
        regionsLayer.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }

    regionsLayer = L.geoJSON(features, {style, onEachFeature}).addTo(map);
  })
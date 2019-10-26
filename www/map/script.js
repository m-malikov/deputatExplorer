var map = L.map('mapid').setView([70, 100], 3);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
}).addTo(map);

function getColor(props) {
    var d  = parseFloat(props.m) / parseFloat(props.median);
    console.log(props);
	return d > 1000 ? '#800026' :
	       d > 500  ? '#BD0026' :
	       d > 200  ? '#E31A1C' :
	       d > 100  ? '#FC4E2A' :
	       d > 50   ? '#FD8D3C' :
	       d > 20   ? '#FEB24C' :
	       d > 10   ? '#FED976' :
	                  '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties),
        fillOpacity: 0.7,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
    }
}

function normalize_number(number) {
    let value = parseInt(number).toLocaleString(options={maximumFractionDigits: 0});
    if (value == "NaN") {
        return "-"
    } else {
        return value;
    }
}

fetch('russia_with_data.json').then(response => {
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
        this._div.innerHTML = '<h4>Статистика по регионам</h4></br>' +  (props ?
            '<b>' + props.main_name + '</b><br/>' +
            `<table>
                <tr>
                    <td>Средний доход чиновников-мужчин</td>
                    <td>${normalize_number(props.m)}</td>
                </tr>
                <tr>
                    <td>Средний доход чиновников-женщин</td>
                    <td>${normalize_number(props.f)}</td>
                </tr>
                <tr>
                    <td>Средний доход в регионе</td>
                    <td>${normalize_number(props.median)}</td>
                </tr>
                <tr>
                    <td>Отношение дохода чиновника к среднему</td>
                    <td><b>${normalize_number(Math.round(props.m / props.median))}</b></td>
                </tr>
            </table>`
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
    map.invalidateSize();
  })
var map = L.map('mapid').setView([70, 100], 3);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
}).addTo(map);

function normalize_number(number) {
    let value = parseInt(number).toLocaleString(options={maximumFractionDigits: 0});
    if (value == "NaN" || value == 0 || value == "Infinity") {
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
                    <td>${normalize_number(props.man_mean)}</td>
                </tr>
                <tr>
                    <td>Средний доход чиновников-женщин</td>
                    <td>${normalize_number(props.fem_mean)}</td>
                </tr>
                <tr>
                    <td>Средний доход в регионе</td>
                    <td>${normalize_number(props.salary_mean)}</td>
                </tr>
                <tr>
                    <td>Индекс роста региона</td>
                    <td><b>${props.growing_index}<b></td>
                </tr>
                <tr>
                    <td>Средние денежные накопления чиновников</td>
                    <td>${normalize_number(props.savings_mean)}</td>
                </tr>
                <tr>
                    <td>Средний доход супругов чиновников</td>
                    <td>${normalize_number(props.siblings_mean_income)}</td>
                </tr>
                <tr>
                    <td>Отношение дохода чиновника к среднему</td>
                    <td><b>${(parseFloat(props.man_mean) / parseFloat(props.salary_mean)).toLocaleString()}</b></td>
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

    var ratioLayer;
    var growthLayer;

    function resetHighlight(e) {
        if (map.hasLayer(ratioLayer))
            ratioLayer.resetStyle(e.target);
        if (map.hasLayer(growthLayer))
            growthLayer.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }
    
    function ratioStyle(feature) {
        function getColor(props) {
            if (props.salary_mean == 0) {
                return '#FFEDA0'
            }
            var d  = parseFloat(props.man_mean) / parseFloat(props.salary_mean);
            return d > 30 ? '#800026' :
                   d > 15 ? '#BD0026' :
                   d > 10 ? '#E31A1C' :
                   d > 5  ? '#FC4E2A' :
                   d > 3  ? '#FD8D3C' :
                   d > 2  ? '#FEB24C' :
                   d > 1  ? '#FED976' :
                            '#FFEDA0';
        }
        return {
            fillColor: getColor(feature.properties),
            fillOpacity: 0.7,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
        }
    }

    ratioLayer = L.geoJSON(features, {"style": ratioStyle, onEachFeature}).addTo(map);;

    function growthStyle(feature) {
        function getColor(props) {
            if (props.salary_mean == 0) {
                return '#FFEDA0'
            }
            var d  = props.growing_index;
            return d > 8 ? '#034e7b' :
                   d > 7 ? '#0570b0' :
                   d > 5 ? '#3690c0' :
                   d > 3  ? '#74a9cf' :
                   d > 2  ? '#a6bddb' :
                   d > 1  ? '#d0d1e6' :
                   d > 0  ? '#ece7f2' :
                            '#fff7fb';
        }
        return {
            fillColor: getColor(feature.properties),
            fillOpacity: 0.7,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
        }
    } 
    growthLayer = L.geoJSON(features, {"style": growthStyle, onEachFeature});

    L.control.layers({"Отношение дохода чиновника к среднему": ratioLayer, "Индекс роста региона": growthLayer}, {}).addTo(map);
    map.invalidateSize();
  })
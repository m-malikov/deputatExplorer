let params = new URLSearchParams(document.location.search.substring(1));
let id = params.get("id");



var CELL_COST = 1000;
var AVERAGE_SALARY;
var PERSON_SALARY;
function createTable() {
    var n_cells = PERSON_SALARY / CELL_COST;
    var innerHTML = "";
    var coin_size = Math.max(15, -PERSON_SALARY/35000 + 198/7);
    for (let i=0; i < n_cells; i++) {
        innerHTML +=  `<div class="coin" style="width: ${coin_size}px; height: ${coin_size}px; margin: ${coin_size/2}px"></div>`
    }
    let area = document.getElementById('area');
    area.innerHTML = innerHTML;
}

var WORK_PERIODS = 0;
function work() {
    WORK_PERIODS += 1;
    var total_earned = WORK_PERIODS * AVERAGE_SALARY;
    var cells_to_highlight = total_earned / CELL_COST;
    console.log(AVERAGE_SALARY);
    
    for ([i, child] of document.getElementById("area").childNodes.entries()) {
        child.classList.add("activated");
        if (i > cells_to_highlight) break;
    }

    document.getElementById("work_periods").innerText = WORK_PERIODS;
    Date.prototype.addMonths = function(months) {
        var date = new Date(this.valueOf());
        date.setMonth(date.getDate() + months);
        return date;
    }
    var date = new Date();
    document.getElementById("current_date").innerText = date.addMonths(WORK_PERIODS).toLocaleDateString();
    document.getElementById("total_earned").innerText = parseInt(total_earned).toLocaleString();

    if (total_earned > PERSON_SALARY) {
        document.getElementById("start_working").style.display = "none";
    }
}

function start_working() {
    document.getElementById("start_working").innerText = "Продолжить работу";
    document.getElementById("start_working").onclick = work;
    document.getElementById("time").style.display = "block";
    work();
}

fetch(`/api/get/${id}`)
.then(response => {
    return response.json();
}).then(person_data => {
    document.getElementById('name').innerText = person_data.name;
    document.getElementById('big_salary').innerHTML = 'Зарабатывает <b>' + parseInt(person_data.salary / 12).toLocaleString() + '</b> ₽ в месяц';
    document.getElementById('office_name').innerText = person_data.office_names.join("\n");
    document.getElementById('region_name').innerText = person_data.region_names.join(", ");

    fetch('/map/russia_with_data.json')
    .then(response => {
        return response.json();
    }).then(regions_data => {
        AVERAGE_SALARY = 32635;
        document.getElementById('small_salary').innerHTML = 'Средний доход в России <b>' + parseInt(AVERAGE_SALARY).toLocaleString() + '</b> ₽ в месяц'; 
        for (region of regions_data["features"]) {
            if (person_data.region_ids.includes(region.properties.id)) {
                AVERAGE_SALARY = region.properties.median;
                document.getElementById('small_salary').innerHTML = 'Средний доход в регионе <b>' + parseInt(AVERAGE_SALARY).toLocaleString() + '</b> ₽ в месяц';
                break;
            }
        }
        PERSON_SALARY = person_data.salary / 12;
        createTable();
    })
})
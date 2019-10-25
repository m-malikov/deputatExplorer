let NAME = ''
let BIG_SALARY = 0
let SMALL_SALARY = 35836
let CELLS_IN_ROW = 100
let CELLS_IN_SMALL_SALARY = 3
let CELL_COST = 0
let CELLS_NUMBER = 0
let CELLS_PAINTED = 0
let WORKED = 0

let YEAR_FLAG = false

function generate_cubes(n, m, size_n, size_m) {
    let area = document.getElementById('area')
    let table = document.createElement('table')
    let counter = 0
    for (let i=0; i<n; i++) {
        let tr = table.insertRow()
        for (let j=0; j<m; j++) {
            let td = tr.insertCell()
            td.style.width = size_n + 'px'
            td.style.height = size_m + 'px'
            td.id = i*m + j

            counter++
            if (counter >= CELLS_NUMBER) {
                break
            }
        }
    }
    area.appendChild(table)
}

function get_good_month(n) {
    n %= 100
    if (n >= 5 && n <= 20) {
        return 'месяцев'
    }
    n %= 10
    if (n === 1) {
        return 'месяц'
    }
    if (n >= 2 && n <= 4) {
        return 'месяца'
    }
    return 'месяцев'
}

function get_good_number(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function work() {
    if (CELLS_PAINTED >= CELLS_NUMBER) return

    for (let i=0; i<CELLS_IN_SMALL_SALARY; i++) {
        if (CELLS_PAINTED >= CELLS_NUMBER) return
        document.getElementById(CELLS_PAINTED++).style.backgroundColor = 'red'
    }

    if (YEAR_FLAG) {
        WORKED += 12
    } else {
        WORKED += 1
    }

    if (!YEAR_FLAG && WORKED === 12) {
        let btn1 = document.getElementById('work_button1')
        btn1.className += ' btn_disabled'
        btn1.onclick = null
        document.getElementById('work_button2').style.display = 'block'
        CELLS_IN_SMALL_SALARY *= 12
        YEAR_FLAG = true
    }

    document.getElementById('worked').innerText = 'Вы работали ' + WORKED + ' ' + get_good_month(WORKED)
}

function fetch_all() {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://176.99.11.79/api/getAll', false)
    xhr.send()
    if (xhr.status !== 200) {
        console.error(xhr.status + ': ' + xhr.statusText)
        return {}
    } else {
        return JSON.parse(xhr.responseText)
    }
}

function fetch_official(id) {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://176.99.11.79/api/get/' + id, false)
    xhr.send()
    if (xhr.status !== 200) {
        console.error(xhr.status + ': ' + xhr.statusText)
        return {}
    } else {
        return JSON.parse(xhr.responseText)
    }
}

function init_data(id) {
    let res = fetch_official(id)
    console.log(res)
    NAME = res.name
    BIG_SALARY = res.salary
    CELL_COST = SMALL_SALARY / CELLS_IN_SMALL_SALARY
    CELLS_NUMBER = BIG_SALARY / CELL_COST
    document.getElementById('name').innerText = NAME
    document.getElementById('big_salary').innerText = 'Зарабатывает ' + get_good_number(BIG_SALARY) + '₽ в год'
    document.getElementById('small_salary').innerText = 'Вы зарабатываете ' + get_good_number(SMALL_SALARY) + '₽ в месяц'
    generate_cubes(Math.ceil(CELLS_NUMBER / CELLS_IN_ROW), CELLS_IN_ROW, 5, 5)

}

let all_officials = fetch_all()
init_data(all_officials[0].id)

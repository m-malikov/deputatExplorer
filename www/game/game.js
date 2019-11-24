const params = new URLSearchParams(document.location.search.substring(1))
const id = params.get('id')

var CELL_COST = 1000
var AVERAGE_SALARY
var PERSON_SALARY
function createTable () {
    var nCells = PERSON_SALARY / CELL_COST
    var innerHTML = ''
    var coinSize = Math.max(15, -PERSON_SALARY / 35000 + 198 / 7)
    for (let i = 0; i < nCells; i++) {
        innerHTML += `<div class="coin" style="width: ${coinSize}px; height: ${coinSize}px; margin: ${coinSize / 2}px"></div>`
    }
    const area = document.getElementById('area')
    area.innerHTML = innerHTML
}

function addOther () {
    const otherIds = localStorage.getItem('otherIds').split(',')
    for (const otherId of otherIds) {
        if (otherId !== id) {
            fetch(`/api/get/${otherId}`)
                .then(response => {
                    return response.json()
                }).then(otherData => {
                    document.getElementById('others').innerHTML += `<li><a href="/game/game.html?id=${otherId}">${otherData.name}</a></li>`
                })
        }
    }
}

function addPhoto (name) {
    fetch('/api/getPhoto?name=' + encodeURI(name)).then(response => {
        if (response.ok) {
            return response.text()
        }
    }).then(url => {
        if (url) document.getElementById('photo').innerHTML += `<img src="${url}" class="avatar"></img>`
    })
}

var WORK_PERIODS = 0
function work () {
    WORK_PERIODS += 1
    const totalEarned = WORK_PERIODS * AVERAGE_SALARY
    const cellsToHighlight = totalEarned / CELL_COST
    console.log(AVERAGE_SALARY)

    for (const [i, child] of document.getElementById('area').childNodes.entries()) {
        child.classList.add('activated')
        if (i > cellsToHighlight) break
    }

    document.getElementById('work_periods').innerText = WORK_PERIODS
    Date.prototype.addMonths = function (months) {
        const date = new Date(this.valueOf())
        date.setMonth(date.getDate() + months)
        return date
    }
    const date = new Date()
    document.getElementById('current_date').innerText = date.addMonths(WORK_PERIODS).toLocaleDateString()
    document.getElementById('total_earned').innerText = parseInt(totalEarned).toLocaleString()

    if (totalEarned > PERSON_SALARY) {
        document.getElementById('startWorking').style.display = 'none'
    }
}

function startWorking () {
    document.getElementById('startWorking').innerText = 'Работать месяц'
    document.getElementById('startWorking').onclick = work
    document.getElementById('time').style.display = 'block'
    work()
}

fetch(`/api/get/${id}`)
    .then(response => {
        return response.json()
    }).then(personData => {
        document.getElementById('name').innerText = personData.name
        document.getElementById('big_salary').innerHTML = 'Зарабатывает <b>' + parseInt(personData.salary / 12).toLocaleString() + '</b> ₽ в месяц'
        document.getElementById('office_name').innerText = personData.office_names.join('\n')
        document.getElementById('region_name').innerText = personData.region_names.join(', ')

        fetch('/map/russia_with_data.json')
            .then(response => {
                return response.json()
            }).then(regionsData => {
                AVERAGE_SALARY = 32635
                document.getElementById('small_salary').innerHTML = 'Средний доход в России <b>' + parseInt(AVERAGE_SALARY).toLocaleString() + '</b> ₽ в месяц'
                for (const region of regionsData.features) {
                    if (personData.region_ids.includes(region.properties.id)) {
                        AVERAGE_SALARY = region.properties.salary_mean
                        document.getElementById('small_salary').innerHTML = 'Средний доход в регионе <b>' + parseInt(AVERAGE_SALARY).toLocaleString() + '</b> ₽ в месяц'
                        break
                    }
                }
                PERSON_SALARY = personData.salary / 12
                createTable()
                addOther()
                addPhoto(personData.name)
            })
    })

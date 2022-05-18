// Открытие модального окна для добавления монеты
const portAdd = document.querySelector('#port-add')
portAdd.addEventListener('click', function() {
  document.getElementById('modal').style.display = 'block';
})

// Закрытие модалбного окна при нажатии на задний фон
const modal = document.querySelector('#modal');
modal.querySelector('#modal-wrap').addEventListener('click', function(event) {
  event.stopPropagation();
})
modal.addEventListener('click', function(event) {
  document.getElementById('modal').style.display = 'none';
})

// Получаем текущие цены монет
arrPrices = {};
async function getPrices() {
  const respons = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
  const data = await respons.json();

  arrPrices.BTC = data.bitcoin.usd;
  arrPrices.ETH = data.ethereum.usd;
  arrPrices.SOL = data.solana.usd;
}
getPrices();

// Осуществляем рассчеты в модальном окне
const input = document.querySelector('#input');
const output = document.querySelector('#output');
const select = document.querySelector('#select');

function getCulcModal() {
    output.value = (input.value * arrPrices[select.value]).toFixed(1);
}

input.oninput = getCulcModal;
output.oninput = getCulcModal;

select.addEventListener('change', function() {
  getCulcModal();
})

// Добавление выбранной монеты в портфель
const result = document.querySelector('#result');
const portfolioData = {};
const chartArray = {
  name: [],
  total: []
}

function getInPortfolio() {
  portfolioData.name = select.options[select.selectedIndex].dataset.name;
  portfolioData.price = document.querySelector(`#${select.value}price`);
  portfolioData.amount = document.querySelector(`#${select.value}amount`);
  portfolioData.total = document.querySelector(`#${select.value}total`);

  if (document.querySelector(`#${select.value}`) == undefined) {
  /*Если в портфеле нет такой монеты,
    то создаем HTML элемент*/ 
    assets.insertAdjacentHTML('beforeend', `
      <ul class="assets__list">
        <li class="crypto-name" id="${select.value}">${portfolioData.name}</li>
        <li id="${select.value}price">${arrPrices[select.value]}</li>
        <li id="${select.value}amount">${input.value}</li>
        <li class="crypto-total" id="${select.value}total">${output.value}</li>
      </ul>
    `);
    /*и добавляем эти данные в массив для графика*/
    chartArray.name.push(document.querySelector(`#${select.value}`).innerText);
    chartArray.total.push(document.querySelector(`#${select.value}total`).innerText);
  } else { /*Если в портфеле уже есть такая монета,
             то обновляем ее значения*/
      portfolioData.price.innerText = arrPrices[select.value];
      portfolioData.amount.innerText = (Number(portfolioData.amount.innerText) + Number(input.value)).toFixed(1);
      portfolioData.total.innerText = (Number(portfolioData.total.innerText) + Number(output.value)).toFixed(1);
      /*и обновляем значения в массиве для графика*/
      chartArray.name.forEach((elem, i) => {
        if (elem == document.querySelector(`#${select.value}`).innerText) {
          chartArray.total[i] = Number(chartArray.total[i]) + Number(output.value);
        }
      }) 
    }  
  // Суммарное значение портфеля
  result.innerText = (Number(result.innerText) + Number(output.value)).toFixed(1);
}
// Событие при нажатии на: "Добавить в портфель"
const modalAdd = document.querySelector('#modal-add');
modalAdd.addEventListener('click', function(){
  document.getElementById('modal').style.display = 'none';
  getInPortfolio();
})

// Отображение диаграммы распредления портфеля chart.js
const btnChart = document.querySelector('#chart-btn');
const x = {};
function getChartPortfolio() {

  const data = {
    labels: chartArray.name,
    datasets: [{
      backgroundColor: ['rgb(255, 99, 132)', 'rgb(132, 255, 99)', 'rgb(99, 132, 255)'],
      borderColor: ['rgb(255, 99, 132)', 'rgb(132, 255, 99)', 'rgb(99, 132, 255)'],
      data: chartArray.total,
    }]
  };

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      plugins: {
        legend: {
          display: false
        }
      }
    }
  };

    x.diagrammaChart = new Chart(
    document.getElementById('diagramma-chart'),
    config
  );
}
getChartPortfolio();
btnChart.addEventListener('click', function() {
  x.diagrammaChart.destroy();
  getChartPortfolio();
})


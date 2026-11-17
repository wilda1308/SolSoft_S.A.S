const defaultData = [
    { tiempo: 0, tasa: 15.00 },
    { tiempo: 1, tasa: 8.50 },
    { tiempo: 2, tasa: 11.00 },
    { tiempo: 3, tasa: 19.50 },
    { tiempo: 4, tasa: 31.00 },
    { tiempo: 5, tasa: 42.50 },
    { tiempo: 6, tasa: 48.00 },
    { tiempo: 7, tasa: 53.50 },
    { tiempo: 8, tasa: 47.00 },
    { tiempo: 9, tasa: 28.50 },
    { tiempo: 10, tasa: 15.00 },
]


let myChart = null;
let currentHoras = [];
let currentTasas = [];


//Cargar datos predeterminados automaticamente al abrir la página web
window.onload = function(){
    const horas = defaultData.map(d => d.tiempo);
    const tasas = defaultData.map(d => d.tasa);

    renderTablaDatos(horas, tasas);
    calcularYActualizar(horas, tasas);
    setupSidebarToggle();
    setupIspRangeListener();
    setupMetodoListener();

    //Prevención de promesas incumplidas de la librería para mostrar los LateX.
    if(window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise();
    }
};

//ESCUCHAR MOVIMIENTO DEL SLIDER ISP
function setupIspRangeListener(){
    const rangeInput = document.getElementById('isPlanRange');
    const rangeValueLabel = document.getElementById('ispPlanValue');

    if(rangeInput && rangeValueLabel){
        rangeInput.addEventListener('input', function(e){
            const horaCritica = document.getElementById('kpiHoraCritica');
            const factor = parseFloat(e.target.value);
            rangeValueLabel.innerText = `${(factor * 100).toFixed(0)}% capacidad`;
            calcularYActualizar(currentHoras, currentTasas);
            if(factor <= 2 && factor > .8){
                rangeValueLabel.classList.add('text-alert');
                horaCritica.classList.add('text-alert');
            }else{
                rangeValueLabel.classList.remove('text-alert');
                horaCritica.classList.remove('text-alert');
            }
        });
    }
}

// ESCUCHAR EL CAMBIO DEL COMBO BOX
function setupMetodoListener(){
    const select = document.getElementById('metodoSelect');
    if(select){
        select.addEventListener('change', function(){
            calcularYActualizar(currentHoras, currentTasas);
        })
    }
}

//TRAPECIOS: Suma de ((f(i) + f(i + 1)) / 2) * dt
function integrarTrapecios(horas, tasas){
    let suma = 0;
    for(let i = 0; i < horas.length - 1; i++){
        suma += ((tasas[i] + tasas[i + 1]) / 2) * (horas[i + 1] - horas[i]);
    }
    return suma;
}

// RIEMANN punto medio: Agrupa de a 2 subintervalos y evalúa en el centro. 
// Si sobra un subintervalo (n impar), ese último se completa con trapecio.
function integrarRiemannMedio(horas, tasas){
    let suma = 0;
    let i = 0;
    while(i + 2 < horas.length){
        suma += tasas[i + 1] * (horas[i + 2] - horas[i]);
        i += 2;
    }
    if(i + 1 < horas.length){
        suma += ((tasas[i] + tasas[i + 1]) / 2) * (horas[i + 1] - horas[i]);
    }
    return suma;
}

// LÓGICA DEL BOTÓN TOGGLE GLOBAL (DESKTOP Y MÓVIL)
function setupSidebarToggle(){
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const mainToggleBtn = document.getElementById('toggleSidebarMain');
    const overlay = document.getElementById('sidebarOverlay');

    function hideSidebar(){
        sidebar.classList.add('collapsed');
        sidebar.classList.remove('mobile-open');
        document.body.classList.add('sidebar-is-collapsed');
        overlay.classList.remove('active');
    }

    function showSidebar(){
        sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-is-collapsed');

        if(window.innerWidth <= 850){
            sidebar.classList.add('mobile-open');
            overlay.classList.add('active');
        }
    }

    if(closeBtn) closeBtn.addEventListener('click', hideSidebar);
    if(mainToggleBtn) mainToggleBtn.addEventListener('click', showSidebar);
    if(overlay) overlay.addEventListener('click', hideSidebar);
}

//Función para cambiar paneles de información
function openTab(evt, tabId){
    const tabPanels = document.getElementsByClassName("tab-panel");
    for(let panel of tabPanels){
        panel.classList.remove("active");
    }

    const tabLinks = document.getElementsByClassName("tab-link");
    for(let link of tabLinks){
        link.classList.remove("active")
    }

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");

    if(window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise();
    }
}

//Escuchar la subida del nuevo archivo CSV
document.getElementById('csvFileInput').addEventListener('change', function(e){
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(evt){
        procesarCSV(evt.target.result);
    };
    reader.readAsText(file);
});


function procesarCSV(csvText){
    const lines = csvText.trim().split('\n');
    const horas = [];
    const tasas = [];

    for(let i = 1; i <lines.length; i++){
        const delimiter = lines[i].includes(';')?';':',';
        const columnas = lines[i].split(delimiter);
        if(columnas.length >= 2){
            const h = parseFloat(columnas[0].trim().replace(',', '.'));
            const t = parseFloat(columnas[1].trim().replace(',', '.'));
            
            if(!isNaN(h) && !isNaN(t)){
                horas.push(h);
                tasas.push(t);
            }
        }
    }

    renderTablaDatos(horas, tasas);
    calcularYActualizar(horas, tasas);
}

function calcularYActualizar(horas, tasas){

    currentHoras = horas;
    currentTasas = tasas

    //Calcular factor multiplicador del slider
    const rangeInput = document.getElementById('isPlanRange');
    const factor  = rangeInput? parseFloat(rangeInput.value) : 1.0;

    //Aplicar factor a la tasa de consumo
    const tasasAjustadas = tasas.map(t => t * factor);
    

    //1. Trapecios
    const sumaTrapecio = integrarTrapecios(horas, tasasAjustadas);
    const tfcMb = (sumaTrapecio * 3600) / 1024;
    const tfcGb = tfcMb / 1024;
    const mensualGb = tfcGb * 22;

    //2. Riemann punto medio
    const sumaRiemann = integrarRiemannMedio(horas, tasasAjustadas);
    const riemannMb = (sumaRiemann * 3600) / 1024;
    const riemannGb = riemannMb / 1024;
    const riemannMensualGb = riemannGb * 22;

    //3. Método seleccionado en el combo box
    const metodo = document.getElementById('metodoSelect')?.value || 'todos';
    const usaRiemann = metodo === "riemann";
    const sumaActiva = usaRiemann ? sumaRiemann : sumaTrapecio;
    const mbActivo = usaRiemann ? riemannMb : tfcMb;
    const mensualActivo = usaRiemann ? riemannMensualGb : mensualGb;
    const nombreMetodo = usaRiemann ? 'Sumas de Riemann (Punto medio)' : (metodo === 'tfc' ? 'Teorema Fundamental del Cálculo (Trapecios)' : 'Trapecios (base de comparación)')

    //KPIs
    const promedioKbs = sumaActiva / (horas[horas.length - 1] - horas[0]);
    const maxTasa = Math.max(...tasasAjustadas);
    const maxHora = horas[tasasAjustadas.indexOf(maxTasa)];

    document.getElementById('kpiTotalGbDiario').innerHTML = `${mbActivo.toFixed(2)} MB`;
    document.getElementById('kpiTotalGbMensual').innerHTML = `${mensualActivo.toFixed(2)} GB`;
    document.getElementById('kpiPromedio').innerHTML = `${promedioKbs.toFixed(2)} KB/s`;
    document.getElementById('kpiHoraCritica').innerHTML = `${maxHora}:00 h (${maxTasa.toFixed(2)} KB/s)`;


    const badge = document.getElementById('kpiMetodoBadge');
    if(badge) badge.innerHTML = `Método activo: ${nombreMetodo}`

    //Tabla comparativa
    document.getElementById('valTfc').innerHTML = `${tfcMb.toFixed(2)} MB`;
    document.getElementById('valTfcMes').innerHTML = `${mensualGb.toFixed(2)} GB/mes`;
    document.getElementById('valRiemann').innerHTML = `${riemannMb.toFixed(2)} MB`;
    document.getElementById('valRiemannMes').innerHTML = `${riemannMensualGb.toFixed(2)} GB/mes`;

    const difRel = tfcMb !== 0 ? ((riemannMb - tfcMb) / tfcMb) * 100 : 0;
    document.getElementById('difRiemann').innerHTML = `${difRel >= 0 ? '+' : ''}${difRel.toFixed(2)}%`;

    // Mostrar/ocultar filas según la selección
    document.getElementById('rowTfc').style.display = (metodo === 'riemann') ? 'none' : '';
    document.getElementById('rowRiemann').style.display = (metodo === 'tfc') ? 'none' : '';

    renderChart(horas, tasasAjustadas, tasas);
}

function renderTablaDatos(horas, tasas){
    let tableHtml = `
    <table class = "data-table">
        <thead>
            <tr>
                <th>Tiempo (Horas)</th>
                <th>Tasa de Consumo (KB/s)</th>
                <th>Ancho de Banda Instantáneo</th>
            </tr>
        </thead>
        <tbody>`;

    for(let i = 0; i < horas.length; i++){
        const mbps = (tasas[i]*8) / 1000;
        tableHtml += `
            <tr>
                <td>Hora ${horas[i]}</td>
                <td>${tasas[i].toFixed(2)} KB/s</td>
                <td>${mbps.toFixed(3)} Mbps</td>
            </tr>`;
    }

    tableHtml += '</tbody></table>';
    document.getElementById('tableContainer').innerHTML = tableHtml;
}

function renderChart(labels, tasasAjustadas, data){
    const ctx = document.getElementById('trafficChart').getContext('2d');

    if(myChart){
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(h => `Hora ${h}`),
            datasets: [
                {
                    label: 'Vólumen de consumo / Integral V(t)',
                    data: tasasAjustadas,
                    fill: false,
                    borderColor: '#42FF42',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [4, 4],
                    tension: 0.3                     
                },
                {
                    label: 'Función tasa de consumo D(t) [KB/s]',
                    data: data,
                    fill: true,
                    borderColor: '#0062FF',
                    backgroundColor: 'rgba(0, 98, 255, 0.25)',
                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.3, 
                    pointBackgroundColor: '#0062FF'
                }
            ]
        },
        options: {
            responsive: true,
            plugins:{
                legend:{labels:{color: '#ffffff'}}
            },
            scales:{
                x: {ticks: {color:'#8b949e'}, grid: {color: '#30363d'}},
                y: {ticks: {color: '#8b949e'},grid: {color: '#30363d'}}
            }
        }
    });
}
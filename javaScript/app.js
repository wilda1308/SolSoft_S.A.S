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
            rangeValueLabel.innerHTML = `${parseFloat(e.target.value).toFixed(0)} % de reducción`;
            calcularYActualizar(currentHoras, currentTasas);
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

    //Si sobra un intervalo, se completa con trapecio
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

    //Si la pantalla pasa a modo escritorio (ej: 'Sitios para ordenadores o girar el Equipo), se limpia el estado móvil para que no quede el fondo oscuro / blur pegado.
    const modoMovil = window.matchMedia ('(max-width: 850px)');

    function limpiarEstadoMovil(e){
        overlay.classList.remove('active');
        sidebar.classList.remove('mobile-open');
    }

    if(modoMovil.addEventListener) modoMovil.addEventListener('change', limpiarEstadoMovil);
    else modoMovil.addEventListener(limpiarEstadoMovil);

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

//Validar que los intervalos de tiempo sean continuos y uniformes
function tieneIntervalosUniformes(horas){
    if(horas.length < 2) return false;

    const intervaloBase = horas[1] - horas[0];

    if(intervaloBase <= 0) return false;

    for(let i = 1; i < horas.length - 1; i++){
        const intervaloActual = horas[i + 1] - horas[i];

        if(Math.abs(intervaloActual - intervaloBase) > 0.000001){
            return false;
        }
    }

    return true
}

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

    // Validar cantidad minima de registros
    if(horas.length < 2){
        alert('El archivo debe contener al menos dos registros válidos.');
        return;
    }

    // Validar intervalos de tiempo
    if(!tieneIntervalosUniformes(horas)){
        alert('Los intervalos de tiempo deben ser uniformes y estar ordenados para utilizar el método de Riemann.');
        return;
    }

    renderTablaDatos(horas, tasas);
    calcularYActualizar(horas, tasas);
}

function calcularYActualizar(horas, tasas){

    currentHoras = horas;
    currentTasas = tasas

    //Slider: % de reducción de tráfico pormedio de VLANs (0 - 50%)
    const rangeInput = document.getElementById('isPlanRange');
    const reduccion = (rangeInput ? parseFloat(rangeInput.value) : 0) / 100;
    const factor = 1 - reduccion;

    //Tráfico optimizado  = tráfico actual * (1 - reduccion). El tráfico actual NO cambia.
    const tasasOpt = tasas.map(t  => t * factor);
    
    //1. Trapecios
    const sumaTrapecio = integrarTrapecios(horas, tasas);
    const tfcMb = (sumaTrapecio * 3600) / 1024;
    const tfcGb = tfcMb / 1024;
    const mensualGb = tfcGb * 22;

    //2. Riemann punto medio
    const sumaRiemann = integrarRiemannMedio(horas, tasas);
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
    const maxTasa = Math.max(...tasas);
    const maxHora = horas[tasas.indexOf(maxTasa)];
    const maxTasaOpt = maxTasa * factor;

    document.getElementById('kpiTotalGbDiario').innerHTML = `${mbActivo.toFixed(2)} MB`;
    document.getElementById('kpiTotalGbMensual').innerHTML = `${mensualActivo.toFixed(2)} GB`;
    document.getElementById('kpiPromedio').innerHTML = `${promedioKbs.toFixed(2)} KB/s`;
    document.getElementById('kpiHoraCritica').innerHTML = `${maxHora}:00 h (${maxTasaOpt.toFixed(2)} KB/s)`;


    //KPIs de optimización (por linealidad: /integral K*D = K . /integral D)
    const optMb = mbActivo * factor;
    document.getElementById('kpiOptimizado').innerHTML = `${optMb.toFixed(2)} MB`;
    document.getElementById('kpiAhorro').innerHTML = `${(mbActivo - optMb).toFixed(2)} MB (${(reduccion * 100).toFixed(0)} %)`;

    //Alerta visual: 
    const critico = reduccion <= 0.2;

    const lblSlider = document.getElementById('ispPlanValue');
    const kpiHora = document.getElementById('kpiHoraCritica');
    const kpiOptimizado = document.getElementById('kpiOptimizado');
    const kpiAhorro = document.getElementById('kpiAhorro');
    
    [lblSlider, kpiHora, kpiOptimizado, kpiAhorro].forEach( el => {
        if(el) el.classList.toggle('text-alert', critico)
    });

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

    renderChart(horas, tasasOpt, tasas, reduccion);
    renderChartAcumulado(horas, tasas, tasasOpt, reduccion);
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
                <td><strong>${horas[i]}</strong></td>
                <td>${tasas[i].toFixed(2)} KB/s</td>
                <td>${mbps.toFixed(3)} Mbps</td>
            </tr>`;
    }

    tableHtml += '</tbody></table>';
    document.getElementById('tableContainer').innerHTML = tableHtml;
}

function colorOptimizado(reduccion){
    return reduccion <= 0.2? '#FF4B4B' : '#42FF42';
}

function esMovil(){
    return window.matchMedia('(max-width: 600px)').matches;
}

function opcionesLeyenda(){
    const m = esMovil();
    return{
        position: m ? 'bottom' : 'top',
        labels: {
            color: '#ffffff',
            boxWidth: m ? 22 : 40,
            boxHeight: m ? 8 : 12,
            padding: m ? 10 : 14,
            font: { size: m ? 11 : 12 }
        }
    };
}

function fuenteEjes(){
    return { size: esMovil() ? 10: 12};
}

function tituloEje(texto){
    return { display: true, text: texto, color: '#8b949e', font: fuenteEjes()};
}

function renderChart(labels, tasasAjustadas, data, reduccion){
    const ctx = document.getElementById('trafficChart').getContext('2d');

    if(myChart){
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(h => `${h}`),
            datasets: [
                {
                    label: 'Optimizado (VLANs) [KB/s]',
                    data: tasasAjustadas,
                    fill: false,
                    borderColor: colorOptimizado(reduccion),
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [4, 4],
                    tension: 0.3
                },
                {
                    label: 'Función Tráfico Actual D(t) [KB/s]',
                    data: data,
                    fill: true,
                    borderColor: '#0062FF',
                    backgroundColor: 'rgba(0, 98, 255, 0.25)',
                    borderWidth: 3,
                    pointRadius: esMovil() ? 2.5 : 4,
                    tension: 0.3, 
                    pointBackgroundColor: '#0062FF'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { right: esMovil() ? 6 : 0}},
            plugins:{
                legend: opcionesLeyenda(),
                title:{ 
                    display: true, 
                    text: 'Tráfico Actual vs Optimizado con VLANs', 
                    color: '#FFF', 
                    font: {size: esMovil() ? 14 : 16}},
                subtitle: {
                    display: true, 
                    text: 'D(t) y Área Bajo la curva (jornada de 10 horas)', 
                    color: '#8b949e', 
                    font: { size: esMovil() ? 11 : 12 }, 
                    padding: {bottom: 12}}},
            scales:{
                x: {
                    ticks: {
                        color:'#8b949e',
                        font: fuenteEjes(),
                        maxRotation: 0,
                        autoSkip: true},
                    grid: {color: '#30363d'}, 
                    title: tituloEje('Tiempo (Horas)')},
                y: {
                    ticks: {
                        color: '#8b949e',
                        font: fuenteEjes(),
                        maxRotation: 0, 
                        autoSkip: true},
                    grid: {color: '#30363d'}, 
                    title: tituloEje('Tasa de consumo (KB/s)')}
            }
        }
    });
}

let accumChart;

//MB Acumulados desde t = 0, hora a hora (Trapecios)
function calcularAcumulado(horas, tasas){
    const acumulado = [0];
    for(let i = 1; i < horas.length; i++){
        const areaKb = ((tasas[i - 1] + tasas[i]) / 2) * (horas[i] - horas[i - 1]) * 3600;
        acumulado.push(acumulado[i - 1] + areaKb / 1024);
    }
    return acumulado;
}

function renderChartAcumulado(horas, tasas, tasasOpt, reduccion){
    const canvas = document.getElementById('accumChart');
    if(!canvas) return;

    const acumulado = calcularAcumulado(horas, tasas);
    const acumOpt = calcularAcumulado(horas, tasasOpt);
    const puntos = horas.map((h, i) => ({x: h, y: acumulado[i]}));
    const puntosOpt = horas.map((h, i) => ({x: h, y: acumOpt[i]}));
    const total = acumulado[acumulado.length - 1];
    const totalOpt = acumOpt[acumOpt.length - 1];

    if(accumChart) accumChart.destroy();

    accumChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { datasets: [{
            label: 'Tráfico acumulado (MB)',
            data: puntos,
            borderColor: '#0062FF',
            backgroundColor: 'rgba(0, 98, 255, 0.18)',
            fill: true,
            borderWidth: 3,
            pointRadius: esMovil() ? 2 : 3,
            pointBackgroundColor: '#0062FF',
            tension: 0.25
        },
        {
            label: 'Optimizado con VLANs (MB)',
            data: puntosOpt,
            borderColor: colorOptimizado(reduccion),
            fill: false,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.25
        }
    ]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: opcionesLeyenda(),
                title: { 
                    display: true, 
                    text: 'Volumen Acumulado (Megabytes)', 
                    color: "#FFF", 
                    font: { size: esMovil() ? 14 : 16}},
                subtitle: {
                    display: true, 
                    text: esMovil() ? [`Total: ${total.toFixed(2)} MB actual`, `${totalOpt.toFixed(2)} MB optimizado`] : [`Total de la jornada: ${total.toFixed(2)} MB actual · ${totalOpt.toFixed(2)} MB optimizado`], 
                    color: '#8b949e',
                    font: { size: esMovil() ? 11 : 12}},
                tooltip: { callbacks: {
                    title: items => `Hora ${items[0].parsed.x}`,
                    label: item => `${item.parsed.y.toFixed(2)} MB acumulados`
                }}
            },
            scales: {
                x: { 
                    type: 'linear', 
                    min: horas[0], 
                    max: horas[horas.length - 1],
                    title: tituloEje('Tiempo (Horas)'),
                    ticks: { 
                        color: '#8b949e', 
                        font: fuenteEjes,
                        stepSize: 1},
                    grid: { color: '#30363d'}},
                y: {
                    beginAtZero: true,
                    title: tituloEje('Tráfico Acumulado (MB)'),
                    ticks: { 
                        color: '#8b949e',
                        font: fuenteEjes(),
                        maxTicksLimit: esMovil() ? 6 : 8}, 
                    grid: { color:'#30363d'}
                }
            }
        }
    });
}

let ultimoEsMovil = esMovil();
window.addEventListener('resize', function(){
    if(esMovil() !== ultimoEsMovil){
        ultimoEsMovil = esMovil();
        if(currentHoras.length){
            calcularYActualizar(currentHoras, currentTasas);
        }
    }
})
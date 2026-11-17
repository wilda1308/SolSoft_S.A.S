<p align="center">
  <img src="Assets/images/logos/logotipoSolsoftSAS.svg"
       alt="Logo SolSoft S.A.S."
       width="350">
</p>

# SolSoft S.A.S. – Network Analytics

<p align = "center">
   <a href="https://wilda1308.github.io/SolSoft_S.A.S">SolSoft S.A.S Network Analytics</a>
</p>

Aplicación web para el análisis y la estimación del consumo de ancho de banda de una red empresarial. Permite visualizar el comportamiento del tráfico, calcular el volumen de datos mediante métodos de integración numérica y reconocer las horas de mayor demanda para apoyar la toma de decisiones sobre la infraestructura de red.


<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/MathJax-000000?style=for-the-badge&logo=mathjax&logoColor=white" alt="MathJax">
  <img src="https://img.shields.io/badge/Bootstrap_Icons-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap Icons">
  <img src="https://img.shields.io/badge/MATLAB-0076A8?style=for-the-badge&logo=mathworks&logoColor=white" alt="MATLAB">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git">
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white" alt="GitHub Pages">
</p>

---

## Características principales (Features)

- **Dashboard de indicadores:** consulta el consumo total diario y mensual, la tasa promedio y la hora de mayor consumo.
- **Visualización del tráfico:** gráfica interactiva de la tasa de consumo y su comportamiento durante la jornada.
- **Carga de archivos CSV:** importa datos de consumo propios para actualizar los cálculos y las visualizaciones.
- **Comparación de métodos numéricos:** permite comparar la regla del trapecio y las sumas de Riemann por punto medio.
- **Factor de escala del tráfico:** ajusta la tasa de consumo mediante un control deslizante para simular diferentes niveles de demanda.
- **Tabla de datos:** presenta los registros importados, su tasa de consumo y el ancho de banda equivalente en Mbps.
- **Análisis matemático:** muestra la interpretación del volumen acumulado mediante integrales definidas.
- **Recomendaciones de red:** presenta una propuesta de segmentación mediante VLAN para separar los servicios de hosting y web, los equipos de desarrollo y la administración.
- **Interfaz adaptable:** incluye una barra lateral de configuración y navegación por pestañas, con adaptación para pantallas pequeñas.


## Estructura del proyecto

```text
SolSoft-S.A.S/
│
├── index.html
├── css/
│   └── styles.css
├── javaScript/
│   └── app.js
├── Assets/
│   ├── images/
│   │   └── logos/
│   │       └── logoSolsoftSAS.svg
│   └── docs/
│       └── consumo_solsoft.csv
├── matlab/
│   ├── SolsoftNetworkOnline.m
│   └── consumo_solsoft.csv
│
└── README.md
```



## Requisitos previos

### Aplicación web
- Navegador web moderno (Chrome, Edge o Firefox).
- Conexión a Internet para cargar las librerías externas mediante CDN.

### Aplicación MATLAB
- MATLAB instalado o acceso a MATLAB Online.
- Versión compatible con los componentes gráficos utilizados.
- Archivo `matlab/SolsoftNetworkOnline.m`.
- Archivo de datos en `matlab/consumo_solsoft.csv` o `Assets/docs/consumo_solsoft.csv`.



## Instalación y ejecución

### 1. Descargar el proyecto

Puedes clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

O descargarlo desde GitHub mediante **Code → Download ZIP** y extraerlo en tu equipo.

### 2. Ejecutar la aplicación web

Abre el archivo `index.html` ubicado en la raíz del proyecto utilizando tu navegador.

También puedes utilizar Visual Studio Code con la extensión Live Server.

### 3. Obervar aplicativo con GitHub Pages

Otra opción es observar el aplicativo a través del siguiente enlace [SolSoft](https://wilda1308.github.io/SolSoft_S.A.S).

### 4. Ejecutar la aplicación MATLAB

1. Abre MATLAB.
2. Navega hasta la carpeta `matlab` del proyecto.
3. Ejecuta el siguiente comando:

```matlab
cd('C:\ruta\de\tu\proyecto\matlab')
```

4. Ejecuta la función principal:

```matlab
SolsoftNetworkOnline
```

5. Se abrirá la interfaz gráfica de análisis de red.

>**Importante:** conserva el nombre `SolsoftNetworkOnline.m`, ya que corresponde a la función principal de la aplicación.


### Aplicación MATLAB

1. Ejecuta `SolsoftNetworkOnline` desde MATLAB.
2. Selecciona **Cargar CSV de Red** para importar los datos.
3. Selecciona el método de integración que deseas utilizar.
4. Configura el ancho de banda contratado.
5. Ajusta el porcentaje de optimización por VLAN.
6. Consulta las gráficas y los indicadores generados.
7. Utiliza **Exportar Resultados CSV** para guardar los resultados.

## Equipo de desarrollo

**Proyecto:** SolSoft S.A.S. – Network Analytics

**Equipo de desarrollo:**

- Juan Felipe Melo Rojas
- Ivan Gabriel Garzon Caballero
- Wilson David Monroy Ramírez

---

<p align="center">
  <strong>SolSoft S.A.S. – Network Analytics</strong><br>
  Análisis de tráfico y estimación del consumo de ancho de banda empresarial.
</p>

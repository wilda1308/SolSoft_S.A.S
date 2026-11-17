function SolsoftNetworkOnline
% SOLSOFTNETWORKONLINE Aplicación interactiva de análisis de consumo de red
% para Solsoft S.A.S. en MATLAB / MATLAB Online.

    % 1. Cargar datos de demostración de Solsoft S.A.S.
    app.Data = createDemoData();

    % 2. Crear Ventana Principal (Dashboard)
    app.Figure = uifigure( ...
        'Name','Solsoft S.A.S. - Network Analytic', ...
        'Position',[80 80 1180 690], ...
        'Color',[0.97 0.98 0.99]);

    root = uigridlayout(app.Figure,[1 2]);
    root.ColumnWidth = {280,'1x'};
    root.Padding = [0 0 0 0];
    root.ColumnSpacing = 0;

    % 3. PANEL LATERAL (Configuración)
    controls = uipanel(root,'Title','Configuración de Red', ...
        'FontWeight', 'bold','BackgroundColor',[0.20 0.40 0.70],'ForegroundColor','w');
    controls.Layout.Row = 1;
    controls.Layout.Column = 1;
    cg = uigridlayout(controls,[14 1]);
    cg.RowHeight = {28,32,24,32,24,32,24,46,32,26,26,26,'1x',40};
    cg.Padding = [14 14 14 14];

    app.FileLabel = uilabel(cg,'Text','Datos: Solsoft S.A.S. (Demo)', ...
        'FontWeight','bold','FontColor','k');

    app.LoadButton = uibutton(cg,'push', ...
        'Text','Cargar CSV de Red', ...
        'ButtonPushedFcn',@loadData, ...
        'BackgroundColor',[0.20 0.40 0.70],'FontColor','w');

    uilabel(cg,'Text','Método de Integración','FontColor','k');
    app.Method = uidropdown(cg, ...
        'Items',{'Comparar ambos','Teorema Fundamental (Trapecios)','Sumas de Riemann'}, ...
        'Value','Comparar ambos', ...
        'ValueChangedFcn',@refreshApp, ...
        'BackgroundColor',[0.20 0.40 0.70],'FontColor','w');

    uilabel(cg,'Text','Ancho de Banda Contratado (Mbps)','FontColor','k');
    app.BaseRate = uieditfield(cg,'numeric', ...
        'Value',10,'Limits',[1 Inf], ...
        'ValueChangedFcn',@refreshApp, ...
        'BackgroundColor',[0.20 0.40 0.70],'FontColor','w');

    uilabel(cg,'Text','Optimización por VLANs (%)','FontColor','k');
    app.Reduction = uislider(cg, ...
        'Limits',[0 40], ...
        'Value',20, ...
        'MajorTicks',[0 10 20 30 40], ...
        'ValueChangingFcn',@previewReduction, ...
        'ValueChangedFcn',@refreshApp, ...
        'FontColor',[0.20 0.40 0.70]);

    app.ReductionLabel = uilabel(cg,'Text','Optimización VLAN: 20%','FontColor','k');
    app.EnergyLabel = uilabel(cg,'Text','Tráfico Diario: -- MB','FontColor','k');
    app.CostLabel = uilabel(cg,'Text','Tráfico Mensual: -- GB','FontColor','k');
    app.SavingsLabel = uilabel(cg,'Text','Tasa Promedio: -- KB/s','FontColor','k');

    app.Status = uitextarea(cg, ...
        'Editable','off', ...
        'Value',{'Aplicación Solsoft lista.','Monitoreando jornada laboral de 10 horas.'}, ...
        'BackgroundColor',[0.20 0.40 0.70],'FontColor','w');

    app.ExportButton = uibutton(cg,'push', ...
        'Text','Exportar Resultados CSV', ...
        'ButtonPushedFcn',@exportResults, ...
        'BackgroundColor',[0.80 0.20 0.20],'FontColor','w');

    % 4. PANEL PRINCIPAL (Gráficas y Resultados)
    content = uipanel(root,'BorderType','none','BackgroundColor',[0.90 0.90 0.90]);
    content.Layout.Row = 1;
    content.Layout.Column = 2;
    mg = uigridlayout(content,[3 1]);
    mg.RowHeight = {38,'2x','1x'};
    mg.Padding = [18 14 18 18];
    mg.RowSpacing = 12;

    titleLabel = uilabel(mg,'Text','Solsoft S.A.S. — Análisis Integral de Ancho de Banda','FontColor','k');
    titleLabel.FontSize = 18;
    titleLabel.FontWeight = 'bold';

    app.PowerAxes = uiaxes(mg);
    title(app.PowerAxes,'Tráfico Actual vs. Tráfico Optimizado con VLANs','Color','k');
    xlabel(app.PowerAxes,'Tiempo (Horas de jornada)','Color','k');
    ylabel(app.PowerAxes,'Tasa de Consumo (KB/s)','Color','k');
    set(app.PowerAxes, 'Color', [0.97 0.98 0.99], 'XColor', 'k', 'YColor', 'k', 'GridColor', [0.3 0.3 0.3]);
    grid(app.PowerAxes,'on');

    lower = uigridlayout(mg,[1 2]);
    lower.ColumnWidth = {'1x','1x'};
    lower.Padding = [0 0 0 0];

    app.CumulativeAxes = uiaxes(lower);
    title(app.CumulativeAxes,'Volumen Acumulado (Megabytes)','Color','k');
    xlabel(app.CumulativeAxes,'Tiempo (Horas)','Color','k');
    ylabel(app.CumulativeAxes,'Tráfico Acumulado (MB)','Color','k');
    set(app.CumulativeAxes, 'Color', [0.97 0.98 0.99], 'XColor', 'k', 'YColor', 'k', 'GridColor', [0.3 0.3 0.3]);
    grid(app.CumulativeAxes,'on');

    app.ResultsTable = uitable(lower);
    app.ResultsTable.ColumnName = {'Indicador','Resultado'};
    app.ResultsTable.ColumnWidth = {190,'auto'};
    app.ResultsTable.BackgroundColor = [0.97 0.98 0.99; 0.87 0.88 0.89];

    refreshApp();

    % 5. FUNCIONES INTERNAS DE LA APLICACIÓN
    function loadData(~,~)
        [file,path] = uigetfile( ...
            {'*.csv;*.xlsx;*.xls','Archivos CSV/Excel (*.csv, *.xlsx, *.xls)'}, ...
            'Seleccione el archivo de consumo de Solsoft');
        if isequal(file,0), return; end
        try
            opts = detectImportOptions(fullfile(path,file),'Delimiter',';');
            loaded = readtable(fullfile(path,file),opts);
            app.Data = validateData(loaded);
            app.FileLabel.Text = file;
            refreshApp();
        catch ME
            uialert(app.Figure,ME.message,'Error al cargar archivo');
        end
    end

    function previewReduction(~,event)
        app.ReductionLabel.Text = sprintf('Optimización VLAN: %.0f%%',event.Value);
    end

    function refreshApp(~,~)
        try
            T = validateData(app.Data);
            result = calculateMetrics(T,app.Reduction.Value);
            app.Result = result;
            app.PreparedData = T;

            % Dibujar gráfica principal
            cla(app.PowerAxes);
            area(app.PowerAxes,T.tiempo_h,result.power, ...
                'FaceColor',[0.20 0.40 0.70], ...
                'FaceAlpha',0.25,'EdgeColor','none');
            hold(app.PowerAxes,'on');
            plot(app.PowerAxes,T.tiempo_h,result.power, ...
                'LineWidth',2.2,'Color',[0.20 0.40 0.70]);
            plot(app.PowerAxes,T.tiempo_h,result.optimized, ...
                '--','LineWidth',2.2,'Color',[0.80 0.20 0.20]);
            hold(app.PowerAxes,'off');
            
            % Leyenda con tu estilo de colores claros
            lgd = legend(app.PowerAxes,{'Área bajo r(t)','Tráfico Actual','Optimizado (VLANs)'}, ...
                'Location','northwest','TextColor','k');
            set(lgd, 'Color', [0.97 0.98 0.99], 'EdgeColor', [0.67 0.68 0.69]);

            % Dibujar gráfica acumulada (MB)
            cla(app.CumulativeAxes);
            plot(app.CumulativeAxes,T.tiempo_h,result.cumulative_mb, ...
                'LineWidth',2.2,'Color',[0.20 0.40 0.70]);

            app.ReductionLabel.Text = sprintf('Optimización VLAN: %.0f%%',app.Reduction.Value);
            app.EnergyLabel.Text = sprintf('Tráfico Diario: %.2f MB',result.tfc_mb);
            app.CostLabel.Text = sprintf('Tráfico Mensual: %.2f GB',result.mensual_gb);
            app.SavingsLabel.Text = sprintf('Tasa Promedio: %.2f KB/s',result.promedio_kbs);

            rows = {
                'Integral Definida / TFC (Diario)', sprintf('%.2f MB (%.2f GB)', result.tfc_mb, result.tfc_gb);
                'Sumas de Riemann (Diario)', sprintf('%.2f MB (%.2f GB)', result.riemann_mb, result.riemann_gb);
                'Estimación Mensual (22 días)', sprintf('%.2f GB/mes', result.mensual_gb);
                'Diferencia relativa', sprintf('%.4f %%', result.relativeError);
                'Hora crítica de tráfico', sprintf('Hora %.2f', result.peakHour);
                'Pico máximo de velocidad', sprintf('%.2f KB/s (%.3f Mbps)', result.peakPower, result.peakPower * 8 / 1000)
            };

            switch app.Method.Value
                case 'Teorema Fundamental (Trapecios)'
                    rows = rows([1 3 5 6],:);
                case 'Sumas de Riemann'
                    rows = rows([2 3 5 6],:);
            end
            app.ResultsTable.Data = rows;
            app.Status.Value = {
                'Análisis de Solsoft S.A.S. actualizado.';
                sprintf('El área bajo la curva estima %.2f MB/día (%.2f GB/mes).', result.tfc_mb, result.mensual_gb);
                sprintf('Segmentar en VLANs mitiga el pico de %.2f KB/s.', result.peakPower)
            };
        catch ME
            uialert(app.Figure,ME.message,'Error en el cálculo');
        end
    end

    function exportResults(~,~)
        if ~isfield(app,'Result'), return; end
        [file,path] = uiputfile('resultados_solsoft.csv','Guardar resultados');
        if isequal(file,0), return; end
        output = app.PreparedData;
        output.trafico_optimizado_kbs = app.Result.optimized;
        output.volumen_acumulado_mb = app.Result.cumulative_mb;
        writetable(output,fullfile(path,file));
        uialert(app.Figure,'Resultados de red exportados exitosamente.','Exportación');
    end
end

% ---------------------------------------------------------
% FUNCIONES AUXILIARES
% ---------------------------------------------------------

function T = createDemoData()
    tiempo_h = (0:10)';
    tasa_kbs = [15.0; 8.5; 11.0; 19.5; 31.0; 42.5; 48.0; 53.5; 47.0; 28.5; 15.0];
    T = table(tiempo_h, tasa_kbs);
end

function T = validateData(T)
    names = T.Properties.VariableNames;

    idxTiempo = find(contains(lower(names), 'tiempo') | contains(lower(names), 'hora') | contains(lower(names), 't'), 1);
    if isempty(idxTiempo), idxTiempo = 1; end

    idxTasa = find(contains(lower(names), 'tasa') | contains(lower(names), 'kbs') | contains(lower(names), 'mbs') | contains(lower(names), 'potencia'), 1);
    if isempty(idxTasa) || idxTasa == idxTiempo, idxTasa = 2; end

    tiempo_raw = T{:, idxTiempo};
    tasa_raw = T{:, idxTasa};

    if iscell(tiempo_raw) || isstring(tiempo_raw)
        tiempo_raw = str2double(strrep(string(tiempo_raw), ',', '.'));
    end
    if iscell(tasa_raw) || isstring(tasa_raw)
        tasa_raw = str2double(strrep(string(tasa_raw), ',', '.'));
    end

    T = table(double(tiempo_raw), double(tasa_raw), 'VariableNames', {'tiempo_h', 'tasa_kbs'});
    valid = isfinite(T.tiempo_h) & isfinite(T.tasa_kbs);
    T = T(valid,:);
    T = sortrows(T,'tiempo_h');
end

function result = calculateMetrics(T,reduction)
    x = T.tiempo_h;
    power = T.tasa_kbs; % Tasa en KB/s
    optimized = power * (1 - reduction/100);

    % 1. Teorema Fundamental del Cálculo / Trapecios (KB*h/s -> MB -> GB)
    area_kbs = trapz(x, power);
    tfc_mb = (area_kbs * 3600) / 1024;
    tfc_gb = tfc_mb / 1024;

    % 2. Sumas de Riemann (Punto Medio)
    n = max(2, numel(x)-1);
    dt = (max(x) - min(x)) / n;
    puntos_medios = (x(1:end-1) + x(2:end)) / 2;
    r_riemann = interp1(x, power, puntos_medios, 'linear');
    riemann_mb = (sum(r_riemann) * dt * 3600) / 1024;
    riemann_gb = riemann_mb / 1024;

    % Estimación Mensual (22 días hábiles)
    mensual_gb = tfc_gb * 22;

    % Promedio y acumulados
    t_total = max(x) - min(x);
    promedio_kbs = area_kbs / t_total;
    cumulative_mb = (cumtrapz(x, power) * 3600) / 1024;

    [peakPower, index] = max(power);

    result = struct( ...
        'power', power, ...
        'optimized', optimized, ...
        'tfc_mb', tfc_mb, ...
        'tfc_gb', tfc_gb, ...
        'riemann_mb', riemann_mb, ...
        'riemann_gb', riemann_gb, ...
        'mensual_gb', mensual_gb, ...
        'promedio_kbs', promedio_kbs, ...
        'relativeError', abs(riemann_mb - tfc_mb) / tfc_mb * 100, ...
        'peakHour', x(index), ...
        'peakPower', peakPower, ...
        'cumulative_mb', cumulative_mb);
end
const urlParams = new URLSearchParams(window.location.search);
let targetTabId = urlParams.get('tabId') ? parseInt(urlParams.get('tabId'), 10) : null;

async function getTargetTab() {
    if (targetTabId) {
        try {
            const tab = await chrome.tabs.get(targetTabId);
            if (tab) return tab;
        } catch (e) {
            console.warn("Não foi possível obter a aba pelo ID da URL, tentando fallback.", e);
        }
    }
    // Fallback: busca a aba ativa na janela que não seja a do popup
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: false });
    return tab;
}

document.getElementById('scanBtn').addEventListener('click', async () => {
    const tab = await getTargetTab();

    if (!tab) {
        document.getElementById('status').innerText = "Erro: Aba não encontrada.";
        return;
    }

    document.getElementById('status').innerText = "Escaneando...";

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: findTablesOnPage
    }, (results) => {
        if (chrome.runtime.lastError) {
            document.getElementById('status').innerText = "Erro ao escanear: " + chrome.runtime.lastError.message;
            return;
        }
        if (results && results[0]) {
            const tables = results[0].result;
            displayTables(tables, tab.id);
        } else {
            document.getElementById('status').innerText = "Nenhuma resposta recebida da página.";
        }
    });
});

function findTablesOnPage() {
    const tables = document.querySelectorAll('table');
    return Array.from(tables).map((t, index) => {
        const tableId = t.id || '';
        const tableClass = t.className || '';
        
        let name = '';
        const panel = t.closest('.x_panel, .card, .container, .box, section, .table-responsive');
        if (panel) {
            const h = panel.querySelector('h1, h2, h3, h4, h5, h6, .card-title, .box-title, .title, .x_title h2');
            if (h) {
                // Remove qualquer texto de sub-tags de forma limpa
                const clone = h.cloneNode(true);
                // remove tags pequenas de títulos se houver
                clone.querySelectorAll('small, i, span').forEach(el => el.remove());
                name = clone.textContent.trim().replace(/\s+/g, ' ');
            }
        }
        
        if (!name) {
            let previous = t.previousElementSibling;
            while (previous) {
                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(previous.tagName)) {
                    name = previous.textContent.trim();
                    break;
                }
                const h = previous.querySelector('h1, h2, h3, h4, h5, h6');
                if (h) {
                    name = h.textContent.trim();
                    break;
                }
                previous = previous.previousElementSibling;
            }
        }

        // Calcula a largura máxima da tabela de forma segura
        let maxCols = 0;
        if (t.rows) {
            for (let i = 0; i < Math.min(t.rows.length, 5); i++) {
                const cellCount = t.rows[i]?.cells?.length || 0;
                if (cellCount > maxCols) {
                    maxCols = cellCount;
                }
            }
        }

        return {
            id: index,
            tableId: tableId,
            name: name ? name.substring(0, 50) : '',
            rows: t.rows ? t.rows.length : 0,
            cols: maxCols
        };
    });
}

function displayTables(tables, tabId) {
    const list = document.getElementById('tableList');
    const status = document.getElementById('status');
    list.innerHTML = '';

    if (tables.length === 0) {
        status.innerText = "Nenhuma tabela encontrada.";
        return;
    }

    status.innerText = `${tables.length} tabela(s) encontrada(s):`;

    tables.forEach(table => {
        const li = document.createElement('li');
        li.className = 'table-item';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'table-info-container';
        infoContainer.style.display = 'flex';
        infoContainer.style.flexDirection = 'column';
        infoContainer.style.flex = '1';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'table-title';
        titleSpan.style.fontWeight = 'bold';
        
        const displayName = table.name ? table.name : `Tabela #${table.id + 1}`;
        titleSpan.innerText = displayName;

        const metaSpan = document.createElement('span');
        metaSpan.className = 'table-meta';
        metaSpan.style.fontSize = '12px';
        metaSpan.style.color = '#666';
        
        const details = [];
        if (table.tableId) {
            details.push(`ID: ${table.tableId}`);
        }
        details.push(`${table.rows} Linhas`);
        details.push(`${table.cols} Colunas`);
        metaSpan.innerText = details.join(' | ');

        infoContainer.appendChild(titleSpan);
        infoContainer.appendChild(metaSpan);

        const btn = document.createElement('button');
        btn.innerText = 'Baixar XLSX';
        btn.style.marginLeft = '10px';

        btn.addEventListener('click', () => {
            exportTable(tabId, table.id, displayName);
        });

        li.appendChild(infoContainer);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

async function exportTable(tabId, tableIndex, tableName) {
    document.getElementById('status').innerText = "Exportando tabela...";
    
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (idx) => {
            const table = document.querySelectorAll('table')[idx];
            if (!table) return null;
            
            const data = [];
            for (let row of table.rows) {
                const rowData = [];
                for (let cell of row.cells) {
                    let cellText = cell.innerText ? cell.innerText.trim() : '';
                    
                    // Se o innerText for vazio, tenta capturar valores de inputs/selects
                    if (!cellText) {
                        const input = cell.querySelector('input, select');
                        if (input) {
                            cellText = input.value || '';
                        }
                    }
                    
                    // Se ainda estiver vazio, tenta ler attributes úteis como title ou alt de imagens
                    if (!cellText) {
                        const img = cell.querySelector('img');
                        if (img && (img.alt || img.title)) {
                            cellText = img.alt || img.title;
                        } else {
                            const iconOrLink = cell.querySelector('[title], [data-original-title]');
                            if (iconOrLink) {
                                cellText = iconOrLink.getAttribute('data-original-title') || iconOrLink.title || '';
                            }
                        }
                    }
                    
                    // Limpa quebras de linhas redundantes e espaços extras para ficar limpo no Excel
                    cellText = cellText.replace(/\s+/g, ' ').trim();
                    rowData.push(cellText);
                }
                data.push(rowData);
            }
            return data;
        },
        args: [tableIndex]
    }, (results) => {
        if (chrome.runtime.lastError) {
            document.getElementById('status').innerText = "Erro ao exportar: " + chrome.runtime.lastError.message;
            return;
        }
        
        if (results && results[0] && results[0].result) {
            const data = results[0].result;
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Planilha1");

            // Normaliza o nome do arquivo para evitar caracteres especiais
            const sanitizedName = tableName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // remove acentos
                .replace(/[^a-z0-9]/gi, '_') // remove caracteres especiais
                .replace(/_+/g, '_') // remove underlines duplicados
                .replace(/^_+|_+$/g, ''); // remove underlines no início e fim
                
            const fileName = sanitizedName ? `tabela_${sanitizedName}.xlsx` : `tabela_extraida_${tableIndex + 1}.xlsx`;

            try {
                // Gera o arquivo e inicia o download usando SheetJS
                XLSX.writeFile(workbook, fileName);
                document.getElementById('status').innerText = `Exportado: ${fileName}`;
            } catch (err) {
                document.getElementById('status').innerText = "Erro ao gerar arquivo XLSX.";
                console.error(err);
            }
        } else {
            document.getElementById('status').innerText = "Nenhuma dados extraídos da tabela.";
        }
    });
}

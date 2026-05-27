document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: false });

    if (!tab) {
        document.getElementById('status').innerText = "Erro: Aba não encontrada.";
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: findTablesOnPage
    }, (results) => {
        if (results && results[0]) {
            const tables = results[0].result;
            displayTables(tables, tab.id);
        }
    });
});

function findTablesOnPage() {
    const tables = document.querySelectorAll('table');
    return Array.from(tables).map((t, index) => ({
        id: index,
        rows: t.rows.length,
        cols: t.rows[0]?.cells.length || 0
    }));
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

        const info = document.createElement('span');
        info.innerText = `Tabela #${table.id + 1} (${table.rows}L x ${table.cols}C)`;

        const btn = document.createElement('button');
        btn.innerText = 'Baixar XLSX';

        // CORREÇÃO: Usando addEventListener em vez de onclick inline
        btn.addEventListener('click', () => {
            exportTable(tabId, table.id);
        });

        li.appendChild(info);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

async function exportTable(tabId, tableIndex) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (idx) => {
            const table = document.querySelectorAll('table')[idx];
            const data = [];
            for (let row of table.rows) {
                const rowData = [];
                for (let cell of row.cells) {
                    rowData.push(cell.innerText.trim());
                }
                data.push(rowData);
            }
            return data;
        },
        args: [tableIndex]
    }, (results) => {
        if (results && results[0].result) {
            const data = results[0].result;
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Planilha1");

            // Gera o arquivo e inicia o download
            XLSX.writeFile(workbook, `tabela_extraida_${tableIndex + 1}.xlsx`);
        }
    });
}

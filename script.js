const sheetID = '1R93u9tJAnoICa2eE6Kx9Wd7toKLlxWY47zj-e9O3xMw';
const scrollContent = document.getElementById('scroll-content');
const headerRow = document.getElementById('table-headers');

function updateClock() {
  const now = new Date();
  document.getElementById('datetime').textContent = now.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function loadSchedule() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&cacheBuster=${Date.now()}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const rows = json.table.rows;
    const cols = json.table.cols;

    // Build headers
    headerRow.innerHTML = cols.map(col => `<th>${col.label}</th>`).join('');

    // Helper to build one row
    function createFormattedRow(rowData) {
      const tr = document.createElement('tr');
      rowData.c.forEach(cell => {
        const td = document.createElement('td');
        let value = cell?.v ?? '';

        // Format raw date objects or 'Date(yyyy,mm,dd)' strings to MM/DD
        if (value instanceof Date) {
          const mm = String(value.getMonth() + 1).padStart(2, '0');
          const dd = String(value.getDate()).padStart(2, '0');
          value = `${mm}/${dd}`;
        } else if (typeof value === 'string' && /^Date\(\d+,\d+,\d+\)$/.test(value)) {
          const [, y, m, d] = value.match(/Date\((\d+),(\d+),(\d+)\)/).map(Number);
          const mm = String(m + 1).padStart(2, '0');
          const dd = String(d).padStart(2, '0');
          value = `${mm}/${dd}`;
        }

        td.textContent = value;
        tr.appendChild(td);
      });
      return tr;
    }

    scrollContent.innerHTML = '';
    rows.forEach(row => scrollContent.appendChild(createFormattedRow(row)));

  } catch (err) {
    scrollContent.innerHTML = '<tr><td colspan="100%">⚠️ Failed to load schedule.</td></tr>';
    console.error('Error loading schedule:', err);
  }
}

loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000);
setInterval(updateClock, 1000);

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_FILE = path.join(__dirname, '../src/data/plants.json');
const EXCEL_FILE = path.join(__dirname, '../data/plants.xlsx');

function jsonToExcel() {
    // Read plants.json
    const plants = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Transform to flat structure for Excel
    const rows = plants.map(plant => ({
        id: plant.id,
        title: plant.title,
        description: plant.description,
        colors: (plant.colors || []).join(', '),
        months: (plant.months || []).join(', '),
        scientificName: plant.meta?.scientificName || '',
        family: plant.meta?.family || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    ws['!cols'] = [
        { wch: 20 },  // id
        { wch: 25 },  // title
        { wch: 50 },  // description
        { wch: 30 },  // colors
        { wch: 30 },  // months
        { wch: 30 },  // scientificName
        { wch: 20 }   // family
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Plants');

    // Ensure data directory exists
    const dataDir = path.dirname(EXCEL_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write Excel file
    XLSX.writeFile(wb, EXCEL_FILE);
    console.log(`✓ Exported ${plants.length} plants to ${EXCEL_FILE}`);
}

jsonToExcel();

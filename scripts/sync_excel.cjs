const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const DATA_FILE = path.join(__dirname, '../src/data/plants.json');
const EXCEL_FILE = path.join(__dirname, '../data/plants.xlsx');

function syncFromExcel() {
    // Check if Excel file exists
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error(`Error: ${EXCEL_FILE} not found. Run 'npm run export' first to create it.`);
        process.exit(1);
    }

    // Read Excel file
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Reading ${excelData.length} entries from Excel...`);

    // Scan images directory
    const files = fs.readdirSync(IMAGES_DIR);
    const imageGroups = new Map();

    files.forEach(file => {
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return;
        const id = file.split('_')[0].toLowerCase();
        if (!imageGroups.has(id)) {
            imageGroups.set(id, []);
        }
        imageGroups.get(id).push('/kametora_kusabana_sanpo/images/' + file);
    });

    // Transform Excel data to plants.json format
    const plants = excelData.map(row => {
        const id = row.id || '';
        const images = imageGroups.get(id) || [];
        images.sort();

        return {
            id: id,
            slug: id,
            title: row.title || '',
            description: row.description || '（説明文が未入力です）',
            images: images,
            colors: row.colors ? row.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
            months: row.months ? row.months.split(',').map(m => m.trim()).filter(Boolean) : [],
            meta: {
                scientificName: row.scientificName || '',
                family: row.family || ''
            }
        };
    });

    // Sort by ID
    plants.sort((a, b) => a.id.localeCompare(b.id));

    // Write to plants.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(plants, null, 2), 'utf8');
    console.log(`✓ Synced ${plants.length} plants to ${DATA_FILE}`);
    console.log(`✓ Found images for ${[...imageGroups.keys()].length} plant IDs`);
}

syncFromExcel();

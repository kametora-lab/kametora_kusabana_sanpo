const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '../img_dl/images_new.csv');
const IMAGES_DIR = path.join(__dirname, '../public/images');
const DATA_FILE = path.join(__dirname, '../src/data/plants.json');

function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const records = [];
    let currentRecord = [];
    let inQuotes = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Count quotes in the line
        const quoteCount = (line.match(/"/g) || []).length;

        // If we're in quotes or the quote count is odd, continue accumulating
        if (inQuotes || quoteCount % 2 !== 0) {
            currentRecord.push(line);
            inQuotes = !inQuotes;
        } else {
            // Complete record
            currentRecord.push(line);
            const fullLine = currentRecord.join('\n');

            if (fullLine.trim()) {
                records.push(fullLine);
            }

            currentRecord = [];
        }
    }

    // Parse header
    const headerLine = records[0];
    const headers = parseCSVLine(headerLine);

    // Parse data rows
    const data = [];
    for (let i = 1; i < records.length; i++) {
        const values = parseCSVLine(records[i]);
        const record = {};
        headers.forEach((header, index) => {
            record[header.trim()] = (values[index] || '').trim();
        });
        data.push(record);
    }

    return data;
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);

    return values.map(v => v.replace(/^"|"$/g, '').trim());
}

function syncFromCSV() {
    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE)) {
        console.error(`Error: ${CSV_FILE} not found.`);
        process.exit(1);
    }

    // Read and parse CSV file
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const records = parseCSV(csvContent);

    console.log(`Reading ${records.length} entries from CSV...`);

    // Scan images directory to get actual image files
    const files = fs.readdirSync(IMAGES_DIR);
    const imageGroups = new Map();

    files.forEach(file => {
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return;
        // Extract ID from filename (e.g., "0001_00.jpg" -> "0001")
        const match = file.match(/^(\d+)_/);
        if (match) {
            const id = match[1];
            if (!imageGroups.has(id)) {
                imageGroups.set(id, []);
            }
            imageGroups.get(id).push('/images/' + file);
        }
    });

    // Transform CSV data to plants.json format
    const plants = records.map(row => {
        const id = row.id.padStart(4, '0'); // Ensure 4-digit ID
        const images = imageGroups.get(id) || [];
        images.sort(); // Sort images by filename

        // Parse colors (comma-separated)
        let colors = [];
        if (row.colors && row.colors.trim()) {
            colors = row.colors.split(',').map(c => c.trim()).filter(Boolean);
        }

        // Parse months (comma-separated)
        let months = [];
        if (row.months && row.months.trim()) {
            months = row.months.split(',').map(m => m.trim()).filter(Boolean);
        }

        return {
            id: id,
            slug: id,
            title: row.title || '',
            description: row.description || '（説明文が未入力です）',
            images: images,
            colors: colors,
            months: months,
            meta: {
                scientificName: '',
                family: ''
            }
        };
    });

    // Sort by ID
    plants.sort((a, b) => a.id.localeCompare(b.id));

    // Write to plants.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(plants, null, 2), 'utf8');
    console.log(`✓ Synced ${plants.length} plants to ${DATA_FILE}`);
    console.log(`✓ Found images for ${[...imageGroups.keys()].length} plant IDs`);

    // Report plants without images
    const plantsWithoutImages = plants.filter(p => p.images.length === 0);
    if (plantsWithoutImages.length > 0) {
        console.log(`\n⚠ Warning: ${plantsWithoutImages.length} plants have no images:`);
        plantsWithoutImages.slice(0, 10).forEach(p => {
            console.log(`  - ${p.id}: ${p.title}`);
        });
        if (plantsWithoutImages.length > 10) {
            console.log(`  ... and ${plantsWithoutImages.length - 10} more`);
        }
    }
}

syncFromCSV();

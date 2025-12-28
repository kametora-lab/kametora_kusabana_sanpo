const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const TSV_FILE = path.join(__dirname, '../img_dl/images_new.tsv');
const IMAGES_DIR = path.join(__dirname, '../public/images');
const DATA_FILE = path.join(__dirname, '../src/data/plants.json');

function parseTSV(tsvContent) {
    const lines = tsvContent.split('\n').filter(line => line.trim());

    // Parse header
    const headers = lines[0].split('\t').map(h => h.trim());

    // Parse data rows
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const record = {};
        headers.forEach((header, index) => {
            record[header] = (values[index] || '').trim();
        });
        records.push(record);
    }

    return records;
}

function syncFromTSV() {
    // Check if TSV file exists
    if (!fs.existsSync(TSV_FILE)) {
        console.error(`Error: ${TSV_FILE} not found.`);
        process.exit(1);
    }

    // Try reading with different encodings
    let tsvContent;
    let encoding = 'utf8';

    try {
        // First try UTF-8
        tsvContent = fs.readFileSync(TSV_FILE, 'utf8');
        // Check if there are encoding issues (question marks or replacement characters)
        if (tsvContent.includes('�') || tsvContent.includes('??')) {
            throw new Error('UTF-8 encoding failed');
        }
    } catch (e) {
        try {
            // Try Shift-JIS (common for Japanese Windows)
            const buffer = fs.readFileSync(TSV_FILE);
            tsvContent = iconv.decode(buffer, 'shift_jis');
            encoding = 'shift_jis';
        } catch (e2) {
            console.error('Error reading TSV file with any encoding');
            process.exit(1);
        }
    }

    console.log(`Reading TSV file with ${encoding} encoding...`);
    const records = parseTSV(tsvContent);

    console.log(`Reading ${records.length} entries from TSV...`);

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
            imageGroups.get(id).push('/kametora_kusabana_sanpo/images/' + file);
        }
    });

    // Transform TSV data to plants.json format
    const plants = records
        .filter(row => {
            // Only process rows where ID is a number
            return row.id && /^\d+$/.test(row.id.trim());
        })
        .map(row => {
            const id = row.id.padStart(4, '0'); // Ensure 4-digit ID
            const images = imageGroups.get(id) || [];
            images.sort(); // Sort images by filename

            // Parse colors (comma-separated)
            let colors = [];
            if (row.colors && row.colors.trim()) {
                colors = row.colors
                    .replace(/"/g, '') // Remove double quotes
                    .split(',')
                    .map(c => c.trim())
                    .filter(Boolean);
            }

            // Parse months (comma-separated)
            let months = [];
            if (row.months && row.months.trim()) {
                months = row.months
                    .replace(/"/g, '') // Remove double quotes
                    .split(',')
                    .map(m => m.trim())
                    .filter(Boolean);
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

    // Report success
    const plantsWithImages = plants.filter(p => p.images.length > 0);
    console.log(`\n✅ Successfully synced ${plantsWithImages.length} plants with images!`);
}

syncFromTSV();

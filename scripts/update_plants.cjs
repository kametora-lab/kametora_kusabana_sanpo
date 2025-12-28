const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const DATA_FILE = path.join(__dirname, '../src/data/plants.json');

// Romaji to Katakana map (comprehensive)
const romajiMap = {
    'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
    'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
    'sa': 'サ', 'shi': 'シ', 'si': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
    'ta': 'タ', 'chi': 'チ', 'ti': 'チ', 'tsu': 'ツ', 'tu': 'ツ', 'te': 'テ', 'to': 'ト',
    'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
    'ha': 'ハ', 'hi': 'ヒ', 'fu': 'フ', 'hu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
    'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
    'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',
    'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
    'wa': 'ワ', 'wo': 'ヲ', 'nn': 'ン', 'n': 'ン',
    'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',
    'za': 'ザ', 'ji': 'ジ', 'zi': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',
    'da': 'ダ', 'di': 'ヂ', 'du': 'ヅ', 'de': 'デ', 'do': 'ド',
    'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',
    'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',
    'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ',
    'sha': 'シャ', 'shu': 'シュ', 'sho': 'ショ', 'sya': 'シャ', 'syu': 'シュ', 'syo': 'ショ',
    'cha': 'チャ', 'chu': 'チュ', 'cho': 'チョ', 'tya': 'チャ', 'tyu': 'チュ', 'tyo': 'チョ',
    'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ',
    'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ',
    'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ',
    'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ',
    'gya': 'ギャ', 'gyu': 'ギュ', 'gyo': 'ギョ',
    'ja': 'ジャ', 'ju': 'ジュ', 'jo': 'ジョ', 'jya': 'ジャ', 'jyu': 'ジュ', 'jyo': 'ジョ',
    'zya': 'ジャ', 'zyu': 'ジュ', 'zyo': 'ジョ',
    'bya': 'ビャ', 'byu': 'ビュ', 'byo': 'ビョ',
    'pya': 'ピャ', 'pyu': 'ピュ', 'pyo': 'ピョ',
    'la': 'ラ', 'li': 'リ', 'lu': 'ル', 'le': 'レ', 'lo': 'ロ',
    'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
    '-': 'ー'
};

function toKatakana(romaji) {
    let result = '';
    let str = romaji.toLowerCase()
        .replace(/[0-9]/g, '') // Remove numbers
        .replace(/_/g, '');    // Remove underscores

    let i = 0;
    while (i < str.length) {
        // Check 3 chars (e.g., tsu)
        if (i + 3 <= str.length) {
            const sub = str.substring(i, i + 3);
            if (romajiMap[sub]) {
                result += romajiMap[sub];
                i += 3; continue;
            }
        }
        // Check 2 chars (e.g., ka, sha)
        if (i + 2 <= str.length) {
            const sub = str.substring(i, i + 2);
            if (romajiMap[sub]) {
                result += romajiMap[sub];
                i += 2; continue;
            }
            if (sub[0] === sub[1] && sub[0] !== 'n') {
                result += 'ッ';
                i++; continue;
            }
        }
        // Check 1 char
        const sub = str[i];
        if (romajiMap[sub]) {
            result += romajiMap[sub];
            i++; continue;
        }

        // Single consonant handling (fallback for trailing c, s, etc.)
        const mappings = { 'c': 'ク', 'k': 'ク', 's': 'ス', 't': 'ト', 'm': 'ム', 'r': 'ル', 'l': 'ル', 'g': 'グ', 'f': 'フ', 'p': 'プ', 'b': 'ブ', 'd': 'ド' };
        if (mappings[sub]) {
            result += mappings[sub];
        } else {
            result += sub;
        }
        i++;
    }
    return result;
}

function updatePlants() {
    // 1. Read existing data
    let plants = [];
    if (fs.existsSync(DATA_FILE)) {
        plants = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    // Create a map for quick lookup
    const plantMap = new Map();
    plants.forEach(p => plantMap.set(p.id, p));

    // 2. Scan images
    const files = fs.readdirSync(IMAGES_DIR);
    const imageGroups = new Map();

    files.forEach(file => {
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return; // Ignore non-images (psd)

        // Extract ID: everything before the first underscore, or whole name if no underscore
        // But handle "ichiran_kiiro" -> maybe "ichiran"? 
        // Logic: if it starts with "ichiran", ignore it? User said "upload images", maybe these are assets.
        // Actually, let's treat "ichiran" as a plant for now, user can delete.
        // Better regex: take first alpha string part.

        let id = file.split('_')[0].toLowerCase();

        // Exclude specific system/asset files if any
        if (id === 'sozai') return; // "sozai_umi" -> material

        if (!imageGroups.has(id)) {
            imageGroups.set(id, []);
        }
        imageGroups.get(id).push('/kametora_kusabana_sanpo/images/' + file);
    });

    // 3. Update/Create entries
    imageGroups.forEach((images, id) => {
        images.sort(); // Sort image list

        if (plantMap.has(id)) {
            // Update existing
            const p = plantMap.get(id);
            // Union of existing images and new found images
            const existingImgs = new Set(p.images);
            images.forEach(img => existingImgs.add(img));
            p.images = Array.from(existingImgs).sort();
        } else {
            // Create new
            const title = toKatakana(id);
            const plant = {
                id: id,
                slug: id,
                title: title,
                description: "（説明文が未入力です）", // Description pending
                images: images,
                colors: ["yellow"], // Default to yellow as many previous ones were, or 'other'. Safe default?
                months: [],
                meta: {
                    scientificName: ""
                }
            };
            plants.push(plant);
        }
    });

    // Sort plants by ID
    plants.sort((a, b) => a.id.localeCompare(b.id));

    // 4. Write back
    fs.writeFileSync(DATA_FILE, JSON.stringify(plants, null, 2), 'utf8');
    console.log(`Updated plants.json. Total entries: ${plants.length}`);
}

updatePlants();

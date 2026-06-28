const fs = require('fs');
const path = require('path');

// パス設定
const PROJECT_ROOT = 'C:/Gravity/amamikusabana_2';
const REGIST_DIR = path.join(PROJECT_ROOT, 'kusabana_touroku');
const JSON_PATH = path.join(PROJECT_ROOT, 'src/data/plants.json');
const IMAGE_DEST_DIR = path.join(PROJECT_ROOT, 'public/images');

// ログ出力用
function log(msg) {
  console.log(`[register_plant] ${msg}`);
}

function logError(msg) {
  console.error(`[register_plant] ERROR: ${msg}`);
}

// メイン処理
function main() {
  const plantName = process.argv[2];
  if (!plantName) {
    logError('草花名（和名）を指定してくださいニダ。使用例: node register_plant.cjs アダン');
    process.exit(1);
  }

  log(`処理を開始するニダ: 対象草花名「${plantName}」`);

  // 1. JSONファイルを読み込む
  if (!fs.existsSync(JSON_PATH)) {
    logError(`JSONファイルが見つかりませんニダ: ${JSON_PATH}`);
    process.exit(1);
  }

  let plants = [];
  try {
    const rawData = fs.readFileSync(JSON_PATH, 'utf8');
    plants = JSON.parse(rawData);
  } catch (err) {
    logError(`JSONの読み込みまたはパースに失敗しましたニダ: ${err.message}`);
    process.exit(1);
  }

  // タイトルが一致する既存データを検索
  const existingPlantIndex = plants.findIndex(p => p.title === plantName);
  const isNew = existingPlantIndex === -1;
  let targetPlant = null;
  let plantId = '';

  if (isNew) {
    log(`「${plantName}」はJSONに未登録の新規草花ニダ。新規登録処理を進めるニダ。`);

    // 2. Markdownファイルの探索と判定
    if (!fs.existsSync(REGIST_DIR)) {
      logError(`草花登録フォルダが見つかりませんニダ: ${REGIST_DIR}`);
      process.exit(1);
    }

    const files = fs.readdirSync(REGIST_DIR);
    
    const exactMdFile = `${plantName}.md`;
    let targetMdFile = '';

    // 完全に一致する md ファイルが既にあるかチェック
    if (files.includes(exactMdFile)) {
      log(`登録フォルダにすでに「${exactMdFile}」が存在するニダ。これを使用するニダ。`);
      targetMdFile = exactMdFile;
    } else {
      // 草花名を含む md ファイルを探す
      targetMdFile = files.find(file => file.toLowerCase().includes(plantName.toLowerCase()) && file.endsWith('.md'));
      if (!targetMdFile) {
        const allMdFiles = files.filter(file => file.endsWith('.md'));
        if (allMdFiles.length === 1) {
          targetMdFile = allMdFiles[0];
          log(`草花名を含むmdが見つからないため、唯一のmdファイル「${targetMdFile}」を対象にするニダ。`);
        } else {
          logError(`「${plantName}」を含むMarkdownファイル、または唯一のMarkdownファイルが「${REGIST_DIR}」内に見つかりませんニダ。`);
          process.exit(1);
        }
      }
    }

    const oldPath = path.join(REGIST_DIR, targetMdFile);
    const newPath = path.join(REGIST_DIR, exactMdFile);

    // リネーム実行 (名前が異なる場合のみ)
    if (oldPath !== newPath) {
      try {
        fs.renameSync(oldPath, newPath);
        log(`Markdownファイルをリネームしたニダ: ${targetMdFile} -> ${exactMdFile}`);
      } catch (err) {
        logError(`Markdownファイルのリネームに失敗しましたニダ: ${err.message}`);
        process.exit(1);
      }
    }

    // Markdownファイルを読み込んでパース
    let mdContent = '';
    try {
      mdContent = fs.readFileSync(newPath, 'utf8');
    } catch (err) {
      logError(`Markdownファイルの読み込みに失敗しましたニダ: ${err.message}`);
      process.exit(1);
    }

    const parsedInfo = parseMarkdown(mdContent);

    // Markdownファイルの C:\Gravity\KUSABANA_SEIRI\motomemo_md への移動処理
    const MD_DEST_DIR = 'C:/Gravity/KUSABANA_SEIRI/motomemo_md';
    if (!fs.existsSync(MD_DEST_DIR)) {
      fs.mkdirSync(MD_DEST_DIR, { recursive: true });
    }
    const mdDestPath = path.join(MD_DEST_DIR, exactMdFile);
    if (fs.existsSync(mdDestPath)) {
      logError(`mdがすでにあったのでmotomemo_mdには追加できませんニダ: ${exactMdFile}`);
    } else {
      try {
        fs.renameSync(newPath, mdDestPath);
        log(`Markdownファイルを移動したニダ: ${exactMdFile} -> C:/Gravity/KUSABANA_SEIRI/motomemo_md/${exactMdFile}`);
      } catch (err) {
        logError(`Markdownファイルの移動に失敗しましたニダ: ${err.message}`);
        process.exit(1);
      }
    }

    // 新規IDを採番する（最大ID + 1）
    let maxId = 0;
    plants.forEach(p => {
      const idNum = parseInt(p.id, 10);
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    });
    plantId = String(maxId + 1).padStart(4, '0');
    log(`新規IDを採番したニダ: ${plantId}`);

    targetPlant = {
      id: plantId,
      slug: plantId,
      title: plantName,
      description: parsedInfo.description,
      images: [],
      colors: [],
      months: [],
      meta: {
        scientificName: parsedInfo.scientificName,
        family: parsedInfo.family
      }
    };
  } else {
    targetPlant = plants[existingPlantIndex];
    plantId = targetPlant.id;
    log(`「${plantName}」は既にJSONに登録されているニダ（ID: ${plantId}）。画像追加処理を進めるニダ。`);
  }

  // 3. 画像ファイルの処理
  let filesInRegist = fs.readdirSync(REGIST_DIR);
  // 草花名を含む jpg または jpeg ファイルを探す
  let imageFiles = filesInRegist.filter(file => {
    const lower = file.toLowerCase();
    return lower.includes(plantName.toLowerCase()) && (lower.endsWith('.jpg') || lower.endsWith('.jpeg'));
  }).sort();

  // 見つからない場合、登録フォルダ内にあるすべての jpg/jpeg ファイルを対象にし、一時リネームする
  if (imageFiles.length === 0) {
    const allJpgFiles = filesInRegist.filter(file => {
      const lower = file.toLowerCase();
      return lower.endsWith('.jpg') || lower.endsWith('.jpeg');
    }).sort();

    if (allJpgFiles.length > 0) {
      log(`草花名を含む画像が見つからないため、登録フォルダ内の全画像（${allJpgFiles.length}枚）を一時リネームして処理対象にするニダ。`);
      allJpgFiles.forEach((file, idx) => {
        const ext = path.extname(file);
        const tempName = `${plantName}_temp_${idx}${ext}`;
        try {
          fs.renameSync(path.join(REGIST_DIR, file), path.join(REGIST_DIR, tempName));
          imageFiles.push(tempName);
        } catch (renameErr) {
          logError(`画像の事前一時リネームに失敗しましたニダ: ${renameErr.message}`);
        }
      });
      imageFiles.sort();
    }
  }

  if (imageFiles.length === 0) {
    log(`「${plantName}」を含む画像ファイル（jpg/jpeg）は見つからなかったニダ。画像処理はスキップするニダ。`);
  } else {
    log(`${imageFiles.length}枚の画像ファイルを検出したニダ。処理中ニダ。`);

    // 画像連番の開始番号を決定
    let currentSeq = 0;
    if (!isNew && targetPlant.images && targetPlant.images.length > 0) {
      // 既存の画像名（例: 0001_02.jpg）から最大連番を取得
      targetPlant.images.forEach(img => {
        const match = img.src.match(/_(\d{2})\.(?:jpg|jpeg)$/i);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq >= currentSeq) {
            currentSeq = seq + 1; // 次の番号から
          }
        }
      });
    }

    if (!fs.existsSync(IMAGE_DEST_DIR)) {
      fs.mkdirSync(IMAGE_DEST_DIR, { recursive: true });
    }

    imageFiles.forEach(imgFile => {
      const seqStr = String(currentSeq).padStart(2, '0');
      const newImageName = `${plantId}_${seqStr}.jpg`;
      const destPath = path.join(IMAGE_DEST_DIR, newImageName);
      const srcPath = path.join(REGIST_DIR, imgFile);

      // 移動先の重複チェック
      if (fs.existsSync(destPath)) {
        logError(`${newImageName}は既存しています。調べてから自分でimagesフォルダに移動してくださいニダ。`);
        // この画像の処理はスキップする
        return;
      }

      // 移動・リネーム
      try {
        fs.renameSync(srcPath, destPath);
        log(`画像をリネーム・移動したニダ: ${imgFile} -> public/images/${newImageName}`);

        // JSONデータに追加
        const newImageObj = {
          src: `/kametora_kusabana_sanpo/images/${newImageName}`,
          memo: "",
          alt: plantName
        };
        targetPlant.images.push(newImageObj);
        currentSeq++;
      } catch (err) {
        logError(`画像の移動に失敗しましたニダ (${imgFile}): ${err.message}`);
      }
    });
  }

  // 4. JSONファイルのバックアップと書き込み
  // バックアップファイル名: plants_YYYYMMDDHHmmss.json
  const now = new Date();
  const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  
  const backupPath = path.join(path.dirname(JSON_PATH), `plants_${timestamp}.json`);
  
  try {
    fs.copyFileSync(JSON_PATH, backupPath);
    log(`JSONのバックアップを作成したニダ: ${path.basename(backupPath)}`);
  } catch (err) {
    logError(`JSONのバックアップ作成に失敗しましたニダ: ${err.message}`);
    process.exit(1);
  }

  // JSONデータの更新
  if (isNew) {
    plants.push(targetPlant);
  } else {
    plants[existingPlantIndex] = targetPlant;
  }

  // JSONファイルの書き込み
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(plants, null, 2), 'utf8');
    log(`plants.json を正常に更新したニダ！`);
  } catch (err) {
    logError(`JSONファイルの書き込みに失敗しましたニダ: ${err.message}`);
    process.exit(1);
  }

  log(`草花「${plantName}」の登録処理が完了したニダ！`);
}

// Markdownのパーサー
function parseMarkdown(content) {
  // 学名、分類・科名の抽出
  let scientificName = '';
  let family = '';

  const lines = content.split(/\r?\n/);
  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('学名:') || trimmed.startsWith('学名：')) {
      scientificName = trimmed.replace(/^学名[:：]\s*/, '').replace(/\*/g, '').trim();
    }
    if (trimmed.startsWith('分類・科名:') || trimmed.startsWith('分類・科名：')) {
      family = trimmed.replace(/^分類・科名[:：]\s*/, '').trim();
    } else if (trimmed.startsWith('科名:') || trimmed.startsWith('科名：')) {
      family = trimmed.replace(/^科名[:：]\s*/, '').trim();
    }
  }

  // セクションの切り出し用ヘルパー
  const getSectionText = (keywords) => {
    let collecting = false;
    let resultLines = [];
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // 見出し行の判定
      if (trimmed.startsWith('#')) {
        if (collecting) {
          break; // 次のセクションに移ったら終了
        }
        const hasKeyword = keywords.some(kw => trimmed.includes(kw));
        if (hasKeyword) {
          collecting = true;
          continue;
        }
      }
      
      // コロン終わりの行（見出しの代わり）
      if (!trimmed.startsWith('#') && (trimmed.endsWith(':') || trimmed.endsWith('：'))) {
        if (collecting) {
          const isSelf = keywords.some(kw => trimmed.includes(kw));
          if (!isSelf) {
            break;
          }
        } else {
          const hasKeyword = keywords.some(kw => trimmed.includes(kw));
          if (hasKeyword) {
            collecting = true;
            continue;
          }
        }
      }
      
      if (collecting) {
        resultLines.push(line);
      }
    }
    
    return resultLines.join('\n').trim();
  };

  const metaDesc = getSectionText(['メタディスクリプション']);
  const basicInfo = getSectionText(['基本情報', '草花の基本情報まとめ']);
  const morphology = getSectionText(['形態的特徴']);
  const amamiInfo = getSectionText(['奄美特有情報']);

  const descParts = [metaDesc, basicInfo, morphology, amamiInfo].filter(p => p !== '');
  const description = descParts.length > 0 ? descParts.join('\n\n') : '（説明文が未入力です）';

  return {
    scientificName,
    family,
    description
  };
}

main();

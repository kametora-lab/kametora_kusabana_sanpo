import * as pdfjsLib from './vendor/pdfjs/pdf.mjs';

const pdfName = '奄美の春を、草花とゆっくり歩く — 完全版電子書籍（全32ページ）.pdf';
const mobileQuery = window.matchMedia('(max-width: 760px)');
const statusEl = document.getElementById('pageStatus');
const messageEl = document.getElementById('readerMessage');
const bookSpread = document.getElementById('bookSpread');
const bookViewport = document.getElementById('bookViewport');
const flipLeaf = document.getElementById('flipLeaf');
const flipFront = document.getElementById('leafFrontCanvas');
const flipBack = document.getElementById('leafBackCanvas');
const leftCanvas = document.getElementById('leftCanvas');
const rightCanvas = document.getElementById('rightCanvas');
const previousButton = document.getElementById('previousPage');
const nextButton = document.getElementById('nextPage');
const zoomLabel = document.getElementById('zoomReset');

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;

let pdf = null;
let groups = [];
let spreadIndex = 0;
let mobilePage = 0;
let zoom = 1;
let turning = false;
let resizeTimer = 0;
const pageCache = new Map();

function pageGroup(index) {
  if (index === 0) return [1];
  if (index === 1) return [2];
  const first = 3 + (index - 2) * 2;
  return first <= pdf.numPages ? [first, Math.min(first + 1, pdf.numPages)] : [];
}

async function getPage(pageNumber) {
  if (!pageCache.has(pageNumber)) pageCache.set(pageNumber, pdf.getPage(pageNumber));
  return pageCache.get(pageNumber);
}

async function paintPage(pageNumber, canvas) {
  const context = canvas.getContext('2d', { alpha: false });
  const parent = canvas.parentElement;
  if (!pageNumber) {
    canvas.width = 1;
    canvas.height = 1;
    canvas.style.width = '0';
    canvas.style.height = '0';
    context.clearRect(0, 0, 1, 1);
    return;
  }

  const page = await getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(1, parent.clientWidth - 2);
  const availableHeight = Math.max(1, parent.clientHeight - 2);
  const fit = Math.min(availableWidth / base.width, availableHeight / base.height);
  const viewport = page.getViewport({ scale: fit });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.ceil(viewport.width * outputScale);
  canvas.height = Math.ceil(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = '#faf8f4';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({
    canvasContext: context,
    viewport,
    transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
    background: '#faf8f4',
  }).promise;
}

function activePages() {
  if (mobileQuery.matches) return [mobilePage + 1];
  return pageGroup(spreadIndex);
}

async function renderMain() {
  if (!pdf) return;
  bookSpread.classList.toggle('mobile-view', mobileQuery.matches);
  bookSpread.classList.toggle('cover-view', !mobileQuery.matches && spreadIndex === 0);
  const pages = activePages();
  if (mobileQuery.matches) {
    await Promise.all([paintPage(null, leftCanvas), paintPage(pages[0], rightCanvas)]);
  } else {
    await Promise.all([paintPage(pages.length > 1 ? pages[0] : null, leftCanvas), paintPage(pages.length ? pages[pages.length - 1] : null, rightCanvas)]);
  }
  updateControls();
}

function updateControls() {
  const mobile = mobileQuery.matches;
  const count = mobile ? pdf.numPages : groups.length;
  const current = mobile ? mobilePage + 1 : spreadIndex + 1;
  statusEl.textContent = mobile ? `ページ ${current} / ${count}` : `見開き ${current} / ${count}`;
  previousButton.disabled = turning || (mobile ? mobilePage <= 0 : spreadIndex <= 0);
  nextButton.disabled = turning || (mobile ? mobilePage >= pdf.numPages - 1 : spreadIndex >= groups.length - 1);
  zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  bookSpread.style.setProperty('--zoom', String(zoom));
}

function nextPosition() {
  if (mobileQuery.matches) return mobilePage < pdf.numPages - 1 ? mobilePage + 1 : null;
  return spreadIndex < groups.length - 1 ? spreadIndex + 1 : null;
}

function previousPosition() {
  if (mobileQuery.matches) return mobilePage > 0 ? mobilePage - 1 : null;
  return spreadIndex > 0 ? spreadIndex - 1 : null;
}

function setFlipSide(side) {
  flipLeaf.dataset.side = side;
  flipLeaf.classList.toggle('mobile-leaf', mobileQuery.matches);
}

async function turn(direction) {
  if (!pdf || turning) return;
  const target = direction === 'next' ? nextPosition() : previousPosition();
  if (target === null) return;

  const mobile = mobileQuery.matches;
  const fromPages = mobile ? [mobilePage + 1] : pageGroup(spreadIndex);
  const toPages = mobile ? [target + 1] : pageGroup(target);
  let side = 'right';
  let frontPage;
  let backPage;

  if (mobile) {
    frontPage = fromPages[0];
    backPage = toPages[0];
  } else if (direction === 'next') {
    frontPage = fromPages.length > 1 ? fromPages[1] : fromPages[0];
    backPage = toPages[0];
  } else if (spreadIndex === 1) {
    frontPage = fromPages[0];
    backPage = toPages[0];
  } else {
    side = 'left';
    frontPage = fromPages[0];
    backPage = toPages.length > 1 ? toPages[1] : toPages[0];
  }

  turning = true;
  updateControls();
  try {
    await Promise.all([paintPage(frontPage, flipFront), paintPage(backPage, flipBack)]);
    setFlipSide(side);
    flipLeaf.hidden = false;
    flipLeaf.classList.remove('turn-next', 'turn-prev');
    void flipLeaf.offsetWidth;
    requestAnimationFrame(() => flipLeaf.classList.add(direction === 'next' ? 'turn-next' : 'turn-prev'));
    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        flipLeaf.removeEventListener('transitionend', finish);
        resolve();
      };
      flipLeaf.addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 850);
    });
    if (mobile) mobilePage = target;
    else spreadIndex = target;
    flipLeaf.hidden = true;
    flipLeaf.classList.remove('turn-next', 'turn-prev');
    await renderMain();
  } catch (error) {
    messageEl.textContent = `ページを表示できませんでした: ${error.message}`;
    flipLeaf.hidden = true;
  } finally {
    turning = false;
    updateControls();
  }
}

function setZoom(nextZoom) {
  zoom = Math.max(.75, Math.min(1.8, Math.round(nextZoom * 20) / 20));
  updateControls();
}

previousButton.addEventListener('click', () => turn('previous'));
nextButton.addEventListener('click', () => turn('next'));
document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoom - .1));
document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoom + .1));
document.getElementById('zoomReset').addEventListener('click', () => setZoom(1));

let pointerStart = null;
bookViewport.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button') || turning) return;
  pointerStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  bookViewport.setPointerCapture?.(event.pointerId);
});
bookViewport.addEventListener('pointerup', (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.15) {
    turn(dx < 0 ? 'next' : 'previous');
  }
});
bookViewport.addEventListener('pointercancel', () => { pointerStart = null; });

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input,textarea,select')) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); turn('next'); }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); turn('previous'); }
  if (event.key === 'Home') {
    if (mobileQuery.matches) mobilePage = 0;
    else spreadIndex = 0;
    renderMain();
  }
  if (event.key === 'End') {
    if (mobileQuery.matches) mobilePage = pdf.numPages - 1;
    else spreadIndex = groups.length - 1;
    renderMain();
  }
});

mobileQuery.addEventListener('change', async () => {
  if (!pdf) return;
  if (mobileQuery.matches) mobilePage = pageGroup(spreadIndex)[0] - 1;
  else {
    const pageNumber = mobilePage + 1;
    spreadIndex = pageNumber <= 1 ? 0 : pageNumber === 2 ? 1 : 2 + Math.floor((pageNumber - 3) / 2);
  }
  await renderMain();
});

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => renderMain(), 160);
});

async function startViewer() {
  try {
    messageEl.textContent = 'PDFを読み込んでいます…';
    const base = new URL('./vendor/pdfjs/', import.meta.url);
    const source = new URL(pdfName, import.meta.url);
    const task = pdfjsLib.getDocument({
      url: source.href,
      cMapUrl: new URL('cmaps/', base).href,
      cMapPacked: true,
      standardFontDataUrl: new URL('standard_fonts/', base).href,
      wasmUrl: new URL('wasm/', base).href,
      iccUrl: new URL('iccs/', base).href,
      isEvalSupported: false,
    });
    pdf = await task.promise;
    groups = [[1], [2]];
    for (let page = 3; page <= pdf.numPages; page += 2) groups.push([page, Math.min(page + 1, pdf.numPages)]);
    document.getElementById('readerHint').textContent = mobileQuery.matches
      ? '左右にスワイプするか、前へ・次へで1ページずつ進めます。＋／−で拡大縮小できます。'
      : 'ページの上で左右にドラッグするか、矢印キーで見開きをめくれます。＋／−で拡大縮小できます。';
    messageEl.textContent = '';
    await renderMain();
  } catch (error) {
    messageEl.textContent = `PDFを読み込めませんでした。HTTPサーバー経由で開いてください。(${error.message})`;
    statusEl.textContent = 'PDFの読み込みに失敗しました';
  }
}

startViewer();

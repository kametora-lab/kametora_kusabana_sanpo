奄美の春を、草花とゆっくり歩く — PDFめくりビューア

このフォルダーの index.html がPDFビューアです。冊子PDFを直接読み込み、PDFの32ページを表示します。

使い方
- パソコン: 見開き表示。ページ上を左右にドラッグ、前へ／次へボタン、または左右矢印キーでめくります。
- スマートフォン: 1ページ表示。左右にスワイプするか、前へ／次へボタンで進みます。
- 拡大・縮小: ＋／−ボタンを使います。画面が狭いときは拡大して細部を読めます。

ローカルでの確認
ES modules と PDF.js worker を使うため、index.html を直接ダブルクリックする file:// ではなく、HTTPサーバー経由で開いてください。
このフォルダーでコマンドプロンプトまたはPowerShellを開き、次を実行します。

  python -m http.server 8000

その後、ブラウザーで http://localhost:8000/ を開きます。

公開するとき
このフォルダーの内容を同じ階層構成のままWebサーバーへ配置してください。PDFとPDF.jsのローカル配布物も含まれています。

主なファイル
- index.html / viewer.css / viewer.js: PDFビューア
- 奄美の春を、草花とゆっくり歩く — 完全版電子書籍（全32ページ）.pdf: 元PDF
- vendor/pdfjs/: PDF.js 6.4.299 とライセンス
- ebook/: HTML版の冊子コピー
- public/images/: HTML版で使う写真

PDF.js: Mozilla PDF.js, version 6.4.299, Apache License 2.0.

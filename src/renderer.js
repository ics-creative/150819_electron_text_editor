/** フッター領域 */
const footerArea = document.querySelector(".footer");

// 「読み込む」ボタンの制御
document.querySelector("#btnOpen").addEventListener("click", () => {
  openFile();
});
// 「保存する」ボタンの制御
document.querySelector("#btnSave").addEventListener("click", () => {
  saveFile();
});

// テキストエディター
const editor = ace.edit("inputArea");
editor.setTheme("ace/theme/twilight");

// ファイルパスのステート
let currentPath = null;

/**
 * ファイルを開きます。
 */
async function openFile() {
  // レンダラープロセスから、preload.jsを経由し、メインプロセスを呼び出し、結果を得る
  const result = await window.myApp.openFile();

  if (result) {
    const { filePath, textData } = result;

    // フッター部分に読み込み先のパスを設定する
    footerArea.textContent = currentPath = filePath;
    // テキスト入力エリアに設定する
    editor.setValue(textData, -1);
  }
}

/**
 * ファイルを保存します。
 */
async function saveFile() {
  // レンダラープロセスから、preload.jsを経由し、メインプロセスを呼び出し、結果を得る
  const result = await window.myApp.saveFile(currentPath, editor.getValue());

  if (result) {
    // フッター部分に読み込み先のパスを設定する
    footerArea.textContent = currentPath = result.filePath;
  }
}

// ---------------------------------------
// ドラッグ&ドロップ関連処理（任意実装）
// ---------------------------------------

// dropはdragoverイベントを登録していてはじめて発火するため指定
document.addEventListener("dragover", (event) => {
  event.preventDefault();
});
// ドロップされたらそのファイルを読み込む
document.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];

  // FileReader 機能を使って読み込み。
  // メインプロセス側で処理を統一してもいいかもですが、代案として例示します。
  const reader = new FileReader();
  reader.onload = function () {
    const textData = reader.result;

    // フッター部分に読み込み先のパスを設定する
    footerArea.textContent = currentPath = file.path;
    // テキスト入力エリアに設定する
    editor.setValue(textData, -1);
  };
  reader.readAsText(file); // テキストとして読み込み
});

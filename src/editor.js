const fs = require('fs');
const {BrowserWindow, dialog} = require('electron').remote;

let inputArea = null;
let inputTxt = null;
let footerArea = null;

let currentPath = '';
let editor = null;

/**
 * Webページ読み込み時の処理
 */
function onLoad() {
  // 入力関連領域
  inputArea = document.getElementById('input_area');
  // 入力領域
  inputTxt = document.getElementById('input_txt');
  // フッター領域
  footerArea = document.getElementById('footer_fixed');

  editor = ace.edit('input_txt');
  editor.getSession().setMode('ace/mode/javascript');
  editor.setTheme('ace/theme/twilight');

  // ドラッグ&ドロップ関連処理
  // documentにドラッグされた場合 / ドロップされた場合
  document.ondragover = document.ondrop = function (e) {
    e.preventDefault(); // イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
    return false;
  };

  inputArea.ondragover = function () {
    return false;
  };
  inputArea.ondragleave = inputArea.ondragend = function () {
    return false;
  };
  inputArea.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    readFile(file.path);
    return false;
  };
};

/**
 * 読み込みするためのファイルを開く
 */
function openLoadFile() {
  const win = BrowserWindow.getFocusedWindow();

  dialog.showOpenDialog(
    win,
    // どんなダイアログを出すかを指定するプロパティ
    {
      properties: ['openFile'],
      filters: [
        {
          name: 'Documents',
          extensions: ['txt', 'text', 'html', 'js']
        }
      ]
    },
    // [ファイル選択]ダイアログが閉じられた後のコールバック関数
    function (filenames) {
      if (filenames) {
        readFile(filenames[0]);
      }
    });
}

/**
 * テキストを読み込み、テキストを入力エリアに設定する
 */
function readFile(path) {
  currentPath = path;
  fs.readFile(path, function (error, text) {
    if (error != null) {
      alert('error : ' + error);
      return;
    }
    // フッター部分に読み込み先のパスを設定する
    footerArea.innerHTML = path;
    // テキスト入力エリアに設定する
    editor.setValue(text.toString(), -1);
  });
}

/**
 * ファイルを保存する
 */
function saveFile() {

  //　初期の入力エリアに設定されたテキストを保存しようとしたときは新規ファイルを作成する
  if (currentPath == '') {
    saveNewFile();
    return;
  }

  const win = BrowserWindow.getFocusedWindow();

  dialog.showMessageBox(win, {
      title: 'ファイルの上書き保存を行います。',
      type: 'info',
      buttons: ['OK', 'Cancel'],
      detail: '本当に保存しますか？'
    },
    // メッセージボックスが閉じられた後のコールバック関数
    function (respnse) {
      // OKボタン(ボタン配列の0番目がOK)
      if (respnse == 0) {
        var data = editor.getValue();
        writeFile(currentPath, data);
      }
    }
  );
}

/**
 * ファイルを書き込む
 */
function writeFile(path, data) {
  fs.writeFile(path, data, function (error) {
    if (error != null) {
      alert('error : ' + error);
      return;
    }
  });
}

/**
 * 新規ファイルを保存する
 */
function saveNewFile() {

  const win = BrowserWindow.getFocusedWindow();
  dialog.showSaveDialog(
    win,
    // どんなダイアログを出すかを指定するプロパティ
    {
      properties: ['openFile'],
      filters: [
        {
          name: 'Documents',
          extensions: ['txt', 'text', 'html', 'js']
        }
      ]
    },
    // セーブ用ダイアログが閉じられた後のコールバック関数
    function (fileName) {
      if (fileName) {
        var data = editor.getValue();
        currentPath = fileName;
        writeFile(currentPath, data);
      }
    }
  );
}
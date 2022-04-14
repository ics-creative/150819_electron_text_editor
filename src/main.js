// アプリケーション作成用のモジュールを読み込み
const path = require("path");
const fs = require("fs");
const electron = require("electron");
const app = electron.app;
const { BrowserWindow, ipcMain, dialog } = electron;

// メインウィンドウ
let mainWindow;

function createWindow() {
  // メインウィンドウを作成します
  mainWindow = new BrowserWindow({
    width: 800,
    height: 540,
    webPreferences: {
      // preload.js を指定
      preload: path.join(app.getAppPath(), "./preload.js"),
    },
  });

  // メインウィンドウに表示するURLを指定します
  // （今回はmain.jsと同じディレクトリのindex.html）
  mainWindow.loadFile("index.html");

  // デベロッパーツールの起動
  mainWindow.webContents.openDevTools();

  // メインウィンドウが閉じられたときの処理
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

//  初期化が完了した時の処理
app.on("ready", createWindow);

// 全てのウィンドウが閉じたときの処理
app.on("window-all-closed", () => {
  // macOSのとき以外はアプリを終了させます
  if (process.platform !== "darwin") {
    app.quit();
  }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on("activate", () => {
  /// メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});

// レンダラープロセスとの連携
ipcMain.handle("openFile", openFile);
ipcMain.handle("saveFile", saveFile);

/**
 * 【メインプロセス】ファイルを開きます。
 * @returns {Promise<null|{textData: string, filePath: string}>}
 */
async function openFile() {
  const win = BrowserWindow.getFocusedWindow();

  const result = await dialog.showOpenDialog(
    win,
    // どんなダイアログを出すかを指定するプロパティ
    {
      properties: ["openFile"],
      filters: [
        {
          name: "Documents",
          // 読み込み可能な拡張子を指定
          extensions: ["txt", "html", "md", "js", "ts"],
        },
      ],
    }
  );

  // [ファイル選択]ダイアログが閉じられた後の処理
  if (result.filePaths.length > 0) {
    const filePath = result.filePaths[0];

    // テキストファイルを読み込む
    const textData = fs.readFileSync(filePath, "utf8");
    // ファイルパスとテキストデータを返却
    return {
      filePath,
      textData,
    };
  }
  // ファイル選択ダイアログで何も選択しなかった場合は、nullを返しておく
  return null;
}

/**
 * 【メインプロセス】ファイルを保存します。
 * @param event
 * @param {string} currentPath 現在編集中のファイルのパス
 * @param {string} textData テキストデータ
 * @returns {Promise<{filePath: string} | void>} 保存したファイルのパス
 */
async function saveFile(event, currentPath, textData) {
  let saveFilePath;

  //　初期の入力エリアに設定されたテキストを保存しようとしたときは新規ファイルを作成する
  if (currentPath) {
    saveFilePath = currentPath;
  } else {
    const win = BrowserWindow.getFocusedWindow();
    // 新規ファイル保存の場合はダイアログをだし、ファイル名をユーザーに決定してもらう
    const result = await dialog.showSaveDialog(
      win,
      // どんなダイアログを出すかを指定するプロパティ
      {
        properties: ["openFile"],
        filters: [
          {
            name: "Documents",
            extensions: ["txt", "html", "md", "js", "ts"],
          },
        ],
      }
    );
    // キャンセルした場合
    if (result.canceled) {
      // 処理を中断
      return;
    }
    saveFilePath = result.filePath;
  }

  // ファイルを保存
  fs.writeFileSync(saveFilePath, textData);

  return { filePath: saveFilePath };
}

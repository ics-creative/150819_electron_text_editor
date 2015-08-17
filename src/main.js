var app = require('app');	// アプリケーション作成用モジュールをロード
var BrowserWindow = require('browser-window');

//	クラッシュレポート
require('crash-reporter').start();

var mainWindow = null;

// 全てのウィンドウが閉じたらアプリケーションを終了します。
app.on('window-all-closed', function () {
	app.quit();
});

// アプリケーションの初期化が完了したら呼び出されます。
app.on('ready', function () {
	// メインウィンドウを作成します。
	mainWindow = new BrowserWindow({ width: 400, height: 600 });

	// メインウィンドウに表示するURLを指定します。
	mainWindow.loadUrl('file://' + __dirname + '/index.html');

	// メインウィンドウが閉じられたときの処理
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
});
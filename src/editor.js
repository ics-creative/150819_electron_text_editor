
var fs = require('fs');
var remote = require('remote');
var dialog = remote.require('dialog');
var browserWindow = remote.require('browser-window');

var inputArea = null;
var inputTxt = null;
var footerArea = null;

var currentPath = "";

/**
 * Webページ読み込み時の処理
 */
function onLoad() {
	// documentにドラッグされた場合 / ドロップされた場合
	document.ondragover = document.ondrop = function (e) {
		e.preventDefault(); // イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
		return false;
	};
	
	// 入力関連領域
	inputArea = document.getElementById("input_area");
	// 入力領域
	inputTxt = document.getElementById("input_txt");
	// フッター領域
	footerArea = document.getElementById("footer_fixed");

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
	var win = browserWindow.getFocusedWindow();

	dialog.showOpenDialog(
		win,
		// どんなダイアログを出すかを指定するプロパティ
		{
			properties: ['openFile'],
			filters: [
				{
					name: 'Documents',
					extensions: ['txt', 'text', 'html']
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
	fs.readFile(path, function (err, text) {
		if (err != null) {
			alert('error : ' + err);
		}
		// フッター部分に読み込み先のパスを設定する
		footerArea.innerHTML = path;
		// テキスト入力エリアに設定する
		inputTxt.value = text;
	});
}


/**
 * ファイルを保存する
 */
function saveFile() {

	//　初期の入力エリアに設定されたテキストを保存しようとしたときは新規ファイルを作成する
	if (currentPath == "") {
		saveNewFile();
		return;
	}

	var win = browserWindow.getFocusedWindow();

	dialog.showMessageBox(win,
		{
			title: 'ファイルの上書き保存を行います。',
			type: 'info',
			buttons: ['OK', 'Cancel'],
			detail: '本当に保存しますか？'
		}, 
		// メッセージボックスが閉じられた後のコールバック関数
		function (respnse) {
			// OKボタン(ボタン配列の0番目がOK)
			if (respnse == 0) {
				var data = inputTxt.value;
				writeFile(currentPath, data);
			}
		}
		);
}

/**
 * ファイルを書き込む
 */
function writeFile(path, data) {
	fs.writeFile(path, data, function (err) {
		if (err != null) {
			alert('error : ' + err);
		}
	});
}

/**
 * 新規ファイルを保存する
 */
function saveNewFile() {

	var win = browserWindow.getFocusedWindow();
	dialog.showSaveDialog(
		win,
		// どんなダイアログを出すかを指定するプロパティ
		{
			properties: ['openFile'],
			filters: [
				{
					name: 'Documents',
					extensions: ['txt', 'text', 'html']
				}
			]
		},
		// セーブ用ダイアログが閉じられた後のコールバック関数
		function (fileName) {
			if (fileName) {
				var data = inputTxt.value;
				currentPath = fileName;
				writeFile(currentPath, data);
			}
		}
		);
}
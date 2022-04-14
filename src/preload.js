const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスのグローバル空間(window)にAPIとしての関数を生やします。
// レンダラープロセスとメインプロセスの橋渡しを行います。
contextBridge.exposeInMainWorld("myApp", {
  /**
   * 【プリロード（中継）】ファイルを開きます。
   * @returns {Promise<{filePath: string, textData:string}>}
   */
  async openFile() {
    // メインプロセスの関数を呼び出す
    const result = await ipcRenderer.invoke("openFile");
    return result;
  },

  /**
   * 【プリロード（中継）】ファイルを保存します。
   * @param {string} currentPath 現在編集中のファイルのパス
   * @param {string} textData テキストデータ
   * @returns {Promise<{filePath: string} | void>}
   */
  async saveFile(currentPath, textData) {
    // メインプロセスの関数を呼び出す
    const result = await ipcRenderer.invoke("saveFile", currentPath, textData);
    return result;
  },
});

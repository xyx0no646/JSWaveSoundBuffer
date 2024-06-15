"use strict";
/**
 * JavaScriptで実装されたJSWaveSoundBuffer
 */
class JSWaveSoundBuffer {
    constructor() {
        this.runner = [];
        this.audioTag = new Audio();
        this.status = "unload";
        this.volume = 100000;
        this.volume2 = 100000;
        this.isOpened = false;
        JSWaveSoundBuffer.instances.push(this);
    }
    // 全体に音量を同期
    static applyVolume() {
        JSWaveSoundBuffer.instances.forEach(player => player.applyLocalVolume());
    }
    // インスタンスに音量を同期
    applyLocalVolume() {
        this.audioTag.volume = this.volume * this.volume2 * JSWaveSoundBuffer.globalVolume / 100000 / 100000 / 100000;
    }
    // oggが再生できない邪悪なブラウザを判定
    static isEvilBrowser() {
        return new Audio().canPlayType("audio/ogg") == ""
    }
    async resolveRunner() {
        while (await this.runner.shift());
    }
    /**
    * メディアを開く
    *
    * @param storage 再生したいストレージを指定します。
    * @param type audio/oggのようなコンテンツタイプを指定します
    * @description 指定されたメディアを開きます。
    * このメソッドは再生を開始しません。
    */
    async open(storage, type) {
        this.runner.push((async () => {
            // Blob URLを開放する
            if (this.audioTag) {
                URL.revokeObjectURL(this.audioTag.src);
            }
            this.blob = new Blob([
                // @ts-ignore
                Module.getStorageUInt8Array(storage)
            ], { type });
            // Safariなどの邪悪なブラウザのための分岐
            if (type == "audio/ogg" && JSWaveSoundBuffer.isEvilBrowser()) {
                let loop = this.audioTag.loop;
                let currentTime = this.audioTag.currentTime;
                // 邪悪なブラウザなので、ローディングが少し長くなるぐらいは許容する
                while (!JSWaveSoundBuffer.oggPlayerLoaded) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                };
                // @ts-ignore
                this.audioTag = new OGVPlayer({
                    wasm: true,
                    threading: true
                });
                this.audioTag.loop = loop;
                this.audioTag.currentTime = currentTime;
            }
            this.audioTag.preload = "auto";
            this.audioTag.src = URL.createObjectURL(this.blob);
            this.audioTag.load();
            this.isOpened = true;
        })());
    }
    ;
    /**
    * メディアを再生する
    *
    * @description メディアの再生を開始します。
    */
    async play() {
        this.runner.push(this.audioTag.play());
        await this.resolveRunner();
    }
    ;
    /**
    * メディアを停止する
    *
    * @description メディアを停止します。
    */
    async stop() {
        this.runner.push(this.pause());
        this.audioTag.currentTime = 0;
        await this.resolveRunner();
    }
    ;
    /**
     * メディアのポーズ
     */
    async pause() {
        this.audioTag.muted = true;
        this.runner.push(Promise.resolve(this.audioTag.pause()));
        this.audioTag.muted = false;
        await this.resolveRunner();
    }
    /**
    * 音量
    *
    * @description 再生する音量を表します。
    * 値を設定することもできます。
    * 0 ～ 100000 の数値で指定し、 0 が完全ミュート、100000 が 100% の音量となります。
    */
    getVolume() {
        this.volume;
    }
    setVolume(volume) {
        this.volume = volume;
        this.applyLocalVolume();
    }
    /**
    * 第２音量
    *
    * @description 再生する音量を表します。値を設定することができます。
    * JSWaveSoundBuffer.volume プロパティと違うのは、このプロパティはJSWaveSoundBuffer.fade メソッドでも変化しないということです。
    * 最終的な音量は、volume プロパティとこのプロパティの積で決定されます。
    * volume プロパティが100000 ( 100% ) で volume2 プロパティも 100000 ( 100% ) ならば 100% × 100% = 100% で100% の音量で再生されます。
    * volume プロパティが 50000 ( 50% ) で volume2 プロパティが 75000 ( 75% ) ならば50% × 75% = 37.5% で 37.5 % の音量で再生されます。
    */
    getVolume2() { return this.volume2; }
    setVolume2(volume2) {
        this.volume2 = volume2;
        this.applyLocalVolume();
    }
    /**
    * 大域音量
    *
    * @description 大域音量 (マスターボリューム)を表します。
    * 値を設定することもできます。
    * この音量は、すべての JSWaveSoundBuffer に影響します。
    * 0 ～ 100000 の数値で指定し、 0 が完全ミュート、100000 が 100% の音量となります。
    * デフォルトの値は 100000 です。
    * このプロパティは JSWaveSoundBuffer クラス上にしか存在しません (JSWaveSoundBufferから作られたオブジェクト上にこのプロパティはありません)。
    * 使用する際は JSWaveSoundBuffer.globalVolume としてください。
    */
    static setGlobalVolume(globalVolume) {
        JSWaveSoundBuffer.globalVolume = globalVolume;
        JSWaveSoundBuffer.applyVolume();
    }
    static getGlovalVolume() {
        return JSWaveSoundBuffer.globalVolume;
    }
    // デストラクタ
    finalize() {
        // Blob URLを開放する
        if (this.audioTag) {
            URL.revokeObjectURL(this.audioTag.src);
        }
        JSWaveSoundBuffer.instances = JSWaveSoundBuffer.instances.filter(player => player !== this);
        this.audioTag.src = "";
    }
}
JSWaveSoundBuffer.globalVolume = 100000;
JSWaveSoundBuffer.instances = [];
JSWaveSoundBuffer.oggPlayerLoaded = false;
if (JSWaveSoundBuffer.isEvilBrowser()) {
    let script = document.createElement("script");
    script.onload = () => JSWaveSoundBuffer.oggPlayerLoaded = true;
    script.src = "ogvjs/ogv.js"
    document.head.appendChild(script);
}
window.JSWaveSoundBuffer = JSWaveSoundBuffer;
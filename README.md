# JSWaveSoundBuffer

Audioタグで実装したWaveSoundbuffer

## これはなに？

Web版の吉里吉里SDL2で音がブツブツ途切れる症状が気になったら試してみるものです

## 使い方

1. ご自身のプロジェクトのdataフォルダにJSWaveSoundBufferの中身をコピーします。
2. （iOSのブラウザもしくはSafariに対応させる場合のみ）public/ogvjsのフォルダの中身を吉里吉里SDL2のindex.htmlのあるフォルダにコピーします
3. ご自身のプロジェクトのstartup.tjsに以下のように追記します。

```js
// 追記ここから
if (System.platformName === 'Emscripten') {
	Scripts.execStorage("JSWaveSoundBuffer/JSWaveSoundBuffer.tjs");
}
// 追記ここまで

// このスクリプトは一番最初に実行されるスクリプトです
Scripts.execStorage("system/Initialize.tjs"); // system/Initialize.tjs を実行
```

### 技術的詳細

JavaScriptで実装されたWaveSoundBufferです。

2024年6月現在、Web版吉里吉里SDL2はシングルスレッド動作です。つまり、描画と音声のデコード諾々……を同一のスレッドで動作させています。<br>
なので、描画が重かったりすると音がブツブツ途切れます。

このTJSスクリプトはWaveSoundbufferを上書きし、Audioタグで音声を再生させます。
 
 oggやwav,mp3,midiの再生・停止、音量変更など基本的な機能は動作します。<br>
 一方でループチューナーなどいろいろなものが実装されていません。


 ### 更新履歴
 - 2021/8/29 pause　及びfadein/fadeoutを実装した
 - 2021/9/20 [ws]タグを使うとフリーズしてしまう問題を修正
 - 2024/6/15 新バージョンを作成　巨大になってしまったのでgithubにプロジェクトを作る
 
## ライセンスについて

author:@xyx0no646

ご自由にお使いください

### ogv.jsの使用について
未だに「audio/ogg」を再生できないSafariで動作させるため、ogv.jsを使用しています。<br>
これはMITライセンスに従います。

https://github.com/bvibber/ogv.js
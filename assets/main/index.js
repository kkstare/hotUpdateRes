window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  hotUpdate: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dfe40aLJf5NebokMTTR+hmy", "hotUpdate");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        manifestUrl: cc.Asset,
        _updating: false,
        _canRetry: false,
        _storagePath: "",
        label: {
          default: null,
          type: cc.Label
        }
      },
      checkCb: function checkCb(event) {
        cc.log("Code:\xa0" + event.getEventCode());
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          this.label.string = "\u672c\u5730\u6587\u4ef6\u4e22\u5931";
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          this.label.string = "\u4e0b\u8f7d\u8fdc\u7a0bmainfest\u6587\u4ef6\u9519\u8bef";
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          this.label.string = "\u5df2\u7ecf\u662f\u6700\u65b0\u7248\u672c";
          break;

         case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          this.label.string = "\u6709\u65b0\u7248\u672c\u53d1\u73b0\uff0c\u8bf7\u70b9\u51fb\u66f4\u65b0";
          break;

         default:
          return;
        }
        this._am.setEventCallback(null);
        this._checkListener = null;
        this._updating = false;
      },
      updateCb: function updateCb(event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          this.label.string = "\u672c\u5730\u7248\u672c\u6587\u4ef6\u4e22\u5931\uff0c\u65e0\u6cd5\u66f4\u65b0";
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          var percent = parseInt(100 * event.getPercent());
          Number.isNaN(percent) && (percent = 0);
          this.label.string = "\u66f4\u65b0\u8fdb\u5ea6:" + percent;
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          this.label.string = "\u4e0b\u8f7d\u8fdc\u7a0b\u7248\u672c\u6587\u4ef6\u5931\u8d25";
          failed = true;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          this.label.string = "\u5f53\u524d\u4e3a\u6700\u65b0\u7248\u672c";
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FINISHED:
          this.label.string = "\u66f4\u65b0\u5b8c\u6210.\xa0" + event.getMessage();
          needRestart = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FAILED:
          this.label.string = "\u66f4\u65b0\u5931\u8d25.\xa0" + event.getMessage();
          this._updating = false;
          this._canRetry = true;
          break;

         case jsb.EventAssetsManager.ERROR_UPDATING:
          this.label.string = "\u8d44\u6e90\u66f4\u65b0\u9519\u8bef:\xa0" + event.getAssetId() + ",\xa0" + event.getMessage();
          break;

         case jsb.EventAssetsManager.ERROR_DECOMPRESS:
          this.label.string = event.getMessage();
        }
        if (failed) {
          this._am.setEventCallback(null);
          this._updateListener = null;
          this._updating = false;
        }
        if (needRestart) {
          this._am.setEventCallback(null);
          this._updateListener = null;
          var searchPaths = jsb.fileUtils.getSearchPaths();
          var newPaths = this._am.getLocalManifest().getSearchPaths();
          cc.log(JSON.stringify(newPaths));
          Array.prototype.unshift(searchPaths, newPaths);
          cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
          jsb.fileUtils.setSearchPaths(searchPaths);
          cc.audioEngine.stopAll();
          cc.game.restart();
        }
      },
      retry: function retry() {
        if (!this._updating && this._canRetry) {
          this._canRetry = false;
          this.label.string = "\u91cd\u73b0\u83b7\u53d6\u5931\u8d25\u8d44\u6e90...";
          this._am.downloadFailedAssets();
        }
      },
      checkUpdate: function checkUpdate() {
        if (this._updating) {
          this.label.string = "\u68c0\u67e5\u66f4\u65b0\u4e2d...";
          return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
          cc.loader.md5Pipe && (url = cc.loader.md5Pipe.transformURL(this.manifestUrl.nativeUrl));
          this._am.loadLocalManifest(this.manifestUrl.nativeUrl);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
          this.label.string = "\u672c\u5730manifest\u52a0\u8f7d\u5931\u8d25...";
          return;
        }
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
        this._updating = true;
      },
      hotUpdate: function hotUpdate() {
        if (this._am && !this._updating) {
          this._am.setEventCallback(this.updateCb.bind(this));
          this._am.getState() === jsb.AssetsManager.State.UNINITED && this._am.loadLocalManifest(this.manifestUrl.nativeUrl);
          this._failCount = 0;
          this._am.update();
          this._updating = true;
        }
      },
      onLoad: function onLoad() {
        var _this = this;
        if (!cc.sys.isNative) return;
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset";
        cc.log("Storage\xa0path\xa0for\xa0remote\xa0asset\xa0:\xa0" + this._storagePath);
        this.versionCompareHandle = function(versionA, versionB) {
          _this.label.string = "Compare:\xa0version\xa0A\xa0is\xa0" + versionA + ",\xa0version\xa0B\xa0is\xa0" + versionB;
          var vA = versionA.split(".");
          var vB = versionB.split(".");
          for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) continue;
            return a - b;
          }
          return vB.length > vA.length ? -1 : 0;
        };
        this._am = new jsb.AssetsManager("", this._storagePath, this.versionCompareHandle);
        this._am.setVerifyCallback(function(path, asset) {
          var compressed = asset.compressed;
          var expectedMD5 = asset.md5;
          var relativePath = asset.path;
          var size = asset.size;
          if (compressed) {
            _this.label.string = "Verification\xa0passed\xa0:\xa0" + relativePath;
            return true;
          }
          _this.label.string = "Verification\xa0passed\xa0:\xa0" + relativePath + "\xa0(" + expectedMD5 + ")";
          return true;
        });
        this.label.string = "\u70ed\u66f4\u65b0\u7ec4\u4ef6\u52a0\u8f7d\u5b8c\u6bd5\uff0c\u8bf7\u624b\u52a8\u70b9\u51fb\u68c0\u6d4b\u6309\u94ae";
        cc.sys.os === cc.sys.OS_ANDROID && this._am.setMaxConcurrentTask(2);
      },
      onDestroy: function onDestroy() {
        if (this._updateListener) {
          this._am.setEventCallback(null);
          this._updateListener = null;
        }
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "hotUpdate" ]);
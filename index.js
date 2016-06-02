var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var ManifestGenerator = function(options){
    this.options = _.extend({
      filename: 'app.manifest',
      network:[],
      fallback:{},
      ext:'*',
      isWatch: false,
      htmlpath:[]
    }, options);
}

function inNETWORK(file,arr){
    var isnt = false
    for (var i = 0; i < arr.length; i++) {
        if(file.indexOf(arr[i])>-1){
            isnt = true;
            break;
        }
    }
    return isnt;
}

ManifestGenerator.prototype.apply = function(compiler){
    var self = this;
    this.options = _.extend(this.options, {isWatch: compiler.options.watch || false})

    // 序列出 HTML 文件路径及名字
    compiler.plugin('compilation', function(compilation, params) {
        compilation.plugin('after-optimize-chunk-assets', function(chunks) {
            chunks.map(function(c){
                if( c.files.length===1 && /(.html|.htm)+(\?|\#|$)/.test(c.files[0]) ){
                    self.options.htmlpath.push(c.files[0])
                }
            })
        });
    });

    // 编译生成
    compiler.plugin('emit', function(compilation, callback) {
        self.setHTMLManifest(compilation)
        self.creatManifest(compilation);
        callback();
    });

}

ManifestGenerator.prototype.setHTMLManifest = function(compilation){
    var self = this;
    self.options.htmlpath.map(function(_path){
        var data = compilation.assets[_path];
        if (!data) return;
        var source_str = data.source();
        compilation.assets[_path] = {
            source: function() {
                return source_str.replace('<html','<html manifest="'+self.options.filename+'"');
            },
            size: function() {
                return source_str.length;
            }
        };
    })
}
/**
 * creat .Manifest file.
 * @param  {[type]} compilation [The Compilation instance extends from the compiler.]
 */
ManifestGenerator.prototype.creatManifest = function(compilation){
    var manifest = 'CACHE MANIFEST\n# Time：' + new Date() + '\n';
    var fallback = this.options.fallback;
    var network = this.options.network;
    var filename = this.options.filename;
    var ext = this.options.ext;
    var outputData = [];
    var networkData = [];
    _.forOwn(compilation.assets, function(value, url) {
        if(!inNETWORK(url,network)){
            if(ext === "*") outputData.push(url);
            else{
                var strRegex = "("+ext+")";
                var re=new RegExp(strRegex);
                if (re.test(str)){
                    outputData.push(url);
                }
            }

        }
        if(inNETWORK(url,network)){
            networkData.push(url)
        }
    });

    if(compilation.records) for (var url in compilation.records) {
        if(url.indexOf('html-webpack-plugin')>-1){
            var urld = url.match(/html-webpack-plugin for \"(.*)\"/);
            if(RegExp.$1 && !inNETWORK(RegExp.$1,network)){
                outputData.push(RegExp.$1);
            }else{
                (RegExp.$1)&&networkData.push(RegExp.$1);
            }
        }
    }

    manifest += outputData.join('\n');

    if(networkData.length>0){
        manifest += '\n\nNETWORK:\n';
        manifest += networkData.join('\n');
    }
    // Insert this list into the Webpack build as a new file asset:
    compilation.assets[filename] = {
        source: function() {
          return manifest;
        },
        size: function() {
          return manifest.length;
        }
    };

}

module.exports = ManifestGenerator;
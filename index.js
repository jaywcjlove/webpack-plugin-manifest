var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var ManifestGenerator = function(options){
    this.options = _.extend({
      filename: 'app.manifest',
      network:[],
      fallback:{},
      ext:'*'
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
    var outputPath = this.options.outputPath;
    var filename = this.options.filename;
    var ext = this.options.ext;
    var manifest = 'CACHE MANIFEST\n# Time：' + new Date() + '\n';
    var fallback = this.options.fallback;
    var network = this.options.network;

    // 优化不需要的数据
    var options = {
        source: false,
        modules: false
    };
    compiler.plugin('emit', function(compilation, callback) {
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

        manifest += outputData.join('\n')

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
        callback();
    });


}

module.exports = ManifestGenerator;
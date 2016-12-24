var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var ManifestGenerator = function(options){
    this.options = _.extend({
        filename:'cache.manifest',
        headcomment: "",
        cache:[],
        network:[],
        fallback:[],
        timestamp: true, // 显示时间
        isWatch: false,
        master:[]
    }, options);
}
ManifestGenerator.prototype.apply = function(compiler){
    var self = this;
    this.options = _.extend(this.options, {isWatch: compiler.options.watch || false});
    // 编译生成
    compiler.plugin('emit', function(compilation, callback) {
        self.setHTMLManifest(compilation)
        self.creatManifest(compilation);
        callback();
    });
}
/**
 * 给页面添加 manifest入口文件引用
 * @param {[type]} compilation 
 */
ManifestGenerator.prototype.setHTMLManifest = function(compilation){
    var self = this;
    var filename = this.options.filename;
    var entry = this.options.master
    for (var i = 0; i < entry.length; i++) {
        var _path = entry[i]
        var data = compilation.assets[_path];
        if(!data) return;
        var source_str = data.source();
        compilation.assets[_path] = {
            source: function() {
                var url = path.relative(path.parse(_path).dir,filename).split(path.sep).join('/');
                return source_str.replace(/<html[^>]*manifest="([^"]*)"[^>]*>/,function(word){
                   return word.replace(/manifest="([^"]*)"/,'manifest="'+url+'"');
                }).replace(/<html(\s?[^\>]*\>)/,function(word){
                    if(word.indexOf('manifest')>-1) return word
                    return word.replace('<html','<html manifest="'+url+'"')
                });
            },
            size: function() {
                return source_str.length;
            }
        };
    }
}
/**
 * [displayPath 返回真实URL]
 * @param  {[type]} compilation [description]
 * @param  {[type]} _path       [带hash 的 URL=> 'js/[hash:8].sorting-index.js']
 * @return {[type]}             [string]
 */
ManifestGenerator.prototype.displayPath = function(compilation,_path){
    var dtarr = compilation.getStats().toJson();
    var url_regx = _path.replace(/\[(?:(\w+):)?(contenthash|hash)(?::([a-z]+\d*))?(?::(\d+))?\]/ig,'(.*)')
    var reg = new RegExp(url_regx);
    return dtarr.assets.map(function(item,idx){
         if(reg.test(item.name)){
             return item.name;
         }else{
             return ''
         }
     }).join('');
}
ManifestGenerator.prototype.urlPathTo = function(compilation,arr){
    var self = this;
    var attt =  arr.map(function(item,idx){
        // if(/(.css|.jpg|.jpeg|.gif|.svg|.png)+(\?|\#|$)/.test(item)){
        //     item = self.displayPath(compilation,item)
        // }else{
        //     item = compilation.getPath(item)
        // }
        item = compilation.getPath(item)
        if(item) return item;
    })
    .filter(function(elm){
        return (elm !== '' && typeof(elm) !== "undefined")
    });
    return attt
}
/**
 * creat .Manifest file.
 * @param  {[type]} compilation [The Compilation instance extends from the compiler.]
 */
ManifestGenerator.prototype.creatManifest = function(compilation){

    var contents = [],
        options = this.options,
        fallback = options.fallback,
        network = options.network,
        filename = options.filename;
    var outputData = [];
    var networkData = [];

    contents.push('CACHE MANIFEST');
    if (options.timestamp) {
        contents.push('# Time: ' + new Date());
    }
    if (options.headcomment) {
        contents.push('# '+options.headcomment);
    }
    contents.push('');
    if(options.cache){
        contents.push('CACHE:');
        contents = contents.concat(this.urlPathTo(compilation,options.cache));
        contents.push('');    
    }

    if(network.length>0){
        contents.push('NETWORK:');
        contents.push(network.join('\n'));
        contents.push('');    
    }

    if(fallback.length>0){
        contents.push('FALLBACK:');
        contents.push(fallback.join('\n'));
    }
    // Insert this list into the Webpack build as a new file asset:
    compilation.assets[filename] = {
        source: function() {
          return contents.join('\n');
        },
        size: function() {
          return contents.join('\n').length;
        }
    };

}

module.exports = ManifestGenerator;
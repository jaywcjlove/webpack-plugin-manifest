# webpack-manifest

[![](https://jaywcjlove.github.io/sb/ico/npm.svg)](https://www.npmjs.com/package/webpack-manifest) 

This is a webpack plugin. It's mainly HTML5 Cache Manifest files Generates. Generates HTML5 Cache Manifest files，webpack plugin for generating asset manifests, And to the `<html>` tag, insert the `manifest` attribute.

# Install

```bash
$ npm i webpack-manifest --save-dev
```

# Getting Started

```js
var Manifest= require('webpack-manifest');
var pkg =require('./package');

module.exports = {
  plugins:[
    // 这个要放在前面就可以自动在 `<html>`标签中插入`manifest`属性
    // This should be placed in the front can antomatically insert the `manifest` attribute in hte `<html>` tag
    new HtmlWebpackPlugin({...}),
    new Manifest({
        cache: [
          'js/[hash:8].sorting-index.js', 
          'css/[hash:8].sorting-test.css',
          'css/[hash:8].index-index.css'
        ],
        //Add time in comments.
        timestamp: true,
        // 生成的文件名字，选填
        // The generated file name, optional.
        filename:'cache.manifest', 
        // 注意*星号前面用空格隔开
        network: [
          'http://api.map.baidu.com/ *',
          'http://img.jslite.com/ *'
        ],
        // 注意中间用空格隔开
        fallback: ['/ /404.html'],
        // manifest 文件中添加注释
        // Add notes to manifest file.
        headcomment: pkg.name + " v" + pkg.version, 
        master: ['index/index.html']
    })
  ]
}
```

Generated `cache.manifest` file.

```bash
CACHE MANIFEST
# Time: Sat Jun 04 2016 17:11:50 GMT+0800 (CST)
# webpack-multipage v1.0.0

CACHE:
js/8d4976fb.sorting-index.js
css/667ca815.sorting-test.css
css/3eaf22d0.index-index.css

NETWORK:
http://api.map.baidu.com/ * 
http://img.jslite.com/ * 

FALLBACK:
/ /404.html
```

## network

下面的 NETWORK 小节规定文件 "login.php" 永远不会被缓存，且离线时是不可用的，

```
NETWORK:
login.php
http://img.jslite.com/ * 
```

可以使用星号来指示所有其他资源/文件都需要因特网连接，或者你需要让某个地址下的所有请求不缓存这样配置`http://img.jslite.com/ *`，星号前面用空格隔开。

```
NETWORK:
*
```

## fallback

下面的 FALLBACK 小节规定如果无法建立因特网连接，则用 "404.html" 替代 /html5/ 目录中的所有文件：

```
FALLBACK:
/html5/ /404.html
```

注释：第一个 URI 是资源，第二个是替补。

## master

HTML页面引入`cache.manifest`

- 只需要一个页面引入使用缓存配置
- 没引入的页面会自动读取缓存配置


## 更新缓存

一旦应用被缓存，它就会保持缓存直到发生下列情况：

 - 用户清空浏览器缓存
 - manifest 文件被修改
 - 由程序来更新应用缓存


# 说明

如何实现离线访问特性，实现的步骤非常简单，主要3个步骤：  

- 在服务器上添加MIME TYPE支，让服务器能够识别manifest后缀的文件

> AddType text/cache-manifest manifest

- 创建一个后缀名为.manifest的文件，把需要缓存的文件按格式写在里面，并用注释行标注版本

```bash
CACHE MANIFEST
# Time: Sat Jun 04 2016 17:11:50 GMT+0800 (CST)
# webpack-multipage v1.0.0 

CACHE:
Path/to/cache.js
```

- 给 `<html>` 标签加 `manifest` 属性，并引用`manifest`文件

```html
<html manifest="path/to/name-of.manifest">
```

## Apache设置

manifest的mime类型，apache下可以在httpd.conf中加上

```
AddType text/cache-manifest manifest
AddType text/cache-manifest .appcache
```

## 自动缓存的解决方案

在每个页面通过 `iframe`来引用这个静态文件，以达到我们不缓存当面页面，只缓存我们希望缓存文件的目的。

## 缓存导致接口请求没有发送出去

在`NETWORK`设置白名单，但是接口请求如果是`https`有可能导致失败，接口报错信息`Provisional headers are shown`，这个原因是你指定白名单，并且请求是`https`。

```
NETWORK:
https://api.jslite.com/ * 
```

**解决方法：** `NETWORK`白名单设置通配符`*`，如下：

```
NETWORK:
*
```

# Chrome相关调试测试


### 查看cache

可以查看和清除缓存

```
chrome://appcache-internals
```


### 测试

- 打开调试工具 `option+command+i` 选择 `Network` ，工具栏选择`Offline`  
- 地址栏打开网址`chrome://flags/#show-saved-copy`

```bash
# 设置下面选项
# Enable: Primary
```

# 参考资料

- [node.js-api](https://github.com/webpack/docs/wiki/node.js-api)
- [w3 offline webapps](https://www.w3.org/TR/offline-webapps/#offline)
- [w3 offline](https://dev.w3.org/html5/pf-summary/offline.html)
- [mozilla 使用应用缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Using_the_application_cache)
- [HTML5离线存储 初探](http://www.cnblogs.com/chyingp/archive/2012/12/01/explore_html5_cache.html)
- [how to write a plugin](https://webpack.github.io/docs/how-to-write-a-plugin.html)
- [the compiler instance](https://webpack.github.io/docs/plugins.html#the-compiler-instance)
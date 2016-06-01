# webpack-manifest

[![](https://jaywcjlove.github.io/sb/ico/npm.svg)](https://www.npmjs.com/package/webpack-manifest) 

这个是`webpack`插件，主要是给HTML文件的`<html>`标签，插入`manifest`属性，生成`manifest`文件。

如何实现离线访问特性，实现的步骤非常简单，主要3个步骤：  

- 在服务器上添加MIME TYPE支，让服务器能够识别manifest后缀的文件

> AddType text/cache-manifest manifest

- 创建一个后缀名为.manifest的文件，把需要缓存的文件按格式写在里面，并用注释行标注版本

```bash
CACHE MANIFEST
# 直接缓存的文件
CACHE:
Path/to/cache.js
# version：2012-03-20
```

- 给 `<html>` 标签加 `manifest` 属性，并引用`manifest`文件

```html
<html manifest=”path/to/name-of.manifest”>
```

# 安装

```bash
$ npm i webpack-manifest --save-dev
```

# 使用

```js
new Manifest({
    filename:'app.manifest',
    network:["*"],
    fallback:{
        "/html5/":"/404.html"
    },
    //ext:'*'
    ext:'.jpg|.png|.gif|.ps|.jpeg'
});
```

## network

下面的 NETWORK 小节规定文件 "login.php" 永远不会被缓存，且离线时是不可用的：

```
NETWORK:
login.php
```

可以使用星号来指示所有其他资源/文件都需要因特网连接：

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

## ext

`.jpg|.gif`

选择一些后缀的文件进行缓存

## 更新缓存

一旦应用被缓存，它就会保持缓存直到发生下列情况：

 - 用户清空浏览器缓存
 - manifest 文件被修改（参阅下面的提示）
 - 由程序来更新应用缓存


## 实例 

完整的 Manifest 文件  
以 `#` 开头的是注释行，但也可满足其他用途。  

```
CACHE MANIFEST
# 2012-02-21 v1.0.0
/theme.css
/logo.gif
/main.js

NETWORK:
login.asp

FALLBACK:
/html5/ /404.html
```


# 参考资料

- [mozilla 使用应用缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Using_the_application_cache)
- [HTML5离线存储 初探](http://www.cnblogs.com/chyingp/archive/2012/12/01/explore_html5_cache.html)
- [how to write a plugin](https://webpack.github.io/docs/how-to-write-a-plugin.html)
- [the compiler instance](https://webpack.github.io/docs/plugins.html#the-compiler-instance)
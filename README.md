# 前言
2020 年的第一篇文章，技术源于生活，作为码农，我觉得最得意的事情大概就是解决一个真实可见的问题了。前段时间我在团队做分享的时候，订了一个比较大的培训室，电脑里的远，所以就需要翻页笔了，而奈何年关将近，口袋吃紧，不舍得买，所以决定自己开发一个。  

怎么开发呢？因为我当时的 ppt 写在了[slides.com](https://slides.com/qingxinzheng/talking-about-fe-performance)上，最先想到的就是搞个 chrome 插件吧。所以，这篇文章会记录“翻页笔”插件的实现，及 chrome 插件的简单介绍。

# Chrome 插件介绍
首先这部分内容作为对于 Chrome 插件的简单介绍，不会涉及到 API 等细节的层面。主要介绍下面几方面：
1. chrome插件组成部分
2. API模块简介
3. 开发及调试

## 主要组成部分
介绍 chrome 插件都有哪些能力之前，我们首先要了解 chrome 插件的组成：
* Background Scripts
* UI Elements
* Popup.html
* Options.html
* Content Scripts
* Manifest.json

### Background Scripts
Background Scripts 我们可以理解成它是伴随着浏览器运行的，主要处理插件相关的事件，比如：
* 插件第一次安装或者更新
* 监听 popup 中或者 content scripts 中的消息

### UI Elements
插件能让用户看到的地方，都算是UI Elements，比如右上角的Logo，右键菜单，点击 Logo 提供的弹窗页面等。我们通过 Chrome 提供的 API，能够控制它们的展现形式，比如：
* 为 Logo 添加一个标记  
    ![](https://fe.firstleap.cn/staticBed/59590541201238121578305946781.png)
* 根据当前页面是否可用，置灰图标  
    ![](https://fe.firstleap.cn/staticBed/89093308818598181578306322534.png)
* 设置不同大小的图标
* Tooltip  
    ![](https://fe.firstleap.cn/staticBed/81745994047506111578306923834.png?x-oss-process=image/resize,p_50)
* 右键菜单  
    ![](https://fe.firstleap.cn/staticBed/94612263872550511578306988869.png?x-oss-process=image/resize,p_50)
* Popup（下面会介绍）  
    ![](https://fe.firstleap.cn/staticBed/70997891109043091578307183585.png?x-oss-process=image/resize,p_50)

### Popup.html
如上面那张图，实际点击每个插件显示出的弹窗，都是一个 html 文件，它和普通的 html 没什么区别，我们同样可以写样式，引用 js 处理逻辑等。页面中可以与`Background Scripts`相互通信：  
![](https://fe.firstleap.cn/staticBed/44409050805176011578361777007.png)


### Content Scripts
Content Scripts 是指要注入到页面中运行的js，我们可以在这里写一些插件功能，比如操作dom，连接 websocket 等。同样，`content scripts` 是可以与`background scripts`，`popup.js`相互通信：
![](https://fe.firstleap.cn/staticBed/493181511197428261578363891629.png)

### Options.html
这个页面提供一些插件的配置信息，同样是个普通的html，具体需要用户配置哪些，需要我们自己去实现。这个页面的入口：`chrome://extensions/` -> 找到相应插件 -> 扩展程序选项。

### Manifest.json
以上说了几个重点的组成部分，那么浏览器需要知道我们的脚本文件在哪里，以及其他的一些配置信息，这就需要我们提供个`menifest.json`配置文件了，浏览器提供给我们的配置信息有很多，引用 chrome 官网的示例，大家用到哪个可以去[去查询](https://developer.chrome.com/extensions/manifest)。
```
{
  // Required
  "manifest_version": 2,
  "name": "My Extension",
  "version": "versionString",

  // Recommended
  "default_locale": "en",
  "description": "A plain text description",
  "icons": {...},

  // Pick one (or none)
  "browser_action": {...},
  "page_action": {...},

  // Optional
  "action": ...,
  "author": ...,
  "automation": ...,
  "background": {
    // Recommended
    "persistent": false,
    // Optional
    "service_worker":
  },
  "chrome_settings_overrides": {...},
  "chrome_ui_overrides": {
    "bookmarks_ui": {
      "remove_bookmark_shortcut": true,
      "remove_button": true
    }
  },
  "chrome_url_overrides": {...},
  "commands": {...},
  "content_capabilities": ...,
  "content_scripts": [{...}],
  "content_security_policy": "policyString",
  "converted_from_user_script": ...,
  "current_locale": ...,
  "declarative_net_request": ...,
  "devtools_page": "devtools.html",
  "event_rules": [{...}],
  "externally_connectable": {
    "matches": ["*://*.example.com/*"]
  },
  "file_browser_handlers": [...],
  "file_system_provider_capabilities": {
    "configurable": true,
    "multiple_mounts": true,
    "source": "network"
  },
  "homepage_url": "http://path/to/homepage",
  "import": [{"id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],
  "incognito": "spanning, split, or not_allowed",
  "input_components": ...,
  "key": "publicKey",
  "minimum_chrome_version": "versionString",
  "nacl_modules": [...],
  "oauth2": ...,
  "offline_enabled": true,
  "omnibox": {
    "keyword": "aString"
  },
  "optional_permissions": ["tabs"],
  "options_page": "options.html",
  "options_ui": {
    "chrome_style": true,
    "page": "options.html"
  },
  "permissions": ["tabs"],
  "platforms": ...,
  "replacement_web_app": ...,
  "requirements": {...},
  "sandbox": [...],
  "short_name": "Short Name",
  "signature": ...,
  "spellcheck": ...,
  "storage": {
    "managed_schema": "schema.json"
  },
  "system_indicator": ...,
  "tts_engine": {...},
  "update_url": "http://path/to/updateInfo.xml",
  "version_name": "aString",
  "web_accessible_resources": [...]
}
```

## API模块
以上介绍了 chrome 插件的几个重要的组成部分，相信大家大致知道了哪些代码要到哪里写，那么回归到主题，想要了解 chrome 插件都能做什么，最简单的方式就是看它提供的API，下面我大致列出重要模块：
* accessibilityFeatures：调用chrome提供的无障碍功能，比如放大器，语音等。
* alarms：消息通知相关。
* bookmarks：书签相关。
* browserAction：插件图标相关。
* browsingData：浏览器数据处理，比如定期清除 cookie 等本地数据。
* certificateProvider：证书相关。
* commands：快捷键相关。
* contentSettings：定制化浏览器设置，比如针对某个网站禁用cookie。
* contextMenus：处理浏览器右键菜单。
* cookies：cookie相关，比如修改或监听变化等。
* debugger：定制chrome调试。
* declarativeContent：定制插件可用状态
* devtools：开发者工具相关
* downloads：chrome下载相关
* storage：插件本地数据
* tabs：浏览器tab相关
* tts/ttsEngine：语音引擎
* vpnProvider：VPN相关
* webRequest：网络请求相关
* system.memory/system.cpu/system.storage：设备内存，cpu，硬盘等信息
* ... ...

以上列出了部分重要的API，更详细内容请参考[https://developer.chrome.com/extensions/api_index#stable_apis](https://developer.chrome.com/extensions/api_index#stable_apis)。通过API的这些功能，我们大致了解到了chrome插件都能做哪些事情了，我们可以利用插件去提供更强大的功能，开发好的插件，我们可以通过三种方式去安装：
1. 发布到 chrome 商店，当然，这种方式国内大多数用户是访问不到的
2. 打包成`.crx`文件
3. 直接导入源码文件夹  

后两种方式用户都需要手动安装，具体步骤如下：
1. 打开一个新的浏览器tab，在地址栏输入：`chrome://extensions`
2. 打开右上角的开发者模式
![](https://fe.firstleap.cn/staticBed/063216834017719491578368885041.png?x-oss-process=image/resize,p_50)
3. 直接拖入`.crx`文件，或者点击左上角"加载已解压的扩展程序"导入插件源码文件夹。

## 开发及调试
相信大家看了上面的内容可以了解到，其实插件开发是很简单的，用我们熟悉的 html，css，javascript 就可以解决，只需要写出上面介绍的几个组件：background scripts，content scritps，popup.html，options.html，然后在提供一份 Manifest.json 的配置文件就可以了。  

对于这种通用的项目结构，肯定会有一个通用的代码模板了，[在这里](https://github.com/EmailThis/extension-boilerplate)提供了一个可以跨浏览器的插件开发模板，我们 clone 下来直接在里面开发就可以了。  

插件调试稍微麻烦些，对于`background scripts`,`popup.html`,`content scripts`我们要分别以三个不同的方式调试。
* background scripts：我们需要在插件管理页面(`chrome://extensions`)，点击对应插件的“背景图”按钮，弹出我们熟悉的开发者工具，如图：  
    ![](https://fe.firstleap.cn/staticBed/80504089586844431578385459634.png?x-oss-process=image/resize,p_50)
* popup.html：在弹窗上点击右键->检查即可，如图：  
    ![](https://fe.firstleap.cn/staticBed/068237543480237141578385778481.png?x-oss-process=image/resize,p_50)
* content scritps：因为 `content scritps` 是注入到页面中的，所以我们可以任意打开一个页面，然后打开开发者工具即可。

# 翻页笔插件开发(flip-pen)
以上简单介绍了chrome插件的几个概念，以及开发及调试方式，相信大家已经有了一个简单的认识，那么我们回过头考虑，要实现翻页笔这个插件，都需要考虑什么？其实也非常好实现，首先需要确定的是，翻页需要即时通信，所以我们就需要用到websocket，那么我们思考一下这个流程：

1. 用户点击插件Logo
2. 当前页面建立 websocket 连接，通知服务端要新建一个一对一连接
3. 服务端生成唯一的 socketId 并记录，同时在 content scripts 中也可以获取到socketId，生成带有 socketId 参数链接，发送给 popup.html
4. popup.html 接收消息，将接收到的 url 生成二维码并显示
5. 手机扫码进入遥控器页面，实现发送消息，消息体中要带有链接中的 socketId 参数
6. 服务端收到消息，发送给指定 socketId 的 socket

下面我们一步一步来。

## 实现 websocket 服务，保证一对一连接
这里我们用 node 实现，借助 `socket.io` 很好实现，唯一需要注意的是，我们需要保证一对一连接，以免两个页面互相影响，这里我们定义一个全局变量保存所有的 socket 连接，在 socket 断开连接的时候清除掉。相关代码如下：
```js

var sockets = {};

io.on('connection', function(socket) {
  socket.on('message', function(data) {
    console.log(data);
    if (sockets[data.id]) {
      sockets[data.id].emit('message', data.data);
    }
  });

  // 创建会话
  socket.on('new', () => {
    const id = socket.id;
    sockets[id] = socket;
  });

  // 移除
  socket.on('disconnect', () => {
    const id = socket.id;
    if (sockets[id]) {
      delete sockets[id];
    }
  });
});

```

## 在 content scripts 中实现 websocket
参照上面说的流程，`content scripts`中我们需要实现的功能：
1. 接收从 popup.html 传来的消息，建立 websocket 连接
2. 获取建立成功的 socketId，生成带有 socketId 参数的链接，发送给 popup.html
3. 实现向页面发送上，下，左，右的键盘消息

相关代码如下：
```js
import ext from "./utils/ext";
import io from "socket.io-client";

const conf = {
  up: 38,
  down: 40,
  left: 37,
  right: 39
};
const URL = "https://pen.zhengqingxin.com";
var flipPen = {};
function onRequest(request) {
  if (request.action === "process-page") {
    if (flipPen.socket) {
      chrome.runtime.sendMessage({ url: flipPen.url });
      return;
    }
    var socket = io(URL);
    socket.on("connect", function() {
      // 获取建立成功的 socketId，生成带有 socketId 参数的链接，发送给 popup.html
      socket.emit("new");
      var rcUrl = `${URL}/index.html?id=${socket.id}`;
      chrome.runtime.sendMessage({ url: rcUrl });
      flipPen = {
        url: rcUrl,
        socket
      };
      // 实现向页面发送上，下，左，右的键盘消息
      socket.on("message", function(data) {
        if (data.action) {
          var keyCode = conf[data.action];
          var evt = new KeyboardEvent("keydown", {
            keyCode: keyCode,
            which: keyCode
          });
          document.dispatchEvent(evt);
        }
      });
    });
  }
}
// 接收从 popup.html 传来的消息，建立 websocket 连接
ext.runtime.onMessage.addListener(onRequest);
```
## popup.html 中生成二维码
这里我们需要处理两件事：
1. 给 `content scripts` 发消息
2. 接收回传的链接生成二维码  
相关代码如下：
```js
import ext from "./utils/ext";
import QRCode from "qrcode";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const { url } = message;
  var canvas = document.getElementById("canvas");
  QRCode.toCanvas(canvas, url);
});
ext.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: "process-page" });
});

```

## 遥控器页面
遥控器页面就更简单了，我们只需要建立 websocket 连接，按方向按钮的时候发送对应消息即可，注意要带上接收到的socketId，这样服务端才知道这个遥控器是控制哪个页面的。这里就不列代码了。
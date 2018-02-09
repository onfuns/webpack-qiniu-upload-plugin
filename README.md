
## 安装

```sh
npm install webpack-qiniu-upload-plugin --save-dev
```

## 使用
``` js
const WebpackQiniuUploadPlugin = require('webpack-qiniu-upload-plugin');

//wenpack配置
plugins:[
  new WebpackQiniuUploadPlugin({
    ACCESS_KEY:'',    //七牛ACCESS_KEY
    SECRET_KEY:'',    //七牛SECRET_KEY
    domain:'',        //七牛云（或自定义的）域名 如: http://image.onfuns.com
    bucket:'',        //七牛bucket
    zone:'',          //七牛zone，默认华东   华东:z0 华北:z1 华南:z2 北美:na0 新加坡:as0
    exclude:[],       //排除不需要上传的文件
    refreshCdn:false  //上传完成是否刷新cdn
  })
]
```

## 建议
项目文件过多时，可以使用客户端上传，自己写了个[七牛轻客户端](https://github.com/onfuns/Qload)，可以按自己需求修改编译使用
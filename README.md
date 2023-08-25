# @dreamjser/h5-webpack-cli

脚手架需要配合[@dreamjser/h5-template-generator](https://github.com/dreamjser/h5-template-generator.git)使用，使用无需单独安装

## 执行命令

### cli-create

创建页面命令，通过该命令可以创建页面view和页面的配置文件，配合构建命令可以自动生成路由文件，使用时只需要关注view页面

```
cli-create mb_home/index/index 首页
```

+ 参数一：mb_home/index/index，页面路径，会自动创建如下目录的view文件，必须是三级目录

+ 参数二：首页，页面标题


### cli-dev-s/cli-dev-m/cli-build-s/cli-build-m

`cli-dev-s`单页面应用本地构建

`cli-dev-m` 多页面应用本地构建

`cli-build-s` 单页面应用打包

`cli-build-m` 多页面应用打包

```
cli-dev-s mb_home,mb_login --framework=vue --platform=mobile --env=prod
```



+ 参数：mb_home,mb_login，构建模块，所有模块传all

+ 选项-framework，可选值vue/react，项目所用的框架

+ 选项-platform，可选值mobile/desktop，项目平台

+ 选项-env，项目的环境变量，根据项目文件夹config下的env.xxx.js取值，环境变量可通过全局变量GLOBAL_ENV.xxx获取

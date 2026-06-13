# gvray-vue

基于vue3，vite6，pinia，element-plus等的中后台管理模版，可以快速开展我们的业务功能。

## 适用场景

1. 快速开发中后台管理系统，不必要为技术选型和封装模块而浪费精力和时间，而且不需要其他业务代码。
2. 当很多功能我们需要自己实现，所以这套项目只实现架构部分和用户登陆鉴权。市面功能太多的项目反而不利于我们快速开发。（ 通常我们需要研究很久，还要删除大部分内容。 而且前后端两套项目很难解耦。后面我会实现更多的功能包括配套的后台系统，不会放到这个项目下，会给传送门。）

## 项目基建

### 特性

- [x] 全新vue3组合式风格，让我们的代码更加优雅
- [x] UI 组件库 `element-plus`
- [x] 路由、懒加载、拦截、keepalive 等
- [x] 本地svg 图标管理 `~/assets/icons/svg` 目录下的资源会自动生成图标
- [ ] 支持多环境配置
- [ ] 主题定制和管理
- [ ] 自定义布局 Layout 和菜单
- [ ] 网络请求模块
- [ ] 请求方案
- [ ] 系统异常处理
- [ ] 数据流
- [ ] 国际化(多语言)
- [ ] Mock 本地数据模拟
- [ ] 路由数据加载
- [ ] 本地代理
- [x] 团队项目编码规范自动化。使用`eslint`、`prettier`、`husky`、`lint-staged`进行代码校验和格式化。TODO
      message 验证
- [ ] 工程代码调试
- [ ] 测试
- [ ] 样式管理方案
- [ ] Typescript 全面支持
- [ ] OpenApi
- [ ] 微生成器
- [ ] 开发插件
- [ ] MPA 模式
- [ ] 打包构建优化
- [ ] 生产环境部署
- [ ] 微前端
- [ ] 站点统计
- [ ] 首页白屏优化
- [ ] browserslist

### 业务功能

- [ ] 用户登录鉴权
- [ ] 权限管理
- [ ] 仪表盘
- [ ] 用户管理
- [ ] 角色管理
- [ ] 菜单管理
- [ ] 系统设置
- [ ] 操作日志
- [ ] 消息通知

## 开发环境

pnpm

node

vscode

## 其他技术栈

- #[gvray-react](https://github.com/gvray/gvray-react)
- #[gvray-vite](https://github.com/gvray/gvray-vite) 开发中
- #[gvray-next](https://github.com/gvray/next-admin) 开发中
- #[gvray-admin](https://github.com/gvray/gvray-admin)

## 后台数据

- 目前后台数据都在`~/mock`下，这里是基于 express 启动的本地 api 服务。
- 这样就可以很灵活的做好前端部分，然后灵活的对接一个后端服务。

## 启动项目

```bash
pnpm install

pnpm dev
```

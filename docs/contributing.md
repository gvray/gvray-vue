# 贡献指南（Contributing Guide）

感谢你对 Gvray Vue
Admin 的关注与贡献！本文档说明如何参与项目开发、提交代码和报告问题。

---

## 1. 行为准则

- 尊重每一位贡献者，保持友善、专业的沟通态度
- 提交前充分测试，确保不引入新的问题
- 遵循项目已有的代码风格和架构规范

---

## 2. 参与方式

### 2.1 报告 Bug

1. 在 [Issues](https://github.com/gvray/gvray-vue/issues) 中搜索是否已有相同问题
2. 如果没有，创建新 Issue，请包含：
   - **环境信息**：Node.js 版本、pnpm 版本、浏览器、操作系统
   - **复现步骤**：清晰的操作步骤
   - **期望行为**：你认为应该发生什么
   - **实际行为**：实际发生了什么
   - **截图 / 日志**：如有，请附上控制台报错或截图

### 2.2 功能建议

1. 在 Issues 中创建 Feature Request
2. 描述功能的使用场景和预期效果
3. 如果可能，提供参考实现或设计方案

### 2.3 提交代码

请通过 Pull Request 提交代码，流程见下方。

---

## 3. 开发流程

### 3.1 环境要求

| 工具    | 版本要求                  | 说明                           |
| ------- | ------------------------- | ------------------------------ |
| Node.js | `^20.19.0` 或 `>=22.12.0` | 见 `package.json` 的 `engines` |
| pnpm    | 最新版                    | 推荐使用 Corepack 启用         |

> 💡 建议通过 `corepack enable` 启用 pnpm，避免使用 npm 或 yarn。

### 3.2 Fork & Clone

```bash
# Fork 项目到你的 GitHub 账号，然后克隆
git clone https://github.com/<your-username>/gvray-vue.git
cd gvray-vue

# 启用 pnpm（如尚未启用）
corepack enable

# 安装依赖
pnpm install
```

### 3.3 创建分支

从 `main` 分支创建功能分支：

```bash
git checkout -b feat/your-feature-name
```

分支命名规范：

| 前缀        | 用途      | 示例                     |
| ----------- | --------- | ------------------------ |
| `feat/`     | 新功能    | `feat/user-export`       |
| `fix/`      | Bug 修复  | `fix/login-redirect`     |
| `refactor/` | 重构      | `refactor/request-layer` |
| `docs/`     | 文档更新  | `docs/developer-guide`   |
| `style/`    | 样式调整  | `style/profile-layout`   |
| `chore/`    | 构建/工具 | `chore/upgrade-element`  |
| `test/`     | 测试      | `test/auth-service`      |

### 3.4 开发与测试

```bash
# 启动开发服务器（默认 dev 环境，内置 Mock 数据）
pnpm dev

# 测试环境（连接 gvray-admin 后端）
pnpm dev:staging

# 生产环境配置预览
pnpm dev:prod

# 构建所有环境
pnpm build

# 或按环境单独构建
pnpm build:dev      # 开发环境
pnpm build:staging  # 测试环境
pnpm build:prod     # 生产环境

# 通过 OpenAPI 同步接口 TypeScript 类型
pnpm gen:api

# 代码检查
pnpm lint

# 代码检查并自动修复
pnpm lint:fix

# 格式化 JSON / Markdown / YAML 文件
pnpm format
```

### 3.5 提交代码

项目使用 **Husky** + **lint-staged** 在 Git 提交时自动执行代码检查。

#### 提交时自动执行的检查（pre-commit）

`.husky/pre-commit` 会运行 `lint-staged`，对暂存文件按类型执行：

| 文件类型                        | 执行命令           |
| ------------------------------- | ------------------ |
| `*.{js,jsx,ts,tsx,vue}`         | `eslint --fix`     |
| `*.{scss,css,html,json,md,yml}` | `prettier --write` |

即：JS / TS /
Vue 文件会被 ESLint 自动修复；样式 / 配置 / 文档文件会被 Prettier 自动格式化。若检查失败，提交将被中断。

#### Commit Message 规范（建议）

> ⚠️
> **说明**：本项目当前**未配置 commitlint**，以下规范为**建议遵循**，不作强制校验。

推荐采用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>
```

**type 类型**：

| type       | 说明                     |
| ---------- | ------------------------ |
| `feat`     | 新功能                   |
| `fix`      | Bug 修复                 |
| `docs`     | 文档变更                 |
| `style`    | 代码格式（不影响逻辑）   |
| `refactor` | 重构（非新功能、非修复） |
| `perf`     | 性能优化                 |
| `test`     | 测试相关                 |
| `chore`    | 构建工具或辅助工具变动   |
| `ci`       | CI/CD 配置变更           |
| `revert`   | 回滚提交                 |

**scope（可选）**：影响范围，如
`auth`、`user`、`layout`、`request`、`theme`、`i18n` 等。

**示例**：

```bash
git commit -m "feat(user): add avatar upload with crop"
git commit -m "fix(layout): sidebar collapse flicker"
git commit -m "docs: update contributing guide"
git commit -m "refactor(request): migrate to @gvray/request v1.2"
git commit -m "chore: upgrade element-plus to 2.9.7"
```

### 3.6 推送与 PR

```bash
git push origin feat/your-feature-name
```

在 GitHub 上创建 Pull Request：

1. **标题**：遵循 Commit Message 规范
2. **描述**：说明改动内容、动机和影响范围
3. **关联 Issue**：如有，使用 `Closes #123` 关联
4. **截图**：UI 变更请附上前后对比截图

---

## 4. 代码规范

### 4.1 TypeScript

- 全面使用 TypeScript，项目允许在必要场景使用 `any`（见 ESLint 规则
  `@typescript-eslint/no-explicit-any: off`），但建议加注释说明
- 组件 Props 使用 `interface` 或 `defineProps<>()` 定义
- API 响应类型可通过 `pnpm gen:api` 由 OpenAPI 自动生成，避免手写

### 4.2 ESLint

项目采用 **ESLint 9 Flat Config**（`eslint.config.js`），集成以下能力：

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-vue` flat/recommended
- `@stylistic/eslint-plugin`（代码风格：2 空格缩进、单引号、无分号、JSX 保留、1tbs 花括号、箭头函数参数总是带括号）
- `eslint-plugin-prettier`（与 Prettier 配置合并）

关键规则：

| 规则                                         | 级别  | 说明                             |
| -------------------------------------------- | ----- | -------------------------------- |
| `no-console`                                 | warn  | 避免遗留 console                 |
| `vue/no-mutating-props`                      | error | 禁止修改 Props（浅层）           |
| `@typescript-eslint/no-unused-vars`          | warn  | 清理未使用变量                   |
| `@typescript-eslint/consistent-type-imports` | error | 统一使用 `import type`，内联风格 |
| `prefer-const`                               | warn  | 优先使用 const                   |

```bash
pnpm lint       # 检查
pnpm lint:fix   # 自动修复
```

> 📁 ESLint 忽略目录：`node_modules`、`dist`、`html`、`mock`、`types`、`public`

### 4.3 Prettier

统一代码格式化，配置见 `prettier.config.js`：

| 选项            | 值       |
| --------------- | -------- |
| `singleQuote`   | `true`   |
| `semi`          | `false`  |
| `printWidth`    | `80`     |
| `tabWidth`      | `2`      |
| `trailingComma` | `all`    |
| `arrowParens`   | `always` |
| `endOfLine`     | `lf`     |
| `proseWrap`     | `always` |

```bash
pnpm format    # 格式化 JSON / Markdown / YAML 文件
```

> 💡 `.vue` / `.ts` / `.tsx` 等代码文件的格式化由 ESLint（集成 Prettier）在
> `pnpm lint:fix` 或提交时由 lint-staged 自动完成。

### 4.4 样式规范

- 全局样式使用 SCSS，变量统一放 `src/assets/styles/variables.scss`
- 组件样式使用 `<style lang="scss" scoped>` 或 `<style module>`
- 避免内联样式，除非是动态计算值
- 颜色、间距等使用主题变量，不硬编码

### 4.5 文件组织

- 公共组件放 `src/components/`，目录命名为 `ComponentName/index.vue`
- 组合式函数放 `src/composables/`
- 指令放 `src/directive/`
- 页面视图放 `src/views/`，按业务模块组织
- Store 放 `src/stores/`
- 工具函数放 `src/utils/`
- 常量放 `src/constants/`

---

## 5. PR 审查标准

PR 合并前需满足：

- [ ] ESLint 检查通过（`pnpm lint` 无错误）
- [ ] 项目可正常构建（`pnpm build` 无错误）
- [ ] 不引入新的 `console.log`（调试用途除外）
- [ ] 新增页面已在路由配置中注册
- [ ] 新增 API 已封装，类型完整
- [ ] UI 变更附有截图
- [ ] Commit Message 符合规范（建议）

---

## 6. 发布流程

项目维护者负责版本发布：

1. 合并所有待发布 PR 到 `main`
2. 更新版本号
3. 执行构建验证：`pnpm build`
4. 打 Tag 并推送
5. 部署到对应环境

---

## 7. 常见问题

### Q: 安装依赖报错？

确保使用 pnpm（不要用 npm 或 yarn）：

```bash
corepack enable
pnpm install
```

### Q: 如何添加新的环境变量？

1. 在 `.env.dev` / `.env.staging` / `.env.prod` 中设置实际值
2. 若需注入全局常量，在 `vite.config.ts` 的 `define` 中映射
3. 在 `src/types/` 中补充类型声明

### Q: 如何添加新的公共组件？

1. 在 `src/components/` 下创建组件目录，如 `MyComponent/index.vue`
2. 使用 TypeScript 定义 Props（`defineProps<{}>()`）
3. 若组件需全局注册，在 `src/main.ts` 中引入

### Q: 如何同步后端接口类型？

```bash
pnpm gen:api   # 通过 OpenAPI 自动生成 TypeScript 类型
```

详见 `scripts/gen-api-types.ts`。

---

## 8. 联系方式

- **GitHub
  Issues**：[gvray/gvray-vue/issues](https://github.com/gvray/gvray-vue/issues)
- **作者**：Gavin Ray <gavinbirkhoff@gmail.com>
- **License**：MIT

感谢你的贡献！

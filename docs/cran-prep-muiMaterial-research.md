# muiMaterial 工程化研究 — CRAN 准备参考

> 来源：https://github.com/lgnbhl/muiMaterial（v0.2.0）
> 目的：为 shinyAntDesignX 的 CRAN 提交做准备，研究包体积控制和工程实践

---

## 架构前提差异

muiMaterial 基于 `shiny.react`（Appsilon），**不是 htmlwidgets**。这影响了大量工程选择：

| 方面 | muiMaterial | shinyAntDesignX |
|------|-------------|-----------------|
| 组件注册 | `window.jsmodule["@/muiMaterial"]` | `HTMLWidgets.widget()` |
| 依赖声明 | R 函数内 `htmltools::htmlDependency()` | `.yaml` 文件 |
| React 来源 | shiny.react 包提供，不打入包内 | 我们自己的 UMD lib |
| CSS | CSS-in-JS (Emotion)，无 `.css` 文件 | antd 有大量 CSS 文件 |
| 构建工具 | Webpack 5 | Vite 6 |
| 入口数量 | 单一入口 (`js/src/index.js`) | 每个 widget 独立入口 |

---

## 包体积控制

### 关键数字

- `inst/www/muiMaterial/mui-material.js`：约 **580 KB**（含 @mui/material、@mui/lab、@emotion/react、@emotion/styled）
- `inst/` 下**只有 2 个文件**：JS 文件 + LICENSE 文本
- 整个 `js/` 目录（webpack 配置、源码、node_modules）被 `.Rbuildignore` 排除

### Externals 策略

```js
// webpack.config.js
externals: {
  react: 'jsmodule["react"]',
  'react-dom': 'jsmodule["react-dom"]',
  '@/shiny.react': 'jsmodule["@/shiny.react"]',
},
```

React (~130 KB) 由 shiny.react 提供，不打入包内。我们已对标：react/react-dom 作为 UMD external。

### 性能预算（防止包体积悄悄膨胀）

```js
performance: {
  maxAssetSize: 2097152,       // 2 MiB
  maxEntrypointSize: 2097152,  // 2 MiB
}
```

Vite 等价配置：`build: { chunkSizeWarningLimit: 2048 }`（单位 KB）。

---

## .Rbuildignore 关键条目

```
^js$                          # 整个 JS 源码目录（含 node_modules）—— 最重要
^\.github$
^\.claude$
^dev$
^inst/helpers$
^cran-comments\.md$
^reinstall.sh$
^inst/examples/*/manifest\.json$   # rsconnect 清单文件
```

**对 shinyAntDesignX 的直接行动**：
- 确保 `^srcjs$`、`^node_modules$`、`^\.nvm$` 等全部在 `.Rbuildignore` 里
- CRAN tarball 里只保留 `inst/www/` 下的预构建文件

---

## LICENSE 合规（CRAN 硬性要求）

### muiMaterial 方案

使用 `license-webpack-plugin` 自动从 node_modules 提取所有第三方 LICENSE，生成 `inst/www/muiMaterial/mui-material.js.LICENSE.txt`。

```js
new LicenseWebpackPlugin({
  outputFilename: 'mui-material.js.LICENSE.txt',
  additionalModules: ['@mui/material', '@mui/system', '@mui/utils', '@mui/lab']
})
```

### DESCRIPTION `Authors@R` 的 cph 写法

```r
person(family = "MUI", role = "cph",
  comment = "Copyright holder of '@mui/material', '@mui/lab'")
person(family = "Emotion team", role = "cph",
  comment = "Copyright holder of '@emotion/react' and '@emotion/styled'")
person(family = "Meta Platforms, Inc. and affiliates", role = "cph",
  comment = "Copyright holder of 'react-is'; react/react-dom are peer deps")
```

注意：React 本身不作为 `cph`，因为它由外部包（shiny.react）提供。

**对 shinyAntDesignX 的 cph 补充清单**（待补）：
- Ant Design / Alibaba（antd、@ant-design/x、@ant-design/icons）
- Meta Platforms（React、React-DOM）
- highlight.js contributors
- PrismJS contributors（react-syntax-highlighter + refractor）
- mermaid contributors

### Vite 等价方案

使用 `vite-plugin-license`：

```bash
npm install vite-plugin-license --save-dev
```

```ts
// vite.config.ts
import license from 'vite-plugin-license';
plugins: [react(), license({ outputFilename: 'LICENSES.txt' })]
```

---

## 组件工厂模式（R 层）

muiMaterial 用工厂函数消除 100+ 组件的重复代码：

```r
# R/aaa-utils.R
component <- function(name, module = "@mui/material") {
  function(...) muiElement(name, module, shiny.react::asProps(...))
}

# R/components.R —— 每个组件一行
Box           <- component('Box')
Autocomplete  <- component('AutocompleteStatic', module = '@/muiMaterial')
```

shinyAntDesignX 目前每个 widget 都有独立 R 文件，结构更复杂（有状态 server 函数），不完全适用，但简单展示类 widget 可借鉴。

---

## CRAN 提交 checklist（对 shinyAntDesignX）

| 项目 | 状态 | 说明 |
|------|------|------|
| `.Rbuildignore` 排除 `srcjs/` | ❓ 待核查 | 确保 node_modules 不进 tarball |
| `DESCRIPTION Authors@R` 补 `cph` | ❌ 缺失 | 所有打包 JS 的版权方都要列 |
| 生成 LICENSE 文件 | ❌ 缺失 | 每个 `inst/www/*.js` 对应的 LICENSE |
| `inst/www/` 只含预构建文件 | ✅ | 已是 IIFE 预构建 |
| R CMD CHECK 0 errors 0 warnings | ❓ 待验证 | |
| `cran-comments.md` | ❌ 缺失 | CRAN 提交标准文件 |
| NEWS.md | ❌ 缺失 | CRAN 推荐 |
| 所有导出函数有 `@export` + `@param` | ❓ 待核查 | |
| Suggests 里的包用 `requireNamespace()` 守护 | ❓ 待核查 | |

---

## 总结：最高优先级行动

1. **`.Rbuildignore`**：`^srcjs$`、`^node_modules$`、`^build-all\.js$`、`^vite\.config\.ts$`、`^package\.json$`、`^package-lock\.json$`、`^tsconfig\.json$` 全部排除
2. **LICENSE 合规**：`vite-plugin-license` 自动生成 + `DESCRIPTION` 补 `cph`
3. **R CMD CHECK**：跑一次看当前有多少 notes/warnings
4. **包大小评估**：`R CMD build . && ls -lh *.tar.gz`

这些是上 CRAN 的硬性门槛，muiMaterial 的 0 errors/0 warnings/0 notes 成绩证明该路径可行。

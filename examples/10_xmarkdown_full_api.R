library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── Demo：xmarkdown widget 完整 API 测试 ──────────────────────────────────────
#
# 覆盖本次新增的所有 props：
#   - streaming（布尔简写 vs 完整对象：hasNextChunk / enableAnimation /
#               animationConfig / tail / incompleteMarkdownComponentMap）
#   - className / rootClassName / style
#   - paragraphTag
#   - dompurifyConfig
#   - protectCustomTagNewlines
#   - escapeRawHtml
#   - debug
#
# 架构：左侧控制面板（参数实时调节），右侧预览区（实时 render）。

SAMPLE_MD <- "# XMarkdown 完整 API 测试

这是一段普通段落，包含 **粗体**、*斜体*、`inline code`。

## 代码块

```r
library(shiny)
shiny::runApp()
```

## 列表

- React 18
- Ant Design X
- shinyAntDesignX

## 链接与图片

[GitHub](https://github.com/ant-design/x) 链接测试。

## 表格

| 参数 | 类型 | 说明 |
|------|------|------|
| streaming | logical/list | 流式控制 |
| className | character | CSS 类名 |
| debug | logical | 性能浮层 |

## 内嵌 HTML

<b>粗体 HTML</b>，<em>斜体 HTML</em>，<script>alert('xss')</script>（应被 DOMPurify 净化）。
"

STREAMING_CONTENT <- paste0(
  "# 流式渲染测试\n\n",
  "正在输入中... 请观察末尾光标（tail）和淡入动画。\n\n",
  "```python\nimport anthropic\nclient = anthropic.Anthropic()\n```\n\n",
  "- 第一条\n- 第二条\n- **第三条**（最后）\n"
)

ui <- page_fillable(
  padding = 16,
  tags$style(HTML("
    .ctrl-label { font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 2px; }
    .ctrl-section { margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; }
    .badge-on  { background: #d1fae5; color: #065f46; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
    .badge-off { background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
  ")),
  layout_columns(
    col_widths = c(3, 9),

    # ── 左：控制面板 ──────────────────────────────────────────────────────────
    card(
      height = "95vh",
      card_header("参数控制"),
      card_body(
        overflow_y = "auto",

        # streaming ──────────────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "streaming 模式"),
          selectInput("streaming_mode", NULL,
            choices = c(
              "FALSE（无流式）"         = "false",
              "TRUE（布尔简写）"         = "true",
              "完整对象：无动画"         = "obj_none",
              "完整对象：动画开"         = "obj_anim",
              "完整对象：tail=TRUE"      = "obj_tail",
              "完整对象：tail 自定义"    = "obj_tail_custom",
              "完整对象：hasNextChunk=F" = "obj_done"
            ),
            selected = "false", width = "100%"
          )
        ),

        # components presets ──────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "components 预设"),
          checkboxInput("preset_codeblock",  "code → CodeBlock（语言标签 + 复制按钮）", value = FALSE),
          checkboxInput("preset_inlinecode", "code → InlineCode（antd Typography.Text）", value = FALSE),
          checkboxInput("preset_externallink", "a → ExternalLink（↗ 图标 + 新标签）",    value = FALSE),
          tags$small("注：CodeBlock 与 InlineCode 同映射 'code'，只能选一个", style = "color:#9ca3af;font-size:10px;")
        ),

        # style ──────────────────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "style / className"),
          checkboxInput("use_style",      "style（fontSize=15px, color=#1e40af）", value = FALSE),
          checkboxInput("use_classname",  "className=\"custom-md\"",                value = FALSE),
          checkboxInput("use_root_class", "rootClassName=\"root-md\"",              value = FALSE)
        ),

        # paragraphTag ────────────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "paragraphTag"),
          radioButtons("paragraph_tag", NULL,
            choices  = c("p（默认）" = "p", "div" = "div", "span" = "span"),
            selected = "p", inline = TRUE
          )
        ),

        # security ────────────────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "安全 / HTML 处理"),
          checkboxInput("escape_raw_html",  "escapeRawHtml（原始 HTML → 纯文本）", value = FALSE),
          checkboxInput("use_dompurify",    "dompurifyConfig（只允许 b/i/em）",    value = FALSE),
          checkboxInput("protect_newlines", "protectCustomTagNewlines",            value = FALSE)
        ),

        # debug ───────────────────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "debug"),
          checkboxInput("debug", "debug（性能浮层）", value = FALSE)
        ),

        # openLinksInNewTab ───────────────────────────────────────────────────
        div(class = "ctrl-section",
          div(class = "ctrl-label", "链接"),
          checkboxInput("open_links", "openLinksInNewTab", value = FALSE)
        ),

        hr(),
        p("内容切换：", style = "font-size:11px;font-weight:600;"),
        radioButtons("content_type", NULL,
          choices  = c("标准 Markdown" = "standard", "流式内容（含代码块）" = "streaming"),
          selected = "standard", inline = FALSE
        )
      )
    ),

    # ── 右：预览 + 参数摘要 ────────────────────────────────────────────────────
    layout_columns(
      col_widths = 12, row_heights = c("auto", 1),
      card(
        card_header("参数摘要"),
        card_body(
          max_height = "80px", overflow_y = "auto",
          verbatimTextOutput("params_summary", placeholder = FALSE)
        )
      ),
      card(
        height = "85vh",
        card_header("XMarkdown 预览"),
        card_body(
          fillable = FALSE, overflow_y = "auto",
          # 注入演示用 CSS（验证 className/rootClassName 生效）
          tags$style(HTML("
            .custom-md   { border-left: 3px solid #3b82f6; padding-left: 12px; }
            .root-md     { background: #fafafa; border-radius: 8px; padding: 8px; }
          ")),
          antDesignXMarkdownOutput("md_out", height = "auto")
        )
      )
    )
  )
)

server <- function(input, output, session) {

  streaming_val <- reactive({
    switch(input$streaming_mode,
      "false"          = FALSE,
      "true"           = TRUE,
      "obj_none"       = list(hasNextChunk = TRUE,  enableAnimation = FALSE),
      "obj_anim"       = list(hasNextChunk = TRUE,  enableAnimation = TRUE,
                              animationConfig = list(fadeDuration = 400, easing = "ease-in")),
      "obj_tail"       = list(hasNextChunk = TRUE,  enableAnimation = TRUE,
                              tail = TRUE),
      "obj_tail_custom"= list(hasNextChunk = TRUE,  enableAnimation = TRUE,
                              tail = list(content = "◼")),
      "obj_done"       = list(hasNextChunk = FALSE, enableAnimation = TRUE),
      FALSE
    )
  })

  content_val <- reactive({
    if (input$content_type == "streaming") STREAMING_CONTENT else SAMPLE_MD
  })

  style_val <- reactive({
    if (input$use_style) list(fontSize = "15px", color = "#1e40af") else NULL
  })

  dompurify_val <- reactive({
    if (input$use_dompurify) list(ALLOWED_TAGS = list("b", "i", "em", "strong")) else NULL
  })

  components_val <- reactive({
    comps <- list()
    if (input$preset_codeblock)    comps[["code"]] <- "CodeBlock"
    if (input$preset_inlinecode)   comps[["code"]] <- "InlineCode"   # overrides CodeBlock if both checked
    if (input$preset_externallink) comps[["a"]]    <- "ExternalLink"
    if (length(comps) == 0) NULL else comps
  })

  output$md_out <- renderAntDesignXMarkdown({
    list(
      content                  = content_val(),
      streaming                = streaming_val(),
      openLinksInNewTab        = input$open_links,
      className                = if (input$use_classname)  "custom-md" else NULL,
      rootClassName            = if (input$use_root_class) "root-md"   else NULL,
      style                    = style_val(),
      paragraphTag             = input$paragraph_tag,
      dompurifyConfig          = dompurify_val(),
      protectCustomTagNewlines = input$protect_newlines,
      escapeRawHtml            = input$escape_raw_html,
      debug                    = input$debug,
      components               = components_val()
    )
  })

  output$params_summary <- renderPrint({
    streaming <- streaming_val()
    if (isTRUE(streaming)) {
      s_str <- "TRUE（shorthand）"
    } else if (isFALSE(streaming)) {
      s_str <- "FALSE"
    } else {
      s_str <- paste0("list(", paste(names(streaming), unlist(lapply(streaming, as.character)), sep = "=", collapse = ", "), ")")
    }
    cat(
      "streaming        :", s_str, "\n",
      "components       :", if (is.null(components_val())) "NULL" else paste(names(components_val()), unlist(components_val()), sep = "=", collapse = ", "), "\n",
      "className        :", if (input$use_classname)  "\"custom-md\"" else "NULL", "\n",
      "rootClassName    :", if (input$use_root_class) "\"root-md\""   else "NULL", "\n",
      "style            :", if (input$use_style) "list(fontSize=15px, color=#1e40af)" else "NULL", "\n",
      "paragraphTag     :", input$paragraph_tag, "\n",
      "escapeRawHtml    :", input$escape_raw_html, "\n",
      "dompurifyConfig  :", if (input$use_dompurify) "list(ALLOWED_TAGS=[b,i,em,strong])" else "NULL", "\n",
      "protectNewlines  :", input$protect_newlines, "\n",
      "debug            :", input$debug, "\n",
      "openLinksInNewTab:", input$open_links, "\n"
    )
  })
}

shinyApp(ui, server)

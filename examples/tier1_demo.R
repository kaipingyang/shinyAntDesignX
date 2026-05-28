library(shiny)
library(bslib)
devtools::load_all(here::here())

ui <- page_fluid(
  h2("shinyAntDesignX — Tier 1 组件演示"),

  hr(),
  h3("1. XMarkdown — 流式 Markdown 渲染"),
  shinyXMarkdownOutput("md1", height = "auto"),

  hr(),
  h3("2. CodeHighlighter — 代码语法高亮"),
  shinyCodeHighlighterOutput("code1", height = "auto"),

  hr(),
  h3("3. Mermaid — 图表渲染"),
  shinyMermaidOutput("mermaid1", height = "400px"),

  hr(),
  h3("4. ThoughtChain — 工具调用链"),
  shinyThoughtChainOutput("tc1", height = "auto")
)

server <- function(input, output, session) {

  output$md1 <- renderShinyXMarkdown({
    list(
      content = "# Hello from XMarkdown\n\n这是 **Ant Design X** 的流式 Markdown 渲染器。\n\n## 功能\n\n- 支持 **粗体** / _斜体_ / ~~删除线~~\n- 支持 `inline code`\n- 支持代码块：\n\n```r\nx <- rnorm(100)\nhist(x, main = 'Normal Distribution')\n```\n\n- 支持表格：\n\n| 组件 | 类型 | 状态 |\n|------|------|------|\n| XMarkdown | Tier 1 | ✅ 完成 |\n| CodeHighlighter | Tier 1 | ✅ 完成 |\n| Mermaid | Tier 1 | ✅ 完成 |\n| ThoughtChain | Tier 1 | ✅ 完成 |",
      streaming = FALSE
    )
  })

  output$code1 <- renderShinyCodeHighlighter({
    list(
      code = 'library(shinyAntDesignX)\n\n# 渲染一个 ThoughtChain\noutput$tc <- renderShinyThoughtChain({\n  list(items = list(\n    list(key = "1", title = "Web Search",\n         status = "success", icon = "search",\n         content = "Found 42 results")\n  ))\n})',
      lang = "r",
      showHeader = TRUE
    )
  })

  output$mermaid1 <- renderShinyMermaid({
    list(
      diagram = "graph TD\n    A[用户输入] --> B{路由}\n    B --> C[工具调用]\n    B --> D[直接回复]\n    C --> E[ThoughtChain 展示]\n    E --> D\n    D --> F[XMarkdown 渲染]",
      enableZoom = TRUE,
      enableDownload = TRUE,
      enableCopy = TRUE
    )
  })

  output$tc1 <- renderShinyThoughtChain({
    list(
      items = list(
        list(key = "1", title = "Web Search",
             status = "success", icon = "search",
             content = "Query: 'shinyAntDesignX'\nFound: 3 results"),
        list(key = "2", title = "Database Lookup",
             status = "success", icon = "database",
             content = "SELECT * FROM widgets LIMIT 10\n→ 10 rows returned"),
        list(key = "3", title = "Code Execution",
             status = "error", icon = "code",
             content = "Error: object 'x' not found"),
        list(key = "4", title = "Generate Response",
             status = "loading", icon = "bulb",
             content = NULL)
      ),
      line = "solid"
    )
  })
}

shinyApp(ui, server)

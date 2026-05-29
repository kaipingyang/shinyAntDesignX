library(shiny)
library(bslib)
devtools::load_all(here::here())

ui <- page_fluid(
  h2("shinyAntDesignX — 全组件演示"),

  hr(), h3("Welcome"), shinyWelcomeOutput("w1", height = "auto"),
  hr(), h3("Prompts (点击触发 input$prompts1)"), shinyPromptsOutput("prompts1", height = "auto"),
  hr(), h3("XMarkdown"), shinyXMarkdownOutput("md1", height = "auto"),
  hr(), h3("BubbleList"), shinyBubbleListOutput("bl1", height = "300px"),
  hr(), h3("ThoughtChain"), shinyThoughtChainOutput("tc1", height = "auto"),
  hr(), h3("Think"), shinyThinkOutput("think1", height = "auto"),
  hr(), h3("CodeHighlighter"), shinyCodeHighlighterOutput("code1", height = "auto"),
  hr(), h3("Mermaid"), shinyMermaidOutput("mermaid1", height = "350px"),
  hr(), h3("Actions (点击触发 input$actions1)"), shinyActionsOutput("actions1", height = "auto"),
  hr(), h3("Sources"), shinySourcesOutput("sources1", height = "auto"),
  hr(), h3("FileCard"), shinyFileCardOutput("fc1", height = "auto"),
  hr(), h3("Folder"), shinyFolderOutput("folder1", height = "400px"),
  hr(), h3("Conversations (点击触发 input$conv1)"), shinyConversationsOutput("conv1", height = "300px"),
  hr(), h3("Sender (发送触发 input$sender1)"), shinySenderOutput("sender1", height = "auto"),
  hr(), h4("Sender 输入值:"), verbatimTextOutput("sender_val"),
  h4("Prompts 点击:"), verbatimTextOutput("prompts_val"),
  h4("Actions 点击:"), verbatimTextOutput("actions_val"),
  h4("Conversations 选中:"), verbatimTextOutput("conv_val")
)

server <- function(input, output, session) {

  output$w1 <- renderShinyWelcome({
    list(title = "shinyAntDesignX", description = "全组件演示 — Ant Design X for R Shiny")
  })

  output$prompts1 <- renderShinyPrompts({
    list(
      inputId = "prompts1",
      title = "推荐问题",
      items = list(
        list(key = "q1", label = "什么是 Ant Design X?", description = "了解组件库"),
        list(key = "q2", label = "如何使用 ThoughtChain?", description = "工具调用可视化"),
        list(key = "q3", label = "XMarkdown 如何处理流式输出?", description = "流式渲染")
      ),
      wrap = TRUE
    )
  })

  output$md1 <- renderShinyXMarkdown({
    list(
      content = "# XMarkdown 渲染示例\n\n支持 **粗体**、_斜体_、`inline code`\n\n```python\ndef hello():\n    return 'Hello, Shiny!'\n```\n\n| 组件 | 状态 |\n|------|------|\n| XMarkdown | ✅ |\n| BubbleList | ✅ |\n| ThoughtChain | ✅ |",
      streaming = FALSE
    )
  })

  output$bl1 <- renderShinyBubbleList({
    list(
      items = list(
        list(key = "1", role = "user", content = "帮我分析一下销售数据"),
        list(key = "2", role = "assistant", content = "好的，我来帮您分析。以下是主要发现：\n\n- **销售额**同比增长 23%\n- **转化率**提升至 4.2%\n- 主要增长来自移动端"),
        list(key = "3", role = "user", content = "哪个地区表现最好？"),
        list(key = "4", role = "assistant", content = "华东地区表现最佳，销售额占比 **38%**，同比增长 **31%**。")
      ),
      assistantAvatar = list(fallback = "AI")
    )
  })

  output$tc1 <- renderShinyThoughtChain({
    list(
      items = list(
        list(key = "1", title = "数据库查询", status = "success", icon = "database",
             content = "SELECT * FROM sales WHERE region = 'east' LIMIT 100"),
        list(key = "2", title = "Python 分析", status = "success", icon = "code",
             content = "import pandas as pd\ndf.groupby('region').sum()"),
        list(key = "3", title = "生成报告", status = "loading", icon = "bulb")
      )
    )
  })

  output$think1 <- renderShinyThink({
    list(
      content = "用户想要了解销售数据分析。我需要：\n1. 查询数据库获取最新数据\n2. 按地区分组汇总\n3. 计算同比增长率\n4. 生成可视化报告",
      title = "推理过程",
      loading = FALSE,
      defaultExpanded = FALSE
    )
  })

  output$code1 <- renderShinyCodeHighlighter({
    list(
      code = "output$tc <- renderShinyThoughtChain({\n  list(items = list(\n    list(key = '1', title = 'Search',\n         status = 'success', icon = 'search',\n         content = 'Found 42 results')\n  ))\n})",
      lang = "r",
      showHeader = TRUE
    )
  })

  output$mermaid1 <- renderShinyMermaid({
    list(
      diagram = "graph LR\n  A[用户] -->|发送消息| B[Sender]\n  B --> C{Router}\n  C -->|工具调用| D[ThoughtChain]\n  C -->|直接回复| E[XMarkdown]\n  D --> E\n  E -->|渲染| F[BubbleList]"
    )
  })

  output$actions1 <- renderShinyActions({
    list(
      inputId = "actions1",
      items = list(
        list(key = "copy", label = "复制", icon = "copy"),
        list(key = "like", label = "赞", icon = "like"),
        list(key = "dislike", label = "踩", icon = "dislike"),
        list(key = "refresh", label = "重新生成", icon = "refresh")
      )
    )
  })

  output$sources1 <- renderShinySources({
    list(
      title = "参考来源",
      items = list(
        list(key = "1", title = "Ant Design X 官网", url = "https://ant-design-x.antgroup.com",
             description = "React UI 组件库"),
        list(key = "2", title = "htmlwidgets 文档", url = "https://www.htmlwidgets.org",
             description = "R htmlwidgets 开发指南"),
        list(key = "3", title = "Shiny 文档", url = "https://shiny.posit.co",
             description = "R Shiny 框架")
      ),
      defaultExpanded = TRUE
    )
  })

  # Encode local PNG as data URL for FileCard image preview
  logo_src <- paste0(
    "data:image/png;base64,",
    base64enc::base64encode(file.path(here::here(), "examples/antdesignx-logo.png"))
  )

  output$fc1 <- renderShinyFileCard({
    list(
      items = list(
        list(name = "sales_report.pdf", byte = 2048000, type = "file"),
        list(name = "dashboard.png", byte = 512000, type = "image", src = logo_src),
        list(name = "data.csv", byte = 128000, type = "file")
      )
    )
  })

  output$folder1 <- renderShinyFolder({
    list(
      inputId = "folder1",
      treeData = list(
        list(title = "R", path = "R", children = list(
          list(title = "xmarkdown.R", path = "R/xmarkdown.R",
               content = "#' XMarkdown widget\nrenderShinyXMarkdown <- function(expr, ...) {\n  # ...\n}"),
          list(title = "thoughtChain.R", path = "R/thoughtChain.R", content = "# ThoughtChain widget")
        )),
        list(title = "srcjs", path = "srcjs", children = list(
          list(title = "widgets", path = "srcjs/widgets", children = list(
            list(title = "xmarkdown", path = "srcjs/widgets/xmarkdown", children = list(
              list(title = "index.tsx", path = "srcjs/widgets/xmarkdown/index.tsx", content = "// XMarkdown widget entry")
            ))
          ))
        ))
      ),
      defaultExpandAll = TRUE
    )
  })

  output$conv1 <- renderShinyConversations({
    list(
      inputId = "conv1",
      activeKey = "s1",
      showCreation = TRUE,
      items = list(
        list(key = "s1", label = "销售数据分析"),
        list(key = "s2", label = "用户行为研究"),
        list(key = "s3", label = "季度报告生成")
      )
    )
  })

  output$sender1 <- renderShinySender({
    list(
      inputId = "sender1",
      placeholder = "输入消息后按 Enter 发送…",
      allowSpeech = FALSE
    )
  })

  output$sender_val   <- renderPrint(input$sender1)
  output$prompts_val  <- renderPrint(input$prompts1)
  output$actions_val  <- renderPrint(input$actions1)
  output$conv_val     <- renderPrint(input$conv1)

  observeEvent(input$conv1_new, {
    showNotification("New chat created", type = "message")
  })
}

shinyApp(ui, server)

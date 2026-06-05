library(shiny)
devtools::load_all(here::here())

# 最简测试：单个 xmarkdown widget，只测代码高亮
# 打开浏览器 DevTools Console 看报错

MD <- "
```r
library(dplyr)
library(ggplot2)

mtcars |>
  filter(cyl == 6) |>
  group_by(am) |>
  summarise(mean_mpg = mean(mpg), n = n()) |>
  ggplot(aes(factor(am), mean_mpg)) +
  geom_col(fill = '#3b82f6') +
  labs(title = '6缸车平均油耗')
```

```python
import anthropic
client = anthropic.Anthropic()
response = client.messages.create(model='claude-3-5-sonnet', max_tokens=1024)
```

```javascript
const x = [1, 2, 3].map(n => n * 2);
console.log(x);
```
"

ui <- fluidPage(
  tags$h3("PrismLight 彩色测试 — components=list(code='CodeBlock')"),
  tags$p("下方应显示带彩色语法高亮的代码块。如果是纯文本，打开 DevTools Console 查报错。"),
  antDesignXMarkdownOutput("out1", height = "auto"),
  tags$hr(),
  tags$h3("对照：不传 components（默认渲染）"),
  antDesignXMarkdownOutput("out2", height = "auto")
)

server <- function(input, output, session) {
  output$out1 <- renderAntDesignXMarkdown({
    list(
      content    = MD,
      components = list(code = "CodeBlock")
    )
  })
  output$out2 <- renderAntDesignXMarkdown({
    list(content = MD)
  })
}

shinyApp(ui, server)

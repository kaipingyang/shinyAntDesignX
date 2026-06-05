library(shiny)
devtools::load_all(here::here())

R_CODE <- 'library(dplyr)
library(ggplot2)

mtcars |>
  filter(cyl == 6) |>
  group_by(am) |>
  summarise(mean_mpg = mean(mpg), n = n()) |>
  ggplot(aes(factor(am), mean_mpg)) +
  geom_col(fill = \'#3b82f6\') +
  labs(title = \'6缸车平均油耗\')'

ui <- fluidPage(
  tags$h3("1. codeHighlighter widget — lang='r'（PrismLight + nightOwl）"),
  antDesignXCodeHighlighterOutput("ch_r",    height = "auto"),
  tags$hr(),
  tags$h3("2. codeHighlighter widget — lang='R'（大写，同 lang='r'）"),
  antDesignXCodeHighlighterOutput("ch_R",    height = "auto"),
  tags$hr(),
  tags$h3("3. codeHighlighter widget — lang=NULL（无语言，纯文本）"),
  antDesignXCodeHighlighterOutput("ch_null", height = "auto"),
  tags$hr(),
  tags$h3("4. xmarkdown PrismLight CodeBlock — lang 由 fence 决定（```r）"),
  antDesignXMarkdownOutput("md_prism", height = "auto")
)

server <- function(input, output, session) {
  output$ch_r    <- renderAntDesignXCodeHighlighter({ list(code = R_CODE, lang = "r") })
  output$ch_R    <- renderAntDesignXCodeHighlighter({ list(code = R_CODE, lang = "R") })
  output$ch_null <- renderAntDesignXCodeHighlighter({ list(code = R_CODE) })

  output$md_prism <- renderAntDesignXMarkdown({
    list(
      content    = paste0("```r\n", R_CODE, "\n```"),
      components = list(code = "CodeBlock")
    )
  })
}

shinyApp(ui, server)

library(shiny)
library(bslib)
devtools::load_all(here::here())

ui <- page_fluid(
  h3("shinyAntDesignX — 基本示例"),
  antDesignXOutput("chat", height = "80vh")
)

server <- function(input, output, session) {
  antDesignXServer("chat", handler = function(message, on_chunk, on_done, on_error) {
    words <- strsplit(paste("你说的是：", message, "。这是模拟流式回复，测试基本功能。"), "")[[1]]
    for (w in words) {
      on_chunk(w)
      Sys.sleep(0.02)
    }
    on_done()
  })
}

shinyApp(ui, server)

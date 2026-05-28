library(shiny)
library(bslib)
devtools::load_all(here::here())

ui <- tagList(
  tags$head(tags$style(HTML("
    html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
  "))),
  antDesignXOutput("chat", height = "100vh")
)

server <- function(input, output, session) {
  antDesignXServer(
    "chat",
    handler = function(message, on_chunk, on_done, on_error,
                       on_tool_call, on_tool_result, on_thinking) {
      # Simulate thinking
      thinking_text <- paste(
        "User asked:", message,
        "\nI should look this up using the search tool."
      )
      on_thinking(thinking_text)
      Sys.sleep(0.3)

      # Simulate a tool call
      tool_id <- paste0("tc_", as.integer(Sys.time()))
      on_tool_call(
        tool_call_id = tool_id,
        tool_name    = "web_search",
        args         = list(query = message),
        annotations  = list(
          title = "Web Search",
          icon  = "search",
          resultType = "markdown"
        )
      )
      Sys.sleep(0.5)

      # Simulate tool result
      on_tool_result(
        tool_call_id = tool_id,
        result = paste0("Search results for '", message, "':\n- Result 1: Example content\n- Result 2: More content"),
        is_error = FALSE
      )
      Sys.sleep(0.2)

      # Stream response
      response <- paste0("Based on my search, here is what I found about \"", message, "\": This is a simulated streaming response to demonstrate tool calling visualization with ThoughtChain in shinyAntDesignX.")
      chars <- strsplit(response, "")[[1]]
      for (ch in chars) {
        on_chunk(ch)
        Sys.sleep(0.01)
      }
      on_done()
    },

    suggestions = list(
      list(prompt = "What is Ant Design X?", text = "What is Ant Design X?"),
      list(prompt = "Show me a tool call example", text = "Show me a tool call example")
    ),

    commands = list(
      list(name = "help", description = "Show available commands", prompt = "What can you help me with?"),
      list(name = "clear", description = "Start fresh", prompt = "Let's start a new conversation.")
    ),

    assistant_avatar = list(fallback = "AI")
  )
}

shinyApp(ui, server)

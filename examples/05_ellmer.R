library(shiny)
library(ellmer)
devtools::load_all(here::here())

# ── Handler using ellmer ──────────────────────────────────────────────────────
handler <- make_ellmer_handler(
  chat = function() chat_openai_compatible(
    base_url    = Sys.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    model       = Sys.getenv("OPENAI_MODEL",    "gpt-4o"),
    credentials = function() Sys.getenv("OPENAI_API_KEY")
  )
)

ui <- tagList(
  tags$head(tags$style(HTML("html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }"))),
  antDesignXOutput("chat", height = "100vh")
)

server <- function(input, output, session) {
  antDesignXServer(
    "chat",
    handler              = handler,
    show_conversation_list = TRUE,
    assistant_avatar     = list(fallback = "AI")
  )
}

shinyApp(ui, server)

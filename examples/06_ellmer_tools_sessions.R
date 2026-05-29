library(shiny)
library(ellmer)
devtools::load_all(here::here())

# ── Session store ─────────────────────────────────────────────────────────────
store <- ellmer_session_store(".sessions/chat.db")

# ── Tools ─────────────────────────────────────────────────────────────────────
get_time <- ellmer::tool(
  function(tz = "UTC") format(Sys.time(), tz = tz, usetz = TRUE),
  name        = "get_time",
  description = "Get current time in given timezone",
  arguments   = list(tz = ellmer::type_string("Timezone, e.g. 'Asia/Shanghai'"))
)

# ── Handler ────────────────────────────────────────────────────────────────────
handler <- make_ellmer_handler(
  chat = function() chat_openai_compatible(
    base_url    = Sys.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    model       = Sys.getenv("OPENAI_MODEL",    "gpt-4o"),
    credentials = function() Sys.getenv("OPENAI_API_KEY")
  ),
  tools = list(get_time),
  store = store
)

ui <- tagList(
  tags$head(tags$style(HTML("html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }"))),
  antDesignXOutput("chat", height = "100vh")
)

server <- function(input, output, session) {
  ctrl <- antDesignXServer(
    "chat",
    handler                = handler,
    show_conversation_list = TRUE,
    on_session_load        = make_ellmer_session_loader(store),
    suggestions = list(
      list(prompt = "What time is it in Shanghai?", text = "Time in Shanghai"),
      list(prompt = "What time is it in New York?",  text = "Time in New York")
    ),
    tools = list(
      list(name = "get_time", description = "Get current time in given timezone")
    ),
    assistant_avatar = list(fallback = "AI")
  )

  shiny::observe({
    sessions <- tryCatch(store$list_sessions(limit = 50L), error = function(e) list())
    ctrl$send_sessions(list(sessions = sessions))
  })
}

shinyApp(ui, server)

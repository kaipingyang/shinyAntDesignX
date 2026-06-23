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

get_weather <- ellmer::tool(
  function(city) {
    Sys.sleep(0.3)
    conditions <- c("Sunny", "Partly Cloudy", "Cloudy", "Light Rain",
                    "Rain", "Windy", "Thunderstorm", "Snow")
    days       <- c("TODAY", "MON", "TUE", "WED", "THU")
    cond       <- sample(conditions, 1)
    temp       <- sample(45:85, 1)
    list(
      city        = city,
      temperature = temp,
      unit        = "F",
      condition   = cond,
      high        = temp + sample(4:10, 1),
      low         = temp - sample(4:10, 1),
      humidity    = sample(40:90, 1),
      wind        = sample(5:35, 1),
      forecast    = lapply(seq_along(days), function(i) {
        ft <- temp + sample(-6:6, 1)
        list(day = days[[i]], high = ft + sample(3:7, 1),
             low = ft - sample(3:7, 1), condition = sample(conditions, 1))
      })
    )
  },
  name        = "get_weather",
  description = "Get current weather information for a city",
  arguments   = list(city = ellmer::type_string("The name of the city")),
  annotations = ellmer::tool_annotations(title = "Weather Lookup", icon = "cloud-sun")
)

calculate <- ellmer::tool(
  function(expression) {
    tryCatch(
      as.character(eval(parse(text = expression))),
      error = function(e) stop(conditionMessage(e))
    )
  },
  name        = "calculate",
  description = "Evaluate a mathematical expression (R syntax)",
  arguments   = list(expression = ellmer::type_string("A valid R expression, e.g. 'sqrt(144)'")),
  annotations = ellmer::tool_annotations(title = "Calculator", icon = "calculator")
)

# ── Handler ───────────────────────────────────────────────────────────────────
# ctrl is created after handler — use an env so on_tool_result can reference it lazily
ctrl_env <- new.env(parent = emptyenv())

make_weather_card <- function(result, thread_id) {
  if (!is.list(result) || is.null(result$city)) return(invisible(NULL))
  sid <- paste0("weather-", gsub("[^a-z0-9]", "", tolower(result$city)), "-",
                as.integer(Sys.time()))
  fc  <- result$forecast %||% list()
  forecast_rows <- lapply(fc, function(d)
    list(id = d$day, component = "Descriptions",
         items = list(
           list(label = "Day",  value = d$day),
           list(label = "High", value = paste0(d$high, "°F")),
           list(label = "Low",  value = paste0(d$low,  "°F")),
           list(label = "Cond", value = d$condition)
         ), column = 4L, bordered = TRUE))
  forecast_ids <- lapply(seq_along(fc), function(i) paste0("fc_", fc[[i]]$day))

  components <- c(
    list(
      list(id = "hdr",  component = "Statistic",
           title = paste0(result$city, " Weather"),
           value = paste0(result$temperature, "°F"), prefix = "🌡"),
      list(id = "cond", component = "Alert",
           message = paste0(result$condition, "  💧 ", result$humidity, "%  💨 ", result$wind, " mph"),
           type = "info", showIcon = FALSE),
      list(id = "fc_title", component = "Divider", text = "5-Day Forecast")
    ),
    mapply(function(row, id) { row$id <- id; row }, forecast_rows, forecast_ids, SIMPLIFY = FALSE),
    list(list(id = "root", component = "Container", gap = 8L,
              children = c(list("hdr", "cond", "fc_title"), forecast_ids)))
  )

  ctrl_env$ctrl$send_card_command(xcard_create_surface(sid), thread_id = thread_id)
  ctrl_env$ctrl$send_card_command(xcard_update_components(sid, components), thread_id = thread_id)
}

handler <- make_ellmer_handler(
  chat = function() chat_openai_compatible(
    base_url    = Sys.getenv("OPENAI_BASE_URL"),
    model       = "gsds-gpt-54",
    credentials = function() Sys.getenv("OPENAI_API_KEY")
  ),
  tools          = list(get_time, get_weather, calculate),
  approval_tools = c("calculate"),
  store          = store,
  on_tool_result = function(tool_name, tool_call_id, result, is_error, thread_id) {
    if (!is_error && identical(tool_name, "get_weather") && !is.null(ctrl_env$ctrl)) {
      make_weather_card(result, thread_id)
    }
  }
)

ui <- tagList(
  tags$head(tags$style(HTML("html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }"))),
  antDesignXOutput("chat", height = "100vh")
)

server <- function(input, output, session) {
  ctrl <- antDesignXServer(    "chat",
    handler                = handler,
    show_conversation_list = TRUE,
    on_session_load        = make_ellmer_session_loader(store),
    allow_speech           = TRUE,
    allow_upload           = TRUE,
    strings = list(
      welcome_title       = "GSDS AI Assistant",
      welcome_description = "I can check the weather, tell the time, and run calculations. Type / for commands.",
      placeholder         = "Ask me anything… (/ for commands)"
    ),
    assistant_avatar = list(fallback = "AI"),
    suggestions = list(
      list(prompt = "What time is it in Shanghai?",         text = "Time in Shanghai"),
      list(prompt = "What time is it in New York?",          text = "Time in New York"),
      list(prompt = "What's the weather in San Francisco?",  text = "SF weather"),
      list(prompt = "Calculate the result of 2^10 / 4",     text = "2^10 / 4")
    ),
    tools = list(
      list(name = "get_time",    description = "Get current time in given timezone"),
      list(name = "get_weather", description = "Get current weather for a city"),
      list(name = "calculate",   description = "Evaluate a mathematical expression")
    ),
    commands = list(
      list(name = "weather",   description = "Ask about weather — /weather <city>",
           prompt = "What's the weather like in {args} right now?"),
      list(name = "time",      description = "Ask current time — /time <timezone>",
           prompt = "What time is it in {args}?"),
      list(name = "calc",      description = "Run a calculation — /calc <expression>",
           prompt = "Calculate {args}"),
      list(name = "summarize", description = "Summarize the conversation",
           prompt = "Please summarize our conversation so far.")
    ),
    on_feedback = function(message_id, type) {
      message("[FEEDBACK] ", type, " on message=", message_id)
    }
  )
  ctrl_env$ctrl <- ctrl  # bind ctrl so on_tool_result hook can use it

  shiny::observe({
    sessions <- tryCatch(store$list_sessions(limit = 50L), error = function(e) list())
    ctrl$send_sessions(list(sessions = sessions))
  })
}

shinyApp(ui, server)

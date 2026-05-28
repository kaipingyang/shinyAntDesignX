#' Conversations Widget — Session/thread switcher
#'
#' Renders a conversation list sidebar. Clicking emits `list(key)` to `input$<inputId>`.
#' Creating new conversation emits to `input$<inputId>_new`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyConversationsOutput <- function(outputId, width = "100%", height = "100%", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "conversations",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Conversations Widget
#'
#' @param expr A list with:
#'   * `inputId` — Shiny input ID.
#'   * `items` — list of `list(key, label, group)`.
#'   * `activeKey` — currently selected key (string).
#'   * `groupable` — logical, enable group headers (default `FALSE`).
#'   * `showCreation` — logical, show "New Chat" button (default `FALSE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyConversations <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "conversations", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyConversationsOutput, env = baseenv(), quoted = TRUE)
}

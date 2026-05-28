#' Prompts Widget — Clickable suggestion chips
#'
#' Emits to `input$<outputId>` as list with `key` and `label`.
#'
#' @param outputId Output/input ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyPromptsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "prompts",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Prompts Widget
#'
#' @param expr A list with: `inputId` (string), `items` (list of `list(key, label, description)`),
#'   `title` (string), `vertical` (logical), `wrap` (logical).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyPrompts <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "prompts", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyPromptsOutput, env = baseenv(), quoted = TRUE)
}

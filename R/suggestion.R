#' Suggestion Widget — Slash-command autocomplete input
#'
#' Input box that shows suggestion popup when user types `/`.
#' Emits selected value to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinySuggestionOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "suggestion",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Suggestion Widget
#'
#' @param expr A list with: `inputId`, `items` (list of `list(value, label, description)`),
#'   `placeholder` (string), `block` (logical, default TRUE).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinySuggestion <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "suggestion", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinySuggestionOutput, env = baseenv(), quoted = TRUE)
}

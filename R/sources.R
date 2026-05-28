#' Sources Widget — RAG citation list
#'
#' Displays a collapsible list of source references. Clicking opens URL or emits to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinySourcesOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "sources",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Sources Widget
#'
#' @param expr A list with:
#'   * `items` — list of `list(key, title, url, description)`.
#'   * `title` — header text (default none).
#'   * `defaultExpanded` — logical (default `TRUE`).
#'   * `inputId` — if set, clicking emits to Shiny; if NULL, opens URL directly.
#'   * `inline` — logical, inline citation mode (default `FALSE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinySources <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "sources", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinySourcesOutput, env = baseenv(), quoted = TRUE)
}

#' FileCard Widget — File attachment display
#'
#' Renders one or more file cards. Clicking emits to `input$<inputId>` (if set).
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyFileCardOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "fileCard",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render FileCard Widget
#'
#' @param expr A list with:
#'   * `items` — list of `list(name, byte, type, src, loading)`. `type` can be
#'     `"file"`, `"image"`, `"audio"`, `"video"`.
#'   * `size` — `"default"` or `"small"`.
#'   * `inputId` — optional, emits `list(name)` on click.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyFileCard <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "fileCard", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyFileCardOutput, env = baseenv(), quoted = TRUE)
}

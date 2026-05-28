#' Actions Widget — Message action buttons (copy, like, etc.)
#'
#' Emits clicked action key to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyActionsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "actions",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Actions Widget
#'
#' @param expr A list with:
#'   * `inputId` — Shiny input ID for click events.
#'   * `items` — list of `list(key, label, icon, danger)`. `icon` can be
#'     `"copy"`, `"like"`, `"dislike"`, `"refresh"`, `"share"`, `"delete"`,
#'     `"edit"`, `"download"`, `"audio"`.
#'   * `variant` — `"borderless"` (default), `"filled"`, `"outlined"`.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyActions <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "actions", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyActionsOutput, env = baseenv(), quoted = TRUE)
}

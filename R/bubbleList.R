#' Bubble List Widget — Read-only chat message list
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyBubbleListOutput <- function(outputId, width = "100%", height = "500px", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "bubbleList",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Bubble List Widget
#'
#' @param expr A list with:
#'   * `items` — list of `list(key, role, content, loading)`. `role` is `"user"`,
#'     `"assistant"`, or `"system"`. `content` is a Markdown string (rendered via XMarkdown).
#'   * `assistantAvatar` — `list(fallback = "AI", src = NULL)`.
#'   * `userPlacement` — `"start"` or `"end"` (default).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyBubbleList <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "bubbleList", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyBubbleListOutput, env = baseenv(), quoted = TRUE)
}

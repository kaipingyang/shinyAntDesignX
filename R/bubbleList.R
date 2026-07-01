#' Bubble List Widget — Read-only chat message list
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXBubbleListOutput <- function(outputId, width = "100%", height = "500px", ...) {
  .widget_output_body("bubbleList", outputId, width, height, ...)
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
renderAntDesignXBubbleList <- .make_render_widget("bubbleList", antDesignXBubbleListOutput)

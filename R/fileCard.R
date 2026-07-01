#' FileCard Widget — File attachment display
#'
#' Renders one or more file cards. Clicking emits to `input$<inputId>` (if set).
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXFileCardOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("fileCard", outputId, width, height, ...)
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
renderAntDesignXFileCard <- .make_render_widget("fileCard", antDesignXFileCardOutput)

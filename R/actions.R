#' Actions Widget — Message action buttons (copy, like, etc.)
#'
#' Emits clicked action key to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXActionsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("actions", outputId, width, height, ...)
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
renderAntDesignXActions <- .make_render_widget("actions", antDesignXActionsOutput)

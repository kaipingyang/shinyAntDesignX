#' Sources Widget — RAG citation list
#'
#' Displays a collapsible list of source references. Clicking opens URL or emits to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXSourcesOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("sources", outputId, width, height, ...)
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
renderAntDesignXSources <- .make_render_widget("sources", antDesignXSourcesOutput)

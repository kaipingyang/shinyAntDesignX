#' Mermaid Diagram Output Widget
#'
#' Renders Mermaid diagrams using Ant Design X's Mermaid component.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXMermaidOutput <- function(outputId, width = "100%", height = "400px", ...) {
  .widget_output_body("mermaid", outputId, width, height, ...)
}

#' Render Mermaid Widget
#'
#' @param expr An expression returning a list with:
#'   * `diagram` — Mermaid diagram source string.
#'   * `enableZoom` — logical (default `TRUE`).
#'   * `enableDownload` — logical (default `TRUE`).
#'   * `enableCopy` — logical (default `TRUE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXMermaid <- .make_render_widget("mermaid", antDesignXMermaidOutput)

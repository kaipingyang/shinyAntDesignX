#' Mermaid Diagram Output Widget
#'
#' Renders Mermaid diagrams using Ant Design X's Mermaid component.
#' Supports zoom, download, and copy actions.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyMermaidOutput <- function(outputId, width = "100%", height = "400px", ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId = outputId,
    name     = "mermaid",
    width    = width,
    height   = height,
    package  = "shinyAntDesignX",
    ...
  )
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
renderShinyMermaid <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::createRenderFunction(
    func,
    function(x, session, name, ...) x,
    shinyMermaidOutput,
    NULL
  )
}

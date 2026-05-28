#' Code Highlighter Output Widget
#'
#' Renders syntax-highlighted code using Ant Design X's CodeHighlighter component.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyCodeHighlighterOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId = outputId,
    name     = "codeHighlighter",
    width    = width,
    height   = height,
    package  = "shinyAntDesignX",
    ...
  )
}

#' Render Code Highlighter Widget
#'
#' @param expr An expression returning a list with:
#'   * `code` — character string of code to display.
#'   * `lang` — language identifier (e.g. `"r"`, `"python"`, `"sql"`).
#'   * `showHeader` — logical, show the language header bar (default `TRUE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyCodeHighlighter <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::createRenderFunction(
    func,
    function(x, session, name, ...) x,
    shinyCodeHighlighterOutput,
    NULL
  )
}

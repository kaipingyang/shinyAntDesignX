#' XMarkdown Output Widget
#'
#' Renders Markdown content using Ant Design X's high-performance XMarkdown renderer.
#' Supports streaming (for AI chat responses) and standard Markdown.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyXMarkdownOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId = outputId,
    name     = "xmarkdown",
    width    = width,
    height   = height,
    package  = "shinyAntDesignX",
    ...
  )
}

#' Render XMarkdown Widget
#'
#' @param expr An expression returning a list with:
#'   * `content` — Markdown string.
#'   * `streaming` — logical, `TRUE` while content is still streaming in.
#'   * `openLinksInNewTab` — logical, open links in new tab (default `FALSE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyXMarkdown <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::createRenderFunction(
    func,
    function(x, session, name, ...) x,
    shinyXMarkdownOutput,
    NULL
  )
}

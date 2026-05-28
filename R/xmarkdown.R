#' XMarkdown Output Widget
#'
#' Renders Markdown content using Ant Design X's XMarkdown renderer.
#' Supports streaming for AI chat responses.
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
#'   * `openLinksInNewTab` — logical (default `FALSE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyXMarkdown <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "xmarkdown", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyXMarkdownOutput,
    env            = baseenv(),
    quoted         = TRUE
  )
}

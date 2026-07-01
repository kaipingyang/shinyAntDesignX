#' Code Highlighter Output Widget
#'
#' Renders syntax-highlighted code using PrismLight (react-syntax-highlighter)
#' with Night Owl theme. Supported languages: r/R, python/py, javascript/js,
#' typescript/ts, bash/shell/sh, sql, json, html/xml, css, jsx, tsx, yaml/yml.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXCodeHighlighterOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("codeHighlighter", outputId, width, height, ...)
}

#' Render Code Highlighter Widget
#'
#' @param expr An expression returning a list with:
#'   * `code` — character string of code to display.
#'   * `lang` — language identifier (e.g. `"r"`, `"python"`, `"sql"`).
#'   * `showHeader` — logical (default `TRUE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXCodeHighlighter <- .make_render_widget("codeHighlighter", antDesignXCodeHighlighterOutput)

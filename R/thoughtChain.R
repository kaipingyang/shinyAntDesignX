#' ThoughtChain Output Widget
#'
#' Visualizes an AI agent's tool call chain using Ant Design X's ThoughtChain component.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXThoughtChainOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("thoughtChain", outputId, width, height, ...)
}

#' Render ThoughtChain Widget
#'
#' @param expr An expression returning a list with:
#'   * `items` — list of tool call items. Each item is a named list with fields:
#'     `key`, `title`, `description`, `content`, `status` (`"loading"` / `"success"` /
#'     `"error"` / `"abort"`), `icon` (`"search"` / `"database"` / `"code"` / `"globe"` /
#'     `"zap"` / `"terminal"` / `"flask"` / `"wrench"` / `"bulb"` / `"shield"`),
#'     `collapsible` (logical, default `TRUE`).
#'   * `line` — `"solid"` (default), `"dashed"`, `"dotted"`, or `FALSE`.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXThoughtChain <- .make_render_widget("thoughtChain", antDesignXThoughtChainOutput)

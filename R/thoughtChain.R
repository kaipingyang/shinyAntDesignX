#' ThoughtChain Output Widget
#'
#' Visualizes an AI agent's tool call chain using Ant Design X's ThoughtChain component.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyThoughtChainOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId = outputId,
    name     = "thoughtChain",
    width    = width,
    height   = height,
    package  = "shinyAntDesignX",
    ...
  )
}

#' Render ThoughtChain Widget
#'
#' @param expr An expression returning a list with:
#'   * `items` — list of tool call items. Each item is a named list with:
#'     * `key` — unique string identifier.
#'     * `title` — display name (e.g. tool name).
#'     * `description` — optional subtitle.
#'     * `content` — optional expanded content string.
#'     * `status` — one of `"loading"`, `"success"`, `"error"`, `"abort"`.
#'     * `icon` — optional icon name: `"search"`, `"database"`, `"code"`, `"globe"`,
#'       `"zap"`, `"terminal"`, `"flask"`, `"wrench"`, `"bulb"`, `"shield"`.
#'     * `collapsible` — logical (default `TRUE`).
#'   * `line` — connector line style: `"solid"` (default), `"dashed"`, `"dotted"`,
#'     or `FALSE` to hide.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyThoughtChain <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::createRenderFunction(
    func,
    function(x, session, name, ...) x,
    shinyThoughtChainOutput,
    NULL
  )
}

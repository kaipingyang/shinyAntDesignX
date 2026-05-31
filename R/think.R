#' Think Widget — Collapsible reasoning display
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXThinkOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "think",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Think Widget
#'
#' @param expr A list with: `content` (string), `title` (string),
#'   `loading` (logical), `defaultExpanded` (logical).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXThink <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "think", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = antDesignXThinkOutput, env = baseenv(), quoted = TRUE)
}

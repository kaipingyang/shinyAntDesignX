#' Prompts Widget — Clickable suggestion chips
#'
#' Emits to `input$<outputId>` as list with `key` and `label`.
#'
#' @param outputId Output/input ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXPromptsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "prompts",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Prompts Widget
#'
#' @param expr A list with: `inputId` (string), `items` (list of
#'   `list(key, label, description, icon, disabled)`), `title` (string),
#'   `vertical` (logical), `wrap` (logical).
#'   `icon` accepts a preset name: `bulb`, `fire`, `rocket`, `read`, `comment`,
#'   `check`, `info`, `star`, `thunder`, `smile`, `heart`, `coffee`, `question`.
#'   `disabled = TRUE` greys out and disables click for that item.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXPrompts <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "prompts", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = antDesignXPromptsOutput, env = baseenv(), quoted = TRUE)
}

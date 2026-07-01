#' Prompts Widget — Clickable suggestion chips
#'
#' Emits to `input$<outputId>` as list with `key` and `label`.
#'
#' @param outputId Output/input ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXPromptsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("prompts", outputId, width, height, ...)
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
renderAntDesignXPrompts <- .make_render_widget("prompts", antDesignXPromptsOutput)

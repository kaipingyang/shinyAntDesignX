#' Think Widget — Collapsible reasoning display
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXThinkOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("think", outputId, width, height, ...)
}

#' Render Think Widget
#'
#' @param expr A list with: `content` (string), `title` (string),
#'   `loading` (logical), `defaultExpanded` (logical).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXThink <- .make_render_widget("think", antDesignXThinkOutput)

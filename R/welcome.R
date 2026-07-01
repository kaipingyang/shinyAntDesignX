#' Welcome Widget — Onboarding screen
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXWelcomeOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("welcome", outputId, width, height, ...)
}

#' Render Welcome Widget
#'
#' @param expr A list with: `title` (string), `description` (string),
#'   `variant` (`"filled"` or `"borderless"`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXWelcome <- .make_render_widget("welcome", antDesignXWelcomeOutput)

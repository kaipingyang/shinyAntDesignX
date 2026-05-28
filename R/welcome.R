#' Welcome Widget — Onboarding screen
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyWelcomeOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "welcome",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Welcome Widget
#'
#' @param expr A list with: `title` (string), `description` (string),
#'   `variant` (`"filled"` or `"borderless"`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyWelcome <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "welcome", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyWelcomeOutput, env = baseenv(), quoted = TRUE)
}

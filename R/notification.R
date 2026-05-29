#' Notification Widget — Browser system notification
#'
#' Fires a browser push notification. Renders no visible UI.
#' Requires browser permission — first use should set `requestPermission = TRUE`.
#' Click emits to `input$<inputId>` as `list(action = "click", tag = ...)`.
#'
#' @param outputId Output ID (hidden div, height 0).
#' @param width,height CSS dimensions (default height 0px).
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyNotificationOutput <- function(outputId, width = "0px", height = "0px", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "notification",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Notification Widget
#'
#' @param expr A list with: `title` (required), `body`, `icon` (URL), `tag`,
#'   `duration` (ms, default 4000), `requireInteraction` (logical),
#'   `requestPermission` (logical, request on first fire).
#'   `inputId` optional — if set, clicking notification emits to Shiny.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyNotification <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "notification", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyNotificationOutput, env = baseenv(), quoted = TRUE)
}

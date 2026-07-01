#' Notification Widget — Browser system notification
#'
#' Fires a browser push notification. Renders no visible UI.
#' Requires browser permission — first use should set `requestPermission = TRUE`.
#' Click emits to `input$<inputId>` as `list(action = "click", tag = ...)`.
#'
#' @section Repeat notifications:
#' Because the output div is hidden (height 0), Shiny suspends it by default and
#' subsequent fires are dropped. To fire more than once, disable suspension:
#' `outputOptions(output, "<id>", suspendWhenHidden = FALSE)`.
#'
#' @param outputId Output ID (hidden div, height 0).
#' @param width,height CSS dimensions (default height 0px).
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXNotificationOutput <- function(outputId, width = "0px", height = "0px", ...) {
  .widget_output_body("notification", outputId, width, height, ...)
}

#' Render Notification Widget
#'
#' @param expr A list with: `title` (required), `body`, `icon` (URL), `tag`,
#'   `duration` (seconds, default 4 — matches upstream XNotification; tag-based
#'   dedup prevents duplicate notifications with the same `tag`),
#'   `requireInteraction` (logical), `requestPermission` (logical, request on first fire).
#'   `inputId` optional — if set, clicking notification emits to Shiny.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXNotification <- .make_render_widget("notification", antDesignXNotificationOutput)

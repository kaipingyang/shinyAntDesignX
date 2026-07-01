#' Notification Widget — antd in-page notification (corner card)
#'
#' Fires an antd `notification` card inside the page (a viewport corner, with a
#' title + description). Unlike [antDesignXNotificationOutput()] (OS-level browser
#' Notification, needs permission), this is a pure in-page overlay — no permission
#' required. Renders no visible UI itself.
#'
#' Click / close emit to `input$<inputId>` as
#' `list(action = "click"|"close", key = ...)`.
#'
#' @section Repeat cards:
#' The output div is hidden (height 0), so Shiny suspends it by default and
#' subsequent fires are dropped. To fire more than once, disable suspension:
#' `outputOptions(output, "<id>", suspendWhenHidden = FALSE)`. Alternatively bump
#' the `ts` field to re-fire.
#'
#' @param outputId Output ID (hidden div, height 0).
#' @param width,height CSS dimensions (default height 0px).
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignNotificationOutput <- function(outputId, width = "0px", height = "0px", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "notify",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Notification Widget
#'
#' @param expr A list with: `message` (required string — the card title),
#'   `description` (string), `type` (one of `"success"`, `"error"`, `"info"`,
#'   `"warning"`; default `"info"`), `placement` (one of `"top"`, `"topLeft"`,
#'   `"topRight"`, `"bottom"`, `"bottomLeft"`, `"bottomRight"`; default
#'   `"topRight"`), `duration` (seconds, default 4.5; `0` = never auto-close),
#'   `key` (optional stable key — same key updates in place / targets close),
#'   `ts` (optional; bump to re-fire), `inputId` (optional — click/close emit to Shiny).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignNotification <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "notify", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = antDesignNotificationOutput, env = baseenv(), quoted = TRUE)
}

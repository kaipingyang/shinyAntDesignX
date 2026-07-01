#' Message Widget — antd in-page toast (top-center, single line)
#'
#' Fires an antd `message` toast inside the page (top-center by default). Unlike
#' [antDesignXNotificationOutput()] (which uses the OS-level browser Notification
#' API and needs permission), this is a pure in-page overlay — no permission
#' required. Renders no visible UI itself.
#'
#' @section Repeat toasts:
#' The output div is hidden (height 0), so Shiny suspends it by default and
#' subsequent fires are dropped. To fire more than once, disable suspension:
#' `outputOptions(output, "<id>", suspendWhenHidden = FALSE)`. Alternatively bump
#' the `ts` field (e.g. `ts = Sys.time()`) to re-fire the same content.
#'
#' @param outputId Output ID (hidden div, height 0).
#' @param width,height CSS dimensions (default height 0px).
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignMessageOutput <- function(outputId, width = "0px", height = "0px", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "message",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Message Widget
#'
#' @param expr A list with: `content` (required string), `type` (one of
#'   `"success"`, `"error"`, `"info"`, `"warning"`, `"loading"`; default `"info"`),
#'   `duration` (seconds, default 3; `0` = never auto-close),
#'   `key` (optional stable key — same key updates the toast in place instead of
#'   stacking), `ts` (optional; bump to re-fire identical content).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignMessage <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "message", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = antDesignMessageOutput, env = baseenv(), quoted = TRUE)
}

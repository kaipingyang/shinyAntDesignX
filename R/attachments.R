#' Attachments Upload Widget
#'
#' File upload zone with drag-and-drop. Emits to `input$<inputId>` as
#' `list(files = list(...), count = N)`. Each file: `list(uid, name, size, type, data)`
#' where `data` is a base64-encoded data URL.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyAttachmentsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "attachments",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Attachments Widget
#'
#' @param expr A list with: `inputId`, `maxCount` (default 5), `multiple` (default TRUE),
#'   `accept` (e.g. `".png,.jpg"`), `placeholderTitle`, `placeholderDescription`,
#'   `overflow` (`"wrap"`, `"scrollX"`, `"scrollY"`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyAttachments <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "attachments", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyAttachmentsOutput, env = baseenv(), quoted = TRUE)
}

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
antDesignXAttachmentsOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("attachments", outputId, width, height, ...)
}

#' Render Attachments Widget
#'
#' @param expr A list with: `inputId`, `maxCount` (default 5), `multiple` (default TRUE),
#'   `accept` (e.g. `".png,.jpg"`), `placeholderTitle`, `placeholderDescription`,
#'   `overflow` (`"wrap"`, `"scrollX"`, `"scrollY"`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXAttachments <- .make_render_widget("attachments", antDesignXAttachmentsOutput)

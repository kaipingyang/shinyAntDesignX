#' Sender Input Widget
#'
#' An AI chat input box. Emits to `input$<outputId>` as a list with `text` field.
#' Call `sendShinyMessage(session, "<outputId>:loading", list(loading=TRUE/FALSE))` to control loading state.
#'
#' @param outputId Output/input ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXSenderOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("sender", outputId, width, height, ...)
}

#' Render Sender Widget
#'
#' @param expr A list with: `inputId`, `placeholder` (string), `loading` (logical),
#'   `allowSpeech` (logical), `submitType` (`"enter"` or `"shiftEnter"`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXSender <- .make_render_widget("sender", antDesignXSenderOutput)

#' Sender Input Widget
#'
#' An AI chat input box. Emits to `input$<outputId>` as a list with `text` field.
#' Call `sendShinyMessage(session, "<outputId>:loading", list(loading=TRUE/FALSE))` to control loading state.
#'
#' @param outputId Output/input ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinySenderOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "sender",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render Sender Widget
#'
#' @param expr A list with: `inputId`, `placeholder` (string), `loading` (logical),
#'   `allowSpeech` (logical), `submitType` (`"enter"` or `"shiftEnter"`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinySender <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "sender", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinySenderOutput, env = baseenv(), quoted = TRUE)
}

#' Suggestion Widget — Slash-command autocomplete input
#'
#' Input box that shows suggestion popup when user types `/`.
#' Emits selected value to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXSuggestionOutput <- function(outputId, width = "100%", height = "auto", ...) {
  .widget_output_body("suggestion", outputId, width, height, ...)
}

#' Render Suggestion Widget
#'
#' @param expr A list with: `inputId`, `items` (list of `list(value, label, description)`),
#'   `placeholder` (string), `block` (logical, default TRUE).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXSuggestion <- .make_render_widget("suggestion", antDesignXSuggestionOutput)

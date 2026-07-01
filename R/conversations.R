#' Conversations Widget — Session/thread switcher
#'
#' Renders a conversation list sidebar. Clicking emits `list(key)` to `input$<inputId>`.
#' Creating new conversation emits to `input$<inputId>_new`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXConversationsOutput <- function(outputId, width = "100%", height = "100%", ...) {
  .widget_output_body("conversations", outputId, width, height, ...)
}

#' Render Conversations Widget
#'
#' @param expr A list with:
#'   * `inputId` — Shiny input ID.
#'   * `items` — list of `list(key, label, group)`.
#'   * `activeKey` — currently selected key (string).
#'   * `groupable` — logical, enable group headers (default `FALSE`).
#'   * `showCreation` — logical, show "New Chat" button (default `FALSE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXConversations <- .make_render_widget("conversations", antDesignXConversationsOutput)

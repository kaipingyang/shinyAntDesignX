#' Folder Widget — File tree explorer
#'
#' Renders a hierarchical file tree with inline content preview.
#' Clicking a file emits path + content to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXFolderOutput <- function(outputId, width = "100%", height = "500px", ...) {
  .widget_output_body("folder", outputId, width, height, ...)
}

#' Render Folder Widget
#'
#' @param expr A list with:
#'   * `treeData` — nested list. Each node: `list(title, path, content, children)`.
#'     Leaf nodes have no `children`. `content` is optional inline text.
#'   * `inputId` — optional, emits `list(path, content)` on file click.
#'   * `defaultExpandAll` — logical (default `TRUE`).
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXFolder <- .make_render_widget("folder", antDesignXFolderOutput)

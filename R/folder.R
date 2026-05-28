#' Folder Widget — File tree explorer
#'
#' Renders a hierarchical file tree with inline content preview.
#' Clicking a file emits path + content to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyFolderOutput <- function(outputId, width = "100%", height = "500px", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "folder",
    width = width, height = height, package = "shinyAntDesignX", ...)
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
renderShinyFolder <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "folder", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyFolderOutput, env = baseenv(), quoted = TRUE)
}

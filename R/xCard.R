#' XCard Widget — AI Agent-driven dynamic UI card (A2UI v0.9)
#'
#' Renders a dynamic UI card driven by JSON commands from R/AI Agent.
#' R pushes commands as a list; JS renders components, user interactions
#' emit action events back to `input$<inputId>`.
#'
#' @param outputId Output ID.
#' @param width,height CSS dimensions.
#' @param ... Passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
shinyXCardOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "xCard",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render XCard Widget
#'
#' @param expr A list with:
#'   * `inputId` — Shiny input ID for action events. Emits `list(name, surfaceId, context)`.
#'   * `surfaceId` — the surface/card ID string.
#'   * `commands` — list of A2UI v0.9 command objects. Each command is a named list.
#'     Build with [xcard_create_surface()], [xcard_update_components()], [xcard_update_data()].
#'   * `catalog` — optional named list defining custom component schemas.
#'
#' Built-in components: `Text`, `Button`, `Input`, `Select`, `Tag`.
#'
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderShinyXCard <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "xCard", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = shinyXCardOutput, env = baseenv(), quoted = TRUE)
}

#' Build A2UI createSurface command
#' @param surface_id Surface ID string.
#' @param catalog_id Catalog ID (default `"shiny-default"`).
#' @export
xcard_create_surface <- function(surface_id, catalog_id = "shiny-default") {
  list(version = "v0.9", createSurface = list(surfaceId = surface_id, catalogId = catalog_id))
}

#' Build A2UI updateComponents command
#' @param surface_id Surface ID.
#' @param components List of component definitions. Each: list with `id`, `component`,
#'   and any props.
#' @export
xcard_update_components <- function(surface_id, components) {
  list(version = "v0.9", updateComponents = list(surfaceId = surface_id, components = components))
}

#' Build A2UI updateDataModel command
#' @param surface_id Surface ID.
#' @param path JSON Pointer path (e.g. `"/form/name"`).
#' @param value Value to set.
#' @export
xcard_update_data <- function(surface_id, path, value) {
  list(version = "v0.9", updateDataModel = list(surfaceId = surface_id, path = path, value = value))
}

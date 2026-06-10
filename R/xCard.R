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
antDesignXCardOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(outputId = outputId, name = "xCard",
    width = width, height = height, package = "shinyAntDesignX", ...)
}

#' Render XCard Widget
#'
#' @param expr A list with:
#'   * `inputId` — Shiny input ID for action events. Emits `list(name, surfaceId, context)`.
#'   * `surfaceId` — surface ID string, or character vector for multiple surfaces.
#'   * `commands` — list of A2UI v0.9 command objects. Each command is a named list.
#'     Build with [xcard_create_surface()], [xcard_update_components()],
#'     [xcard_update_data()], [xcard_delete_surface()].
#'   * `catalog` — optional named list defining custom component schemas.
#'
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXCard <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "xCard", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = antDesignXCardOutput, env = baseenv(), quoted = TRUE)
}

#' Build A2UI createSurface command
#'
#' @param surface_id Surface ID string.
#' @param catalog_id Catalog ID (default `"shiny-default"`).
#' @param theme Optional named list with fields: `primaryColor` (hex), `iconUrl` (string),
#'   `agentDisplayName` (string). Used to visually distinguish multiple agents.
#' @param send_data_model If `TRUE`, the full data model is included in every action
#'   payload. Default `FALSE`. Useful when the agent needs current form state.
#'
#'   **Timing caveat**: `send_data_model = TRUE` guarantees the data model is
#'   present in the payload, but does **not** guarantee that `{ path }` context
#'   refs resolve to the *latest* value when the action is triggered from inside
#'   a `change` event (e.g. a `Select` onChange). The data model write from
#'   `onDataChange` is asynchronous; path resolution may read the previous value.
#'   This affects only "select-immediately-triggers-action" patterns.
#'   For "select then submit via a separate button" patterns, path refs are
#'   reliable. See `docs/xcard-interaction-protocol.md` Class C for details.
#' @export
xcard_create_surface <- function(surface_id, catalog_id = "shiny-default",
                                 theme = NULL, send_data_model = FALSE) {
  payload <- list(surfaceId = surface_id, catalogId = catalog_id)
  if (!is.null(theme)) payload$theme <- theme
  if (isTRUE(send_data_model)) payload$sendDataModel <- TRUE
  list(version = "v0.9", createSurface = payload)
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
#'
#' @param surface_id Surface ID.
#' @param path JSON Pointer path (e.g. `"/form/name"`). Defaults to `"/"` (full replace).
#' @param value Value to set. Omit (or pass `NULL`) to **delete** the key at `path`.
#' @export
xcard_update_data <- function(surface_id, path = "/", value = NULL) {
  payload <- list(surfaceId = surface_id, path = path)
  if (!is.null(value)) payload$value <- value
  list(version = "v0.9", updateDataModel = payload)
}

#' Build A2UI deleteSurface command
#'
#' Removes the surface and resets its component tree and data model.
#' Use when you want to fully clear a card and start fresh.
#'
#' @param surface_id Surface ID string.
#' @export
xcard_delete_surface <- function(surface_id) {
  list(version = "v0.9", deleteSurface = list(surfaceId = surface_id))
}

#' Clear all registered x-card catalogs from JS memory
#'
#' Useful when you need to re-register a modified catalog in the same session.
#' Call before [xcard_register_catalog()] to ensure the new version takes effect.
#'
#' @param session Shiny session object.
#' @export
xcard_clear_catalog_cache <- function(session = shiny::getDefaultReactiveDomain()) {
  session$sendCustomMessage("xcard:clearCatalogCache", list())
}

#' Validate component props against a registered catalog
#'
#' Sends a validation request to JS; result is emitted to `input$<input_id>`
#' as `list(valid = TRUE/FALSE, errors = character())`.
#'
#' @param input_id Shiny input ID to receive the result.
#' @param component Component name (e.g. `"Button"`).
#' @param props Named list of props to validate.
#' @param catalog_id Catalog ID to validate against (default `"shiny-default"`).
#' @param session Shiny session object.
#' @export
xcard_validate_component <- function(input_id, component, props = list(),
                                     catalog_id = "shiny-default",
                                     session = shiny::getDefaultReactiveDomain()) {
  session$sendCustomMessage("xcard:validateComponent", list(
    inputId   = input_id,
    catalogId = catalog_id,
    component = component,
    props     = props
  ))
}

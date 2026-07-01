# Internal utilities shared across the package — not exported.

`%||%` <- function(x, y) if (is.null(x)) y else x

# Check that a Suggests package is installed; stop with a friendly message if not.
.check_pkg <- function(pkg, fn_name) {
  if (!requireNamespace(pkg, quietly = TRUE))
    stop(sprintf(
      "Package '%s' required by %s() is not installed.\n  Install with: install.packages(\"%s\")",
      pkg, fn_name, pkg
    ), call. = FALSE)
}

# Factory: shared body for widget Output functions. Called from each widget's
# explicitly-typed Output function so that formals() match the Rd \usage entries.
.widget_output_body <- function(widget_name, outputId, width, height, ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId = outputId, name = widget_name,
    width = width, height = height, package = "shinyAntDesignX", ...)
}

# Factory: create a standard htmlwidget render function body.
# Call this to assign a render function: renderFoo <- .make_render_widget("foo", fooOutput)
.make_render_widget <- function(widget_name, output_fn) {
  force(widget_name); force(output_fn)
  function(expr, env = parent.frame(), quoted = FALSE) {
    func <- shiny::exprToFunction(expr, env, quoted)
    htmlwidgets::shinyRenderWidget(
      expr = bquote(htmlwidgets::createWidget(
               name = .(widget_name), x = .(func)(), package = "shinyAntDesignX")),
      outputFunction = output_fn, env = baseenv(), quoted = TRUE)
  }
}

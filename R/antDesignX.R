#' Ant Design X Chat UI Output
#'
#' Creates an htmlwidget output placeholder for the Ant Design X chat widget.
#'
#' @param outputId Output variable to read from.
#' @param width,height Width and height of the widget (CSS values).
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#'
#' @return An HTML output element.
#' @export
antDesignXOutput <- function(outputId, width = "100%", height = "600px", ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId  = outputId,
    name      = "antDesignX",
    width     = width,
    height    = height,
    package   = "shinyAntDesignX",
    ...
  )
}

#' Render an Ant Design X Widget
#'
#' Server-side render function for [antDesignXOutput()].
#'
#' @param config Optional named list of configuration options.
#' @param outputId The output ID used in [antDesignXOutput()].
#'
#' @return A render function suitable for assigning to `output[[outputId]]`.
#' @export
renderAntDesignX <- function(config = list(), outputId = NULL) {
  force(outputId)
  force(config)
  expr <- bquote(
    htmlwidgets::createWidget(
      name    = "antDesignX",
      x       = list(
        inputId = paste0(.(outputId), "_input"),
        config  = .(config)
      ),
      package = "shinyAntDesignX"
    )
  )
  htmlwidgets::shinyRenderWidget(expr, antDesignXOutput, baseenv(), quoted = TRUE)
}

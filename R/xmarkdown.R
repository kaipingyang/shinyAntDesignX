#' XMarkdown Output Widget
#'
#' Renders Markdown content using Ant Design X's XMarkdown renderer.
#' Supports streaming for AI chat responses.
#'
#' @param outputId Output variable to read from.
#' @param width,height CSS width and height.
#' @param ... Additional arguments passed to [htmlwidgets::shinyWidgetOutput()].
#' @export
antDesignXMarkdownOutput <- function(outputId, width = "100%", height = "auto", ...) {
  htmlwidgets::shinyWidgetOutput(
    outputId = outputId,
    name     = "xmarkdown",
    width    = width,
    height   = height,
    package  = "shinyAntDesignX",
    ...
  )
}

#' Render XMarkdown Widget
#'
#' @param expr An expression returning a list with:
#'   * `content` — Markdown string.
#'   * `streaming` — Controls streaming rendering. Three forms accepted:
#'     - `FALSE` (default): no streaming.
#'     - `TRUE`: shorthand for `list(hasNextChunk = TRUE, enableAnimation = TRUE)`.
#'     - Named list with any subset of:
#'       - `hasNextChunk` (logical): `TRUE` while chunks are still arriving;
#'         **must be set to `FALSE` on the final chunk** to flush buffered content.
#'       - `enableAnimation` (logical): fade-in animation for block elements.
#'       - `animationConfig` (named list): `list(fadeDuration = 200, easing = "ease-in-out")`.
#'       - `tail` (logical or named list): streaming cursor. `TRUE` → default `▋` cursor.
#'         Named list: `list(content = "▌")` or `list(component = NULL)` (JS-only).
#'       - `incompleteMarkdownComponentMap` (named list): map of token type → component name
#'         for in-progress link/image placeholders. Defaults: `list(link = "incomplete-link",
#'         image = "incomplete-image")`.
#'   * `openLinksInNewTab` — logical (default `FALSE`). Add `target="_blank"` to all links.
#'   * `className` — CSS class added to the root container.
#'   * `rootClassName` — Alias for `className` (upstream accepts both).
#'   * `style` — Named list of inline CSS styles, e.g. `list(fontSize = "14px")`.
#'   * `paragraphTag` — HTML tag for `<p>` elements, e.g. `"div"`. Useful when custom
#'     components contain block-level elements and trigger HTML validation errors.
#'   * `components` — Named list mapping HTML tag names to preset component names.
#'     Replaces the default rendering of that HTML element with a built-in styled component.
#'     Available presets:
#'     - `"CodeBlock"` — Block code (`code` with `block=TRUE`): syntax-highlighted with
#'       PrismLight (`react-syntax-highlighter`) bundled directly in this widget.
#'       Supported languages: `r`/`R`, `python`, `javascript`/`js`, `typescript`/`ts`,
#'       `bash`/`shell`/`sh`, `sql`, `json`, `html`/`xml`, `css`,
#'       `jsx`, `tsx`, `yaml`/`yml`. Theme: One Dark.
#'       Map to tag `"code"`. Note: does **not** use `@ant-design/x` `CodeHighlighter`.
#'     - `"InlineCode"` — Inline `code`: renders with antd `Typography.Text code` styling.
#'       Map to tag `"code"` (XMarkdown passes `block=FALSE` for inline code).
#'     - `"ExternalLink"` — Anchor `a`: renders with antd `Typography.Link` + `↗` icon;
#'       opens in new tab by default. Map to tag `"a"`.
#'     Example: `list(code = "CodeBlock", a = "ExternalLink")`
#'     Note: `"CodeBlock"` and `"InlineCode"` both map to `"code"` — choose one per render.
#'   * `dompurifyConfig` — Named list of DOMPurify options for HTML sanitisation /
#'     XSS protection, e.g. `list(ALLOWED_TAGS = list("b", "i", "em", "strong"))`.
#'   * `protectCustomTagNewlines` — logical (default `FALSE`). Preserve newlines inside
#'     custom HTML tags.
#'   * `escapeRawHtml` — logical (default `FALSE`). Render raw HTML as plain text instead
#'     of parsing it as real HTML. Safer than DOMPurify for fully-untrusted content.
#'   * `debug` — logical (default `FALSE`). Show performance overlay (FPS / memory /
#'     render time). Development use only.
#' @param env,quoted Passed to [shiny::exprToFunction()].
#' @export
renderAntDesignXMarkdown <- function(expr, env = parent.frame(), quoted = FALSE) {
  func <- shiny::exprToFunction(expr, env, quoted)
  htmlwidgets::shinyRenderWidget(
    expr           = bquote(htmlwidgets::createWidget(
                       name = "xmarkdown", x = .(func)(), package = "shinyAntDesignX")),
    outputFunction = antDesignXMarkdownOutput,
    env            = baseenv(),
    quoted         = TRUE
  )
}

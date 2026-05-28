#' Ant Design X Server Module
#'
#' Handles the server-side logic for an [antDesignXOutput()] widget: receives
#' user messages, calls a backend handler, and streams responses back to the UI.
#'
#' @param id The module ID matching the `outputId` passed to [antDesignXOutput()].
#' @param handler A function with signature
#'   `function(message, thread_id, on_chunk, on_done, on_error,
#'              on_tool_call, on_tool_result, is_reload)` where:
#'   * `message` — character string of the user's message.
#'   * `thread_id` — character string identifying the current thread.
#'   * `on_chunk(text)` — call repeatedly to stream response tokens.
#'   * `on_done()` — call once when the response is complete.
#'   * `on_error(msg)` — call to surface an error in the UI.
#'   * `on_tool_call(tool_call_id, tool_name, args, annotations)` — show a
#'     tool call card. `args` should be a named list. `annotations` is an
#'     optional named list. Recognized keys:
#'     * `icon` — ant design icon name
#'     * `title` — display name shown in the card header
#'     * `requiresApproval` — `TRUE` to show Approve/Deny buttons
#'     * `resultType` — how to render the result: `"auto"` (default),
#'       `"markdown"`, `"table"`, `"code"`, `"image"`, `"file"`, `"html"`
#'     * `resultLang` — language for `resultType = "code"` (e.g. `"r"`)
#'     * `resultFilename` — filename for `resultType = "file"` download
#'   * `on_tool_result(tool_call_id, result, is_error = FALSE)` — update the
#'     tool card with the result.
#'   * `on_thinking(text)` — stream reasoning/thinking tokens.
#'   * `attachments` — list of named lists with `type`, `name`, `data`, `contentType`.
#'   * `is_reload` — `TRUE` when the user clicked "regenerate".
#'   * `is_cancelled` — zero-argument function returning `TRUE` once stopped.
#'   * `wait_for_approval` — `function(tool_call_id)` returning a promise
#'     that resolves to `TRUE` (approved) or `FALSE` (denied).
#'   * `register_cancel` — `function(fn)` to register a cancel callback.
#'
#' @param show_conversation_list Logical. If `TRUE`, conversation list sidebar shown.
#' @param suggestions List of starter suggestions. Each element: list with `prompt`
#'   and optional `text`.
#' @param commands List of slash-command definitions. Each: list with `name`,
#'   `description`, `prompt`.
#' @param tools List of tool definitions for display. Each: list with `name`, `description`.
#' @param on_action `function(id)` called when action items are triggered.
#' @param action_items List of action items for slash menu.
#' @param on_session_load `function(session_id, thread_id, send_thread)` for
#'   lazy-loading historical session messages.
#' @param on_feedback `function(message_id, type)` for thumbs up/down feedback.
#' @param strings Optional named list for overriding UI text.
#' @param assistant_avatar Named list with `fallback`, `src`, `alt` fields.
#'
#' @return A list with `clear()`, `send_tool_call()`, `send_tool_result()`,
#'   and `send_sessions()` functions.
#' @export
antDesignXServer <- function(id, handler,
                             show_conversation_list = FALSE,
                             suggestions            = list(),
                             commands               = list(),
                             tools                  = list(),
                             action_items           = list(),
                             on_action              = NULL,
                             on_session_load        = NULL,
                             on_feedback            = NULL,
                             strings                = NULL,
                             assistant_avatar       = list(fallback = "AI")) {
  force(show_conversation_list); force(suggestions); force(commands)
  force(tools); force(action_items); force(on_action); force(on_session_load)
  force(on_feedback); force(strings); force(assistant_avatar)
  session  <- shiny::getDefaultReactiveDomain()
  input_id <- paste0(id, "_input")

  config <- list(
    show_conversation_list = show_conversation_list,
    suggestions            = suggestions,
    commands               = commands,
    tools                  = tools,
    action_items           = action_items
  )
  if (!is.null(strings))          config$strings          <- strings
  if (!is.null(assistant_avatar)) config$assistant_avatar <- assistant_avatar

  session$output[[id]] <- renderAntDesignX(
    config   = config,
    outputId = id
  )

  cancel_flags <- new.env(parent = emptyenv())
  cancel_fns   <- new.env(parent = emptyenv())

  on_chunk <- function(text) {
    session$sendCustomMessage(paste0(input_id, ":chunk"), list(text = text))
  }
  on_done <- function() {
    session$sendCustomMessage(paste0(input_id, ":done"), list())
  }
  on_error_fn <- function(msg) {
    session$sendCustomMessage(paste0(input_id, ":error"), list(message = msg))
  }
  on_tool_call <- function(tool_call_id, tool_name, args = list(),
                           annotations = list()) {
    session$sendCustomMessage(
      paste0(input_id, ":tool-call"),
      list(
        toolCallId  = tool_call_id,
        toolName    = tool_name,
        args        = args,
        argsText    = as.character(jsonlite::toJSON(args, auto_unbox = TRUE, pretty = FALSE)),
        annotations = annotations
      )
    )
  }
  on_tool_result <- function(tool_call_id, result, is_error = FALSE) {
    session$sendCustomMessage(
      paste0(input_id, ":tool-result"),
      list(toolCallId = tool_call_id, result = result, isError = is_error)
    )
  }
  on_thinking <- function(text) {
    session$sendCustomMessage(paste0(input_id, ":thinking"), list(text = text))
  }

  approval_resolvers <- new.env(parent = emptyenv())

  shiny::observeEvent(session$input[[paste0(input_id, "_tool_approval")]], {
    msg <- session$input[[paste0(input_id, "_tool_approval")]]
    if (is.null(msg)) return()
    tid <- msg$toolCallId
    resolver <- get0(tid, envir = approval_resolvers)
    if (!is.null(resolver)) {
      rm(list = tid, envir = approval_resolvers)
      resolver(isTRUE(msg$approved))
    }
  }, ignoreNULL = TRUE, ignoreInit = TRUE)

  wait_for_approval <- function(tool_call_id) {
    promises::promise(function(resolve, reject) {
      assign(tool_call_id, resolve, envir = approval_resolvers)
    })
  }

  if (!is.null(on_action)) {
    shiny::observeEvent(session$input[[paste0(input_id, "_action")]], {
      msg <- session$input[[paste0(input_id, "_action")]]
      if (is.null(msg)) return()
      on_action(msg$id)
    }, ignoreNULL = TRUE, ignoreInit = TRUE)
  }

  if (!is.null(on_feedback)) {
    shiny::observeEvent(session$input[[paste0(input_id, "_feedback")]], {
      fb <- session$input[[paste0(input_id, "_feedback")]]
      if (is.null(fb)) return()
      on_feedback(fb$messageId, fb$type)
    }, ignoreNULL = TRUE, ignoreInit = TRUE)
  }

  shiny::observeEvent(session$input[[paste0(input_id, "_cancel")]], {
    msg <- session$input[[paste0(input_id, "_cancel")]]
    if (is.null(msg)) return()
    tid <- msg$threadId %||% "default"
    assign(tid, TRUE, envir = cancel_flags)
    cancel_fn <- get0(tid, envir = cancel_fns)
    if (!is.null(cancel_fn)) {
      rm(list = tid, envir = cancel_fns)
      tryCatch(cancel_fn(), error = function(e) NULL)
    }
    for (key in ls(approval_resolvers)) {
      resolver <- get0(key, envir = approval_resolvers)
      if (!is.null(resolver)) {
        rm(list = key, envir = approval_resolvers)
        tryCatch(resolver(FALSE), error = function(e) NULL)
      }
    }
  }, ignoreNULL = TRUE, ignoreInit = TRUE)

  stream_task <- shiny::ExtendedTask$new(
    function(msg_text, thread_id, is_reload, attachments) {
      is_cancelled   <- function() isTRUE(get0(thread_id, envir = cancel_flags))
      register_cancel <- function(fn) assign(thread_id, fn, envir = cancel_fns)

      all_args <- list(
        message           = msg_text,
        thread_id         = thread_id,
        on_chunk          = on_chunk,
        on_done           = on_done,
        on_error          = on_error_fn,
        on_tool_call      = on_tool_call,
        on_tool_result    = on_tool_result,
        on_thinking       = on_thinking,
        attachments       = attachments,
        is_reload         = is_reload,
        is_cancelled      = is_cancelled,
        wait_for_approval = wait_for_approval,
        register_cancel   = register_cancel
      )
      handler_params <- names(formals(handler))
      call_args <- if ("..." %in% handler_params) all_args
                   else all_args[names(all_args) %in% handler_params]

      result <- tryCatch(
        do.call(handler, call_args),
        error = function(e) { on_error_fn(conditionMessage(e)); NULL }
      )
      if (inherits(result, "promise")) {
        promises::catch(result, function(e) { on_error_fn(conditionMessage(e)); NULL })
      } else {
        promises::promise_resolve(NULL)
      }
    }
  )

  pending_sessions <- NULL

  shiny::observeEvent(session$input[[paste0(input_id, "_sessions_ready")]], {
    if (!is.null(pending_sessions)) {
      session$sendCustomMessage(paste0(input_id, ":sessions"), pending_sessions)
    }
  }, ignoreNULL = TRUE, ignoreInit = TRUE)

  shiny::observeEvent(session$input[[input_id]], {
    msg <- session$input[[input_id]]
    if (is.null(msg)) return()
    if (!identical(msg$type, "load_session") && !nzchar(trimws(msg$text %||% ""))) return()

    if (identical(msg$type, "load_session") && !is.null(on_session_load)) {
      send_thread <- function(messages) {
        session$sendCustomMessage(
          paste0(input_id, ":load-thread"),
          list(threadId = msg$threadId, messages = messages)
        )
      }
      on_session_load(msg$sessionId, msg$threadId, send_thread)
      return()
    }

    thread_id <- msg$threadId %||% "default"
    is_reload <- identical(msg$type, "reload")

    assign(thread_id, FALSE, envir = cancel_flags)
    if (exists(thread_id, envir = cancel_fns)) rm(list = thread_id, envir = cancel_fns)

    stream_task$invoke(
      msg$text,
      thread_id,
      is_reload,
      msg$attachments %||% list()
    )
  }, ignoreNULL = TRUE, ignoreInit = TRUE)

  invisible(list(
    clear = function() {
      session$sendCustomMessage(paste0(input_id, ":clear"), list())
    },
    send_tool_call = function(tool_call_id, tool_name, args = list()) {
      on_tool_call(tool_call_id, tool_name, args)
    },
    send_tool_result = function(tool_call_id, result, is_error = FALSE) {
      on_tool_result(tool_call_id, result, is_error)
    },
    send_sessions = function(sessions) {
      pending_sessions <<- sessions
      session$sendCustomMessage(paste0(input_id, ":sessions"), sessions)
    }
  ))
}

`%||%` <- function(x, y) if (is.null(x)) y else x

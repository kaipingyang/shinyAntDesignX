library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── xCard Replay Safety 测试 ──────────────────────────────────────────────────
#
# 目的：验证 useRef + forceUpdate 模式在 xCard command replay 场景下有效。
#
# 背景：每次追加新命令，Card.tsx 会重放所有历史 updateComponents 命令（带
#       原始 prop 值）。受控组件会被 prop 重置为初始值；useRef 组件不会。
#
# 测试方法：
#   1. 把所有输入组件**同时**渲染在卡片上
#   2. 修改各组件的值（拖 Slider、勾选、输入文字等）
#   3. 点"触发 Replay"按钮 —— 追加一个 updateDataModel 命令（不涉及任何
#      输入路径），触发 Card.tsx 重放所有历史命令
#   4. 观察：所有输入组件的用户修改值**应该保留**，不回退到初始值
#
# 如果组件还原成初始值 → useRef 模式失效（bug）
# 如果组件保持用户修改值 → useRef 模式工作正常

surface_id <- "replay_test"

ui <- page_fillable(
  padding = 16,
  layout_columns(
    col_widths = c(3, 9),
    card(
      height = "95vh",
      card_header("控制面板"),
      card_body(
        overflow_y = "auto",
        tags$style(HTML(".btn-ctrl { width: 100%; margin-bottom: 6px; }")),
        p("测试步骤：", style = "font-weight:600;font-size:12px;"),
        tags$ol(style = "font-size:11px;color:#374151;padding-left:16px;",
          tags$li("点「初始化表单」加载所有输入组件"),
          tags$li("修改各组件：拖 Slider、勾选、输入文字等"),
          tags$li("点「触发 Replay」追加无关命令（不含输入路径）"),
          tags$li("观察：修改值应保留，不回退到初始值")
        ),
        hr(),
        actionButton("btn_init",   "① 初始化表单",   class = "btn-ctrl",
                     style = "background:#3b82f6;color:white;"),
        actionButton("btn_replay", "② 触发 Replay",  class = "btn-ctrl",
                     style = "background:#f59e0b;color:white;"),
        hr(),
        actionButton("btn_reset",  "重置",            class = "btn-ctrl",
                     style = "background:#f3f4f6;"),
        hr(),
        p("Replay 计数：", style = "font-size:12px;font-weight:600;"),
        verbatimTextOutput("replay_count", placeholder = FALSE),
        hr(),
        p("数据模型快照：", style = "font-size:12px;font-weight:600;"),
        verbatimTextOutput("data_snapshot", placeholder = FALSE)
      )
    ),
    card(
      height = "95vh",
      card_header("XCard — Replay Safety 测试"),
      card_body(
        fillable = FALSE, overflow_y = "auto",
        antDesignXCardOutput("test_card", height = "auto")
      )
    )
  )
)

server <- function(input, output, session) {

  # surfaceId 随重置变化，强制 React 卸载旧 XCard.Card 挂载新的
  sid         <- reactiveVal(surface_id)
  cmds        <- reactiveVal(list(xcard_create_surface(surface_id, send_data_model = TRUE)))
  replay_cnt  <- reactiveVal(0L)
  data_snap   <- reactiveVal(list())

  push_cmds <- function(new_cmds) cmds(c(cmds(), new_cmds))

  output$test_card <- renderAntDesignXCard({
    list(inputId = "card_action", surfaceId = sid(), commands = cmds())
  })

  # ① 初始化：把所有输入组件一次性推入，保持同时可见
  observeEvent(input$btn_init, {
    push_cmds(list(
      xcard_update_components(sid(), list(
        # ── 文本输入 ────────────────────────────────────────────────────────
        list(id = "sec1",    component = "Divider",     text = "文本输入"),
        list(id = "inp1",    component = "Input",
             label = "姓名", placeholder = "修改后触发 Replay 应保留",
             value = "Alice", dataPath = "name"),
        list(id = "inp2",    component = "Textarea",
             label = "备注", placeholder = "多行输入",
             value = "初始内容", rows = 2L, dataPath = "remark"),
        list(id = "inp3",    component = "InputNumber",
             label = "年龄", value = 25L, min = 0L, max = 120L, dataPath = "age"),

        # ── 滑块 ────────────────────────────────────────────────────────────
        list(id = "sec2",    component = "Divider",     text = "Slider"),
        list(id = "sl1",     component = "Slider",
             value = 40L, min = 0L, max = 100L, step = 5L, dataPath = "volume"),

        # ── 多选 ─────────────────────────────────────────────────────────────
        list(id = "sec3",    component = "Divider",     text = "CheckboxGroup + SwitchInput + Rate"),
        list(id = "cbg1",    component = "CheckboxGroup",
             label   = "技术栈（勾选后触发 Replay 应保留）",
             options = list("R", "Python", "JavaScript", "Rust"),
             value   = list("R"), dataPath = "techstack"),

        # ── 开关 ────────────────────────────────────────────────────────────
        list(id = "sw1",     component = "SwitchInput",
             label = "深色模式", checked = FALSE, dataPath = "darkMode"),

        # ── 评分 ────────────────────────────────────────────────────────────
        list(id = "rt1",     component = "Rate",
             value = 3L, count = 5L, dataPath = "rating"),

        # ── Tabs ─────────────────────────────────────────────────────────────
        list(id = "sec4",    component = "Divider",     text = "Tabs（切换后触发 Replay 应保留）"),
        list(id = "tb1",     component = "Tabs",
             activeKey = "tab1", dataPath = "activeTab",
             items = list(
               list(key = "tab1", label = "Tab A", content = "内容 A"),
               list(key = "tab2", label = "Tab B", content = "内容 B"),
               list(key = "tab3", label = "Tab C", content = "内容 C")
             )),

        # ── ChoicePicker ────────────────────────────────────────────────────
        list(id = "sec5",    component = "Divider",     text = "ChoicePicker"),
        list(id = "cp1",     component = "ChoicePicker",
             label = "语言（单选）", variant = "single",
             options = list("R", "Python", "Julia"), dataPath = "lang"),

        # ── Root ─────────────────────────────────────────────────────────────
        list(id = "root",    component = "Container", gap = 4L,
             children = list(
               "sec1", "inp1", "inp2", "inp3",
               "sec2", "sl1",
               "sec3", "cbg1", "sw1", "rt1",
               "sec4", "tb1",
               "sec5", "cp1"
             ))
      ))
    ))
  })

  # ② 触发 Replay：只追加一个与输入无关的 updateDataModel（修改计数器路径）
  # 这会让 Card.tsx 重放所有历史 updateComponents（含原始 prop 值）
  # useRef 组件应保持用户修改值；受控组件会被重置
  observeEvent(input$btn_replay, {
    replay_cnt(replay_cnt() + 1L)
    push_cmds(list(
      xcard_update_data(sid(), "/replayCount", replay_cnt())
    ))
  })

  observeEvent(input$btn_reset, {
    new_sid <- paste0(surface_id, "_", as.integer(Sys.time()))
    sid(new_sid)
    cmds(list(xcard_create_surface(new_sid, send_data_model = TRUE)))
    replay_cnt(0L)
    data_snap(list())
  })

  # 接收 dataModel 快照（send_data_model = TRUE 时每次 action 携带完整数据）
  observeEvent(input$card_action, {
    act <- input$card_action
    if (!is.null(act$context)) data_snap(act$context)
  })

  output$replay_count <- renderPrint({
    cat("已触发 replay 次数：", replay_cnt(), "\n")
  })

  output$data_snapshot <- renderPrint({
    snap <- data_snap()
    if (length(snap) == 0) {
      cat("（点任意 action 后显示 dataModel 快照）\n")
    } else {
      str(snap, max.level = 2)
    }
  })
}

shinyApp(ui, server)

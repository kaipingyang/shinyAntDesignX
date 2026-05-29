import React, { useRef, useCallback, useState } from "react";
import ReactDOM from "react-dom/client";
import { Attachments } from "@ant-design/x";
import type { AttachmentsProps, AttachmentsRef } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

type AttachmentFile = AttachmentsProps["items"] extends (infer T)[] | undefined ? T : never;

interface AttachmentsWidgetProps {
  inputId: string;
  maxCount?: number;
  multiple?: boolean;
  accept?: string;
  placeholderTitle?: string;
  placeholderDescription?: string;
  overflow?: "wrap" | "scrollX" | "scrollY";
}

function AttachmentsWidget({
  inputId,
  maxCount = 5,
  multiple = true,
  accept,
  placeholderTitle = "Upload files",
  placeholderDescription = "Click or drag files here to upload",
  overflow = "wrap",
}: AttachmentsWidgetProps) {
  const [items, setItems] = useState<AttachmentFile[]>([]);
  const ref = useRef<AttachmentsRef>(null);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleChange: AttachmentsProps["onChange"] = useCallback(
    async ({ fileList }) => {
      // Create object URLs for preview
      const updated = fileList.map((item) => {
        if (item.originFileObj && !item.url) {
          return { ...item, url: URL.createObjectURL(item.originFileObj) };
        }
        return item;
      });
      setItems(updated as AttachmentFile[]);

      // Emit to Shiny: encode changed files as base64
      const encoded = await Promise.all(
        fileList
          .filter((f) => f.originFileObj && f.status !== "removed")
          .map(async (f) => ({
            uid: f.uid,
            name: f.name,
            size: f.size,
            type: f.type,
            data: await readFileAsBase64(f.originFileObj!),
          }))
      );
      Shiny.setInputValue(inputId, { files: encoded, count: encoded.length, ts: Date.now() }, { priority: "event" });
    },
    [inputId]
  );

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Attachments
        ref={ref}
        multiple={multiple}
        maxCount={maxCount}
        accept={accept}
        beforeUpload={() => false}
        items={items}
        onChange={handleChange}
        overflow={overflow}
        placeholder={(type) =>
          type === "drop"
            ? { title: "Drop files here" }
            : {
                icon: <CloudUploadOutlined />,
                title: placeholderTitle,
                description: placeholderDescription,
              }
        }
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "attachments",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: AttachmentsWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<AttachmentsWidget {...x} />);
      },
      resize() {},
    };
  },
});

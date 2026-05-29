import React from "react";
import ReactDOM from "react-dom/client";
import { FileCard } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface FileCardItem {
  name: string;
  byte?: number;
  type?: string;
  src?: string;
  loading?: boolean;
}

interface FileCardWidgetProps {
  inputId?: string;
  items: FileCardItem[];
  size?: "small" | "default";
}

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "ico"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
const VIDEO_EXT = ["mp4", "avi", "mov", "mkv", "webm", "flv"];

function guessMediaType(name: string): "image" | "audio" | "video" | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXT.includes(ext)) return "image";
  if (AUDIO_EXT.includes(ext)) return "audio";
  if (VIDEO_EXT.includes(ext)) return "video";
  return null;
}

// When type is image/audio/video but no src provided, fall back to file icon preset
function resolveType(item: FileCardItem): { type?: string; icon?: string } {
  if (item.src) return { type: item.type };
  const mediaType = item.type as string || guessMediaType(item.name) || "";
  const iconMap: Record<string, string> = {
    image: "image", audio: "audio", video: "video",
  };
  if (iconMap[mediaType]) return { type: "file", icon: iconMap[mediaType] };
  return { type: item.type };
}

function FileCardWidget({ inputId, items, size = "default" }: FileCardWidgetProps) {
  if (items.length === 1) {
    const item = items[0];
    const { type, icon } = resolveType(item);
    return (
      <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
        <FileCard
          name={item.name}
          byte={item.byte}
          type={type as "file" | "image" | undefined}
          icon={icon as string | undefined}
          src={item.src}
          loading={item.loading}
          size={size}
          onClick={inputId ? (_, e) => {
            e.preventDefault();
            Shiny.setInputValue(inputId, { name: item.name, ts: Date.now() }, { priority: "event" });
          } : undefined}
        />
      </ConfigProvider>
    );
  }
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <FileCard.List
        items={items.map((item, i) => {
          const { type, icon } = resolveType(item);
          return {
            name: item.name,
            byte: item.byte,
            type: type as "file" | "image" | undefined,
            icon: icon as string | undefined,
            src: item.src,
            loading: item.loading,
            uid: String(i),
          };
        })}
        size={size}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "fileCard",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: FileCardWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<FileCardWidget {...x} />);
      },
      resize() {},
    };
  },
});

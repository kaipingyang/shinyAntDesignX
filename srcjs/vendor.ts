// x-sdk has no UMD build — wrap as IIFE exposing window.AntDesignXSdk
import * as AntDesignXSdk from "@ant-design/x-sdk";
(window as any).AntDesignXSdk = AntDesignXSdk;

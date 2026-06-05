// x-sdk has no pre-built UMD — bundle it as IIFE and expose as window.AntDesignXSdk.
// React must be declared external so x-sdk uses the same window.React instance
// already loaded by react.production.min.js. Without this, two React instances
// would exist and React context/hooks would break across widget boundaries.
import * as AntDesignXSdk from "@ant-design/x-sdk";
(window as any).AntDesignXSdk = AntDesignXSdk;

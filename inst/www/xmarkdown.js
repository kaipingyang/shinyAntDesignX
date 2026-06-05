(function(y,k,w,x){"use strict";var _={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function O(){if(R)return u;R=1;var t=y,s=Symbol.for("react.element"),f=Symbol.for("react.fragment"),n=Object.prototype.hasOwnProperty,i=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function a(o,e,d){var r,l={},p=null,v=null;d!==void 0&&(p=""+d),e.key!==void 0&&(p=""+e.key),e.ref!==void 0&&(v=e.ref);for(r in e)n.call(e,r)&&!c.hasOwnProperty(r)&&(l[r]=e[r]);if(o&&o.defaultProps)for(r in e=o.defaultProps,e)l[r]===void 0&&(l[r]=e[r]);return{$$typeof:s,type:o,key:p,ref:v,props:l,_owner:i.current}}return u.Fragment=f,u.jsx=a,u.jsxs=a,u}var h;function g(){return h||(h=1,_.exports=O()),_.exports}var m=g();function j(t){if(t)return t===!0?{hasNextChunk:!0,enableAnimation:!0}:t}function E({content:t="",streaming:s,openLinksInNewTab:f=!1,className:n,rootClassName:i,style:c,paragraphTag:a,dompurifyConfig:o,protectCustomTagNewlines:e,escapeRawHtml:d,debug:r}){return m.jsx(x.ConfigProvider,{theme:{algorithm:x.theme.defaultAlgorithm},children:m.jsx(w.XMarkdown,{content:t,streaming:j(s),openLinksInNewTab:f,className:n,rootClassName:i,style:c,paragraphTag:a,dompurifyConfig:o,protectCustomTagNewlines:e,escapeRawHtml:d,debug:r})})}HTMLWidgets.widget({name:"xmarkdown",type:"output",factory(t,s,f){let n=null;return{renderValue(i){n||(n=k.createRoot(t)),n.render(m.jsx(E,{...i}))},resize(){}}}})})(React,ReactDOM,XMarkdown,antd);

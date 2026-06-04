(function(v,w,h,p){"use strict";var a={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _;function k(){if(_)return i;_=1;var t=v,e=Symbol.for("react.element"),u=Symbol.for("react.fragment"),l=Object.prototype.hasOwnProperty,o=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,b={key:!0,ref:!0,__self:!0,__source:!0};function y(d,r,R){var n,c={},f=null,x=null;R!==void 0&&(f=""+R),r.key!==void 0&&(f=""+r.key),r.ref!==void 0&&(x=r.ref);for(n in r)l.call(r,n)&&!b.hasOwnProperty(n)&&(c[n]=r[n]);if(d&&d.defaultProps)for(n in r=d.defaultProps,r)c[n]===void 0&&(c[n]=r[n]);return{$$typeof:e,type:d,key:f,ref:x,props:c,_owner:o.current}}return i.Fragment=u,i.jsx=y,i.jsxs=y,i}var m;function g(){return m||(m=1,a.exports=k()),a.exports}var s=g();function j(t){if(!t)return;const e={copy:"📋",like:"👍",dislike:"👎",refresh:"🔄",share:"🔗",delete:"🗑️",edit:"✏️",download:"⬇️",audio:"🔊"};return e[t]?s.jsx("span",{children:e[t]}):void 0}function O({inputId:t,items:e,variant:u="borderless"}){const l=e.map(o=>({key:o.key,label:o.label,icon:j(o.icon),danger:o.danger,onItemClick:()=>{Shiny.setInputValue(t,{key:o.key,ts:Date.now()},{priority:"event"})}}));return s.jsx(p.ConfigProvider,{theme:{algorithm:p.theme.defaultAlgorithm},children:s.jsx(h.Actions,{items:l,variant:u})})}HTMLWidgets.widget({name:"actions",type:"output",factory(t){let e=null;return{renderValue(u){e||(e=w.createRoot(t)),e.render(s.jsx(O,{...u}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

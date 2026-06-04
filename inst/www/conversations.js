(function(_,h,g,m){"use strict";var c={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var y;function O(){if(y)return i;y=1;var o=_,r=Symbol.for("react.element"),s=Symbol.for("react.fragment"),l=Object.prototype.hasOwnProperty,d=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function u(n,e,x){var t,a={},v=null,w=null;x!==void 0&&(v=""+x),e.key!==void 0&&(v=""+e.key),e.ref!==void 0&&(w=e.ref);for(t in e)l.call(e,t)&&!p.hasOwnProperty(t)&&(a[t]=e[t]);if(n&&n.defaultProps)for(t in e=n.defaultProps,e)a[t]===void 0&&(a[t]=e[t]);return{$$typeof:r,type:n,key:v,ref:w,props:a,_owner:d.current}}return i.Fragment=s,i.jsx=u,i.jsxs=u,i}var R;function j(){return R||(R=1,c.exports=O()),c.exports}var f=j();function S({inputId:o,items:r,activeKey:s,groupable:l=!1,showCreation:d=!1}){const[p,u]=_.useState(s);return f.jsx(m.ConfigProvider,{theme:{algorithm:m.theme.defaultAlgorithm},children:f.jsx(g.Conversations,{items:r,activeKey:p,groupable:l,creation:d?{onClick:()=>{u(void 0),Shiny.setInputValue(`${o}_new`,{ts:Date.now()},{priority:"event"})}}:void 0,onActiveChange:n=>{u(n),Shiny.setInputValue(o,{key:n,ts:Date.now()},{priority:"event"})}})})}HTMLWidgets.widget({name:"conversations",type:"output",factory(o){let r=null;return{renderValue(s){r||(r=h.createRoot(o)),r.render(f.jsx(S,{...s}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

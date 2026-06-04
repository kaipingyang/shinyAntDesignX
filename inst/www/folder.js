(function(v,h,O,p){"use strict";var l={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _;function j(){if(_)return o;_=1;var n=v,t=Symbol.for("react.element"),i=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,c=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,k={key:!0,ref:!0,__self:!0,__source:!0};function R(u,e,x){var r,s={},d=null,y=null;x!==void 0&&(d=""+x),e.key!==void 0&&(d=""+e.key),e.ref!==void 0&&(y=e.ref);for(r in e)a.call(e,r)&&!k.hasOwnProperty(r)&&(s[r]=e[r]);if(u&&u.defaultProps)for(r in e=u.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:u,key:d,ref:y,props:s,_owner:c.current}}return o.Fragment=i,o.jsx=R,o.jsxs=R,o}var m;function g(){return m||(m=1,l.exports=j()),l.exports}var f=g();function E({inputId:n,treeData:t,defaultExpandAll:i=!0}){return f.jsx(p.ConfigProvider,{theme:{algorithm:p.theme.defaultAlgorithm},children:f.jsx(O.Folder,{treeData:t,defaultExpandAll:i,onFileClick:(a,c)=>{n&&Shiny.setInputValue(n,{path:a,content:c??null,ts:Date.now()},{priority:"event"})}})})}HTMLWidgets.widget({name:"folder",type:"output",factory(n){let t=null;return{renderValue(i){t||(t=h.createRoot(n)),t.render(f.jsx(E,{...i}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

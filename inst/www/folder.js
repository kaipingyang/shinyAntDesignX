(function(w,v,h,p){"use strict";var l={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _;function O(){if(_)return o;_=1;var n=w,t=Symbol.for("react.element"),i=Symbol.for("react.fragment"),d=Object.prototype.hasOwnProperty,a=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,E={key:!0,ref:!0,__self:!0,__source:!0};function R(u,e,x){var r,s={},c=null,y=null;x!==void 0&&(c=""+x),e.key!==void 0&&(c=""+e.key),e.ref!==void 0&&(y=e.ref);for(r in e)d.call(e,r)&&!E.hasOwnProperty(r)&&(s[r]=e[r]);if(u&&u.defaultProps)for(r in e=u.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:u,key:c,ref:y,props:s,_owner:a.current}}return o.Fragment=i,o.jsx=R,o.jsxs=R,o}var m;function g(){return m||(m=1,l.exports=O()),l.exports}var f=g();function j({inputId:n,treeData:t,defaultExpandAll:i=!0}){return f.jsx(p.ConfigProvider,{theme:{algorithm:p.theme.defaultAlgorithm},children:f.jsx(h.Folder,{treeData:t,defaultExpandAll:i,onFileClick:(d,a)=>{n&&Shiny.setInputValue(n,{path:d,content:a??null,ts:Date.now()},{priority:"event"})}})})}HTMLWidgets.widget({name:"folder",type:"output",factory(n){let t=null;return{renderValue(i){t||(t=v.createRoot(n)),t.render(f.jsx(j,{...i}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

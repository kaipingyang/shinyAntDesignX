(function(h,k,O,d){"use strict";var f={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function j(){if(R)return u;R=1;var o=h,t=Symbol.for("react.element"),i=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,p=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,n={key:!0,ref:!0,__self:!0,__source:!0};function m(s,e,y){var r,l={},_=null,v=null;y!==void 0&&(_=""+y),e.key!==void 0&&(_=""+e.key),e.ref!==void 0&&(v=e.ref);for(r in e)c.call(e,r)&&!n.hasOwnProperty(r)&&(l[r]=e[r]);if(s&&s.defaultProps)for(r in e=s.defaultProps,e)l[r]===void 0&&(l[r]=e[r]);return{$$typeof:t,type:s,key:_,ref:v,props:l,_owner:p.current}}return u.Fragment=i,u.jsx=m,u.jsxs=m,u}var x;function w(){return x||(x=1,f.exports=j()),f.exports}var a=w();function S({inputId:o,items:t,title:i,defaultExpanded:c=!0,inline:p=!1}){return a.jsx(d.ConfigProvider,{theme:{algorithm:d.theme.defaultAlgorithm},children:a.jsx(O.Sources,{title:i,items:t,defaultExpanded:c,inline:p,onClick:n=>{o?Shiny.setInputValue(o,{key:n.key,title:n.title,url:n.url,ts:Date.now()},{priority:"event"}):n.url&&window.open(n.url,"_blank")}})})}HTMLWidgets.widget({name:"sources",type:"output",factory(o){let t=null;return{renderValue(i){t||(t=k.createRoot(o)),t.render(a.jsx(S,{...i}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

(function(v,h,k,_){"use strict";var f={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function O(){if(R)return u;R=1;var o=v,t=Symbol.for("react.element"),i=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,d=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,n={key:!0,ref:!0,__self:!0,__source:!0};function x(s,e,y){var r,l={},p=null,w=null;y!==void 0&&(p=""+y),e.key!==void 0&&(p=""+e.key),e.ref!==void 0&&(w=e.ref);for(r in e)c.call(e,r)&&!n.hasOwnProperty(r)&&(l[r]=e[r]);if(s&&s.defaultProps)for(r in e=s.defaultProps,e)l[r]===void 0&&(l[r]=e[r]);return{$$typeof:t,type:s,key:p,ref:w,props:l,_owner:d.current}}return u.Fragment=i,u.jsx=x,u.jsxs=x,u}var m;function g(){return m||(m=1,f.exports=O()),f.exports}var a=g();function j({inputId:o,items:t,title:i,defaultExpanded:c=!0,inline:d=!1}){return a.jsx(_.ConfigProvider,{theme:{algorithm:_.theme.defaultAlgorithm},children:a.jsx(k.Sources,{title:i,items:t,defaultExpanded:c,inline:d,onClick:n=>{o?Shiny.setInputValue(o,{key:n.key,title:n.title,url:n.url,ts:Date.now()},{priority:"event"}):n.url&&window.open(n.url,"_blank")}})})}HTMLWidgets.widget({name:"sources",type:"output",factory(o){let t=null;return{renderValue(i){t||(t=h.createRoot(o)),t.render(a.jsx(j,{...i}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

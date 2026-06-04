(function(h,v,y,_){"use strict";var d={exports:{}},t={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var c;function g(){if(c)return t;c=1;var n=h,i=Symbol.for("react.element"),u=Symbol.for("react.fragment"),o=Object.prototype.hasOwnProperty,l=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,j={key:!0,ref:!0,__self:!0,__source:!0};function x(s,e,R){var r,a={},m=null,w=null;R!==void 0&&(m=""+R),e.key!==void 0&&(m=""+e.key),e.ref!==void 0&&(w=e.ref);for(r in e)o.call(e,r)&&!j.hasOwnProperty(r)&&(a[r]=e[r]);if(s&&s.defaultProps)for(r in e=s.defaultProps,e)a[r]===void 0&&(a[r]=e[r]);return{$$typeof:i,type:s,key:m,ref:w,props:a,_owner:l.current}}return t.Fragment=u,t.jsx=x,t.jsxs=x,t}var p;function k(){return p||(p=1,d.exports=g()),d.exports}var f=k();function O({content:n,streaming:i=!1,openLinksInNewTab:u=!1}){return f.jsx(_.ConfigProvider,{theme:{algorithm:_.theme.defaultAlgorithm},children:f.jsx(y.XMarkdown,{content:n,streaming:i?{hasNextChunk:!0,enableAnimation:!0}:void 0,openLinksInNewTab:u})})}HTMLWidgets.widget({name:"xmarkdown",type:"output",factory(n,i,u){let o=null;return{renderValue(l){o||(o=v.createRoot(n)),o.render(f.jsx(O,{...l}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignXMarkdown,window.antd);

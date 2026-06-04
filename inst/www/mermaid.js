(function(a,y,O,p){"use strict";var m={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function g(){if(R)return n;R=1;var i=a,u=Symbol.for("react.element"),o=Symbol.for("react.fragment"),t=Object.prototype.hasOwnProperty,s=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,k={key:!0,ref:!0,__self:!0,__source:!0};function x(f,e,h){var r,d={},_=null,v=null;h!==void 0&&(_=""+h),e.key!==void 0&&(_=""+e.key),e.ref!==void 0&&(v=e.ref);for(r in e)t.call(e,r)&&!k.hasOwnProperty(r)&&(d[r]=e[r]);if(f&&f.defaultProps)for(r in e=f.defaultProps,e)d[r]===void 0&&(d[r]=e[r]);return{$$typeof:u,type:f,key:_,ref:v,props:d,_owner:s.current}}return n.Fragment=o,n.jsx=x,n.jsxs=x,n}var l;function j(){return l||(l=1,m.exports=g()),m.exports}var c=j();function E({diagram:i,enableZoom:u=!0,enableDownload:o=!0,enableCopy:t=!0}){const s=a.useMemo(()=>({enableZoom:u,enableDownload:o,enableCopy:t}),[u,o,t]);return c.jsx(p.ConfigProvider,{theme:{algorithm:p.theme.defaultAlgorithm},children:c.jsx(O.Mermaid,{actions:s,children:i})})}HTMLWidgets.widget({name:"mermaid",type:"output",factory(i,u,o){let t=null;return{renderValue(s){t||(t=y.createRoot(i)),t.render(c.jsx(E,{...s}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

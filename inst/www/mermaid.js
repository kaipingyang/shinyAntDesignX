(function(a,v,y,p){"use strict";var m={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function g(){if(R)return n;R=1;var i=a,o=Symbol.for("react.element"),u=Symbol.for("react.fragment"),t=Object.prototype.hasOwnProperty,s=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,E={key:!0,ref:!0,__self:!0,__source:!0};function x(d,e,h){var r,f={},_=null,w=null;h!==void 0&&(_=""+h),e.key!==void 0&&(_=""+e.key),e.ref!==void 0&&(w=e.ref);for(r in e)t.call(e,r)&&!E.hasOwnProperty(r)&&(f[r]=e[r]);if(d&&d.defaultProps)for(r in e=d.defaultProps,e)f[r]===void 0&&(f[r]=e[r]);return{$$typeof:o,type:d,key:_,ref:w,props:f,_owner:s.current}}return n.Fragment=u,n.jsx=x,n.jsxs=x,n}var l;function O(){return l||(l=1,m.exports=g()),m.exports}var c=O();function j({diagram:i,enableZoom:o=!0,enableDownload:u=!0,enableCopy:t=!0}){const s=a.useMemo(()=>({enableZoom:o,enableDownload:u,enableCopy:t}),[o,u,t]);return c.jsx(p.ConfigProvider,{theme:{algorithm:p.theme.defaultAlgorithm},children:c.jsx(y.Mermaid,{actions:s,children:i})})}HTMLWidgets.widget({name:"mermaid",type:"output",factory(i,o,u){let t=null;return{renderValue(s){t||(t=v.createRoot(i)),t.render(c.jsx(j,{...s}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

(function(d,h,l){"use strict";var m={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function O(){if(R)return i;R=1;var n=d,r=Symbol.for("react.element"),o=Symbol.for("react.fragment"),u=Object.prototype.hasOwnProperty,p=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function s(f,e,y){var t,a={},_=null,g=null;y!==void 0&&(_=""+y),e.key!==void 0&&(_=""+e.key),e.ref!==void 0&&(g=e.ref);for(t in e)u.call(e,t)&&!c.hasOwnProperty(t)&&(a[t]=e[t]);if(f&&f.defaultProps)for(t in e=f.defaultProps,e)a[t]===void 0&&(a[t]=e[t]);return{$$typeof:r,type:f,key:_,ref:g,props:a,_owner:p.current}}return i.Fragment=o,i.jsx=s,i.jsxs=s,i}var x;function E(){return x||(x=1,m.exports=O()),m.exports}var v=E();function j({type:n="info",content:r,duration:o=3,key:u,ts:p}){const[c,s]=l.message.useMessage();return d.useEffect(()=>{r&&c.open({type:n,content:r,duration:o,...u?{key:u}:{}})},[n,r,o,u,p]),s}HTMLWidgets.widget({name:"message",type:"output",factory(n){let r=null;return{renderValue(o){r||(n.style.display="none",r=h.createRoot(n)),r.render(v.jsx(l.ConfigProvider,{theme:{algorithm:l.theme.defaultAlgorithm},children:v.jsx(j,{...o})}))},resize(){}}}})})(React,ReactDOM,antd);

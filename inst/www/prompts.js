(function(h,k,O,_){"use strict";var l={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var y;function b(){if(y)return o;y=1;var i=h,n=Symbol.for("react.element"),u=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,f=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function r(s,e,x){var t,a={},d=null,v=null;x!==void 0&&(d=""+x),e.key!==void 0&&(d=""+e.key),e.ref!==void 0&&(v=e.ref);for(t in e)m.call(e,t)&&!c.hasOwnProperty(t)&&(a[t]=e[t]);if(s&&s.defaultProps)for(t in e=s.defaultProps,e)a[t]===void 0&&(a[t]=e[t]);return{$$typeof:n,type:s,key:d,ref:v,props:a,_owner:f.current}}return o.Fragment=u,o.jsx=r,o.jsxs=r,o}var R;function j(){return R||(R=1,l.exports=b()),l.exports}var p=j();function g({inputId:i,items:n,title:u,vertical:m=!1,wrap:f=!0}){const c=n.map(r=>({key:r.key,label:r.label,description:r.description}));return p.jsx(_.ConfigProvider,{theme:{algorithm:_.theme.defaultAlgorithm},children:p.jsx(O.Prompts,{title:u,items:c,vertical:m,wrap:f,onItemClick:r=>{Shiny.setInputValue(i,{key:r.data.key,label:r.data.label,ts:Date.now()},{priority:"event"})}})})}HTMLWidgets.widget({name:"prompts",type:"output",factory(i){let n=null;return{renderValue(u){n||(n=k.createRoot(i)),n.render(p.jsx(g,{...u}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

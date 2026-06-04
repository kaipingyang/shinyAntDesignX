(function(v,h,k,_){"use strict";var l={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var y;function O(){if(y)return o;y=1;var i=v,n=Symbol.for("react.element"),u=Symbol.for("react.fragment"),d=Object.prototype.hasOwnProperty,m=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,f={key:!0,ref:!0,__self:!0,__source:!0};function r(s,e,x){var t,a={},c=null,w=null;x!==void 0&&(c=""+x),e.key!==void 0&&(c=""+e.key),e.ref!==void 0&&(w=e.ref);for(t in e)d.call(e,t)&&!f.hasOwnProperty(t)&&(a[t]=e[t]);if(s&&s.defaultProps)for(t in e=s.defaultProps,e)a[t]===void 0&&(a[t]=e[t]);return{$$typeof:n,type:s,key:c,ref:w,props:a,_owner:m.current}}return o.Fragment=u,o.jsx=r,o.jsxs=r,o}var R;function b(){return R||(R=1,l.exports=O()),l.exports}var p=b();function g({inputId:i,items:n,title:u,vertical:d=!1,wrap:m=!0}){const f=n.map(r=>({key:r.key,label:r.label,description:r.description}));return p.jsx(_.ConfigProvider,{theme:{algorithm:_.theme.defaultAlgorithm},children:p.jsx(k.Prompts,{title:u,items:f,vertical:d,wrap:m,onItemClick:r=>{Shiny.setInputValue(i,{key:r.data.key,label:r.data.label,ts:Date.now()},{priority:"event"})}})})}HTMLWidgets.widget({name:"prompts",type:"output",factory(i){let n=null;return{renderValue(u){n||(n=h.createRoot(i)),n.render(p.jsx(g,{...u}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

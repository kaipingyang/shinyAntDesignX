(function(y,g,m){"use strict";var _={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var x;function O(){if(x)return s;x=1;var r=y,n=Symbol.for("react.element"),t=Symbol.for("react.fragment"),f=Object.prototype.hasOwnProperty,a=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function i(u,e,l){var o,p={},R=null,h=null;l!==void 0&&(R=""+l),e.key!==void 0&&(R=""+e.key),e.ref!==void 0&&(h=e.ref);for(o in e)f.call(e,o)&&!c.hasOwnProperty(o)&&(p[o]=e[o]);if(u&&u.defaultProps)for(o in e=u.defaultProps,e)p[o]===void 0&&(p[o]=e[o]);return{$$typeof:n,type:u,key:R,ref:h,props:p,_owner:a.current}}return s.Fragment=t,s.jsx=i,s.jsxs=i,s}var d;function E(){return d||(d=1,_.exports=O()),_.exports}var v=E();function j({inputId:r,type:n="info",message:t,description:f,placement:a="topRight",duration:c=4.5,key:i,ts:u}){const[e,l]=m.notification.useNotification();return y.useEffect(()=>{t&&e.open({type:n,message:t,description:f,placement:a,duration:c,...i?{key:i}:{},onClick:()=>{r&&Shiny.setInputValue(r,{action:"click",key:i??t,ts:Date.now()},{priority:"event"})},onClose:()=>{r&&Shiny.setInputValue(r,{action:"close",key:i??t,ts:Date.now()},{priority:"event"})}})},[n,t,f,a,c,i,u]),l}HTMLWidgets.widget({name:"notify",type:"output",factory(r){let n=null;return{renderValue(t){n||(r.style.display="none",n=g.createRoot(r)),n.render(v.jsx(m.ConfigProvider,{theme:{algorithm:m.theme.defaultAlgorithm},children:v.jsx(j,{...t})}))},resize(){}}}})})(React,ReactDOM,antd);

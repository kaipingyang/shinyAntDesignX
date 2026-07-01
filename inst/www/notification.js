(function(R,g,y,c){"use strict";var d={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var v;function E(){if(v)return u;v=1;var n=R,r=Symbol.for("react.element"),i=Symbol.for("react.fragment"),l=Object.prototype.hasOwnProperty,f=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function o(s,e,a){var t,m={},_=null,O=null;a!==void 0&&(_=""+a),e.key!==void 0&&(_=""+e.key),e.ref!==void 0&&(O=e.ref);for(t in e)l.call(e,t)&&!p.hasOwnProperty(t)&&(m[t]=e[t]);if(s&&s.defaultProps)for(t in e=s.defaultProps,e)m[t]===void 0&&(m[t]=e[t]);return{$$typeof:r,type:s,key:_,ref:O,props:m,_owner:f.current}}return u.Fragment=i,u.jsx=o,u.jsxs=o,u}var x;function j(){return x||(x=1,d.exports=E()),d.exports}var h=j();function k({inputId:n,title:r,body:i,icon:l,tag:f,duration:p=4,requireInteraction:o=!1,requestPermission:s=!1}){return R.useEffect(()=>{const e=()=>{c.notification.open({title:r,body:i,icon:l,tag:f,requireInteraction:o,...o?{}:{duration:p},onClick:(a,t)=>{n&&Shiny.setInputValue(n,{action:"click",tag:f??r,ts:Date.now()},{priority:"event"}),t()}})};c.notification.permission==="granted"?e():c.notification.permission!=="denied"&&s&&c.notification.requestPermission().then(a=>{a==="granted"&&e()})},[r,i,l,f,p,o]),null}HTMLWidgets.widget({name:"notification",type:"output",factory(n){let r=null;return{renderValue(i){r||(n.style.display="none",r=g.createRoot(n)),r.render(h.jsx(y.ConfigProvider,{theme:{algorithm:y.theme.defaultAlgorithm},children:h.jsx(k,{...i})}))},resize(){}}}})})(React,ReactDOM,antd,antdx);

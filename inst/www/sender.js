(function(i,h,v,y){"use strict";var d={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var g;function O(){if(g)return s;g=1;var t=i,n=Symbol.for("react.element"),u=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,_=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function a(o,r,l){var e,f={},x=null,S=null;l!==void 0&&(x=""+l),r.key!==void 0&&(x=""+r.key),r.ref!==void 0&&(S=r.ref);for(e in r)c.call(r,e)&&!p.hasOwnProperty(e)&&(f[e]=r[e]);if(o&&o.defaultProps)for(e in r=o.defaultProps,r)f[e]===void 0&&(f[e]=r[e]);return{$$typeof:n,type:o,key:x,ref:S,props:f,_owner:_.current}}return s.Fragment=u,s.jsx=a,s.jsxs=a,s}var R;function j(){return R||(R=1,d.exports=O()),d.exports}var m=j();function E({inputId:t,placeholder:n="Send a message…",loading:u=!1,allowSpeech:c=!1,submitType:_}){const[p,a]=i.useState(""),[o,r]=i.useState(u);i.useEffect(()=>{Shiny.addCustomMessageHandler(`${t}:loading`,e=>{r(e.loading)})},[t]);const l=i.useCallback(e=>{e.trim()&&(Shiny.setInputValue(t,{text:e,ts:Date.now()},{priority:"event"}),a(""))},[t]);return m.jsx(y.ConfigProvider,{theme:{algorithm:y.theme.defaultAlgorithm},children:m.jsx(v.Sender,{value:p,onChange:a,onSubmit:l,placeholder:n,loading:o,onCancel:()=>r(!1),allowSpeech:c,submitType:_})})}HTMLWidgets.widget({name:"sender",type:"output",factory(t){let n=null;return{renderValue(u){n||(n=h.createRoot(t)),n.render(m.jsx(E,{...u}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

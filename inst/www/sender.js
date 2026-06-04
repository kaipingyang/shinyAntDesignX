(function(i,h,v,x){"use strict";var f={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var y;function w(){if(y)return s;y=1;var t=i,n=Symbol.for("react.element"),u=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,_=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function a(o,r,l){var e,d={},g=null,S=null;l!==void 0&&(g=""+l),r.key!==void 0&&(g=""+r.key),r.ref!==void 0&&(S=r.ref);for(e in r)c.call(r,e)&&!p.hasOwnProperty(e)&&(d[e]=r[e]);if(o&&o.defaultProps)for(e in r=o.defaultProps,r)d[e]===void 0&&(d[e]=r[e]);return{$$typeof:n,type:o,key:g,ref:S,props:d,_owner:_.current}}return s.Fragment=u,s.jsx=a,s.jsxs=a,s}var R;function O(){return R||(R=1,f.exports=w()),f.exports}var m=O();function j({inputId:t,placeholder:n="Send a message…",loading:u=!1,allowSpeech:c=!1,submitType:_}){const[p,a]=i.useState(""),[o,r]=i.useState(u);i.useEffect(()=>{Shiny.addCustomMessageHandler(`${t}:loading`,e=>{r(e.loading)})},[t]);const l=i.useCallback(e=>{e.trim()&&(Shiny.setInputValue(t,{text:e,ts:Date.now()},{priority:"event"}),a(""))},[t]);return m.jsx(x.ConfigProvider,{theme:{algorithm:x.theme.defaultAlgorithm},children:m.jsx(v.Sender,{value:p,onChange:a,onSubmit:l,placeholder:n,loading:o,onCancel:()=>r(!1),allowSpeech:c,submitType:_})})}HTMLWidgets.widget({name:"sender",type:"output",factory(t){let n=null;return{renderValue(u){n||(n=h.createRoot(t)),n.render(m.jsx(j,{...u}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

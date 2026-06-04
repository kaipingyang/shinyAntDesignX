(function(f,h,j,l,k){"use strict";var d={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var x;function g(){if(x)return i;x=1;var n=f,e=Symbol.for("react.element"),s=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,p=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,o={key:!0,ref:!0,__self:!0,__source:!0};function b(c,r,y){var t,a={},_=null,v=null;y!==void 0&&(_=""+y),r.key!==void 0&&(_=""+r.key),r.ref!==void 0&&(v=r.ref);for(t in r)m.call(r,t)&&!o.hasOwnProperty(t)&&(a[t]=r[t]);if(c&&c.defaultProps)for(t in r=c.defaultProps,r)a[t]===void 0&&(a[t]=r[t]);return{$$typeof:e,type:c,key:_,ref:v,props:a,_owner:p.current}}return i.Fragment=s,i.jsx=b,i.jsxs=b,i}var R;function O(){return R||(R=1,d.exports=g()),d.exports}var u=O();function w({items:n,assistantAvatar:e={fallback:"AI"},userPlacement:s="end"}){const m=f.useMemo(()=>({user:{placement:s},assistant:{placement:"start",avatar:e.src?u.jsx(l.Avatar,{src:e.src}):u.jsx(l.Avatar,{children:e.fallback??"AI"}),contentRender:o=>u.jsx(k,{content:o})},system:{variant:"borderless"}}),[e,s]),p=f.useMemo(()=>n.map(o=>({key:o.key,role:o.role,content:o.content,loading:o.loading})),[n]);return u.jsx(l.ConfigProvider,{theme:{algorithm:l.theme.defaultAlgorithm},children:u.jsx(j.Bubble.List,{items:p,role:m,autoScroll:!0})})}HTMLWidgets.widget({name:"bubbleList",type:"output",factory(n){let e=null;return{renderValue(s){e||(n.style.overflow="hidden",e=h.createRoot(n)),e.render(u.jsx(w,{...s}))},resize(){}}}})})(React,ReactDOM,antdx,antd,XMarkdown);

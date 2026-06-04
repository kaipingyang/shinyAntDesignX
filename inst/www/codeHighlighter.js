(function(g,v,y,c){"use strict";var f={exports:{}},t={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var h;function O(){if(h)return t;h=1;var i=g,o=Symbol.for("react.element"),u=Symbol.for("react.fragment"),n=Object.prototype.hasOwnProperty,a=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,w={key:!0,ref:!0,__self:!0,__source:!0};function p(s,e,R){var r,d={},_=null,x=null;R!==void 0&&(_=""+R),e.key!==void 0&&(_=""+e.key),e.ref!==void 0&&(x=e.ref);for(r in e)n.call(e,r)&&!w.hasOwnProperty(r)&&(d[r]=e[r]);if(s&&s.defaultProps)for(r in e=s.defaultProps,e)d[r]===void 0&&(d[r]=e[r]);return{$$typeof:o,type:s,key:_,ref:x,props:d,_owner:a.current}}return t.Fragment=u,t.jsx=p,t.jsxs=p,t}var m;function j(){return m||(m=1,f.exports=O()),f.exports}var l=j();function E({code:i,lang:o,showHeader:u=!0}){return l.jsx(c.ConfigProvider,{theme:{algorithm:c.theme.defaultAlgorithm},children:l.jsx(y.CodeHighlighter,{lang:o,header:u?void 0:!1,children:i})})}HTMLWidgets.widget({name:"codeHighlighter",type:"output",factory(i,o,u){let n=null;return{renderValue(a){n||(n=v.createRoot(i)),n.render(l.jsx(E,{...a}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

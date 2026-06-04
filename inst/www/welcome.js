(function(x,y,v,c){"use strict";var f={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var m;function h(){if(m)return n;m=1;var o=x,t=Symbol.for("react.element"),i=Symbol.for("react.fragment"),g=Object.prototype.hasOwnProperty,w=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,E={key:!0,ref:!0,__self:!0,__source:!0};function p(u,e,_){var r,s={},a=null,R=null;_!==void 0&&(a=""+_),e.key!==void 0&&(a=""+e.key),e.ref!==void 0&&(R=e.ref);for(r in e)g.call(e,r)&&!E.hasOwnProperty(r)&&(s[r]=e[r]);if(u&&u.defaultProps)for(r in e=u.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:u,key:a,ref:R,props:s,_owner:w.current}}return n.Fragment=i,n.jsx=p,n.jsxs=p,n}var d;function O(){return d||(d=1,f.exports=h()),f.exports}var l=O();function j({title:o="AI Assistant",description:t="How can I help you today?",variant:i="filled"}){return l.jsx(c.ConfigProvider,{theme:{algorithm:c.theme.defaultAlgorithm},children:l.jsx(v.Welcome,{title:o,description:t,variant:i})})}HTMLWidgets.widget({name:"welcome",type:"output",factory(o){let t=null;return{renderValue(i){t||(t=y.createRoot(o)),t.render(l.jsx(j,{...i}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

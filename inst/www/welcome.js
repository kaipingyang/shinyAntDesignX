(function(x,w,y,c){"use strict";var f={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var a;function v(){if(a)return n;a=1;var o=x,t=Symbol.for("react.element"),i=Symbol.for("react.fragment"),g=Object.prototype.hasOwnProperty,j=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,E={key:!0,ref:!0,__self:!0,__source:!0};function p(u,e,_){var r,s={},d=null,R=null;_!==void 0&&(d=""+_),e.key!==void 0&&(d=""+e.key),e.ref!==void 0&&(R=e.ref);for(r in e)g.call(e,r)&&!E.hasOwnProperty(r)&&(s[r]=e[r]);if(u&&u.defaultProps)for(r in e=u.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:u,key:d,ref:R,props:s,_owner:j.current}}return n.Fragment=i,n.jsx=p,n.jsxs=p,n}var m;function h(){return m||(m=1,f.exports=v()),f.exports}var l=h();function O({title:o="AI Assistant",description:t="How can I help you today?",variant:i="filled"}){return l.jsx(c.ConfigProvider,{theme:{algorithm:c.theme.defaultAlgorithm},children:l.jsx(y.Welcome,{title:o,description:t,variant:i})})}HTMLWidgets.widget({name:"welcome",type:"output",factory(o){let t=null;return{renderValue(i){t||(t=w.createRoot(o)),t.render(l.jsx(O,{...i}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

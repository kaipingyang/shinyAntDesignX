(function(h,w,y,c){"use strict";var f={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _;function v(){if(_)return i;_=1;var o=h,t=Symbol.for("react.element"),n=Symbol.for("react.fragment"),l=Object.prototype.hasOwnProperty,j=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,g={key:!0,ref:!0,__self:!0,__source:!0};function p(u,e,R){var r,s={},a=null,x=null;R!==void 0&&(a=""+R),e.key!==void 0&&(a=""+e.key),e.ref!==void 0&&(x=e.ref);for(r in e)l.call(e,r)&&!g.hasOwnProperty(r)&&(s[r]=e[r]);if(u&&u.defaultProps)for(r in e=u.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:u,key:a,ref:x,props:s,_owner:j.current}}return i.Fragment=n,i.jsx=p,i.jsxs=p,i}var m;function k(){return m||(m=1,f.exports=v()),f.exports}var d=k();function O({content:o,title:t,loading:n=!1,defaultExpanded:l=!1}){return d.jsx(c.ConfigProvider,{theme:{algorithm:c.theme.defaultAlgorithm},children:d.jsx(y.Think,{title:t,loading:n,blink:n,defaultExpanded:l,children:o})})}HTMLWidgets.widget({name:"think",type:"output",factory(o){let t=null;return{renderValue(n){t||(t=w.createRoot(o)),t.render(d.jsx(O,{...n}))},resize(){}}}})})(window.React,window.ReactDOM,window.AntDesignX,window.antd);

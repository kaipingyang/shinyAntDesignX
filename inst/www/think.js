(function(h,y,v,_){"use strict";var f={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d;function k(){if(d)return i;d=1;var o=h,t=Symbol.for("react.element"),n=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,E=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,g={key:!0,ref:!0,__self:!0,__source:!0};function p(u,e,R){var r,s={},c=null,x=null;R!==void 0&&(c=""+R),e.key!==void 0&&(c=""+e.key),e.ref!==void 0&&(x=e.ref);for(r in e)a.call(e,r)&&!g.hasOwnProperty(r)&&(s[r]=e[r]);if(u&&u.defaultProps)for(r in e=u.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:u,key:c,ref:x,props:s,_owner:E.current}}return i.Fragment=n,i.jsx=p,i.jsxs=p,i}var m;function O(){return m||(m=1,f.exports=k()),f.exports}var l=O();function j({content:o,title:t,loading:n=!1,defaultExpanded:a=!1}){return l.jsx(_.ConfigProvider,{theme:{algorithm:_.theme.defaultAlgorithm},children:l.jsx(v.Think,{title:t,loading:n,blink:n,defaultExpanded:a,children:o})})}HTMLWidgets.widget({name:"think",type:"output",factory(o){let t=null;return{renderValue(n){t||(t=y.createRoot(o)),t.render(l.jsx(j,{...n}))},resize(){}}}})})(React,ReactDOM,antdx,antd);

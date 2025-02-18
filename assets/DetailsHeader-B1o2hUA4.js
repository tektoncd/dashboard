import{j as a}from"./jsx-runtime-B0wN4eWF.js";import{u as b}from"./index-CbuwW4_d.js";import{g as c}from"./index-CfoIBI3E.js";import{S as x}from"./StatusIcon-CsvDFwWU.js";import{P as T}from"./bucket-12-DVDhO4p7.js";import{F as j}from"./FormattedDuration-hz7jymot.js";import{d as p}from"./constants-CJ-WDauL.js";function D({displayName:m,exitCode:k,hasWarning:f,reason:t,stepStatus:d,status:i,taskRun:o={},type:g="step"}){const e=b();function h(){let{completionTime:s,startTime:n}=o.status||{};return d&&({finishedAt:s,startedAt:n}=d.terminated||{}),!n||!s||new Date(n).getTime()===0?null:a.jsx("span",{className:"tkn--run-details-time",children:e.formatMessage({id:"dashboard.run.duration",defaultMessage:"Duration: {duration}"},{duration:a.jsx(j,{milliseconds:new Date(s).getTime()-new Date(n).getTime()})})})}function M(){const{reason:s,status:n}=c(o);return d?.terminationReason==="Skipped"?e.formatMessage({id:"dashboard.taskRun.status.skipped",defaultMessage:"Skipped"}):i==="cancelled"||i==="terminated"&&(t==="TaskRunCancelled"||t==="TaskRunTimeout")?e.formatMessage({id:"dashboard.taskRun.status.cancelled",defaultMessage:"Cancelled"}):i==="running"?e.formatMessage({id:"dashboard.taskRun.status.running",defaultMessage:"Running"}):i==="terminated"?t==="Completed"?f?e.formatMessage({id:"dashboard.taskRun.status.succeeded.warning",defaultMessage:"Completed with exit code {exitCode}"},{exitCode:k}):e.formatMessage({id:"dashboard.taskRun.status.succeeded",defaultMessage:"Completed"}):e.formatMessage({id:"dashboard.taskRun.status.failed",defaultMessage:"Failed"}):n==="Unknown"&&s==="Pending"?e.formatMessage({id:"dashboard.taskRun.status.waiting",defaultMessage:"Waiting"}):e.formatMessage({id:"dashboard.taskRun.status.notRun",defaultMessage:"Not run"})}let u;const R=h();let r=t,l=i;return g==="taskRun"?({reason:r,status:l}=c(o),u=t===p?e.formatMessage({id:"dashboard.taskRun.status.skipped",defaultMessage:"Skipped"}):r||e.formatMessage({id:"dashboard.taskRun.status.pending",defaultMessage:"Pending"})):u=M(),a.jsxs("header",{className:"tkn--step-details-header","data-status":l,"data-reason":r,"data-termination-reason":d?.terminationReason,children:[a.jsxs("h2",{className:"tkn--details-header--heading",children:[a.jsx(x,{DefaultIcon:s=>a.jsx(T,{size:24,...s}),hasWarning:f,reason:t===p?t:r,status:l,...g==="step"?{terminationReason:d?.terminationReason,type:"inverse"}:null}),a.jsx("span",{className:"tkn--run-details-name",title:m,children:m}),a.jsx("span",{className:"tkn--status-label",children:u})]}),R]})}D.__docgenInfo={description:"",methods:[],displayName:"DetailsHeader",props:{taskRun:{defaultValue:{value:"{}",computed:!1},required:!1},type:{defaultValue:{value:"'step'",computed:!1},required:!1}}};export{D};

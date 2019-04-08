/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';

import './Spinner.scss';

export default function Spinner({ className }) {
  return (
    <svg
      aria-label="running"
      className={`spinner ${className}`}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5,8c0,1.199,0.4,2.299,1.3,3.1l-0.7,0.699c-1-1-1.6-2.398-1.6-3.799C2.5,5,5,2.5,8,2.5h0.3L7,1.2l0.8-0.7
        L10.3,3L7.8,5.5L7,4.8l1.3-1.3H8C5.5,3.5,3.5,5.5,3.5,8 M13.5,8c0-1.4-0.6-2.8-1.6-3.8l-0.7,0.699C12,5.7,12.5,6.899,12.5,8
        c0,2.5-2,4.5-4.5,4.5H7.8L9,11.299L8.3,10.5L5.8,13l2.5,2.5L9,14.799L7.8,13.5h0.3C11.1,13.5,13.5,11,13.5,8"
      />
    </svg>
  );
}

/*
Copyright 2022-2026 The Tekton Authors
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
/* istanbul ignore next */

const UserInterface = ({ children, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    {children}
    <path d="M29 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M26.5 3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1m-2 0a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1M31 30.36H1A.36.36 0 0 1 .64 30V2A.36.36 0 0 1 1 1.64h30a.36.36 0 0 1 .36.36v28a.36.36 0 0 1-.36.36m-29.64-.72h29.28V5.36H1.36zm0-25h29.28V2.36H1.36zM15 25.36h-5a.36.36 0 0 1-.36-.36v-3a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.28v-2.28h-4.28zM22 20.36h-5a.36.36 0 0 1-.36-.36v-3a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.279v-2.28H17.36zm-2.36.72h-5a.36.36 0 0 1-.36-.36v-3a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.28v-2.28h-4.28zM22 15.36h-5a.36.36 0 0 1-.36-.36v-3a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.279v-2.28H17.36zm-2.36.72h-5a.36.36 0 0 1-.36-.36v-3a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.28v-2.28h-4.28zM8 15.36H3a.36.36 0 0 1-.36-.36v-3a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.28v-2.28H3.36zM29 10.36h-5a.36.36 0 0 1-.36-.36V7a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.279V7.36H24.36zm-2.36.72h-5a.36.36 0 0 1-.36-.36V7a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.279V7.36H17.36zm-2.36.72h-5a.36.36 0 0 1-.36-.36V7a.36.36 0 0 1 .36-.36h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.28V7.36h-4.28zM8 10.36H3a.36.36 0 0 1-.36-.36V7A.36.36 0 0 1 3 6.64h5a.36.36 0 0 1 .36.36v3a.36.36 0 0 1-.36.36m-4.64-.72h4.28V7.36H3.36z" />
  </svg>
);

export default UserInterface;

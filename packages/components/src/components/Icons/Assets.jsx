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

const Assets = ({ children, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
    {children}
    <path d="M31 .64H10a.36.36 0 0 0-.36.36v2.64H1A.36.36 0 0 0 .64 4v27c0 .199.161.36.36.36h21a.36.36 0 0 0 .36-.36v-2.64H31a.36.36 0 0 0 .36-.36V1A.36.36 0 0 0 31 .64m-9.36 30H1.36V4.36h14.28V10c0 .199.161.36.36.36h5.64zM16.36 4.869l4.771 4.771H16.36zM30.64 27.64h-8.28V10a.36.36 0 0 0-.105-.254l-6-6A.36.36 0 0 0 16 3.64h-5.64V1.36h20.28zM19.36 16a.36.36 0 0 1-.36.36H4a.36.36 0 1 1 0-.72h15a.36.36 0 0 1 .36.36m0 3a.36.36 0 0 1-.36.36H4a.36.36 0 1 1 0-.72h15a.36.36 0 0 1 .36.36m0 3a.36.36 0 0 1-.36.36H4a.36.36 0 1 1 0-.72h15a.36.36 0 0 1 .36.36m0 3a.36.36 0 0 1-.36.36H4a.36.36 0 1 1 0-.72h15a.36.36 0 0 1 .36.36" />
  </svg>
);

export default Assets;

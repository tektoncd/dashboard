/*
Copyright 2025 The Tekton Authors
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

const RunMetadataColumn = ({ columnHeader, columnContent }) => {
  if (!columnContent) {
    return null;
  }

  return (
    <div className="tkn--metadata-column">
      <h3 className="tkn--metadata-column-header">{columnHeader}</h3>
      <div className="tkn-metadata-column-content">{columnContent}</div>
    </div>
  );
};
export default RunMetadataColumn;

/*
Copyright 2019-2024 The Tekton Authors
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

import PropTypes from 'prop-types';
import jsYaml from 'js-yaml';
import { classNames } from '@tektoncd/dashboard-utils';

import { usePrefix } from '@carbon/react';
import SyntaxHighlighter from './SyntaxHighlighter';

function YAMLRaw({ children, className }) {
  return (
    <div className={className}>
      <code>
        <pre>{children}</pre>
      </code>
    </div>
  );
}

function ViewYAML({
  className,
  dark,
  enableSyntaxHighlighting = false,
  resource,
  title
}) {
  const carbonPrefix = usePrefix();
  let yamlComponent;
  if (enableSyntaxHighlighting && typeof resource !== 'string') {
    yamlComponent = <SyntaxHighlighter resource={resource} />;
  } else {
    const clz = classNames(`${carbonPrefix}--snippet--multi`, className, {
      'tkn--view-yaml--dark': dark
    });
    const yaml = jsYaml.dump(resource);
    yamlComponent = <YAMLRaw className={clz}>{yaml}</YAMLRaw>;
  }

  return (
    <>
      {title && <span className="tkn--view-yaml--title">{title}</span>}
      {yamlComponent}
    </>
  );
}

ViewYAML.propTypes = {
  resource: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({}),
    PropTypes.string
  ]).isRequired,
  enableSyntaxHighlighting: PropTypes.bool
};

export default ViewYAML;

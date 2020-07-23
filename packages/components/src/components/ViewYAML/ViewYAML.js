/*
Copyright 2019-2020 The Tekton Authors
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
import PropTypes from 'prop-types';
import jsYaml from 'js-yaml';
import classNames from 'classnames';

import './ViewYAML.scss';

const ViewYAML = props => {
  const { className, dark, resource } = props;

  return (
    <div
      className={classNames('bx--snippet--multi', className, {
        'tkn--view-yaml--dark': dark
      })}
    >
      <code>
        <pre>{jsYaml.dump(resource)}</pre>
      </code>
    </div>
  );
};

ViewYAML.propTypes = {
  resource: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({}),
    PropTypes.string
  ]).isRequired
};

export default ViewYAML;

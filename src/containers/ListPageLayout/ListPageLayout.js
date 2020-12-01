/*
Copyright 2020 The Tekton Authors
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
import { connect } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { ALL_NAMESPACES, paths } from '@tektoncd/dashboard-utils';

import { selectNamespace as selectNamespaceAction } from '../../actions/namespaces';
import { getSelectedNamespace, getTenantNamespace } from '../../reducers';
import { LabelFilter, NamespacesDropdown } from '..';

import './ListPageLayout.scss';

export const ListPageLayout = ({
  children,
  filters,
  hideNamespacesDropdown,
  history,
  location,
  match,
  namespace,
  selectNamespace,
  tenantNamespace,
  title
}) => {
  function setPath(path) {
    history.push(`${path}${location.search}`);
  }

  function handleNamespaceSelected(event) {
    const selectedNamespace = event.selectedItem?.id || ALL_NAMESPACES;

    if (selectedNamespace === ALL_NAMESPACES) {
      selectNamespace(selectedNamespace);
      setPath(
        generatePath(match.path.replace(paths.byNamespace(), ''), {
          ...match.params
        })
      );
      return;
    }

    const prefix = match?.params?.namespace ? '' : paths.byNamespace();

    const newURL = generatePath(`${prefix}${match.path}`, {
      ...match.params,
      namespace: selectedNamespace
    });
    setPath(newURL);
  }

  return (
    <>
      <div className="tkn--list-page--header">
        <h1>{title}</h1>

        {!(hideNamespacesDropdown || tenantNamespace) && (
          <NamespacesDropdown
            id="list-page-namespace-dropdown"
            onChange={handleNamespaceSelected}
            selectedItem={{ id: namespace, text: namespace }}
            showAllNamespaces
            titleText=""
          />
        )}
      </div>
      {filters && (
        <LabelFilter
          filters={filters}
          history={history}
          location={location}
          match={match}
        />
      )}
      {children}
    </>
  );
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  namespace: getSelectedNamespace(state),
  tenantNamespace: getTenantNamespace(state)
});

const mapDispatchToProps = {
  selectNamespace: selectNamespaceAction
};

export default connect(mapStateToProps, mapDispatchToProps)(ListPageLayout);

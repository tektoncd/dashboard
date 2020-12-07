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

import React, { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { InlineNotification } from 'carbon-components-react';
import { getErrorMessage, getTitle, urls } from '@tektoncd/dashboard-utils';
import { Table } from '@tektoncd/dashboard-components';

import {
  getExtensions,
  getExtensionsErrorMessage,
  isFetchingExtensions
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export const Extensions = /* istanbul ignore next */ ({
  error,
  intl,
  loading,
  extensions
}) => {
  useEffect(() => {
    document.title = getTitle({
      page: intl.formatMessage({
        id: 'dashboard.extensions.title',
        defaultMessage: 'Extensions'
      })
    });
  }, []);

  if (error) {
    return (
      <InlineNotification
        kind="error"
        hideCloseButton
        lowContrast
        title={intl.formatMessage({
          id: 'dashboard.extensions.errorLoading',
          defaultMessage: 'Error loading extensions'
        })}
        subtitle={getErrorMessage(error)}
      />
    );
  }

  const emptyText = intl.formatMessage({
    id: 'dashboard.extensions.emptyState',
    defaultMessage: 'No extensions'
  });

  return (
    <>
      <h1>
        {intl.formatMessage({
          id: 'dashboard.extensions.title',
          defaultMessage: 'Extensions'
        })}
      </h1>

      <Table
        headers={[
          {
            key: 'name',
            header: intl.formatMessage({
              id: 'dashboard.tableHeader.name',
              defaultMessage: 'Name'
            })
          }
        ]}
        rows={extensions.map(
          ({ apiGroup, apiVersion, displayName, extensionType, name }) => ({
            id: name,
            name: (
              <Link
                to={
                  extensionType === 'kubernetes-resource'
                    ? urls.kubernetesResources.all({
                        group: apiGroup,
                        version: apiVersion,
                        type: name
                      })
                    : urls.extensions.byName({ name })
                }
                title={displayName}
              >
                {displayName}
              </Link>
            )
          })
        )}
        loading={loading}
        emptyTextAllNamespaces={emptyText}
        emptyTextSelectedNamespace={emptyText}
      />
    </>
  );
};

Extensions.defaultProps = {
  extensions: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getExtensionsErrorMessage(state),
    loading: isFetchingExtensions(state),
    extensions: getExtensions(state)
  };
}

export default connect(mapStateToProps)(injectIntl(Extensions));

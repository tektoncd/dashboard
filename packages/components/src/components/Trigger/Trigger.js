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

import { Launch16 as LinkIcon } from '@carbon/icons-react';
import { injectIntl } from 'react-intl';
import React from 'react';
import { urls } from '@tektoncd/dashboard-utils';
import { Link } from 'react-router-dom';
import './Trigger.scss';
import { Table } from '@tektoncd/dashboard-components';

const Trigger = ({ intl, eventListenerNamespace, trigger }) => {
  const tableHeaders = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'value',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.value',
        defaultMessage: 'Value'
      })
    }
  ];

  let triggerParams = [];

  if (trigger.params) {
    triggerParams = trigger.params.map(param => ({
      id: param.name,
      name: param.name,
      value: param.value
    }));
  }

  let interceptorValues = [];

  if (trigger.interceptor) {
    if (trigger.interceptor.header) {
      interceptorValues = trigger.interceptor.header.map(header => ({
        id: header.name,
        name: header.name,
        value: header.value
      }));
    }
  }

  return (
    <>
      <div className="triggermain">
        <h3>Trigger: {trigger.name}</h3>
        <div className="triggerresourcelinks">
          <span className="resourcekind">TriggerBinding</span>
          <Link
            to={urls.triggerBindings.byName({
              namespace: eventListenerNamespace,
              triggerBindingName: trigger.binding.name
            })}
          >
            <span className="linkicon">
              <LinkIcon />
            </span>
            <span className="truncate-text-end" title={trigger.binding.name}>
              {trigger.binding.name}
            </span>
          </Link>
        </div>
        <div className="triggerresourcelinks">
          <span className="resourcekind">TriggerTemplate</span>

          <Link
            to={urls.triggerTemplates.byName({
              namespace: eventListenerNamespace,
              triggerTemplateName: trigger.template.name
            })}
          >
            <span className="linkicon">
              <LinkIcon />
            </span>
            <span className="truncate-text-end" title={trigger.template.name}>
              {trigger.template.name}
            </span>
          </Link>
        </div>

        <div className="triggerinfo">
          <h3>
            {intl.formatMessage({
              id: 'dashboard.triggerDetails.triggerParameters',
              defaultMessage: 'Parameters'
            })}
          </h3>

          <Table
            className="parameterstable"
            headers={tableHeaders}
            rows={triggerParams}
            emptyTextAllNamespaces={intl.formatMessage({
              id: 'dashboard.trigger.noParams',
              defaultMessage: 'No parameters found for this Trigger.'
            })}
            emptyTextSelectedNamespace={intl.formatMessage({
              id: 'dashboard.trigger.noParams',
              defaultMessage: 'No parameters found for this Trigger.'
            })}
          />
          {trigger.interceptor && (
            <>
              <div className="interceptor">
                <h3>
                  {intl.formatMessage({
                    id: 'dashboard.triggerDetails.interceptorName',
                    defaultMessage: 'Interceptor: '
                  })}
                  {trigger.interceptor.objectRef.name}
                </h3>
                <h3>
                  {intl.formatMessage({
                    id: 'dashboard.triggerDetails.interceptorHeaders',
                    defaultMessage: 'Headers'
                  })}
                </h3>
              </div>
              <Table
                headers={tableHeaders}
                rows={interceptorValues}
                emptyTextAllNamespaces={intl.formatMessage({
                  id: 'dashboard.trigger.noHeaders',
                  defaultMessage: 'No headers found for this interceptor.'
                })}
                emptyTextSelectedNamespace={intl.formatMessage({
                  id: 'dashboard.trigger.noHeaders',
                  defaultMessage: 'No headers found for this interceptor.'
                })}
                isSortable={false}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default injectIntl(Trigger);

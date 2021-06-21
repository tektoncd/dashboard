/*
Copyright 2019-2021 The Tekton Authors
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
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionItem,
  Link as CarbonLink,
  ListItem,
  UnorderedList
} from 'carbon-components-react';
import { urls } from '@tektoncd/dashboard-utils';
import { Table, ViewYAML } from '@tektoncd/dashboard-components';

const Trigger = ({ intl, namespace, trigger }) => {
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

  const { bindings, interceptors, template } = trigger.spec || trigger;
  const triggerTemplateName = template.ref || template.name;
  // we deliberately don't get the name from a Trigger resource here
  // as it will already have a heading on the page so we only want to display
  // a header in this component when it's for a trigger in an EventListener
  const triggerName = trigger.name;

  return (
    <div>
      {triggerName && <h3>Trigger: {triggerName}</h3>}
      <div className="tkn--trigger-details">
        {bindings && bindings.length !== 0 && (
          <div className="tkn--trigger-resourcelinks">
            <span className="tkn--trigger-resourcekind">
              {intl.formatMessage({
                id: 'dashboard.triggerDetails.triggerBindings',
                defaultMessage: 'TriggerBindings:'
              })}
            </span>
            <UnorderedList>
              {bindings.map(binding => (
                <ListItem key={binding.ref || binding.name}>
                  {binding.ref ? (
                    <Link
                      className="tkn--trigger-resourcelink"
                      component={CarbonLink}
                      to={
                        binding.kind === 'ClusterTriggerBinding'
                          ? urls.clusterTriggerBindings.byName({
                              clusterTriggerBindingName: binding.ref
                            })
                          : urls.triggerBindings.byName({
                              namespace,
                              triggerBindingName: binding.ref
                            })
                      }
                    >
                      <span title={binding.ref}>{binding.ref}</span>
                    </Link>
                  ) : (
                    <ViewYAML dark resource={binding} />
                  )}
                </ListItem>
              ))}
            </UnorderedList>
          </div>
        )}
        <div className="tkn--trigger-resourcelinks">
          <span className="tkn--trigger-resourcekind">
            {intl.formatMessage({
              id: 'dashboard.triggerDetails.triggerTemplate',
              defaultMessage: 'TriggerTemplate:'
            })}
          </span>

          {template.spec ? (
            <ViewYAML dark resource={template} />
          ) : (
            <Link
              className="tkn--trigger-resourcelink"
              component={CarbonLink}
              to={urls.triggerTemplates.byName({
                namespace,
                triggerTemplateName
              })}
            >
              <span title={triggerTemplateName}>{triggerTemplateName}</span>
            </Link>
          )}
        </div>
      </div>

      {interceptors && interceptors.length !== 0 && (
        <div className="tkn--trigger-interceptors">
          <span className="tkn--trigger-resourcekind">
            {intl.formatMessage({
              id: 'dashboard.triggerDetails.interceptors',
              defaultMessage: 'Interceptors:'
            })}
          </span>
          <Accordion
            className="tkn--trigger-interceptors-accordion"
            title="Interceptors"
          >
            {interceptors.map((interceptor, index) => {
              let interceptorType;
              let content;
              const namespaceText = intl.formatMessage({
                id: 'dashboard.triggerDetails.interceptorNamespace',
                defaultMessage: 'Namespace:'
              });
              const nameText = intl.formatMessage({
                id: 'dashboard.triggerDetails.interceptorName',
                defaultMessage: 'Name:'
              });
              if (interceptor.webhook) {
                // Webhook Interceptor
                if (!interceptor.webhook.objectRef) {
                  return null;
                }
                interceptorType = 'Webhook';
                let headerValues = [];
                if (interceptor.webhook.header) {
                  headerValues = interceptor.webhook.header.map(header => {
                    const headerValue = {
                      id: header.name,
                      name: header.name,
                      value: header.value
                    };
                    // Concatenate values with a comma if value is an array
                    if (Array.isArray(header.value)) {
                      headerValue.value = header.value.join(', ');
                    }
                    return headerValue;
                  });
                }
                const serviceText = intl.formatMessage({
                  id: 'dashboard.triggerDetails.webhookInterceptorService',
                  defaultMessage: 'Service:'
                });
                content = (
                  <>
                    <p>{serviceText}</p>
                    <div className="tkn--trigger-interceptor-service-details">
                      <p>
                        <span>{nameText}</span>
                        {interceptor.webhook.objectRef.name}
                      </p>
                      {interceptor.webhook.objectRef.namespace && (
                        <p>
                          <span>{namespaceText}</span>
                          {interceptor.webhook.objectRef.namespace}
                        </p>
                      )}
                    </div>
                    {headerValues.length !== 0 && (
                      <>
                        <p>
                          {intl.formatMessage({
                            id: 'dashboard.triggerDetails.interceptorHeader',
                            defaultMessage: 'Header:'
                          })}
                        </p>
                        <Table
                          headers={tableHeaders}
                          rows={headerValues}
                          size="short"
                          emptyTextAllNamespaces={intl.formatMessage({
                            id: 'dashboard.trigger.noHeaders',
                            defaultMessage:
                              'No headers found for this interceptor.'
                          })}
                          emptyTextSelectedNamespace={intl.formatMessage({
                            id: 'dashboard.trigger.noHeaders',
                            defaultMessage:
                              'No headers found for this interceptor.'
                          })}
                          isSortable={false}
                        />
                      </>
                    )}
                  </>
                );
              } else if (interceptor.github || interceptor.gitlab) {
                let data;
                if (interceptor.github) {
                  // GitHub Interceptor
                  interceptorType = 'GitHub';
                  data = interceptor.github;
                } else {
                  // GitLab Interceptor
                  interceptorType = 'GitLab';
                  data = interceptor.gitlab;
                }
                const eventTypes = data.eventTypes?.join(', ');
                const secretText = intl.formatMessage({
                  id: 'dashboard.triggerDetails.webhookInterceptorSecret',
                  defaultMessage: 'Secret:'
                });
                const secretKeyText = intl.formatMessage({
                  id: 'dashboard.triggerDetails.webhookInterceptorSecretKey',
                  defaultMessage: 'Key:'
                });
                content = (
                  <>
                    {data.secretRef && (
                      <>
                        <p>{secretText}</p>
                        <div className="tkn--trigger-interceptor-secret-details">
                          <p>
                            {nameText} {data.secretRef.secretName}
                          </p>
                          <p>
                            {secretKeyText} {data.secretRef.secretKey}
                          </p>
                          {data.secretRef.namespace && (
                            <p>
                              {namespaceText} {data.secretRef.namespace}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <p>Event Types: {eventTypes}</p>
                  </>
                );
              } else if (interceptor.cel) {
                // CEL Interceptor
                interceptorType = 'CEL';

                const headers = [
                  {
                    key: 'key',
                    header: intl.formatMessage({
                      id: 'dashboard.tableHeader.key',
                      defaultMessage: 'Key'
                    })
                  },
                  {
                    key: 'expression',
                    header: intl.formatMessage({
                      id: 'dashboard.tableHeader.expression',
                      defaultMessage: 'Expression'
                    })
                  }
                ];

                const overlays = interceptor.cel.overlays || [];
                const rows = overlays.map(overlay => ({
                  id: overlay.key, // assuming key is unique
                  key: overlay.key,
                  expression: overlay.expression
                }));

                content = (
                  <>
                    {interceptor.cel.filter && (
                      <>
                        <p>
                          {intl.formatMessage({
                            id: 'dashboard.triggerDetails.celInterceptorFilter',
                            defaultMessage: 'Filter:'
                          })}
                        </p>
                        <code className="bx--snippet--multi tkn--trigger-interceptor-cel-filter">
                          {interceptor.cel.filter}
                        </code>
                      </>
                    )}
                    <p>
                      {intl.formatMessage({
                        id: 'dashboard.triggerDetails.celInterceptorOverlays',
                        defaultMessage: 'Overlays:'
                      })}
                    </p>
                    <Table
                      headers={headers}
                      rows={rows}
                      size="short"
                      isSortable={false}
                      emptyTextAllNamespaces={intl.formatMessage({
                        id: 'dashboard.trigger.noOverlays',
                        defaultMessage:
                          'No overlays found for this interceptor.'
                      })}
                      emptyTextSelectedNamespace={intl.formatMessage({
                        id: 'dashboard.trigger.noOverlays',
                        defaultMessage:
                          'No overlays found for this interceptor.'
                      })}
                    />
                  </>
                );
              } else if (interceptor.ref) {
                interceptorType = 'ClusterInterceptor';
                const clusterInterceptorName = interceptor.ref.name;
                content = (
                  <Link
                    component={CarbonLink}
                    to={urls.clusterInterceptors.byName({
                      clusterInterceptorName
                    })}
                    title={clusterInterceptorName}
                  >
                    {clusterInterceptorName}
                  </Link>
                );
              } else {
                return null;
              }

              const title = intl.formatMessage(
                {
                  id: 'dashboard.triggerDetails.interceptorTitle',
                  defaultMessage:
                    '{interceptorNumber}. ({interceptorType}) {interceptorName}'
                },
                {
                  interceptorNumber: index + 1,
                  interceptorType,
                  interceptorName: ''
                }
              );
              return (
                <AccordionItem key={title} title={title}>
                  {content}
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default injectIntl(Trigger);

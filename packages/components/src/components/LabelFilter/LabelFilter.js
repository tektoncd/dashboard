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

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import {
  Button,
  Form,
  InlineNotification,
  Link,
  Search,
  Tag
} from 'carbon-components-react';

function arrayUnique(arr) {
  return arr.filter((item, index) => arr.indexOf(item) >= index);
}

class LabelFilter extends Component {
  state = {
    currentFilterValue: '',
    isValid: true,
    filterMessage: null,
    url: '',
    urlMessage: ''
  };

  handleAddFilter = event => {
    event.preventDefault();

    const { intl } = this.props;
    const { currentFilterValue } = this.state;
    const filterRegex = '([a-z0-9A-Z-_./]:[a-z0-9A-Z-_.],?)+';
    const filterValue = currentFilterValue.replace(/\s/g, '');
    if (!filterValue.match(filterRegex)) {
      this.setState({
        isValid: false,
        filterMessage: intl.formatMessage({
          id: 'dashboard.labelFilter.invalid',
          defaultMessage:
            'Filters must be of the format labelKey:labelValue and contain accepted label characters'
        }),
        url:
          'https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set',
        urlMessage: intl.formatMessage({
          id: 'dashboard.labelFilter.syntaxMessage',
          defaultMessage:
            'See the Kubernetes Label documentation for valid syntax'
        })
      });
      return;
    }
    const currentFilterRequest = filterValue.split(':');
    if (currentFilterRequest[1].length > 63) {
      this.setState({
        isValid: false,
        filterMessage: intl.formatMessage({
          id: 'dashboard.labelFilter.invalidLength',
          defaultMessage:
            'Filters must be of the format labelKey:labelValue and contain less than 64 characters'
        })
      });
      return;
    }
    const colonToEqualsFilters = filterValue.replace(/:/g, '=');
    let currentFiltersArray = colonToEqualsFilters.split(',');
    currentFiltersArray = arrayUnique(currentFiltersArray);
    if (this.props.filters.includes(currentFiltersArray[0])) {
      this.setState({
        isValid: false,
        filterMessage: intl.formatMessage({
          id: 'dashboard.labelFilter.duplicate',
          defaultMessage: 'No duplicate filters allowed'
        }),
        url: '',
        urlMessage: ''
      });
      return;
    }
    this.props.handleAddFilter(this.props.filters.concat(currentFiltersArray));
    this.resetCurrentFilterValue();
  };

  handleChange = event => {
    const inputValue = event.target.value;
    this.setState({
      currentFilterValue: inputValue
    });
  };

  handleCloseFilterError = () => {
    this.setState({
      isValid: true,
      filterMessage: null,
      url: '',
      urlMessage: ''
    });
  };

  resetCurrentFilterValue() {
    this.setState({
      isValid: true,
      filterMessage: null,
      url: '',
      urlMessage: '',
      currentFilterValue: ''
    });
  }

  render() {
    const { filters, intl } = this.props;

    const {
      currentFilterValue,
      filterMessage,
      isValid,
      url,
      urlMessage
    } = this.state;

    const searchDescription = intl.formatMessage({
      id: 'dashboard.labelFilter.searchPlaceholder',
      defaultMessage: 'Input a label filter of the format labelKey:labelValue'
    });

    return (
      <div className="tkn--label-filter">
        {!isValid && (
          <InlineNotification
            lowContrast
            kind="error"
            title={filterMessage}
            subtitle=""
            role="alert"
            onCloseButtonClick={this.handleCloseFilterError}
          >
            <Link href={url}>{urlMessage}</Link>
          </InlineNotification>
        )}
        <Form onSubmit={this.handleAddFilter} autoComplete="on">
          <Search
            placeholder={searchDescription}
            labelText={searchDescription}
            onChange={this.handleChange}
            value={currentFilterValue}
            name="filter-search"
          />
          <Button type="submit" className="tkn--visually-hidden">
            {intl.formatMessage({
              id: 'dashboard.labelFilter.addFilterButton',
              defaultMessage: 'Add filter'
            })}
          </Button>
        </Form>
        <div className="tkn--filters">
          {filters.map(filter => (
            <Tag
              filter
              key={filter}
              onClick={() => this.props.handleDeleteFilter(filter)}
              onClose={() => this.props.handleDeleteFilter(filter)}
              type="high-contrast"
            >
              {filter.replace(/=/g, ':')}
            </Tag>
          ))}
          {filters.length > 0 && (
            <Button
              kind="ghost"
              size="small"
              onClick={this.props.handleClearFilters}
            >
              {intl.formatMessage({
                id: 'dashboard.labelFilter.clearAll',
                defaultMessage: 'Clear all'
              })}
            </Button>
          )}
        </div>
      </div>
    );
  }
}

LabelFilter.defaultProps = {
  filters: []
};

export default injectIntl(LabelFilter);

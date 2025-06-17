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

import { useIntl } from 'react-intl';
import { useState } from 'react';
import {
  Modal,
  Popover,
  PopoverContent,
  TextInput,
  usePrefix
} from '@carbon/react';
import './TagsWithOverflow.scss';
import { urls } from '@tektoncd/dashboard-utils';
import Link from '../Link';

export default function TagsWithOverflow({
  namespace,
  resource,
  LinkComponent = Link
}) {
  const intl = useIntl();
  const carbonPrefix = usePrefix();

  const labels = resource.metadata?.labels || {};
  const labelEntries = Object.entries(labels);
  const maxVisibleTags = 4;
  const maxOverflowTags = 5;
  const visibleTags = labelEntries.slice(0, maxVisibleTags);
  const overflowTags = labelEntries.slice(
    maxVisibleTags,
    maxVisibleTags + maxOverflowTags
  );
  const remainingTags = labelEntries.slice(maxVisibleTags + maxOverflowTags);
  const totalHiddenTags = labelEntries.length - maxVisibleTags;
  const resourceType = resource.kind;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
  };

  const filteredTags = labelEntries.filter(
    ([key, value]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPipelineRunsByPipelineURL = ({ tag, name }) =>
    urls.pipelineRuns.tags({ namespace, tag, name, resourceType });

  const renderTagLink = tags =>
    tags.map(([key, value]) => (
      <LinkComponent
        className={`${carbonPrefix}--tag ${carbonPrefix}--tag__label`}
        key={key}
        to={getPipelineRunsByPipelineURL({ namespace, tag: key, name: value })}
        title={`${key}: ${value}`}
      >
        {`${key}: ${value}`}
      </LinkComponent>
    ));

  return (
    <div className="tkn--overflow-menu-container">
      {renderTagLink(visibleTags)}
      {totalHiddenTags > 0 && (
        <div className="tkn--tag-popover-container">
          <Popover
            className="tkn--tag-popover"
            dropShadow
            highContrast
            caret
            open={open}
          >
            <button
              type="button"
              className={`${carbonPrefix}--tag`}
              onClick={() => {
                setOpen(!open);
              }}
            >
              {`+${totalHiddenTags}`}
            </button>
            <PopoverContent>
              <div
                style={{
                  padding: '0.5rem'
                }}
              >
                {renderTagLink(overflowTags)}
                {remainingTags.length > 0 && (
                  <button
                    type="button"
                    className={`${carbonPrefix}--tag tkn--tag-popover-container`}
                    onClick={handleModalOpen}
                  >
                    {`+${remainingTags.length}`}
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onRequestClose={handleModalClose}
          modalHeading={intl.formatMessage({
            id: 'dashboard.runMetadata.allTags',
            defaultMessage: 'All tags'
          })}
          primaryButtonText={intl.formatMessage({
            id: 'dashboard.modal.close',
            defaultMessage: 'Close'
          })}
          passiveModal
        >
          <TextInput
            id="tkn--runMetadata--label-search"
            labelText={intl.formatMessage({
              id: 'dashboard.runMetadata.searchLabel',
              defaultMessage: 'Search'
            })}
            placeholder={intl.formatMessage({
              id: 'dashboard.runMetadata.searchForTag',
              defaultMessage: 'Search for a tag'
            })}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="tkn--tag-list">{renderTagLink(filteredTags)}</div>
        </Modal>
      )}
    </div>
  );
}

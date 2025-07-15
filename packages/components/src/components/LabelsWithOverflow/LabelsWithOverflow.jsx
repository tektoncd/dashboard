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
import { useRef, useState } from 'react';
import {
  Modal,
  Popover,
  PopoverContent,
  TextInput,
  usePrefix
} from '@carbon/react';
import './LabelsWithOverflow.scss';
import { urls } from '@tektoncd/dashboard-utils';
import Link from '../Link';

export default function LabelsWithOverflow({
  namespace,
  resource,
  LinkComponent = Link
}) {
  const intl = useIntl();
  const carbonPrefix = usePrefix();
  const popoverRef = useRef(null);

  const labels = resource.metadata?.labels || {};
  const labelEntries = Object.entries(labels);
  const maxVisibleLabels = 4;
  const maxOverflowLabels = 5;
  const visibleLabels = labelEntries.slice(0, maxVisibleLabels);
  const overflowLabels = labelEntries.slice(
    maxVisibleLabels,
    maxVisibleLabels + maxOverflowLabels
  );
  const remainingLabels = labelEntries.slice(
    maxVisibleLabels + maxOverflowLabels
  );
  const totalHiddenLabels = labelEntries.length - maxVisibleLabels;
  const resourceType = resource.kind;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleRequestClose = () => {
    setOpen(false);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
  };

  const filteredLabels = labelEntries.filter(
    ([key, value]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPipelineRunsByPipelineURL = ({ label, name }) =>
    urls.pipelineRuns.labels({ namespace, label, name, resourceType });

  const renderLabelLink = allLabels =>
    allLabels.map(([key, value]) => (
      <LinkComponent
        className={`${carbonPrefix}--tag ${carbonPrefix}--tag__label`}
        key={key}
        to={getPipelineRunsByPipelineURL({
          namespace,
          label: key,
          name: value
        })}
        title={`${key}: ${value}`}
      >
        {`${key}: ${value}`}
      </LinkComponent>
    ));

  const handleFocusOut = event => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.relatedTarget)
    ) {
      handleRequestClose();
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      handleRequestClose();
    }
  };

  return (
    <div className="tkn--overflow-menu-container">
      {renderLabelLink(visibleLabels)}
      {totalHiddenLabels > 0 && (
        <div className="tkn--tag-popover-container">
          <Popover
            className="tkn--tag-popover"
            dropShadow
            highContrast
            caret
            open={open}
            onRequestClose={handleRequestClose}
            ref={popoverRef}
            onBlur={handleFocusOut}
            onKeyDown={handleKeyDown}
          >
            <button
              type="button"
              className={`${carbonPrefix}--tag`}
              onClick={() => {
                setOpen(!open);
              }}
            >
              {`+${totalHiddenLabels}`}
            </button>
            <PopoverContent>
              <div
                style={{
                  padding: '0.5rem'
                }}
              >
                {renderLabelLink(overflowLabels)}
                {remainingLabels.length > 0 && (
                  <button
                    type="button"
                    className={`${carbonPrefix}--tag tkn--tag-popover-container`}
                    onClick={handleModalOpen}
                  >
                    {`+${remainingLabels.length}`}
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
            id: 'dashboard.runMetadata.allLabels',
            defaultMessage: 'All labels'
          })}
          primaryButtonText={intl.formatMessage({
            id: 'dashboard.modal.close',
            defaultMessage: 'Close'
          })}
          passiveModal
        >
          <TextInput
            data-modal-primary-focus
            id="tkn--runMetadata--label-search"
            labelText={intl.formatMessage({
              id: 'dashboard.runMetadata.searchLabel',
              defaultMessage: 'Search'
            })}
            placeholder={intl.formatMessage({
              id: 'dashboard.runMetadata.searchForLabel',
              defaultMessage: 'Search for a label'
            })}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="tkn--tag-list">{renderLabelLink(filteredLabels)}</div>
        </Modal>
      )}
    </div>
  );
}

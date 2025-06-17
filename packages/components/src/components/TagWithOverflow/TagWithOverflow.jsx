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

import { useState } from 'react';
import { Modal, Popover, PopoverContent, TextInput } from '@carbon/react';
import './TagWithOverflow.scss';
import { urls } from '@tektoncd/dashboard-utils';
import Link from '../Link';

export default function CustomTags({
  labels,
  namespace,
  LinkComponent = Link
}) {
  const labelEntries = Object.entries(labels);
  const maxVisibleTags = 2;
  const maxOverflowTags = 5;
  const visibleTags = labelEntries.slice(0, maxVisibleTags);
  const overflowTags = labelEntries.slice(
    maxVisibleTags,
    maxVisibleTags + maxOverflowTags
  );
  const remainingTags = labelEntries.slice(maxVisibleTags + maxOverflowTags);
  const totalHiddenTags = labelEntries.length - maxVisibleTags;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  let pipelineRunsByPipelineURL;

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

  return (
    <div className="tkn--overflow-menu-container">
      {visibleTags.map(([key, value]) => {
        const tag = key;
        const name = value;
        const getPipelineRunsByPipelineURL = urls.pipelineRuns.tags;
        pipelineRunsByPipelineURL = getPipelineRunsByPipelineURL({
          namespace,
          tag,
          name
        });
        return (
          <LinkComponent
            key={key}
            to={pipelineRunsByPipelineURL}
            title={`${key}: ${value}`}
          >
            {`${key}: ${value}`}
          </LinkComponent>
        );
      })}

      {totalHiddenTags > 0 && (
        <div className="tnk--tag-popover-container">
          <Popover
            className="tkn--tag-popover"
            dropShadow
            highContrast
            caret
            open={open}
          >
            <button
              type="button"
              className="tkn--button-tag"
              onClick={() => {
                setOpen(!open);
              }}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setOpen(event);
                }
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
                {overflowTags.map(([key, value]) => {
                  const tag = key;
                  const name = value;
                  const getPipelineRunsByPipelineURL = urls.pipelineRuns.tags;
                  pipelineRunsByPipelineURL = getPipelineRunsByPipelineURL({
                    namespace,
                    tag,
                    name
                  });
                  return (
                    <LinkComponent
                      key={key}
                      to={pipelineRunsByPipelineURL}
                      title={`${key}: ${value}`}
                    >
                      {`${key}: ${value}`}
                    </LinkComponent>
                  );
                })}
                {remainingTags.length > 0 && (
                  <button
                    type="button"
                    className="tkn--button-tag tnk--tag-popover-container"
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
          modalHeading="All Tags"
          primaryButtonText="Close"
          passiveModal
        >
          <TextInput
            id="search"
            labelText="Search"
            placeholder="Search for a tag"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="tkn--tag-list">
            {filteredTags.map(([key, value]) => {
              const tag = key;
              const name = value;
              const getPipelineRunsByPipelineURL = urls.pipelineRuns.tags;
              pipelineRunsByPipelineURL = getPipelineRunsByPipelineURL({
                namespace,
                tag,
                name
              });
              return (
                <LinkComponent
                  key={key}
                  to={pipelineRunsByPipelineURL}
                  title={`${key}: ${value}`}
                >
                  {`${key}: ${value}`}
                </LinkComponent>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

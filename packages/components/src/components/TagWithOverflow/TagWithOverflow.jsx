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
import {
  Modal,
  OperationalTag,
  Popover,
  PopoverContent,
  TextInput
} from '@carbon/react';
import './TagWithOverflow.scss';
import { urls } from '@tektoncd/dashboard-utils';
import Link from '../Link';

export default function CustomTags({
  labels,
  namespace,
  LinkComponent = Link
}) {
  // temp for testing modal
  const sampleTags = {
    'tekton.dev/pipeline': 'hello-pipeline',
    'triggers.tekton.dev/eventlistener': 'hello-listener',
    'triggers.tekton.dev/trigger': 'Test',
    'triggers.tekton.dev/triggers-eventid':
      'e9742d5b-00e4-4124-9aa1-da2fd670f2da',
    'tekton.dev/pipeline1': 'hello-pipeline2',
    'triggers.tekton.dev/eventlistener1': 'hello-listener3',
    'triggers.tekton.dev/trigger1': 'Test1',
    'triggers.tekton.dev/triggers-eventid1':
      'e9742d5b-00e4-4124-9aa1-da2fd670f2da5',
    'tekton.dev/pipeline2': 'hello-pipeline2',
    'triggers.tekton.dev/eventlistener3': 'hello-listener3',
    'triggers.tekton.dev/trigger2': 'Test1',
    'triggers.tekton.dev/triggers-eventid2':
      'e9742d5b-00e4-4124-9aa1-da2fd670f2da5',
    'triggers.tekton.dev/trigger4': 'Test1',
    'triggers.tekton.dev/triggers-eventid3':
      'e9742d5b-00e4-4124-9aa1-da2fd670f2da5'
  };

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

  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  let pipelineRunsByPipelineURL;

  //  only for operational tags

  // const handleTagClick = (key, value) => {
  //   if (namespace) {
  //     const getPipelineRunsByPipelineURL = urls.pipelineRuns.tags;
  //     const tag = key;
  //     const name = value;
  //     pipelineRunsByPipelineURL = getPipelineRunsByPipelineURL({
  //       namespace,
  //       tag,
  //       name
  //     });
  //     // usenavigate
  //     window.location.href = pipelineRunsByPipelineURL;
  //   }
  //   if (isMenuOpen) {
  //     setIsMenuOpen(false);
  //   }
  // };

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
          <>
            <LinkComponent
              to={pipelineRunsByPipelineURL}
              title={`${key}: ${value}`}
            >
              {`${key}: ${value}`}
            </LinkComponent>
            {/* <OperationalTag
              text={`${key}: ${value}`}
              type="gray"
              onClick={() => handleTagClick(key, value)}
            /> */}
          </>
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
                    <>
                      <LinkComponent
                        to={pipelineRunsByPipelineURL}
                        title={`${key}: ${value}`}
                      >
                        {`${key}: ${value}`}
                      </LinkComponent>
                      {/* <OperationalTag
                      key={key}
                      text={`${key}: ${value}`}
                      type="gray"
                      onClick={() => handleTagClick(key, value)}
                    /> */}
                    </>
                  );
                })}
                {remainingTags.length > 0 && (
                  <button
                    type="button"
                    className="tkn--button-tag tnk--tag-popover-container"
                    onClick={handleModalOpen}
                  >
                    {`+${remainingTags.length} more`}
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
          passiveModal="true"
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
                // <OperationalTag
                //   key={key}
                //   text={`${key}: ${value}`}
                //   type="gray"
                //   onClick={() => handleTagClick(key, value)}
                // />
                <LinkComponent
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

/*
Copyright 2022-2025 The Tekton Authors
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
/* istanbul ignore file */

import { forwardRef } from 'react';
import { useHref, useLinkClickHandler } from 'react-router-dom';
import { Link as CarbonLink } from '@carbon/react';

const Link = forwardRef(function Link(
  { onClick, replace = false, state, target, to, ...rest },
  ref
) {
  const href = useHref(to);
  const handleClick = useLinkClickHandler(to, {
    replace,
    state,
    target
  });

  return (
    <CarbonLink
      {...rest}
      href={href}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleClick(event);
        }
      }}
      ref={ref}
      target={target}
    />
  );
});

export default Link;

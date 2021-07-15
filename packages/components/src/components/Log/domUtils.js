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

const scrollRegex = /(auto|scroll)/;

function getStyle(el, prop) {
  return el && window.getComputedStyle(el, null).getPropertyValue(prop);
}

function isElementVerticallyScrollable(el) {
  return (
    el &&
    scrollRegex.test(getStyle(el, 'overflow') + getStyle(el, 'overflow-y'))
  );
}

export function hasElementPositiveVerticalScrollBottom(el) {
  return (
    isElementVerticallyScrollable(el) &&
    el.scrollHeight - el.clientHeight > el.scrollTop
  );
}

export function hasElementPositiveVerticalScrollTop(el) {
  return isElementVerticallyScrollable(el) && el.scrollTop > 0;
}

export function isElementStartAboveViewTop(el) {
  return Math.round(el?.getBoundingClientRect().top) < 0;
}

export function isElementEndBelowViewBottom(el) {
  return (
    Math.round(el?.getBoundingClientRect().bottom) >
    document.documentElement?.clientHeight
  );
}

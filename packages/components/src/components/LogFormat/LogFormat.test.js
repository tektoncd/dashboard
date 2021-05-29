/*
Copyright 2020-2021 The Tekton Authors
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
import { render } from '../../utils/test';
import LogFormat from './LogFormat';

const getElement = (text, query) => {
  const { queryByText } = render(<LogFormat>{text}</LogFormat>);
  const queryRegex = new RegExp(query, 'i');
  return queryByText(queryRegex);
};

const fgColorClassPrefix = 'tkn--ansi--color-fg-';
const bgColorClassPrefix = 'tkn--ansi--color-bg-';
const textClassPrefix = 'tkn--ansi--text-';

describe('LogFormat', () => {
  it('displays text', () => {
    const element = getElement('Hello World', 'Hello World');
    expect(element).toBeTruthy();
  });

  it('displays red text', () => {
    const element = getElement('\u001b[31mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-red">Hello World</span>`
    );
  });

  it('displays green text', () => {
    const element = getElement('\u001b[32mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-green">Hello World</span>`
    );
  });

  it('displays yellow text', () => {
    const element = getElement('\u001b[33mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-yellow">Hello World</span>`
    );
  });

  it('displays blue text', () => {
    const element = getElement('\u001b[34mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-blue">Hello World</span>`
    );
  });

  it('displays a magenta background', () => {
    const element = getElement('\u001b[45mHello World', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${bgColorClassPrefix}-magenta">Hello World</span>`
    );
  });

  it('displays a cyan background', () => {
    const element = getElement('\u001b[46mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${bgColorClassPrefix}-cyan">Hello World</span>`
    );
  });

  it('displays a white background', () => {
    const element = getElement('\u001b[47mHello World', 'Hello World');
    expect(element.outerHTML).toBe(
      `<span class="${bgColorClassPrefix}-white">Hello World</span>`
    );
  });

  it('displays cyan text without a trailing reset', () => {
    const element = getElement('\u001b[36mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-cyan">Hello</span>`
    );
  });

  it('displays red text on a blue background', () => {
    const element = getElement('\u001b[31;44mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-red ${bgColorClassPrefix}-blue">Hello</span>`
    );
  });

  it('resets colors after red text on blue background', () => {
    const element = getElement('\u001b[31;44mHello\u001b[0m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${fgColorClassPrefix}-red ${bgColorClassPrefix}-blue">Hello</span> world`
    );
  });

  it('performs a color change from red/blue to yellow/blue', () => {
    const element = getElement('\u001b[31;44mHello\u001b[33m world', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-red ${bgColorClassPrefix}-blue">Hello</span>`
    );
    expect(element.nextElementSibling.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-yellow ${bgColorClassPrefix}-blue"> world</span>`
    );
  });

  it('performs color change from red/blue to yellow/green', () => {
    const element = getElement(
      '\u001b[31;44mHello\u001b[33;42m world',
      'Hello'
    );
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-red ${bgColorClassPrefix}-blue">Hello</span>`
    );
    expect(element.nextElementSibling.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-yellow ${bgColorClassPrefix}-green"> world</span>`
    );
  });

  it('ignores unsupported codes', () => {
    const element = getElement('\u001b[51mHello\u001b[0m', 'Hello');
    expect(element.innerHTML).toBe('Hello');
  });

  it('displays bright red text', () => {
    const element = getElement('\u001b[91mHello\u001b[0m', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${fgColorClassPrefix}-bright-red">Hello</span>`
    );
  });

  it('displays bright red background', () => {
    const element = getElement('\u001b[101mHello\u001b[0m', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${bgColorClassPrefix}-bright-red">Hello</span>`
    );
  });

  it('displays a xterm color as a background', () => {
    const element = getElement('\u001b[48;5;200mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="background-color: rgb(255, 0, 215);">Hello</span>'
    );
  });

  it('displays a xterm color as a foreground', () => {
    const element = getElement('\u001b[38;5;100mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(135, 135, 0);">Hello</span>'
    );
  });

  it('displays bold text', () => {
    const element = getElement('\u001b[1mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${textClassPrefix}-bold">Hello</span>`
    );
  });

  it('can reset bold text (bold off)', () => {
    const element = getElement('\u001b[1mHello\u001b[21m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${textClassPrefix}-bold">Hello</span> world`
    );
  });

  it('can reset bold text (normal color / intensity)', () => {
    const element = getElement('\u001b[1mHello\u001b[22m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${textClassPrefix}-bold">Hello</span> world`
    );
  });

  it('displays italic text', () => {
    const element = getElement('\u001b[3mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${textClassPrefix}-italic">Hello</span>`
    );
  });

  it('can reset italic text', () => {
    const element = getElement('\u001b[3mHello\u001b[23m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${textClassPrefix}-italic">Hello</span> world`
    );
  });

  it('displays underline text', () => {
    const element = getElement('\u001b[4mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${textClassPrefix}-underline">Hello</span>`
    );
  });

  it('can resets underline text', () => {
    const element = getElement('\u001b[4mHello\u001b[24m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${textClassPrefix}-underline">Hello</span> world`
    );
  });

  it('displays concealed text', () => {
    const element = getElement('\u001b[8mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${textClassPrefix}-conceal">Hello</span>`
    );
  });

  it('can resets concealed text', () => {
    const element = getElement('\u001b[8mHello\u001b[28m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${textClassPrefix}-conceal">Hello</span> world`
    );
  });

  it('displays crossed text', () => {
    const element = getElement('\u001b[9mHello', 'Hello');
    expect(element.outerHTML).toBe(
      `<span class="${textClassPrefix}-cross">Hello</span>`
    );
  });

  it('can reset crossed-out text', () => {
    const element = getElement('\u001b[9mHello\u001b[29m world', 'world');
    expect(element.innerHTML).toBe(
      `<span class="${textClassPrefix}-cross">Hello</span> world`
    );
  });

  it('displays links', () => {
    const element = getElement(
      'A dashboard for Tekton! https://github.com/tektoncd/dashboard',
      'https://github.com/tektoncd/dashboard'
    );
    expect(element.outerHTML).toBe(
      '<a href="https://github.com/tektoncd/dashboard" target="_blank" rel="noopener noreferrer">https://github.com/tektoncd/dashboard</a>'
    );
  });

  it('displays links with styles', () => {
    const element = getElement(
      'A dashboard for Tekton!\u001b[9m\u001b[48;5;194mhttps://github.com/tektoncd/dashboard',
      'https://github.com/tektoncd/dashboard'
    );
    expect(element.outerHTML).toBe(
      `<a href="https://github.com/tektoncd/dashboard" style="background-color: rgb(215, 255, 215);" class="${textClassPrefix}-cross" target="_blank" rel="noopener noreferrer">https://github.com/tektoncd/dashboard</a>`
    );
  });

  it('converts new lines as line breaks', () => {
    const text = 'Hello\n\nWorld';
    const { container } = render(<LogFormat>{text}</LogFormat>);
    expect(container.childNodes[0].innerHTML).toBe(
      '<div>Hello</div><br><div>World</div>'
    );
  });

  it('separates text by new lines', () => {
    const text =
      'Hello World\nA dashboard for Tekton! https://github.com/tektoncd/dashboard\nTekon is cool!';
    const { container } = render(<LogFormat>{text}</LogFormat>);
    expect(container.childNodes[0].childNodes).toHaveLength(3);
  });

  it('separates text by new lines and carriage returns', () => {
    const text = '\r \n \r \n\r \n';
    const { container } = render(<LogFormat>{text}</LogFormat>);
    expect(container.childNodes[0].childNodes).toHaveLength(4);
  });

  it('handles consecutive carriage returns without error', () => {
    const text = '\r\r';
    const { container } = render(<LogFormat>{text}</LogFormat>);
    expect(container.childNodes[0].childNodes).toHaveLength(1);
  });
});

/*
Copyright 2020 The Tekton Authors
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
import PropTypes from 'prop-types';
import tlds from 'tlds';
import LinkifyIt from 'linkify-it';
import { colors, textStyles } from './defaults';

const linkifyIt = LinkifyIt().tlds(tlds);

// eslint-disable-next-line no-control-regex
const ansiRegex = new RegExp('^\u001b([@-_])(.*?)([@-~])');
const characterRegex = new RegExp('.', 'm');

const LogFormat = ({ children }) => {
  let properties = {
    foregroundColor: null,
    backgroundColor: null,
    bold: false,
    italic: false,
    underline: false,
    conceal: false,
    cross: false
  };

  let styles = {};
  let text = '';
  let line = [];

  const reset = () => {
    properties = {
      foregroundColor: null,
      backgroundColor: null,
      bold: false,
      italic: false,
      underline: false,
      conceal: false,
      cross: false
    };
  };

  const enable = flag => {
    properties[flag] = true;
  };

  const disable = flag => {
    properties[flag] = false;
  };

  const getXtermColor = commandStack => {
    if (commandStack.length >= 2 && commandStack[0] === '5') {
      commandStack.shift();
      const colorIndex = +commandStack.shift();
      if (colorIndex >= 0 && colorIndex <= 255) {
        return colors[colorIndex];
      }
    }
    return null;
  };

  const getTermColor = (colorIndex, type) => {
    if (colorIndex > 7) {
      return null;
    }
    if (type === 'light') {
      return colors[colorIndex + 8];
    }
    return colors[colorIndex];
  };

  const setFGColor = (type, command) => {
    properties.foregroundColor = getTermColor(type, command);
  };

  const setBGColor = (type, command) => {
    properties.backgroundColor = getTermColor(type, command);
  };

  const setFGColor256 = commandStack => {
    properties.foregroundColor = getXtermColor(commandStack);
  };

  const setBGColor256 = commandStack => {
    properties.backgroundColor = getXtermColor(commandStack);
  };

  const setProperties = {
    0: () => reset(),
    1: () => enable('bold'),
    3: () => enable('italic'),
    4: () => enable('underline'),
    8: () => enable('conceal'),
    9: () => enable('cross'),

    21: () => disable('bold'),
    22: () => disable('bold'),
    23: () => disable('italic'),
    24: () => disable('underline'),
    28: () => disable('conceal'),
    29: () => disable('cross'),

    30: () => setFGColor(0),
    31: () => setFGColor(1),
    32: () => setFGColor(2),
    33: () => setFGColor(3),
    34: () => setFGColor(4),
    35: () => setFGColor(5),
    36: () => setFGColor(6),
    37: () => setFGColor(7),
    38: s => setFGColor256(s),
    39: () => setFGColor(9),

    40: () => setBGColor(0),
    41: () => setBGColor(1),
    42: () => setBGColor(2),
    43: () => setBGColor(3),
    44: () => setBGColor(4),
    45: () => setBGColor(5),
    46: () => setBGColor(6),
    47: () => setBGColor(7),
    48: s => setBGColor256(s),
    49: () => setBGColor(9),

    90: () => setFGColor(0, 'light'),
    91: () => setFGColor(1, 'light'),
    92: () => setFGColor(2, 'light'),
    93: () => setFGColor(3, 'light'),
    94: () => setFGColor(4, 'light'),
    95: () => setFGColor(5, 'light'),
    96: () => setFGColor(6, 'light'),
    97: () => setFGColor(7, 'light'),

    100: () => setBGColor(0, 'light'),
    101: () => setBGColor(1, 'light'),
    102: () => setBGColor(2, 'light'),
    103: () => setBGColor(3, 'light'),
    104: () => setBGColor(4, 'light'),
    105: () => setBGColor(5, 'light'),
    106: () => setBGColor(6, 'light'),
    107: () => setBGColor(7, 'light')
  };

  const setStyle = (command, stack) => {
    if (setProperties[command]) {
      setProperties[command](stack);
    }
  };

  const evaluateCommandStack = stack => {
    const command = stack.shift();
    if (!command) {
      return;
    }
    setStyle(command, stack);
    evaluateCommandStack(stack);
  };

  const linkify = (str, styleObj) => {
    if (!str) {
      return null;
    }
    const matches = linkifyIt.match(str);
    if (!matches) {
      return <span style={styleObj}>{str}</span>;
    }
    const elements = [];
    let offset = 0;
    matches.forEach(match => {
      if (match.index > offset) {
        const string = str.substring(offset, match.index);
        elements.push(<span style={styleObj}>{string}</span>);
      }
      elements.push(
        <a
          href={match.url}
          style={styleObj}
          target="_blank"
          rel="noopener noreferrer"
        >
          {match.text}
        </a>
      );
      offset = match.lastIndex;
    });

    if (str.length > offset) {
      const string = str.substring(offset, str.length);
      elements.push(<span style={styleObj}>{string}</span>);
    }
    return elements;
  };

  const handleSequence = s => {
    const indicator = s[1];
    const commands = s[2].split(';');
    const terminator = s[3];

    if (indicator !== '[' && terminator !== 'm') {
      return;
    }

    const tag = linkify(text, styles);
    if (tag) {
      line = line.concat(tag);
    }

    text = '';
    styles = {};

    if (commands.length === 0) {
      reset();
    }

    evaluateCommandStack(commands);

    styles = {
      color: properties.foregroundColor,
      backgroundColor: properties.backgroundColor
    };

    Object.keys(textStyles).forEach(style => {
      if (properties[style]) {
        const [[key, value]] = Object.entries(textStyles[style]);
        styles[key] = value;
      }
    });
  };

  const parse = (ansi, index) => {
    let offset = 0;
    while (offset !== ansi.length) {
      const str = ansi.substring(offset);
      const controlSequence = str.match(ansiRegex);
      if (controlSequence) {
        offset += controlSequence.index + controlSequence[0].length;
        handleSequence(controlSequence);
      } else {
        const character = str.match(characterRegex);
        text += character[0];
        offset += 1;
      }
    }
    if (text) {
      line.push(linkify(text, styles));
    }
    return <div key={index}>{line}</div>;
  };

  const convert = ansi => {
    return ansi.split(/\r?\n/).map((part, index) => {
      text = '';
      line = [];
      return parse(part, index);
    });
  };

  return convert(children);
};

LogFormat.propTypes = {
  children: PropTypes.string.isRequired
};

export default LogFormat;

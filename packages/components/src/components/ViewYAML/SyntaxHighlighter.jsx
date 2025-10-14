/*
Copyright 2021-2025 The Tekton Authors
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

import { usePrefix } from '@carbon/react';
import yaml from 'yaml';

function addLine({ addBullet, key, level, lines, path, rawString, value }) {
  let valueNode;

  if (rawString) {
    valueNode = <span className="hljs-string">{value}</span>;
  } else if (value === null) {
    valueNode = (
      <>
        <span> </span>
        <span className="hljs-literal">null</span>
      </>
    );
  } else if (typeof value === 'string') {
    if (value.includes('\n')) {
      // only display the literal block style indicator,
      // the actual value will be handled later
      valueNode = (
        <>
          <span> </span>
          <span className="hljs-string">|</span>
        </>
      );
    } else {
      // wrap value in quotes if it could be mistaken for another type,
      // e.g. 'False', '123'
      valueNode = (
        <>
          <span> </span>
          <span className="hljs-string">
            {yaml.stringify(value, { lineWidth: 0, singleQuote: true })}
          </span>
        </>
      );
    }
  } else if (typeof value === 'number') {
    valueNode = (
      <>
        <span> </span>
        <span className="hljs-number">{value}</span>
      </>
    );
  } else if (typeof value === 'boolean') {
    valueNode = (
      <>
        <span> </span>
        <span className="hljs-literal">{value.toString()}</span>
      </>
    );
  } else if (Array.isArray(value) && value.length === 0) {
    valueNode = (
      <>
        <span> </span>
        <span>[]</span>
      </>
    );
  } else if (typeof value === 'object' && Object.keys(value).length === 0) {
    valueNode = (
      <>
        <span> </span>
        <span>{'{}'}</span>
      </>
    );
  }

  let indent;
  if (level) {
    const spaces = '  '.repeat(level - (addBullet ? 1 : 0));
    indent = <span>{spaces}</span>;
  }

  let bullet;
  if (!rawString) {
    bullet = <span className="hljs-bullet">-</span>;
  }

  lines.push(
    <span className="tkn--code-line" key={`${path}.${key}`}>
      <span className="tkn--code-line-content">
        {indent}
        {addBullet ? <span className="hljs-bullet">- </span> : null}
        {typeof key === 'number' ? (
          bullet
        ) : (
          <span className="hljs-attr">{`${yaml.stringify(key, { singleQuote: true }).trim()}:`}</span>
        )}
        {valueNode}
      </span>
    </span>
  );

  if (!value) {
    return;
  }

  const newPath = `${path}.${key}`;

  if (typeof value === 'string' && value.includes('\n')) {
    // add a new code line for each line of a multiline string value
    // preserving the correct indentation and skipping any additional
    // formatting of the content
    value.split('\n').forEach((line, index) =>
      addLine({
        key: index,
        level: level + 1,
        lines,
        path,
        rawString: true,
        value: line
      })
    );
  } else if (Array.isArray(value)) {
    const valueToUse = [...value];
    let offset = 0;
    if (typeof key === 'number' && valueToUse.length) {
      // first item of a nested array appears on the same line as the parent
      offset = 1;
      lines.pop();
      const firstItem = valueToUse.shift();
      addLine({
        addBullet: true,
        key: 0,
        level: level + 1,
        lines,
        path: newPath,
        value: firstItem
      });
    }

    valueToUse.forEach((arrayItem, index) =>
      addLine({
        key: index + offset,
        level: level + 1,
        lines,
        path: newPath,
        value: arrayItem
      })
    );
  } else if (typeof value === 'object') {
    const valueToUse = { ...value };
    if (typeof key === 'number' && Object.keys(valueToUse).length) {
      // first key of an object in an array appears on same line as the parent
      lines.pop();
      const firstKey = Object.keys(valueToUse).shift();
      addLine({
        addBullet: true,
        key: firstKey,
        level: level + 1,
        lines,
        path: newPath,
        value: valueToUse[firstKey]
      });
      delete valueToUse[firstKey];
    }

    getLines({ level: level + 1, lines, path: newPath, resource: valueToUse });
  }
}

function getLines({ level = 0, lines, path, resource }) {
  const isRootArray = level === 0 && Array.isArray(resource);
  return Object.keys(resource).reduce((acc, key) => {
    addLine({
      key: isRootArray ? parseInt(key, 10) : key,
      level,
      lines: acc,
      path,
      value: resource[key]
    });
    return acc;
  }, lines);
}

export default function SyntaxHighlighter({ resource }) {
  const carbonPrefix = usePrefix();
  const lines = getLines({ lines: [], path: '', resource });
  const minWidth = `${lines.length.toString().length - 1}rem`;

  return (
    <pre
      className={`tkn--syntax-highlighter ${carbonPrefix}--snippet--multi hljs`}
      style={{ '--tkn--line-number--min-width': minWidth }}
    >
      <code>{lines}</code>
    </pre>
  );
}

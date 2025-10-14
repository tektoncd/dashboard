/*
Copyright 2019-2025 The Tekton Authors
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
require('dotenv').config();

const difference = require('lodash.difference');
const fs = require('fs');
const omit = require('lodash.omit');
const path = require('path');

const basePath = process.cwd();

const defaultLocale = process.env.VITE_LOCALES_DEFAULT;
const buildLocales = process.env.VITE_LOCALES_BUILD.split(',');
const messagesFilePrefix = 'messages_';
const messagesPath = path.resolve(basePath, 'src/nls/');

const defaultMessages = require(
  path.resolve(messagesPath, `${messagesFilePrefix}${defaultLocale}.json`)
);

function log(...args) {
  console.log(...args);
}

function sortMessages(messages) {
  const sortedMessages = {};
  const sortedKeys = Object.keys(messages).sort();

  sortedKeys.forEach(key => {
    sortedMessages[key] = messages[key];
  });

  return sortedMessages;
}

function writeLocaleFile(locale, messages) {
  const localePath = path.resolve(
    messagesPath,
    `${messagesFilePrefix}${locale}.json`
  );
  log('Updating message bundle:', localePath);
  fs.writeFileSync(localePath, JSON.stringify(messages, null, 2));
}

// ----------------------------------------------------------------------------

log('Updating translation files\n');

const messageKeys = Object.keys(defaultMessages);

buildLocales
  .filter(locale => locale !== defaultLocale)
  .forEach(locale => {
    let translations = {};
    try {
      translations = require(
        `${basePath}/src/nls/${messagesFilePrefix}${locale}.json`
      );
    } catch {
      log(`No message bundle found for '${locale}', one will be created.`);
    }

    // remove stale strings
    const stale = difference(Object.keys(translations), messageKeys);
    translations = omit(translations, stale);

    // add new strings
    messageKeys.forEach(key => {
      if (!translations[key]) {
        translations[key] = '';
      }
    });

    const sortedTranslations = sortMessages(translations);
    writeLocaleFile(locale, sortedTranslations);
  });

log('\nFinished!\n');

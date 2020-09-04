/*
Copyright 2019 The Tekton Authors
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
const babel = require('@babel/core');
const difference = require('lodash.difference');
const fs = require('fs');
const glob = require('glob');
const omit = require('lodash.omit');
const path = require('path');

const basePath = process.cwd();
const localeConfig = require(`${basePath}/config_frontend/config.json`).locales; // eslint-disable-line

const defaultMessages = {};
const { default: defaultLocale, build: buildLocales } = localeConfig;
const messagesFilePrefix = 'messages_';
const messagesPath = path.resolve(basePath, 'src/nls/');

function log(...args) {
  console.log(...args); // eslint-disable-line no-console
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
  fs.writeFileSync(localePath, JSON.stringify({ [locale]: messages }, null, 2));
}

// ----------------------------------------------------------------------------

log('Extracting messages\n');

glob
  .sync('./@(src|packages)/**/!(*.stories|*.test).js', {
    ignore: ['./**/dist/**', './**/node_modules/**']
  })
  .forEach(filePath => {
    log(filePath);
    const { metadata } = babel.transformFileSync(path.normalize(filePath), {
      plugins: [['react-intl', { extractFromFormatMessageCall: true }]]
    });

    const { messages } = metadata['react-intl'];
    messages.forEach(({ id, defaultMessage }) => {
      if (defaultMessages[id] && defaultMessages[id] !== defaultMessage) {
        throw new Error(
          `Duplicate message id with conflicting defaultMessage: '${id}'`
        );
      }
      defaultMessages[id] = defaultMessage;
    });
  });

log('\nDone extracting messages\n');

const messageKeys = Object.keys(defaultMessages);
const sortedMessages = sortMessages(defaultMessages);
writeLocaleFile(defaultLocale, sortedMessages);

buildLocales
  .filter(locale => locale !== defaultLocale)
  .forEach(locale => {
    let translations = { [locale]: {} };
    try {
      translations = require(`${basePath}/src/nls/${messagesFilePrefix}${locale}.json`)[ // eslint-disable-line
        locale
      ];
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

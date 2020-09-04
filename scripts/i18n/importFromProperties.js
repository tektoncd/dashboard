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
const fs = require('fs');
const path = require('path');
const propertiesReader = require('properties-reader');

const basePath = process.cwd();
const localeConfig = require(`${basePath}/config_frontend/config.json`).locales; // eslint-disable-line
const [, , propertiesPathPrefix] = process.argv;

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

if (!propertiesPathPrefix) {
  log('Missing arg <propertiesPathPrefix>. Exiting\n');
  process.exit(1);
}

log(`Importing translations from ${propertiesPathPrefix}\n`);

buildLocales
  .filter(locale => locale !== defaultLocale)
  .forEach(locale => {
    let translations = require(`${basePath}/src/nls/${messagesFilePrefix}${locale}.json`)[ // eslint-disable-line
      locale
    ];

    const propertiesPath = `${propertiesPathPrefix}${locale}.properties`;
    try {
      const properties = propertiesReader(propertiesPath).getAllProperties();

      // update translations
      Object.keys(translations).forEach(key => {
        if (properties[key]) {
          translations[key] = properties[key];
        }
      });

      const sortedTranslations = sortMessages(translations);
      writeLocaleFile(locale, sortedTranslations);
    } catch {
      log(`Failed to load ${propertiesPath}`);
    }
  });

log('\nFinished!\n');

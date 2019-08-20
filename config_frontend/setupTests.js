import 'react-testing-library/cleanup-after-each';
import fetchMock from 'fetch-mock';

fetchMock.catch();
fetchMock.config.warnOnFallback = false;
fetchMock.config.overwriteRoutes = true;

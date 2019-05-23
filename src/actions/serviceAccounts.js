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

import { getServiceAccounts } from '../api';
import { getSelectedNamespace } from '../reducers';

export function fetchServiceAccountsSuccess(data) {
  return {
    type: 'SERVICE_ACCOUNTS_FETCH_SUCCESS',
    data
  };
}

export function fetchServiceAccounts({ namespace } = {}) {
  return async (dispatch, getState) => {
    dispatch({ type: 'SERVICE_ACCOUNTS_FETCH_REQUEST' });
    let serviceAccounts;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      serviceAccounts = await getServiceAccounts(requestedNamespace);
      dispatch(fetchServiceAccountsSuccess(serviceAccounts));
    } catch (error) {
      dispatch({ type: 'SERVICE_ACCOUNTS_FETCH_FAILURE', error });
    }
    return serviceAccounts;
  };
}

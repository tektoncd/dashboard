/*
Copyright 2022-2024 The Tekton Authors
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
import { useContext, useEffect } from 'react';
import {
  UNSAFE_RouteContext, // eslint-disable-line camelcase
  useParams
} from 'react-router-dom';

import { useSelectedNamespace } from '../../api';

/*
  There is no equivalent of the v5 `useRouteMatch` in v6 so we have to provide
  our own to get the currently matched route. A future release may provide something
  we can use but for now we rely on an internal API that's provided as an escape
  hatch for exactly this reason. We'll have to be careful with future updates to
  ensure this continues to work or switch to an alternative if needed.
*/
function useCurrentPath() {
  const routeContext = useContext(UNSAFE_RouteContext);
  const match = routeContext.matches.at(-1); // we always want the last match

  let { path } = match.route;
  path = path.replace(/\/\*/, ''); // remove any trailing splat

  return path;
}

const NamespacedRoute = ({ children, isResourceDetails }) => {
  const params = useParams();
  const path = useCurrentPath();
  const { setNamespacedMatch } = useSelectedNamespace();

  useEffect(() => {
    setNamespacedMatch({
      isResourceDetails,
      params,
      path
    });

    return () => {
      setNamespacedMatch(null);
    };
  }, []);

  return children;
};

export default NamespacedRoute;

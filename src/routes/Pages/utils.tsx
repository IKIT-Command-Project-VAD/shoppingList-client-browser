import { Route } from 'react-router';

import type { Theme } from '@mui/material';

import { PrivateRoute } from '@/routes/PrivateRoute/PrivateRoute';
import { objectInsertIf } from '@/utils/insertIf';

import { Routes } from '../types';

function getPageHeight(theme: Theme) {
  const topSpacing = Number(theme.mixins.toolbar.minHeight) + parseInt(theme.spacing(1));

  return `calc(100vh - ${topSpacing}px)`;
}

function renderRoutes(routes: Routes) {
  return routes.map(
    ({ path, component: Component, routes: nestedRoutes, protected: isProtected }) => {
      const element = <Component />;
      const wrappedElement = isProtected ? <PrivateRoute>{element}</PrivateRoute> : element;

      return (
        <Route
          key={path}
          path={path}
          element={wrappedElement}
          {...objectInsertIf(nestedRoutes, {
            children: nestedRoutes && renderRoutes(nestedRoutes as Routes),
          })}
        />
      );
    },
  );
}

export { getPageHeight, renderRoutes };

import { FC } from 'react';
import { PathRouteProps } from 'react-router';

import type { SvgIconProps } from '@mui/material/SvgIcon';

type Routes = Array<PathRouteProps & PathRouteCustomProps>;

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  protected?: boolean;
  icon?: FC<SvgIconProps>;
  routes?: Routes;
};

export type { Routes };

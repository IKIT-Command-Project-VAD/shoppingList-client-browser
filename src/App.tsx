import { Fragment } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router';

import { CssBaseline } from '@mui/material';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import i18n from '@/i18n';

import Pages from './routes/Pages';
import Header from './sections/Header';
import HotKeys from './sections/HotKeys';
import Sidebar from './sections/Sidebar';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Fragment>
        <CssBaseline />
        <HotKeys />
        <BrowserRouter>
          <Header />
          <Sidebar />
          <Pages />
        </BrowserRouter>
      </Fragment>
    </I18nextProvider>
  );
}

const AppWithErrorHandler = withErrorHandler(App, AppErrorBoundaryFallback);
export default AppWithErrorHandler;

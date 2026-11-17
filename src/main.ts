import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

// Import global styles
import './styles.css';

bootstrapApplication(App, appConfig);

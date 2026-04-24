import './firebase-config.js'; // initialize firebase
import * as auth from './auth.js';
import * as projects from './projects.js';
import * as views from './views.js';
import * as onboard from './onboard.js';
import * as console from './console.js';
import * as editor from './editor.js';

// Expose all functions to window for onclick handlers
Object.assign(window, {
  ...auth,
  ...projects,
  ...views,
  ...onboard,
  ...console,
  ...editor
});

// Since interpreter and samples are loaded globally before this script,
// we just let them attach to window directly.

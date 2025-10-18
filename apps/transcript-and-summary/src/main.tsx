// Use build-time constants to determine import strategy
// @ts-ignore - Build-time constant defined by webpack
if (typeof __WEBRESOURCE_BUILD__ !== 'undefined' && __WEBRESOURCE_BUILD__) {
  // For webresource builds, use synchronous import and simplified bootstrap
  const { bootstrapStandalone } = require('./bootstrap');
  const { DeploymentContextDetector } = require('@shared/config');

  // Force webresource mode
  const detector = DeploymentContextDetector.getInstance();
  detector.forceDeploymentMode('web_resource');

  bootstrapStandalone({
    container: 'root'
  }).catch((error: Error) => {
    console.error('Failed to bootstrap Transcript and Summary app:', error);
  });
} else {
  // For microfrontend and standalone builds, use async import
  import('./bootstrap').then(({ bootstrap }) => {
    bootstrap({
      container: 'root'
    }).catch(error => {
      console.error('Failed to bootstrap Transcript and Summary app:', error);
    });
  }).catch(error => {
    console.error('Failed to load bootstrap module:', error);
  });
}

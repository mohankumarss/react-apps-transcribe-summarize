// Import bootstrap asynchronously to create proper async boundary for Module Federation
import('./bootstrap').then(({ bootstrap }) => {
  bootstrap({
    container: 'root'
  }).catch(error => {
    console.error('Failed to bootstrap IF Party Master app:', error);
  });
}).catch(error => {
  console.error('Failed to load bootstrap module:', error);
});

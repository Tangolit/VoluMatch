import 'react-native-gesture-handler';

// Polyfill for Firebase compatibility
if (typeof global.self === 'undefined') {
  global.self = global;
}

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

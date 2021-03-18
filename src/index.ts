import { ViolComponent, Component, createApp, html } from '@viol/core';
import { useSyntheticRouter } from '@viol/router';
import { Nav } from './components/Nav';
import { Router } from './components/Router';
@Component<App>({
  template: html`
    <div class="p-8">
      ${new Nav()}
      ${new Router()}
    </div>
  `,
  state: {
    route: '',
  },
})
class App extends ViolComponent { }

createApp(new App({}, 'DemoApp'), document.getElementById('root')!, {
  with: [useSyntheticRouter],
});

import { ViolComponent, Component, createApp, html } from '@viol/core';
import { syntheticRouter, RouterOutlet, Route, useSyntheticRouter } from '@viol/router';
import { MemoryApp } from './CardGame/MemoryApp';
import { CounterApp } from './Counter/CounterApp';
import { NavItem } from './components/NavItem';
import { TagsApp } from './Tags/TagsApp';
import { ScopedCssApp } from './ScopedCss/ScopedCssApp';

type AppState = {
  route: string;
};

const nav = [
  { path: '', caption: 'Home' },
  { path: 'counter', caption: 'Counter' },
  { path: 'scopedCss', caption: 'Scoped CSS' },
  { path: 'memory', caption: 'Memory Game' },
  { path: 'tags', caption: 'Tags' },
];

const routes: Route<App>[] = [
  {
    path: '',
    template: `
      <p class="text-center text-3xl font-bold text-gray-900">
        Go ahead and click one of those examples above (:
      </p>
    `,
  },
  { path: 'counter', component: new CounterApp({}, 'CounterApp') },
  { path: 'scopedCss', component: new ScopedCssApp({}, 'ScopedCssApp') },
  { path: 'memory', component: new MemoryApp({}, 'MemoryApp') },
  { path: 'tags', component: new TagsApp({}, 'TagsApp') },
];

@Component<App>({
  template: ({ self }) => html`
    <div class="p-8">
      <nav class="text-center">
        ${nav.map(({ path, caption }) => new NavItem({ path, caption }))}
      </nav>
      <main class="py-8">
        ${new RouterOutlet({
          router: syntheticRouter,
          routes,
          onRouteChange: self.onRouteChange,
        })}
      </main>
    </div>
  `,
  state: {
    route: '',
  },
})
class App extends ViolComponent<AppState> {
  onRouteChange(route: string) {
    console.log('Route changed to:', route);
  }
}

const app = new App({}, 'DemoApp');
createApp(app, document.getElementById('root')!, {
  with: [useSyntheticRouter],
});
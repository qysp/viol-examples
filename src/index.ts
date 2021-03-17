import { ViolComponent, Component, createApp, html } from '@viol/core';
import { MemoryApp } from './CardGame/MemoryApp';
import { CounterApp } from './Counter/CounterApp';
import { NavItem } from './components/NavItem';
import { TagsApp } from './Tags/TagsApp';
import { ScopedCssApp } from './ScopedCss/ScopedCssApp';

type AppState = {
  route: string;
};

const routes = [
  { path: '', caption: 'Home' },
  { path: 'counter', caption: 'Counter' },
  { path: 'scopedCss', caption: 'Scoped CSS' },
  { path: 'memory', caption: 'Memory Game' },
  { path: 'tags', caption: 'Tags' },
];

@Component<App>({
  template: ({ self }) => html`
    <div class="p-8">
      <nav class="text-center">
        ${routes.map(({ path, caption }) => new NavItem({
          onClick: self.onRouteChange(path),
          caption,
        }))}
      </nav>
      <main class="py-8">
        <p x-show="state.route === ''" class="text-center text-3xl font-bold text-gray-900">
          Go ahead and click one of those examples above (:
        </p>
        <template x-if="state.route === 'counter'">
          ${new CounterApp({}, 'CounterApp')}
        </template>
        <template x-if="state.route === 'scopedCss'">
          ${new ScopedCssApp({}, 'ScopedCssApp')}
        </template>
        <template x-if="state.route === 'memory'">
          ${new MemoryApp({}, 'MemoryApp')}
        </template>
        <template x-if="state.route === 'tags'">
          ${new TagsApp({}, 'TagsApp')}
        </template>
      </main>
    </div>
  `,
  state: {
    route: '',
  },
})
class App extends ViolComponent<AppState> {
  onRouteChange(route: string) {
    return () => {
      console.log('Route changed to:', route);
      this.state.route = route;
    }
  }
}

createApp(new App({}, 'DemoApp'), document.getElementById('root')!);

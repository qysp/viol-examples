import { AlpineComponent, Component, createApp, html } from '../../ayce/lib/index';
import { MemoryApp } from './CardGame/MemoryApp';
import { CounterApp } from './Counter/CounterApp';
import { NavItem } from './components/NavItem';
import { TagsApp } from './Tags/TagsApp';

type AppState = {
  route: string;
};

@Component({
  template: html<App>`
    <div id="app" class="p-8">
      <nav id="app-nav" class="text-center sticky z-10">
        ${({ self }) => new NavItem({
          onClick: self.onRouteChange(''),
          caption: 'Home',
        })}
        ${({ self }) => new NavItem({
          onClick: self.onRouteChange('counter'),
          caption: 'Counter Example',
        })}
        ${({ self }) => new NavItem({
          onClick: self.onRouteChange('memory'),
          caption: 'Memory Game Example',
        })}
        ${({ self }) => new NavItem({
          onClick: self.onRouteChange('tags'),
          caption: 'Tags Example',
        })}
      </nav>
      <main id="app-router">
        <p x-show="state.route === ''" class="text-center text-3xl font-bold text-gray-900 pt-16">
          Go ahead and click one of those examples above (:
        </p>
        <template x-if="state.route === 'counter'">
          ${new CounterApp({}, 'CounterApp')}
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
  styles: `
    #app-nav {
      top: 5px;
    }
  `,
  state: {
    route: '',
  },
})
class App extends AlpineComponent<AppState> {
  onRouteChange(route: string) {
    return () => {
      console.log('Route changed to:', route);
      this.state.route = route;
    }
  }
}

createApp(new App({}, 'DemoApp'), document.getElementById('root')!);

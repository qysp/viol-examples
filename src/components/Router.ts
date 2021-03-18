import { Component, html, ViolComponent } from '@viol/core';
import { Route, RouterOutlet, syntheticRouter } from '@viol/router';
import { MemoryApp } from '../CardGame/MemoryApp';
import { CounterApp } from '../Counter/CounterApp';
import { ScopedCssApp } from '../ScopedCss/ScopedCssApp';
import { TagsApp } from '../Tags/TagsApp';

const routes: Route<Router>[] = [
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

@Component<Router>({
  template: ({ self }) => html`
    <main class="py-8">
      ${new RouterOutlet({
        router: syntheticRouter,
        routes,
        onRouteChange: self.onRouteChange,
      })}
    </main>
  `,
})
export class Router extends ViolComponent {
  onRouteChange(route: string) {
    console.log('Route changed to:', route);
  }
}

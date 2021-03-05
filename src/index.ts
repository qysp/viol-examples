import { Component, createApp, html } from '../../ayce/lib/Ayce';
import { AlpineComponent } from '../../ayce/lib/index';
import { MemoryApp } from './CardGame/MemoryApp';
import { CounterApp } from './Counter/CounterApp';

const navButtonClass = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full';

type AppState = {
  route: string;
};

@Component({
  template: html<App>`
    <div id="app" class="p-8">
      <nav id="app-nav" class="text-center">
        <button @click="state.route = ''" class="${navButtonClass}">Home</button>
        <button @click="state.route = 'counter'" class="${navButtonClass}">Counter Example</button>
        <button @click="state.route = 'memory'" class="${navButtonClass}">Memory Game Example</button>
      </nav>
      <p x-show="state.route === ''" class="text-center text-3xl font-bold text-gray-900 pt-16">
        Go ahead and click one of those examples above (:
      </p>
      <template x-if="state.route === 'counter'">
        ${new CounterApp()}
      </template>
      <template x-if="state.route === 'memory'">
        ${new MemoryApp()}
      </template>
    </div>
  `,
  state: {
    route: '',
  },
})
class App extends AlpineComponent<AppState> { }

createApp(new App(), document.getElementById('root')!);

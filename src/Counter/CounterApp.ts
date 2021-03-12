import { AlpineComponent, Component, html } from '../../../ayce/lib/index';
import { RenderedIn } from '../RenderedIn';
import { Counter } from './Counter';

@Component<CounterApp>({
  template: html`
    <div id="counter-app" class="text-center p-8">
      ${({ self }) => new RenderedIn({ name: self.parent!.name })}
      <div class="pb-4">
        <label
          for="counter1"
          class="text-lg font-bold text-gray-900"
        >
          Counter (1s interval)
        </label>
        ${({ self }) => new Counter({
          id: 'counter1',
          onDone: self.onDone('Counter 1'),
        })}
      </div>
      <div class="pb-4">
        <label
          for="counter2"
          class="text-lg font-bold text-gray-900"
        >
          Counter (.5s interval)
        </label>
        ${({ self }) => new Counter({
          id: 'counter2',
          tickrate: 500,
          onDone: self.onDone('Counter 2'),
        })}
      </div>
    </div>
  `,
})
export class CounterApp extends AlpineComponent {
  onInit(): void {
    console.log('Init: Counter App');
  }

  onDone(name: string) {
    return () => alert(`${name} -> done!`);
  }
}

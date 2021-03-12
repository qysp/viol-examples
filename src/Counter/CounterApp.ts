import { AlpineComponent, Component, html } from '../../../ayce/lib/index';
import { RenderedIn } from '../components/RenderedIn';
import { Counter } from './Counter';

@Component<CounterApp>({
  template: html`
    <div id="counter-app" class="text-center p-8">
      ${({ self }) => new RenderedIn({ name: self.parent!.name })}
      <div class="pb-4">
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (1s interval)
        </p>
        ${({ self }) => new Counter({ onDone: self.onDone('Counter 1') })}
      </div>
      <div>
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (.5s interval)
        </p>
        ${({ self }) => new Counter({
          tickrate: 500,
          onDone: self.onDone('Counter 2'),
        })}
      </div>
    </div>
  `,
})
export class CounterApp extends AlpineComponent {
  onInit() {
    console.log('Init: Counter App');
  }

  onAfterInit() {
    console.log('After Init: Counter App');
  }

  onDone(name: string) {
    return () => alert(`${name} -> done!`);
  }
}

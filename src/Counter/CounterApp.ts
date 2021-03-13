import { AyceComponent, Component, html } from '../../../ayce/lib/index';
import { RenderedIn } from '../components/RenderedIn';
import { Counter } from './Counter';

@Component<CounterApp>({
  template: ({ self }) => html`
    <div class="text-center">
      ${new RenderedIn({ name: self.parent!.name })}
      <div class="pb-4">
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (1s interval)
        </p>
        ${new Counter({ onDone: self.onDone('Counter 1') })}
      </div>
      <div>
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (.5s interval)
        </p>
        ${new Counter({ onDone: self.onDone('Counter 2'), tickrate: 500 })}
      </div>
    </div>
  `,
})
export class CounterApp extends AyceComponent {
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

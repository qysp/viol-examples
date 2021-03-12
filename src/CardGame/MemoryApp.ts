import { AlpineComponent, Component, html } from '../../../ayce/lib/index';
import { SourceLink } from '../components/SourceLink';
import { CardGame } from './CardGame';
import { FlashMessage } from './FlashMessage';

@Component<MemoryApp>({
  template: html`
    <div id="memory-app" class="text-center">
      ${new SourceLink({ url: MemoryApp.SourceUrl })}
      ${new CardGame()}
      ${new FlashMessage()}
    </div>
  `,
})
export class MemoryApp extends AlpineComponent {
  static readonly SourceUrl = 'https://github.com/alpinejs/alpine/blob/master/examples/card-game.html';

  onInit(): void {
    console.log('Init: Memory App');
  }
}

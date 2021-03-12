import { AlpineComponent, Component, html } from '../../../ayce/lib/index';
import { RenderedIn } from '../RenderedIn';
import { CardGame } from './CardGame';
import { FlashMessage } from './FlashMessage';

@Component({
  template: html<MemoryApp>`
    <div id="memory-app" class="text-center">
      ${({ self }) => new RenderedIn({ name: self.parent!.name })}
      ${new CardGame()}
      ${new FlashMessage()}
    </div>
  `,
})
export class MemoryApp extends AlpineComponent {
  onInit(): void {
    console.log('Init: Memory App');
  }
}

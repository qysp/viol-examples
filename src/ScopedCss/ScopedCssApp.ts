import { ViolComponent, Component, html } from '@viol/core';
import { ScopedCss } from './ScopedCss';

@Component<ScopedCssApp>({
  template: html`
    <div class="text-center">
      <p class="text-2xl font-bold text-gray-900 my-4">
        Inspect one of the paragraph's styles below! :)
      </p>
      ${new ScopedCss({ color: 'red' })}
      ${new ScopedCss({ color: 'blue' })}
    </div>
  `,
})
export class ScopedCssApp extends ViolComponent { }

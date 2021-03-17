import { ViolComponent, Component, css } from '@viol/core';

@Component<ScopedCss>({
  template: ({ props }) => `
    <p class="text-lg font-bold">Look at me, I am ${props.color}!<p>
  `,
  styles: ({ self, props }) => css`
    ${self} {
      color: ${props.color};
    }
  `,
})
export class ScopedCss extends ViolComponent<{}, { color: string }> { }

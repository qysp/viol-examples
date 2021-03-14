import { AyceComponent, Component, css } from 'ayce';

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
export class ScopedCss extends AyceComponent<{}, { color: string }> { }

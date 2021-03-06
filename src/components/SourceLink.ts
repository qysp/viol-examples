import { ViolComponent, Component, css } from '@viol/core';

type SourceLinkProps = {
  url: string;
}

@Component<SourceLink>({
  template: `
    <a
      :href="props.url"
      target="_blank"
      rel="noopener noreferrer"
      class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
    >
      Source
    </a>
  `,
  styles: ({ self }) => css`
    ${self} {
      top: 5px;
      left: 5px;
      position: fixed;
    }
  `,
})
export class SourceLink extends ViolComponent<{}, SourceLinkProps> { }
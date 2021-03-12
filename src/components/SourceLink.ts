import { AlpineComponent, Component, css } from '../../../ayce/lib/index';

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
  styles: css`
    ${({ self }) => self.selector} {
      top: 5px;
      left: 5px;
      position: fixed;
    }
  `,
})
export class SourceLink extends AlpineComponent<{}, SourceLinkProps> { }
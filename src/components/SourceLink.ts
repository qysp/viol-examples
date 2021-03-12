import { AlpineComponent, Component } from '../../../ayce/lib/index';

type SourceLinkProps = {
  url: string;
}

@Component<SourceLink>({
  template: `
    <a
      :href="props.url"
      target="_blank"
      rel="noopener noreferrer"
      class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full top-left-fixed"
    >
      Source
    </a>
  `,
  style: `
    .top-left-fixed {
      top: 5px;
      left: 5px;
      position: fixed;
    }
  `,
})
export class SourceLink extends AlpineComponent<{}, SourceLinkProps> { }
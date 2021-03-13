import { AyceComponent, Component } from "../../../ayce/lib/index";

export type RenderedInProps = {
  name: string;
};

@Component({
  template: `
    <p class="text-sm text-gray-900 py-4">
      Rendered in: <strong x-text="props.name"></strong>
    </p>
  `,
})
export class RenderedIn extends AyceComponent<{}, RenderedInProps> { }

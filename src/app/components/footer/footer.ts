import { Component, input, output } from '@angular/core';

import { Filter } from '../../models/filter';

const FILTER_OPTIONS = [
  { key: Filter.All,       label: 'All' },
  { key: Filter.Active,    label: 'Active' },
  { key: Filter.Completed, label: 'Completed' },
] as const;

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  readonly activeCount    = input(0);
  readonly completedCount = input(0);
  readonly filter         = input(Filter.All);

  readonly filterChange    = output<Filter>();
  readonly clearCompleted  = output<void>();

  readonly filterOptions = FILTER_OPTIONS;
  readonly Filter        = Filter;
}

import { cx } from '@/utils/cx';

import styles from './SegmentedControl.module.css';

type SegmentedControlProps<Value extends string> = {
  value: Value;
  onChange: (value: Value) => void;
  options: { value: Value; label: string; count?: number }[];
  'aria-label': string;
};

/** Switches between a few views of the same list, such as status filters. */
export function SegmentedControl<Value extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
}: SegmentedControlProps<Value>) {
  return (
    <div className={styles.control} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={cx(styles.option, option.value === value && styles.active)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={styles.count}>{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

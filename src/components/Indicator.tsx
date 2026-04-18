interface Props {
  tag: string;
  value: number;
  decimals?: number;
}

export function Indicator({ tag, value, decimals = 2 }: Props) {
  return (
    <div className="indicator">
      <div className="ind-tag">{tag}</div>
      <div className="ind-val">{value.toFixed(decimals)}</div>
    </div>
  );
}

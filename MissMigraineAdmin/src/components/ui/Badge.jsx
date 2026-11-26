export function Badge({ children, className }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 font-plein-medium text-xs ${className}`}>
      {children}
    </span>
  );
}
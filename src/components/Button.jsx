const VARIANTS = {
  primary:
    "signature-gradient text-on-primary hover:shadow-[0_0_30px_rgba(192,193,255,0.4)]",
  secondary:
    "ghost-border text-on-surface hover:bg-surface-container-low",
  ghost:
    "bg-surface-container-highest text-on-surface-variant hover:text-on-surface",
  outline:
    "border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest",
};

function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}) {
  const base =
    "rounded-full font-label font-bold transition-all inline-flex items-center justify-center";
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      className={`${base} ${variantClass} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

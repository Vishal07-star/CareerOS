// src/frontend/components/Button.jsx
import React, { forwardRef } from "react";
import "./Button.css";

/**
 * Production-grade Button component.
 *
 * Variants  : "primary" | "secondary" | "outline" | "ghost" | "danger"
 * Sizes     : "sm" | "md" (default) | "lg"
 * States    : disabled, loading
 * Extras    : leftIcon, rightIcon, fullWidth, polymorphic `as` prop
 *
 * The component forwards its ref to the underlying element and spreads all
 * unrecognised HTML attributes (aria-*, data-*, etc.) onto it.
 *
 * @example
 * <Button variant="primary" size="lg" leftIcon={<Plus size={16} />}>
 *   Post a Job
 * </Button>
 *
 * @example
 * <Button variant="danger" loading={saving} onClick={handleDelete}>
 *   Delete
 * </Button>
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    loading = false,
    fullWidth = false,
    leftIcon = null,
    rightIcon = null,
    className = "",
    as: Tag = "button",
    onClick,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    loading ? "btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // When rendered as a non-button element (e.g. <a>), we need role="button"
  // so assistive tech treats it correctly.
  const roleAttr = Tag !== "button" ? { role: "button" } : {};

  return (
    <Tag
      ref={ref}
      type={Tag === "button" ? type : undefined}
      className={classes}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      onClick={isDisabled ? undefined : onClick}
      {...roleAttr}
      {...rest}
    >
      {/* Loading spinner — CSS-only, no extra JS */}
      {loading && <span className="btn__spinner" aria-hidden="true" />}

      {!loading && leftIcon && (
        <span className="btn__icon btn__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      <span className="btn__label">{children}</span>

      {!loading && rightIcon && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Tag>
  );
});

Button.displayName = "Button";
export default Button;

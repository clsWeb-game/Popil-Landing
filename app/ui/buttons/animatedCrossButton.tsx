"use client";

import React from "react";
import "./animatedCrossButton.css";

type AnimatedCrossButtonProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
};

export default function AnimatedCrossButton({
  checked,
  onChange,
  className = "",
}: AnimatedCrossButtonProps) {
  return (
    <label className={`animatedCrossButton-switch ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="animatedCrossButton-wrapper">
        <span className="animatedCrossButton-row">
          <span className="animatedCrossButton-dot" />
          <span className="animatedCrossButton-dot" />
        </span>
        <span className="animatedCrossButton-row animatedCrossButton-rowBottom">
          <span className="animatedCrossButton-dot" />
          <span className="animatedCrossButton-dot" />
        </span>
        <span className="animatedCrossButton-rowVertical">
          <span className="animatedCrossButton-dot" />
          <span className="animatedCrossButton-dot animatedCrossButton-middleDot" />
          <span className="animatedCrossButton-dot" />
        </span>
        <span className="animatedCrossButton-rowHorizontal">
          <span className="animatedCrossButton-dot" />
          <span className="animatedCrossButton-dot animatedCrossButton-middleDotHorizontal" />
          <span className="animatedCrossButton-dot" />
        </span>
      </span>
    </label>
  );
}
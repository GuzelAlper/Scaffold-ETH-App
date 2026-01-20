import React from "react";

interface EtherInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EtherInput: React.FC<EtherInputProps> = ({
  value,
  onChange,
  placeholder = "0.0 ETH",
}) => {
  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input input-bordered w-full text-black"
    />
  );
};

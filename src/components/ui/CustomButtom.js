import React from "react";
import { Button } from "react-bootstrap";

const CustomButton = ({ text, link, variant = "primary" }) => {
  return (
    <Button href={link} variant={variant} className="mt-3">
      {text}
    </Button>
  );
};

export default CustomButton;
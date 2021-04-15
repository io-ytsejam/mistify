import React from "react";
import {createUseStyles} from "react-jss";
import theme from "../Theme";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const {input} = createUseStyles({
    input: {
      fontSize: '1rem',
      backgroundColor: theme.colors.secondaryLight,
      color: "white",
      borderRadius: '3px',
      border: "2px solid #292929",
      boxShadow: '0 0 .5rem #272727',
      height: "2rem",
      padding: '.25rem',
      outline: "none",
      '&:hover': {
        filter: 'brightness(1.2)'
      },
      '&:focus': {
        border: "2px solid #ffccbc",
      }
    }
  })()

  return <input {...props} className={input}
  />
}
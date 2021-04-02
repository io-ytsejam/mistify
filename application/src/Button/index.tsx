import React from "react";
import {createUseStyles} from "react-jss";
import theme from "../Theme";

interface ButtonProps {
  variant?: 'first'|'second',
  size?: 's'|'m'|'l'
}

export default function Button(props: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let buttonSpacing = '1rem .5rem'
  let buttonFontSize = 14

  switch (props.size) {
    case "s": {
      buttonFontSize = 10
      buttonSpacing = '.5rem .25rem'; break;
    }
    case "m": {
      buttonFontSize = 12
      buttonSpacing = '.75rem .25rem'; break;
    }
    case "l": {
      buttonFontSize = 14
      buttonSpacing = '1rem .5rem'; break;
    }
  }

  const useStyles = createUseStyles({
    button: {
      background: theme.colors.primary,
      color: theme.colors.primaryText,
      fontWeight: "bold",
      borderRadius: '2rem',
      border: "none",
      padding: buttonSpacing,
      margin: buttonSpacing,
      // boxShadow: '0px 0px 5px #686868',
      fontFamily: 'Montserrat',
      outline: "none",
      fontSize: buttonFontSize,
      // textShadow: '0 .25rem .25rem rgba(0, 0, 0, 0.25)',
      cursor: 'pointer',
      userSelect: 'none',
      '&:hover': {
        filter: 'brightness(1.1)'
      },
      '&:active': {
        filter: 'brightness(.8)'
      },
    },
    secondButton: {
      extend: 'button',
      backgroundColor: theme.colors.primaryLight,
      boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)',
      borderRadius: 5
    }
  })

  const {button, secondButton} = useStyles()
  const {variant} = props

  const buttonClass = variant === 'second' ? secondButton : button

  return <button
    {...props}
    className={buttonClass}
  />
}
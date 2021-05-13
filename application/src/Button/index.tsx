import React from "react";
import {createUseStyles} from "react-jss";
import theme from "../Theme";

interface ButtonProps {
  variant?: 'first'|'second'|'icon'|'secondIcon',
  size?: 's'|'m'|'l'
}

export default function Button(props: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let buttonSpacing = '1rem .375rem'
  let buttonFontSize = 14

  switch (props.size) {
    case "s": {
      // buttonFontSize = 10
      buttonSpacing = '.3125rem'; break;
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
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: theme.colors.primary,
      color: theme.colors.primaryText,
      fontWeight: "bold",
      borderRadius: '2rem',
      border: "none",
      padding: buttonSpacing,
      boxShadow: '0px 0px 5px #686868',
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
      backgroundColor: "transparent",
      color: 'white',
      border: `1px solid ${theme.colors.primary}`,
      boxShadow: '0px 0px 5px #686868'
    },
    icon: {
      extend: 'button',
      width: props.size === 'l' ? '4rem' : props.size === 'm' ? '3rem' : '1.5rem',
      height: props.size === 'l' ? '4rem' : props.size === 'm' ? '3rem' : '1.5rem',
      padding: 0
    },
    secondIcon: {
      extend: 'icon',
      backgroundColor: "transparent",
      color: 'white'
    }
  })

  const {button, secondButton, icon, secondIcon} = useStyles()
  const {variant} = props
  let buttonClass

  if (variant === 'second')
    buttonClass = secondButton
  else if (variant === 'icon')
    buttonClass = icon
  else if (variant === 'secondIcon')
    buttonClass = secondIcon
  else buttonClass = button

  return <button
    {...props}
    className={buttonClass + ' ' + props.className}
  />
}
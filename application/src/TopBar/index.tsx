import {createUseStyles, Styles} from "react-jss";
import React from "react";
import theme from "../Theme";


interface TopBarProps {
  title: string
  buttons?: React.ReactNode
}

export default function TopBar({buttons, title}: TopBarProps) {
  const styles: Styles = {
    container: {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      backgroundColor: theme.colors.secondary + '99',
      backdropFilter: 'blur(.5rem)',
      fontWeight: "bolder",
      boxSizing: 'content-box',
      height: '1.875rem', // 30px
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      textShadow: '0px 0px 8px #000000',
      alignItems: 'center',
      padding: '.5rem 1rem',
    },
    buttonsGroup: {
      display: 'flex'
    }
  }

  const { container, buttonsGroup } = createUseStyles(styles)()

  return <div className={container}>
    <p>{title}</p>
    <div className={buttonsGroup}>
      {buttons}
    </div>
  </div>
}
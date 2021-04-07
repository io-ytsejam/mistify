import {createUseStyles, Styles} from "react-jss";
import React from "react";


interface TopBarProps {
  title: string
  buttons?: React.ReactNode
}

export default function TopBar({buttons, title}: TopBarProps) {
  const styles: Styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      textShadow: '0px 0px 8px #000000',
      alignItems: 'center',
      padding: '.5rem 0',
    },
    buttonsGroup: {
      display: 'flex'
    }
  }

  const { container } = createUseStyles(styles)()

  return <div className={container}>
    <p>{title}</p>
    <div>
      {buttons}
    </div>
  </div>
}
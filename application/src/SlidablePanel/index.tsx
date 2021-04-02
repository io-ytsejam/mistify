import {createUseStyles} from "react-jss";
import React from "react";
import theme from "../Theme";

interface SlidablePanelProps {
  children?: React.ReactNode
}

export default function SlidablePanel({children}: SlidablePanelProps) {
  const useStyles = createUseStyles({
    wrapper: {
      position: 'fixed',
      bottom: '3rem',
      width: '100vw',
      height: '4rem',
      boxSizing: 'border-box'
    },
    container: {
      color: 'white',
      userSelect: 'none',
      // background: 'radial-gradient(99.05% 99.05% at 49.87% 58.42%, #AF1170 0%, #383838 100%)',
      // background: 'radial-gradient(99.05% 99.05% at 49.87% 58.42%, #033e44 0%, #383838 100%)',
      backgroundColor: "rgb(255, 204, 188, 0.6)",
      backdropFilter: "blur(40px)",
      height: '100vh',
      width: '100%',
      borderRadius: '2.5rem 2.5rem 0 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0px -7px 10px rgba(0, 0, 0, 0.25)',
      bottom: 0
    },
    handle: {
      zIndex: 1,
      margin: '.5rem 0',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      '& div': {
        width: '.5rem',
        height: '.5rem',
        backgroundColor: 'black',
        margin: '.25rem',
        borderRadius: '.5rem',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)'
      }
    }
  })

  let panel: HTMLDivElement

  function getPanel(el: HTMLDivElement) {
    panel = el
  }
  const {container, wrapper, handle} = useStyles()

  return <div className={wrapper}>
    <div
      ref={getPanel}
      className={container}
      onMouseDown={function(e) {
        e = e || window.event;
        var start = 0, diff = 0;
        if( e.pageY) start = e.pageY - (panel.style.top ? parseInt(panel.style.top) : 0);
        else if( e.clientY) start = e.clientY - (panel.style.top ? parseInt(panel.style.top) : 0);

        panel.style.position = 'relative';
        document.body.onmousemove = function(e) {
          e = e || window.event;
          var end = 0;
          if( e.pageY) end = e.pageY;
          else if( e.clientY) end = e.clientY;

          diff = end-start;
          panel.style.top = diff+"px";
        };
        document.body.onmouseup = function() {
          // do something with the action here
          // elem has been moved by diff pixels in the X axis
          // panel.style.position = 'static';
          document.body.onmousemove = document.body.onmouseup = null;
        };
      }}

      onTouchStart={function(e) {
        e = e || window.event;
        var start = 0, diff = 0;
        if( e.touches[0].pageY) start = e.touches[0].pageY - (panel.style.top ? parseInt(panel.style.top) : 0);
        else if( e.touches[0].clientY) start = e.touches[0].clientY - (panel.style.top ? parseInt(panel.style.top) : 0);

        panel.style.position = 'relative';
        document.body.ontouchmove = function(e) {
          e = e || window.event;
          var end = 0;
          if( e.touches[0].pageY) end = e.touches[0].pageY;
          else if( e.touches[0].clientY) end = e.touches[0].clientY;

          diff = end-start;
          panel.style.top = diff+"px";
        };
        document.body.ontouchend = function() {
          // do something with the action here
          // elem has been moved by diff pixels in the X axis
          // panel.style.position = 'static';
          document.body.ontouchmove = document.body.ontouchend = null;
        };
      }}
    >
      <div className={handle}>
        <div />
        <div />
        <div />
      </div>
      {children}
    </div>
  </div>
}
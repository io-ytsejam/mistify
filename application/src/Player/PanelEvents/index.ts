export function prepareOnPanelTouchStart (panel: HTMLDivElement) {
  return function (e: any) {
    if (!panel) return
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
  }
}

export function prepareOnPanelMouseDown (panel: HTMLDivElement) {
  return function (e: any) {
    if (!panel) return
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
  }
}
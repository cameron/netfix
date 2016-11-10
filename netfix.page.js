function wait(delay) {
  return new Promise(function(resolve){
    setTimeout(resolve, delay);
  });
}

function percentToFloat(perc) {
  return parseFloat('.' + perc.replace(/[%.]/g,''));
}

function waitFor(selector){
  return new Promise(function(resolve, reject){
    var id = setInterval(function(){
      console.log('waiting for ' + selector);
      var elem = document.querySelector(selector);
      if (!elem) return;
      console.log('found ' + selector);
      clearInterval(id);
      resolve(elem);
    }, 200);

    setTimeout(function(){
      clearInterval(id)
      }, 10000);
  });
}

function dragTo (elemDrag, x2, y2) {
  var fireMouseEvent = function (type, elem, centerX, centerY) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
    elem.dispatchEvent(evt);
  };

  var x1 = 0;
  var y1 = 0;

  fireMouseEvent('mousemove', elemDrag, x1, y1);
  fireMouseEvent('mouseenter', elemDrag, x1, y1);
  fireMouseEvent('mouseover', elemDrag, x1, y1);
  fireMouseEvent('mousedown', elemDrag, x1, y1);
  fireMouseEvent('dragstart', elemDrag, x1, y1);
  fireMouseEvent('drag', elemDrag, x1, y1);
  fireMouseEvent('mousemove', elemDrag, x2, y2);
  fireMouseEvent('drag', elemDrag, x2, y2);
  fireMouseEvent('dragend', elemDrag, x2, y2);
  fireMouseEvent('mouseup', elemDrag, x2, y2);
};


function makeBackBtn(ctrls){
  var backBtn = document.createElement('div');
  backBtn.id = 'nf-rewind';

  var backBtnIcon = document.createElement('div');
  backBtnIcon.innerText = '<<';
  backBtn.appendChild(backBtnIcon);

  Object.assign(btn.style, {
    fontWeight: 'bold',
    fontSize: '4em',
    position: 'absolute',
    zIndex: 999,
    color: 'rgba(255, 255, 255, .3)',
    left: (-btn.offsetWidth) + 'px',
    transform: 'scaleX(.6)',
    cursor: 'pointer',
    display: 'flexbox',
    flexDirection: 'column',
    justifyContent: 'center',
    height: ctrlBar.offsetHeight + 'px'
  });

  return backBtn;
}

// TODO rerun when the URL contains /watch
waitFor('.player-controls-wrapper').then(wait.bind(null, 200)).then(function(){
  var ctrls = document.querySelector('.player-controls-wrapper');
  ctrls.style.position = 'relative';

  var backBtn = makeBackBtn();
  var attachBackBtn = ctrls.appendChild.bind(ctrls, backBtn);
  attachBackBtn();
  window.addEventListener('resize', positionBackBtn.bind(null, backBtn, ctrlBar));

  var observer = new MutationObserver(function(mutations){
     if (!document.querySelector('#nf-rewind')){
      attachBackBtn();
    }
  });

  observer.observe(document.body, {subtree: true, childList: true});

  var hideBtnTimeoutId;
  function showBtn () {
    backBtn.style.opacity = '1';
    clearTimeout(hideBtnTimeoutId);
    hideBtnTimeoutId = setTimeout(function(){
      backBtn.style.opacity = '0';
    }, 2000);
  }
  document.addEventListener('mousemove', showBtn);
  showBtn();

  backBtn.addEventListener('click', rewind);
  document

  function rewind(){
    var slider = document.querySelector('.player-slider');
    var timeLabel = slider.getElementsByTagName('label')[0];
    var timeComponents = timeLabel.innerText.split(':');

    var secondsRemaining = 0;
    if (timeComponents.length == 3) secondsRemaining += parseInt(timeComponents.shift()) * 3600;
    if (timeComponents.length == 2) secondsRemaining += parseInt(timeComponents.shift()) * 60;
    if (timeComponents.length == 1) secondsRemaining += parseInt(timeComponents.shift());

    var scrubberProgressEl = document.querySelector('.player-scrubber-progress-completed');
    var width = scrubberProgressEl.style.width;
    var percentComplete = percentToFloat(width);
    var totalSeconds = secondsRemaining / (1 - percentComplete);
    console.log(scrubberProgressEl, width, percentComplete, totalSeconds);
    var totalPx = document.querySelector('#scrubber-component').offsetWidth;
    var pxPer10s = totalPx / totalSeconds * 8;
    console.log('pxPer10s', pxPer10s);

    var scrubber = document.querySelector('.player-scrubber-target');
    dragTo(scrubber,
           (percentToFloat(scrubber.style.left) * totalPx) - pxPer10s + ctrlBar.offsetLeft, 0);
  })
});

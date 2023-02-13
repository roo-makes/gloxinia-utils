var maxOpacity = 100;
var minOpacity = 0;
var framesPerBeat = 30;
var curFrame = timeToFrames(time);

function opacityForFrame(min, max, fpb, frame) {
  var frac = (frame % fpb) / fpb;
  return Math.pow(1 - frac, 2) * (max - min) + min;
}

opacityForFrame(minOpacity, maxOpacity, framesPerBeat, curFrame);

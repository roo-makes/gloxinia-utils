// After Effects script to make it feel like a dancer is "hitting" their beats
// Speeds up as we approach a beat, then slows down right when the beat hits.
// Change "factor" to modify the intensity of the effect.
// Change "framesPerBeat" as needed (30 works for footage shot at 120bpm, 60fps)
// Use this on a time-remapping track.

var curFrame = timeToFrames(time);
var framesPerBeat = 30;
var factor = 1.2;

function customEase(t, start, end, factor) {
  var range = end - start;
  return Math.pow(t, factor) * range + start;
}

var start = Math.floor(curFrame / framesPerBeat) * framesPerBeat;
var end = start + framesPerBeat;
var t = (curFrame - start) / framesPerBeat;

var result = customEase(t, start, end, factor);

framesToTime(result);

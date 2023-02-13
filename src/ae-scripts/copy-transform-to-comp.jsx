// Copies transform values to inner comps. This is useful when lining up dancers
// in the _[dancer]-[scene]-[category]-test compositions.

function copyLayerTransformToInnerComp(layer) {
  var pos = layer.transform.position.value;
  var scale = layer.transform.scale.value;
  var rot = layer.transform.rotation.value;

  writeLn("source:" + layer.source.name);

  if (layer.source instanceof CompItem) {
    var innerComp = layer.source;
    var innerCompLayers = innerComp.layers;

    for (var i = 0; i < innerCompLayers.length; i++) {
      var innerLayer = innerComp.layer(i + 1);
      if (innerLayer.source instanceof CompItem) {
        writeLn("Found a layer: " + innerLayer.name);
        innerLayer.transform.position.setValue(pos);
        innerLayer.transform.scale.setValue(scale);
        innerLayer.transform.rotation.setValue(rot);
      }
    }

    layer.transform.position.setValue([
      innerComp.width / 2,
      innerComp.height / 2,
    ]);
    layer.transform.scale.setValue([100, 100]);
    layer.transform.rotation.setValue(0);
  }
}

function executeCopyTool() {
  clearOutput();
  // create undo group

  app.beginUndoGroup("Copy Transform to Inner Comp");

  // select the active item in the project window
  // and make sure it's a comp

  var myComp = app.project.activeItem;

  if (myComp instanceof CompItem) {
    var myLayers = myComp.selectedLayers;
    if (myLayers.length === 0) return;
    for (var i = 0; i < myLayers.length; i++) {
      copyLayerTransformToInnerComp(myLayers[i]);
    }
  } else {
    alert("please select a composition.");
  }
  app.endUndoGroup();
}

executeCopyTool();

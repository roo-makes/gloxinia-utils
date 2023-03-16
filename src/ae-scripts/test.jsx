function createUI(thisObj) {
  var myPanel = thisObj;
  myPanel.add("button", [10, 10, 100, 30], "Tool #1");
  return myPanel;
}
var myToolsPanel = createUI(this);

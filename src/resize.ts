function resize(canvas: HTMLCanvasElement) {
  var realToCSSPixels = window.devicePixelRatio

  var displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels),
    displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels)

  if (canvas.width != displayWidth ||
    canvas.height != displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

export default resize
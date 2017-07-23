const rad = deg => deg * 0.0174533

const fov = 700
const project = (point) => {
  const x = point[0] - ORIGIN[0]
  const y = point[1] - ORIGIN[1]
  const z = point[2] - ORIGIN[2]

  const scale = fov / (fov + z)
  const x2d = x * scale
  const y2d = y * scale
  return [
    x2d + ORIGIN[0],
    y2d + ORIGIN[1]
  ]
}

const two = new Two({
  type: Two.Types.canvas,
  autostart: true,
  fullscreen: true,
}).appendTo(document.body)

const ORIGIN = vec3.fromValues(two.width / 2, two.height / 2, 0)
const points = []
for (let y = 0; y < 20; y++) {
  for (let x = 0; x < 60; x++) {
    const point = vec3.fromValues(
      x * 10 + ORIGIN[0] / 2,
      y * 10 + ORIGIN[1] / 2,
      0
    )
    points.push(point)
  }
}

const animPoints = points.map(point => vec3.clone(point))
const circles = points.map(point => two.makeCircle(...project(point), 1, 1))

two.bind('update', frameCount => {
  circles.forEach((circle, index) => {
    const refPoint = points[index]
    const animPoint = animPoints[index]
    animPoint[2] = refPoint[2] + 100 * Math.sin(rad((refPoint[1] + refPoint[0] + frameCount) % 360))
    circle.translation.set(...project(animPoint))
  })
}).play()

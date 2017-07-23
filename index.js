const two = new Two({
  type: Two.Types.canvas,
  autostart: true,
  fullscreen: true,
}).appendTo(document.body)

const rad = deg => deg * 0.0174533

const ORIGIN = vec3.fromValues(two.width / 2, two.height / 2, 0)
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

const zBound = 20

const [cx, cy] = ORIGIN
const width = 400
const height = 400
const x1 = cx - width / 2,
      x2 = cx + width / 2,
      y1 = cy - height / 2,
      y2 = cy + height / 2

const numRows = 10
const numCols = 10
const xInc = (x2 - x1) / numCols
const yInc = (y2 - y1) / numRows
const points = []

for (let y = y1; y < y2; y += yInc) {
  for (let x = x1; x < x2; x += xInc) {
    const vec = vec3.fromValues(x, y, Math.random() * zBound)
    vec.direction = Math.random() > 0.5 ? 1 : -1
    points.push(vec)
  }
}

const drawSquares = points => {
  for (let i = 0; i < points.length; i++) {
    const tl = points[i]
    const tr = points[i + 1]
    const bl = points[i + numCols]
    const br = points[i + numCols + 1]

    const isLeftEdge = i % numCols === 0
    const isRightEdge = i % numCols === numCols - 1
    const isBottomEdge = i > (numCols * (numRows - 1)) - 1
    if (isLeftEdge) {
      // left edge — draw to point below
      if (bl) two.makeLine(...project(tl), ...project(bl))
    }

    if (!isRightEdge) {
      two.makeLine(...project(tl), ...project(tr))

      if (!isBottomEdge) {
        two.makeLine(...project(tr), ...project(br))
        two.makeLine(...project(br), ...project(bl))
      }
    }
  }
}

const animated = points.map(point => vec3.clone(point))
two.bind('update', frameCount => {
  two.clear()
  drawSquares(animated)
  points.forEach((point, index) => {
    if (Math.abs(point[2] - ORIGIN[2]) >= zBound) {
      point.direction *= -1
    }
    point[2] += (2 * point.direction * Math.sign(frameCount))
    const animatedPoint = animated[index]
    vec3.rotateX(animatedPoint, point, ORIGIN, rad((frameCount / 2) % 360))
  })
}).play()

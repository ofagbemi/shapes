const width = window.innerWidth
const height = window.innerHeight
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
svg.setAttribute('fill', 'none')
svg.setAttribute('stroke', 'black')
svg.setAttribute('xmlns', SVG_NAMESPACE)
svg.setAttribute('width', width)
svg.setAttribute('height', height)
document.body.appendChild(svg)


const rad = deg => deg * 0.0174533

const ORIGIN = vec3.fromValues(width / 2, height / 2, 0)

const fov = 700

function project(buffer, point) {
  const x = point[0] - ORIGIN[0]
  const y = point[1] - ORIGIN[1]
  const z = point[2] - ORIGIN[2]

  const scale = fov / (fov + z)
  const x2d = x * scale
  const y2d = y * scale
  buffer[0] = x2d + ORIGIN[0]
  buffer[1] = y2d + ORIGIN[1]
  return buffer
}

function getCirclePoint(buffer, radius, angle, origin = [0, 0, 0]) {
  buffer[0] = origin[0] + radius * Math.cos(rad(angle))
  buffer[1] = origin[1] + radius * Math.sin(rad(angle))
  buffer[2] = origin[2]
  return buffer
}

function getLeftAnchor(buffer, point, prev) {
  vec3.rotateZ(buffer, point, prev, rad(-90))
  return buffer
}

function getRightAnchor(buffer, point, prev) {
  vec3.rotateZ(buffer, prev, point, rad(90))
  return buffer
}

let frameCount = 0
const numPoints = 200

const radii = [
  {
    inner: 100,
    outer: 200,
    path: document.createElementNS(SVG_NAMESPACE, 'path'),
  },
  {
    inner: 200,
    outer: 400,
    path: document.createElementNS(SVG_NAMESPACE, 'path'),
  }
]

radii.forEach(({ path }) => {
  svg.appendChild(path)
})

const leftAnchorBuffer = vec3.create()
const rightAnchorBuffer = vec3.create()
const toProjectionBuffer = vec2.create()
const leftAnchorProjectionBuffer = vec2.create()
const rightAnchorProjectionBuffer = vec2.create()

function curve(from, to) {
  const leftAnchor = getLeftAnchor(leftAnchorBuffer, to, from)
  const rightAnchor = getRightAnchor(rightAnchorBuffer, to, from)

  const [p1, p2] = project(toProjectionBuffer, to)
  const [l1, l2] = project(leftAnchorProjectionBuffer, leftAnchor)
  const [r1, r2] = project(rightAnchorProjectionBuffer, rightAnchor)
  return `C ${l1} ${l2},
            ${r1} ${r2},
            ${p1} ${p2}`
}

const startPointBuffer = vec3.create()
const currPointBuffer = vec3.create()
const prevPointBuffer = vec3.create()

function step() {
  radii.forEach(({ inner, outer, path }) => {
    const innerRadius = inner - (100 * Math.sin(frameCount / 100)) / 5
    const outerRadius = outer + (100 * Math.sin(frameCount / 100)) / 5

    getCirclePoint(startPointBuffer, innerRadius, 0, ORIGIN)
    let d = `M ${startPointBuffer[0]} ${startPointBuffer[1]}`

    vec3.copy(prevPointBuffer, startPointBuffer)
    for (let i = 1; i < numPoints; i++) {
      getCirclePoint(
        currPointBuffer,
        i % 2 === 0 ? innerRadius : outerRadius,
        i / numPoints * 360,
        ORIGIN
      )
      currPointBuffer[2] = 100 * Math.sin(rad((currPointBuffer[1] + currPointBuffer[0] + frameCount) % 360))
      d = `${d} ${curve(prevPointBuffer, currPointBuffer)}`
      vec3.copy(prevPointBuffer, currPointBuffer)
    }
    d = `${d} ${curve(prevPointBuffer, startPointBuffer)}`
    path.setAttribute('d', d)
  })

  frameCount++
  window.requestAnimationFrame(step)
}

window.requestAnimationFrame(step)

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

const innerRadius = 100
const outerRadius = 200
const innerCircle = two.makeCircle(ORIGIN[0], ORIGIN[1], innerRadius)
const outerCircle = two.makeCircle(ORIGIN[0], ORIGIN[1], outerRadius)

innerCircle.stroke = 'black'
outerCircle.stroke = 'black'
innerCircle.fill = 'transparent'
outerCircle.fill = 'transparent'

const getCirclePoint = ({ angle, radius, origin }) => {
  return vec3.fromValues(
    origin[0] + radius * Math.cos(rad(angle)),
    origin[1] + radius * Math.sin(rad(angle)),
    origin[2]
  )
}

const drawTip = ({ startAngle, endAngle, innerRadius, outerRadius, origin }) => {
  const tipAngle = startAngle + (endAngle - startAngle) / 2
  const p1 = getCirclePoint({
    angle: startAngle,
    radius: innerRadius,
    origin: ORIGIN,
  })
  const p2 = getCirclePoint({
    angle: tipAngle,
    radius: outerRadius,
    origin: ORIGIN,
  })
  const p3 = getCirclePoint({
    angle: endAngle,
    radius: innerRadius,
    origin: ORIGIN,
  })

  vec3.rotateX(p1, p1, ORIGIN, rad(145))
  vec3.rotateX(p2, p2, ORIGIN, rad(145))
  vec3.rotateX(p3, p3, ORIGIN, rad(145))

  two.makeLine(
    ...project(p1),
    ...project(p2)
  )
  two.makeLine(
    ...project(p2),
    ...project(p3)
  )
}

const draw = radii => {
  two.bind('update', frameCount => {
    two.clear()
    radii.forEach((arg, index) => {
      const { min, max, currInner, currOuter, innerDir, outerDir } = arg
      if (currInner <= min) arg.innerDir = 1
      else if (currInner >= max) arg.innerDir = -1

      if (currOuter <= min) arg.outerDir = 1
      else if (currOuter >= max) arg.outerDir = -1

      arg.currOuter += outerDir
      arg.currInner += innerDir

      const numTips = 30
      const inc = 360 / numTips
      for (let i = 0; i < 360; i += inc) {
        drawTip({
          startAngle: i,
          endAngle: i + inc,
          innerRadius: currInner,
          outerRadius: currOuter,
          origin: ORIGIN,
        })
      }
    })
  })
}

const objs = []
for (let i = 0; i < 20; i++) {
  const min = 50 + i * 10
  const max = 60 + i * 10
  objs.push({
    min,
    max,
    currInner: min,
    currOuter: max,
    innerDir: 1,
    outerDir: -1,
  })
}
draw(objs)

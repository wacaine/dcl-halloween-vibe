// Coordinates of path to patrol
import { Animator, engine, Entity, GltfContainer, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const point1 = { x: 8, y: 0, z: 8 }
const point2 = { x: 8, y: 0, z: 24 }
const point3 = { x: 24, y: 0, z: 24 }
const point4 = { x: 24, y: 0, z: 8 }
const pathArray = [point1, point2, point3, point4]

// const TURN_TIME = 0.9

import { MoveTransformComponent } from './components/moveTransport'
import { gnarkStates, NPCData } from './components/NPC'
import { PathDataComponent } from './components/pathData'
import { TimeOutComponent } from './components/timeOut'
import { changeState, turn } from './systems/gnarkAI'
import { CONFIG } from './config'

export function createGnark(startingSegment: number = 1): Entity {
  const gnark = engine.addEntity()

  const detectSphere = engine.addEntity()
  const detectSphereDB = engine.addEntity()
  
  let target = startingSegment + 1
  if (target >= pathArray.length) {
    target = 0
  }

  Transform.create(gnark, {
    position: point1,
    rotation: Quaternion.fromLookAt(point1, pathArray[target])
  })

  const detectScale = CONFIG.GNARK_DETECT_DISTANCE*10
  Transform.create(detectSphere, {
    position: Vector3.create(0,.1,0),
    rotation: Quaternion.fromEulerDegrees(0,0,90),
    scale: Vector3.create(1,detectScale,detectScale),
    parent: gnark
  })

  Transform.create(detectSphereDB, {
    position: Vector3.create(0,.2,0),
    scale: Vector3.create(CONFIG.GNARK_DETECT_DISTANCE*2,.1,CONFIG.GNARK_DETECT_DISTANCE*2),
    parent: gnark
  })
  MeshRenderer.setSphere(detectSphereDB)

  GltfContainer.create(gnark, {
    src: 'assets/scene/Models/gnark.glb'
  })

  
  GltfContainer.create(detectSphere, {
    src: 'assets/scene/Models/scifi_energy_dot_red.glb'
  })

  Animator.create(gnark, {
    states: [
      {
        clip: 'walk',
        playing: true,
        loop: true,
        shouldReset: false
      },
      {
        clip: 'turnRight',
        playing: false,
        loop: false,
        shouldReset: true
      },
      {
        clip: 'raiseDead',
        playing: false,
        loop: true,
        shouldReset: true
      }
    ]
  })

  NPCData.create(gnark, {
    state: gnarkStates.WALKING,
    previousState: gnarkStates.WALKING
  })

  PathDataComponent.create(gnark, {
    path: pathArray,
    paused: false,
    origin: startingSegment,
    target: target
  })

  MoveTransformComponent.create(gnark, {
    start: pathArray[startingSegment],
    end: pathArray[target],
    normalizedTime: 0,
    lerpTime: 0,
    speed: 0.1,
    hasFinished: false,
    interpolationType: 0
  })

  TimeOutComponent.create(gnark, {
    timeLeft: 0.9,
    hasFinished: false,
    paused: false
  })

  // changeState(gnark, gnarkStates.TURNING)

  return gnark
}

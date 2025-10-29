import { AudioSource, AvatarAttach, engine, Entity, GltfContainer, Transform } from '@dcl/sdk/ecs'
import { Color3, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

// Generate deterministic positions for coins distributed across the scene
// Scene parcels are 2x2 (approx 32m x 32m). We'll place ~50 coins with
// heights between 1 and 6 meters. Use a simple seeded PRNG so results are stable.
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SCENE_SIZE = 32 // meters (2x2 parcels)
const PARCEL_BASE_X = 0 // assume origin at (0,0); adjust if needed
const PARCEL_BASE_Z = 0

function generateCoinPositions(count = 50, seed = 12345) {
  const rand = mulberry32(seed)
  const positions: Vector3[] = []

  for (let i = 0; i < count; i++) {
    // spread across the whole scene with a small margin so coins don't spawn on edges
    const margin = 0.5
    const x = PARCEL_BASE_X + margin + rand() * (SCENE_SIZE - 2 * margin)
    const z = PARCEL_BASE_Z + margin + rand() * (SCENE_SIZE - 2 * margin)
    const y = 1 + rand() * (4 - 1) // between 1 and 6 meters

    positions.push(Vector3.create(Number(x.toFixed(3)), Number(y.toFixed(3)), Number(z.toFixed(3))))
  }

  return positions
}

export const coinPositions = generateCoinPositions(50, 424242)


/**
 * Sound is a separated from the coin entity so that you can
 * still hear it even when the coin is removed from the engine.
 */
const coinPickupSound = engine.addEntity()
Transform.create(coinPickupSound)
AudioSource.create(coinPickupSound, { audioClipUrl: 'assets/scene/Audio/coinPickup.mp3' })

export function createCoin(model: string, position: Vector3, size: Vector3, centerOffset: Vector3): Entity {
  const entity = engine.addEntity()
  GltfContainer.create(entity, { src: model })
  Transform.create(entity, { position })

  utils.triggers.oneTimeTrigger(
    entity,
    utils.LAYER_1,
    utils.LAYER_1,
    [{ type: 'box' }],
    () => {
      Transform.getMutable(coinPickupSound).position = Transform.get(engine.PlayerEntity).position
      AudioSource.playSound(coinPickupSound, 'assets/scene/Audio/coinPickup.mp3')
      engine.removeEntity(entity)
    },
    Color3.Yellow()
  )

  return entity
}

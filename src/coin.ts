import { AudioSource, AvatarAttach, engine, Entity, GltfContainer, Transform } from '@dcl/sdk/ecs'
import { Color3, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

// Contains the positions for each coin
  export const coinPositions = [
    Vector3.create(2.2, 1.5, 2.2),
    Vector3.create(5.2, 1.5, 2.2),
    Vector3.create(8, 1.5, 2.2),
    Vector3.create(10.8, 1.5, 2.2),
    Vector3.create(13.8, 1.5, 2.2),
    Vector3.create(13.8, 2.18, 5),
    Vector3.create(13.8, 2.8, 8),
    Vector3.create(10.8, 2.8, 8),
    Vector3.create(8, 2.8, 8),
    Vector3.create(5.2, 2.8, 8),
    Vector3.create(2.2, 2.8, 8),
    Vector3.create(2.2, 3.4, 10.9),
    Vector3.create(2.2, 3.9, 13.8),
    Vector3.create(5.2, 3.9, 13.8),
    Vector3.create(8, 3.9, 13.8),
    Vector3.create(10.8, 3.9, 13.8),
    Vector3.create(13.8, 3.9, 13.8)
  ]


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

import { engine, GltfContainer, InputAction, PointerEvents, pointerEventsSystem, PointerEventType, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import "./polyfill/delcares";

import { createGnark } from './gnark'

import { distanceSystem, walkAround } from './systems/gnarkAI'
import { setupUi } from './ui'
import { initRegistery, REGISTRY } from './registry'
import { initGameState } from './state'
import { CONFIG, initConfig } from './config'
import { getAndSetUserDataIfNull } from './userData'
import { initDialogs } from './waitingDialog'
import { LobbyScene } from './lobby-scene/lobbyScene'
import { setupNPC } from './npcSetup'
import { onNpcRoomConnect } from './connection/onConnect'
import { Room } from 'colyseus.js'
import { initIdleStateChangedObservable, onIdleStateChangedObservableAdd } from './back-ports/onIdleStateChangedObservables'
import { coinPositions, createCoin } from './coin'

export function main() {
  const temple = engine.addEntity()

  Transform.create(temple, {
    position: Vector3.create(16, 0, 16),
    scale: Vector3.create(1.6, 1.6, 1.6)
  })

  GltfContainer.create(temple, {
    src: 'assets/scene/Models/Temple.glb'
  })

  initRegistery()
  initGameState()
  initConfig()

  getAndSetUserDataIfNull()
  
  initDialogs()

  REGISTRY.lobbyScene = new LobbyScene()

  setupNPC()


  REGISTRY.onConnectActions = (room: Room<any>, eventName: string) => {
    //npcConn.onNpcRoomConnect(room)
    onNpcRoomConnect(room)
  }
  initIdleStateChangedObservable() 
  onIdleStateChangedObservableAdd((isIdle:boolean)=>{
    if(isIdle){ 
      console.log("index.ts","onIdleStateChangedObservableAdd","player is idle")
    }else{
      console.log("index.ts","onIdleStateChangedObservableAdd","player is active")
    }
  })

  const gnark = createGnark(0)
  //createGnark(1)

  // Add clickable behavior to an entity
// PointerEvents.create(gnark, {
//   pointerEvents: [
//     { 
//       eventType: PointerEventType.PET_DOWN, 
//       eventInfo: { 
//         button: InputAction.IA_POINTER,
//         hoverText: 'Click me',
//         showFeedback: true,       // Show interaction feedback
//         maxDistance: 10           // Max interaction distance 
//       } 
//     }
//   ]
// })

// // Response to click events
// pointerEventsSystem.onPointerDown(
//   {entity: gnark,  opts:{ button: InputAction.IA_POINTER }} ,
//   (event) => {
//     console.log('Entity clicked!')
//     // Handle the click
//     if(!REGISTRY.activeNPC) REGISTRY.gnark.npcData?.npcData.onActivate(null)
//   }
// )


  // Setup the coins
  for (const coinPosition of coinPositions) {
    createCoin('assets/scene/Models/coin.glb', coinPosition, Vector3.create(1.5, 3, 1.5), Vector3.create(0, 1, 0))
  }

  // UI with GitHub link
  setupUi()


  engine.addSystem(walkAround)
  engine.addSystem(distanceSystem)


  utils.triggers.enableDebugDraw(CONFIG.DEBUG_ACTIVE_SCENE_TRIGGER_ENABLED)

}

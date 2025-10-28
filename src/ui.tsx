import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
//import { NpcUtilsUi } from 'dcl-npc-toolkit/dist/ui'
import { NpcUtilsUi  } from 'dcl-npc-toolkit/dist/ui'
import { customNpcUI } from './NPCs/customUi'
import * as ui from 'dcl-ui-toolkit'
import { setupNpcDialogUiScaling, uiDialogNpc } from './NPCs/customNpcUi_v2/npcDialogUi'
import { setupNpcCustomQuestionUiScaling, uiCustomAskNpc } from './NPCs/customNpcUi_v2/npcCustomUi'
import { setupCustomNPCUiScaling } from './NPCs/customUi'
import { PBUiCanvasInformation } from '@dcl/sdk/ecs'


let tieredModalScale = 1
let tieredFontScale = 1
let tieredModalTextWrapScale = 1

let devicePixelRatioScale: number = 1

export function updateUIScalingWithCanvasInfo(canvasInfo: PBUiCanvasInformation) {
  //higher res go bigger
  //threshhold???
  ///(1920/1080)/1.35 = 1.3
  ///(1920/1080)/1.1 = 1.6
  devicePixelRatioScale = 1920 / 1080 / canvasInfo.devicePixelRatio

  console.log('updateUIScalingWithCanvasInfo', canvasInfo, 'devicePixelRatioScale', devicePixelRatioScale)

  const PIXEL_RATIO_THREADHOLD = 1.2
  //at least for this side of the screen window checking dimensions seems better than ratio
  //const threshHoldHit = canvasInfo.width > 2300 && canvasInfo.height > 1300
  //const threshHoldHit = devicePixelRatioScale>PIXEL_RATIO_THREADHOLD

  //bigger and taller
  if (canvasInfo.width > 1920 && canvasInfo.height > 1080) {
    tieredModalScale = 2
    tieredFontScale = 2
    tieredModalTextWrapScale = 1.08
    /*}else if(canvasInfo.width < 2300 && canvasInfo.height > 1200){
    //gave up on this for now
    //very tall and skinny shift down
    tieredModalScale = 1.2
    tieredFontScale = 1.4
    tieredModalTextWrapScale = .8*/
  } else {
    //default is 1
    tieredModalScale = 1.1
    tieredFontScale = 1.1
    tieredModalTextWrapScale = 0.9
  }
  console.log(
    'updateUIScalingWithCanvasInfo',
    canvasInfo,
    'devicePixelRatioScale',
    devicePixelRatioScale,
    'tieredModalScale',
    tieredModalScale,
    'tieredFontScale',
    tieredFontScale,
    'tieredModalTextWrapScale',
    tieredModalTextWrapScale
  )
  const scale = canvasInfo.height / 1080
  setupCustomNPCUiScaling(scale, scale, scale)
  //setupBeamUiScaling(scale, scale, scale)
  //setupNPCUiScaling(scale, scale, scale)
  //setupBasketballUiScaling(scale, scale, scale)
  //setupEventDetailsUIScaling(scale, scale, scale)

  const scale2 = canvasInfo.height / 958
  setupNpcDialogUiScaling(scale2, scale2, scale2)
  setupNpcCustomQuestionUiScaling(scale2, scale2, scale2)

  //setupNPCUiScaling(scale2, scale2, scale2)
}

const uiComponent = () => [
  NpcUtilsUi(), //side effect sets up canvas scaling ui
  //uiBeamMeUp(),
  customNpcUI(),
  //uiBasketballPower(),
  //uiBasketballScore(),
  //uiOutOfBounds(),
  //uiEventDettails(),
  uiDialogNpc(),
  uiCustomAskNpc(),
  //uiSpawnCube()
  ui.render()
]
//const uiComponent = () => [NpcUtilsUi(), customNpcUI(), ui.render()]

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

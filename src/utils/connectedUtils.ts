import { Room } from "colyseus.js";

import * as clientState from "../connection/state/client-state-spec";
import * as serverStateSpec from "../connection/state/server-state-spec";
import { GAME_STATE } from "../state";
import * as utils from "@dcl-sdk/utils";

import { closeDialog } from "dcl-npc-toolkit/dist/dialog";
import { closeCustomUI } from "../NPCs/customUi";
import { REGISTRY } from "../registry";
import { RemoteNpc, endInteraction, hideThinking, startThinking } from "../remoteNpc";
import * as ui from 'dcl-ui-toolkit';
import { Color4 } from "@dcl/sdk/math";
import { ChatPart, streamedMsgs } from "../streamedMsgs";
import { streamedMsgsUiControl } from "../streamedMsgsUIcontrol";

const FILE_NAME = "connectedUtils.ts"

/**
 * NOTE endInteraction results in player going into STANDING state, need way to resume last action
 * @param ignore 
 */
export function closeAllInteractions(opts?: { exclude?: RemoteNpc, resumeLastActivity?: boolean }) {
  for (const npc of REGISTRY.allNPCs) {
    if (opts?.exclude === undefined || npc != opts.exclude) {
      console.log("closeAllInteractions ", npc.name)
      endInteraction(npc)

      //if(REGISTRY.activeNPCSound.get())
      //p.dialog.closeDialogWindow()
    } else {
      //just close the dialog
      closeDialog(npc.entity)
    }
  }
}

const CLASSNAME = "connectedUtils.js"
export function sendMsgToAI(msg: serverStateSpec.ChatMessage) {
  const METHOD_NAME = "sendMsgToAI"
  console.log(FILE_NAME, METHOD_NAME, "ENTRY", msg)

  if (msg === undefined || msg.text.text.trim().length === 0) {
    ui.createComponent(ui.Announcement, { value: "cannot send empty message", duration: 8, size: 60, color: Color4.White() })
    return
  }
  console.log(FILE_NAME, METHOD_NAME, "Message to Send", msg)
  //hide input
  closeCustomUI(false)
  //mark waiting for reply
  startThinking(REGISTRY.activeNPC, [REGISTRY.askWaitingForResponse])
  //wrap it in object
  prd: "https://app-xzmvuighmq-uc.a.run.app/npc/chat"

  const url = "https://app-xzmvuighmq-uc.a.run.app/npc/chat?npcId=test6&message="+
  //const url = "http://127.0.0.1:5001/ai-npcs/us-central1/app/npc-chat?npcId=test6&message="+
    encodeURIComponent( msg.text.text )
    +"&threadId="+encodeURIComponent(GAME_STATE.playerState.dclUserData.userId)+"&format=advancedv1";

  fetch(url, {
    method: "GET",
    //headers: this.requestHeaders, //pretty sure Record<string,string> == { [index: string]: string }
    //body: data,
    //timeout: this.timeout
  }).then(async (val: Response) => {
    console.log(CLASSNAME, METHOD_NAME, "PROMISE.ENTRY", val)

    console.log(CLASSNAME, METHOD_NAME, "PROMISE.RESULT", "this.status", val.status)

    //this.status = val.status
    //this.statusText = val.statusText
    if(val.status == 200){
      const response = await val.json()

      handleResponse( response.data as serverStateSpec.ChatPacket[] )
    }
    
    //must turn this into raw version

    // this.responseHeadersRaw = ""
    // val.headers.forEach((value: string, key: string) => {
    //   this.responseHeadersRaw += key + ": " + value + "\r\n"
    // })
      //, "this.responseHeadersRaw"
      //, this.responseHeadersRaw
    //)
    //if (this.onload) this.onload()


  }).catch((reason: any) => {
    console.log(CLASSNAME, METHOD_NAME, "Catch.ENTRY")

    //colysesus wanted this 'err.timeout = err.type == 'timeout';'
    //20 == abort, 23 == timeout
    //if (reason.code && (reason.code == 20 || reason.code == 23)) reason.type = 'timeout'

    //if (this.onerror) this.onerror(reason)
  })
  //if (GAME_STATE.gameRoom) GAME_STATE.gameRoom.send("message", msg)
  //TODO DO SEND and register response handler
}

let lastInteractionId = ""

function handleResponse(msgs: serverStateSpec.ChatPacket[]){
  for(const msg of msgs){
    let newInteraction = false
    newInteraction = lastInteractionId !== msg.packetId.interactionId
    lastInteractionId = msg.packetId.interactionId

    const chatPart = new ChatPart(msg)
    streamedMsgs.add(chatPart)
 
    console.log("onMessage", "hideThinking");
    if (REGISTRY.activeNPC) hideThinking(REGISTRY.activeNPC)

    //TODO find better way to detect reset like when last stream msg was at last?
    if (REGISTRY.activeNPC && (streamedMsgs.started == false || streamedMsgs.waitingForMore) && streamedMsgs.hasNextAudioNText()) {
      console.log("structuredMsg", "createDialog", "chatPart.onmsg", "check:", streamedMsgs.started, "waitingForMore:", streamedMsgs.waitingForMore, "hasNextAudioNText", streamedMsgs.hasNextAudioNText())
      console.log("structuredMsg", "createDialog", "chatPart.start", chatPart)
      const nextPart = streamedMsgs.next()
      console.log("structuredMsg check", streamedMsgs.interactionIndex, streamedMsgs.lastUtteranceId, streamedMsgs.streamedMessagesMapById)
      
      streamedMsgs.started = true
      streamedMsgs.waitingForMore = false
      
      utils.timers.setTimeout(() => {
        //MAKES DIALOG VISIBLE
        streamedMsgsUiControl.start()
        streamedMsgsUiControl.showNextText(nextPart)
      }, 500)
    //   const dialog = createDialog(nextPart)
    //   let hasEmotion = nextPart.emotion ? true : false
    //   console.log("Emotions", "Do we have emotions?", hasEmotion, ":", nextPart);

    //   let emotion = getNpcEmotion(nextPart.emotion)

    //   if (hasEmotion) {
    //     //TODO TAG:play-emotion 
    //     console.log("Emotions", "DisplayEmotion", nextPart.emotion.packet.emotions.behavior, "=>", emotion);
    //     if (CONFIG.EMOTION_DEBUG) ui.createComponent(ui.Announcement, { value: "got emotion 318-\n" + JSON.stringify(nextPart.emotion.packet.emotions), duration: 5, size: 60, color: Color4.White() }).show(5)
    //   }

    //   if (dialog) {
    //     if (hasEmotion && emotion.portraitPath) dialog.portrait = { path: emotion.portraitPath }
    //     console.log('Emotions', 'Portrait:', dialog.portrait);

    //     console.log("onMessage.structuredMsg", "npc talk", dialog);
    //     // talk(REGISTRY.activeNPC.entity, [dialog]);
    //     console.log("Emotions", "Dialog", dialog);

    //     console.log('Emotions', 'Animation', dialog.name);
    //     if (hasEmotion && emotion.name) playAnimation(REGISTRY.activeNPC.entity, emotion.name, true, emotion.duration)
    //   } else {
    //     console.log("structuredMsg", "createDialog", "no dialog to show,probably just a control msg", dialog, "chatPart", chatPart, "nextPart", nextPart)
    //   }
      
    //   if (true) {//if(npcDialog.length ==1){
    //     if (nextPart.audio && nextPart.audio.packet.audio.chunk) {
    //       console.log("onMessage.structuredMsg.audio", msg);
    //       convertAndPlayAudio(nextPart.audio.packet)
    //       //npcDialogAudioPacket.push( msg ) 
    //     }
    //   }
    } else {
      console.log("structuredMsg", "createDialog", "chatPart.onmsg", "started:", streamedMsgs.started, "waitingForMore:", streamedMsgs.waitingForMore, "hasNextAudioNText", streamedMsgs.hasNextAudioNText())
    }
    // 

    console.log("onMessage.structuredMsg. streamedMsgs.streamedInteractions", streamedMsgs.streamedInteractions);
  }

}

let lastCharacterId: serverStateSpec.CharacterId = undefined

export function createMessageObject(msgText: string, characterId: serverStateSpec.CharacterId, room: Room<clientState.NpcGameRoomState>) {
  //TODO change to new format
  const chatMessage: serverStateSpec.ChatMessage = new serverStateSpec.ChatMessage({
    date: new Date().toUTCString(),
    packetId: { interactionId: "", packetId: "", utteranceId: "" },
    type: serverStateSpec.ChatPacketType.TEXT,
    text: { text: msgText, final: true },
    routing:
    {
      //source: { isCharacter: false, isPlayer: true, name: room.sessionId, xId: { resourceName: room.sessionId } }
      source: { isCharacter: false, isPlayer: true, name: GAME_STATE.playerState.dclUserData.userId, xId: { resourceName: GAME_STATE.playerState.dclUserData.userId } }
      , target: { isCharacter: true, isPlayer: false, name: "", xId: characterId ? characterId : lastCharacterId }
    },
  })
  if (!characterId) {
    console.log("createMessageObject using lastCharacterId", lastCharacterId)
  }
  if (characterId) lastCharacterId = characterId
  return chatMessage
}



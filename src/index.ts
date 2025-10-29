import { Vector3, Quaternion } from '@dcl/sdk/math'
import { engine, Transform, Entity, CameraMode } from '@dcl/sdk/ecs'

// Entity IDs from the scene
const VIDEO_SCREEN_ENTITY = 512 as Entity
const MEWSCREEN_ENTITY = 521 as Entity

// Counter to limit debug logging
let frameCounter = 0

export function main() {
  // System to make video screen and mewscreen face the player
  engine.addSystem(facePlayerSystem)
}

function facePlayerSystem() {
  frameCounter++
  
  // Try to get player position from camera
  let playerPosition: Vector3
  
  // First try engine.PlayerEntity
  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (playerTransform) {
    playerPosition = playerTransform.position
  } else {
    // Fallback: try to get camera position
    const cameraTransform = Transform.getOrNull(engine.CameraEntity)
    if (cameraTransform) {
      playerPosition = cameraTransform.position
    } else {
      if (frameCounter % 60 === 0) {
        console.log('Neither player nor camera entity found!')
      }
      return
    }
  }

  // Rotate Video Screen
  rotateEntityToFacePlayer(VIDEO_SCREEN_ENTITY, playerPosition, 'Video Screen')
  
  // Rotate Mewscreen
  rotateEntityToFacePlayer(MEWSCREEN_ENTITY, playerPosition, 'Mewscreen')
}

function rotateEntityToFacePlayer(entityId: Entity, playerPosition: Vector3, entityName: string) {
  // Get the entity transform
  const entityTransform = Transform.getMutableOrNull(entityId)
  if (!entityTransform) {
    if (frameCounter % 60 === 0) {
      console.log(`${entityName} entity not found!`)
    }
    return
  }

  // Calculate direction from entity to player
  const entityPosition = entityTransform.position
  
  // Calculate the direction vector
  const direction = Vector3.subtract(playerPosition, entityPosition)
  
  // For a plane mesh, we need to calculate the Y rotation to face the player
  // The plane faces forward (positive Z) by default
  const angle = Math.atan2(direction.x, direction.z)
  
  // Create quaternion rotation around Y axis
  const rotation = Quaternion.fromEulerDegrees(0, angle * 180 / Math.PI, 0)
  
  // Debug logging every 60 frames
  if (frameCounter % 60 === 0) {
    console.log(`=== ${entityName} Rotation Debug ===`)
    console.log('Entity position:', entityPosition)
    console.log('Player position:', playerPosition)
    console.log('Direction vector:', direction)
    console.log('Angle (radians):', angle)
    console.log('Angle (degrees):', angle * 180 / Math.PI)
    console.log('Rotation quaternion:', rotation)
    console.log('Current entity rotation:', entityTransform.rotation)
  }
  
  // Apply the rotation to the entity
  entityTransform.rotation = rotation
  
  if (frameCounter % 60 === 0) {
    console.log(`Applied rotation to ${entityName}:`, entityTransform.rotation)
  }
}

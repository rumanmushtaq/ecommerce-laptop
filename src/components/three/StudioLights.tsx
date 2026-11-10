import { Environment, Lightformer } from '@react-three/drei'

/** Procedural studio environment: softboxes + coloured rims, no HDR download.
 *  `mood` tints the rim lights so a scene can lean warm (brand) or neon (gaming). */
export function StudioLights({ mood = 'brand' }: { mood?: 'brand' | 'neon' | 'neutral' }) {
  const rimA = mood === 'neon' ? '#ff7ab6' : mood === 'brand' ? '#b9a6ff' : '#ffffff'
  const rimB = mood === 'neon' ? '#8f7bff' : mood === 'brand' ? '#9ee6cf' : '#dfe6ff'
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 4]} intensity={1.2} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#0b0b0d']} />
        {/* Key softbox overhead */}
        <Lightformer form="rect" intensity={3} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
        {/* Long strip reflections that run along the aluminium */}
        <Lightformer form="rect" intensity={2} position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[10, 0.6, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[10, 0.4, 1]} />
        <Lightformer form="rect" intensity={0.5} position={[0, 1, 6]} scale={[6, 1.5, 1]} />
        {/* Big backdrop softbox: what the top deck and keys reflect from a front/above camera */}
        <Lightformer form="rect" intensity={1.15} position={[0, 3, -6]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[0, -2, -6]} scale={[14, 2, 1]} />
        {/* Coloured rims */}
        <Lightformer form="ring" color={rimA} intensity={mood === 'neutral' ? 1 : 5} position={[-4, 1, -4]} scale={2.5} />
        <Lightformer form="ring" color={rimB} intensity={mood === 'neutral' ? 1 : 4} position={[5, 2, -3]} scale={2.5} />
      </Environment>
    </>
  )
}

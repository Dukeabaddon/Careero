import { describe, expect, it } from 'vitest'
import { listArchetypeAssetKeys, resolveArchetype } from '../../src/features/results/utils/archetypeTheme.js'

describe('archetype theme assets', () => {
  it('loads all six archetype webp files from src/assets/riasec', () => {
    const keys = listArchetypeAssetKeys()
    expect(keys.length).toBe(6)
    expect(keys.some((path) => path.includes('archetype_builder.webp'))).toBe(true)
    expect(keys.some((path) => path.includes('archetype_creator.webp'))).toBe(true)
    expect(keys.some((path) => path.includes('archetype_guardian.webp'))).toBe(true)
    expect(keys.some((path) => path.includes('archetype_pathfinder.webp'))).toBe(true)
    expect(keys.some((path) => path.includes('archetype_strategist.webp'))).toBe(true)
    expect(keys.some((path) => path.includes('archetype_visionary.webp'))).toBe(true)
  })

  it('resolves builder artwork for CS profile codes', () => {
    const archetype = resolveArchetype('CS')
    expect(archetype.asset).toBe('builder')
    expect(archetype.titleKey).toBe('results.archetypes.builder')
    expect(archetype.image).toBeTruthy()
    expect(String(archetype.image)).toContain('archetype_builder')
  })

  it('resolves analyst artwork for IC profile codes', () => {
    const archetype = resolveArchetype('IC')
    expect(archetype.asset).toBe('visionary')
    expect(archetype.titleKey).toBe('results.archetypes.analyst')
    expect(archetype.image).toBeTruthy()
  })
})

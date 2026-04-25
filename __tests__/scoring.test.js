'use strict'

const { calcularPuntaje } = require('../services/scoring')

const bet = (local, visitante) => ({ goles_local: local, goles_visitante: visitante })
const res = (local, visitante) => ({ resultado_local: local, resultado_visitante: visitante })

describe('calcularPuntaje', () => {
  it('0 pts — se equivocó el ganador', () => {
    expect(calcularPuntaje(bet(1, 0), res(0, 1)).puntos).toBe(0)
    expect(calcularPuntaje(bet(0, 2), res(2, 0)).puntos).toBe(0)
  })

  it('0 pts — apostó empate pero ganó un equipo', () => {
    expect(calcularPuntaje(bet(0, 0), res(1, 0)).puntos).toBe(0)
    expect(calcularPuntaje(bet(1, 0), res(0, 0)).puntos).toBe(0)
  })

  it('1 pt — ganó correcto, ningún gol exacto', () => {
    const r = calcularPuntaje(bet(3, 1), res(1, 0))
    expect(r.puntos).toBe(1)
    expect(r.bonus).toBe(false)
    expect(r.detalle.exactos_count).toBe(0)
  })

  it('1 pt — empate correcto, marcador diferente', () => {
    expect(calcularPuntaje(bet(0, 0), res(1, 1)).puntos).toBe(1)
  })

  it('2 pts — local exacto, visitante incorrecto', () => {
    const r = calcularPuntaje(bet(2, 1), res(2, 0))
    expect(r.puntos).toBe(2)
    expect(r.detalle.acerto_exacto_local).toBe(true)
    expect(r.detalle.acerto_exacto_visitante).toBe(false)
  })

  it('2 pts — visitante exacto, local incorrecto', () => {
    const r = calcularPuntaje(bet(2, 0), res(1, 0))
    expect(r.puntos).toBe(2)
    expect(r.detalle.acerto_exacto_visitante).toBe(true)
  })

  it('3 pts — exacto 1-0 sin bonus', () => {
    expect(calcularPuntaje(bet(1, 0), res(1, 0)).puntos).toBe(3)
    expect(calcularPuntaje(bet(1, 0), res(1, 0)).bonus).toBe(false)
  })

  it('3 pts — exacto empate 1-1', () => {
    expect(calcularPuntaje(bet(1, 1), res(1, 1)).puntos).toBe(3)
  })

  it('3 pts — exacto 0-0 sin bonus', () => {
    const r = calcularPuntaje(bet(0, 0), res(0, 0))
    expect(r.puntos).toBe(3)
    expect(r.bonus).toBe(false)
  })

  it('4 pts — exacto 3-1 (4 goles, bonus)', () => {
    const r = calcularPuntaje(bet(3, 1), res(3, 1))
    expect(r.puntos).toBe(4)
    expect(r.bonus).toBe(true)
  })

  it('4 pts — exacto 2-2 (4 goles, bonus)', () => {
    const r = calcularPuntaje(bet(2, 2), res(2, 2))
    expect(r.puntos).toBe(4)
    expect(r.bonus).toBe(true)
  })

  it('4 pts — exacto 3-2 (5 goles, bonus)', () => {
    expect(calcularPuntaje(bet(3, 2), res(3, 2)).puntos).toBe(4)
  })

  it('detalle incluye todas las claves', () => {
    const r = calcularPuntaje(bet(1, 0), res(1, 0))
    expect(r.detalle).toMatchObject({
      acerto_global: true,
      acerto_exacto_local: true,
      acerto_exacto_visitante: true,
      exactos_count: 2,
      total_goles: 1,
    })
  })
})

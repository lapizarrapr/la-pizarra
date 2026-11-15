import * as migration_20261115_150700_inicial from './20261115_150700_inicial'

export const migrations = [
  {
    up: migration_20261115_150700_inicial.up,
    down: migration_20261115_150700_inicial.down,
    name: '20261115_150700_inicial',
  },
]

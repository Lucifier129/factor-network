import * as network from './network'
import createBackPropagation from './createBackPropagation'
import createEvolution from './createEvolution'
import MCM from './MCM'
import MCTS from './MCTS'
import UCT from './UCT'

export default {
  network: network,
  createBackPropagation: createBackPropagation,
  createEvolution: createEvolution,
  MCM: MCM,
  MCTS: MCTS,
  UCT: UCT
}

import {
  createGame,
  createBoardClasses,
  Player,
  Board,
  Do,
} from '@boardzilla/core';

export class IssueReproPlayer extends Player<IssueReproPlayer, IssueReproBoard> {
  /**
   * Any properties of your players that are specific to your game go here
   */
  score: number = 0;
};

class IssueReproBoard extends Board<IssueReproPlayer, IssueReproBoard> {
  /**
   * Any overall properties of your game go here
   */
  phase: number = 1;
}

const { Space, Piece } = createBoardClasses<IssueReproPlayer, IssueReproBoard>();

export { Space };

/**
 * Define your game's custom pieces and spaces.
 */
export class Token extends Piece {
  color: 'red' | 'blue';
}

export default createGame(IssueReproPlayer, IssueReproBoard, game => {

  const { board, action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  /**
   * Register all custom pieces and spaces
   */
  board.registerClasses(Token);

  /**
   * Create your game board's layout and all included pieces.
   */
  for (const player of game.players) {
    const mat = board.create(Space, 'mat', { player });
    mat.onEnter(Token, t => t.showToAll());
  }

  board.create(Space, 'pool');
  $.pool.onEnter(Token, t => t.hideFromAll());
  $.pool.createMany(game.setting('tokens') - 1, Token, 'blue', { color: 'blue' });
  $.pool.create(Token, 'red', { color: 'red' });

  /**
   * Define all possible game actions.
   */
  game.defineActions({
    pass: (player) =>
      action({
        prompt: 'Pass the turn',
      })
      // .chooseNumber("num", { min: 1, max: 10 })
      .do(() => {
        game.message('{{player}} passed.', { player });
      }),
  });

  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns.
   */
  game.defineFlow(
    () => {
      $.pool.shuffle();
      game.message('Game has started!');
    },
    eachPlayer({
      name: "player",
      do: playerActions({
        actions: ['pass'],
        skipIf: "never"
      }),
    })
  );
});

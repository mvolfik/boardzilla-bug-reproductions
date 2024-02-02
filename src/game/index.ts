import {
  createGame,
  createBoardClasses,
  Player,
  Board,
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
  const { playerActions, loop, eachPlayer, everyPlayer } = game.flowCommands;

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

    const pool = board.create(Space, 'pool', { player });
    pool.onEnter(Token, t => t.hideFromAll());

    pool.createMany(game.setting('tokens') - 1, Token, 'blue', { color: 'blue' });
    pool.create(Token, 'red', { color: 'red' });
  }


  /**
   * Define all possible game actions.
   */
  game.defineActions({
    take: player => action({
      prompt: 'Choose a token',
    }).chooseOnBoard(
      'token', player.my("pool")!.all(Token),
    ).move(
      'token', player.my('mat')!
    ).message(
      `{{player}} drew a {{token}} token.`
    ).do(({ token }) => {
      if (token.color === 'red') {
        game.message("{{player}} wins!", { player });
        game.finish(player);
      }
    }),
  });

  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns.
   */
  game.defineFlow(
    () => $.pool.shuffle(),
    loop(
      everyPlayer({
        name: 'player',
        do: playerActions({
          actions: ['take']
        }),
      })
    )
  );
});

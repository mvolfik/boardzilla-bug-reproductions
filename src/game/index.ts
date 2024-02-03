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

const { Space, Piece, Die } = createBoardClasses<IssueReproPlayer, IssueReproBoard>();

export { Space };

const COLORS = ['red', 'blue', 'green'] as const;
type Color = typeof COLORS[number];

/**
 * Define your game's custom pieces and spaces.
 */
export class Token extends Piece {
  color: Color;

  toString(): string {
    return `${this.color} token`;
  }
}

export default createGame(IssueReproPlayer, IssueReproBoard, game => {

  const { board, action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  /**
   * Register all custom pieces and spaces
   */
  board.registerClasses(Token);

  board.create(Space, "filler");

  /**
   * Create your game board's layout and all included pieces.
   */
  for (const player of game.players) {
    const hand = board.create(Space, 'hand', { player });
    hand.onEnter(Token, t => t.showOnlyTo(player));
  }

  board.create(Space, 'pool');
  $.pool.onEnter(Token, t => t.showToAll());

  for (const color of COLORS) {
    $.pool.createMany(20, Token, color, { color });
  }

  /**
   * Define all possible game actions.
   */
  game.defineActions({
    take: (player) =>
      action({
        prompt: 'Take a token',
      })
        .chooseOnBoard('token', $.pool.all(Token), { confirm: 'Yes', prompt: 'Take this token?' })
        .move('token', player.my('hand')!)
        .message('{{player}} took a {{token}}.'),
    discard: (player) =>
      action({
        prompt: 'Discard a token',
      })
        .chooseOnBoard('token', player.my('hand')!.all(Token), { confirm: 'Yes', prompt: 'Discard this token?' })
        .move('token', $.pool)
        .message('{{player}} discarded a {{token}}.'),
    endTurn: (player) =>
      action({ prompt: 'End turn' }).do(() => {
        return Do.break();
      }),
  });

  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns.
   */
  game.defineFlow(
    () => {
      game.message('The game has started!');
    },
    loop(
      () => {
        game.message("Starting a new round");
      },
      // behavior that I would expect:
      // the loop() will allow player to take or discard as many tokens as they want,
      // and when they click end turn, the loop() will end, and next player (from the eachPlayer() loop)
      // will take their turn, eventually, if this was the last player, a new round will start
      eachPlayer({
        name: 'player',
        do: loop(
          playerActions({
            actions: ['take', 'discard', 'endTurn'],
            prompt: 'Take or discard token',
          })
        )
      })
    )
  );
});

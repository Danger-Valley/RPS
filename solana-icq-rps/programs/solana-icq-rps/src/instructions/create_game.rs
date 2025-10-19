use anchor_lang::prelude::*;

use crate::{clear_board, errors::ErrorCode, events::GameCreated, Game, Phase, Registry};

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        seeds = [b"registry"],
        bump,
        payer = payer,
        space = 8 + Game::INIT_SPACE,
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        init,
        seeds = [b"game", registry.key().as_ref(), &registry.next_game_id.to_le_bytes()],
        bump,
        payer = payer,
        space = Game::SIZE,
    )]
    pub game: Account<'info, Game>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_game(ctx: Context<CreateGame>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    let game = &mut ctx.accounts.game;
    let payer = &ctx.accounts.payer;

    // Assign a new id and bump the registry counter
    game.id = registry.next_game_id;
    registry.next_game_id = registry
        .next_game_id
        .checked_add(1)
        .ok_or(ErrorCode::Overflow)?;

    game.player0 = payer.key();
    game.player1 = Pubkey::default();
    game.winner = None;
    game.phase = Phase::Created as u8;
    game.is_player1_turn = false;
    clear_board(game);

    emit!(GameCreated {
        game_id: game.id,
        creator: payer.key()
    });
    Ok(())
}

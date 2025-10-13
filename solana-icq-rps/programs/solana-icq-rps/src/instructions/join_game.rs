use crate::events::GameJoined;
use crate::{errors::ErrorCode, Game, Phase};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut, seeds=[b"game", registry.key().as_ref(), &game.id.to_le_bytes()], bump)]
    pub game: Account<'info, Game>,
    /// CHECK
    #[account(seeds=[b"registry"], bump)]
    pub registry: UncheckedAccount<'info>,
    pub joiner: Signer<'info>,
}

pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let joiner = ctx.accounts.joiner.key();

    require!(game.phase() == Phase::Created, ErrorCode::BadPhase);
    require!(game.player0 != joiner, ErrorCode::NotAllowedJoinGame);
    require!(
        game.player1 == Pubkey::default(),
        ErrorCode::NotAllowedJoinGame
    );

    game.player1 = joiner;
    game.phase = Phase::Joined as u8;

    emit!(GameJoined {
        game_id: game.id,
        participant: joiner
    });
    Ok(())
}

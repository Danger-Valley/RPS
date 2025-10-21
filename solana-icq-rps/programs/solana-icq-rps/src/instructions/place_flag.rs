use crate::errors::ErrorCode;
use crate::events::FlagPlaced;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PlaceFlag<'info> {
    #[account(
        mut,
        seeds = [b"game", registry.key().as_ref(), &game.id.to_le_bytes()],
        bump
    )]
    pub game: Account<'info, Game>,
    /// CHECK: seed-only PDA
    #[account(seeds=[b"registry"], bump)]
    pub registry: UncheckedAccount<'info>,
    pub signer: Signer<'info>,
}

pub fn place_flag(ctx: Context<PlaceFlag>, flag_idx: u8) -> Result<()> {
    do_place_flag(&mut ctx.accounts.game, &ctx.accounts.signer, flag_idx)
}

#[derive(Accounts)]
pub struct PlaceFlagXy<'info> {
    pub inner: PlaceFlag<'info>,
}

pub fn place_flag_xy(ctx: Context<PlaceFlagXy>, x: u8, y: u8) -> Result<()> {
    require!(x < WIDTH && y < HEIGHT, ErrorCode::BadCell);
    let idx = y * WIDTH + x;
    do_place_flag(
        &mut ctx.accounts.inner.game,
        &ctx.accounts.inner.signer,
        idx,
    )
}

// -------- core logic (без Context::new) --------

fn do_place_flag(g: &mut Game, signer: &Signer, flag_idx: u8) -> Result<()> {
    require!(
        matches!(
            g.phase(),
            Phase::Joined | Phase::FlagP0Placed | Phase::FlagP1Placed
        ),
        ErrorCode::BadPhase
    );
    validate_cell(flag_idx)?;
    let i = flag_idx as usize;
    require!(
        g.board_cells_owner[i] == BoardCellOwner::None as u8
            && g.board_pieces[i] == Piece::Empty as u8,
        ErrorCode::CellTaken
    );

    let s = signer.key();
    if s == g.player0 {
        require!(is_p0_spawn(flag_idx), ErrorCode::Player0BadRow);
        require!(g.flag_pos0 == NOT_SET, ErrorCode::Player0FlagAlreadyPlaced);
        g.board_cells_owner[i] = BoardCellOwner::P0 as u8;
        g.board_pieces[i] = Piece::Flag as u8;
        g.flag_pos0 = flag_idx;
        g.live_player0 = g.live_player0.saturating_add(1);
        g.phase = if g.phase() == Phase::FlagP1Placed {
            Phase::FlagsPlaced as u8
        } else {
            Phase::FlagP0Placed as u8
        };
    } else if s == g.player1 {
        require!(is_p1_spawn(flag_idx), ErrorCode::Player1BadRow);
        require!(g.flag_pos1 == NOT_SET, ErrorCode::Player1FlagAlreadyPlaced);
        g.board_cells_owner[i] = BoardCellOwner::P1 as u8;
        g.board_pieces[i] = Piece::Flag as u8;
        g.flag_pos1 = flag_idx;
        g.live_player1 = g.live_player1.saturating_add(1);
        g.phase = if g.phase() == Phase::FlagP0Placed {
            Phase::FlagsPlaced as u8
        } else {
            Phase::FlagP1Placed as u8
        };
    } else {
        return err!(ErrorCode::NotParticipant);
    }

    emit!(FlagPlaced {
        id: g.id,
        player: s,
        idx: flag_idx
    });
    Ok(())
}

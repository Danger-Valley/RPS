use anchor_lang::prelude::*;

use crate::{BoardCellOwner, Choice, Phase, Piece};

pub const WIDTH: u8 = 7;
pub const HEIGHT: u8 = 6;
pub const CELLS: usize = (WIDTH * HEIGHT) as usize;

#[account]
pub struct Registry {
    pub next_game_id: u32,
}

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub id: u32,
    pub player0: Pubkey,
    pub player1: Pubkey,
    pub winner: Option<Pubkey>,
    pub phase: u8,
    pub is_player1_turn: bool,

    pub board_cells_owner: [u8; CELLS],
    pub board_pieces: [u8; CELLS],

    pub live_player0: u16,
    pub live_player1: u16,

    pub flag_pos0: u8,
    pub flag_pos1: u8,

    // tie state
    pub tie_pending: bool,
    pub tie_from: u8,
    pub tie_to: u8,
    pub choice_made0: bool,
    pub choice_made1: bool,
    pub choice0: u8,
    pub choice1: u8,
}

impl Game {
    pub fn phase(&self) -> Phase {
        Phase::from(self.phase)
    }
}

pub fn clear_board(g: &mut Game) {
    g.board_cells_owner = [BoardCellOwner::None as u8; CELLS];
    g.board_pieces = [Piece::Empty as u8; CELLS];
    g.live_player0 = 0;
    g.live_player1 = 0;
    g.flag_pos0 = 255;
    g.flag_pos1 = 255;
    g.tie_pending = false;
    g.tie_from = 0;
    g.tie_to = 0;
    g.choice_made0 = false;
    g.choice_made1 = false;
    g.choice0 = Choice::None as u8;
    g.choice1 = Choice::None as u8;
}

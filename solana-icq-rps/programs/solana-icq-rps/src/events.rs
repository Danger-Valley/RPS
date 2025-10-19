use crate::{Choice, Piece};
use anchor_lang::prelude::*;

#[event]
pub struct GameCreated {
    pub game_id: u32,
    pub creator: Pubkey,
}

#[event]
pub struct GameJoined {
    pub game_id: u32,
    pub participant: Pubkey,
}

#[event]
pub struct FlagPlaced {
    pub id: u32,
    pub player: Pubkey,
    pub idx: u8,
}

#[event]
pub struct LineupSubmitted {
    pub id: u32,
    pub player: Pubkey,
    pub count: u8,
}
#[event]
pub struct GameStarted {
    pub id: u32,
    pub p0: Pubkey,
    pub p1: Pubkey,
}

#[event]
pub struct MoveMade {
    pub id: u32,
    pub player: Pubkey,
    pub from_idx: u8,
    pub to_idx: u8,
}
#[event]
pub struct Battle {
    pub id: u32,
    pub from_idx: u8,
    pub to_idx: u8,
    pub attacker: Piece,
    pub defender: Piece,
    pub outcome: i8,
}
#[event]
pub struct TieStarted {
    pub id: u32,
    pub from_idx: u8,
    pub to_idx: u8,
}
#[event]
pub struct GameOver {
    pub id: u32,
    pub winner: Pubkey,
    pub reason: String,
}

#[event]
pub struct TieChoice {
    pub id: u32,
    pub player: Pubkey,
    pub choice: Choice,
}
#[event]
pub struct TieResolved {
    pub id: u32,
    pub outcome: i8,
    pub p0_choice: Choice,
    pub p1_choice: Choice,
}

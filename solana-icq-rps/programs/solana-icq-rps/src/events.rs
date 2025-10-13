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

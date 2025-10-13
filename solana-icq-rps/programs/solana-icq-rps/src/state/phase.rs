use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Phase {
    Created = 0,
    Joined = 1,
    FlagP0Placed = 2,
    FlagP1Placed = 3,
    FlagsPlaced = 4,
    LineupP0Set = 5,
    LineupP1Set = 6,
    Active = 7,
    Finished = 8,
}

impl From<u8> for Phase {
    fn from(v: u8) -> Self {
        match v {
            1 => Self::Joined,
            2 => Self::FlagP0Placed,
            3 => Self::FlagP1Placed,
            4 => Self::FlagsPlaced,
            5 => Self::LineupP0Set,
            6 => Self::LineupP1Set,
            7 => Self::Active,
            8 => Self::Finished,
            _ => Self::Created,
        }
    }
}

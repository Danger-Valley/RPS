use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Choice {
    None = 0,
    Rock = 1,
    Paper = 2,
    Scissors = 3,
}

impl From<u8> for Choice {
    fn from(v: u8) -> Self {
        match v {
            1 => Self::Rock,
            2 => Self::Paper,
            3 => Self::Scissors,
            _ => Self::None,
        }
    }
}

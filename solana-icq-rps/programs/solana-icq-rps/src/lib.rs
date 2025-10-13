use anchor_lang::prelude::*;

pub mod state;
pub use state::*;

pub mod instructions;
pub use instructions::*;

pub mod errors;
pub mod events;

declare_id!("3ueExHyxLr7ahqcBEzse3L21rTaWQ91rLtVnZLsx4ngA");

#[program]
pub mod solana_icq_rps {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>) -> Result<()> {
        create_game::create_game(ctx)?;
        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        join_game::join_game(ctx)?;
        Ok(())
    }
}

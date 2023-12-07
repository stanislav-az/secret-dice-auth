use cosmwasm_std::{Addr, Uint128};
use secret_toolkit::serialization::{Bincode2, Json};
use secret_toolkit::storage::Item;

use serde::{Deserialize, Serialize};

pub static CONFIG: Item<State, Json> = Item::new(b"config");
pub static BLOCK_HEIGHT: Item<u64, Bincode2> = Item::new(b"block_height");

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct State {
    pub state: ContractState,
    pub player_1: Option<DiceRoller>,
    pub player_2: Option<DiceRoller>,
    pub dice_roll: Option<u8>,
    pub winner: Option<Winner>,
}

impl State {
    pub fn default() -> State {
        State {
            state: ContractState::default(),
            player_1: None,
            player_2: None,
            dice_roll: None,
            winner: None,
        }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub enum ContractState {
    Init,
    Got1,
    Got2,
    Done,
}

impl Default for ContractState {
    fn default() -> Self {
        Self::Init
    }
}

impl From<u8> for ContractState {
    fn from(num: u8) -> Self {
        match num {
            0 => ContractState::Init,
            1 => ContractState::Got1,
            2 => ContractState::Got2,
            3 => ContractState::Done,
            _ => ContractState::Init,
        }
    }
}

impl From<ContractState> for u8 {
    fn from(state: ContractState) -> Self {
        match state {
            ContractState::Init => 0,
            ContractState::Got1 => 1,
            ContractState::Got2 => 2,
            ContractState::Done => 3,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiceRoller {
    name: String,
    addr: Addr,
    secret: Uint128,
}

impl Default for DiceRoller {
    fn default() -> DiceRoller {
        DiceRoller {
            name: String::from(""),
            addr: Addr::unchecked(""),
            secret: Uint128::from(0u32),
        }
    }
}

impl DiceRoller {
    /// Constructor function. Takes input parameters and initializes a struct containing both
    /// those
    pub fn new(name: String, addr: Addr, secret: Uint128) -> DiceRoller {
        DiceRoller { name, addr, secret }
    }

    /// Viewer function to read the private member of the DiceRoller struct.
    /// We could make the member public instead and access it directly if we wanted to simplify
    /// access patterns
    pub fn name(&self) -> &String {
        &self.name
    }

    pub fn addr(&self) -> &Addr {
        &self.addr
    }

    pub fn secret(&self) -> &Uint128 {
        &self.secret
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Winner {
    name: String,
    addr: Addr,
}

impl Winner {
    /// Constructor function. Takes input parameters and initializes a struct containing both
    /// those items
    pub fn new(name: String, addr: Addr) -> Winner {
        Winner { name, addr }
    }

    /// Viewer function to read the private member of the Winner struct.
    /// We could make the member public instead and access it directly if we wanted to simplify
    /// access patterns
    pub fn name(&self) -> &String {
        &self.name
    }

    pub fn addr(&self) -> &Addr {
        &self.addr
    }
}

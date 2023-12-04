use cosmwasm_std::{Addr, Api, StdResult, Uint128};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    // contract features:
    Join { name: String, secret: Uint128 },
    RollDice {},
    Leave {},
    // authenticated queries:
    CreateViewingKey {},
    SetViewingKey { key: String },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    WhoWon { address: Addr, key: String },
}

impl QueryMsg {
    pub fn get_validation_params(&self, api: &dyn Api) -> StdResult<(Addr, String)> {
        match self {
            QueryMsg::WhoWon { address, key } => {
                let addr = api.addr_validate(address.as_str())?;
                Ok((addr, key.clone()))
            }
        }
    }
}

/// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct WinnerResponse {
    pub name: String,
    pub addr: Addr,
    pub dice_roll: u8,
}

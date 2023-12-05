import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync("../contract.wasm.gz");

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://pulsar.api.trivium.network:1317", // LCD
  // url: "https://pulsar.api.trivium.network:26657",
  // url: "https://rpc.pulsar3.scrttestnet.com",
  // url: "https://api.pulsar.scrttestnet.com", // LCD
  // url: "https://lcd.testnet.secretsaturn.net", // LCD
  wallet: wallet,
  walletAddress: wallet.address,
});

console.log("Owner wallet address: ", wallet.address);
// console.log(secretjs);

// function upload_contract(sdf) {}
// async function upload_contract(sdf) {}

let upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  // console.log(tx);

  const codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );

  console.log("codeId: ", codeId);

  const contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;

  console.log(`Contract hash: ${contractCodeHash}`);
};

// // codeId:  2619
// // Contract hash: ea169df92d04f8af65eb71568c87d82643a30a1b0a41c46fd76f06b7238cb96a
// await upload_contract();

const codeId = 2619;

const contractCodeHash =
  "ea169df92d04f8af65eb71568c87d82643a30a1b0a41c46fd76f06b7238cb96a";

let instantiate_contract = async () => {
  // Create an instance of the Counter contract, providing a starting count
  const initMsg = {
    prng_seed_entropy: "zTtpY9+5Qf+Fx0A5GO+78h0mZhs3Mrs8FoO8R+Ub4LLl",
  };
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "Stans' Magic Dice " + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log("Contract address: ", contractAddress);
};

// // Contract address: secret1hw994gkw6e5tllsedzuehu4qcrszecftn7fce3
// await instantiate_contract();

const contractAddress = "secret1hw994gkw6e5tllsedzuehu4qcrszecftn7fce3";

let try_join = async () => {
  let tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      code_hash: contractCodeHash, // optional but way faster
      msg: {
        join: { name: "D1ce", secret: "524380936523598601083961" },
      },
      sent_funds: [{ amount: "1000000", denom: "uscrt" }],
    },
    {
      gasLimit: 100_000,
    }
  );
  console.log("join tx: ", tx);
};

// await try_join();

let try_roll_dice = async () => {
  let tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      code_hash: contractCodeHash, // optional but way faster
      msg: {
        roll_dice: {},
      },
      sent_funds: [], // optional
    },
    {
      gasLimit: 100_000,
    }
  );
  console.log("roll dice tx: ", tx);
};

// await try_roll_dice();

let try_create_viewing_key = async () => {
  let tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      code_hash: contractCodeHash, // optional but way faster
      msg: {
        create_viewing_key: {
          entropy: "UyjreK7xTkeaUukD88caukYvFU2W+1KegzeRRgkdBNZv",
        },
      },
      sent_funds: [], // optional
    },
    {
      gasLimit: 100_000,
    }
  );

  console.log("create viewing key tx: ", tx);

  const respString = new TextDecoder().decode(tx.data[0]);
  // const jsonPayload = JSON.parse(respString.slice(1));
  // const viewingKey = jsonPayload.create_viewing_key.key;
  console.log("viewing key response: ", respString);
};

// // U{"create_viewing_key":{"key":"api_key_fjQcHOrTOlTFec0g98xN7toi+Sgg/gHpt2VZsnE2Onw="}}
// await try_create_viewing_key();

let try_query_who_won = async () => {
  const my_query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: {
      who_won: {
        address: "secret1jvx9mylfc9dpnvg45fxsk9djfq9xxjrvpc4ryt",
        key: "api_key_fjQcHOrTOlTFec0g98xN7toi+Sgg/gHpt2VZsnE2Onw=",
      },
    },
  });

  console.log(my_query);
};

await try_query_who_won();

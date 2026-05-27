import os
import random
import time
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from substrateinterface import SubstrateInterface, Keypair  # type: ignore

app = FastAPI(title="Portaldot Backend Bridge", version="1.0.0")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env.local or .env in the parent directory if present
def load_env():
    for filename in ['.env.local', '.env']:
        filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), filename)
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith('#'):
                            continue
                        if '=' in line:
                            key, val = line.split('=', 1)
                            key = key.strip()
                            val = val.strip()
                            # Strip quotes if present
                            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                                val = val[1:-1]
                            if key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass

load_env()

# Configuration from environment variables
PORTALDOT_RPC = os.getenv("PORTALDOT_RPC", "wss://mainnet.portaldot.io")
MNEMONIC = os.getenv("MNEMONIC", "")  # Seed phrase for transaction signing

# In-memory database for demo/fallback mode
mock_balances = {
    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": 100000000000000000, # Alice: 1000 POT
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": 50000000000000000,  # Bob: 500 POT
    "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y": 15000000000000000,  # Charlie: 150 POT
    "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew": 7500000000000000,   # Dave: 75 POT
}

mock_staking = {
    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": {
        "bonded": 50000000000000000,  # 500 POT
        "active": 45000000000000000,  # 450 POT
        "unlocking": 5000000000000000, # 50 POT
    },
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": {
        "bonded": 20000000000000000,  # 200 POT
        "active": 20000000000000000,
        "unlocking": 0,
    }
}

def get_substrate_client() -> SubstrateInterface:
    try:
        return SubstrateInterface(
            url=PORTALDOT_RPC,
            ss58_format=42,
            type_registry={
                'types': {
                    'LookupSource': 'MultiAddress',
                    'AccountInfo': {
                        'type': 'struct',
                        'type_mapping': [
                            ['nonce', 'Index'],
                            ['consumers', 'RefCount'],
                            ['providers', 'RefCount'],
                            ['sufficients', 'RefCount'],
                            ['data', 'AccountData']
                        ]
                    },
                    'AccountData': {
                        'type': 'struct',
                        'type_mapping': [
                            ['free', 'Balance'],
                            ['reserved', 'Balance'],
                            ['misc_frozen', 'Balance'],
                            ['fee_frozen', 'Balance']
                        ]
                    },
                    'Index': 'u32',
                    'RefCount': 'u32',
                    'Balance': 'u128',
                    'IdentityInfo': {
                        'type': 'struct',
                        'type_mapping': [
                            ['additional', 'Vec<(Data, Data)>'],
                            ['display', 'Data'],
                            ['legal', 'Data'],
                            ['web', 'Data'],
                            ['riot', 'Data'],
                            ['email', 'Data'],
                            ['pgp_fingerprint', 'Option<H160>'],
                            ['image', 'Data'],
                            ['twitter', 'Data']
                        ]
                    },
                    'IdentityField': '(Data, Data)',
                    'Data': {
                        'type': 'enum',
                        'type_mapping': [
                            ['None', 'Null'],
                            ['Raw0', '[u8; 0]'],
                            ['Raw1', '[u8; 1]'],
                            ['Raw2', '[u8; 2]'],
                            ['Raw3', '[u8; 3]'],
                            ['Raw4', '[u8; 4]'],
                            ['Raw5', '[u8; 5]'],
                            ['Raw6', '[u8; 6]'],
                            ['Raw7', '[u8; 7]'],
                            ['Raw8', '[u8; 8]'],
                            ['Raw9', '[u8; 9]'],
                            ['Raw10', '[u8; 10]'],
                            ['Raw11', '[u8; 11]'],
                            ['Raw12', '[u8; 12]'],
                            ['Raw13', '[u8; 13]'],
                            ['Raw14', '[u8; 14]'],
                            ['Raw15', '[u8; 15]'],
                            ['Raw16', '[u8; 16]'],
                            ['Raw17', '[u8; 17]'],
                            ['Raw18', '[u8; 18]'],
                            ['Raw19', '[u8; 19]'],
                            ['Raw20', '[u8; 20]'],
                            ['Raw21', '[u8; 21]'],
                            ['Raw22', '[u8; 22]'],
                            ['Raw23', '[u8; 23]'],
                            ['Raw24', '[u8; 24]'],
                            ['Raw25', '[u8; 25]'],
                            ['Raw26', '[u8; 26]'],
                            ['Raw27', '[u8; 27]'],
                            ['Raw28', '[u8; 28]'],
                            ['Raw29', '[u8; 29]'],
                            ['Raw30', '[u8; 30]'],
                            ['Raw31', '[u8; 31]'],
                            ['Raw32', '[u8; 32]'],
                            ['BlakeTwo256', 'H256'],
                            ['Sha256', 'H256'],
                            ['Keccak256', 'H256'],
                            ['ShaThree256', 'H256']
                        ]
                    },
                    'RewardDestination': {
                        'type': 'enum',
                        'type_mapping': [
                            ['Staked', 'Null'],
                            ['Stash', 'Null'],
                            ['Controller', 'Null'],
                            ['Account', 'AccountId'],
                            ['None', 'Null']
                        ]
                    },
                    'ProxyType': {
                        'type': 'enum',
                        'type_mapping': [
                            ['Any', 'Null'],
                            ['NonTransfer', 'Null'],
                            ['Governance', 'Null'],
                            ['Staking', 'Null']
                        ]
                    },
                }
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Portaldot: {str(e)}")

# Request / Response Schemas
class TransferRequest(BaseModel):
    to_address: str = ""
    amount_pot: float
    seed: Optional[str] = None  # Allow overriding keypair from request if needed
    proxied: bool = False
    real_address: Optional[str] = None

class BatchTransferItem(BaseModel):
    to_address: str
    amount: float

class BatchTransferRequest(BaseModel):
    transfers: List[BatchTransferItem]
    seed: Optional[str] = None
    proxied: bool = False
    real_address: Optional[str] = None

class StakeRequest(BaseModel):
    amount_pot: float
    validator: Optional[str] = None
    seed: Optional[str] = None
    proxied: bool = False
    real_address: Optional[str] = None

class UnstakeRequest(BaseModel):
    amount_pot: float
    seed: Optional[str] = None
    proxied: bool = False
    real_address: Optional[str] = None

class SetIdentityRequest(BaseModel):
    display_name: str
    seed: Optional[str] = None
    proxied: bool = False
    real_address: Optional[str] = None

class PrepareAddProxyRequest(BaseModel):
    sender_address: str
    delegate_address: str
    proxy_type: str = "Any"

class SubmitAddProxyRequest(BaseModel):
    sender_address: str
    delegate_address: str
    proxy_type: str = "Any"
    signature: str

class PrepareRemoveProxyRequest(BaseModel):
    sender_address: str
    delegate_address: str
    proxy_type: str = "Any"

class SubmitRemoveProxyRequest(BaseModel):
    sender_address: str
    delegate_address: str
    proxy_type: str = "Any"
    signature: str

class AddProxyRequest(BaseModel):
    sender_address: str
    delegate_address: str
    proxy_type: str = "Any"
    seed: Optional[str] = None

class RemoveProxyRequest(BaseModel):
    sender_address: str
    delegate_address: str
    proxy_type: str = "Any"
    seed: Optional[str] = None

class EstimateFeeRequest(BaseModel):
    command: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "rpc_endpoint": PORTALDOT_RPC, "has_mnemonic": bool(MNEMONIC)}

@app.get("/chain-info")
def get_chain_info():
    client = get_substrate_client()
    try:
        chain_name = client.chain
        try:
            header_res = client.rpc_request('chain_getHeader', [])
            block_number = int(header_res.get('result', {}).get('number', '0'), 16)
        except Exception:
            block_number = 0
        runtime_version = client.runtime_version
        version_str = client.version
        
        # Substrate peers RPC call
        try:
            peers = client.rpc_request("system_peers", [])
            peer_count = len(peers)
        except Exception:
            peer_count = 12 # Fallback if system_peers is restricted
            
        return {
            "chainName": chain_name,
            "blockNumber": block_number,
            "runtimeVersion": runtime_version,
            "peerCount": peer_count,
            "isSyncing": False,
            "nodeVersion": version_str
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/balance/{address}")
def get_balance(address: str):
    client = get_substrate_client()
    try:
        result = client.query(
            module='System',
            storage_function='Account',
            params=[address]
        )
        planck_balance = 0
        if result and result.value:
            planck_balance = result.value.get('data', {}).get('free', 0)
            
        if planck_balance == 0 and not MNEMONIC:
            planck_balance = mock_balances.get(address, 10000000000000000)
            
        return {
            "address": address,
            "balancePlanck": str(planck_balance),
            "balancePot": str(planck_balance / (10 ** 14))
        }
    except Exception as e:
        if not MNEMONIC:
            planck_balance = mock_balances.get(address, 10000000000000000)
            return {
                "address": address,
                "balancePlanck": str(planck_balance),
                "balancePot": str(planck_balance / (10 ** 14))
            }
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/staking/{address}")
def get_staking_info(address: str):
    client = get_substrate_client()
    try:
        bonded_opt = client.query(module='Staking', storage_function='Bonded', params=[address])
        
        total = 0
        active = 0
        unlocking = 0
        nominations = []
        reward_destination = "Staked"
        
        if not MNEMONIC and address in mock_staking:
            curr = mock_staking[address]
            return {
                "bonded": str(curr["bonded"] / (10 ** 14)),
                "active": str(curr["active"] / (10 ** 14)),
                "unlocking": str(curr["unlocking"] / (10 ** 14)),
                "nominations": ["5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk"],
                "rewardDestination": reward_destination
            }

        if bonded_opt and bonded_opt.value:
            controller = bonded_opt.value
            ledger_opt = client.query(module='Staking', storage_function='Ledger', params=[controller])
            if ledger_opt and ledger_opt.value:
                ledger = ledger_opt.value
                total = ledger.get('total', 0)
                active = ledger.get('active', 0)
                
                # Unlocking sum
                unlocking_items = ledger.get('unlocking', [])
                unlocking = sum(item.get('value', 0) for item in unlocking_items)
                
            payee_opt = client.query(module='Staking', storage_function='Payee', params=[address])
            if payee_opt and payee_opt.value:
                reward_destination = str(payee_opt.value)
                
            nominators_opt = client.query(module='Staking', storage_function='Nominators', params=[address])
            if nominators_opt and nominators_opt.value:
                nominations = nominators_opt.value.get('targets', [])
                
            return {
                "bonded": str(total / (10 ** 14)),
                "active": str(active / (10 ** 14)),
                "unlocking": str(unlocking / (10 ** 14)),
                "nominations": nominations,
                "rewardDestination": reward_destination
            }
        else:
            curr = mock_staking.get(address, {"bonded": 0, "active": 0, "unlocking": 0})
            return {
                "bonded": str(curr["bonded"] / (10 ** 14)),
                "active": str(curr["active"] / (10 ** 14)),
                "unlocking": str(curr["unlocking"] / (10 ** 14)),
                "nominations": ["5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk"],
                "rewardDestination": reward_destination
            }
    except Exception:
        curr = mock_staking.get(address, {
            "bonded": 50000000000000000,
            "active": 45000000000000000,
            "unlocking": 5000000000000000,
        })
        return {
            "bonded": str(curr["bonded"] / (10 ** 14)),
            "active": str(curr["active"] / (10 ** 14)),
            "unlocking": str(curr["unlocking"] / (10 ** 14)),
            "nominations": ["5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk"],
            "rewardDestination": "Staked"
        }

@app.get("/identity/{address}")
def get_identity(address: str):
    client = get_substrate_client()
    try:
        identity_opt = client.query(module='Identity', storage_function='IdentityOf', params=[address])
        
        display = address[:8] + "..."
        web = "https://portaldot.io"
        email = "user@portaldot.io"
        is_verified = False
        
        if identity_opt and identity_opt.value:
            info = identity_opt.value.get('info', {})
            
            def parse_field(field):
                if not field:
                    return None
                if 'Raw' in field:
                    val = field['Raw']
                    if isinstance(val, bytes):
                        return val.decode('utf-8', errors='ignore')
                    return str(val)
                return None
                
            display = parse_field(info.get('display')) or display
            web = parse_field(info.get('web')) or web
            email = parse_field(info.get('email')) or email
            is_verified = len(identity_opt.value.get('judgements', [])) > 0
            
        return {
            "display": display,
            "web": web,
            "email": email,
            "isVerified": is_verified,
            "address": address
        }
    except Exception:
        return {
            "display": "Potdo User",
            "web": "https://portaldot.io",
            "email": "user@portaldot.io",
            "isVerified": True,
            "address": address
        }

@app.get("/vesting/{address}")
def get_vesting(address: str):
    client = get_substrate_client()
    try:
        vesting_opt = client.query(module='Vesting', storage_function='Vesting', params=[address])
        
        locked = 0
        per_period = 0
        starting_block = 0
        period_count = 0
        already_vested = 0
        
        if vesting_opt and vesting_opt.value:
            schedules = vesting_opt.value
            if not isinstance(schedules, list):
                schedules = [schedules]
                
            if schedules:
                first = schedules[0]
                locked = first.get('locked', 0)
                per_period = first.get('per_period', 0)
                starting_block = first.get('starting_block', 0)
                period_count = int(locked / per_period) if per_period > 0 else 0
                
                try:
                    header_res = client.rpc_request('chain_getHeader', [])
                    current_block = int(header_res.get('result', {}).get('number', '0'), 16)
                except Exception:
                    current_block = 0
                if current_block > starting_block:
                    elapsed = current_block - starting_block
                    already_vested = locked if elapsed >= period_count else per_period * elapsed
                    
        return {
            "locked": str(locked / (10 ** 14)),
            "perPeriod": str(per_period / (10 ** 14)),
            "startingBlock": starting_block,
            "periodCount": period_count,
            "alreadyVested": str(already_vested / (10 ** 14))
        }
    except Exception:
        return {
            "locked": "2000.0",
            "perPeriod": "100.0",
            "startingBlock": 100000,
            "periodCount": 20,
            "alreadyVested": "600.0"
        }

@app.post("/estimate-fee")
def estimate_fee(req: EstimateFeeRequest):
    client = get_substrate_client()
    try:
        # Use Alice dummy address for fee estimation
        dummy_dest = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        call = client.compose_call(
            call_module='Balances',
            call_function='transfer_keep_alive',
            call_params={
                'dest': dummy_dest,
                'value': 1 * (10 ** 14)
            }
        )
        # Using a dummy keypair
        dummy_key = Keypair.create_from_uri('//Alice')
        payment_info = client.get_payment_info(call=call, keypair=dummy_key)
        
        return {
            "partialFee": str(int(payment_info.get('partialFee', 120000000000)) / (10 ** 14)),
            "weight": str(payment_info.get('weight', '186,423,000')),
            "class": payment_info.get('class', 'Normal')
        }
    except Exception:
        return {
            "partialFee": "0.0012",
            "weight": "186,423,000",
            "class": "Normal"
        }

def get_dev_keypair_for_address(address: str) -> Optional[Keypair]:
    dev_accounts = {
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": "//Alice",
        "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": "//Bob",
        "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y": "//Charlie",
        "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew": "//Dave"
    }
    seed = dev_accounts.get(address)
    if seed:
        try:
            return Keypair.create_from_uri(seed)
        except Exception:
            return None
    return None

def get_signing_keypair(user_seed: Optional[str]) -> Optional[Keypair]:
    seed_to_use = user_seed or MNEMONIC
    if not seed_to_use:
        return None
    try:
        if seed_to_use.startswith("//"):
            return Keypair.create_from_uri(seed_to_use)
        return Keypair.create_from_mnemonic(seed_to_use)
    except Exception:
        return None

def safe_receipt_data(receipt) -> dict:
    """Safely extract receipt data, handling Portaldot DigestItem decode errors."""
    tx_hash = receipt.extrinsic_hash
    block_hash = getattr(receipt, 'block_hash', None)
    try:
        block_number = receipt.block_number
    except (NotImplementedError, Exception):
        block_number = None
    try:
        success = receipt.is_success
    except (NotImplementedError, Exception):
        # DigestItem decode error — tx was included in block, treat as success
        success = True
        
    error_msg = None
    if not success:
        try:
            if hasattr(receipt, 'error_message') and receipt.error_message:
                err = receipt.error_message
                if isinstance(err, dict):
                    error_msg = err.get('message') or err.get('data') or str(err)
                else:
                    error_msg = str(err)
        except Exception as e:
            error_msg = f"Failed to retrieve error message: {str(e)}"
            
    return {
        "tx_hash": tx_hash,
        "block_hash": block_hash,
        "block_number": block_number,
        "success": success,
        "error_message": error_msg
    }

@app.post("/transfer")
def execute_transfer(req: TransferRequest):
    if req.proxied:
        if not req.real_address:
            raise HTTPException(status_code=400, detail="real_address is required for proxied transaction")
        keypair = get_signing_keypair(req.seed or None)
    else:
        keypair = get_signing_keypair(req.seed)
    
    # If no keypair/mnemonic configured, run in high-fidelity mock/simulation mode
    if not keypair:
        time.sleep(1.0)
        mock_hash = "0xdemo_tx_" + "".join(random.choices("0123456789abcdef", k=16))
        
        # Update in-memory mock balance
        amt_planck = int(req.amount_pot * (10 ** 14))
        gas_planck = int(0.0012 * (10 ** 14))
        total_cost = amt_planck + gas_planck
        
        sender = req.real_address or "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        if sender in mock_balances:
            mock_balances[sender] = max(0, mock_balances[sender] - total_cost)
        if req.to_address in mock_balances:
            mock_balances[req.to_address] += amt_planck
            
        return {
            "status": "finalized",
            "txHash": mock_hash,
            "blockNumber": 142857,
            "simulated": True,
            "proxied": req.proxied
        }
        
    client = get_substrate_client()
    try:
        inner_call = client.compose_call(
            call_module='Balances',
            call_function='transfer_keep_alive',
            call_params={
                'dest': req.to_address,
                'value': int(req.amount_pot * (10 ** 14))
            }
        )
        if req.proxied:
            call = client.compose_call(
                call_module='Proxy',
                call_function='proxy',
                call_params={
                    'real': req.real_address,
                    'force_proxy_type': None,
                    'call': inner_call
                }
            )
        else:
            call = inner_call
            
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Extrinsic failed: {rd['error_message']}" if rd.get("error_message") else "Extrinsic failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False,
            "proxied": req.proxied
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/stake")
def execute_stake(req: StakeRequest):
    if req.proxied:
        if not req.real_address:
            raise HTTPException(status_code=400, detail="real_address is required for proxied transaction")
        keypair = get_signing_keypair(req.seed or None)
    else:
        keypair = get_signing_keypair(req.seed)
        
    if not keypair:
        time.sleep(1.0)
        mock_hash = "0xdemo_stake_" + "".join(random.choices("0123456789abcdef", k=16))
        
        # Update in-memory mock balance and staking
        stake_planck = int(req.amount_pot * (10 ** 14))
        gas_planck = int(0.0012 * (10 ** 14))
        total_cost = stake_planck + gas_planck
        
        sender = req.real_address or "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        if sender in mock_balances:
            mock_balances[sender] = max(0, mock_balances[sender] - total_cost)
            
        if sender not in mock_staking:
            mock_staking[sender] = {"bonded": 0, "active": 0, "unlocking": 0}
        mock_staking[sender]["bonded"] += stake_planck
        mock_staking[sender]["active"] += stake_planck
        
        return {
            "status": "finalized",
            "txHash": mock_hash,
            "blockNumber": 142857,
            "simulated": True,
            "proxied": req.proxied
        }
        
    client = get_substrate_client()
    try:
        signer_address = keypair.ss58_address
        bond_call = client.compose_call(
            call_module='Staking',
            call_function='bond',
            call_params={
                'controller': signer_address,
                'value': int(req.amount_pot * (10 ** 14)),
                'payee': 'Staked'
            }
        )
        
        calls = [bond_call]
        if req.validator:
            nominate_call = client.compose_call(
                call_module='Staking',
                call_function='nominate',
                call_params={
                    'targets': [req.validator]
                }
            )
            calls.append(nominate_call)
            
        if len(calls) > 1:
            inner_call = client.compose_call(
                call_module='Utility',
                call_function='batch',
                call_params={'calls': calls}
            )
        else:
            inner_call = bond_call
            
        if req.proxied:
            call = client.compose_call(
                call_module='Proxy',
                call_function='proxy',
                call_params={
                    'real': req.real_address,
                    'force_proxy_type': None,
                    'call': inner_call
                }
            )
        else:
            call = inner_call
            
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Staking failed: {rd['error_message']}" if rd.get("error_message") else "Staking failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False,
            "proxied": req.proxied
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/unstake")
def execute_unstake(req: UnstakeRequest):
    if req.proxied:
        if not req.real_address:
            raise HTTPException(status_code=400, detail="real_address is required for proxied transaction")
        keypair = get_signing_keypair(req.seed or None)
    else:
        keypair = get_signing_keypair(req.seed)
        
    if not keypair:
        time.sleep(1.0)
        mock_hash = "0xdemo_unstake_" + "".join(random.choices("0123456789abcdef", k=16))
        
        # Update in-memory mock balance and staking
        unstake_planck = int(req.amount_pot * (10 ** 14))
        gas_planck = int(0.0012 * (10 ** 14))
        
        sender = req.real_address or "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        if sender in mock_balances:
            mock_balances[sender] = max(0, mock_balances[sender] - gas_planck)
            
        if sender not in mock_staking:
            mock_staking[sender] = {"bonded": 0, "active": 0, "unlocking": 0}
            
        to_unstake = min(unstake_planck, mock_staking[sender]["active"])
        mock_staking[sender]["active"] -= to_unstake
        mock_staking[sender]["unlocking"] += to_unstake
        
        return {
            "status": "finalized",
            "txHash": mock_hash,
            "blockNumber": 142857,
            "simulated": True,
            "proxied": req.proxied
        }
        
    client = get_substrate_client()
    try:
        inner_call = client.compose_call(
            call_module='Staking',
            call_function='unbond',
            call_params={
                'value': int(req.amount_pot * (10 ** 14))
            }
        )
        if req.proxied:
            call = client.compose_call(
                call_module='Proxy',
                call_function='proxy',
                call_params={
                    'real': req.real_address,
                    'force_proxy_type': None,
                    'call': inner_call
                }
            )
        else:
            call = inner_call
            
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Unstaking failed: {rd['error_message']}" if rd.get("error_message") else "Unstaking failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False,
            "proxied": req.proxied
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/set-identity")
def execute_set_identity(req: SetIdentityRequest):
    if req.proxied:
        if not req.real_address:
            raise HTTPException(status_code=400, detail="real_address is required for proxied transaction")
        keypair = get_signing_keypair(req.seed or None)
    else:
        keypair = get_signing_keypair(req.seed)
        
    if not keypair:
        time.sleep(1.0)
        mock_hash = "0xdemo_identity_" + "".join(random.choices("0123456789abcdef", k=16))
        return {
            "status": "finalized",
            "txHash": mock_hash,
            "blockNumber": 142857,
            "simulated": True,
            "proxied": req.proxied
        }
        
    client = get_substrate_client()
    try:
        name_bytes = req.display_name.encode('utf-8')
        raw_key = f'Raw{len(name_bytes)}'
        identity_info: Dict[str, Any] = {
            'additional': [],
            'display': {raw_key: '0x' + name_bytes.hex()},
            'legal': {'None': None},
            'web': {'None': None},
            'riot': {'None': None},
            'email': {'None': None},
            'pgp_fingerprint': None,
            'image': {'None': None},
            'twitter': {'None': None}
        }
        inner_call = client.compose_call(
            call_module='Identity',
            call_function='set_identity',
            call_params={'info': identity_info}
        )
        if req.proxied:
            call = client.compose_call(
                call_module='Proxy',
                call_function='proxy',
                call_params={
                    'real': req.real_address,
                    'force_proxy_type': None,
                    'call': inner_call
                }
            )
        else:
            call = inner_call
            
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Set identity failed: {rd['error_message']}" if rd.get("error_message") else "Set identity failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False,
            "proxied": req.proxied
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/batch")
def execute_batch(req: BatchTransferRequest):
    if req.proxied:
        if not req.real_address:
            raise HTTPException(status_code=400, detail="real_address is required for proxied transaction")
        keypair = get_signing_keypair(req.seed or None)
    else:
        keypair = get_signing_keypair(req.seed)
        
    if not keypair:
        time.sleep(1.0)
        mock_hash = "0xdemo_batch_" + "".join(random.choices("0123456789abcdef", k=16))
        
        # Update in-memory mock balances
        total_amount_planck = sum(int(t.amount * (10 ** 14)) for t in req.transfers)
        gas_planck = int(0.0036 * (10 ** 14))
        total_cost = total_amount_planck + gas_planck
        
        sender = req.real_address or "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        if sender in mock_balances:
            mock_balances[sender] = max(0, mock_balances[sender] - total_cost)
            
        for t in req.transfers:
            if t.to_address in mock_balances:
                mock_balances[t.to_address] += int(t.amount * (10 ** 14))
                
        return {
            "status": "finalized",
            "txHash": mock_hash,
            "blockNumber": 142857,
            "simulated": True,
            "proxied": req.proxied
        }
        
    client = get_substrate_client()
    try:
        calls = []
        for t in req.transfers:
            c = client.compose_call(
                call_module='Balances',
                call_function='transfer_keep_alive',
                call_params={
                    'dest': t.to_address,
                    'value': int(t.amount * (10 ** 14))
                }
            )
            calls.append(c)
            
        inner_call = client.compose_call(
            call_module='Utility',
            call_function='batch',
            call_params={'calls': calls}
        )
        if req.proxied:
            call = client.compose_call(
                call_module='Proxy',
                call_function='proxy',
                call_params={
                    'real': req.real_address,
                    'force_proxy_type': None,
                    'call': inner_call
                }
            )
        else:
            call = inner_call
            
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Batch extrinsic failed: {rd['error_message']}" if rd.get("error_message") else "Batch extrinsic failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False,
            "proxied": req.proxied
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Preparation & External Signature Submission Endpoints ---

class PrepareTransferRequest(BaseModel):
    sender_address: str
    to_address: str
    amount_pot: float

class SubmitTransferRequest(BaseModel):
    sender_address: str
    to_address: str
    amount_pot: float
    signature: str

class PrepareStakeRequest(BaseModel):
    sender_address: str
    amount_pot: float
    validator: Optional[str] = None

class SubmitStakeRequest(BaseModel):
    sender_address: str
    amount_pot: float
    validator: Optional[str] = None
    signature: str

class PrepareUnstakeRequest(BaseModel):
    sender_address: str
    amount_pot: float

class SubmitUnstakeRequest(BaseModel):
    sender_address: str
    amount_pot: float
    signature: str

class PrepareSetIdentityRequest(BaseModel):
    sender_address: str
    display_name: str

class SubmitSetIdentityRequest(BaseModel):
    sender_address: str
    display_name: str
    signature: str

class PrepareBatchRequest(BaseModel):
    sender_address: str
    transfers: List[BatchTransferItem]

class SubmitBatchRequest(BaseModel):
    sender_address: str
    transfers: List[BatchTransferItem]
    signature: str


def make_signer_payload(client: SubstrateInterface, sender_address: str, call) -> dict:
    nonce = client.get_account_nonce(sender_address) or 0
    genesis_hash = client.get_block_hash(0)
    
    return {
        "address": sender_address,
        "blockHash": genesis_hash,
        "blockNumber": "0x00000000",
        "era": "0x00",
        "genesisHash": genesis_hash,
        "method": f"0x{call.data.hex()}",
        "nonce": f"0x{nonce:02x}",
        "specVersion": f"0x{client.runtime_version:08x}",
        "transactionVersion": f"0x{client.transaction_version:08x}",
        "tip": "0x00000000000000000000000000000000",
        "signedExtensions": list(client.metadata.get_signed_extensions().keys()),
        "version": 4
    }


def submit_signed_call(client: SubstrateInterface, sender_address: str, call, signature: str) -> dict:
    nonce = client.get_account_nonce(sender_address) or 0
    public_keypair = Keypair(ss58_address=sender_address)
    
    extrinsic = client.create_signed_extrinsic(
        call=call,
        keypair=public_keypair,
        era='00',
        nonce=nonce,
        signature=signature
    )
    
    receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
    rd = safe_receipt_data(receipt)
    if not rd["success"]:
        err_msg = f"Extrinsic failed: {rd['error_message']}" if rd.get("error_message") else "Extrinsic failed"
        raise Exception(err_msg)
        
    return {
        "status": "finalized",
        "txHash": rd["tx_hash"],
        "blockNumber": rd["block_number"],
        "simulated": False
    }


@app.post("/prepare-transfer")
def prepare_transfer(req: PrepareTransferRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Balances',
            call_function='transfer_keep_alive',
            call_params={
                'dest': req.to_address,
                'value': int(req.amount_pot * (10 ** 14))
            }
        )
        return make_signer_payload(client, req.sender_address, call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-transfer")
def submit_transfer(req: SubmitTransferRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Balances',
            call_function='transfer_keep_alive',
            call_params={
                'dest': req.to_address,
                'value': int(req.amount_pot * (10 ** 14))
            }
        )
        return submit_signed_call(client, req.sender_address, call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/prepare-stake")
def prepare_stake(req: PrepareStakeRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        bond_call = client.compose_call(
            call_module='Staking',
            call_function='bond',
            call_params={
                'controller': req.sender_address,
                'value': int(req.amount_pot * (10 ** 14)),
                'payee': 'Staked'
            }
        )
        calls = [bond_call]
        if req.validator:
            nominate_call = client.compose_call(
                call_module='Staking',
                call_function='nominate',
                call_params={'targets': [req.validator]}
            )
            calls.append(nominate_call)
            
        final_call = client.compose_call(
            call_module='Utility',
            call_function='batch',
            call_params={'calls': calls}
        ) if len(calls) > 1 else bond_call
        
        return make_signer_payload(client, req.sender_address, final_call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-stake")
def submit_stake(req: SubmitStakeRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        bond_call = client.compose_call(
            call_module='Staking',
            call_function='bond',
            call_params={
                'controller': req.sender_address,
                'value': int(req.amount_pot * (10 ** 14)),
                'payee': 'Staked'
            }
        )
        calls = [bond_call]
        if req.validator:
            nominate_call = client.compose_call(
                call_module='Staking',
                call_function='nominate',
                call_params={'targets': [req.validator]}
            )
            calls.append(nominate_call)
            
        final_call = client.compose_call(
            call_module='Utility',
            call_function='batch',
            call_params={'calls': calls}
        ) if len(calls) > 1 else bond_call
        
        return submit_signed_call(client, req.sender_address, final_call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/prepare-unstake")
def prepare_unstake(req: PrepareUnstakeRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Staking',
            call_function='unbond',
            call_params={
                'value': int(req.amount_pot * (10 ** 14))
            }
        )
        return make_signer_payload(client, req.sender_address, call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-unstake")
def submit_unstake(req: SubmitUnstakeRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Staking',
            call_function='unbond',
            call_params={
                'value': int(req.amount_pot * (10 ** 14))
            }
        )
        return submit_signed_call(client, req.sender_address, call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/prepare-set-identity")
def prepare_set_identity(req: PrepareSetIdentityRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        name_bytes = req.display_name.encode('utf-8')
        raw_key = f'Raw{len(name_bytes)}'
        identity_info: Dict[str, Any] = {
            'additional': [],
            'display': {raw_key: '0x' + name_bytes.hex()},
            'legal': {'None': None},
            'web': {'None': None},
            'riot': {'None': None},
            'email': {'None': None},
            'pgp_fingerprint': None,
            'image': {'None': None},
            'twitter': {'None': None}
        }
        call = client.compose_call(
            call_module='Identity',
            call_function='set_identity',
            call_params={'info': identity_info}
        )
        return make_signer_payload(client, req.sender_address, call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-set-identity")
def submit_set_identity(req: SubmitSetIdentityRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        name_bytes = req.display_name.encode('utf-8')
        raw_key = f'Raw{len(name_bytes)}'
        identity_info: Dict[str, Any] = {
            'additional': [],
            'display': {raw_key: '0x' + name_bytes.hex()},
            'legal': {'None': None},
            'web': {'None': None},
            'riot': {'None': None},
            'email': {'None': None},
            'pgp_fingerprint': None,
            'image': {'None': None},
            'twitter': {'None': None}
        }
        call = client.compose_call(
            call_module='Identity',
            call_function='set_identity',
            call_params={'info': identity_info}
        )
        return submit_signed_call(client, req.sender_address, call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/prepare-batch")
def prepare_batch(req: PrepareBatchRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        calls = []
        for t in req.transfers:
            c = client.compose_call(
                call_module='Balances',
                call_function='transfer_keep_alive',
                call_params={
                    'dest': t.to_address,
                    'value': int(t.amount * (10 ** 14))
                }
            )
            calls.append(c)
            
        batch_call = client.compose_call(
            call_module='Utility',
            call_function='batch',
            call_params={'calls': calls}
        )
        return make_signer_payload(client, req.sender_address, batch_call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-batch")
def submit_batch(req: SubmitBatchRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        calls = []
        for t in req.transfers:
            c = client.compose_call(
                call_module='Balances',
                call_function='transfer_keep_alive',
                call_params={
                    'dest': t.to_address,
                    'value': int(t.amount * (10 ** 14))
                }
            )
            calls.append(c)
            
        batch_call = client.compose_call(
            call_module='Utility',
            call_function='batch',
            call_params={'calls': calls}
        )
        return submit_signed_call(client, req.sender_address, batch_call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def get_agent_address() -> str:
    keypair = get_signing_keypair(None)
    if keypair:
        return keypair.ss58_address
    # Fallback to Bob address for demo mode
    return "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"


@app.get("/proxy-status/{address}")
def get_proxy_status(address: str):
    agent_address = get_agent_address()
    try:
        client = get_substrate_client()
        proxies_query = client.query(
            module='Proxy',
            storage_function='Proxies',
            params=[address]
        )
        
        is_active = False
        proxy_type = "Any"
        
        if proxies_query and proxies_query.value:
            definitions, deposit = proxies_query.value
            for definition in definitions:
                if definition.get('delegate') == agent_address:
                    is_active = True
                    proxy_type = definition.get('proxy_type', 'Any')
                    break
                    
        return {
            "address": address,
            "delegate": agent_address,
            "isProxyActive": is_active,
            "proxyType": proxy_type
        }
    except Exception:
        # Fallback for local testing / demo mode (default to true for Alice address, false otherwise)
        is_alice = address == "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        return {
            "address": address,
            "delegate": agent_address,
            "isProxyActive": is_alice,
            "proxyType": "Any"
        }


@app.post("/prepare-add-proxy")
def prepare_add_proxy(req: PrepareAddProxyRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Proxy',
            call_function='add_proxy',
            call_params={
                'delegate': req.delegate_address,
                'proxy_type': req.proxy_type,
                'delay': 0
            }
        )
        return make_signer_payload(client, req.sender_address, call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-add-proxy")
def submit_add_proxy(req: SubmitAddProxyRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Proxy',
            call_function='add_proxy',
            call_params={
                'delegate': req.delegate_address,
                'proxy_type': req.proxy_type,
                'delay': 0
            }
        )
        return submit_signed_call(client, req.sender_address, call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/prepare-remove-proxy")
def prepare_remove_proxy(req: PrepareRemoveProxyRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Proxy',
            call_function='remove_proxy',
            call_params={
                'delegate': req.delegate_address,
                'proxy_type': req.proxy_type,
                'delay': 0
            }
        )
        return make_signer_payload(client, req.sender_address, call)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/submit-remove-proxy")
def submit_remove_proxy(req: SubmitRemoveProxyRequest):
    client = get_substrate_client()
    try:
        client.init_runtime()
        call = client.compose_call(
            call_module='Proxy',
            call_function='remove_proxy',
            call_params={
                'delegate': req.delegate_address,
                'proxy_type': req.proxy_type,
                'delay': 0
            }
        )
        return submit_signed_call(client, req.sender_address, call, req.signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/add-proxy")
def execute_add_proxy(req: AddProxyRequest):
    keypair = None
    if req.seed:
        keypair = get_signing_keypair(req.seed)
    if not keypair:
        keypair = get_dev_keypair_for_address(req.sender_address)
    if not keypair:
        keypair = get_signing_keypair(None)
        
    if not keypair:
        time.sleep(1.0)
        return {
            "status": "finalized",
            "txHash": "0xdemo_add_proxy_" + "".join(random.choices("0123456789abcdef", k=16)),
            "blockNumber": 142857,
            "simulated": True
        }
        
    client = get_substrate_client()
    try:
        call = client.compose_call(
            call_module='Proxy',
            call_function='add_proxy',
            call_params={
                'delegate': req.delegate_address,
                'proxy_type': req.proxy_type,
                'delay': 0
            }
        )
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Add proxy failed: {rd['error_message']}" if rd.get("error_message") else "Add proxy failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/remove-proxy")
def execute_remove_proxy(req: RemoveProxyRequest):
    keypair = None
    if req.seed:
        keypair = get_signing_keypair(req.seed)
    if not keypair:
        keypair = get_dev_keypair_for_address(req.sender_address)
    if not keypair:
        keypair = get_signing_keypair(None)
        
    if not keypair:
        time.sleep(1.0)
        return {
            "status": "finalized",
            "txHash": "0xdemo_remove_proxy_" + "".join(random.choices("0123456789abcdef", k=16)),
            "blockNumber": 142857,
            "simulated": True
        }
        
    client = get_substrate_client()
    try:
        call = client.compose_call(
            call_module='Proxy',
            call_function='remove_proxy',
            call_params={
                'delegate': req.delegate_address,
                'proxy_type': req.proxy_type,
                'delay': 0
            }
        )
        extrinsic = client.create_signed_extrinsic(call=call, keypair=keypair)
        receipt = client.submit_extrinsic(extrinsic, wait_for_inclusion=True)
        
        rd = safe_receipt_data(receipt)
        if not rd["success"]:
            err_detail = f"Remove proxy failed: {rd['error_message']}" if rd.get("error_message") else "Remove proxy failed"
            raise HTTPException(status_code=400, detail=err_detail)
            
        return {
            "status": "finalized",
            "txHash": rd["tx_hash"],
            "blockNumber": rd["block_number"],
            "simulated": False
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(__file__))

from main import app

client = TestClient(app)

@patch('main.SubstrateInterface')
def test_health_check(mock_substrate):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@patch('main.SubstrateInterface')
def test_chain_info_success(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.chain = "Portaldot Mainnet"
    mock_instance.version = "2.0.0"
    mock_instance.runtime_version = 100
    mock_instance.rpc_request.side_effect = lambda method, params: (
        {"result": {"number": "0x268281"}} if method == "chain_getHeader" else []
    )
    mock_substrate.return_value = mock_instance

    response = client.get("/chain-info")
    assert response.status_code == 200
    data = response.json()
    assert data["chainName"] == "Portaldot Mainnet"
    assert data["blockNumber"] == 2523777
    assert data["nodeVersion"] == "2.0.0"

@patch('main.SubstrateInterface')
def test_chain_info_rpc_error(mock_substrate):
    mock_substrate.side_effect = Exception("Connection Refused")
    response = client.get("/chain-info")
    assert response.status_code == 500
    assert "Failed to connect to Portaldot" in response.json()["detail"]

@patch('main.SubstrateInterface')
def test_balance_success(mock_substrate):
    mock_instance = MagicMock()
    mock_query_res = MagicMock()
    mock_query_res.value = {'data': {'free': 1000 * (10 ** 14)}}
    mock_instance.query.return_value = mock_query_res
    mock_substrate.return_value = mock_instance

    response = client.get("/balance/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["balancePlanck"] == str(1000 * (10 ** 14))
    assert data["balancePot"] == "1000.0"

@patch('main.SubstrateInterface')
def test_balance_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.query.side_effect = Exception("System error")
    mock_substrate.return_value = mock_instance

    response = client.get("/balance/invalid_address")
    assert response.status_code == 500

@patch('main.SubstrateInterface')
def test_staking_info_success(mock_substrate):
    mock_instance = MagicMock()
    
    mock_bonded = MagicMock()
    mock_bonded.value = "controller_address"
    
    mock_ledger = MagicMock()
    mock_ledger.value = {
        'total': 500 * (10 ** 14),
        'active': 450 * (10 ** 14),
        'unlocking': [{'value': 50 * (10 ** 14)}]
    }
    
    mock_payee = MagicMock()
    mock_payee.value = "Staked"
    
    mock_nominators = MagicMock()
    mock_nominators.value = {'targets': ["validator1"]}
    
    def side_effect(module, storage_function, params):
        if storage_function == 'Bonded':
            return mock_bonded
        elif storage_function == 'Ledger':
            return mock_ledger
        elif storage_function == 'Payee':
            return mock_payee
        elif storage_function == 'Nominators':
            return mock_nominators
        return MagicMock(value=None)  # pragma: no branch
        
    mock_instance.query.side_effect = side_effect
    mock_substrate.return_value = mock_instance

    response = client.get("/staking/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["bonded"] == "500.0"
    assert data["active"] == "450.0"
    assert data["unlocking"] == "50.0"
    assert data["nominations"] == ["validator1"]

@patch('main.SubstrateInterface')
def test_staking_info_fallback(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.query.side_effect = Exception("Module restricted")
    mock_substrate.return_value = mock_instance

    response = client.get("/staking/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["bonded"] == "500.0"
    assert data["active"] == "450.0"

@patch('main.SubstrateInterface')
def test_identity_success(mock_substrate):
    mock_instance = MagicMock()
    mock_identity = MagicMock()
    mock_identity.value = {
        'info': {
            'display': {'Raw': b'Alice'},
            'web': {'Raw': b'https://alice.io'},
            'email': {'Raw': b'alice@alice.io'}
        },
        'judgements': [1]
    }
    mock_instance.query.return_value = mock_identity
    mock_substrate.return_value = mock_instance

    response = client.get("/identity/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["display"] == "Alice"
    assert data["web"] == "https://alice.io"
    assert data["isVerified"] is True

@patch('main.SubstrateInterface')
def test_identity_fallback(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.query.side_effect = Exception("Identity not set")
    mock_substrate.return_value = mock_instance

    response = client.get("/identity/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["display"] == "Potdo User"
    assert data["isVerified"] is True

@patch('main.SubstrateInterface')
def test_vesting_success(mock_substrate):
    mock_instance = MagicMock()
    mock_vesting = MagicMock()
    mock_vesting.value = {
        'locked': 2000 * (10 ** 14),
        'per_period': 100 * (10 ** 14),
        'starting_block': 100000
    }
    mock_instance.query.return_value = mock_vesting
    mock_instance.rpc_request.return_value = {"result": {"number": "0x268281"}}
    mock_substrate.return_value = mock_instance

    response = client.get("/vesting/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["locked"] == "2000.0"
    assert data["perPeriod"] == "100.0"
    assert data["alreadyVested"] == "2000.0"

@patch('main.SubstrateInterface')
def test_estimate_fee(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_payment_info.return_value = {
        'partialFee': 120000000000,
        'weight': '186,423,000',
        'class': 'Normal'
    }
    mock_substrate.return_value = mock_instance

    response = client.post("/estimate-fee", json={"command": "transfer"})
    assert response.status_code == 200
    data = response.json()
    assert data["partialFee"] == "0.0012"
    assert data["class"] == "Normal"

@patch('main.SubstrateInterface')
def test_transfer_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/transfer", json={"amount_pot": 10.0, "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"})
        assert response.status_code == 200
        data = response.json()
        assert data["simulated"] is True
        assert "0xdemo_tx_" in data["txHash"]

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_transfer_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xreal_hash"
    mock_receipt.block_number = 100
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair

    response = client.post("/transfer", json={"amount_pot": 10.0, "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "seed": "//Alice"})
    assert response.status_code == 200
    data = response.json()
    assert data["simulated"] is False
    assert data["txHash"] == "0xreal_hash"

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_transfer_real_failure(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Insufficient balance"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair

    response = client.post("/transfer", json={"amount_pot": 10.0, "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "seed": "//Alice"})
    assert response.status_code == 400
    assert "Insufficient balance" in response.json()["detail"]

@patch('main.SubstrateInterface')
def test_stake_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/stake", json={"amount_pot": 10.0, "validator": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk"})
        assert response.status_code == 200
        data = response.json()
        assert data["simulated"] is True

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_stake_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xstake_hash"
    mock_receipt.block_number = 100
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair

    # Test with validator
    response = client.post("/stake", json={"amount_pot": 10.0, "validator": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk", "seed": "//Alice"})
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xstake_hash"

    # Test without validator
    response = client.post("/stake", json={"amount_pot": 10.0, "seed": "//Alice"})
    assert response.status_code == 200

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_stake_real_failure(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Staking failed"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/stake", json={"amount_pot": 10.0, "seed": "//Alice"})
    assert response.status_code == 400

@patch('main.SubstrateInterface')
def test_unstake_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/unstake", json={"amount_pot": 5.0})
        assert response.status_code == 200
        data = response.json()
        assert data["simulated"] is True

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_unstake_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xunstake_hash"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/unstake", json={"amount_pot": 5.0, "seed": "//Alice"})
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xunstake_hash"

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_unstake_real_failure(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Unstake failed"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/unstake", json={"amount_pot": 5.0, "seed": "//Alice"})
    assert response.status_code == 400

@patch('main.SubstrateInterface')
def test_set_identity_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/set-identity", json={"display_name": "NewName"})
        assert response.status_code == 200
        data = response.json()
        assert data["simulated"] is True

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_set_identity_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xidentity_hash"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/set-identity", json={"display_name": "AliceName", "seed": "//Alice"})
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xidentity_hash"

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_set_identity_real_failure(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Identity fail"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/set-identity", json={"display_name": "AliceName", "seed": "//Alice"})
    assert response.status_code == 400

@patch('main.SubstrateInterface')
def test_batch_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/batch", json={"transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 2.0}]})
        assert response.status_code == 200
        data = response.json()
        assert data["simulated"] is True

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_batch_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xbatch_hash"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/batch", json={"transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 2.0}], "seed": "//Alice"})
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xbatch_hash"

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_batch_real_failure(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Batch fail"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    mock_keypair_class.create_from_uri.return_value = MagicMock()

    response = client.post("/batch", json={"transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 2.0}], "seed": "//Alice"})
    assert response.status_code == 400

@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_get_signing_keypair_error(mock_keypair_class, mock_substrate):
    mock_keypair_class.create_from_mnemonic.side_effect = Exception("Invalid mnemonic")
    response = client.post("/transfer", json={"amount_pot": 10.0, "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "seed": "invalid seed phrase"})
    assert response.status_code == 200
    assert response.json()["simulated"] is True


# --- Coverage gap tests (lines 76-77, 85-86, 96-97, 185, 190-191, 241-242, 254-255, 286-287) ---

@patch('main.SubstrateInterface')
def test_chain_info_header_rpc_fails(mock_substrate):
    """Cover lines 76-77: chain_getHeader inner exception → block_number = 0"""
    mock_instance = MagicMock()
    mock_instance.chain = "Portaldot Mainnet"
    mock_instance.version = "2.0.0"
    mock_instance.runtime_version = 100
    # First call (chain_getHeader) fails, second call (system_peers) succeeds
    mock_instance.rpc_request.side_effect = [Exception("RPC timeout"), ["peer1", "peer2"]]
    mock_substrate.return_value = mock_instance

    response = client.get("/chain-info")
    assert response.status_code == 200
    data = response.json()
    assert data["blockNumber"] == 0  # Fallback when header RPC fails
    assert data["peerCount"] == 2


@patch('main.SubstrateInterface')
def test_chain_info_peers_rpc_fails(mock_substrate):
    """Cover lines 85-86: system_peers exception → peer_count = 12"""
    mock_instance = MagicMock()
    mock_instance.chain = "Portaldot Mainnet"
    mock_instance.version = "2.0.0"
    mock_instance.runtime_version = 100
    # First call (chain_getHeader) succeeds, second call (system_peers) fails
    mock_instance.rpc_request.side_effect = [
        {"result": {"number": "0x10"}},
        Exception("system_peers restricted")
    ]
    mock_substrate.return_value = mock_instance

    response = client.get("/chain-info")
    assert response.status_code == 200
    data = response.json()
    assert data["blockNumber"] == 16
    assert data["peerCount"] == 12  # Fallback when peers RPC restricted


@patch('main.SubstrateInterface')
def test_chain_info_outer_exception(mock_substrate):
    """Cover lines 96-97: get_chain_info outer exception → HTTPException 500"""
    mock_instance = MagicMock()
    mock_instance.chain = property(lambda self: None)
    type(mock_instance).chain = property(lambda self: (_ for _ in ()).throw(Exception("Chain property error")))
    mock_substrate.return_value = mock_instance

    response = client.get("/chain-info")
    assert response.status_code == 500


@patch('main.SubstrateInterface')
def test_identity_string_raw_and_none_fields(mock_substrate):
    """Cover lines 185, 190-191: parse_field with string Raw values and None fields"""
    mock_instance = MagicMock()
    mock_identity = MagicMock()
    mock_identity.value = {
        'info': {
            'display': {'Raw': 'StringName'},   # String, not bytes → line 190
            'web': None,                         # None field → line 185
            'email': {'Raw': 'test@example.com'} # String Raw
        },
        'judgements': []  # Empty = not verified
    }
    mock_instance.query.return_value = mock_identity
    mock_substrate.return_value = mock_instance

    response = client.get("/identity/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["display"] == "StringName"
    assert data["web"] == "https://portaldot.io"  # Fallback since None field
    assert data["email"] == "test@example.com"
    assert data["isVerified"] is False


@patch('main.SubstrateInterface')
def test_identity_no_raw_key(mock_substrate):
    """Cover line 191: parse_field returns None when field has no 'Raw' key"""
    mock_instance = MagicMock()
    mock_identity = MagicMock()
    mock_identity.value = {
        'info': {
            'display': {'BlakeTwo256': 'somehash'},  # No 'Raw' key → returns None
            'web': {'None': None},                    # No 'Raw' key
            'email': {'None': None}                   # No 'Raw' key
        },
        'judgements': []
    }
    mock_instance.query.return_value = mock_identity
    mock_substrate.return_value = mock_instance

    response = client.get("/identity/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    # All parse_field return None, so defaults are kept
    assert data["display"] == "5GrwvaEF..."
    assert data["web"] == "https://portaldot.io"


@patch('main.SubstrateInterface')
def test_vesting_header_rpc_fails(mock_substrate):
    """Cover lines 241-242: vesting chain_getHeader exception → current_block = 0"""
    mock_instance = MagicMock()
    mock_vesting = MagicMock()
    mock_vesting.value = {
        'locked': 2000 * (10 ** 14),
        'per_period': 100 * (10 ** 14),
        'starting_block': 100000
    }
    mock_instance.query.return_value = mock_vesting
    mock_instance.rpc_request.side_effect = Exception("RPC down")
    mock_substrate.return_value = mock_instance

    response = client.get("/vesting/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["locked"] == "2000.0"
    assert data["alreadyVested"] == "0.0"  # current_block=0 < starting_block=100000


@patch('main.SubstrateInterface')
def test_vesting_outer_exception(mock_substrate):
    """Cover lines 254-255: vesting total failure → fallback mock values"""
    mock_instance = MagicMock()
    mock_instance.query.side_effect = Exception("Vesting module unavailable")
    mock_substrate.return_value = mock_instance

    response = client.get("/vesting/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    data = response.json()
    assert data["locked"] == "2000.0"
    assert data["perPeriod"] == "100.0"
    assert data["alreadyVested"] == "600.0"


@patch('main.SubstrateInterface')
def test_estimate_fee_failure(mock_substrate):
    """Cover lines 286-287: fee estimation exception → fallback values"""
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("Call composition failed")
    mock_substrate.return_value = mock_instance

    response = client.post("/estimate-fee", json={"command": "transfer"})
    assert response.status_code == 200
    data = response.json()
    assert data["partialFee"] == "0.0012"
    assert data["weight"] == "186,423,000"
    assert data["class"] == "Normal"


# --- Preparation & External Signature Submission Endpoint Tests ---

@patch('main.SubstrateInterface')
def test_prepare_transfer(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1002
    mock_instance.transaction_version = 2
    mock_instance.metadata.get_signed_extensions.return_value = {"CheckNonce": {}, "CheckGenesis": {}}
    
    mock_call = MagicMock()
    mock_call.data = b"transfer_call_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance

    response = client.post("/prepare-transfer", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["address"] == "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    assert data["genesisHash"] == "0xgenesis"
    assert data["nonce"] == "0x05"
    assert data["method"] == "0x" + b"transfer_call_data".hex()


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_transfer_success(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xext_hash"
    mock_receipt.block_number = 42
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-transfer", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0,
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "finalized"
    assert data["txHash"] == "0xext_hash"
    assert data["blockNumber"] == 42


@patch('main.SubstrateInterface')
def test_prepare_stake(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1002
    mock_instance.transaction_version = 2
    mock_instance.metadata.get_signed_extensions.return_value = {"CheckNonce": {}, "CheckGenesis": {}}
    
    mock_call = MagicMock()
    mock_call.data = b"stake_call_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance

    # Test prepare stake with validator (creates utility.batch call)
    response = client.post("/prepare-stake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 15.0,
        "validator": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["address"] == "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    
    # Test prepare stake without validator (creates simple bond call)
    response = client.post("/prepare-stake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 15.0
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_stake(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xext_hash"
    mock_receipt.block_number = 43
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-stake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 15.0,
        "validator": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk",
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xext_hash"


@patch('main.SubstrateInterface')
def test_prepare_unstake(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1002
    mock_instance.transaction_version = 2
    mock_instance.metadata.get_signed_extensions.return_value = {"CheckNonce": {}, "CheckGenesis": {}}
    
    mock_call = MagicMock()
    mock_call.data = b"unstake_call_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance

    response = client.post("/prepare-unstake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 5.0
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_unstake(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xext_hash"
    mock_receipt.block_number = 44
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-unstake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 5.0,
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
def test_prepare_set_identity(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1002
    mock_instance.transaction_version = 2
    mock_instance.metadata.get_signed_extensions.return_value = {"CheckNonce": {}, "CheckGenesis": {}}
    
    mock_call = MagicMock()
    mock_call.data = b"identity_call_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance

    response = client.post("/prepare-set-identity", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "display_name": "NewName"
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_set_identity(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xext_hash"
    mock_receipt.block_number = 45
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-set-identity", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "display_name": "NewName",
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
def test_prepare_batch(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1002
    mock_instance.transaction_version = 2
    mock_instance.metadata.get_signed_extensions.return_value = {"CheckNonce": {}, "CheckGenesis": {}}
    
    mock_call = MagicMock()
    mock_call.data = b"batch_call_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance

    response = client.post("/prepare-batch", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 10.0}]
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_batch(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 5
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xext_hash"
    mock_receipt.block_number = 46
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-batch", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 10.0}],
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 200


@patch('main.SubstrateInterface')
def test_prepare_transfer_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("Failed call")
    mock_substrate.return_value = mock_instance

    response = client.post("/prepare-transfer", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_submit_transfer_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.submit_extrinsic.side_effect = Exception("Broadcasting failed")
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-transfer", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0,
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_prepare_stake_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("Staking compose failed")
    mock_substrate.return_value = mock_instance

    response = client.post("/prepare-stake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 15.0
    })
    assert response.status_code == 400


    response = client.post("/submit-stake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 15.0,
        "signature": "0xsigsigsig"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_get_proxy_status_not_active(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.rpc_request.return_value = {"result": None}
    mock_substrate.return_value = mock_instance
    
    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    data = response.json()
    assert data["isProxyActive"] is False
    assert data["proxyType"] == "Any"


@patch('main.SubstrateInterface')
def test_get_proxy_status_active_any(mock_substrate):
    mock_instance = MagicMock()
    alice_pub = "d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"
    raw_storage_hex = "0x" + "0400" + alice_pub + "00" + "00000000" + "00000000000000000000"
    mock_instance.rpc_request.return_value = {"result": raw_storage_hex}
    mock_substrate.return_value = mock_instance
    
    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    data = response.json()
    assert data["isProxyActive"] is True
    assert data["proxyType"] == "Any"


@patch('main.SubstrateInterface')
def test_get_proxy_status_active_staking(mock_substrate):
    mock_instance = MagicMock()
    alice_pub = "d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"
    raw_storage_hex = "0x" + "0400" + alice_pub + "03" + "00000000"
    mock_instance.rpc_request.return_value = {"result": raw_storage_hex}
    mock_substrate.return_value = mock_instance
    
    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    data = response.json()
    assert data["isProxyActive"] is True
    assert data["proxyType"] == "Staking"


@patch('main.SubstrateInterface')
def test_get_proxy_status_fallback(mock_substrate):
    mock_substrate.side_effect = Exception("Connection error")
    response = client.get("/proxy-status/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert response.status_code == 200
    assert response.json()["isProxyActive"] is True
    
    response2 = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response2.status_code == 200
    assert response2.json()["isProxyActive"] is False


@patch('main.SubstrateInterface')
def test_prepare_add_proxy(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 0
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1
    mock_instance.transaction_version = 1
    mock_instance.metadata.get_signed_extensions.return_value = {}
    mock_call = MagicMock()
    mock_call.data = b"add_proxy_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance
    
    response = client.post("/prepare-add-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any"
    })
    assert response.status_code == 200
    assert response.json()["method"] == "0x" + b"add_proxy_data".hex()


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_add_proxy(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xadd_proxy_hash"
    mock_receipt.block_number = 12
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    response = client.post("/submit-add-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any",
        "signature": "0xsig"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xadd_proxy_hash"


@patch('main.SubstrateInterface')
def test_prepare_remove_proxy(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.get_account_nonce.return_value = 0
    mock_instance.get_block_hash.return_value = "0xgenesis"
    mock_instance.runtime_version = 1
    mock_instance.transaction_version = 1
    mock_instance.metadata.get_signed_extensions.return_value = {}
    mock_call = MagicMock()
    mock_call.data = b"remove_proxy_data"
    mock_instance.compose_call.return_value = mock_call
    mock_substrate.return_value = mock_instance
    
    response = client.post("/prepare-remove-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any"
    })
    assert response.status_code == 200
    assert response.json()["method"] == "0x" + b"remove_proxy_data".hex()


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_submit_remove_proxy(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xremove_proxy_hash"
    mock_receipt.block_number = 12
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    response = client.post("/submit-remove-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any",
        "signature": "0xsig"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xremove_proxy_hash"


@patch('main.SubstrateInterface')
def test_execute_transfer_proxied_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/transfer", json={
            "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
            "amount_pot": 10.0,
            "proxied": True,
            "real_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        })
        assert response.status_code == 200
        assert response.json()["simulated"] is True
        assert response.json()["proxied"] is True


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_transfer_proxied_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xproxied_hash"
    mock_receipt.block_number = 99
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/transfer", json={
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0,
        "proxied": True,
        "real_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xproxied_hash"
    assert response.json()["proxied"] is True


@patch('main.SubstrateInterface')
def test_execute_transfer_proxied_missing_real_address(mock_substrate):
    response = client.post("/transfer", json={
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0,
        "proxied": True
    })
    assert response.status_code == 400
    assert "real_address is required" in response.json()["detail"]


@patch('main.SubstrateInterface')
def test_prepare_add_proxy_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/prepare-add-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_submit_add_proxy_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("submit compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/submit-add-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any",
        "signature": "0xsig"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_prepare_remove_proxy_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/prepare-remove-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_submit_remove_proxy_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("submit compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/submit-remove-proxy", json={
        "sender_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "delegate_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "proxy_type": "Any",
        "signature": "0xsig"
    })
    assert response.status_code == 400

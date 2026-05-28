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
        return MagicMock(value=None)  # pragma: no cover
        
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
    mock_query = MagicMock()
    mock_query.value = ([], 0)
    mock_instance.query.return_value = mock_query
    mock_substrate.return_value = mock_instance
    
    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    data = response.json()
    assert data["isProxyActive"] is False
    assert data["proxyType"] == "Any"


@patch('main.SubstrateInterface')
def test_get_proxy_status_active_any(mock_substrate):
    mock_instance = MagicMock()
    mock_query = MagicMock()
    mock_query.value = ([{'delegate': '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', 'proxy_type': 'Any', 'delay': 0}], 66803331300)
    mock_instance.query.return_value = mock_query
    mock_substrate.return_value = mock_instance
    
    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    data = response.json()
    assert data["isProxyActive"] is True
    assert data["proxyType"] == "Any"


@patch('main.SubstrateInterface')
def test_get_proxy_status_active_staking(mock_substrate):
    mock_instance = MagicMock()
    mock_query = MagicMock()
    mock_query.value = ([{'delegate': '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', 'proxy_type': 'Staking', 'delay': 0}], 66803331300)
    mock_instance.query.return_value = mock_query
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


@patch('main.SubstrateInterface')
def test_prepare_unstake_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("unstake compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/prepare-unstake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 10.0
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_submit_unstake_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("unstake submit fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/submit-unstake", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "amount_pot": 10.0,
        "signature": "0xsig"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_prepare_set_identity_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("identity compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/prepare-set-identity", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "display_name": "Alice"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_submit_set_identity_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("identity submit fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/submit-set-identity", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "display_name": "Alice",
        "signature": "0xsig"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_prepare_batch_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("batch compose fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/prepare-batch", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 5.0}]
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_submit_batch_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("batch submit fail")
    mock_substrate.return_value = mock_instance
    response = client.post("/submit-batch", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 5.0}],
        "signature": "0xsig"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_execute_stake_proxied_validation_error(mock_substrate):
    response = client.post("/stake", json={
        "amount_pot": 10.0,
        "proxied": True
    })
    assert response.status_code == 400
    assert "real_address is required" in response.json()["detail"]


@patch('main.SubstrateInterface')
def test_execute_unstake_proxied_validation_error(mock_substrate):
    response = client.post("/unstake", json={
        "amount_pot": 10.0,
        "proxied": True
    })
    assert response.status_code == 400
    assert "real_address is required" in response.json()["detail"]


@patch('main.SubstrateInterface')
def test_execute_set_identity_proxied_validation_error(mock_substrate):
    response = client.post("/set-identity", json={
        "display_name": "Alice",
        "proxied": True
    })
    assert response.status_code == 400
    assert "real_address is required" in response.json()["detail"]


@patch('main.SubstrateInterface')
def test_execute_batch_proxied_validation_error(mock_substrate):
    response = client.post("/batch", json={
        "transfers": [],
        "proxied": True
    })
    assert response.status_code == 400
    assert "real_address is required" in response.json()["detail"]


@patch('main.SubstrateInterface')
def test_submit_signed_call_receipt_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Insufficient balance"
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    response = client.post("/submit-transfer", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "amount_pot": 10.0,
        "signature": "0xsig"
    })
    assert response.status_code == 400
    assert "Extrinsic failed" in response.json()["detail"]


@patch('main.get_signing_keypair')
@patch('main.SubstrateInterface')
def test_get_agent_address_with_keypair(mock_substrate, mock_get_signing):
    mock_keypair = MagicMock()
    mock_keypair.ss58_address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    mock_get_signing.return_value = mock_keypair

    mock_instance = MagicMock()
    mock_instance.rpc_request.return_value = {"result": None}
    mock_substrate.return_value = mock_instance

    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    assert response.json()["delegate"] == "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_stake_proxied_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xstake_proxied"
    mock_receipt.block_number = 100
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/stake", json={
        "amount_pot": 10.0,
        "proxied": True,
        "real_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xstake_proxied"
    assert response.json()["proxied"] is True


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_unstake_proxied_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xunstake_proxied"
    mock_receipt.block_number = 101
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/unstake", json={
        "amount_pot": 10.0,
        "proxied": True,
        "real_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xunstake_proxied"
    assert response.json()["proxied"] is True


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_set_identity_proxied_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xidentity_proxied"
    mock_receipt.block_number = 102
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/set-identity", json={
        "display_name": "Alice",
        "proxied": True,
        "real_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xidentity_proxied"
    assert response.json()["proxied"] is True


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_batch_proxied_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xbatch_proxied"
    mock_receipt.block_number = 103
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/batch", json={
        "transfers": [{"to_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", "amount": 5.0}],
        "proxied": True,
        "real_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xbatch_proxied"
    assert response.json()["proxied"] is True


@patch('main.SubstrateInterface')
def test_execute_add_proxy_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/add-proxy", json={
            "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY_not_dev",
            "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
        })
        assert response.status_code == 200
        assert response.json()["simulated"] is True


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_add_proxy_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xadd_proxy_success"
    mock_receipt.block_number = 104
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/add-proxy", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xadd_proxy_success"


@patch('main.SubstrateInterface')
def test_execute_add_proxy_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("failed to compose")
    mock_substrate.return_value = mock_instance
    
    response = client.post("/add-proxy", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 400


@patch('main.SubstrateInterface')
def test_execute_remove_proxy_simulated(mock_substrate):
    with patch('main.MNEMONIC', ''):
        response = client.post("/remove-proxy", json={
            "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY_not_dev",
            "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
        })
        assert response.status_code == 200
        assert response.json()["simulated"] is True


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_remove_proxy_real(mock_keypair_class, mock_substrate):
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = True
    mock_receipt.extrinsic_hash = "0xremove_proxy_success"
    mock_receipt.block_number = 105
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance
    
    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair
    
    response = client.post("/remove-proxy", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 200
    assert response.json()["txHash"] == "0xremove_proxy_success"


@patch('main.SubstrateInterface')
def test_execute_remove_proxy_failure(mock_substrate):
    mock_instance = MagicMock()
    mock_instance.compose_call.side_effect = Exception("failed to compose")
    mock_substrate.return_value = mock_instance
    
    response = client.post("/remove-proxy", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 400


# --- Coverage gap tests: lines 38, 41-42, 307, 316-317, 337-338, 374-375, ---
# --- 529-532, 552-553, 556-558, 566, 569-570, 677, 775, 1336, 1489-1490, 1537-1538 ---

import tempfile
import shutil

def test_load_env_with_quoted_values():
    """Cover line 38: quote-stripping branch in load_env."""
    from main import load_env
    # Create a temp .env file with quoted values in the project root
    project_root = os.path.dirname(os.path.dirname(__file__))
    env_path = os.path.join(project_root, '.env.test_cov_tmp')
    # We must rename it to .env.local or .env so load_env can discover it
    target_env = os.path.join(project_root, '.env.test_local_cov')
    try:
        with open(env_path, 'w') as f:
            f.write('POTDO_TEST_DOUBLE="double_val"\n')
            f.write("POTDO_TEST_SINGLE='single_val'\n")
            f.write("# comment line\n")
            f.write("\n")
            f.write("NO_EQUALS_LINE\n")
        # Temporarily rename to .env.local for load_env to find it
        shutil.move(env_path, os.path.join(project_root, '.env.local.bak_cov'))
        # Backup existing .env.local if present
        real_env = os.path.join(project_root, '.env.local')
        real_backup = os.path.join(project_root, '.env.local.bak_orig')
        had_real = os.path.exists(real_env)
        if had_real:
            shutil.move(real_env, real_backup)
        shutil.move(os.path.join(project_root, '.env.local.bak_cov'), real_env)

        # Remove keys from os.environ so load_env sets them
        for k in ['POTDO_TEST_DOUBLE', 'POTDO_TEST_SINGLE']:
            os.environ.pop(k, None)

        load_env()
        assert os.environ.get('POTDO_TEST_DOUBLE') == 'double_val'
        assert os.environ.get('POTDO_TEST_SINGLE') == 'single_val'
    finally:
        # Restore original .env.local
        if os.path.exists(real_env):
            os.unlink(real_env)
        if had_real:
            shutil.move(real_backup, real_env)
        # Clean up env vars
        os.environ.pop('POTDO_TEST_DOUBLE', None)
        os.environ.pop('POTDO_TEST_SINGLE', None)
        # Clean up temp files
        for p in [env_path, os.path.join(project_root, '.env.local.bak_cov')]:
            if os.path.exists(p):
                os.unlink(p)


def test_load_env_exception_handling():
    """Cover lines 41-42: exception branch in load_env."""
    from main import load_env
    # Patch os.path.exists to return True and open to raise an exception
    with patch('builtins.open', side_effect=PermissionError("Permission denied")):
        with patch('os.path.exists', return_value=True):
            # Should not raise — exception is caught silently
            load_env()


@patch('main.SubstrateInterface')
def test_balance_zero_fallback_mock(mock_substrate):
    """Cover line 307: planck_balance == 0 and not MNEMONIC → use mock_balances."""
    mock_instance = MagicMock()
    mock_query_res = MagicMock()
    mock_query_res.value = {'data': {'free': 0}}
    mock_instance.query.return_value = mock_query_res
    mock_substrate.return_value = mock_instance

    with patch('main.MNEMONIC', ''):
        response = client.get("/balance/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
        assert response.status_code == 200
        data = response.json()
        # Should use mock_balances fallback value instead of 0
        assert int(data["balancePlanck"]) > 0


@patch('main.SubstrateInterface')
def test_balance_exception_fallback_no_mnemonic(mock_substrate):
    """Cover lines 316-317: balance query exception with no MNEMONIC → mock fallback."""
    mock_instance = MagicMock()
    mock_instance.query.side_effect = Exception("RPC error")
    mock_substrate.return_value = mock_instance

    with patch('main.MNEMONIC', ''):
        response = client.get("/balance/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
        assert response.status_code == 200
        data = response.json()
        assert int(data["balancePlanck"]) > 0


@patch('main.SubstrateInterface')
def test_staking_mock_path_no_mnemonic(mock_substrate):
    """Cover lines 337-338: staking for known address with no MNEMONIC → returns mock_staking data."""
    mock_instance = MagicMock()
    mock_substrate.return_value = mock_instance

    with patch('main.MNEMONIC', ''):
        # Use Bob's address which has stable mock staking data
        response = client.get("/staking/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
        assert response.status_code == 200
        data = response.json()
        assert data["bonded"] == "200.0"
        assert data["active"] == "200.0"


@patch('main.SubstrateInterface')
def test_staking_bonded_empty_fallback(mock_substrate):
    """Cover lines 374-375: bonded_opt has no value → fallback mock data."""
    mock_instance = MagicMock()
    mock_bonded = MagicMock()
    mock_bonded.value = None  # No bonded value
    mock_instance.query.return_value = mock_bonded
    mock_substrate.return_value = mock_instance

    with patch('main.MNEMONIC', 'real_mnemonic'):
        response = client.get("/staking/5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew")
        assert response.status_code == 200
        data = response.json()
        # Should return fallback mock values
        assert "bonded" in data
        assert "nominations" in data


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_get_dev_keypair_success(mock_keypair_class, mock_substrate):
    """Cover lines 529-532: get_dev_keypair_for_address returns a valid keypair."""
    from main import get_dev_keypair_for_address

    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair

    result = get_dev_keypair_for_address("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert result == mock_keypair
    mock_keypair_class.create_from_uri.assert_called_with("//Alice")


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_get_dev_keypair_exception(mock_keypair_class, mock_substrate):
    """Cover line 532: get_dev_keypair_for_address handles Keypair creation exception."""
    from main import get_dev_keypair_for_address

    mock_keypair_class.create_from_uri.side_effect = Exception("Keypair error")

    result = get_dev_keypair_for_address("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
    assert result is None


def test_safe_receipt_data_block_number_exception():
    """Cover lines 552-553: receipt.block_number raises exception."""
    from main import safe_receipt_data

    mock_receipt = MagicMock()
    mock_receipt.extrinsic_hash = "0xtest"
    mock_receipt.block_hash = "0xblockhash"
    type(mock_receipt).block_number = property(lambda self: (_ for _ in ()).throw(NotImplementedError("no block_number")))
    mock_receipt.is_success = True

    result = safe_receipt_data(mock_receipt)
    assert result["block_number"] is None
    assert result["success"] is True
    assert result["tx_hash"] == "0xtest"


def test_safe_receipt_data_is_success_exception():
    """Cover lines 556-558: receipt.is_success raises → treat as success=True."""
    from main import safe_receipt_data

    mock_receipt = MagicMock()
    mock_receipt.extrinsic_hash = "0xtest2"
    mock_receipt.block_number = 42
    type(mock_receipt).is_success = property(lambda self: (_ for _ in ()).throw(NotImplementedError("DigestItem decode error")))

    result = safe_receipt_data(mock_receipt)
    assert result["success"] is True
    assert result["block_number"] == 42


def test_safe_receipt_data_dict_error_message():
    """Cover line 566: error_message is a dict."""
    from main import safe_receipt_data

    mock_receipt = MagicMock()
    mock_receipt.extrinsic_hash = "0xfailed"
    mock_receipt.block_number = 50
    mock_receipt.is_success = False
    mock_receipt.error_message = {"message": "InsufficientBalance", "data": None}

    result = safe_receipt_data(mock_receipt)
    assert result["success"] is False
    assert result["error_message"] == "InsufficientBalance"


def test_safe_receipt_data_error_message_exception():
    """Cover lines 569-570: accessing error_message raises."""
    from main import safe_receipt_data

    mock_receipt = MagicMock()
    mock_receipt.extrinsic_hash = "0xerr"
    mock_receipt.block_number = 51
    mock_receipt.is_success = False
    type(mock_receipt).error_message = property(lambda self: (_ for _ in ()).throw(Exception("Cannot decode")))

    result = safe_receipt_data(mock_receipt)
    assert result["success"] is False
    assert "Failed to retrieve error message" in result["error_message"]


@patch('main.SubstrateInterface')
def test_stake_simulated_new_sender(mock_substrate):
    """Cover line 677: stake simulated creates new mock_staking entry for unknown sender."""
    with patch('main.MNEMONIC', ''):
        response = client.post("/stake", json={
            "amount_pot": 10.0,
            "real_address": "5UNKNOWN_ADDRESS_FOR_COVERAGE_TEST"
        })
        assert response.status_code == 200
        assert response.json()["simulated"] is True


@patch('main.SubstrateInterface')
def test_unstake_simulated_new_sender(mock_substrate):
    """Cover line 775: unstake simulated creates new mock_staking entry for unknown sender."""
    with patch('main.MNEMONIC', ''):
        response = client.post("/unstake", json={
            "amount_pot": 5.0,
            "real_address": "5UNKNOWN_ADDRESS_FOR_UNSTAKE_COVERAGE"
        })
        assert response.status_code == 200
        assert response.json()["simulated"] is True


@patch('main.get_signing_keypair')
@patch('main.SubstrateInterface')
def test_get_agent_address_fallback_bob(mock_substrate, mock_get_signing):
    """Cover line 1336: get_agent_address returns Bob fallback when no keypair."""
    mock_get_signing.return_value = None  # No keypair available

    mock_instance = MagicMock()
    mock_query = MagicMock()
    mock_query.value = ([], 0)
    mock_instance.query.return_value = mock_query
    mock_substrate.return_value = mock_instance

    response = client.get("/proxy-status/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
    assert response.status_code == 200
    data = response.json()
    # Fallback delegate is Bob's address
    assert data["delegate"] == "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_add_proxy_receipt_failure_with_message(mock_keypair_class, mock_substrate):
    """Cover lines 1489-1490: add_proxy receipt failure with error_message."""
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Proxy already exists"
    mock_receipt.extrinsic_hash = "0xfailed_add"
    mock_receipt.block_number = 200
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair

    response = client.post("/add-proxy", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 400
    assert "Add proxy failed" in response.json()["detail"]


@patch('main.SubstrateInterface')
@patch('main.Keypair')
def test_execute_remove_proxy_receipt_failure_with_message(mock_keypair_class, mock_substrate):
    """Cover lines 1537-1538: remove_proxy receipt failure with error_message."""
    mock_instance = MagicMock()
    mock_receipt = MagicMock()
    mock_receipt.is_success = False
    mock_receipt.error_message = "Proxy not found"
    mock_receipt.extrinsic_hash = "0xfailed_remove"
    mock_receipt.block_number = 201
    mock_instance.submit_extrinsic.return_value = mock_receipt
    mock_substrate.return_value = mock_instance

    mock_keypair = MagicMock()
    mock_keypair_class.create_from_uri.return_value = mock_keypair

    response = client.post("/remove-proxy", json={
        "sender_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "delegate_address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "seed": "//Alice"
    })
    assert response.status_code == 400
    assert "Remove proxy failed" in response.json()["detail"]

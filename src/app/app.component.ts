import { Component , NgZone} from '@angular/core';
import { ethers } from 'ethers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'metamask-wallet-connector';

  walletAddress: string | undefined;
  walletBalance: string | undefined;


  provider: ethers.providers.Web3Provider | undefined;
  signer: ethers.providers.JsonRpcSigner | undefined;
  connecting : boolean = false;
  connected : boolean = false;

  constructor(private zone: NgZone) {}

  async connectToMetaMask() {
    this.connecting = true;
    try {
      // Type casting to any to access ethereum property
      const windowWithEthereum = window as any;

      if (!windowWithEthereum.ethereum) {
        this.connecting = false;
        alert('MetaMask is not installed!');
        return;
      }

      // if already connected, do nothing
      if (this.provider) {
        console.log('Already connected to MetaMask!');
        this.connecting = false;
        return;
      }
      await windowWithEthereum.ethereum.request({ method: 'eth_requestAccounts' });

      // Use Web3Provider from ethers library
      this.provider = new ethers.providers.Web3Provider(windowWithEthereum.ethereum);

      this.signer = this.provider.getSigner();

      windowWithEthereum.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.zone.run(() => {
          this.signer = this.provider?.getSigner();
        });
      });

      windowWithEthereum.ethereum.on('chainChanged', (chainId: string) => {
        this.zone.run(() => {
          // Handle chain changes if needed
        });
      });

      this.connecting = false;
      this.connected = true;
      
      // get Wallet info from signer
      const address = await this.signer.getAddress();                  
      this.walletAddress = address;

      // get current balance
      const balance = await this.provider.getBalance(address);      
      this.walletBalance = ethers.utils.formatEther(balance);    

    } catch (error) {
      this.connecting = false;
      this.connected = false;
      console.error('Error connecting to MetaMask:', error);
    }
  }

}

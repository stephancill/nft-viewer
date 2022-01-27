import './App.css';

import { Provider, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import { Search } from './pages/Search';
import { NavBar } from './components/NavBar/NavBar';

const infuraId = process.env.REACT_APP_INFURA_PROJECT_ID
const chains = defaultChains

// Set up connectors
const connectors = () => {
  return [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      options: {
        infuraId,
        qrcode: true,
      },
    })
  ]
}

function App() {

  return (
    <Provider autoConnect connectors={connectors}>
      <div className="App">
        <NavBar/>
        <Search/>
      </div>
    </Provider>
  );
}

export default App;

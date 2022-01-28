import './App.css';

import { Provider, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import {BrowserRouter, Routes, Route} from "react-router-dom"

import { Search } from './pages/Search/Search'
import { NavBar } from './components/NavBar/NavBar'
import { AddressDetail } from './pages/AddressDetail/AddressDetail';



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
    <BrowserRouter>
      <Provider autoConnect connectors={connectors}>
        <div className="App">
        
          <NavBar/>
          <Routes>

            <Route path="/" element={<Search/>}/>
            <Route path="port">
              <Route path=":searchQuery" element={<AddressDetail/>}/>
            </Route>
            <Route
              path="*"
              element={
                <main style={{ padding: "1rem" }}>
                  <p>There's nothing here!</p>
                </main>
              }
            />
          </Routes>

          
        </div>
      </Provider>
    </BrowserRouter>
  );
}

export default App;

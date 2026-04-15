import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './components/AuthContext.jsx';
import { InvestProvider } from './context/InvestContext.jsx';
//import InvestFields from './components/InvestFields.jsx';
createRoot(document.getElementById('root')).render(

    <GoogleOAuthProvider clientId="265133578144-5f5451bubriovfe9i9d1kg3um1t1crb4.apps.googleusercontent.com">
      <AuthProvider>
         <InvestProvider> 
          <App />
         </InvestProvider>
       </AuthProvider>
     </GoogleOAuthProvider>
)

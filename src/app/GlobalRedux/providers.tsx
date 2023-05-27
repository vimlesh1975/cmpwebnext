'use client'
import { Provider } from 'react-redux'
import { store } from './store'
type ProvidersProps={
    children: React.ReactNode
}

export const Providers =({children}:ProvidersProps)=>{
return(
    <Provider store={store}>
        {children}
    </Provider>
    )
} 

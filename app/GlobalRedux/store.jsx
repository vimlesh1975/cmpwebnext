'use client'
import { configureStore } from "@reduxjs/toolkit"

const initialMedia = { media: [] };
const mediaReducer = (state = initialMedia, action) => {
    switch (action.type) {
        case 'CHANGE_MEDIA':
            return {
                ...state,
                media: action.payload
            }
        default: return state
    }
}




export const store=configureStore({
    reducer: {mediaReducer},
})
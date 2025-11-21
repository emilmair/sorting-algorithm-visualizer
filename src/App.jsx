import { useState } from 'react'
import SortVisualizer from './sort'

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <SortVisualizer />
        </>
    )
}

export default App

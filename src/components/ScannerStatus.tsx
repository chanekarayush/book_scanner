import { useState, useEffect } from 'react'

export default function ScannerStatus() {
    const [isActive, setIsActive] = useState(false);
    const [scanCounter, setScanCount] = useState(0);

    useEffect(() => {
        if (isActive) {
            const timerId = setInterval(() => {
                setScanCount((prev) => prev + 1);
            }, 500)
            return () => clearInterval(timerId);
        }
    }, [isActive])

    function handleClick() {
        setIsActive(!isActive);
    }

    return (
        <section className='scanner-status'>
            {
                (isActive === true) ? <div>Scanner is ON</div> : <div>Scanner is OFF</div>
            }

            <div>Books Scanned : {scanCounter}</div>

            <button onClick={handleClick}>Toggle Scanner</button>
        </section >
    )

}

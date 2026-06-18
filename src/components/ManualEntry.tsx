import { useState } from "react";

export default function ManualEntry() {
    const [isbn, setIsbn] = useState('');
    const [message, setMessage] = useState('')

    function handleISBN(value: string) {
        if (value.length === 13) {
            setMessage('Valid ISBN');
        } else {

            setMessage('Invalid ISBN');
        }

    }

    return (
        <section className="manual-entry">
            <input type="text" value={isbn} onChange={(e) => { setIsbn(e.target.value); }} />
            <div> {message} </div>
            <button onClick={() => handleISBN(isbn)}>Validate ISBN</button>
        </section>
    );

}

import Header from './components/Header'
import './App.css'
import Features from './components/Features';
import Hero from './components/Hero';
import ScannerStatus from './components/ScannerStatus';
import ManualEntry from './components/ManualEntry';

function App() {
    return (
        <>
            <Header />
            <Hero title="Hello" subtitle="Welcome to book scanner" />
            <Features />
            <ScannerStatus />
            <ManualEntry />
        </>
    );
}

export default App
